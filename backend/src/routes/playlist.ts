import express from 'express';
import { PrismaClient } from '@prisma/client';
import spotifyApi from '../config/spotify';

const prisma = new PrismaClient();
const router = express.Router();

router.use((req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }
  next();
});

// Define the API routes related to playlist management
router.post('/create', async (req, res) => {
  try {
    const { title, description } = req.body;

    const newPlaylist = await prisma.playlist.create({
      data: {
        title,
        description,
      },
    });
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error creating playlist', error);
  }
});

router.get('/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(playlistId) },
      include: { tracks: true },
    });

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error getting playlist', error);
  }
});

router.post('/:playlistId/add-track', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    const trackDetails = await spotifyApi.getTrack(trackId);

    const existingTrackInPlaylist = await prisma.track.findFirst({
      where: {
        spotifyId: trackDetails.body.id,
        playlistId: parseInt(playlistId),
      },
    });

    if (existingTrackInPlaylist) {
      res.status(400).json({ error: 'Track already exists in the playlist' });
      return;
    }

    const newTrack = await prisma.track.create({
      data: {
        spotifyId: trackDetails.body.id,
        title: trackDetails.body.name,
        artist: trackDetails.body.artists
          .map((artist: any) => artist.name)
          .join(', '),
        album: trackDetails.body.album.name,
        durationMs: trackDetails.body.duration_ms,
        imageUrl: trackDetails.body.album.images[0]?.url || '',
        playlist: {
          connect: {
            id: parseInt(playlistId),
          },
        },
      },
    });
    res.status(201).json(newTrack);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error adding track', error);
  }
});

router.post('/:playlistId/vote', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId, userId, guestId, spotifyId } = req.body;

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: parseInt(playlistId),
      },
      include: {
        tracks: true,
      },
    });

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    const track = playlist.tracks.find((t) => t.spotifyId === spotifyId);

    if (!track) {
      res.status(404).json({ error: 'Track not found in playlist' });
      return;
    }

    if ((userId && guestId) || (!userId && !guestId)) {
      res.status(400).json({
        error: 'Either userId or guestId must be provided, but not both.',
      });
      return;
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        trackId: parseInt(trackId),
        OR: [{ user: userId }, { guestId: guestId }],
      },
    });

    if (existingVote) {
      await prisma.vote.delete({
        where: {
          id: existingVote.id,
        },
      });
      res.status(200).json({ message: 'Vote deleted' });
      return;
    }

    const newVote = await prisma.vote.create({
      data: {
        user: userId,
        guestId: guestId,
        playlistId: parseInt(playlistId),
        trackId: parseInt(trackId),
      },
    });

    res.status(201).json(newVote);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error voting', error);
  }
});

export default router;

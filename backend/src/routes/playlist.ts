import express from 'express';
import { PrismaClient } from '@prisma/client';
import spotifyApi from '../config/spotify';
import { io } from '../index';

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
    const { title, description, spotifyPlaylistId } = req.body;

    const newPlaylist = await prisma.playlist.create({
      data: {
        title,
        description,
        spotifyPlaylistId,
      },
    });
    io.in(title).emit('playlist-created', newPlaylist);
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error creating playlist', error);
  }
});

router.get('/:spotifyPlaylistId', async (req, res) => {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: {
        spotifyPlaylistId: req.params.spotifyPlaylistId,
      },
      include: {
        tracks: {
          include: {
            votes: true,
          },
          orderBy: {
            votes: {
              _count: 'desc',
            },
          },
        },
      },
    });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.status(200).json(playlist);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'An error occurred while retrieving the playlist' });
  }
});

router.post('/:playlistId/add-track', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId, accessToken } = req.body;
    spotifyApi.setAccessToken(accessToken);

    const playlist = await prisma.playlist.findUnique({
      where: {
        spotifyPlaylistId: playlistId,
      },
    });

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    const spotifyPlaylistId = playlist.spotifyPlaylistId;

    await spotifyApi.addTracksToPlaylist(playlistId, [`${trackId}`]);

    const trackDetails = await spotifyApi.getTrack(trackId.split(':').pop());

    const existingTrackInPlaylist = await prisma.track.findFirst({
      where: {
        spotifyId: trackDetails.body.id,
        playlistId: playlist.id,
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
        played: false,
        playlist: {
          connect: {
            spotifyPlaylistId: spotifyPlaylistId,
          },
        },
      },
    });
    io.in(spotifyPlaylistId).emit('track-added', newTrack);
    res.status(201).json(newTrack);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error adding track', error);
  }
});

router.put(
  '/:playlistId/update-track-played-status/:trackId',
  async (req, res) => {
    try {
      const { playlistId, trackId } = req.params;
      const { played } = req.body;

      const playlist = await prisma.playlist.findUnique({
        where: {
          spotifyPlaylistId: playlistId,
        },
      });

      if (!playlist) {
        res.status(404).json({ error: 'Playlist not found' });
        return;
      }

      const updatedTrack = await prisma.track.update({
        where: {
          id: parseInt(trackId),
        },
        data: {
          played: played,
        },
      });

      res.status(200).json(updatedTrack);
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.error('Server error updating track played status', error);
    }
  }
);

router.post('/:playlistId/vote', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId, userId, guestId, spotifyId } = req.body;

    const playlist = await prisma.playlist.findUnique({
      where: {
        spotifyPlaylistId: playlistId,
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
      io.in(playlistId).emit('vote-updated', {
        trackId: parseInt(trackId),
        userId,
        guestId,
      });
      res.status(200).json({ message: 'Vote deleted' });
      return;
    }

    const newVote = await prisma.vote.create({
      data: {
        user: userId,
        guestId: guestId,
        playlistId: playlist.id,
        trackId: parseInt(trackId),
      },
    });
    io.in(playlistId).emit('vote-updated', {
      trackId: parseInt(trackId),
      userId,
      guestId,
    });
    res.status(201).json(newVote);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error voting', error);
  }
});

router.put('/:playlistId/tokens', async (req, res) => {
  const { playlistId } = req.params;
  const { accessToken, refreshToken, expiresIn } = req.body;

  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  try {
    const playlist = await prisma.playlist.update({
      where: { spotifyPlaylistId: playlistId },
      data: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
        spotifyTokenExpiresAt: expiresAt,
      },
    });
    res.status(200).json(playlist);
  } catch (error) {
    console.error('Error updating tokens:', error);
    res.status(400).json({ message: 'Error updating tokens' });
  }
});

router.get('/:playlistId/tokens', async (req, res) => {
  const { playlistId } = req.params;
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { spotifyPlaylistId: playlistId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
        spotifyTokenExpiresAt: true,
      },
    });
    res.status(200).json(playlist);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(400).json({ message: 'Error fetching tokens' });
  }
});

export default router;

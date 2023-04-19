import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
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
    console.log(req.body);
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
  }
});

router.post('/:playlistId/add-track', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;
    const trackDetails = await spotifyApi.getTrack(trackId);
    console.log(trackDetails);

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
  }
});

router.post('/:playlistId/vote', async (req, res) => {
  // Handle voting for a track
});

router.delete('/:playlistId/vote', async (req, res) => {
  // Handle removing a vote for a track
});

export default router;

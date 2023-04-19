import express from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import spotifyApi from '../config/spotify';

const prisma = new PrismaClient();
const router = express.Router();
console.log(prisma.playlist);

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
  }
});

router.post('/:playlistId/add-track', (req, res) => {
  // Handle adding a track to the playlist
});

router.post('/:playlistId/vote', (req, res) => {
  // Handle voting for a track
});

router.delete('/:playlistId/vote', (req, res) => {
  // Handle removing a vote for a track
});

export default router;

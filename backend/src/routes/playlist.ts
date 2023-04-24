import express from 'express';
import { PrismaClient } from '@prisma/client';
import spotifyApi from '../config/spotify';
import { io } from '../index';
import controllers from '../controllers/playlist.controller';

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
router.post('/create', controllers.createPlaylist);

router.get('/:spotifyPlaylistId', controllers.getPlaylist);

router.post('/:playlistId/add-track', controllers.addTrackToPlaylist);

router.put(
  '/:playlistId/update-track-played-status/:trackId',
  controllers.updateTrackPlayedStatus
);

router.post('/:playlistId/vote', controllers.vote);

router.get('/:playlistId/tokens', controllers.getTokens);

router.put('/:playlistId/tokens', controllers.updateTokens);

export default router;

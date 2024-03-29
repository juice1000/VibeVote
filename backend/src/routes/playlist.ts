import express from 'express';
import spotifyApi from '@config/spotify';
import controllers from '@controllers/playlist.controller';

const router = express.Router();

router.use((req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }
  next();
});

router.post('/create', controllers.createPlaylist);

router.get('/:spotifyPlaylistId', controllers.getPlaylist);
router.get('/:spotifyPlaylistId/get-owner', controllers.getPlaylistOwner);
router.get('/:playlistId/get-active-playlist', controllers.getPlaylistActive);

router.post('/:playlistId/add-track', controllers.addTrackToPlaylist);

router.put('/:playlistId/update-track-played-status/:trackId', controllers.updateTrackPlayedStatus);

router.post('/:playlistId/vote', controllers.vote);

router.get('/:playlistId/tokens', controllers.getTokens);

router.put('/:playlistId/tokens', controllers.updateTokens);

router.post('/delete-playlist', controllers.deletePlaylist);
router.delete('/:playlistId/delete-tracks/:trackId', controllers.deleteTracks);

export default router;

import express from 'express';
import passport from 'passport';
import '../config/passport';
import spotifyApi from '../config/spotify';

const router = express.Router();

router.get(
  '/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken, expires_in }: any = req.user;

    res.redirect(
      `http://localhost:4200/home?accessToken=${accessToken}&refreshToken=${refreshToken}&expiresIn=${expires_in}`
    );
  }
);

router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refresh_token;

  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body['access_token'];
    const expiresIn = data.body['expires_in'];
    const expiresAt = Date.now() + expiresIn * 1000;

    res.json({ access_token: newAccessToken, expires_at: expiresAt });
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    res.status(500).json({ error: 'Failed to refresh access token' });
  }
});

export default router;

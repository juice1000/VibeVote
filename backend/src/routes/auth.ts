import express from 'express';
import passport from 'passport';
import '@config/passport';
import controllers from '@controllers/auth.controller';

const router = express.Router();

router.get(
  '/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'playlist-modify-private', 'playlist-modify-public', 'user-read-playback-state', 'streaming'],
  })
);

router.get('/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), controllers.getAuthTokens);

router.post('/refresh', controllers.refreshAuthTokens);

export default router;

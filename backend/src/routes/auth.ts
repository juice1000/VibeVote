import express from 'express';
import passport from 'passport';
import '../config/passport';
import controllers from '../controllers/auth.controller';

const router = express.Router();

router.get('/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), controllers.getAuthTokens);

router.post('/refresh', controllers.refreshAuthTokens);

export default router;

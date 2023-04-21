import express from 'express';
import passport from 'passport';
import '../config/passport';

const router = express.Router();

router.get(
  '/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken }: any = req.user;

    res.redirect(`http://localhost:4200/home?accessToken=${accessToken}`);
  }
);

export default router;

import passport from 'passport';
import { Strategy as SpotifyStrategy } from 'passport-spotify';

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_CALLBACK_URL } = process.env;
console.log('SPOTIFY_CLIENT_ID', SPOTIFY_CLIENT_ID);
passport.use(
  new SpotifyStrategy(
    {
      clientID: SPOTIFY_CLIENT_ID as string,
      clientSecret: SPOTIFY_CLIENT_SECRET as string,
      callbackURL: SPOTIFY_CALLBACK_URL as string,
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
      const expires_at = Date.now() + expires_in * 1000;
      return done(null, {
        profile,
        accessToken,
        refreshToken,
        expires_in,
        expires_at,
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import crypto from 'crypto';

import dotenv from 'dotenv';
dotenv.config();

import passport from './config/passport';

const app = express();
const port = process.env.PORT || 3000;

//Enable CORS
app.use(cors({ origin: '*', credentials: true }));

//Set up session middleware
const secret = crypto.randomBytes(64).toString('hex');
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
  })
);

//Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

//Define the authentication routes
app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private'],
  })
);

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/auth/spotify' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

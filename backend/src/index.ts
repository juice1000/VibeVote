import express from 'express';
import session from 'express-session';
import cors from 'cors';
import crypto from 'crypto';
import http from 'http';
import { Server } from 'socket.io';

import dotenv from 'dotenv';
dotenv.config();

import passport from './config/passport';
import playlistRoutes from './routes/playlist';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 3000;

//Enable CORS
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

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

app.use('/api/playlist', playlistRoutes);
app.use('/auth', authRoutes);

//Define the authentication routes
app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: [
      'user-read-email',
      'user-read-private',
      'playlist-modify-private',
      'playlist-modify-public',
      'user-read-playback-state',
      'streaming',
    ],
  })
);

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/auth/spotify' }),
  (req, res) => {
    res.redirect(`http://localhost:4200/home?code=${req.query.code}`);
  }
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('voteUpdated', ({ playlistId, trackId }) => {
    console.log(
      `Vote count for track ${trackId} in playlist ${playlistId} was updated`
    );
    io.emit('voteCountUpdated', { playlistId, trackId });
  });
  socket.on('trackAdded', ({ playlistId, trackId }) => {
    console.log(`Track was added and Track list was updated`);
    io.emit('TrackListUpdated', { playlistId, trackId });
  });
  socket.on('stateChange', ({ playlistId }) => {
    console.log('state change emitted');
    io.emit('stateChanges', { playlistId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { io };

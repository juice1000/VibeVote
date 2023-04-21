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

const app = express();
const port = process.env.PORT || 3000;

//Enable CORS
app.use(cors({ origin: '*', credentials: true }));
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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined rom ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { io };

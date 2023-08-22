// port needs to be set before we call dotenv, because we override the property in the test files
const port = Number(process.env.PORT) || 3000;
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import crypto from 'crypto';
import http from 'http';
import { Server } from 'socket.io';
import { checkConnection } from './io-service';

import passport from '@config/passport';
import playlistRoutes from './routes/playlist';
import authRoutes from './routes/auth';
// import { updateSessions } from '@controllers/session.controller';

const app = express();
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

// for initial debugging
app.get('/', (req, res) => {
  res.status(200);
  res.send('Welcome to da Server!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
  },
});
checkConnection(io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app, server, io };

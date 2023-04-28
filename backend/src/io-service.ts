import { Server } from 'socket.io';
import { server } from './index';

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
  },
});

let currentState = {
  playlistId: '',
  currentTrack: '',
  progress: 0,
  isPlaying: false,
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('voteUpdated', ({ playlistId, trackId }) => {
    console.log(`Vote count for track ${trackId} in playlist ${playlistId} was updated`);
    io.emit('voteCountUpdated', { playlistId, trackId });
  });
  socket.on('trackAdded', ({ playlistId, trackId }) => {
    console.log(`Track was added and Track list was updated`);
    io.emit('TrackListUpdated', { playlistId, trackId });
  });
  socket.on('clientStateChange', (data) => {
    currentState = data;
    socket.broadcast.emit('stateChange', data);
  });

  socket.on('updateState', ({ state, isPlaying }) => {
    console.log('updateState received:', state);
    socket.broadcast.emit('syncState', state, isPlaying);
  });

  socket.on('requestInitialState', () => {
    socket.emit('initialState', currentState);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { io };

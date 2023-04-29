import { io } from './index';

interface State {
  playlistId: String;
  currentTrack: String;
  progress: Number;
  isPlaying: Boolean;
}

let connection = false;

export const checkConnection = function (io: any) {
  let currentState: State = {
    playlistId: '',
    currentTrack: '',
    progress: 0,
    isPlaying: false,
  };
  io.on('connection', (socket: any) => {
    console.log('User connected:', socket.id);
    connection = true;
    socket.on('voteUpdated', ({ playlistId, trackId }: { playlistId: String; trackId: String }) => {
      console.log(`Vote count for track ${trackId} in playlist ${playlistId} was updated`);
      io.emit('voteCountUpdated', { playlistId, trackId });
    });
    socket.on('trackAdded', ({ playlistId, trackId }: { playlistId: String; trackId: String }) => {
      console.log(`Track was added and Track list was updated`);
      io.emit('TrackListUpdated', { playlistId, trackId });
    });
    socket.on('clientStateChange', (data: any) => {
      currentState = data;
      socket.broadcast.emit('stateChange', data);
    });

    socket.on('updateState', ({ state, isPlaying }: { state: State; isPlaying: Boolean }) => {
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
};

export const socketHandler = (socketData?: any) => {
  if (connection) {
    if (socketData) {
      io.in(socketData.name).emit(socketData.title, socketData.obj);
    }
  }
};

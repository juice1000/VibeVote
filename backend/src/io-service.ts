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
    console.log('User connected with socketId:', socket.id);
    connection = true;

    // const timeout = setTimeout(() => {
    //   console.log('\nstill in', currentState.playlistId, connection);
    //   if (connection === true && currentState.playlistId !== '') {
    //     console.log('times up buddy', socket.id);
    //     // here we terminate the session and delete the playlist after some inactivity
    //     //socket.emit('terminate session', playlistId);
    //     // also delete the currentState!
    //   } else {
    //     // we need to refresh in order to get the currentState object filled
    //     timeout.refresh();
    //   }
    // }, 5000);

    socket.on('createdPlaylist', (playlistId: string) => {
      console.log('playlist created', playlistId);
      currentState.playlistId = playlistId;
    });
    socket.on('voteUpdated', ({ playlistId, trackId }: { playlistId: String; trackId: String }) => {
      console.log(`Vote count for track ${trackId} in playlist ${playlistId} was updated`);
      io.emit('voteCountUpdated', { playlistId, trackId });
    });
    socket.on('trackAdded', ({ playlistId, trackId }: { playlistId: String; trackId: String }) => {
      console.log(`Track was added and Track list was updated`);

      io.emit('TrackListUpdated', { playlistId, trackId });
    });
    socket.on('clientStateChange', (state: State) => {
      currentState = state;

      socket.broadcast.emit('stateChange', state);
    });
    socket.on('updateState', ({ state, isPlaying }: { state: any; isPlaying: Boolean }) => {
      console.log('updateState received, track: ', state.track_window.current_track.id, 'is playing: ', isPlaying);

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

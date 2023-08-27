import { io } from './index';
import { Session, SessionState } from '@interfaces/session';
import { addNewSession, updateSession, isActiveSession, deleteSession } from '@controllers/session.controller';

let connection = false;

export const checkConnection = function (io: any, sessionsObjects: Session[]) {
  let currentState: SessionState = {
    playlistId: '',
    currentTrack: '',
    progress: 0,
    isPlaying: false,
  };
  io.on('connection', (socket: any) => {
    console.log('User connected with socketId:', socket.id);
    connection = true;

    socket.on('createdPlaylist', (playlistId: string, ownerId: string) => {
      console.log('playlist created', playlistId, ownerId);
      currentState.playlistId = playlistId;
      addNewSession(playlistId, ownerId);
    });
    socket.on('voteUpdated', (playlistId: string, trackId: string, guestId: string) => {
      if (isActiveSession(playlistId)) {
        console.log(`Vote count for track ${trackId} in playlist ${playlistId} was updated`);
        updateSession(playlistId, guestId, false);
        io.emit('voteCountUpdated', { playlistId, trackId });
      } else {
        io.emit('sessionExpired', { playlistId });
      }
    });
    socket.on('trackAdded', (playlistId: string, trackId: string, guestId: string) => {
      if (isActiveSession(playlistId)) {
        console.log(`Track was added and Track list was updated`);
        updateSession(playlistId, guestId, false);
        io.emit('TrackListUpdated', { playlistId, trackId });
      } else {
        io.emit('sessionExpired', { playlistId });
      }
    });
    socket.on('clientStateChange', (state: SessionState) => {
      // TODO: add guestId to arguments
      const playlistId = state.playlistId;
      if (isActiveSession(playlistId)) {
        currentState = state;
        console.log('clientStateChange: ', socket.id);

        updateSession(playlistId, socket.id, false);
        socket.broadcast.emit('stateChange', state);
      } else {
        io.emit('sessionExpired', { playlistId });
      }
    });
    socket.on('updateState', (state: any, isPlaying: Boolean) => {
      console.log('updateState received, track: ', state.track_window?.current_track.id, 'is playing: ', isPlaying);
      socket.broadcast.emit('syncState', state, isPlaying);
    });
    socket.on('requestInitialState', () => {
      const playlistId = currentState.playlistId;
      if (playlistId === '' || isActiveSession(playlistId)) {
        socket.emit('initialState', currentState);
      } else {
        socket.emit('sessionExpired', { playlistId });
      }
    });
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export const socketHandler = (socketData?: any) => {
  if (connection) {
    if (socketData) {
      // check if delete operation and update sessionsObject
      if (socketData.command === 'playlist-deleted') {
        // TODO: add guestId to arguments
        deleteSession(socketData.obj.spotifyPlaylistId);
      }
      io.in(socketData.name).emit(socketData.title, socketData.obj);
    }
  }
};

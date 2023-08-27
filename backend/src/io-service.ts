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
        updateSession(playlistId, '', false);
        socket.broadcast.emit('stateChange', state);
        socket.broadcast.emit('syncState', state, state.isPlaying);
      } else {
        io.emit('sessionExpired', { playlistId });
      }
    });

    socket.on('requestInitialState', () => {
      const playlistId = currentState.playlistId;
      if (playlistId === '' || isActiveSession(playlistId)) {
        socket.emit('initialState', currentState);
      } else {
        socket.emit('sessionExpired', { playlistId });
      }
    });
    socket.on('leaveSession', (playlistId: string, guestId: string) => {
      updateSession(playlistId, guestId, true);
    });

    socket.on('disconnect', () => {
      // TODO: find ou which guest ID it had (we could do this by tying the socket ID to the guestUserID in a cache object)
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

import { io } from './index';
import { Session, SessionState } from '@interfaces/session';
import { addNewSession, updateSession, isActiveSession, deleteSession, getCurrentSessionState } from '@controllers/session.controller';

let connection = false;

export const checkConnection = function (io: any, sessionsObjects: Session[]) {
  io.on('connection', (socket: any) => {
    console.log('User connected with socketId:', socket.id);
    connection = true;

    socket.on('createdPlaylist', (playlistId: string, ownerId: string) => {
      console.log('playlist created', playlistId, ownerId);
      addNewSession(playlistId, ownerId);
    });
    socket.on('loadPlaylist', (playlistId: string, ownerId: string) => {
      console.log('loading playlist', playlistId, ownerId);
      addNewSession(playlistId, ownerId);
    });

    socket.on('voteUpdated', (playlistId: string, trackId: string, guestId: string) => {
      if (isActiveSession(playlistId)) {
        console.log(`Vote count for track ${trackId} in playlist ${playlistId} was updated`);
        updateSession(playlistId, guestId, false);
        io.emit('voteCountUpdated', { playlistId, trackId });
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });
    socket.on('trackAdded', (playlistId: string, guestId: string) => {
      if (isActiveSession(playlistId)) {
        console.log(`Track was added and Track list was updated`);
        updateSession(playlistId, guestId, false);
        io.emit('TrackListUpdated', playlistId);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });
    socket.on('clientStateChange', (state: SessionState, playlistId: string) => {
      if (isActiveSession(playlistId)) {
        updateSession(playlistId, '', false, state);
        console.log('state before emit', state);

        socket.broadcast.emit('stateChange', playlistId); // TODO: bring this into one
        socket.broadcast.emit('syncState', state);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });

    socket.on('requestInitialState', (playlistId: string) => {
      if (playlistId !== '' && isActiveSession(playlistId)) {
        const activeSession = getCurrentSessionState(playlistId);
        io.emit('initialState', activeSession, playlistId);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });

    socket.on('joinSession', (playlistId: string, guestId: string) => {
      updateSession(playlistId, guestId, false);
      console.log(sessionsObjects);
      io.emit('sessionJoined', guestId); // TODO: make a counter for joined users
    });

    socket.on('leaveSession', (playlistId: string, guestId: string) => {
      updateSession(playlistId, guestId, true);
      io.emit('sessionLeft', guestId);
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

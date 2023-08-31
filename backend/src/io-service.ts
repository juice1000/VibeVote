import { io } from './index';
import { Session, SessionState } from '@interfaces/session';
import { addNewSession, updateSession, isActiveSession, deleteSession, getCurrentSessionState } from '@controllers/session.controller';

let connection = false;

export const checkConnection = function (io: any, sessionsObjects: Session[]) {
  io.on('connection', (socket: any) => {
    console.log('User connected with socketId:', socket.id);
    connection = true;

    socket.on('createdPlaylist', async (playlistId: string, ownerId: string) => {
      console.log('playlist created', playlistId, ownerId);
      await addNewSession(playlistId, ownerId);
    });
    socket.on('loadPlaylist', async (playlistId: string, ownerId: string) => {
      console.log('loading playlist', playlistId, ownerId);
      await addNewSession(playlistId, ownerId);
    });

    socket.on('voteUpdated', async (playlistId: string, trackId: string, guestId: string) => {
      const isActive = await isActiveSession(playlistId);
      if (isActive) {
        console.log(`Vote count for track ${trackId} in playlist ${playlistId} was updated`);
        await updateSession(playlistId, guestId, false);
        io.emit('voteCountUpdated', { playlistId, trackId });
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });
    socket.on('trackAdded', async (playlistId: string, guestId: string) => {
      const isActive = await isActiveSession(playlistId);
      if (isActive) {
        console.log(`Track was added and Track list was updated`);
        await updateSession(playlistId, guestId, false);
        io.emit('TrackListUpdated', playlistId);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });
    socket.on('clientStateChange', async (state: SessionState, playlistId: string) => {
      const isActive = await isActiveSession(playlistId);
      if (isActive) {
        await updateSession(playlistId, '', false, state);
        console.log('state before emit', state);

        socket.broadcast.emit('stateChange', playlistId); // TODO: bring this into one
        socket.broadcast.emit('syncState', state);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });

    socket.on('requestInitialState', async (playlistId: string) => {
      const isActive = await isActiveSession(playlistId);
      if (playlistId !== '' && isActive) {
        const activeSession = await getCurrentSessionState(playlistId);
        io.emit('initialState', activeSession, playlistId);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });

    socket.on('joinSession', async (playlistId: string, guestId: string) => {
      await updateSession(playlistId, guestId, false);
      console.log(sessionsObjects);
      io.emit('sessionJoined', guestId); // TODO: make a counter for joined users
    });

    socket.on('leaveSession', async (playlistId: string, guestId: string) => {
      await updateSession(playlistId, guestId, true);
      io.emit('sessionLeft', guestId);
    });

    socket.on('disconnect', async () => {
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

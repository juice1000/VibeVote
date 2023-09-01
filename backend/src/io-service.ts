import { io } from './index';
import { Session, SessionState } from '@interfaces/session';
import { addNewSession, updateSession, isActiveSession, deleteSession, getCurrentSessionState } from '@controllers/session.controller';

let connection = false;

export const checkConnection = function (io: any) {
  io.on('connection', (socket: any) => {
    // console.log('User connected with socketId:', socket.id);
    connection = true;

    socket.on('createdPlaylist', async (playlistId: string, ownerId: string) => {
      console.log('playlist created', playlistId);
      const isActive = await isActiveSession(playlistId);
      if (!isActive) {
        await addNewSession(playlistId, ownerId);
      }
    });
    socket.on('loadPlaylist', async (playlistId: string, ownerId: string) => {
      console.log('loading playlist', playlistId, ownerId);
      const isActive = await isActiveSession(playlistId);
      if (!isActive) {
        await addNewSession(playlistId, ownerId);
      }
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
        console.log('track added: ', playlistId);
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
        socket.broadcast.emit('stateChange', playlistId);
        socket.broadcast.emit('syncState', state);
      } else {
        io.emit('sessionExpired', playlistId);
      }
    });

    socket.on('joinSession', async (playlistId: string, guestId: string) => {
      const isActive = await isActiveSession(playlistId);
      if (isActive) {
        await updateSession(playlistId, guestId, false);
        io.emit('sessionJoined', guestId); // TODO: make a counter for joined users
      } else {
        io.emit('sessionExpired', guestId); // TODO: make a counter for joined users
      }
    });

    socket.on('leaveSession', async (playlistId: string, guestId: string) => {
      const isActive = await isActiveSession(playlistId);
      if (isActive) {
        await updateSession(playlistId, guestId, true);
      }
      io.emit('sessionLeft', guestId);
    });

    socket.on('deleteSession', async (playlistId: string) => {
      // TODO: add guestId to arguments
      deleteSession(playlistId);
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
      io.in(socketData.name).emit(socketData.title, socketData.obj);
    }
  }
};

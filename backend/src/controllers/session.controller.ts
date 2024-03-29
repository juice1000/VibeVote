import { SessionState } from '@interfaces/session';
import { sessionClient } from '../redis/session-db';

export async function addNewSession(playlistId: string, userId: string) {
  const exists = await isActiveSession(playlistId);
  if (!exists) {
    const newSession: any = {
      playlistOwnerId: userId,
      currentTrackId: '',
      progress: 0,
      isPlaying: 0,
    };
    newSession[userId] = userId;

    // await sessionClient.del(playlistId); // TODO: remove
    await sessionClient.hSet(playlistId, newSession);
    await sessionClient.expire(playlistId, 30 * 60); // expire in 30 minutes (redis sets timeouts in seconds if not further specified)
    const expiry = await sessionClient.TTL(playlistId); // TODO: remove
    console.log('added new session: ', newSession, 'expires in: ', expiry);
  }
}

export async function deleteSession(playlistId: string) {
  // TODO: persist collected data in prisma
  await sessionClient.del(playlistId);

  // TODO: we still have the issue of a ghost playlist that has tracks we didn't add but are from previous playlists
}

export async function updateSession(playlistId: string, userId: string, isLeaving: boolean, stateValue?: any) {
  // Update specified session object
  if (userId !== '') {
    // update active users
    const userExists = await sessionClient.hExists(playlistId, userId);

    if (!userExists) {
      await sessionClient.hSet(playlistId, userId, userId);
    } else if (userExists && isLeaving) {
      await sessionClient.hDel(playlistId, userId);
      console.log('user left session: ', userId);
    }
  }

  // update session state
  if (stateValue) {
    console.log(stateValue);

    await sessionClient.hSet(playlistId, stateValue);
  }
  // set new timeout
  await sessionClient.expire(playlistId, 30 * 60);
}

export async function isActiveSession(playlistId: string): Promise<number> {
  return await sessionClient.exists(playlistId);
}

export async function getCurrentSessionState(playlistId: string): Promise<SessionState> {
  const state = await sessionClient.hmGet(playlistId, ['progress', 'currentTrackId', 'isPlaying']);

  return {
    progress: parseInt(state[0]),
    currentTrackId: state[1],
    isPlaying: parseInt(state[2]),
  };
}

export async function getSessionOwner(playlistId: string): Promise<string | undefined> {
  return await sessionClient.hGet(playlistId, 'playlistOwnerId');
}

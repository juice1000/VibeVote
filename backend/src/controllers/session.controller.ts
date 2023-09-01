import { Session, SessionState } from '@interfaces/session';
import { sessionClient } from '../redis/session-db';
import sessionsObjects from '@local-cache/sessions';

export async function addNewSession(playlistId: string, userId: string) {
  if (!isActiveSession(playlistId)) {
    const newSession: any = {
      playlistOwnerId: userId,
      currentTrack: '',
      progress: 0,
      isPlaying: 0,
    };
    newSession[userId] = userId;

    sessionsObjects.push(newSession); // TODO: remove
    await sessionClient.del(playlistId); // TODO: remove
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
  const exists = await isActiveSession(playlistId);

  if (exists) {
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
      await sessionClient.hSet(playlistId, stateValue);
    }
    // set new timeout
    await sessionClient.expire(playlistId, 30 * 60);
  }
}

export async function isActiveSession(playlistId: string): Promise<number> {
  return await sessionClient.exists(playlistId);
}

export async function getCurrentSessionState(playlistId: string): Promise<any> {
  const state = await sessionClient.hmGet(playlistId, ['process', 'currentTrack', 'isPlaying']);
  console.log(state);

  return state;
}

export async function getSessionOwner(playlistId: string): Promise<string | undefined> {
  const ownerId = await sessionClient.hGet(playlistId, 'playlistOwnerId');
  console.log(ownerId);

  return ownerId;
}

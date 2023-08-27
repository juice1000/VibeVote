import { Session, SessionState } from '@interfaces/session';
import sessionsObjects from '@local-cache/sessions';

export function addNewSession(playlistId: string, userId: string) {
  const timeout = new Date(new Date().getTime() + 1800000); // currently set to 30min

  const newSession: Session = {
    playlistId: playlistId,
    activeUsers: [userId],
    playlistOwnerId: userId,
    timeout: timeout,
    state: {
      currentTrack: '',
      progress: 0,
      isPlaying: false,
    },
  };
  sessionsObjects.push(newSession);
  console.log('added new session: ', sessionsObjects);
}

export function cleanupSessions() {
  setInterval(() => {
    // fetch the cache object and delete entries whose timelimit is in the past
    const currentDateTime = new Date();

    // sort array by timeout descending
    sessionsObjects.sort((a, b) => (a.playlistId > b.playlistId ? -1 : 1));
    // find first index matching criteria
    const indexFirstInactiveSession = sessionsObjects.findIndex((session) => session.timeout <= currentDateTime);
    // delete all sessions from index + 1 to array length
    if (indexFirstInactiveSession !== -1) {
      const deletedSessions = sessionsObjects.splice(indexFirstInactiveSession, sessionsObjects.length);
      if (deletedSessions.length > 0) {
        console.log('deleted sessions: ', deletedSessions);
      }
    }
  }, 60000);
}

export function deleteSession(playlistId: string) {
  const objIndex = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  const deletedSession = sessionsObjects.splice(objIndex, 1);
  console.log('deleted sessions: ', deletedSession, sessionsObjects);
  // TODO: we still have the issue of a ghost playlist that has tracks we didn't add but are from previous playlists
}

export function updateSession(playlistId: string, userId: string, isLeaving: boolean, state?: any) {
  //Find index of session object by playlistId
  const objIndex = sessionsObjects.findIndex((session) => session.playlistId === playlistId);

  if (objIndex !== -1) {
    // Update specified session object
    const newTimeout = new Date(new Date().getTime() + 1800000); // currently set to 30min
    const activeUsers = sessionsObjects[objIndex].activeUsers;

    if (userId !== '') {
      // update active users
      if (!activeUsers.includes(userId)) {
        activeUsers.push(userId);
      } else if (activeUsers.includes(userId) && isLeaving) {
        // we could delete the whole playlist if no active users found, but then again maybe the user wants to have some dummy playlists they use later
        const arrayIndex = activeUsers.findIndex((user) => user === userId);
        activeUsers.splice(arrayIndex, 1);
        console.log('user left session: ', userId);
      }
    }

    // update session state
    if (state) {
      sessionsObjects[objIndex].state = state;
    }

    console.log('new timeout', newTimeout);
    sessionsObjects[objIndex].timeout = newTimeout;
  }
}

export function isActiveSession(playlistId: string): boolean {
  const index = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  return index !== -1 ? true : false;
}

export function getCurrentSessionState(playlistId: string): SessionState {
  const index = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  return sessionsObjects[index].state;
}

export function getSessionOwner(playlistId: string): string {
  const index = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  return sessionsObjects[index].playlistOwnerId;
}

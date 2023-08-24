import { Session } from '@interfaces/session';
import sessionsObjects from '@local-cache/sessions';
// import moment from 'moment';

export function addNewSession(playlistId: string, activeUsers: string[]) {
  const timeout = new Date(new Date().getTime() + 60000); // TODO: give this a proper number too

  const newSession: Session = {
    playlistId: playlistId,
    activeUsers: activeUsers,
    timeout: timeout,
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
  }, 5000); // TODO: give this a proper number
}

export function deleteSession(playlistId: string) {
  const objIndex = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  const deletedSession = sessionsObjects.splice(objIndex, 1);
  console.log(deletedSession, sessionsObjects);

  return deletedSession;
}

export function updateSession(playlistId: string, userId: string, isLeaving: boolean) {
  //Find index of session object by playlistId
  const objIndex = sessionsObjects.findIndex((session) => session.playlistId === playlistId);

  // Update specified session object
  const newTimeout = new Date(new Date().getTime() + 60000); // TODO: give this a proper number too
  const activeUsers = sessionsObjects[objIndex].activeUsers;

  // update active users
  if (!activeUsers.includes(userId)) {
    activeUsers.push(userId);
  } else if (activeUsers.includes(userId) && isLeaving) {
    const arrayIndex = activeUsers.findIndex((user) => user === userId);
    activeUsers.splice(arrayIndex, 1);
  }
  sessionsObjects[objIndex].timeout = newTimeout;
}

export function isActiveSession(playlistId: string): boolean {
  const index = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  return index !== -1 ? true : false;
}

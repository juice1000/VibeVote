import { Session } from '@interfaces/session';
import sessionsObjects from '@local-cache/sessions';
// import moment from 'moment';

export function deleteSessions() {
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

export function addNewSession(playlistId: string, activeUsers: string[]) {
  const timeout = new Date(new Date().getTime() + 60000);

  const newSession: Session = {
    playlistId: playlistId,
    activeUsers: activeUsers,
    timeout: timeout,
  };
  sessionsObjects.push(newSession);
  console.log('added new session: ', sessionsObjects);
}

export function updateSession(playlistId: string, activeUsers: string[]) {
  //Find index of session object by playlistId
  const objIndex = sessionsObjects.findIndex((session) => session.playlistId === playlistId);

  // Update specified session object
  const newTimeout = new Date(new Date().getTime() + 60000);
  console.log(newTimeout, new Date());

  sessionsObjects[objIndex].activeUsers = activeUsers;
  sessionsObjects[objIndex].timeout = newTimeout;
}

export function isActiveSession(playlistId: string): boolean {
  const index = sessionsObjects.findIndex((session) => session.playlistId === playlistId);
  return index !== -1 ? true : false;
}

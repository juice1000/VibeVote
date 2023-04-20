import { v4 as uuidv4 } from 'uuid';

export function getGuestId(): string {
  const localStorageKey = 'guestId';
  let guestId = localStorage.getItem(localStorageKey);

  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem(localStorageKey, guestId);
  }

  return guestId;
}

export interface Session {
  playlistId: string;
  activeUsers: string[];
  playlistOwnerId: string;
  timeout: Date;
  state: SessionState;
}

export interface SessionState {
  currentTrackId: string;
  progress: number;
  isPlaying: number;
}

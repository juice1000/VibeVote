export interface Session {
  playlistId: string;
  activeUsers: string[];
  timeout: Date;
}

export interface SessionState {
  playlistId: string;
  currentTrack: string;
  progress: number;
  isPlaying: boolean;
}

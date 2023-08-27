export interface Session {
  playlistId: string;
  activeUsers: string[];
  playlistOwnerId: string;
  timeout: Date;
  state: SessionState;
}

export interface SessionState {
  currentTrack: any;
  progress: number;
  isPlaying: boolean;
}

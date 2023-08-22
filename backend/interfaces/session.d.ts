export interface Session {
  playlistId: string;
  activeUsers: string[];
  currentTimeout: Date;
}

const playList: any = {
  id: 0,
  spotifyPlaylistId: '',
  spotifyAccessToken: '',
  spotifyRefreshToken: '',
  spotifyTokenExpiresAt: new Date('2000-01-01 00:00:00.000'),
  title: '',
  description: '',
  createdAt: new Date('2000-01-01 00:00:00.000'),
  updatedAt: new Date('2000-01-01 00:00:00.000'),
  childFriendly: false,
};

const tracks = [
  {
    id: 0,
    spotifyId: '',
    title: '',
    artist: '',
    imageUrl: '',
    playlistId: 0,
    album: '',
    durationMs: 30000,
    played: false,
  },
];

const votes = [
  {
    id: 0,
    user: null,
    playlistId: 0,
    trackId: 0,
    guestId: '',
  },
];

export { playList, tracks, votes };

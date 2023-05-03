const createPlaylistData: any = {
  title: 'title',
  description: 'description',
  spotifyPlaylistId: 'spotifyPlaylistId',
  childFriendly: true,
};

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

const createTrackData: any = {
  trackId: '4tlutFhvrmwDQrCKbvKzeO',
  accessToken: 1,
};

const track: any = {
  id: '5mMjkxGijQB4JZallYrkOW',
  name: 'Single Ladies (Put a Ring on It)',
  artists: [{ name: 'Beyoncé' }],
  album: { name: 'I AM...SASHA FIERCE', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2732fd16e69054586f25be54f49' }] },
  duration_ms: 193213,
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

const updateToken: any = { accessToken: 1, refreshToken: 1, expiresIn: 30000 };

export { playList, tracks, votes, createPlaylistData, createTrackData, updateToken, track };

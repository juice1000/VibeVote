import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// for mock data: https://www.prisma.io/docs/guides/testing/unit-testing

describe('Test DB Functionality', () => {
  const playlistId = '6aYjT8tbbEKRiXQlqXGJSB';
  const trackId = '4es7tZLsvmqc8kpyHOtHDI';

  const jestPlaylist = {
    id: expect.any(Number),
    spotifyPlaylistId: expect.any(String),
    spotifyAccessToken: expect.any(String),
    spotifyRefreshToken: expect.any(String),
    spotifyTokenExpiresAt: expect.any(Date),
    title: expect.any(String),
    description: expect.toBeOneOf([expect.any(String), null]),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    childFriendly: expect.any(Boolean),
  };

  const jestTrack = {
    id: expect.any(Number),
    spotifyId: expect.any(String),
    title: expect.any(String),
    artist: expect.any(String),
    imageUrl: expect.any(String),
    playlistId: expect.any(Number),
    album: expect.any(String),
    durationMs: expect.any(Number),
    played: expect.any(Boolean),
  };

  test('findUniquePlaylist', async () => {
    const playlist = await prisma.playlist.findUnique({
      where: {
        spotifyPlaylistId: playlistId,
      },
    });
    expect(playlist).toEqual(jestPlaylist);
  });

  test('findFirstTrack', async () => {
    const track = await prisma.track.findFirst({
      where: {
        spotifyId: trackId,
      },
    });
    expect(track).toEqual(jestTrack);
  });
});

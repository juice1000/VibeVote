import { PrismaClient } from '@prisma/client';
import controller from '@controllers/playlist.controller';
import spotifyApi from '@config/spotify';
import SpotifyWebApi from 'spotify-web-api-node';
//import controller from '../src/controllers/controller_test';
const prisma = new PrismaClient();

// for mock data: https://www.prisma.io/docs/guides/testing/unit-testing

describe('Test DB Functionality', () => {
  const playlistId = '6aYjT8tbbEKRiXQlqXGJSB';
  const trackId = '4es7tZLsvmqc8kpyHOtHDI';

  // type mockPlaylist = {
  //   id: Number;
  //   spotifyPlaylistId: String;
  //   spotifyAccessToken: String;
  //   spotifyRefreshToken: String;
  //   spotifyTokenExpiresAt: Date;
  //   title: String;
  //   description: String | null;
  //   createdAt: Date;
  //   updatedAt: Date;
  //   childFriendly: Boolean;
  // };

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

  const jestResult = {
    statusCode: expect.any(Number),
    body: expect.any(jestPlaylist),
  };

  const req: any = {
    params: { spotifyPlaylistId: playlistId },
    //played: { played: false }
  };
  const res: any = {
    //status: jest.fn((x) => (res.statusCode = x)),
    status: function (x: Number) {
      this.statusCode = x;
      return this;
    },
    json: function (x: any) {
      this.body = x;
      JSON.stringify(this);
    },
    statusCode: null,
    body: null,
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

  // test.only('getPlaylist', async () => {
  //   console.log(controllers.getPlaylist(req, {}));
  // });

  test.only('getPlaylist', async () => {
    const result = await controller.getPlaylist(req, res);
    console.log(result);

    expect(JSON.parse(result)).toEqual(jestResult);
    // console.log(controller.getPlaylist(req, {}));
  });
});

import { app, server } from '@root';
import request from 'supertest';
// import controller from '@controllers/playlist.controller';
import { prismaMock } from './singleton';

// describe('App GET /', () => {
//   beforeAll((done) => {
//     done();
//   });
//   afterAll((done) => {
//     server.close();
//     done();
//   });
//   it('returns status code 200 when server available', async () => {
//     const res = await request(app).get('/');
//     expect(res.statusCode).toEqual(200);
//   });
// });

// describe('App GET /api/playlist/:spotifyPlaylistId', () => {
//   const mockPlaylist = {
//     data: {
//       title: 'title',
//       description: 'description',
//       spotifyPlaylistId: 'spotifyPlaylistId',
//       childFriendly: true,
//     },
//   };
//   beforeAll((done) => {
//     done();
//   });
//   afterAll((done) => {
//     server.close();
//     done();
//   });
//   it('returns status code 200 when server available', async () => {
//     app.post('/api/playlist/create');

//     const res = await request(app).get('/api/playlist/:spotifyPlaylistId');
//     expect(res.statusCode).toEqual(200);
//   });
// });

describe('App GET /api/playlist/:spotifyPlaylistId', () => {
  test.only('should create new playlist ', async () => {
    const data: any = {
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
      //tracks   :     [{}],
      //votes          : [],
      childFriendly: false,
    };

    prismaMock.playlist.create.mockResolvedValue(playList);

    expect(
      prismaMock.playlist.create({
        data: data,
      })
    ).resolves.toEqual(playList);
  });
});

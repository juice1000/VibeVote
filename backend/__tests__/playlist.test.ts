import { socketHandler, checkConnection } from '../src/io-service';
jest.mock('../src/io-service'); // that one imports index.ts and seems to reinitialize app which we don't want
(checkConnection as jest.Mock).mockResolvedValue({});
(socketHandler as jest.Mock).mockResolvedValue({});

import request from 'supertest';
import { app, server } from '@root'; // server already used by other test files

import { prismaMock } from './singleton';
import * as mocks from './__mocks__/playlist-data';

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

describe('App POST /api/playlist/:spotifyPlaylistId', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    server.close();
    done();
  });

  // we should mock each szenario where failures could happen
  const data: any = {
    title: 'title',
    description: 'description',
    spotifyPlaylistId: 'spotifyPlaylistId3', // it's unique so we have to create a new one if we don't mock the function it
    childFriendly: true,
  };
  prismaMock.playlist.create.mockResolvedValue(mocks.playList);

  it('should create new playlist ', async () => {
    expect(
      prismaMock.playlist.create({
        data: data,
      })
    ).resolves.toEqual(mocks.playList);
  });

  it.only('should create new playlist on endpoint /create', async () => {
    // we should mock each szenario where failures could happen
    //(socketHandler as jest.Mock).mockResolvedValue({});
    // (checkConnection as jest.Mock).mockResolvedValue({});

    const resSuccessfulRequest = await request(app).post('/api/playlist/create').send(data);
    expect(resSuccessfulRequest.statusCode).toEqual(201);

    //const resBadRequest = await request(app).post('/auth/refresh').send({});
    //expect(resBadRequest.statusCode).toEqual(400);
  });
});

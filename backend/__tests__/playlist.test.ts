import request from 'supertest';
import { app, server, io } from '@root'; // server already used by other test files and sometimes not properly closing, need to investigate on that

// overrides the development database url
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

import * as mocks from './__mocks__/playlist-data';

describe('App POST /api/playlist/:spotifyPlaylistId', () => {
  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  const data: any = {
    title: 'title',
    description: 'description',
    spotifyPlaylistId: 'spotifyPlaylistId',
    childFriendly: true,
  };

  //prismaMock.playlist.delete.mockResolvedValue(mocks.playList);

  it.only('should create new playlist on endpoint /create', async () => {
    //prismaMock.playlist.create.mockResolvedValue(mocks.playList);
    const resSuccessfulCreate = await request(app).post('/api/playlist/create').send(data);
    expect(resSuccessfulCreate.statusCode).toEqual(201);

    const resSuccessfulDelete = await request(app).delete(`/api/playlist/${data.spotifyPlaylistId}/delete`);
    expect(resSuccessfulDelete.statusCode).toEqual(201);

    data.spotifyPlaylistId = null;
    const resNoCreateFromNull = await request(app).post('/api/playlist/create').send(data);
    expect(resNoCreateFromNull.statusCode).toEqual(500);

    data.spotifyPlaylistId = '';
    const resNoCreateFromEmpty = await request(app).post('/api/playlist/create').send(data);
    expect(resNoCreateFromEmpty.statusCode).toEqual(500);
  });
});

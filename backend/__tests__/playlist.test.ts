import dotenv from 'dotenv';
dotenv.config({ override: true });

// overrides the development database url & port
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.PORT = '3002';

import request from 'supertest';
import { app, server, io } from '@root'; // server already used by other test files and sometimes not properly closing, need to investigate on that

import spotifyApi from '@config/spotify';
jest.mock('@config/spotify');

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

  //prismaMock.playlist.delete.mockResolvedValue(mocks.playList);

  it('should create new playlist on endpoint /create', async () => {
    const data = JSON.parse(JSON.stringify(mocks.createPlaylistData));
    //prismaMock.playlist.create.mockResolvedValue(mocks.playList);
    const resSuccessfulCreate = await request(app).post('/api/playlist/create').send(data);
    expect(resSuccessfulCreate.statusCode).toEqual(201);

    const resSuccessfulDelete = await request(app).delete(`/api/playlist/${data.spotifyPlaylistId}/delete-playlist`);
    expect(resSuccessfulDelete.statusCode).toEqual(201);

    data.spotifyPlaylistId = null;
    const resNoCreateFromNull = await request(app).post('/api/playlist/create').send(data);
    expect(resNoCreateFromNull.statusCode).toEqual(500);

    data.spotifyPlaylistId = '';
    const resNoCreateFromEmpty = await request(app).post('/api/playlist/create').send(data);
    expect(resNoCreateFromEmpty.statusCode).toEqual(400);
  });
});

describe('App GET /api/playlist/:spotifyPlaylistId', () => {
  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  it('should get playlist', async () => {
    await request(app).post('/api/playlist/create').send(mocks.createPlaylistData);

    const playList = await request(app).get(`/api/playlist/${mocks.createPlaylistData.spotifyPlaylistId}`);
    expect(playList.statusCode).toEqual(200);

    await request(app).delete(`/api/playlist/${mocks.createPlaylistData.spotifyPlaylistId}/delete-playlist`);

    const resNoPlaylist = await request(app).get(`/api/playlist/${mocks.createPlaylistData.spotifyPlaylistId}`);
    expect(resNoPlaylist.statusCode).toEqual(404);
  });
});

describe('App POST /api/playlist/:playlistId', () => {
  beforeAll((done) => {
    done();
  });

  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  it('should add track to playlist at /add-track', async () => {
    (spotifyApi.getTrack as jest.Mock).mockResolvedValue({ body: mocks.track });
    //(spotifyApi.refreshAccessToken as jest.Mock).mockResolvedValue({ body: { access_token: 'test' } });
    const res = await request(app).post('/api/playlist/create').send(mocks.createPlaylistData);

    const resPlaylistNotExist = await request(app).post(`/api/playlist/0/add-track`).send(mocks.createTrackData);
    expect(resPlaylistNotExist.statusCode).toEqual(404);

    await request(app).put(`/${res.body.spotifyPlaylistId}/tokens`).send(mocks.updateToken);
    const resTrackAdded = await request(app).post(`/api/playlist/${res.body.spotifyPlaylistId}/add-track`).send(mocks.createTrackData);
    expect(resTrackAdded.statusCode).toEqual(201);

    const resTrackAlreadyExist = await request(app).post(`/api/playlist/${res.body.spotifyPlaylistId}/add-track`).send(mocks.createTrackData);
    expect(resTrackAlreadyExist.statusCode).toEqual(400);

    const resSuccessfulDeleteTrack = await request(app).delete(`/api/playlist/${res.body.id}/delete-tracks/${resTrackAdded.body.spotifyId}`);
    expect(resSuccessfulDeleteTrack.statusCode).toEqual(201);
    const resSuccessfulDeletePlaylist = await request(app).delete(`/api/playlist/${res.body.spotifyPlaylistId}/delete-playlist`);
    expect(resSuccessfulDeletePlaylist.statusCode).toEqual(201);
  });
});

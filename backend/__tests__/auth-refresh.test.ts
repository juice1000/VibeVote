import dotenv from 'dotenv';
dotenv.config({ override: true });
process.env.PORT = '3001';

import { app, server, io } from '@root';
import request from 'supertest';
import spotifyApi from '@config/spotify';
jest.mock('@config/spotify');

describe('App GET /', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    io.close();
    server.close();
    done();
  });
  it('returns status code 200 when server available', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});

describe('App POST /auth/refresh', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    io.close();
    server.close();
    done();
  });
  it('returns status code 201 when refresh successful', async () => {
    (spotifyApi.setRefreshToken as jest.Mock).mockResolvedValue({});
    (spotifyApi.refreshAccessToken as jest.Mock).mockResolvedValue({ body: { access_token: 'test', expires_in: 10000 } });

    const resSuccessfulRequest = await request(app).post('/auth/refresh').send({ refresh_token: 'test' });
    expect(resSuccessfulRequest.statusCode).toEqual(201);

    const resBadRequest = await request(app).post('/auth/refresh').send({});
    expect(resBadRequest.statusCode).toEqual(400);
  });
});

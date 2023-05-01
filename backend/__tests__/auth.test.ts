import { app, server } from '@root';
import request from 'supertest';

import spotifyApi from '@config/spotify';
jest.mock('@config/spotify');

describe('App GET /', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    server.close();
    done();
  });
  it('returns status code 200 when server available', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});

describe('App GET /auth/spotify', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    server.close();
    done();
  });
  it('returns status code 302 when server redirect successfully', async () => {
    // let's do an unsuccessful redirect as well!!
    const res = await request(app).get('/auth/spotify');
    expect(res.statusCode).toEqual(302); // 302 = successfully redirected

    const resCallback = await request(app).get('/auth/spotify/callback');
    expect(resCallback.statusCode).toEqual(302);
  });
});

describe('App POST /auth/refresh', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    server.close();
    done();
  });
  it('returns status code 302 when server redirect successfully', async () => {
    (spotifyApi.setRefreshToken as jest.Mock).mockResolvedValue({});
    (spotifyApi.refreshAccessToken as jest.Mock).mockResolvedValue({ body: { access_token: 'test' } });

    const resSuccessfulRequest = await request(app).post('/auth/refresh').send({ refresh_token: 'test' });
    expect(resSuccessfulRequest.statusCode).toEqual(200);

    const resBadRequest = await request(app).post('/auth/refresh').send({});
    expect(resBadRequest.statusCode).toEqual(400);
  });
});

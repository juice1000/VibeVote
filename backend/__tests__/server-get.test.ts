import { app, server } from '@root';
import { resolve } from 'path';
import request from 'supertest';

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
  it('returns status code 302 when server redirect successful', async () => {
    const res = await request(app).get('/auth/spotify');
    expect(res.statusCode).toEqual(302); // 302 means successfully redirected

    const resCallback = await request(app).get('/auth/spotify/callback');
    expect(resCallback.statusCode).toEqual(302);
  });
});

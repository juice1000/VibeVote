import dotenv from 'dotenv';
dotenv.config({ override: true });
process.env.PORT = '3002';

import { app, server, io } from '@root';
import request from 'supertest';

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

describe.only('App GET /auth/spotify', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    io.close();
    server.close();
    done();
  });

  it('returns status code 302 when server redirect successfully', async () => {
    //(passport.authenticate as jest.Mock).mockResolvedValue({});
    const resCallback = await request(app).get('/auth/spotify/callback');
  });
});

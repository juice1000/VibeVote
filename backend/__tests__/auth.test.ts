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
    const res = await request(app).get('/auth/spotify');
    expect(res.statusCode).toEqual(302); // 302 = successfully redirected

    const resCallback = await request(app).get('/auth/spotify/callback');
    expect(resCallback.statusCode).toEqual(302);
  });
});

// describe('App POST /auth/refresh', () => {
//   const refreshAuthTokens = async (req: any, res: any) => {
//     console.log('lol');

//     const refreshToken = req.body.refresh_token;

//     try {
//       console.log(req);
//       console.log(refreshToken);

//       spotifyApi.setRefreshToken.mockResolvedValue(refreshToken);
//       await spotifyApi.refreshAccessToken.mockResolvedValue();
//       //const newAccessToken = data.body['access_token'];
//       //const expiresIn = data.body['expires_in'];
//       //const expiresAt = Date.now() + expiresIn * 1000;

//       res.json({ access_token: 'newAccessToken', expires_in: 'expiresIn' });
//     } catch (error) {
//       console.error('Failed to refresh access token:', error);
//       res.status(error.statusCode).json({ error: 'Failed to refresh access token' });
//     }
//   };

//   beforeAll((done) => {
//     done();
//   });
//   afterAll((done) => {
//     server.close();
//     done();
//   });
//   it('returns status code 302 when server redirect successfully', async () => {
//     // const mockCallback = jest.fn((token) => {
//     //   if (token) {
//     //     const obj = { access_token: 'newAccessToken', expires_in: 'expiresIn' };
//     //     return new Promise((resolve, reject) => resolve(obj));
//     //   }
//     //   return new Promise((resolve, reject) => resolve(null));
//     // });

//     (spotifyApi.setRefreshToken as jest.Mock).mockResolvedValue({ refresh_token: 'hi' });
//     (spotifyApi.refreshAccessToken as jest.Mock).mockResolvedValue({});
//     //await spotifyApi.refreshAccessToken.mockResolvedValue({ refresh_token: 'hi' });
//     const resBadRequest = await request(app).post('/auth/refresh').send({ refresh_token: 'hi' });
//     expect(resBadRequest.statusCode).toEqual(400);

//     spotifyApi.setRefreshToken.mockResolvedValue();
//     await spotifyApi.refreshAccessToken.mockResolvedValue();
//     const resEmptyRequest = await request(app).post('/auth/refresh').send();
//     expect(resEmptyRequest.statusCode).toEqual(400); // no parameter sent

//     // const resSuccess = await request(app)
//     //   .post('/', refreshAuthTokens)
//     //   .send({
//     //     refresh_token: {
//     //       access_token: '$ACCESS_TOKEN',
//     //       token_type: 'Bearer',
//     //       expires_in: 3600,
//     //       refresh_token: '$REFRESH_TOKEN',
//     //       scope: 'playlist-modify-private',
//     //     },
//     //   });
//     // console.log(resSuccess);

//     //expect(resNoSuccess.statusCode).toEqual(404); // no parameter sent
//   });
// });

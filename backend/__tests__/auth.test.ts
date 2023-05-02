import { app, server, io } from '@root';
import request from 'supertest';
// import controller from '@controllers/auth.controller';
// jest.mock('@controllers/auth.controller');

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

describe('App GET /auth/spotify', () => {
  beforeAll((done) => {
    done();
  });
  afterAll((done) => {
    io.close();
    server.close();
    done();
  });
  it('returns status code 302 when server redirect successfully', async () => {
    // let's do an unsuccessful redirect as well!!
    //const res = await request(app).get('/auth/spotify');
    //expect(controllers.getAuthTokens).toHaveBeenCalled();
    //expect(res.statusCode).toEqual(302); // 302 = successfully redirected

    // then we can mock the controller functions locally here
    const resCallback = await request(app).get('/auth/spotify');
    //expect(controller.getAuthTokens).toHaveBeenCalled();
    //expect(resCallback.statusCode).toEqual(302);
  });
});

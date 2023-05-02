// import { socketHandler, checkConnection } from '../src/io-service';
// jest.mock('../src/io-service'); // that one imports index.ts and seems to reinitialize app which we don't want
// (checkConnection as jest.Mock).mockResolvedValue({});
// (socketHandler as jest.Mock).mockResolvedValue({}); // we want to mock socket function too, although opinions about that seem to be divided

import request from 'supertest';
import { app, server, io } from '@root'; // server already used by other test files and sometimes not properly closing, need to investigate on that

import { prismaMock } from './singleton';
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

  // we should also mock szenarios where failures could happen
  const data: any = {
    title: 'title',
    description: 'description',
    spotifyPlaylistId: 'spotifyPlaylistId14', // it's unique so we have to create a new one if we don't mock the function it
    childFriendly: true,
  };
  prismaMock.playlist.create.mockResolvedValue(mocks.playList);
  //prismaMock.playlist.delete.mockResolvedValue(mocks.playList);

  // testing on database only first, then with server
  it('should create new playlist ', async () => {
    expect(
      prismaMock.playlist.create({
        data: data,
      })
    ).resolves.toEqual(mocks.playList);
  });

  it.only('should create new playlist on endpoint /create', async () => {
    const resSuccessfulRequest = await request(app).post('/api/playlist/create').send(data);
    expect(resSuccessfulRequest.statusCode).toEqual(201);
  });
});

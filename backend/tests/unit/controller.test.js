import express from 'express';
import spotifyApi from '../../src/config/spotify';
import controllers from '../../src/controllers/playlist.controller';

describe.only('Playlist Controller', () => {
  let router;

  beforeEach(() => {
    router = express.Router();
    router.use((req, res, next) => {
      const accessToken = req.headers.authorization?.split(' ')[1];
      if (accessToken) {
        spotifyApi.setAccessToken(accessToken);
      }
      next();
    });
    console.log('create list', controllers.createPlaylist);
    router.post('/create', controllers.createPlaylist);
    router.get('/:spotifyPlaylistId', controllers.getPlaylist);
    router.post('/:playlistId/add-track', controllers.addTrackToPlaylist);
    router.put(
      '/:playlistId/update-track-played-status/:trackId',
      controllers.updateTrackPlayedStatus
    );
    router.post('/:playlistId/vote', controllers.vote);
    router.get('/:playlistId/tokens', controllers.getTokens);
    router.put('/:playlistId/tokens', controllers.updateTokens);
  });

  it('should create a playlist', async () => {
    const req = {
      body: {
        title: 'My Playlist',
        spotifyPlaylistId: '12345',
        childFriendly: true,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await controllers.createPlaylist(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('should get a playlist', async () => {
    const req = {
      params: {
        spotifyPlaylistId: '12345',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await controllers.getPlaylist(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should add a track to a playlist', async () => {
    const req = {
      params: {
        playlistId: '12345',
      },
      body: {
        trackId: '67890',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await controllers.addTrackToPlaylist(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should update the played status of a track in a playlist', async () => {
    const req = {
      params: {
        playlistId: '12345',
        trackId: '67890',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await controllers.updateTrackPlayedStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should vote on a playlist', async () => {
    const req = {
      params: {
        playlistId: '12345',
      },
      body: {
        vote: 1,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await controllers.vote(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('should get tokens for a playlist', async () => {
    const req = {
      params: {
        playlistId: '12345',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await controllers.getTokens(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  // it('should update tokens for a playlist', async () => {
  //   const req = {
  //     params: {
  //       playlistId: '12345',
  //     },
  //     body: {
  //       tokens: [],
  //     },
  //   };
  //   const res = {
  //     status: jest.fn().mockReturnThis(),
  //     json: jest.fn(),
  //   };
  //   await controllers.updateTokens(req, res);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalled();
  // });
});

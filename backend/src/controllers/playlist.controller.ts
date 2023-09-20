import spotifyApi from '@config/spotify';
import { socketHandler } from '../io-service';
import { getSessionOwner, isActiveSession, getCurrentSessionState } from '@controllers/session.controller';
import { SessionState } from '@interfaces/session';
import userController from '@controllers/user.controller';
import prisma from './prismaClient';

const createPlaylist = async (req: any, res: any) => {
  try {
    const { title, description, spotifyPlaylistId, childFriendly, userId } = req.body;

    if (spotifyPlaylistId.length === 0) {
      res.status(400).json({ error: 'no playlist name provided' });
      return;
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        title,
        description,
        spotifyPlaylistId,
        childFriendly,
      },
    });

    userController.addNewPlaylist(userId, spotifyPlaylistId);

    const socketData = {
      command: 'playlist-created',
      title: title,
      playList: newPlaylist,
    };
    socketHandler(socketData);

    res.status(201).json(newPlaylist);
    return newPlaylist;
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error creating playlist', error);
  }
};

const getPlaylist = async (req: any, res: any) => {
  try {
    const playedFilter = req.query.played;

    const playlistId = req.params.spotifyPlaylistId;

    const playlist = await prisma.playlist.findFirst({
      where: {
        spotifyPlaylistId: playlistId,
      },
      include: {
        tracks: {
          include: {
            votes: true,
          },
          orderBy: {
            votes: {
              _count: 'desc',
            },
          },
        },
      },
    });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const state: SessionState = await getCurrentSessionState(playlistId);
    const returnValue = { ...playlist, state };

    res.status(200).json(returnValue);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while retrieving the playlist' });
  }
};

const getPlaylistOwner = async (req: any, res: any) => {
  try {
    const { spotifyPlaylistId } = req.params;
    const ownerId = await getSessionOwner(spotifyPlaylistId);
    res.status(200).json(ownerId);
  } catch (err) {
    console.error('error retrieving playlist owner');
  }
};

const getPlaylistActive = async (req: any, res: any) => {
  const { playlistId } = req.params;
  const isActive = await isActiveSession(playlistId);
  res.json(isActive);
};

const addTrackToPlaylist = async (req: any, res: any) => {
  try {
    const { playlistId } = req.params;
    const { trackId, accessToken } = req.body;
    // console.log('token', accessToken);
    spotifyApi.setAccessToken(accessToken);

    const playlist = await prisma.playlist.findUnique({
      where: {
        spotifyPlaylistId: playlistId,
      },
    });

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    const spotifyPlaylistId = playlist.spotifyPlaylistId;

    await spotifyApi.addTracksToPlaylist(playlistId, [`${trackId}`]);

    // const devices = await spotifyApi.getMyDevices();
    // const activeDevice = devices.body.devices.filter((device) => device.is_active);
    // if (activeDevice.length > 0) {
    //   // adding to queue only works with an active device, hence we try to first check if we have an actively running device
    //   const resp = await spotifyApi.addToQueue(trackId);
    //   console.log('track added to queue: ', resp.statusCode);
    // }

    const trackDetails = await spotifyApi.getTrack(trackId.split(':').pop());

    const existingTrackInPlaylist = await prisma.track.findFirst({
      where: {
        spotifyId: trackDetails.body.id,
        playlistId: playlist.id,
        played: false,
      },
    });

    if (existingTrackInPlaylist) {
      res.status(400).json({ error: 'Track already exists in the playlist' });
      return;
    }

    const newTrack = await prisma.track.create({
      data: {
        spotifyId: trackDetails.body.id,
        title: trackDetails.body.name,
        artist: trackDetails.body.artists.map((artist: any) => artist.name).join(', '),
        album: trackDetails.body.album.name,
        durationMs: trackDetails.body.duration_ms,
        imageUrl: trackDetails.body.album.images[0]?.url || '',
        played: false,
        playlist: {
          connect: {
            spotifyPlaylistId: spotifyPlaylistId,
          },
        },
      },
    });

    const socketData = {
      command: 'track-added',
      name: spotifyPlaylistId,
      obj: newTrack,
    };
    socketHandler(socketData);

    res.status(201).json(newTrack);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error adding track', error);
  }
};

const updateTrackPlayedStatus = async (req: any, res: any) => {
  try {
    const { playlistId, trackId } = req.params;
    const { played } = req.body;

    const playlist = await prisma.playlist.findUnique({
      where: {
        spotifyPlaylistId: playlistId,
      },
    });

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    const updatedTrack = await prisma.track.update({
      where: {
        id: parseInt(trackId),
      },
      data: {
        played: played,
      },
    });

    res.status(200).json(updatedTrack);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error updating track played status', error);
  }
};

const vote = async (req: any, res: any) => {
  try {
    const { playlistId } = req.params;
    const { trackId, userId, guestId, spotifyId } = req.body;

    const playlist = await prisma.playlist.findUnique({
      where: {
        spotifyPlaylistId: playlistId,
      },
      include: {
        tracks: true,
      },
    });

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    const track = playlist.tracks.find((t) => t.spotifyId === spotifyId);

    if (!track) {
      res.status(404).json({ error: 'Track not found in playlist' });
      return;
    }

    if ((userId && guestId) || (!userId && !guestId)) {
      res.status(400).json({
        error: 'Either userId or guestId must be provided, but not both.',
      });
      return;
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        trackId: parseInt(trackId),
        OR: [{ user: userId }, { guestId: guestId }],
      },
    });
    if (existingVote) {
      await prisma.vote.delete({
        where: {
          id: existingVote.id,
        },
      });

      const socketData = {
        command: 'vote-updated',
        name: playlistId,
        obj: {
          trackId: parseInt(trackId),
          userId,
          guestId,
        },
      };
      socketHandler(socketData);

      res.status(200).json({ message: 'Vote deleted' });
      return;
    }

    const newVote = await prisma.vote.create({
      data: {
        user: userId,
        guestId: guestId,
        playlistId: playlist.id,
        trackId: parseInt(trackId),
      },
    });

    const socketData = {
      command: 'vote-updated',
      name: playlistId,
      obj: {
        trackId: parseInt(trackId),
        userId,
        guestId,
      },
    };
    socketHandler(socketData);

    res.status(201).json(newVote);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('Server error voting', error);
  }
};

const getTokens = async (req: any, res: any) => {
  const { playlistId } = req.params;
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { spotifyPlaylistId: playlistId },
      select: {
        spotifyAccessToken: true,
        spotifyRefreshToken: true,
        spotifyTokenExpiresAt: true,
      },
    });
    res.status(200).json(playlist);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(400).json({ message: 'Error fetching tokens' });
  }
};

const updateTokens = async (req: any, res: any) => {
  const { playlistId } = req.params;
  const { accessToken, refreshToken, expiresIn } = req.body;

  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  try {
    const playlist = await prisma.playlist.update({
      where: { spotifyPlaylistId: playlistId },
      data: {
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
        spotifyTokenExpiresAt: expiresAt,
      },
    });
    res.status(200).json(playlist);
  } catch (error) {
    console.error('Error updating tokens:', error);
    res.status(400).json({ message: 'Error updating tokens' });
  }
};

const deletePlaylist = async (req: any, res: any) => {
  try {
    const deletedPlaylist = await prisma.playlist.delete({
      where: {
        spotifyPlaylistId: req.body.playlistId,
      },
    });

    userController.deletePlaylist(req.body.userId, req.body.playlistId);

    // will redirect back to login after job is finished
    res.status(201).json({ message: 'Playlist successfully deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      // Record to delete does not exist
      res.status(404).json({ message: 'Playlist already deleted' });
    } else {
      console.error(err);
      res.status(400).json({ message: 'Error deleting playlist' });
    }
  }
  return;
};

const deleteTracks = async (req: any, res: any) => {
  try {
    const deletedtracks = await prisma.track.deleteMany({
      where: {
        spotifyId: req.params.trackId,
        playlistId: Number(req.params.playlistId),
        played: false,
      },
    });
    const socketData = {
      command: 'track-deleted',
      obj: deletedtracks,
    };
    socketHandler(socketData);

    res.status(201).json(deletedtracks);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error deleting track' });
  }
};

export default {
  createPlaylist,
  getPlaylist,
  getPlaylistOwner,
  getPlaylistActive,
  addTrackToPlaylist,
  updateTrackPlayedStatus,
  vote,
  getTokens,
  updateTokens,
  deletePlaylist,
  deleteTracks,
};

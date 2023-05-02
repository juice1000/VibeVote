import spotifyApi from '../config/spotify';
import { socketHandler } from '../io-service';
import prisma from './prismaClient';

const createPlaylist = async (req: any, res: any) => {
  try {
    const { title, description, spotifyPlaylistId, childFriendly } = req.body;

    if (spotifyPlaylistId.length === 0) {
      const err = {
        message: 'empty playlist name',
        status: 400,
      };
      throw err;
    }

    const newPlaylist = await prisma.playlist.create({
      data: {
        title,
        description,
        spotifyPlaylistId,
        childFriendly,
      },
    });

    const socketData = {
      command: 'playlist-created',
      title: title,
      playList: newPlaylist,
    };
    socketHandler(socketData);

    res.status(201).json(newPlaylist);
    return newPlaylist;
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error('Server error creating playlist', error);
  }
};

const getPlaylist = async (req: any, res: any) => {
  try {
    const playedFilter = req.query.played;

    let trackWhereClause = {};
    if (playedFilter !== undefined) {
      trackWhereClause = { played: playedFilter === 'true' };
    }

    const playlist = await prisma.playlist.findFirst({
      where: {
        spotifyPlaylistId: req.params.spotifyPlaylistId,
      },
      include: {
        tracks: {
          where: trackWhereClause,
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

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while retrieving the playlist' });
  }
};

const addTrackToPlaylist = async (req: any, res: any) => {
  try {
    const { playlistId } = req.params;
    const { trackId, accessToken } = req.body;
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
        spotifyPlaylistId: req.params.spotifyPlaylistId,
      },
    });
    const socketData = {
      command: 'playlist-deleted',
      name: deletedPlaylist.title,
      obj: deletedPlaylist,
    };
    socketHandler(socketData);

    res.status(201).json(deletedPlaylist.id);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error deleting playlists' });
  }
};

export default {
  createPlaylist,
  getPlaylist,
  addTrackToPlaylist,
  updateTrackPlayedStatus,
  vote,
  getTokens,
  updateTokens,
  deletePlaylist,
};

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
      return 'hi';
      return res.status(404).json({ message: 'Playlist not found' });
    }
    return 'hi';
    res.status(200).json(playlist);
  } catch (error) {
    return 'hi';
    res.status(500).json({ message: 'An error occurred while retrieving the playlist' });
  }
};

export default {
  getPlaylist,
};

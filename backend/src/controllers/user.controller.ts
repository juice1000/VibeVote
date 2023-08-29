import { socketHandler } from '../io-service';
import { getSessionOwner } from '@controllers/session.controller';
import prisma from './prismaClient';

const createNewUser = async (req: any, res: any) => {
  try {
    await prisma.user.create({
      data: {
        id: req.body.userId,
        userName: req.body.userName,
        playlistIds: [],
      },
    });
    res.status(200).json({ message: 'New user created!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error creating user' });
  }
};

const addNewPlaylist = async (userId: string, playlistId: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      playlistIds: {
        push: playlistId,
      },
    },
  });
};

const getUserPlaylists = async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.userId,
      },
    });
    if (!user) {
      res.status(404).json({ message: 'User does not exist' });
    } else {
      res.status(200).json(user.playlistIds);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error finding user playlists' });
  }
};

export default {
  createNewUser,
  addNewPlaylist,
  getUserPlaylists,
};

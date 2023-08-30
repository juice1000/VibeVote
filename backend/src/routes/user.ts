import express from 'express';
import controllers from '@controllers/user.controller';

const router = express.Router();

router.post('/create', controllers.createNewUser);
router.get('/:userId/playlists', controllers.getUserPlaylists);

export default router;

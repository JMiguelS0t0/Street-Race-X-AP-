import { Router } from 'express';
import { getRooms, getChatHistory, createRoom } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/rooms', authMiddleware, getRooms);

router.get('/rooms/:roomId/messages', authMiddleware, getChatHistory);

router.post('/rooms', authMiddleware, createRoom);

export default router;

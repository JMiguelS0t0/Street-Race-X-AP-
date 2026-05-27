import { Router } from 'express';
import { getRooms, getChatHistory, createRoom } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Retrieve all chat rooms the user belongs to
router.get('/rooms', authMiddleware, getRooms);

// Retrieve message history of a room (paginated)
router.get('/rooms/:roomId/messages', authMiddleware, getChatHistory);

// Create a new private or group room
router.post('/rooms', authMiddleware, createRoom);

export default router;

import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socketAuth.middleware';
import { registerChatHandlers } from './chat.socket';
import { registerLocationHandlers } from './location.socket';

export const initSockets = (io: Server) => {
  // Apply Authentication Middleware to Socket.io handshake
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    const userId = user.id;
    const username = user.username;

    console.log(`[socket]: Usuario conectado - ${username} (${userId})`);

    // Join a private personal room for user-specific events/notifications
    socket.join(`user_${userId}`);

    // Register modular handlers for this specific connection
    registerChatHandlers(io, socket);
    registerLocationHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[socket]: Usuario desconectado - ${username}`);
    });
  });
};

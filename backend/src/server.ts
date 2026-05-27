import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { socketAuthMiddleware } from './middlewares/socketAuth.middleware';
import { registerChatHandlers } from './sockets/chat.socket';
import { registerLocationHandlers } from './sockets/location.socket';

const PORT = process.env.PORT || 2999;

// Wrap Express app with native HTTP server
const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as necessary for frontend connections
    methods: ["GET", "POST"]
  }
});

// Attach Authentication Middleware to Socket.io
io.use(socketAuthMiddleware);

// Register WebSocket handlers
registerChatHandlers(io);
registerLocationHandlers(io);

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

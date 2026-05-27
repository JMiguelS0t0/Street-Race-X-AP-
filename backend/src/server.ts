import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { initSockets } from './sockets';

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

// Initialize socket manager (applies auth middleware and registers handlers)
initSockets(io);

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

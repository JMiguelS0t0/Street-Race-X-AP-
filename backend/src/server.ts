import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { initSockets } from './sockets';

const PORT = process.env.PORT || 2999;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

initSockets(io);

server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

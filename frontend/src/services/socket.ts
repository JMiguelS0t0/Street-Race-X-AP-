import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:2999';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = (token: string) => {
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

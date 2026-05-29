import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET as string) as JwtPayload;
    
    if (!decoded || !decoded.id) {
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.data.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};

import { Request } from 'express';
export * from './constants';


export interface JwtPayload {
  id: string;
  username: string;
  rol: 'piloto' | 'administrador';
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

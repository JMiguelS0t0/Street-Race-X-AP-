import { Request, Response } from 'express';
import { AuthRequest, AuthenticatedRequest } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { extractToken } from '../middlewares/auth.middleware';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { generateToken, excludePassword } from '../utils/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { 
    username, email, password, foto_perfil, 
    zona_localidad, zona_ciudad, zona_estado, zona_pais 
  } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });

  if (existingUser) {
    return sendError(
      res,
      existingUser.email === email ? 'Email ya registrado' : 'Username ya registrado',
      400
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password_hash: hashedPassword,
      foto_perfil,
      zona_localidad,
      zona_ciudad,
      zona_estado,
      zona_pais,
      rango: 'D',
      rol: 'piloto',
      estado: 'activo'
    }
  });

  const token = generateToken(user);
  const userWithoutPassword = excludePassword(user);

  sendSuccess(
    res,
    { user: userWithoutPassword, token },
    'Cuenta creada exitosamente',
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Email y password son requeridos', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return sendError(res, 'Credenciales inválidas', 401);
  }

  if (user.estado === 'suspendido' || user.estado === 'inactivo') {
    return sendError(res, 'Cuenta suspendida o inactiva', 401);
  }

  const token = generateToken(user);
  const userWithoutPassword = excludePassword(user);

  sendSuccess(res, { user: userWithoutPassword, token }, 'Login exitoso');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, undefined, 'Sesión cerrada correctamente');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user.id },
    include: { categoria: true }
  });

  if (!user) {
    return sendNotFound(res, 'Usuario');
  }

  const userWithoutPassword = excludePassword(user);

  sendSuccess(res, userWithoutPassword);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return sendError(res, 'Token no proporcionado', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, { ignoreExpiration: true }) as any;
    
    if (!decoded || !decoded.id) {
       return sendError(res, 'Token inválido', 401);
    }

    const MAX_AGE_SECONDS = 86400; 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.iat && currentTimestamp - decoded.iat > MAX_AGE_SECONDS) {
      return sendError(res, 'El token ha excedido el límite de antigüedad para ser renovado. Por favor inicia sesión nuevamente.', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user || user.estado === 'suspendido' || user.estado === 'inactivo') {
      return sendError(res, 'Usuario no existe o está suspendido/inactivo', 401);
    }

    const newToken = generateToken(user);

    sendSuccess(res, { token: newToken }, 'Token renovado');
  } catch (error: any) {
    sendError(res, 'Token inválido', 401, [error.message]);
  }
});

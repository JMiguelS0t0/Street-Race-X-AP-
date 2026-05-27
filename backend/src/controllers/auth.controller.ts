import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { extractToken } from '../middlewares/auth.middleware';
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
    return res.status(400).json({
      success: false,
      error: existingUser.email === email ? 'Email ya registrado' : 'Username ya registrado',
      statusCode: 400
    });
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

  const token = jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  const { password_hash: _, ...userWithoutPassword } = user;

  res.status(201).json({
    success: true,
    message: 'Cuenta creada exitosamente',
    data: { user: userWithoutPassword, token }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({
      success: false,
      error: 'Credenciales inválidas',
      statusCode: 401
    });
  }

  if (user.estado === 'suspendido') {
    return res.status(401).json({
      success: false,
      error: 'Cuenta suspendida',
      statusCode: 401
    });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  const { password_hash: _, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    message: 'Login exitoso',
    data: { user: userWithoutPassword, token }
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { categoria: true }
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }

  const { password_hash: _, ...userWithoutPassword } = user;

  res.status(200).json({ success: true, data: userWithoutPassword });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token no proporcionado' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET as string, { ignoreExpiration: true }) as any;
  
  if (!decoded || !decoded.id) {
     return res.status(401).json({ success: false, error: 'Token inválido' });
  }

  const MAX_AGE_SECONDS = 86400; // 1 día
  const currentTimestamp = Math.floor(Date.now() / 1000);
  if (decoded.iat && currentTimestamp - decoded.iat > MAX_AGE_SECONDS) {
    return res.status(401).json({ success: false, error: 'El token ha excedido el límite de antigüedad para ser renovado. Por favor inicia sesión nuevamente.' });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  
  if (!user || user.estado === 'suspendido') {
    return res.status(401).json({ success: false, error: 'Usuario no existe o está suspendido' });
  }

  const newToken = jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({ success: true, message: 'Token renovado', data: { token: newToken } });
});


import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export const register = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
      statusCode: 500,
      details: [error.message]
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión',
      statusCode: 500,
      details: [error.message]
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { categoria: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const { password_hash: _, ...userWithoutPassword } = user;

    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener perfil' });
  }
};

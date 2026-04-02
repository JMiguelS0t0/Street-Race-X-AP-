import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado o expirado',
      statusCode: 401
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'JWT inválido o expirado, vuelve a iniciar sesión',
      statusCode: 401
    });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.rol === 'administrador') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Solo los administradores pueden realizar esta acción',
      statusCode: 403
    });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const sortField = (req.query.sort as string) || 'created_at';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true, username: true, email: true, rango: true, estado: true, rol: true, created_at: true
      }
    });

    const total = await prisma.user.count();

    res.json({ 
      success: true, 
      data: { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al listar usuarios' });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        foto_perfil: true,
        zona_ciudad: true,
        zona_estado: true,
        rango: true,
        victorias: true,
        derrotas: true,
        retos_consecutivos: true,
        categoria: { select: { nombre: true } },
        vehicles: {
          where: { activo: true },
          select: { id: true, tipo_vehiculo: true, marca: true, modelo: true, foto: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Piloto no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener perfil público' });
  }
};

export const discoverPilots = async (req: any, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;
    
    const ciudadFilter = req.query.ciudad as string;
    const tipoVehiculoFilter = req.query.tipo_vehiculo as string;

    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        rango: true,
        vehicles: {
          where: { activo: true },
          select: { tipo_vehiculo: true }
        }
      }
    });

    if (!me || (!tipoVehiculoFilter && me.vehicles.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Debes tener un vehículo marcado como activo para descubrir rivales'
      });
    }

    const activeVehicleType = tipoVehiculoFilter || me.vehicles[0]?.tipo_vehiculo;

    const whereClause: any = {
      id: { not: me.id },
      rango: me.rango,
      estado: 'activo',
      vehicles: {
        some: {
          activo: true,
          tipo_vehiculo: activeVehicleType
        }
      }
    };
    
    if (ciudadFilter) {
      whereClause.zona_ciudad = { contains: ciudadFilter };
    }

    const pilots = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        foto_perfil: true,
        rango: true,
        zona_ciudad: true,
        zona_estado: true,
        vehicles: {
          where: { activo: true },
          select: { id: true, tipo_vehiculo: true, marca: true, modelo: true, foto: true }
        }
      }
    });

    const total = await prisma.user.count({ where: whereClause });

    res.json({ 
      success: true, 
      data: { pilots, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error en descubrimiento de pilotos' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { foto_perfil, zona_localidad, zona_ciudad, zona_estado, zona_pais } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { foto_perfil, zona_localidad, zona_ciudad, zona_estado, zona_pais },
      select: { id: true, username: true, email: true, foto_perfil: true, zona_ciudad: true }
    });

    res.json({ success: true, message: 'Perfil actualizado', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
  }
};

export const deleteMe = async (req: any, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ success: true, message: 'Cuenta eliminada permanentemente' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar cuenta' });
  }
};

export const getRankHistory = async (req: any, res: Response) => {
  try {
    const userId = (req.params.id as string) || req.user.id;
    const history = await prisma.rankHistory.findMany({
      where: { user_id: userId },
      orderBy: { fecha: 'desc' }
    });
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener historial de rangos' });
  }
};

export const getTopRanking = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const sortField = (req.query.sort as string) || 'rango';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    let orderByClause: any;
    if (sortField === 'rango') {
      orderByClause = [
        { rango: sortOrder },
        { victorias: sortOrder }
      ];
    } else {
      orderByClause = { [sortField]: sortOrder };
    }

    const ranking = await prisma.user.findMany({
      where: { rol: 'piloto', estado: 'activo' },
      select: {
        id: true,
        username: true,
        foto_perfil: true,
        rango: true,
        victorias: true,
        derrotas: true
      },
      orderBy: orderByClause,
      take: limit
    });
    res.json({ success: true, data: ranking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener ranking' });
  }
};

export const adminUpdateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { estado, rol, rango } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { estado, rol, rango, updated_at: new Date() },
      select: { id: true, username: true, email: true, estado: true, rol: true, rango: true }
    });

    res.json({ success: true, message: 'Usuario actualizado por administrador', data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
  }
};

export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Usuario eliminado por administrador' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
  }
};

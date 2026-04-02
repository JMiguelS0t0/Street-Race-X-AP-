import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, email: true, rango: true, estado: true, rol: true, created_at: true
      }
    });
    res.json({ success: true, data: users });
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

    if (!me || me.vehicles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debes tener un vehículo marcado como activo para descubrir rivales'
      });
    }

    const activeVehicleType = me.vehicles[0].tipo_vehiculo;

    const pilots = await prisma.user.findMany({
      where: {
        id: { not: me.id },
        rango: me.rango,
        estado: 'activo',
        vehicles: {
          some: {
            activo: true,
            tipo_vehiculo: activeVehicleType
          }
        }
      },
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
      },
      take: 20
    });

    res.json({ success: true, data: { pilots } });
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
      orderBy: [
        { rango: 'desc' },
        { victorias: 'desc' }
      ],
      take: 10
    });
    res.json({ success: true, data: ranking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener ranking' });
  }
};

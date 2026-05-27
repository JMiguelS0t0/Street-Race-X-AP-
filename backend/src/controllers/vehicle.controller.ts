import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../types';

export const listVehicles = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { user_id: authReq.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al listar vehículos' });
  }
};

export const getVehicleDetail = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const id = req.params.id as string;
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, user_id: authReq.user.id }
    });
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehículo no encontrado' });
    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener detalle del vehículo' });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { tipo_vehiculo, marca, modelo, año, color, placa, foto, modificaciones, activo } = req.body;

    const existingVehicles = await prisma.vehicle.count({ where: { user_id: authReq.user.id } });
    if (existingVehicles >= 3) {
      return res.status(400).json({ success: false, error: 'Has alcanzado el límite máximo de 3 vehículos' });
    }

    const isActivo = activo !== undefined ? activo : (existingVehicles === 0);

    let vehicle;

    if (isActivo) {
      // Un piloto solo puede tener un vehículo activo a la vez para competir. Se usa una transacción para desactivar el anterior de forma atómica.
      const result = await prisma.$transaction(async (tx: any) => {
        await tx.vehicle.updateMany({
          where: { user_id: authReq.user.id },
          data: { activo: false }
        });
        return tx.vehicle.create({
          data: {
            user_id: authReq.user.id, tipo_vehiculo, marca, modelo, año, color, placa, foto, modificaciones, activo: true
          }
        });
      });
      vehicle = result;
    } else {
      vehicle = await prisma.vehicle.create({
        data: {
          user_id: authReq.user.id, tipo_vehiculo, marca, modelo, año, color, placa, foto, modificaciones, activo: false
        }
      });
    }

    res.status(201).json({ success: true, message: 'Vehículo registrado', data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al registrar vehículo' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const id = req.params.id as string;
    const { marca, modelo, año, color, placa, foto, modificaciones, activo } = req.body;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, user_id: authReq.user.id }
    });

    if (!existingVehicle) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado o no tienes permiso para actualizarlo' });
    }

    if (activo === true) {
      await prisma.$transaction([
        prisma.vehicle.updateMany({
          where: { user_id: authReq.user.id },
          data: { activo: false }
        }),
        prisma.vehicle.update({
          where: { id },
          data: { marca, modelo, año, color, placa, foto, modificaciones, activo: true }
        })
      ]);
      return res.json({ success: true, message: 'Vehículo actualizado y marcado como activo para competir' });
    } else if (activo === false) {
      // Permitimos desactivar el vehículo manualmente si el piloto no quiere competir temporalmente.
      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: { marca, modelo, año, color, placa, foto, modificaciones, activo: false }
      });
      return res.json({ success: true, message: 'Vehículo actualizado', data: vehicle });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { marca, modelo, año, color, placa, foto, modificaciones }
    });

    res.json({ success: true, message: 'Vehículo actualizado', data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar vehículo' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const id = req.params.id as string;

    const activeChallenges = await prisma.challenge.count({
      where: {
        OR: [
          { vehiculo_retador_id: id },
          { vehiculo_retado_id: id }
        ],
        estado: { in: ['pendiente', 'aceptado', 'en_curso'] }
      }
    });

    if (activeChallenges > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un vehículo con retos activos o pendientes'
      });
    }

    const deletedResult = await prisma.vehicle.deleteMany({ where: { id, user_id: authReq.user.id } });

    if (deletedResult.count === 0) {
      return res.status(404).json({ success: false, error: 'Vehículo no encontrado o no tienes permiso para eliminarlo' });
    }

    res.json({ success: true, message: 'Vehículo eliminado' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar vehículo' });
  }
};


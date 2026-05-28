import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export const listVehicles = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const vehicles = await prisma.vehicle.findMany({
    where: {
      user_id: authReq.user.id,
      tipo_vehiculo: { not: 'DELETED' }
    },
    orderBy: { created_at: 'desc' }
  });
  sendSuccess(res, vehicles);
});

export const getVehicleDetail = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id as string;
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id,
      user_id: authReq.user.id,
      tipo_vehiculo: { not: 'DELETED' }
    }
  });
  if (!vehicle) return sendNotFound(res, 'Vehículo');
  sendSuccess(res, vehicle);
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { tipo_vehiculo, marca, modelo, año, color, placa, foto, modificaciones, activo } = req.body;

  const existingVehicles = await prisma.vehicle.count({
    where: {
      user_id: authReq.user.id,
      tipo_vehiculo: { not: 'DELETED' }
    }
  });
  if (existingVehicles >= 3) {
    return sendError(res, 'Has alcanzado el límite máximo de 3 vehículos', 400);
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

  sendSuccess(res, vehicle, 'Vehículo registrado', 201);
});

export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id as string;
  const { marca, modelo, año, color, placa, foto, modificaciones, activo } = req.body;

  const existingVehicle = await prisma.vehicle.findFirst({
    where: { id, user_id: authReq.user.id }
  });

  if (!existingVehicle) {
    return sendError(res, 'Vehículo no encontrado o no tienes permiso para actualizarlo', 404);
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
    return sendSuccess(res, undefined, 'Vehículo actualizado y marcado como activo para competir');
  } else if (activo === false) {
    // Permitimos desactivar el vehículo manualmente si el piloto no quiere competir temporalmente.
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { marca, modelo, año, color, placa, foto, modificaciones, activo: false }
    });
    return sendSuccess(res, vehicle, 'Vehículo actualizado');
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: { marca, modelo, año, color, placa, foto, modificaciones }
  });

  sendSuccess(res, vehicle, 'Vehículo actualizado');
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
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
    return sendError(res, 'No se puede eliminar un vehículo con retos activos o pendientes', 400);
  }

  const updatedResult = await prisma.vehicle.updateMany({
    where: { id, user_id: authReq.user.id },
    data: {
      activo: false,
      tipo_vehiculo: 'DELETED'
    }
  });

  if (updatedResult.count === 0) {
    return sendError(res, 'Vehículo no encontrado o no tienes permiso para eliminarlo', 404);
  }

  sendSuccess(res, undefined, 'Vehículo eliminado');
});

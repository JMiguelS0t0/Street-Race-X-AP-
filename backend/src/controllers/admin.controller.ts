import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

export const listAllChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortField, sortOrder } = parsePagination(req);
  const search = req.query.search as string;

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { retador: { username: { contains: search } } },
      { retado: { username: { contains: search } } },
      { ubicacion_acordada: { contains: search } }
    ];
  }

  const challenges = await prisma.challenge.findMany({
    where: whereClause,
    skip,
    take: limit,
    include: {
      retador: { select: { id: true, username: true, rango: true } },
      retado: { select: { id: true, username: true, rango: true } },
      vehiculo_retador: { select: { id: true, marca: true, modelo: true } },
      vehiculo_retado: { select: { id: true, marca: true, modelo: true } },
      location: true
    },
    orderBy: { [sortField]: sortOrder }
  });

  const total = await prisma.challenge.count({ where: whereClause });

  sendSuccess(res, { challenges, pagination: buildPaginationMeta(total, page, limit) });
});

export const deleteChallenge = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return sendNotFound(res, 'Reto');

  await prisma.challenge.delete({ where: { id } });

  sendSuccess(res, undefined, 'Reto eliminado por administrador');
});

export const listAllVehicles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip, sortField, sortOrder } = parsePagination(req);
  const search = req.query.search as string;

  const whereClause: any = {
    tipo_vehiculo: { not: 'DELETED' }
  };
  if (search) {
    whereClause.AND = [
      {
        OR: [
          { marca: { contains: search } },
          { modelo: { contains: search } },
          { placa: { contains: search } },
          { user: { username: { contains: search } } }
        ]
      }
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where: whereClause,
    skip,
    take: limit,
    include: {
      user: { select: { id: true, username: true } }
    },
    orderBy: { [sortField]: sortOrder }
  });

  const total = await prisma.vehicle.count({ where: whereClause });

  sendSuccess(res, { vehicles, pagination: buildPaginationMeta(total, page, limit) });
});

export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return sendNotFound(res, 'Vehículo');

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

  await prisma.vehicle.update({
    where: { id },
    data: {
      activo: false,
      tipo_vehiculo: 'DELETED'
    }
  });

  sendSuccess(res, undefined, 'Vehículo desactivado por administrador');
});

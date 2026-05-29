import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';
import { RaceType, ChallengeStatus } from '../types/constants';
import { softDeleteVehicle } from '../services/vehicle.service';


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

export const updateChallengeAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { tipo_carrera, numero_vueltas, location_id, fecha_acordada, notas, estado, ganador_id, ganador_retador_id, ganador_retado_id } = req.body;

  if (tipo_carrera && !Object.values(RaceType).includes(tipo_carrera)) {
    return sendError(res, `El tipo de carrera debe ser uno de: ${Object.values(RaceType).join(', ')}`, 400);
  }

  if (tipo_carrera === RaceType.CARRERA_VUELTAS && (numero_vueltas === undefined || numero_vueltas === null || numero_vueltas <= 0)) {
    return sendError(res, 'Para Carrera por Vueltas se requiere especificar el número de vueltas', 400);
  }

  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return sendNotFound(res, 'Reto');

  let finalUbicacion = challenge.ubicacion_acordada;
  if (location_id) {
    const loc = await prisma.location.findUnique({ where: { id: location_id } });
    if (loc) {
      finalUbicacion = loc.nombre;
    }
  }

  const updated = await prisma.challenge.update({
    where: { id },
    data: {
      tipo_carrera,
      numero_vueltas: tipo_carrera === RaceType.CARRERA_VUELTAS ? numero_vueltas : null,
      location_id: location_id || null,
      ubicacion_acordada: finalUbicacion,
      fecha_acordada: fecha_acordada ? new Date(fecha_acordada) : null,
      notas,
      estado,
      ganador_id: ganador_id || null,
      ganador_retador_id: ganador_retador_id || null,
      ganador_retado_id: ganador_retado_id || null,
      updated_at: new Date()
    },
    include: {
      retador: { select: { id: true, username: true, rango: true } },
      retado: { select: { id: true, username: true, rango: true } },
      vehiculo_retador: { select: { id: true, marca: true, modelo: true } },
      vehiculo_retado: { select: { id: true, marca: true, modelo: true } },
      location: true
    }
  });

  sendSuccess(res, updated, 'Reto actualizado por administrador');
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

  try {
    await softDeleteVehicle(id);
    sendSuccess(res, undefined, 'Vehículo desactivado por administrador');
  } catch (error: any) {
    if (error.message.includes('No se puede eliminar')) {
      return sendError(res, error.message, 400);
    }
    return sendError(res, error.message, 404);
  }
});

export const adminUpdateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { estado, rol, rango } = req.body;
  
  const user = await prisma.user.update({
    where: { id },
    data: { estado, rol, rango, updated_at: new Date() },
    select: { id: true, username: true, email: true, estado: true, rol: true, rango: true }
  });

  sendSuccess(res, user, 'Usuario actualizado por administrador');
});

export const adminDeleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.user.update({
    where: { id },
    data: { estado: 'inactivo' }
  });
  sendSuccess(res, undefined, 'Usuario desactivado por administrador');
});

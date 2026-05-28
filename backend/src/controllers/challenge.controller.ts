import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { AuthRequest, AuthenticatedRequest } from '../types';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { processChallengeCompletion } from '../services/challenge.service';
import { asyncHandler } from '../utils/asyncHandler';

export const createChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { retador_id, retado_id, tipo_carrera, ubicacion_acordada, location_id, fecha_acordada, notas } = req.body;

  let retador = null;
  let retado = null;

  if (retador_id && retado_id) {
    if (retador_id === retado_id) {
      return sendError(res, 'No puedes retar al mismo piloto', 400);
    }

    retador = await prisma.user.findUnique({
      where: { id: retador_id },
      include: { vehicles: { where: { activo: true, tipo_vehiculo: { not: 'DELETED' } } } }
    });

    retado = await prisma.user.findUnique({
      where: { id: retado_id },
      include: { vehicles: { where: { activo: true, tipo_vehiculo: { not: 'DELETED' } } } }
    });

    if (!retador || retador.vehicles.length === 0) {
      return sendError(res, 'El retador debe tener un vehículo activo', 400);
    }

    if (!retado || retado.vehicles.length === 0) {
      return sendError(res, 'El piloto retado no tiene un vehículo activo', 400);
    }

    if (retador.rango !== retado.rango) {
      return sendError(res, 'Solo se pueden retar pilots del mismo rango', 400);
    }

    if (retador.vehicles[0].tipo_vehiculo !== retado.vehicles[0].tipo_vehiculo) {
      return sendError(res, 'Los vehículos activos deben ser del mismo tipo (ej: Auto vs Auto)', 400);
    }
  } else if (retador_id || retado_id) {
    const pilotId = retador_id || retado_id;
    const pilot = await prisma.user.findUnique({
      where: { id: pilotId },
      include: { vehicles: { where: { activo: true, tipo_vehiculo: { not: 'DELETED' } } } }
    });
    if (!pilot || pilot.vehicles.length === 0) {
      return sendError(res, 'El piloto debe tener un vehículo activo', 400);
    }
    if (retador_id) {
      retador = pilot;
    } else {
      retado = pilot;
    }
  }

  let finalUbicacion = ubicacion_acordada;
  if (location_id) {
    const loc = await prisma.location.findUnique({ where: { id: location_id } });
    if (loc) {
      finalUbicacion = loc.nombre;
    }
  }

  const challenge = await prisma.challenge.create({
    data: {
      retador_id: retador ? retador.id : null,
      retado_id: retado ? retado.id : null,
      vehiculo_retador_id: retador && retador.vehicles.length > 0 ? retador.vehicles[0].id : null,
      vehiculo_retado_id: retado && retado.vehicles.length > 0 ? retado.vehicles[0].id : null,
      tipo_carrera,
      ubicacion_acordada: finalUbicacion,
      location_id: location_id || null,
      fecha_acordada: fecha_acordada ? new Date(fecha_acordada) : null,
      notas,
      estado: 'pendiente'
    }
  });

  if (retador && retado) {
    await prisma.notification.createMany({
      data: [
        {
          user_id: retado.id,
          tipo: 'reto_recibido',
          mensaje: `${retador.username} te ha enviado un reto de ${tipo_carrera}`,
          referencia_id: challenge.id
        },
        {
          user_id: retador.id,
          tipo: 'reto_recibido',
          mensaje: `Se ha programado un reto de ${tipo_carrera} contra ${retado.username}`,
          referencia_id: challenge.id
        }
      ]
    });
  } else if (retador || retado) {
    const activePilot = retador || retado;
    if (activePilot) {
      await prisma.notification.create({
        data: {
          user_id: activePilot.id,
          tipo: 'reto_recibido',
          mensaje: `Se ha publicado tu reto de ${tipo_carrera}`,
          referencia_id: challenge.id
        }
      });
    }
  }

  sendSuccess(res, challenge, 'Reto creado exitosamente', 201);
});

export const completeChallenge = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { ganador_id } = req.body;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { retador: true, retado: true }
  });

  if (!challenge || challenge.estado !== 'aceptado') {
    return sendError(res, 'El reto no existe o no está en un estado válido para completarse', 400);
  }

  const isRetadorWinner = ganador_id === challenge.retador_id;
  const perdedor_id = isRetadorWinner ? challenge.retado_id : challenge.retador_id;

  await processChallengeCompletion({
    challengeId: id,
    ganadorId: ganador_id,
    perdedorId: perdedor_id,
    retadorUsername: challenge.retador.username,
    retadoUsername: challenge.retado.username,
    isRetadorWinner
  });

  sendSuccess(res, undefined, 'Reto completado y estadísticas actualizadas');
});

export const listChallenges = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { page, limit, skip, sortField, sortOrder } = parsePagination(req);

  const estadoFilter = req.query.estado as string;
  const tipoCarreraFilter = req.query.tipo_carrera as string;
  const disponibles = req.query.disponibles === 'true';

  let whereClause: any;
  if (disponibles) {
    whereClause = {
      estado: 'pendiente',
      OR: [
        { retador_id: null },
        { retado_id: null }
      ],
      retador_id: { not: authReq.user.id },
      retado_id: { not: authReq.user.id }
    };
  } else {
    whereClause = {
      OR: [{ retador_id: authReq.user.id }, { retado_id: authReq.user.id }]
    };
  }

  if (estadoFilter && !disponibles) {
    whereClause.estado = estadoFilter;
  }
  if (tipoCarreraFilter) {
    whereClause.tipo_carrera = tipoCarreraFilter;
  }

  const challenges = await prisma.challenge.findMany({
    where: whereClause,
    skip,
    take: limit,
    include: {
      retador: { select: { username: true, rango: true } },
      retado: { select: { username: true, rango: true } },
      vehiculo_retador: { select: { marca: true, modelo: true } },
      vehiculo_retado: { select: { marca: true, modelo: true } },
      location: true
    },
    orderBy: { [sortField]: sortOrder }
  });

  const total = await prisma.challenge.count({ where: whereClause });

  sendSuccess(res, { challenges, pagination: buildPaginationMeta(total, page, limit) });
});

export const getChallengeDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      retador: { select: { username: true, rango: true } },
      retado: { select: { username: true, rango: true } },
      vehiculo_retador: true,
      vehiculo_retado: true,
      location: true
    }
  });
  if (!challenge) return sendNotFound(res, 'Reto');
  sendSuccess(res, challenge);
});

export const updateChallenge = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id as string;
  const { action, estado, ganador_id } = req.body;

  if (action === 'unirse' || estado === 'unirse') {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        retador: true,
        retado: true,
        vehiculo_retador: true,
        vehiculo_retado: true
      }
    });

    if (!challenge) {
      return sendNotFound(res, 'Reto');
    }

    const userId = authReq.user.id;
    if (challenge.retador_id === userId || challenge.retado_id === userId) {
      return sendError(res, 'Ya formas parte de este reto', 400);
    }

    const joiningUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { vehicles: { where: { activo: true, tipo_vehiculo: { not: 'DELETED' } } } }
    });

    if (!joiningUser || joiningUser.vehicles.length === 0) {
      return sendError(res, 'Debes tener un vehículo activo para unirte al reto', 400);
    }

    const activeVehicle = joiningUser.vehicles[0];
    let updateData: any = {};

    if (!challenge.retador_id && !challenge.retado_id) {
      updateData = {
        retador_id: userId,
        vehiculo_retador_id: activeVehicle.id
      };
    } else if (challenge.retador_id && !challenge.retado_id) {
      if (challenge.retador?.rango !== joiningUser.rango) {
        return sendError(res, 'Solo se pueden unir pilotos del mismo rango', 400);
      }
      if (challenge.vehiculo_retador?.tipo_vehiculo !== activeVehicle.tipo_vehiculo) {
        return sendError(res, 'Los vehículos deben ser del mismo tipo (ej: Auto vs Auto)', 400);
      }
      updateData = {
        retado_id: userId,
        vehiculo_retado_id: activeVehicle.id,
        estado: 'aceptado'
      };
    } else if (!challenge.retador_id && challenge.retado_id) {
      if (challenge.retado?.rango !== joiningUser.rango) {
        return sendError(res, 'Solo se pueden unir pilotos del mismo rango', 400);
      }
      if (challenge.vehiculo_retado?.tipo_vehiculo !== activeVehicle.tipo_vehiculo) {
        return sendError(res, 'Los vehículos deben ser del mismo tipo (ej: Auto vs Auto)', 400);
      }
      updateData = {
        retador_id: userId,
        vehiculo_retador_id: activeVehicle.id,
        estado: 'aceptado'
      };
    } else {
      return sendError(res, 'El reto ya está lleno', 400);
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        retador: { select: { username: true, rango: true } },
        retado: { select: { username: true, rango: true } },
        vehiculo_retador: { select: { marca: true, modelo: true } },
        vehiculo_retado: { select: { marca: true, modelo: true } }
      }
    });

    if (updateData.retador_id && challenge.retado_id) {
      await prisma.notification.create({
        data: {
          user_id: challenge.retado_id,
          tipo: 'reto_aceptado',
          mensaje: `${joiningUser.username} se ha unido a tu reto`,
          referencia_id: id
        }
      });
    } else if (updateData.retado_id && challenge.retador_id) {
      await prisma.notification.create({
        data: {
          user_id: challenge.retador_id,
          tipo: 'reto_aceptado',
          mensaje: `${joiningUser.username} se ha unido a tu reto`,
          referencia_id: id
        }
      });
    }

    return sendSuccess(res, updated, 'Te has unido al reto exitosamente');
  }

  const ALLOWED_STATES = ['aceptado', 'rechazado', 'cancelado', 'en_curso', 'completado'];
  if (!estado || !ALLOWED_STATES.includes(estado)) {
    return sendError(res, `El campo 'estado' es requerido y debe ser uno de: ${ALLOWED_STATES.join(', ')}`, 400);
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      retador: { select: { id: true, username: true, rango: true } },
      retado: { select: { id: true, username: true, rango: true } }
    }
  });
  if (!challenge) return sendNotFound(res, 'Reto');

  const userId = authReq.user.id;
  const isRetador = challenge.retador_id === userId;
  const isRetado = challenge.retado_id === userId;

  if (estado === 'aceptado' || estado === 'rechazado') {
    if (!isRetado) {
      return sendError(res, 'Solo el retado puede responder a este reto', 403);
    }
    if (challenge.estado !== 'pendiente') {
      return sendError(res, 'Solo se puede aceptar o rechazar un reto pendiente', 400);
    }
  }

  if (estado === 'cancelado') {
    if (!isRetador) {
      return sendError(res, 'Solo el retador puede cancelar este reto', 403);
    }
  }

  if (estado === 'en_curso') {
    if (!isRetador && !isRetado) {
      return sendError(res, 'Solo los participantes del reto pueden cambiar su estado', 403);
    }
    if (challenge.estado !== 'aceptado') {
      return sendError(res, 'El reto debe estar aceptado para pasar a en_curso', 400);
    }
  }

  if (estado === 'completado') {
    if (!isRetador && !isRetado) {
      return sendError(res, 'Solo los participantes del reto pueden completarlo', 403);
    }
    if (challenge.estado !== 'aceptado' && challenge.estado !== 'en_curso') {
      return sendError(res, 'El reto no está en un estado válido para completarse', 400);
    }
    if (!ganador_id) {
      return sendError(res, 'Se requiere ganador_id para completar el reto', 400);
    }
    if (ganador_id !== challenge.retador_id && ganador_id !== challenge.retado_id) {
      return sendError(res, 'El ganador debe ser uno de los participantes del reto', 400);
    }

    const isRetadorWinner = ganador_id === challenge.retador_id;
    const perdedor_id = isRetadorWinner ? challenge.retado_id : challenge.retador_id;

    if (challenge.retador && challenge.retado) {
      await processChallengeCompletion({
        challengeId: id,
        ganadorId: ganador_id,
        perdedorId: perdedor_id,
        retadorUsername: challenge.retador.username,
        retadoUsername: challenge.retado.username,
        isRetadorWinner
      });
    }

    return sendSuccess(res, undefined, 'Reto completado y estadísticas actualizadas');
  }

  const updated = await prisma.challenge.update({
    where: { id },
    data: { estado, updated_at: new Date() }
  });

  const notificationMap: Record<string, { userId: string | null; tipo: string; mensaje: string }> = {
    aceptado:  { userId: challenge.retador_id, tipo: 'reto_aceptado',  mensaje: 'El reto ha sido aceptado' },
    rechazado: { userId: challenge.retador_id, tipo: 'reto_rechazado', mensaje: 'El reto ha sido rechazado' },
    cancelado: { userId: challenge.retado_id,  tipo: 'reto_cancelado', mensaje: 'El reto ha sido cancelado' },
    en_curso:  { userId: isRetador ? challenge.retado_id : challenge.retador_id, tipo: 'reto_en_curso', mensaje: 'El reto ha comenzado' }
  };

  const notif = notificationMap[estado];
  if (notif && notif.userId) {
    await prisma.notification.create({
      data: { user_id: notif.userId, tipo: notif.tipo, mensaje: notif.mensaje }
    });
  }

  sendSuccess(res, updated);
});

export const getGlobalHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await prisma.challenge.findMany({
    where: { estado: 'completado' },
    include: {
      retador: { select: { username: true, rango: true } },
      retado: { select: { username: true, rango: true } },
      ganador: { select: { username: true } },
      location: true
    },
    orderBy: { updated_at: 'desc' },
    take: 50
  });
  sendSuccess(res, history);
});

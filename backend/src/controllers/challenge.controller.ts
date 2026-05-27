import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

const getNextRank = (currentRank: string): string => {
  const ranks = ['D', 'C', 'B', 'A', 'S'];
  const currentIndex = ranks.indexOf(currentRank);
  if (currentIndex === -1 || currentIndex === ranks.length - 1) return currentRank;
  return ranks[currentIndex + 1];
};

export const createChallenge = async (req: any, res: Response) => {
  try {
    const { retado_id, tipo_carrera, ubicacion_acordada, fecha_acordada, notas } = req.body;
    const retador_id = req.user.id;

    if (retador_id === retado_id) {
      return sendError(res, 'No puedes retarte a ti mismo', 400);
    }

    const retador = await prisma.user.findUnique({
      where: { id: retador_id },
      include: { vehicles: { where: { activo: true } } }
    });

    const retado = await prisma.user.findUnique({
      where: { id: retado_id },
      include: { vehicles: { where: { activo: true } } }
    });

    if (!retador || retador.vehicles.length === 0) {
      return sendError(res, 'Debes tener un vehículo activo para retar', 400);
    }

    if (!retado || retado.vehicles.length === 0) {
      return sendError(res, 'El piloto retado no tiene un vehículo activo', 400);
    }

    if (retador.rango !== retado.rango) {
      return sendError(res, 'Solo puedes retar a pilotos de tu mismo rango', 400);
    }

    if (retador.vehicles[0].tipo_vehiculo !== retado.vehicles[0].tipo_vehiculo) {
      return sendError(res, 'Los vehículos activos deben ser del mismo tipo (ej: Auto vs Auto)', 400);
    }

    const challenge = await prisma.challenge.create({
      data: {
        retador_id,
        retado_id,
        vehiculo_retador_id: retador.vehicles[0].id,
        vehiculo_retado_id: retado.vehicles[0].id,
        tipo_carrera,
        ubicacion_acordada,
        fecha_acordada: fecha_acordada ? new Date(fecha_acordada) : null,
        notas,
        estado: 'pendiente'
      }
    });

    await prisma.notification.create({
      data: {
        user_id: retado_id,
        tipo: 'reto_recibido',
        mensaje: `${retador.username} te ha enviado un reto de ${tipo_carrera}`,
        referencia_id: challenge.id
      }
    });

    sendSuccess(res, challenge, 'Reto enviado exitosamente', 201);
  } catch (error: any) {
    sendError(res, 'Error al crear reto', 500, [error.message]);
  }
};

export const completeChallenge = async (req: any, res: Response) => {
  try {
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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.challenge.update({
        where: { id },
        data: { estado: 'completado', ganador_id, updated_at: new Date() }
      });

      const winner = await tx.user.findUnique({ where: { id: ganador_id } });
      if (winner) {
        const newConsecutiveWins = (winner.retos_consecutivos || 0) + 1;
        let newRank = winner.rango || 'D';
        
        if (newConsecutiveWins >= 2 && newRank !== 'S') {
          const oldRank = newRank;
          newRank = getNextRank(newRank);
          
          await tx.rankHistory.create({
            data: { user_id: ganador_id, rango_anterior: oldRank, rango_nuevo: newRank }
          });

          await tx.notification.create({
            data: { user_id: ganador_id, tipo: 'rango_subido', mensaje: `¡Felicidades! Has ascendido al rango ${newRank}` }
          });

          await tx.user.update({
            where: { id: ganador_id },
            data: { 
              victorias: { increment: 1 }, 
              rango: newRank, 
              retos_consecutivos: 0 
            }
          });
        } else {
          await tx.user.update({
            where: { id: ganador_id },
            data: { 
              victorias: { increment: 1 }, 
              retos_consecutivos: newConsecutiveWins 
            }
          });
        }
      }

      await tx.user.update({
        where: { id: perdedor_id },
        data: { 
          derrotas: { increment: 1 }, 
          retos_consecutivos: 0 
        }
      });

      await tx.notification.create({
        data: { user_id: ganador_id, tipo: 'resultado', mensaje: `Has ganado el reto contra ${isRetadorWinner ? challenge.retado.username : challenge.retador.username}` }
      });
      await tx.notification.create({
        data: { user_id: perdedor_id, tipo: 'resultado', mensaje: `Has perdido el reto contra ${isRetadorWinner ? challenge.retador.username : challenge.retado.username}` }
      });
    });

    sendSuccess(res, undefined, 'Reto completado y estadísticas actualizadas');
  } catch (error: any) {
    sendError(res, 'Error al completar reto');
  }
};

export const listChallenges = async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const sortField = (req.query.sort as string) || 'created_at';
    const sortOrder = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const estadoFilter = req.query.estado as string;
    const tipoCarreraFilter = req.query.tipo_carrera as string;

    const whereClause: any = {
      OR: [{ retador_id: req.user.id }, { retado_id: req.user.id }]
    };

    if (estadoFilter) {
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
        vehiculo_retado: { select: { marca: true, modelo: true } }
      },
      orderBy: { [sortField]: sortOrder }
    });

    const total = await prisma.challenge.count({ where: whereClause });

    sendSuccess(res, { challenges, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error: any) {
    sendError(res, 'Error al listar retos');
  }
};

export const getChallengeDetail = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        retador: { select: { username: true, rango: true } },
        retado: { select: { username: true, rango: true } },
        vehiculo_retador: true,
        vehiculo_retado: true
      }
    });
    if (!challenge) return sendNotFound(res, 'Reto');
    sendSuccess(res, challenge);
  } catch (error: any) {
    sendError(res, 'Error al obtener detalle del reto');
  }
};

export const updateChallenge = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const { estado, ganador_id } = req.body;

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

    const userId = req.user.id;
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

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.challenge.update({
          where: { id },
          data: { estado: 'completado', ganador_id, updated_at: new Date() }
        });

        const winner = await tx.user.findUnique({ where: { id: ganador_id } });
        if (winner) {
          const newConsecutiveWins = (winner.retos_consecutivos || 0) + 1;
          let newRank = winner.rango || 'D';
          
          if (newConsecutiveWins >= 2 && newRank !== 'S') {
            const oldRank = newRank;
            newRank = getNextRank(newRank);
            
            await tx.rankHistory.create({
              data: { user_id: ganador_id, rango_anterior: oldRank, rango_nuevo: newRank }
            });

            await tx.notification.create({
              data: { user_id: ganador_id, tipo: 'rango_subido', mensaje: `¡Felicidades! Has ascendido al rango ${newRank}` }
            });

            await tx.user.update({
              where: { id: ganador_id },
              data: { 
                victorias: { increment: 1 }, 
                rango: newRank, 
                retos_consecutivos: 0 
              }
            });
          } else {
            await tx.user.update({
              where: { id: ganador_id },
              data: { 
                victorias: { increment: 1 }, 
                retos_consecutivos: newConsecutiveWins 
              }
            });
          }
        }

        await tx.user.update({
          where: { id: perdedor_id },
          data: { 
            derrotas: { increment: 1 }, 
            retos_consecutivos: 0 
          }
        });

        await tx.notification.create({
          data: { user_id: ganador_id, tipo: 'resultado', mensaje: `Has ganado el reto contra ${isRetadorWinner ? challenge.retado.username : challenge.retador.username}` }
        });
        await tx.notification.create({
          data: { user_id: perdedor_id, tipo: 'resultado', mensaje: `Has perdido el reto contra ${isRetadorWinner ? challenge.retador.username : challenge.retado.username}` }
        });
      });

      return sendSuccess(res, undefined, 'Reto completado y estadísticas actualizadas');
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: { estado, updated_at: new Date() }
    });

    // El estado 'completado' se maneja arriba con su propia transacción y retorna temprano.
    // Estados restantes: aceptado, rechazado, cancelado, en_curso.
    // Para 'en_curso', la participación ya se validó previamente, por lo que isRetador/isRetado es confiable para notificar.
    const notificationMap: Record<string, { userId: string; tipo: string; mensaje: string }> = {
      aceptado:  { userId: challenge.retador_id, tipo: 'reto_aceptado',  mensaje: 'El reto ha sido aceptado' },
      rechazado: { userId: challenge.retador_id, tipo: 'reto_rechazado', mensaje: 'El reto ha sido rechazado' },
      cancelado: { userId: challenge.retado_id,  tipo: 'reto_cancelado', mensaje: 'El reto ha sido cancelado' },
      en_curso:  { userId: isRetador ? challenge.retado_id : challenge.retador_id, tipo: 'reto_en_curso', mensaje: 'El reto ha comenzado' }
    };

    const notif = notificationMap[estado];
    if (notif) {
      await prisma.notification.create({
        data: { user_id: notif.userId, tipo: notif.tipo, mensaje: notif.mensaje }
      });
    }

    sendSuccess(res, updated);
  } catch (error: any) {
    sendError(res, 'Error al actualizar reto');
  }
};

export const getGlobalHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.challenge.findMany({
      where: { estado: 'completado' },
      include: {
        retador: { select: { username: true, rango: true } },
        retado: { select: { username: true, rango: true } },
        ganador: { select: { username: true } }
      },
      orderBy: { updated_at: 'desc' },
      take: 50
    });
    sendSuccess(res, history);
  } catch (error: any) {
    sendError(res, 'Error al obtener historial global');
  }
};


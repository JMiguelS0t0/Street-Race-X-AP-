import { Request, Response } from 'express';
import prisma from '../config/prisma';

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
      return res.status(400).json({ success: false, error: 'No puedes retarte a ti mismo' });
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
      return res.status(400).json({ success: false, error: 'Debes tener un vehículo activo para retar' });
    }

    if (!retado || retado.vehicles.length === 0) {
      return res.status(400).json({ success: false, error: 'El piloto retado no tiene un vehículo activo' });
    }

    if (retador.rango !== retado.rango) {
      return res.status(400).json({ success: false, error: 'Solo puedes retar a pilotos de tu mismo rango' });
    }

    if (retador.vehicles[0].tipo_vehiculo !== retado.vehicles[0].tipo_vehiculo) {
      return res.status(400).json({ success: false, error: 'Los vehículos activos deben ser del mismo tipo (ej: Auto vs Auto)' });
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

    res.status(201).json({ success: true, message: 'Reto enviado exitosamente', data: challenge });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al crear reto', details: [error.message] });
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
      return res.status(400).json({ success: false, error: 'El reto no existe o no está en un estado válido para completarse' });
    }

    const isRetadorWinner = ganador_id === challenge.retador_id;
    const perdedor_id = isRetadorWinner ? challenge.retado_id : challenge.retador_id;

    await prisma.$transaction(async (tx) => {
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

    res.json({ success: true, message: 'Reto completado y estadísticas actualizadas' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al completar reto' });
  }
};

export const listChallenges = async (req: any, res: Response) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [{ retador_id: req.user.id }, { retado_id: req.user.id }]
      },
      include: {
        retador: { select: { username: true, rango: true } },
        retado: { select: { username: true, rango: true } },
        vehiculo_retador: { select: { marca: true, modelo: true } },
        vehiculo_retado: { select: { marca: true, modelo: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: challenges });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al listar retos' });
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
    if (!challenge) return res.status(404).json({ success: false, error: 'Reto no encontrado' });
    res.json({ success: true, data: challenge });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener detalle del reto' });
  }
};

export const updateChallengeStatus = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const { estado } = req.body; 
    
    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Reto no encontrado' });

    if (estado === 'aceptado' || estado === 'rechazado') {
      if (challenge.retado_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Solo el retado puede responder a este reto' });
      }
    }

    if (estado === 'cancelado') {
      if (challenge.retador_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Solo el retador puede cancelar este reto' });
      }
    }

    const updated = await prisma.challenge.update({
      where: { id },
      data: { estado, updated_at: new Date() }
    });

    const targetUserId = (estado === 'aceptado' || estado === 'rechazado') ? challenge.retador_id : challenge.retado_id;
    await prisma.notification.create({
      data: {
        user_id: targetUserId,
        tipo: estado === 'aceptado' ? 'reto_aceptado' : 'reto_rechazado',
        mensaje: `El reto ha sido ${estado}`
      }
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar estado del reto' });
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
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener historial global' });
  }
};

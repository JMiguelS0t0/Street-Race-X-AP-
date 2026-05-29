import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ChallengeStatus } from '../types/constants';

const RANKS = ['D', 'C', 'B', 'A', 'S'] as const;

const getNextRank = (currentRank: string): string => {
  const idx = RANKS.indexOf(currentRank as any);
  return idx === -1 || idx === RANKS.length - 1 ? currentRank : RANKS[idx + 1];
};

interface CompleteChallengeInput {
  challengeId: string;
  ganadorId: string;
  perdedorId: string;
  retadorUsername: string;
  retadoUsername: string;
  isRetadorWinner: boolean;
}

export const processChallengeCompletion = async (input: CompleteChallengeInput) => {
  const { challengeId, ganadorId, perdedorId, retadorUsername, retadoUsername, isRetadorWinner } = input;

  if (!challengeId) {
    throw new Error('challengeId is required');
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.challenge.update({
      where: { id: challengeId },
      data: { estado: 'completado', ganador_id: ganadorId, updated_at: new Date() }
    });

    const winner = await tx.user.findUnique({ where: { id: ganadorId } });
    if (winner) {
      const newConsecutiveWins = (winner.retos_consecutivos || 0) + 1;
      let newRank = winner.rango || 'D';

      if (newConsecutiveWins >= 2 && newRank !== 'S') {
        const oldRank = newRank;
        newRank = getNextRank(newRank);
        await tx.rankHistory.create({
          data: { user_id: ganadorId, rango_anterior: oldRank, rango_nuevo: newRank }
        });
        await tx.notification.create({
          data: { user_id: ganadorId, tipo: 'rango_subido', mensaje: `¡Felicidades! Has ascendido al rango ${newRank}` }
        });
        await tx.user.update({
          where: { id: ganadorId },
          data: { victorias: { increment: 1 }, rango: newRank, retos_consecutivos: 0 }
        });
      } else {
        await tx.user.update({
          where: { id: ganadorId },
          data: { victorias: { increment: 1 }, retos_consecutivos: newConsecutiveWins }
        });
      }
    }

    const loser = await tx.user.findUnique({ where: { id: perdedorId } });
    const currentLoserConsecutive = loser?.retos_consecutivos || 0;
    const newLoserConsecutive = Math.max(0, currentLoserConsecutive - 1);

    await tx.user.update({
      where: { id: perdedorId },
      data: { derrotas: { increment: 1 }, retos_consecutivos: newLoserConsecutive }
    });

    await tx.notification.create({
      data: { user_id: ganadorId, tipo: 'resultado', mensaje: `Has ganado el reto contra ${isRetadorWinner ? retadoUsername : retadorUsername}` }
    });
    await tx.notification.create({
      data: { user_id: perdedorId, tipo: 'resultado', mensaje: `Has perdido el reto contra ${isRetadorWinner ? retadorUsername : retadoUsername}` }
    });
  });
};

export const validateChallengeEligibility = async (pilotA: any, pilotB: any) => {
  if (pilotA.id === pilotB.id) {
    throw new Error('No puedes retar al mismo piloto');
  }

  if (!pilotA.vehicles || pilotA.vehicles.length === 0) {
    throw new Error('El retador debe tener un vehículo activo');
  }

  if (!pilotB.vehicles || pilotB.vehicles.length === 0) {
    throw new Error('El piloto retado no tiene un vehículo activo');
  }

  if (pilotA.rango !== pilotB.rango) {
    throw new Error('Solo se pueden retar pilots del mismo rango');
  }

  if (pilotA.vehicles[0].tipo_vehiculo !== pilotB.vehicles[0].tipo_vehiculo) {
    throw new Error('Los vehículos activos deben ser del mismo tipo (ej: Auto vs Auto)');
  }

  const activeChallenge = await prisma.challenge.findFirst({
    where: {
      OR: [
        { retador_id: pilotA.id, retado_id: pilotB.id },
        { retador_id: pilotB.id, retado_id: pilotA.id }
      ],
      estado: { in: [ChallengeStatus.PENDIENTE, ChallengeStatus.ACEPTADO, ChallengeStatus.EN_CURSO] }
    }
  });

  if (activeChallenge) {
    throw new Error('Ya tienes un reto activo con este piloto');
  }
};

export const resolveChallengeVote = async (challengeId: string, isRetador: boolean, ganadorId: string) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      retador: { select: { id: true, username: true, rango: true } },
      retado: { select: { id: true, username: true, rango: true } },
      vehiculo_retador: { select: { marca: true, modelo: true } },
      vehiculo_retado: { select: { marca: true, modelo: true } },
      location: true
    }
  });

  if (!challenge || (challenge.estado !== ChallengeStatus.ACEPTADO && challenge.estado !== ChallengeStatus.EN_CURSO)) {
    throw new Error('El reto no está en un estado válido para registrar el resultado');
  }

  if (ganadorId !== challenge.retador_id && ganadorId !== challenge.retado_id) {
    throw new Error('El ganador debe ser uno de los participantes del reto');
  }

  const updateData: any = {};
  if (isRetador) {
    updateData.ganador_retador_id = ganadorId;
  } else {
    updateData.ganador_retado_id = ganadorId;
  }

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      ...updateData,
      updated_at: new Date()
    },
    include: {
      retador: { select: { id: true, username: true, rango: true } },
      retado: { select: { id: true, username: true, rango: true } },
      vehiculo_retador: { select: { marca: true, modelo: true } },
      vehiculo_retado: { select: { marca: true, modelo: true } },
      location: true
    }
  });

  if (updated.ganador_retador_id && updated.ganador_retado_id) {
    if (updated.ganador_retador_id === updated.ganador_retado_id) {
      const isRetadorWinner = ganadorId === updated.retador_id;
      const perdedor_id = isRetadorWinner ? updated.retado_id : updated.retador_id;

      if (updated.retador && updated.retado && perdedor_id) {
        await processChallengeCompletion({
          challengeId,
          ganadorId,
          perdedorId: perdedor_id,
          retadorUsername: updated.retador.username,
          retadoUsername: updated.retado.username,
          isRetadorWinner
        });
      }

      const finalChallenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          retador: { select: { username: true, rango: true } },
          retado: { select: { username: true, rango: true } },
          vehiculo_retador: { select: { marca: true, modelo: true } },
          vehiculo_retado: { select: { marca: true, modelo: true } },
          location: true
        }
      });
      return { status: 'completed', challenge: finalChallenge };
    } else {
      return { status: 'conflict', challenge: updated, message: 'Conflicto de votos: Ambos pilotos deben elegir al mismo ganador.' };
    }
  }

  return { status: 'waiting', challenge: updated, message: 'Voto registrado. Esperando que el otro piloto registre el resultado.' };
};

import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

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

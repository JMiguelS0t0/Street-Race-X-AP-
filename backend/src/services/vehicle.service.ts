import prisma from '../config/prisma';
import { ChallengeStatus } from '../types/constants';

export const softDeleteVehicle = async (vehicleId: string, userId?: string) => {
  const activeChallenges = await prisma.challenge.count({
    where: {
      OR: [
        { vehiculo_retador_id: vehicleId },
        { vehiculo_retado_id: vehicleId }
      ],
      estado: { in: [ChallengeStatus.PENDIENTE, ChallengeStatus.ACEPTADO, ChallengeStatus.EN_CURSO] }
    }
  });

  if (activeChallenges > 0) {
    throw new Error('No se puede eliminar un vehículo con retos activos o pendientes');
  }

  const whereClause: any = { id: vehicleId };
  if (userId) {
    whereClause.user_id = userId;
  }

  const updatedResult = await prisma.vehicle.updateMany({
    where: whereClause,
    data: {
      activo: false,
      tipo_vehiculo: 'DELETED'
    }
  });

  if (updatedResult.count === 0) {
    throw new Error('Vehículo no encontrado o no tienes permiso para eliminarlo');
  }

  return true;
};

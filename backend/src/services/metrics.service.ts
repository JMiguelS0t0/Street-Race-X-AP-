import prisma from '../config/prisma';

/**
 * Servicio de métricas y estadísticas de uso para el panel de administración.
 * Provee datos consolidados sobre usuarios, retos, vehículos y actividad de la plataforma.
 */

export interface PlatformOverview {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPilots: number;
  totalAdmins: number;
  totalVehicles: number;
  totalChallenges: number;
  completedChallenges: number;
  pendingChallenges: number;
  activeChallenges: number;
  cancelledChallenges: number;
  totalLocations: number;
  totalCategories: number;
}

export interface UsersByRank {
  rango: string;
  count: number;
}

export interface ChallengesByStatus {
  estado: string;
  count: number;
}

export interface ChallengesByType {
  tipo_carrera: string;
  count: number;
}

export interface VehiclesByType {
  tipo_vehiculo: string;
  count: number;
}

export interface TopPilot {
  id: string;
  username: string;
  foto_perfil: string | null;
  rango: string | null;
  victorias: number | null;
  derrotas: number | null;
  winRate: number;
}

export interface RegistrationTrend {
  date: string;
  count: number;
}

export interface ChallengeTrend {
  date: string;
  count: number;
}

export interface RecentActivity {
  type: 'user_registered' | 'challenge_created' | 'challenge_completed' | 'rank_change';
  description: string;
  timestamp: Date;
  userId?: string;
  username?: string;
}

export interface LocationStats {
  id: string;
  nombre: string;
  tipo: string;
  challengeCount: number;
}

export interface CategoryStats {
  id: string;
  nombre: string;
  activo: boolean | null;
  userCount: number;
}

// ==================== SERVICE FUNCTIONS ====================

export const getPlatformOverview = async (): Promise<PlatformOverview> => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalPilots,
    totalAdmins,
    totalVehicles,
    totalChallenges,
    completedChallenges,
    pendingChallenges,
    activeChallenges,
    cancelledChallenges,
    totalLocations,
    totalCategories
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { estado: 'activo' } }),
    prisma.user.count({ where: { estado: 'inactivo' } }),
    prisma.user.count({ where: { rol: 'piloto' } }),
    prisma.user.count({ where: { rol: 'administrador' } }),
    prisma.vehicle.count({ where: { tipo_vehiculo: { not: 'DELETED' } } }),
    prisma.challenge.count(),
    prisma.challenge.count({ where: { estado: 'completado' } }),
    prisma.challenge.count({ where: { estado: 'pendiente' } }),
    prisma.challenge.count({ where: { estado: { in: ['aceptado', 'en_curso'] } } }),
    prisma.challenge.count({ where: { estado: { in: ['cancelado', 'rechazado'] } } }),
    (prisma as any).location.count(),
    prisma.category.count({ where: { activo: true } })
  ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalPilots,
    totalAdmins,
    totalVehicles,
    totalChallenges,
    completedChallenges,
    pendingChallenges,
    activeChallenges,
    cancelledChallenges,
    totalLocations,
    totalCategories
  };
};

export const getUsersByRank = async (): Promise<UsersByRank[]> => {
  const ranks = ['D', 'C', 'B', 'A', 'S'];
  const results = await Promise.all(
    ranks.map(async (rango) => ({
      rango,
      count: await prisma.user.count({ where: { rango, estado: 'activo', rol: 'piloto' } })
    }))
  );
  return results;
};

export const getChallengesByStatus = async (): Promise<ChallengesByStatus[]> => {
  const statuses = ['pendiente', 'aceptado', 'en_curso', 'completado', 'cancelado', 'rechazado'];
  const results = await Promise.all(
    statuses.map(async (estado) => ({
      estado,
      count: await prisma.challenge.count({ where: { estado } })
    }))
  );
  return results;
};

export const getChallengesByType = async (): Promise<ChallengesByType[]> => {
  const challenges = await prisma.challenge.groupBy({
    by: ['tipo_carrera'],
    _count: { id: true }
  });

  return challenges
    .filter(c => c.tipo_carrera !== null)
    .map(c => ({
      tipo_carrera: c.tipo_carrera as string,
      count: c._count.id
    }));
};

export const getVehiclesByType = async (): Promise<VehiclesByType[]> => {
  const vehicles = await prisma.vehicle.groupBy({
    by: ['tipo_vehiculo'],
    where: { tipo_vehiculo: { not: 'DELETED' } },
    _count: { id: true }
  });

  return vehicles.map(v => ({
    tipo_vehiculo: v.tipo_vehiculo,
    count: v._count.id
  }));
};

export const getTopPilots = async (limit: number = 10): Promise<TopPilot[]> => {
  const pilots = await prisma.user.findMany({
    where: { rol: 'piloto', estado: 'activo' },
    select: {
      id: true,
      username: true,
      foto_perfil: true,
      rango: true,
      victorias: true,
      derrotas: true
    },
    orderBy: [
      { victorias: 'desc' }
    ],
    take: limit
  });

  return pilots.map(p => {
    const totalRaces = (p.victorias || 0) + (p.derrotas || 0);
    return {
      ...p,
      winRate: totalRaces > 0 ? Math.round(((p.victorias || 0) / totalRaces) * 100) : 0
    };
  });
};

export const getRegistrationTrends = async (days: number = 30): Promise<RegistrationTrend[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: {
      created_at: { gte: startDate }
    },
    select: { created_at: true },
    orderBy: { created_at: 'asc' }
  });

  const trendMap = new Map<string, number>();

  // Initialize all dates in the range
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    trendMap.set(key, 0);
  }

  // Count registrations per day
  for (const user of users) {
    if (user.created_at) {
      const key = user.created_at.toISOString().split('T')[0];
      trendMap.set(key, (trendMap.get(key) || 0) + 1);
    }
  }

  return Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));
};

export const getChallengeTrends = async (days: number = 30): Promise<ChallengeTrend[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const challenges = await prisma.challenge.findMany({
    where: {
      created_at: { gte: startDate }
    },
    select: { created_at: true },
    orderBy: { created_at: 'asc' }
  });

  const trendMap = new Map<string, number>();

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    trendMap.set(key, 0);
  }

  for (const challenge of challenges) {
    if (challenge.created_at) {
      const key = challenge.created_at.toISOString().split('T')[0];
      trendMap.set(key, (trendMap.get(key) || 0) + 1);
    }
  }

  return Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));
};

export const getRecentActivity = async (limit: number = 20): Promise<RecentActivity[]> => {
  const activities: RecentActivity[] = [];

  // Recent user registrations
  const recentUsers = await prisma.user.findMany({
    select: { id: true, username: true, created_at: true },
    orderBy: { created_at: 'desc' },
    take: Math.ceil(limit / 3)
  });

  for (const user of recentUsers) {
    activities.push({
      type: 'user_registered',
      description: `${user.username} se registró en la plataforma`,
      timestamp: user.created_at || new Date(),
      userId: user.id,
      username: user.username
    });
  }

  // Recent challenges completed
  const recentCompleted = await prisma.challenge.findMany({
    where: { estado: 'completado' },
    include: {
      retador: { select: { id: true, username: true } },
      retado: { select: { id: true, username: true } },
      ganador: { select: { id: true, username: true } }
    },
    orderBy: { updated_at: 'desc' },
    take: Math.ceil(limit / 3)
  });

  for (const ch of recentCompleted) {
    activities.push({
      type: 'challenge_completed',
      description: `Reto completado: ${ch.retador?.username || '?'} vs ${ch.retado?.username || '?'} — Ganador: ${ch.ganador?.username || '?'}`,
      timestamp: ch.updated_at || new Date(),
      userId: ch.ganador?.id,
      username: ch.ganador?.username
    });
  }

  // Recent rank changes
  const recentRanks = await prisma.rankHistory.findMany({
    include: { user: { select: { id: true, username: true } } },
    orderBy: { fecha: 'desc' },
    take: Math.ceil(limit / 3)
  });

  for (const rh of recentRanks) {
    activities.push({
      type: 'rank_change',
      description: `${rh.user.username} ascendió de rango ${rh.rango_anterior} → ${rh.rango_nuevo}`,
      timestamp: rh.fecha || new Date(),
      userId: rh.user.id,
      username: rh.user.username
    });
  }

  // Sort by timestamp descending and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

export const getLocationStats = async (): Promise<LocationStats[]> => {
  const locations = await (prisma as any).location.findMany({
    include: {
      _count: {
        select: { challenges: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return locations.map((loc: any) => ({
    id: loc.id,
    nombre: loc.nombre,
    tipo: loc.tipo,
    challengeCount: loc._count.challenges
  }));
};

export const getCategoryStats = async (): Promise<CategoryStats[]> => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return categories.map(cat => ({
    id: cat.id,
    nombre: cat.nombre,
    activo: cat.activo,
    userCount: cat._count.users
  }));
};

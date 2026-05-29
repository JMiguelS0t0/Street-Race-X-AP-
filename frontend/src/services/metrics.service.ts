import api from './api';

// ==================== INTERFACES ====================

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

export interface TrendPoint {
  date: string;
  count: number;
}

export interface RecentActivity {
  type: 'user_registered' | 'challenge_created' | 'challenge_completed' | 'rank_change';
  description: string;
  timestamp: string;
  userId?: string;
  username?: string;
}

export interface LocationStat {
  id: string;
  nombre: string;
  tipo: string;
  challengeCount: number;
}

export interface CategoryStat {
  id: string;
  nombre: string;
  activo: boolean | null;
  userCount: number;
}

export interface DashboardData {
  overview: PlatformOverview;
  distributions: {
    usersByRank: UsersByRank[];
    challengesByStatus: ChallengesByStatus[];
    challengesByType: ChallengesByType[];
    vehiclesByType: VehiclesByType[];
  };
  trends: {
    registrations: TrendPoint[];
    challenges: TrendPoint[];
  };
  topPilots: TopPilot[];
  recentActivity: RecentActivity[];
  locationStats: LocationStat[];
  categoryStats: CategoryStat[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}

// ==================== API CALLS ====================

export const getMetricsDashboard = async (days: number = 30): Promise<DashboardResponse> => {
  const response = await api.get<DashboardResponse>(`/metrics/dashboard?days=${days}`);
  return response.data;
};

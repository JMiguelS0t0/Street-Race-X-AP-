import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getPlatformOverview,
  getUsersByRank,
  getChallengesByStatus,
  getChallengesByType,
  getVehiclesByType,
  getTopPilots,
  getRegistrationTrends,
  getChallengeTrends,
  getRecentActivity,
  getLocationStats,
  getCategoryStats
} from '../services/metrics.service';

/**
 * GET /metrics/overview
 * Resumen general de la plataforma: totales de usuarios, retos, vehículos, etc.
 */
export const overview = asyncHandler(async (req: Request, res: Response) => {
  const data = await getPlatformOverview();
  sendSuccess(res, data);
});

/**
 * GET /metrics/users-by-rank
 * Distribución de pilotos activos por rango (D, C, B, A, S).
 */
export const usersByRank = asyncHandler(async (req: Request, res: Response) => {
  const data = await getUsersByRank();
  sendSuccess(res, data);
});

/**
 * GET /metrics/challenges-by-status
 * Distribución de retos por estado (pendiente, aceptado, en_curso, completado, cancelado, rechazado).
 */
export const challengesByStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await getChallengesByStatus();
  sendSuccess(res, data);
});

/**
 * GET /metrics/challenges-by-type
 * Distribución de retos por tipo de carrera.
 */
export const challengesByType = asyncHandler(async (req: Request, res: Response) => {
  const data = await getChallengesByType();
  sendSuccess(res, data);
});

/**
 * GET /metrics/vehicles-by-type
 * Distribución de vehículos por tipo.
 */
export const vehiclesByType = asyncHandler(async (req: Request, res: Response) => {
  const data = await getVehiclesByType();
  sendSuccess(res, data);
});

/**
 * GET /metrics/top-pilots
 * Los mejores pilotos por victorias, con su win rate calculado.
 */
export const topPilots = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const data = await getTopPilots(limit);
  sendSuccess(res, data);
});

/**
 * GET /metrics/registration-trends
 * Tendencia de registros de usuarios en los últimos N días.
 */
export const registrationTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(parseInt(req.query.days as string) || 30, 365);
  const data = await getRegistrationTrends(days);
  sendSuccess(res, data);
});

/**
 * GET /metrics/challenge-trends
 * Tendencia de retos creados en los últimos N días.
 */
export const challengeTrends = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(parseInt(req.query.days as string) || 30, 365);
  const data = await getChallengeTrends(days);
  sendSuccess(res, data);
});

/**
 * GET /metrics/recent-activity
 * Feed de actividad reciente: registros, retos completados, cambios de rango.
 */
export const recentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const data = await getRecentActivity(limit);
  sendSuccess(res, data);
});

/**
 * GET /metrics/location-stats
 * Estadísticas de ubicaciones con cantidad de retos asociados.
 */
export const locationStats = asyncHandler(async (req: Request, res: Response) => {
  const data = await getLocationStats();
  sendSuccess(res, data);
});

/**
 * GET /metrics/category-stats
 * Estadísticas de categorías con cantidad de usuarios asociados.
 */
export const categoryStats = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCategoryStats();
  sendSuccess(res, data);
});

/**
 * GET /metrics/dashboard
 * Endpoint consolidado que retorna todas las métricas en una sola llamada.
 */
export const fullDashboard = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(parseInt(req.query.days as string) || 30, 365);

  const [
    platformOverview,
    rankDistribution,
    challengeStatusDistribution,
    challengeTypeDistribution,
    vehicleTypeDistribution,
    topPilotsData,
    registrationTrendsData,
    challengeTrendsData,
    recentActivityData,
    locationStatsData,
    categoryStatsData
  ] = await Promise.all([
    getPlatformOverview(),
    getUsersByRank(),
    getChallengesByStatus(),
    getChallengesByType(),
    getVehiclesByType(),
    getTopPilots(10),
    getRegistrationTrends(days),
    getChallengeTrends(days),
    getRecentActivity(20),
    getLocationStats(),
    getCategoryStats()
  ]);

  sendSuccess(res, {
    overview: platformOverview,
    distributions: {
      usersByRank: rankDistribution,
      challengesByStatus: challengeStatusDistribution,
      challengesByType: challengeTypeDistribution,
      vehiclesByType: vehicleTypeDistribution
    },
    trends: {
      registrations: registrationTrendsData,
      challenges: challengeTrendsData
    },
    topPilots: topPilotsData,
    recentActivity: recentActivityData,
    locationStats: locationStatsData,
    categoryStats: categoryStatsData
  });
});

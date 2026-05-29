import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';
import {
  overview,
  usersByRank,
  challengesByStatus,
  challengesByType,
  vehiclesByType,
  topPilots,
  registrationTrends,
  challengeTrends,
  recentActivity,
  locationStats,
  categoryStats,
  fullDashboard
} from '../controllers/metrics.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Métricas y estadísticas de uso de la plataforma (solo administradores)
 */

// Todas las rutas de métricas requieren autenticación + rol administrador
router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * /metrics/dashboard:
 *   get:
 *     summary: (Admin) Obtener todas las métricas consolidadas
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *         description: Período de días para las tendencias (máx. 365)
 *     responses:
 *       200:
 *         description: Dashboard completo con todas las métricas
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 */
router.get('/dashboard', fullDashboard);

/**
 * @swagger
 * /metrics/overview:
 *   get:
 *     summary: (Admin) Resumen general de la plataforma
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Totales de usuarios, retos, vehículos, ubicaciones y categorías
 */
router.get('/overview', overview);

/**
 * @swagger
 * /metrics/users-by-rank:
 *   get:
 *     summary: (Admin) Distribución de pilotos por rango
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de pilotos activos por cada rango (D, C, B, A, S)
 */
router.get('/users-by-rank', usersByRank);

/**
 * @swagger
 * /metrics/challenges-by-status:
 *   get:
 *     summary: (Admin) Distribución de retos por estado
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de retos por estado
 */
router.get('/challenges-by-status', challengesByStatus);

/**
 * @swagger
 * /metrics/challenges-by-type:
 *   get:
 *     summary: (Admin) Distribución de retos por tipo de carrera
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de retos agrupados por tipo de carrera
 */
router.get('/challenges-by-type', challengesByType);

/**
 * @swagger
 * /metrics/vehicles-by-type:
 *   get:
 *     summary: (Admin) Distribución de vehículos por tipo
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de vehículos agrupados por tipo
 */
router.get('/vehicles-by-type', vehiclesByType);

/**
 * @swagger
 * /metrics/top-pilots:
 *   get:
 *     summary: (Admin) Pilotos con más victorias y su win rate
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Cantidad de pilotos a retornar (máx. 50)
 *     responses:
 *       200:
 *         description: Lista de los mejores pilotos ordenados por victorias
 */
router.get('/top-pilots', topPilots);

/**
 * @swagger
 * /metrics/registration-trends:
 *   get:
 *     summary: (Admin) Tendencia de registros diarios
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *         description: Período de días (máx. 365)
 *     responses:
 *       200:
 *         description: Registros por día en el período solicitado
 */
router.get('/registration-trends', registrationTrends);

/**
 * @swagger
 * /metrics/challenge-trends:
 *   get:
 *     summary: (Admin) Tendencia de retos creados por día
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *         description: Período de días (máx. 365)
 *     responses:
 *       200:
 *         description: Retos creados por día en el período solicitado
 */
router.get('/challenge-trends', challengeTrends);

/**
 * @swagger
 * /metrics/recent-activity:
 *   get:
 *     summary: (Admin) Feed de actividad reciente
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Cantidad de actividades a retornar (máx. 100)
 *     responses:
 *       200:
 *         description: Lista de actividades recientes (registros, retos, cambios de rango)
 */
router.get('/recent-activity', recentActivity);

/**
 * @swagger
 * /metrics/location-stats:
 *   get:
 *     summary: (Admin) Estadísticas de ubicaciones
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ubicaciones con cantidad de retos asociados
 */
router.get('/location-stats', locationStats);

/**
 * @swagger
 * /metrics/category-stats:
 *   get:
 *     summary: (Admin) Estadísticas de categorías
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categorías con cantidad de usuarios asociados
 */
router.get('/category-stats', categoryStats);

export default router;

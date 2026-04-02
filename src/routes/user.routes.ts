import { Router } from 'express';
import { getPublicProfile, discoverPilots, updateProfile, getRankHistory, getTopRanking, listAllUsers, deleteMe } from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Perfiles de pilotos y descubrimiento de rivales
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: (Admin) Listar todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de usuarios
 */
router.get('/', authMiddleware, adminMiddleware, listAllUsers);

/**
 * @swagger
 * /users/ranking:
 *   get:
 *     summary: Obtener el Top 10 de mejores pilotos
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Ranking basado en rango y victorias
 */
router.get('/ranking', getTopRanking);

/**
 * @swagger
 * /users/discover:
 *   get:
 *     summary: Descubrir pilotos rivales
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de oponentes válidos
 */
router.get('/discover', authMiddleware, discoverPilots);

/**
 * @swagger
 * /users/me/rank-history:
 *   get:
 *     summary: Obtener mi historial de rangos
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de ascensos
 */
router.get('/me/rank-history', authMiddleware, getRankHistory);

/**
 * @swagger
 * /users/{id}/rank-history:
 *   get:
 *     summary: Obtener historial de rangos de otro piloto
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Historial del rival
 */
router.get('/:id/rank-history', authMiddleware, getRankHistory);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Actualizar mi perfil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foto_perfil: { type: string }
 *               zona_ciudad: { type: string }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.patch('/me', authMiddleware, updateProfile);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Eliminar permanentemente mi cuenta
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta eliminada
 */
router.delete('/me', authMiddleware, deleteMe);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener perfil público de un piloto
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos públicos
 */
router.get('/:id', authMiddleware, getPublicProfile);

export default router;

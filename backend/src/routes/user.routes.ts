import { Router } from 'express';
import { getPublicProfile, discoverPilots, updateProfile, getRankHistory, getTopRanking, deleteMe } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Perfiles de pilotos y descubrimiento de rivales
 */



/**
 * @swagger
 * /users/ranking:
 *   get:
 *     summary: Obtener el Top 10 de mejores pilotos
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Ranking basado en rango y victorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         description: Lista de oponentes válidos cercanos o del mismo rango
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         description: Listado de ascensos y descensos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rango_anterior: { type: string }
 *                       rango_nuevo: { type: string }
 *                       fecha: { type: string, format: date-time }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Historial del rival
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rango_anterior: { type: string }
 *                       rango_nuevo: { type: string }
 *                       fecha: { type: string, format: date-time }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *               foto_perfil: { type: string, example: "https://example.com/new.jpg" }
 *               zona_localidad: { type: string }
 *               zona_ciudad: { type: string }
 *               zona_estado: { type: string }
 *               zona_pais: { type: string }
 *               password: { type: string, description: "Nueva contraseña opcional" }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Perfil actualizado correctamente" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Cuenta eliminada permanentemente" }
 *       400:
 *         description: No se puede eliminar por tener retos activos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Datos públicos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', authMiddleware, getPublicProfile);



export default router;

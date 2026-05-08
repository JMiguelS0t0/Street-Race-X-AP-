import { Router } from 'express';
import { getPublicProfile, discoverPilots, updateProfile, getRankHistory, getTopRanking, listAllUsers, deleteMe, adminUpdateUser, adminDeleteUser } from '../controllers/user.controller';
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: rol
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista completa de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/User' }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total: { type: integer }
 *                         page: { type: integer }
 *                         limit: { type: integer }
 *                         totalPages: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
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

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: (Admin) Actualizar cualquier usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado: { type: string, enum: [activo, suspendido] }
 *               rol: { type: string, enum: [piloto, administrador] }
 *               rango: { type: string, enum: [D, C, B, A, S] }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Usuario actualizado" }
 *                 data: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id', authMiddleware, adminMiddleware, adminUpdateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: (Admin) Eliminar un usuario
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
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Usuario eliminado correctamente" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', authMiddleware, adminMiddleware, adminDeleteUser);

export default router;

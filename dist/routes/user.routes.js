"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
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
router.get('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, user_controller_1.listAllUsers);
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
router.get('/ranking', user_controller_1.getTopRanking);
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
router.get('/discover', auth_middleware_1.authMiddleware, user_controller_1.discoverPilots);
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
router.get('/me/rank-history', auth_middleware_1.authMiddleware, user_controller_1.getRankHistory);
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
router.get('/:id/rank-history', auth_middleware_1.authMiddleware, user_controller_1.getRankHistory);
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
router.patch('/me', auth_middleware_1.authMiddleware, user_controller_1.updateProfile);
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
router.delete('/me', auth_middleware_1.authMiddleware, user_controller_1.deleteMe);
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
router.get('/:id', auth_middleware_1.authMiddleware, user_controller_1.getPublicProfile);
exports.default = router;

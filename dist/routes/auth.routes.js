"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Registro, login y sesión activa
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo piloto
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, zona_ciudad, zona_estado, zona_pais]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               foto_perfil: { type: string }
 *               zona_localidad: { type: string }
 *               zona_ciudad: { type: string }
 *               zona_estado: { type: string }
 *               zona_pais: { type: string }
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 */
router.post('/register', auth_controller_1.register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post('/login', auth_controller_1.login);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', auth_controller_1.logout);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 */
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.getMe);
exports.default = router;

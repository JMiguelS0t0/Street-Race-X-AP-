import { Router } from 'express';
import { register, login, getMe, logout, refreshToken } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

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
 *               username: { type: string, example: "piloto123" }
 *               email: { type: string, format: email, example: "piloto@test.com" }
 *               password: { type: string, format: password, example: "Secret123!" }
 *               foto_perfil: { type: string, example: "https://example.com/foto.jpg" }
 *               zona_localidad: { type: string, example: "Centro" }
 *               zona_ciudad: { type: string, example: "Ciudad de México" }
 *               zona_estado: { type: string, example: "CDMX" }
 *               zona_pais: { type: string, example: "México" }
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Cuenta creada exitosamente" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     token: { type: string, example: "eyJhbG..." }
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Email ya registrado" }
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/register', register);

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
 *               email: { type: string, format: email, example: "piloto@test.com" }
 *               password: { type: string, format: password, example: "Secret123!" }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Login exitoso" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *                     token: { type: string, example: "eyJhbG..." }
 *       401:
 *         description: Credenciales inválidas o cuenta suspendida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Credenciales inválidas" }
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Sesión cerrada correctamente" }
 */
router.post('/logout', logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nuevo token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Token renovado" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string, example: "eyJhbG..." }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/refresh', refreshToken);

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
 *         description: Datos del usuario actual recuperados
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Usuario no encontrado" }
 */
router.get('/me', authMiddleware, getMe);

export default router;

import { Router } from 'express';
import { createChallenge, listChallenges, updateChallenge, getGlobalHistory, getChallengeDetail } from '../controllers/challenge.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: Sistema de retos y carreras
 */

/**
 * @swagger
 * /challenges/history:
 *   get:
 *     summary: Ver historial global de carreras
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Lista de carreras finalizadas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Challenge' }
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/history', getGlobalHistory);

router.use(authMiddleware);

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Listar mis retos (enviados y recibidos)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Retos por página
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [pendiente, aceptado, rechazado, cancelado, en_curso, completado] }
 *         description: Filtrar por estado del reto
 *       - in: query
 *         name: tipo_carrera
 *         schema: { type: string }
 *         description: Filtrar por tipo de carrera
 *     responses:
 *       200:
 *         description: Lista de retos paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     challenges:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Challenge' }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total: { type: integer }
 *                         page: { type: integer }
 *                         limit: { type: integer }
 *                         totalPages: { type: integer }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', listChallenges);

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Enviar un nuevo reto
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [retado_id, tipo_carrera]
 *             properties:
 *               retado_id: { type: string, format: uuid }
 *               tipo_carrera: { type: string, enum: [cuarto_milla, vueltas, derrape], example: "cuarto_milla" }
 *               ubicacion_acordada: { type: string, example: "Avenida Principal" }
 *               fecha_acordada: { type: string, format: date-time }
 *               notas: { type: string, example: "Llevar repuestos" }
 *     responses:
 *       201:
 *         description: Reto enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Reto enviado exitosamente" }
 *                 data: { $ref: '#/components/schemas/Challenge' }
 *       400:
 *         description: Validaciones fallidas (ej. mismo rango requerido, vehículo inactivo)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Solo puedes retar a pilotos de tu mismo rango" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', createChallenge);

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: Obtener términos detallados de un reto
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Detalle del reto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Challenge' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Reto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Reto no encontrado" }
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', getChallengeDetail);

/**
 * @swagger
 * /challenges/{id}:
 *   patch:
 *     summary: Actualizar estado de un reto o completarlo
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [aceptado, rechazado, cancelado, en_curso, completado] }
 *               ganador_id: { type: string, format: uuid, description: "Requerido solo si el estado es completado" }
 *     responses:
 *       200:
 *         description: Estado o resultado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Reto completado y estadísticas actualizadas" }
 *                 data: { $ref: '#/components/schemas/Challenge' }
 *       400:
 *         description: Transición de estado inválida
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: No tienes permisos para cambiar este estado
 *       404:
 *         description: Reto no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id', updateChallenge);

export default router;

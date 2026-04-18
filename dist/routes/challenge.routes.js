"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challenge_controller_1 = require("../controllers/challenge.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
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
 *         description: Lista de carreras finalizadas
 */
router.get('/history', challenge_controller_1.getGlobalHistory);
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Listar mis retos (enviados y recibidos)
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de retos
 */
router.get('/', challenge_controller_1.listChallenges);
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
 *               retado_id: { type: string }
 *               tipo_carrera: { type: string, enum: [cuarto_milla, vueltas, derrape] }
 *               ubicacion_acordada: { type: string }
 *               fecha_acordada: { type: string }
 *               notas: { type: string }
 *     responses:
 *       201:
 *         description: Reto enviado
 */
router.post('/', challenge_controller_1.createChallenge);
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle del reto
 */
router.get('/:id', challenge_controller_1.getChallengeDetail);
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
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [aceptado, rechazado, cancelado, en_curso, completado] }
 *               ganador_id: { type: string, description: "Requerido solo si el estado es completado" }
 *     responses:
 *       200:
 *         description: Estado o resultado actualizado
 */
router.patch('/:id', challenge_controller_1.updateChallenge);
exports.default = router;

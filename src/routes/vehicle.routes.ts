import { Router } from 'express';
import { listVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicleDetail } from '../controllers/vehicle.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Gestión de garaje (Máximo 3 vehículos por piloto)
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Listar todos mis vehículos
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mis vehículos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Vehicle' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', listVehicles);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Registrar un nuevo vehículo
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tipo_vehiculo]
 *             properties:
 *               tipo_vehiculo: { type: string, enum: [auto, moto, monopatin_electrico], example: "auto" }
 *               marca: { type: string, example: "Toyota" }
 *               modelo: { type: string, example: "Supra" }
 *               año: { type: integer, example: 1998 }
 *               color: { type: string, example: "Blanco" }
 *               placa: { type: string, example: "ABC-123" }
 *               foto: { type: string, example: "https://example.com/supra.jpg" }
 *               modificaciones: { type: string, example: "Turbo kit" }
 *               activo: { type: boolean, example: true, description: "Si es true, se desactivarán los demás vehículos automáticamente" }
 *     responses:
 *       201:
 *         description: Vehículo registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Vehículo registrado" }
 *                 data: { $ref: '#/components/schemas/Vehicle' }
 *       400:
 *         description: Límite de vehículos alcanzado (máximo 3)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Has alcanzado el límite máximo de 3 vehículos" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', createVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Obtener detalle técnico de un vehículo
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Ficha técnica detallada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Vehicle' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', getVehicleDetail);

/**
 * @swagger
 * /vehicles/{id}:
 *   patch:
 *     summary: Actualizar un vehículo
 *     tags: [Vehicles]
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
 *               marca: { type: string }
 *               modelo: { type: string }
 *               año: { type: integer }
 *               color: { type: string }
 *               placa: { type: string }
 *               foto: { type: string }
 *               modificaciones: { type: string }
 *               activo: { type: boolean, description: "Activar (true) u ocultar vehículo para la competencia" }
 *     responses:
 *       200:
 *         description: Datos actualizados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Vehículo actualizado y marcado como activo para competir" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Vehículo no encontrado o no pertenece al usuario
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id', updateVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Eliminar un vehículo
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Vehículo eliminado" }
 *       400:
 *         description: No se puede eliminar por tener retos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "No se puede eliminar un vehículo con retos activos o pendientes" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', deleteVehicle);

export default router;

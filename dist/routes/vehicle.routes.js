"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
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
 *         description: Lista de mis autos y motos
 */
router.get('/', vehicle_controller_1.listVehicles);
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
 *             required: [tipo_vehiculo, marca, modelo, año]
 *             properties:
 *               tipo_vehiculo: { type: string, enum: [auto, moto, monopatin_electrico] }
 *               marca: { type: string }
 *               modelo: { type: string }
 *               año: { type: integer }
 *               color: { type: string }
 *               placa: { type: string }
 *               foto: { type: string }
 *               modificaciones: { type: string }
 *     responses:
 *       201:
 *         description: Vehículo registrado
 */
router.post('/', vehicle_controller_1.createVehicle);
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ficha técnica detallada
 */
router.get('/:id', vehicle_controller_1.getVehicleDetail);
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
 *         schema: { type: string }
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
 *     responses:
 *       200:
 *         description: Datos actualizados
 */
router.patch('/:id', vehicle_controller_1.updateVehicle);
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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehículo eliminado
 */
router.delete('/:id', vehicle_controller_1.deleteVehicle);
/**
 * @swagger
 * /vehicles/{id}/activate:
 *   patch:
 *     summary: Activar un vehículo para competir
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vehículo activado
 */
router.patch('/:id/activate', vehicle_controller_1.activateVehicle);
exports.default = router;

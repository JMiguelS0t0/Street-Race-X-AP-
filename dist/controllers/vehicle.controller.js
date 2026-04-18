"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateVehicle = exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicleDetail = exports.listVehicles = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listVehicles = async (req, res) => {
    try {
        const vehicles = await prisma_1.default.vehicle.findMany({
            where: { user_id: req.user.id },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: vehicles });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar vehículos' });
    }
};
exports.listVehicles = listVehicles;
const getVehicleDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const vehicle = await prisma_1.default.vehicle.findUnique({
            where: { id, user_id: req.user.id }
        });
        if (!vehicle)
            return res.status(404).json({ success: false, error: 'Vehículo no encontrado' });
        res.json({ success: true, data: vehicle });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener detalle del vehículo' });
    }
};
exports.getVehicleDetail = getVehicleDetail;
const createVehicle = async (req, res) => {
    try {
        const { tipo_vehiculo, marca, modelo, año, color, placa, foto, modificaciones } = req.body;
        const vehicleCount = await prisma_1.default.vehicle.count({ where: { user_id: req.user.id } });
        if (vehicleCount >= 3) {
            return res.status(400).json({ success: false, error: 'Has alcanzado el límite máximo de 3 vehículos' });
        }
        const shouldBeActive = vehicleCount === 0;
        const vehicle = await prisma_1.default.vehicle.create({
            data: {
                user_id: req.user.id,
                tipo_vehiculo,
                marca,
                modelo,
                año,
                color,
                placa,
                foto,
                modificaciones,
                activo: shouldBeActive
            }
        });
        res.status(201).json({ success: true, message: 'Vehículo registrado', data: vehicle });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al registrar vehículo' });
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res) => {
    try {
        const id = req.params.id;
        const { marca, modelo, año, color, placa, foto, modificaciones } = req.body;
        const vehicle = await prisma_1.default.vehicle.update({
            where: { id, user_id: req.user.id },
            data: { marca, modelo, año, color, placa, foto, modificaciones }
        });
        res.json({ success: true, message: 'Vehículo actualizado', data: vehicle });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar vehículo' });
    }
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    try {
        const id = req.params.id;
        const activeChallenges = await prisma_1.default.challenge.count({
            where: {
                OR: [
                    { vehiculo_retador_id: id },
                    { vehiculo_retado_id: id }
                ],
                estado: { in: ['pendiente', 'aceptado', 'en_curso'] }
            }
        });
        if (activeChallenges > 0) {
            return res.status(400).json({
                success: false,
                error: 'No se puede eliminar un vehículo con retos activos o pendientes'
            });
        }
        await prisma_1.default.vehicle.delete({ where: { id, user_id: req.user.id } });
        res.json({ success: true, message: 'Vehículo eliminado' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar vehículo' });
    }
};
exports.deleteVehicle = deleteVehicle;
const activateVehicle = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.$transaction([
            prisma_1.default.vehicle.updateMany({
                where: { user_id: req.user.id },
                data: { activo: false }
            }),
            prisma_1.default.vehicle.update({
                where: { id, user_id: req.user.id },
                data: { activo: true }
            })
        ]);
        res.json({ success: true, message: 'Vehículo marcado como activo para competir' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al activar vehículo' });
    }
};
exports.activateVehicle = activateVehicle;

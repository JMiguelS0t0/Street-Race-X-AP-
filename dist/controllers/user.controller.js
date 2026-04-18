"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopRanking = exports.getRankHistory = exports.deleteMe = exports.updateProfile = exports.discoverPilots = exports.getPublicProfile = exports.listAllUsers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true, username: true, email: true, rango: true, estado: true, rol: true, created_at: true
            }
        });
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar usuarios' });
    }
};
exports.listAllUsers = listAllUsers;
const getPublicProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                foto_perfil: true,
                zona_ciudad: true,
                zona_estado: true,
                rango: true,
                victorias: true,
                derrotas: true,
                retos_consecutivos: true,
                categoria: { select: { nombre: true } },
                vehicles: {
                    where: { activo: true },
                    select: { id: true, tipo_vehiculo: true, marca: true, modelo: true, foto: true }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'Piloto no encontrado' });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener perfil público' });
    }
};
exports.getPublicProfile = getPublicProfile;
const discoverPilots = async (req, res) => {
    try {
        const me = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                rango: true,
                vehicles: {
                    where: { activo: true },
                    select: { tipo_vehiculo: true }
                }
            }
        });
        if (!me || me.vehicles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Debes tener un vehículo marcado como activo para descubrir rivales'
            });
        }
        const activeVehicleType = me.vehicles[0].tipo_vehiculo;
        const pilots = await prisma_1.default.user.findMany({
            where: {
                id: { not: me.id },
                rango: me.rango,
                estado: 'activo',
                vehicles: {
                    some: {
                        activo: true,
                        tipo_vehiculo: activeVehicleType
                    }
                }
            },
            select: {
                id: true,
                username: true,
                foto_perfil: true,
                rango: true,
                zona_ciudad: true,
                zona_estado: true,
                vehicles: {
                    where: { activo: true },
                    select: { id: true, tipo_vehiculo: true, marca: true, modelo: true, foto: true }
                }
            },
            take: 20
        });
        res.json({ success: true, data: { pilots } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error en descubrimiento de pilotos' });
    }
};
exports.discoverPilots = discoverPilots;
const updateProfile = async (req, res) => {
    try {
        const { foto_perfil, zona_localidad, zona_ciudad, zona_estado, zona_pais } = req.body;
        const user = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { foto_perfil, zona_localidad, zona_ciudad, zona_estado, zona_pais },
            select: { id: true, username: true, email: true, foto_perfil: true, zona_ciudad: true }
        });
        res.json({ success: true, message: 'Perfil actualizado', data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar perfil' });
    }
};
exports.updateProfile = updateProfile;
const deleteMe = async (req, res) => {
    try {
        await prisma_1.default.user.delete({ where: { id: req.user.id } });
        res.json({ success: true, message: 'Cuenta eliminada permanentemente' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar cuenta' });
    }
};
exports.deleteMe = deleteMe;
const getRankHistory = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const history = await prisma_1.default.rankHistory.findMany({
            where: { user_id: userId },
            orderBy: { fecha: 'desc' }
        });
        res.json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener historial de rangos' });
    }
};
exports.getRankHistory = getRankHistory;
const getTopRanking = async (req, res) => {
    try {
        const ranking = await prisma_1.default.user.findMany({
            where: { rol: 'piloto', estado: 'activo' },
            select: {
                id: true,
                username: true,
                foto_perfil: true,
                rango: true,
                victorias: true,
                derrotas: true
            },
            orderBy: [
                { rango: 'desc' },
                { victorias: 'desc' }
            ],
            take: 10
        });
        res.json({ success: true, data: ranking });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener ranking' });
    }
};
exports.getTopRanking = getTopRanking;

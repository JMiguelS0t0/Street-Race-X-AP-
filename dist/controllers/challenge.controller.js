"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalHistory = exports.updateChallenge = exports.getChallengeDetail = exports.listChallenges = exports.createChallenge = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getNextRank = (currentRank) => {
    const ranks = ['D', 'C', 'B', 'A', 'S'];
    const currentIndex = ranks.indexOf(currentRank);
    if (currentIndex === -1 || currentIndex === ranks.length - 1)
        return currentRank;
    return ranks[currentIndex + 1];
};
const createChallenge = async (req, res) => {
    try {
        const { retado_id, tipo_carrera, ubicacion_acordada, fecha_acordada, notas } = req.body;
        const retador_id = req.user.id;
        if (retador_id === retado_id) {
            return res.status(400).json({ success: false, error: 'No puedes retarte a ti mismo' });
        }
        const retador = await prisma_1.default.user.findUnique({
            where: { id: retador_id },
            include: { vehicles: { where: { activo: true } } }
        });
        const retado = await prisma_1.default.user.findUnique({
            where: { id: retado_id },
            include: { vehicles: { where: { activo: true } } }
        });
        if (!retador || retador.vehicles.length === 0) {
            return res.status(400).json({ success: false, error: 'Debes tener un vehículo activo para retar' });
        }
        if (!retado || retado.vehicles.length === 0) {
            return res.status(400).json({ success: false, error: 'El piloto retado no tiene un vehículo activo' });
        }
        if (retador.rango !== retado.rango) {
            return res.status(400).json({ success: false, error: 'Solo puedes retar a pilotos de tu mismo rango' });
        }
        if (retador.vehicles[0].tipo_vehiculo !== retado.vehicles[0].tipo_vehiculo) {
            return res.status(400).json({ success: false, error: 'Los vehículos activos deben ser del mismo tipo (ej: Auto vs Auto)' });
        }
        const challenge = await prisma_1.default.challenge.create({
            data: {
                retador_id,
                retado_id,
                vehiculo_retador_id: retador.vehicles[0].id,
                vehiculo_retado_id: retado.vehicles[0].id,
                tipo_carrera,
                ubicacion_acordada,
                fecha_acordada: fecha_acordada ? new Date(fecha_acordada) : null,
                notas,
                estado: 'pendiente'
            }
        });
        await prisma_1.default.notification.create({
            data: {
                user_id: retado_id,
                tipo: 'reto_recibido',
                mensaje: `${retador.username} te ha enviado un reto de ${tipo_carrera}`,
                referencia_id: challenge.id
            }
        });
        res.status(201).json({ success: true, message: 'Reto enviado exitosamente', data: challenge });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al crear reto', details: [error.message] });
    }
};
exports.createChallenge = createChallenge;
const listChallenges = async (req, res) => {
    try {
        const challenges = await prisma_1.default.challenge.findMany({
            where: {
                OR: [{ retador_id: req.user.id }, { retado_id: req.user.id }]
            },
            include: {
                retador: { select: { username: true, rango: true } },
                retado: { select: { username: true, rango: true } },
                vehiculo_retador: { select: { marca: true, modelo: true } },
                vehiculo_retado: { select: { marca: true, modelo: true } }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: challenges });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar retos' });
    }
};
exports.listChallenges = listChallenges;
const getChallengeDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const challenge = await prisma_1.default.challenge.findUnique({
            where: { id },
            include: {
                retador: { select: { username: true, rango: true } },
                retado: { select: { username: true, rango: true } },
                vehiculo_retador: true,
                vehiculo_retado: true
            }
        });
        if (!challenge)
            return res.status(404).json({ success: false, error: 'Reto no encontrado' });
        res.json({ success: true, data: challenge });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener detalle del reto' });
    }
};
exports.getChallengeDetail = getChallengeDetail;
const updateChallenge = async (req, res) => {
    try {
        const id = req.params.id;
        const { estado, ganador_id } = req.body;
        const ALLOWED_STATES = ['aceptado', 'rechazado', 'cancelado', 'en_curso', 'completado'];
        if (!estado || !ALLOWED_STATES.includes(estado)) {
            return res.status(400).json({
                success: false,
                error: `El campo 'estado' es requerido y debe ser uno de: ${ALLOWED_STATES.join(', ')}`
            });
        }
        const challenge = await prisma_1.default.challenge.findUnique({
            where: { id },
            include: {
                retador: { select: { id: true, username: true, rango: true } },
                retado: { select: { id: true, username: true, rango: true } }
            }
        });
        if (!challenge)
            return res.status(404).json({ success: false, error: 'Reto no encontrado' });
        const userId = req.user.id;
        const isRetador = challenge.retador_id === userId;
        const isRetado = challenge.retado_id === userId;
        if (estado === 'aceptado' || estado === 'rechazado') {
            if (!isRetado) {
                return res.status(403).json({ success: false, error: 'Solo el retado puede responder a este reto' });
            }
            if (challenge.estado !== 'pendiente') {
                return res.status(400).json({ success: false, error: 'Solo se puede aceptar o rechazar un reto pendiente' });
            }
        }
        if (estado === 'cancelado') {
            if (!isRetador) {
                return res.status(403).json({ success: false, error: 'Solo el retador puede cancelar este reto' });
            }
        }
        if (estado === 'en_curso') {
            if (!isRetador && !isRetado) {
                return res.status(403).json({ success: false, error: 'Solo los participantes del reto pueden cambiar su estado' });
            }
            if (challenge.estado !== 'aceptado') {
                return res.status(400).json({ success: false, error: 'El reto debe estar aceptado para pasar a en_curso' });
            }
        }
        if (estado === 'completado') {
            if (!isRetador && !isRetado) {
                return res.status(403).json({ success: false, error: 'Solo los participantes del reto pueden completarlo' });
            }
            if (challenge.estado !== 'aceptado' && challenge.estado !== 'en_curso') {
                return res.status(400).json({ success: false, error: 'El reto no está en un estado válido para completarse' });
            }
            if (!ganador_id) {
                return res.status(400).json({ success: false, error: 'Se requiere ganador_id para completar el reto' });
            }
            if (ganador_id !== challenge.retador_id && ganador_id !== challenge.retado_id) {
                return res.status(400).json({ success: false, error: 'El ganador debe ser uno de los participantes del reto' });
            }
            const isRetadorWinner = ganador_id === challenge.retador_id;
            const perdedor_id = isRetadorWinner ? challenge.retado_id : challenge.retador_id;
            await prisma_1.default.$transaction(async (tx) => {
                await tx.challenge.update({
                    where: { id },
                    data: { estado: 'completado', ganador_id, updated_at: new Date() }
                });
                const winner = await tx.user.findUnique({ where: { id: ganador_id } });
                if (winner) {
                    const newConsecutiveWins = (winner.retos_consecutivos || 0) + 1;
                    let newRank = winner.rango || 'D';
                    if (newConsecutiveWins >= 2 && newRank !== 'S') {
                        const oldRank = newRank;
                        newRank = getNextRank(newRank);
                        await tx.rankHistory.create({
                            data: { user_id: ganador_id, rango_anterior: oldRank, rango_nuevo: newRank }
                        });
                        await tx.notification.create({
                            data: { user_id: ganador_id, tipo: 'rango_subido', mensaje: `¡Felicidades! Has ascendido al rango ${newRank}` }
                        });
                        await tx.user.update({
                            where: { id: ganador_id },
                            data: {
                                victorias: { increment: 1 },
                                rango: newRank,
                                retos_consecutivos: 0
                            }
                        });
                    }
                    else {
                        await tx.user.update({
                            where: { id: ganador_id },
                            data: {
                                victorias: { increment: 1 },
                                retos_consecutivos: newConsecutiveWins
                            }
                        });
                    }
                }
                await tx.user.update({
                    where: { id: perdedor_id },
                    data: {
                        derrotas: { increment: 1 },
                        retos_consecutivos: 0
                    }
                });
                await tx.notification.create({
                    data: { user_id: ganador_id, tipo: 'resultado', mensaje: `Has ganado el reto contra ${isRetadorWinner ? challenge.retado.username : challenge.retador.username}` }
                });
                await tx.notification.create({
                    data: { user_id: perdedor_id, tipo: 'resultado', mensaje: `Has perdido el reto contra ${isRetadorWinner ? challenge.retador.username : challenge.retado.username}` }
                });
            });
            return res.json({ success: true, message: 'Reto completado y estadísticas actualizadas' });
        }
        const updated = await prisma_1.default.challenge.update({
            where: { id },
            data: { estado, updated_at: new Date() }
        });
        const notificationMap = {
            aceptado: { userId: challenge.retador_id, tipo: 'reto_aceptado', mensaje: 'El reto ha sido aceptado' },
            rechazado: { userId: challenge.retador_id, tipo: 'reto_rechazado', mensaje: 'El reto ha sido rechazado' },
            cancelado: { userId: challenge.retado_id, tipo: 'reto_cancelado', mensaje: 'El reto ha sido cancelado' },
            en_curso: { userId: isRetador ? challenge.retado_id : challenge.retador_id, tipo: 'reto_en_curso', mensaje: 'El reto ha comenzado' }
        };
        const notif = notificationMap[estado];
        if (notif) {
            await prisma_1.default.notification.create({
                data: { user_id: notif.userId, tipo: notif.tipo, mensaje: notif.mensaje }
            });
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar reto' });
    }
};
exports.updateChallenge = updateChallenge;
const getGlobalHistory = async (req, res) => {
    try {
        const history = await prisma_1.default.challenge.findMany({
            where: { estado: 'completado' },
            include: {
                retador: { select: { username: true, rango: true } },
                retado: { select: { username: true, rango: true } },
                ganador: { select: { username: true } }
            },
            orderBy: { updated_at: 'desc' },
            take: 50
        });
        res.json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener historial global' });
    }
};
exports.getGlobalHistory = getGlobalHistory;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.listNotifications = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listNotifications = async (req, res) => {
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: { user_id: req.user.id },
            orderBy: { created_at: 'desc' },
            take: 50
        });
        res.json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar notificaciones' });
    }
};
exports.listNotifications = listNotifications;
const markAsRead = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.notification.update({
            where: { id, user_id: req.user.id },
            data: { leida: true }
        });
        res.json({ success: true, message: 'Notificación marcada como leída' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar notificación' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        await prisma_1.default.notification.updateMany({
            where: { user_id: req.user.id, leida: false },
            data: { leida: true }
        });
        res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar notificaciones' });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.default.notification.delete({
            where: { id, user_id: req.user.id }
        });
        res.json({ success: true, message: 'Notificación eliminada' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar notificación' });
    }
};
exports.deleteNotification = deleteNotification;

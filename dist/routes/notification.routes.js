"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestión de alertas y avisos
 */
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Listar mis notificaciones
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas
 */
router.get('/', notification_controller_1.listNotifications);
/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Marcar todas como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones actualizadas
 */
router.patch('/read-all', notification_controller_1.markAllAsRead);
/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notificación actualizada
 */
router.patch('/:id/read', notification_controller_1.markAsRead);
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notificación eliminada
 */
router.delete('/:id', notification_controller_1.deleteNotification);
exports.default = router;

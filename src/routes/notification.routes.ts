import { Router } from 'express';
import { listNotifications, updateNotification, bulkUpdateNotifications, deleteNotification } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

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
router.get('/', listNotifications);

/**
 * @swagger
 * /notifications:
 *   patch:
 *     summary: Actualizar estado de notificaciones en lote
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [leida]
 *             properties:
 *               leida: { type: boolean }
 *     responses:
 *       200:
 *         description: Notificaciones actualizadas
 */
router.patch('/', bulkUpdateNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Actualizar estado de una notificación
 *     tags: [Notifications]
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
 *             required: [leida]
 *             properties:
 *               leida: { type: boolean }
 *     responses:
 *       200:
 *         description: Notificación actualizada
 */
router.patch('/:id', updateNotification);

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
router.delete('/:id', deleteNotification);

export default router;

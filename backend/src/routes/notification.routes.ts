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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Notificaciones por página
 *     responses:
 *       200:
 *         description: Lista de notificaciones paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Notification' }
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
 *               leida: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Notificaciones actualizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notificaciones actualizadas" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/', bulkUpdateNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Actualizar estado de una notificación específica
 *     tags: [Notifications]
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
 *             required: [leida]
 *             properties:
 *               leida: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Notificación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Notification' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notificación eliminada" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', deleteNotification);

export default router;

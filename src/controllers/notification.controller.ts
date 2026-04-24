import { Response } from 'express';
import prisma from '../config/prisma';

export const listNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
      take: 50
    });
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al listar notificaciones' });
  }
};

export const updateNotification = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const { leida } = req.body;
    
    const existingNotification = await prisma.notification.findFirst({
      where: { id, user_id: req.user.id }
    });

    if (!existingNotification) {
      return res.status(404).json({ success: false, error: 'Notificación no encontrada o no tienes permiso para actualizarla' });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { leida }
    });
    res.json({ success: true, message: 'Notificación actualizada', data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar notificación' });
  }
};

export const bulkUpdateNotifications = async (req: any, res: Response) => {
  try {
    const { leida } = req.body;
    
    if (leida === true) {
      await prisma.notification.updateMany({
        where: { user_id: req.user.id, leida: false },
        data: { leida: true }
      });
      return res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    }
    
    res.json({ success: true, message: 'No se realizaron cambios' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar notificaciones en lote' });
  }
};

export const deleteNotification = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    const deletedResult = await prisma.notification.deleteMany({
      where: { id, user_id: req.user.id }
    });

    if (deletedResult.count === 0) {
      return res.status(404).json({ success: false, error: 'Notificación no encontrada o no tienes permiso para eliminarla' });
    }
    res.json({ success: true, message: 'Notificación eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar notificación' });
  }
};

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

export const markAsRead = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.notification.update({
      where: { id, user_id: req.user.id },
      data: { leida: true }
    });
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar notificación' });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { user_id: req.user.id, leida: false },
      data: { leida: true }
    });
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar notificaciones' });
  }
};

export const deleteNotification = async (req: any, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.notification.delete({
      where: { id, user_id: req.user.id }
    });
    res.json({ success: true, message: 'Notificación eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar notificación' });
  }
};

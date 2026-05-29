import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const notifications = await prisma.notification.findMany({
    where: { user_id: authReq.user.id },
    orderBy: { created_at: 'desc' },
    take: 50
  });
  sendSuccess(res, notifications);
});

export const updateNotification = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id as string;
  const { leida } = req.body;
  
  const existingNotification = await prisma.notification.findFirst({
    where: { id, user_id: authReq.user.id }
  });

  if (!existingNotification) {
    return sendError(res, 'Notificación no encontrada o no tienes permiso para actualizarla', 404);
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: { leida }
  });
  sendSuccess(res, notification, 'Notificación actualizada');
});

export const bulkUpdateNotifications = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { leida } = req.body;
  
  if (leida === true) {
    await prisma.notification.updateMany({
      where: { user_id: authReq.user.id, leida: false },
      data: { leida: true }
    });
    return sendSuccess(res, undefined, 'Todas las notificaciones marcadas como leídas');
  }
  
  sendSuccess(res, undefined, 'No se realizaron cambios');
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const id = req.params.id as string;
  const deletedResult = await prisma.notification.deleteMany({
    where: { id, user_id: authReq.user.id }
  });

  if (deletedResult.count === 0) {
    return sendError(res, 'Notificación no encontrada o no tienes permiso para eliminarla', 404);
  }
  sendSuccess(res, undefined, 'Notificación eliminada');
});

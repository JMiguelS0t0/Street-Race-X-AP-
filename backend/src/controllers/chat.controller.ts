import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { asyncHandler } from '../utils/asyncHandler';

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user.id;

  const rooms = await prisma.chatRoom.findMany({
    where: {
      members: {
        some: { user_id: userId }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              foto_perfil: true,
              rango: true
            }
          }
        }
      },
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }
    },
    orderBy: { updated_at: 'desc' }
  });

  sendSuccess(res, rooms);
});

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const chatRoomId = req.params.roomId as string;
  const userId = authReq.user.id;

  const membership = await prisma.chatMember.findUnique({
    where: {
      chat_room_id_user_id: {
        chat_room_id: chatRoomId,
        user_id: userId
      }
    }
  });

  if (!membership) {
    return sendError(res, 'No tienes permiso para ver los mensajes de esta sala o la sala no existe', 403);
  }

  const { page, limit, skip } = parsePagination(req, { limit: 50 });

  const messages = await prisma.message.findMany({
    where: { chat_room_id: chatRoomId },
    orderBy: { created_at: 'desc' },
    skip,
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          foto_perfil: true,
          rango: true
        }
      }
    }
  });

  const total = await prisma.message.count({ where: { chat_room_id: chatRoomId } });

  const formattedMessages = messages.reverse();

  sendSuccess(res, {
    messages: formattedMessages,
    pagination: buildPaginationMeta(total, page, limit)
  });
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const { is_grupo, nombre, recipientId, userIds } = req.body;
  const userId = authReq.user.id;

  if (is_grupo) {
    
    if (!nombre || nombre.trim() === '') {
      return sendError(res, 'El nombre del grupo es requerido', 400);
    }

    const uniqueUserIds = Array.from(new Set([userId, ...(userIds || [])]));

    const usersExist = await prisma.user.count({
      where: { id: { in: uniqueUserIds } }
    });

    if (usersExist !== uniqueUserIds.length) {
      return sendError(res, 'Uno o más de los usuarios añadidos no existen', 400);
    }

    const room = await prisma.$transaction(async (tx: any) => {
      const chatRoom = await tx.chatRoom.create({
        data: {
          nombre,
          is_grupo: true
        }
      });

      await tx.chatMember.createMany({
        data: uniqueUserIds.map(uid => ({
          chat_room_id: chatRoom.id,
          user_id: uid
        }))
      });

      return chatRoom;
    });

    return sendSuccess(res, room, 'Sala de chat grupal creada', 201);

  } else {
    
    if (!recipientId) {
      return sendError(res, 'El recipientId es requerido para un chat privado', 400);
    }

    if (userId === recipientId) {
      return sendError(res, 'No puedes crear un chat privado contigo mismo', 400);
    }

    const recipientExists = await prisma.user.findUnique({
      where: { id: recipientId }
    });

    if (!recipientExists) {
      return sendNotFound(res, 'Destinatario');
    }

    const existingRooms = await prisma.chatRoom.findMany({
      where: {
        is_grupo: false,
        members: {
          some: { user_id: userId }
        }
      },
      include: {
        members: true
      }
    });

    const existingPrivateRoom = existingRooms.find((r: any) => 
      r.members.some((m: any) => m.user_id === recipientId)
    );

    if (existingPrivateRoom) {
      return sendSuccess(res, existingPrivateRoom, 'Sala de chat privada existente');
    }

    const room = await prisma.$transaction(async (tx: any) => {
      const chatRoom = await tx.chatRoom.create({
        data: {
          is_grupo: false
        }
      });

      await tx.chatMember.createMany({
        data: [
          { chat_room_id: chatRoom.id, user_id: userId },
          { chat_room_id: chatRoom.id, user_id: recipientId }
        ]
      });

      return chatRoom;
    });

    return sendSuccess(res, room, 'Sala de chat privada creada', 201);
  }
});

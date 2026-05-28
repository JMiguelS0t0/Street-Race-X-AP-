import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;
  const username = socket.data.user.username;

  socket.on('join_room', async ({ chatRoomId }: { chatRoomId: string }) => {
    try {
      
      const membership = await prisma.chatMember.findUnique({
        where: {
          chat_room_id_user_id: {
            chat_room_id: chatRoomId,
            user_id: userId
          }
        }
      });

      if (!membership) {
        socket.emit('error_message', { message: 'No tienes permiso para unirte a esta sala de chat' });
        return;
      }

      socket.join(chatRoomId);
      console.log(`[socket-chat]: ${username} se unió a la sala ${chatRoomId}`);
    } catch (error) {
      socket.emit('error_message', { message: 'Error al unirse a la sala' });
    }
  });

  socket.on('leave_room', ({ chatRoomId }: { chatRoomId: string }) => {
    socket.leave(chatRoomId);
    console.log(`[socket-chat]: ${username} salió de la sala ${chatRoomId}`);
  });

  socket.on('send_message', async ({ chatRoomId, contenido }: { chatRoomId: string; contenido: string }) => {
    if (!contenido || contenido.trim() === '') {
      return;
    }

    try {
      
      const membership = await prisma.chatMember.findUnique({
        where: {
          chat_room_id_user_id: {
            chat_room_id: chatRoomId,
            user_id: userId
          }
        }
      });

      if (!membership) {
        socket.emit('error_message', { message: 'No tienes permiso para enviar mensajes en esta sala' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          chat_room_id: chatRoomId,
          sender_id: userId,
          contenido
        },
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

      io.to(chatRoomId).emit('new_message', message);

      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: { updated_at: new Date() }
      });

    } catch (error: any) {
      console.error(`[socket-chat] Error al enviar mensaje:`, error);
      socket.emit('error_message', { message: 'Error al enviar mensaje' });
    }
  });

  socket.on('typing', ({ chatRoomId, isTyping }: { chatRoomId: string; isTyping: boolean }) => {
    socket.to(chatRoomId).emit('user_typing', {
      chatRoomId,
      userId,
      username,
      isTyping
    });
  });
};

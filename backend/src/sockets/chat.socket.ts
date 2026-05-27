import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;
  const username = socket.data.user.username;

  // Join a specific chat room
  socket.on('join_room', async ({ chatRoomId }: { chatRoomId: string }) => {
    try {
      // Validate that the user is a member of the room
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

  // Leave a specific chat room
  socket.on('leave_room', ({ chatRoomId }: { chatRoomId: string }) => {
    socket.leave(chatRoomId);
    console.log(`[socket-chat]: ${username} salió de la sala ${chatRoomId}`);
  });

  // Send a message within a room
  socket.on('send_message', async ({ chatRoomId, contenido }: { chatRoomId: string; contenido: string }) => {
    if (!contenido || contenido.trim() === '') {
      return;
    }

    try {
      // Validate membership
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

      // Save message to DB
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

      // Broadcast message to everyone in the room (including sender)
      io.to(chatRoomId).emit('new_message', message);

      // Update room updated_at timestamp to bubble it to the top of list
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: { updated_at: new Date() }
      });

    } catch (error: any) {
      console.error(`[socket-chat] Error al enviar mensaje:`, error);
      socket.emit('error_message', { message: 'Error al enviar mensaje' });
    }
  });

  // Typing status
  socket.on('typing', ({ chatRoomId, isTyping }: { chatRoomId: string; isTyping: boolean }) => {
    socket.to(chatRoomId).emit('user_typing', {
      chatRoomId,
      userId,
      username,
      isTyping
    });
  });
};

import { Server, Socket } from 'socket.io';
import prisma from '../config/prisma';

export const registerLocationHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;
  const username = socket.data.user.username;

  // Join a challenge location sharing room
  socket.on('join_location_sharing', async ({ challengeId }: { challengeId: string }) => {
    try {
      // Validate challenge and user participation
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        socket.emit('location_error', { message: 'El reto especificado no existe' });
        return;
      }

      const isParticipant = challenge.retador_id === userId || challenge.retado_id === userId;
      if (!isParticipant) {
        socket.emit('location_error', { message: 'No tienes permiso para rastrear ubicación en este reto' });
        return;
      }

      const roomName = `location_challenge_${challengeId}`;
      socket.join(roomName);
      console.log(`[location-socket]: ${username} comenzó a compartir ubicación en la sala ${roomName}`);
      
      // Notify the other client in the room
      socket.to(roomName).emit('player_joined_location', { userId, username });
    } catch (error) {
      socket.emit('location_error', { message: 'Error al iniciar seguimiento de ubicación' });
    }
  });

  // Share live coordinates
  socket.on('update_location', ({
    challengeId,
    lat,
    lng,
    speed,
    heading
  }: {
    challengeId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
  }) => {
    const roomName = `location_challenge_${challengeId}`;
    
    // Broadcast location directly to the other participants in the room
    socket.to(roomName).emit('location_updated', {
      userId,
      username,
      lat,
      lng,
      speed,
      heading,
      timestamp: new Date()
    });
  });

  // Leave a challenge location sharing room
  socket.on('leave_location_sharing', ({ challengeId }: { challengeId: string }) => {
    const roomName = `location_challenge_${challengeId}`;
    socket.leave(roomName);
    console.log(`[location-socket]: ${username} dejó de compartir ubicación en la sala ${roomName}`);
    
    socket.to(roomName).emit('player_left_location', { userId, username });
  });
};

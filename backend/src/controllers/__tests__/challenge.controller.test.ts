import { Request, Response } from 'express';
import { createChallenge, updateChallenge } from '../challenge.controller';
import { prismaMock } from '../../utils/prisma-mock';
import { AuthenticatedRequest } from '../../types';

describe('Challenge Controller', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
      json: jsonMock,
    };
    req = {
      user: { id: 'user123', rol: 'piloto' } as any,
      body: { action: 'unirse' },
      params: { id: 'challenge123' }
    };
    jest.clearAllMocks();
  });

  describe('createChallenge', () => {
    it('Regla 4: should return 400 if retador has no active vehicles', async () => {
      req.body = { retador_id: 'user123', tipo_carrera: 'Circuito' };
      
      // Mock the pilot having no vehicles
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user123',
        vehicles: []
      });

      const nextMock = jest.fn();
      await createChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('tener un vehículo activo')
      }));
    });

    it('Regla 12: should return 400 if retador_id and retado_id are the same', async () => {
      req.body = { retador_id: 'user123', retado_id: 'user123', tipo_carrera: 'Circuito' };
      
      const nextMock = jest.fn();
      await createChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('No puedes retar al mismo piloto')
      }));
    });

    it('Regla 6: should return 400 if pilots have different ranks', async () => {
      req.body = { retador_id: 'user1', retado_id: 'user2' };
      
      (prismaMock.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'user1', rango: 'A', vehicles: [{ id: 'v1', tipo_vehiculo: 'Auto' }] })
        .mockResolvedValueOnce({ id: 'user2', rango: 'B', vehicles: [{ id: 'v2', tipo_vehiculo: 'Auto' }] });

      const nextMock = jest.fn();
      await createChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('del mismo rango')
      }));
    });

    it('Regla 7: should return 400 if pilots have different active vehicle types', async () => {
      req.body = { retador_id: 'user1', retado_id: 'user2' };
      
      (prismaMock.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'user1', rango: 'A', vehicles: [{ id: 'v1', tipo_vehiculo: 'Auto' }] })
        .mockResolvedValueOnce({ id: 'user2', rango: 'A', vehicles: [{ id: 'v2', tipo_vehiculo: 'Moto' }] });

      const nextMock = jest.fn();
      await createChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('del mismo tipo')
      }));
    });
    it('Regla 8: should return 400 if an active challenge already exists between the two pilots', async () => {
      req.body = { retador_id: 'user1', retado_id: 'user2' };
      
      // Mock findUnique to pass the rank and vehicle checks
      (prismaMock.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'user1', rango: 'A', vehicles: [{ id: 'v1', tipo_vehiculo: 'Auto' }] })
        .mockResolvedValueOnce({ id: 'user2', rango: 'A', vehicles: [{ id: 'v2', tipo_vehiculo: 'Auto' }] });
        
      // Mock findFirst for existing active challenge (this logic is missing in the controller currently)
      (prismaMock.challenge.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'existingChallenge123' });

      const nextMock = jest.fn();
      await createChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('Ya tienes un reto activo con este piloto')
      }));
    });
  });

  describe('updateChallenge (Unirse)', () => {
    it('Regla 4: should return 400 if user trying to join has no active vehicles', async () => {
      // Mock finding the challenge
      (prismaMock.challenge.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'challenge123',
        retador_id: 'otherUser',
        retado_id: null,
      });

      // Mock the joining user having no vehicles
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user123',
        vehicles: []
      });

      const nextMock = jest.fn();
      await updateChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('Debes tener un vehículo activo')
      }));
    });
  });

  describe('updateChallenge (estado)', () => {
    it('Regla 9: should allow rejecting challenge without consequences', async () => {
      req.params = { id: 'challenge123' };
      req.body = { estado: 'rechazado' };
      req.user = { id: 'retadoId', rol: 'piloto' } as any;

      (prismaMock.challenge.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'challenge123',
        retador_id: 'retadorId',
        retado_id: 'retadoId',
        estado: 'pendiente'
      });

      const nextMock = jest.fn();
      await updateChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should just update the challenge state, no penalty
      expect(prismaMock.challenge.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ estado: 'rechazado' })
      }));
      expect(statusMock).not.toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('Regla 10: should return 400 for invalid states', async () => {
      req.params = { id: 'challenge123' };
      req.body = { estado: 'estado_invalido' };

      const nextMock = jest.fn();
      await updateChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('El campo \'estado\' es requerido y debe ser uno de')
      }));
    });

    it('Regla 11: should handle completion and require both parties or return conflict', async () => {
      req.params = { id: 'challenge123' };
      req.body = { estado: 'completado', ganador_id: 'retadorId' };
      req.user = { id: 'retadorId', rol: 'piloto' } as any;

      (prismaMock.challenge.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'challenge123',
        retador_id: 'retadorId',
        retado_id: 'retadoId',
        estado: 'aceptado'
      });

      (prismaMock.challenge.update as jest.Mock).mockResolvedValueOnce({
        id: 'challenge123',
        retador_id: 'retadorId',
        retado_id: 'retadoId',
        ganador_retador_id: 'retadorId',
        ganador_retado_id: 'retadoId' // Conflicting vote
      });

      const nextMock = jest.fn();
      await updateChallenge(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should not throw 400, but return conflict message in success wrapper
      expect(statusMock).not.toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('Conflicto de votos')
      }));
    });
  });
});

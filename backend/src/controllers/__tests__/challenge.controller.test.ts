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
});

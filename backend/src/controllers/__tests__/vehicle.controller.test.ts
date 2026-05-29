import { Request, Response } from 'express';
import { createVehicle } from '../vehicle.controller';
import { prismaMock } from '../../utils/prisma-mock';
import { AuthenticatedRequest } from '../../types';

describe('Vehicle Controller', () => {
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
      body: { tipo_vehiculo: 'Auto', marca: 'Nissan', modelo: 'Skyline', año: 1999, activo: true }
    };
    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    it('Regla 2: should return 400 if user already has 3 vehicles', async () => {
      (prismaMock.vehicle.count as jest.Mock).mockResolvedValueOnce(3);

      const nextMock = jest.fn();
      await createVehicle(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('límite máximo de 3 vehículos')
      }));
    });

    it('Regla 3: should set other vehicles to activo: false if new vehicle is active', async () => {
      (prismaMock.vehicle.count as jest.Mock).mockResolvedValueOnce(1); // Not at limit

      // Mock $transaction to immediately invoke the callback
      (prismaMock.$transaction as jest.Mock).mockImplementationOnce(async (callback) => {
        return await callback(prismaMock);
      });

      const nextMock = jest.fn();
      await createVehicle(req as Request, res as Response, nextMock);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify that updateMany was called to set others to false
      expect(prismaMock.vehicle.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user123' },
        data: { activo: false }
      });

      // Verify that create was called with activo: true
      expect(prismaMock.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          activo: true
        })
      });
    });
  });
});

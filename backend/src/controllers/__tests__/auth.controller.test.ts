import { Request, Response } from 'express';
import { login, register } from '../auth.controller';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

jest.mock('../../utils/auth', () => ({
  generateToken: jest.fn(),
  excludePassword: jest.fn(),
}));

describe('Auth Controller', () => {
  let req: Partial<Request>;
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
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      
      req = { body: { email: 'test@example.com' } }; 

      await login(req as Request, res as Response, jest.fn());

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Email y password son requeridos'
      }));
    });
    });
  });

  describe('register', () => {
    it('Regla 1: should return 400 if email or username already exists', async () => {
      req = {
        body: { username: 'testuser', email: 'test@example.com', password: 'password123' }
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'existingId', email: 'test@example.com' });

      await register(req as Request, res as Response, jest.fn());

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Email ya registrado'
      }));
    });

    it('Regla 5: should start a new user automatically in Rank D', async () => {
      req = {
        body: { username: 'newuser', email: 'new@example.com', password: 'password123' }
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'newId',
        username: 'newuser',
        email: 'new@example.com',
        rango: 'D'
      });

      await register(req as Request, res as Response, jest.fn());

      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          rango: 'D'
        })
      }));
    });
  });
});

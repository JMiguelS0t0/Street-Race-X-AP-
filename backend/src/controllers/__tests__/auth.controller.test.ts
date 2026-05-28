import { Request, Response } from 'express';
import { login } from '../auth.controller';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
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

import { Response } from 'express';

export const sendSuccess = (res: Response, data?: any, message?: string, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  });
};

export const sendError = (res: Response, error: string, statusCode = 500, details?: string[]) => {
  res.status(statusCode).json({
    success: false,
    error,
    statusCode,
    ...(details?.length && { details })
  });
};

export const sendNotFound = (res: Response, entity: string) => {
  sendError(res, `${entity} no encontrado/a`, 404);
};

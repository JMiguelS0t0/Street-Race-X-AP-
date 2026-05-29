import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const listLocations = asyncHandler(async (req: Request, res: Response) => {
  const locations = await prisma.location.findMany({
    orderBy: { nombre: 'asc' }
  });
  sendSuccess(res, locations);
});

export const createLocation = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, tipo, descripcion, ruta } = req.body;

  if (!nombre || !tipo || !ruta) {
    return sendError(res, 'Nombre, tipo y ruta son requeridos', 400);
  }

  const existing = await prisma.location.findUnique({
    where: { nombre }
  });

  if (existing) {
    return sendError(res, 'Ya existe una localización con este nombre', 400);
  }

  const location = await prisma.location.create({
    data: {
      nombre,
      tipo,
      descripcion,
      ruta
    }
  });

  sendSuccess(res, location, 'Localización creada exitosamente', 201);
});

export const deleteLocation = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const location = await prisma.location.findUnique({
    where: { id }
  });

  if (!location) {
    return sendNotFound(res, 'Localización');
  }

  await prisma.location.delete({
    where: { id }
  });

  sendSuccess(res, undefined, 'Localización eliminada exitosamente');
});

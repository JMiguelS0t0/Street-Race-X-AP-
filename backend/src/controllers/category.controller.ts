import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendNotFound } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });
  sendSuccess(res, categories);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body;
  const category = await prisma.category.create({
    data: { nombre, descripcion }
  });
  sendSuccess(res, category, 'Categoría creada', 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { nombre, descripcion, activo } = req.body;
  const category = await prisma.category.update({
    where: { id },
    data: { nombre, descripcion, activo }
  });
  sendSuccess(res, category, 'Categoría actualizada');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  // Eliminación lógica para no romper referencias históricas en usuarios o retos
  await prisma.category.update({
    where: { id },
    data: { activo: false }
  });
  sendSuccess(res, undefined, 'Categoría desactivada');
});

export const getCategoryDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const category = await prisma.category.findUnique({
    where: { id }
  });
  
  if (!category) {
    return sendNotFound(res, 'Categoría');
  }
  
  sendSuccess(res, category);
});

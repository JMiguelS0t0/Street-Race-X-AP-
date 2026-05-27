import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  });
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body;
  const category = await prisma.category.create({
    data: { nombre, descripcion }
  });
  res.status(201).json({ success: true, message: 'Categoría creada', data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { nombre, descripcion, activo } = req.body;
  const category = await prisma.category.update({
    where: { id },
    data: { nombre, descripcion, activo }
  });
  res.json({ success: true, message: 'Categoría actualizada', data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  // Eliminación lógica para no romper referencias históricas en usuarios o retos
  await prisma.category.update({
    where: { id },
    data: { activo: false }
  });
  res.json({ success: true, message: 'Categoría desactivada' });
});

export const getCategoryDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const category = await prisma.category.findUnique({
    where: { id }
  });
  
  if (!category) {
    return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
  }
  
  res.json({ success: true, data: category });
});


import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
    sendSuccess(res, categories);
  } catch (error: any) {
    sendError(res, 'Error al listar categorías');
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;
    const category = await prisma.category.create({
      data: { nombre, descripcion }
    });
    sendSuccess(res, category, 'Categoría creada', 201);
  } catch (error: any) {
    sendError(res, 'Error al crear categoría');
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nombre, descripcion, activo } = req.body;
    const category = await prisma.category.update({
      where: { id },
      data: { nombre, descripcion, activo }
    });
    sendSuccess(res, category, 'Categoría actualizada');
  } catch (error: any) {
    sendError(res, 'Error al actualizar categoría');
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Eliminación lógica para no romper referencias históricas en usuarios o retos
    await prisma.category.update({
      where: { id },
      data: { activo: false }
    });
    sendSuccess(res, undefined, 'Categoría desactivada');
  } catch (error: any) {
    sendError(res, 'Error al eliminar categoría');
  }
};

export const getCategoryDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return sendNotFound(res, 'Categoría');
    }
    
    sendSuccess(res, category);
  } catch (error: any) {
    sendError(res, 'Error al obtener categoría');
  }
};


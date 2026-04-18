import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al listar categorías' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;
    const category = await prisma.category.create({
      data: { nombre, descripcion }
    });
    res.status(201).json({ success: true, message: 'Categoría creada', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al crear categoría' });
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
    res.json({ success: true, message: 'Categoría actualizada', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al actualizar categoría' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Logical delete or check for existing users
    await prisma.category.update({
      where: { id },
      data: { activo: false }
    });
    res.json({ success: true, message: 'Categoría desactivada' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al eliminar categoría' });
  }
};

export const getCategoryDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    }
    
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener categoría' });
  }
};

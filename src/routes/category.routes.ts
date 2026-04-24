import { Router } from 'express';
import { listCategories, createCategory, updateCategory, deleteCategory, getCategoryDetail } from '../controllers/category.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías de competencia
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar todas las categorías activas
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', listCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener detalle de una categoría
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle de la categoría
 */
router.get('/:id', getCategoryDetail);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: (Admin) Crear una nueva categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.post('/', authMiddleware, adminMiddleware, createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: (Admin) Actualizar una categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               activo: { type: boolean }
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.patch('/:id', authMiddleware, adminMiddleware, updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: (Admin) Desactivar una categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Categoría desactivada
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;

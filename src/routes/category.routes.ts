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
 *         description: Lista de categorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Category' }
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         schema: { type: string, format: uuid }
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Detalle de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Category' }
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 error: { type: string, example: "Categoría no encontrada" }
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *               nombre: { type: string, example: "Pro Mod" }
 *               descripcion: { type: string, example: "Categoría para autos altamente modificados" }
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Categoría creada" }
 *                 data: { $ref: '#/components/schemas/Category' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string, example: "Super Street" }
 *               descripcion: { type: string, example: "Nueva descripción" }
 *               activo: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Categoría actualizada" }
 *                 data: { $ref: '#/components/schemas/Category' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría desactivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Categoría desactivada" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Acceso denegado (no es admin)
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;

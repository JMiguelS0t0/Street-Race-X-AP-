"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
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
router.get('/', category_controller_1.listCategories);
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
router.post('/', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, category_controller_1.createCategory);
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
router.patch('/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, category_controller_1.updateCategory);
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
router.delete('/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, category_controller_1.deleteCategory);
exports.default = router;

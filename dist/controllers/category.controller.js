"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listCategories = async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            where: { activo: true },
            orderBy: { nombre: 'asc' }
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al listar categorías' });
    }
};
exports.listCategories = listCategories;
const createCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const category = await prisma_1.default.category.create({
            data: { nombre, descripcion }
        });
        res.status(201).json({ success: true, message: 'Categoría creada', data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al crear categoría' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, descripcion, activo } = req.body;
        const category = await prisma_1.default.category.update({
            where: { id },
            data: { nombre, descripcion, activo }
        });
        res.json({ success: true, message: 'Categoría actualizada', data: category });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al actualizar categoría' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        // Logical delete or check for existing users
        await prisma_1.default.category.update({
            where: { id },
            data: { activo: false }
        });
        res.json({ success: true, message: 'Categoría desactivada' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al eliminar categoría' });
    }
};
exports.deleteCategory = deleteCategory;

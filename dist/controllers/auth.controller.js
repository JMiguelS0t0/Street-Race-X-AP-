"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const register = async (req, res) => {
    try {
        const { username, email, password, foto_perfil, zona_localidad, zona_ciudad, zona_estado, zona_pais } = req.body;
        const existingUser = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: existingUser.email === email ? 'Email ya registrado' : 'Username ya registrado',
                statusCode: 400
            });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                username,
                email,
                password_hash: hashedPassword,
                foto_perfil,
                zona_localidad,
                zona_ciudad,
                zona_estado,
                zona_pais,
                rango: 'D',
                rol: 'piloto',
                estado: 'activo'
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password_hash: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: { user: userWithoutPassword, token }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al registrar usuario',
            statusCode: 500,
            details: [error.message]
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password_hash))) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                statusCode: 401
            });
        }
        if (user.estado === 'suspendido') {
            return res.status(401).json({
                success: false,
                error: 'Cuenta suspendida',
                statusCode: 401
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password_hash: _, ...userWithoutPassword } = user;
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: { user: userWithoutPassword, token }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al iniciar sesión',
            statusCode: 500,
            details: [error.message]
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Sesión cerrada correctamente'
    });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { categoria: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }
        const { password_hash: _, ...userWithoutPassword } = user;
        res.status(200).json({ success: true, data: userWithoutPassword });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Error al obtener perfil' });
    }
};
exports.getMe = getMe;

import { Router } from 'express';
import { adminUpdateUser, adminDeleteUser, listAllChallenges, deleteChallenge, updateChallengeAdmin, listAllVehicles, deleteVehicle as adminDeleteVehicle } from '../controllers/admin.controller';
import { listAllUsers as listAllUsersFromUserController } from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Panel de Administración Global
 */

// --- USERS ---
router.get('/users', listAllUsersFromUserController);
router.patch('/users/:id', adminUpdateUser);
router.delete('/users/:id', adminDeleteUser);

// --- CHALLENGES ---
router.get('/challenges', listAllChallenges);
router.patch('/challenges/:id', updateChallengeAdmin);
router.delete('/challenges/:id', deleteChallenge);

// --- VEHICLES ---
router.get('/vehicles', listAllVehicles);
router.delete('/vehicles/:id', adminDeleteVehicle);

export default router;

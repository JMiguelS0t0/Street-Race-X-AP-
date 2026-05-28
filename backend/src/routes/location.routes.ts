import { Router } from 'express';
import { listLocations, createLocation, deleteLocation } from '../controllers/location.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listLocations);
router.post('/', adminMiddleware, createLocation);
router.delete('/:id', adminMiddleware, deleteLocation);

export default router;

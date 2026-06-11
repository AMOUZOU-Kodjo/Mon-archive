import { Router } from 'express';
import { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia, getStats } from '../controllers/mediaController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Routes publiques (GET)
router.get('/', getAllMedia);
router.get('/stats', getStats);
router.get('/:id', getMediaById);

// Routes protegees (POST, PUT, DELETE)
router.post('/', protect, createMedia);
router.put('/:id', protect, updateMedia);
router.delete('/:id', protect, deleteMedia);

export default router;

import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/:mediaId', getComments);
router.post('/:mediaId', createComment);
router.delete('/:id', protect, deleteComment);

export default router;

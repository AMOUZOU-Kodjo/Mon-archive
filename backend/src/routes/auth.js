import { Router } from 'express';
import { login, logout, checkAuth } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login — Connexion
router.post('/login', login);

// POST /api/auth/logout — Déconnexion
router.post('/logout', protect, logout);

// GET /api/auth/me — Vérifier si l'utilisateur est connecté
router.get('/me', protect, checkAuth);

export default router;

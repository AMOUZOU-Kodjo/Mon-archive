import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import uploadRoutes from './routes/upload.js';
import commentRoutes from './routes/comments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Middleware globaux ===
app.use(helmet()); // Sécurisation des en-têtes HTTP
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://mon-archive.vercel.app'
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev')); // Logs des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parsing des cookies

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/medias', mediaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);

// === Route de santé (health check) ===
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// === Gestion des erreurs 404 ===
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée.' });
});

// === Gestion globale des erreurs ===
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

// === Démarrage du serveur ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📋 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

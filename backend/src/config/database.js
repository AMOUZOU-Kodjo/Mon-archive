import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Connexion à PostgreSQL via Neon.tech (Serverless)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Nécessaire pour Neon.tech
  },
});

// Test de connexion initial
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connecté à PostgreSQL (Neon.tech)'))
  .catch((err) => console.error('❌ Erreur de connexion PostgreSQL:', err.message));

export default pool;

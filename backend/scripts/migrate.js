/**
 * Script de migration pour créer la table 'medias' sur Neon.tech.
 * Utilisation : node scripts/migrate.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const { Pool } = pkg;

const SQL_MIGRATION = `
CREATE TABLE IF NOT EXISTS medias (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'document')),
  titre VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  url TEXT NOT NULL,
  url_thumbnail TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  categorie VARCHAR(100) DEFAULT '',
  taille_fichier BIGINT DEFAULT 0,
  nom_fichier VARCHAR(255) DEFAULT '',
  pages INTEGER DEFAULT 0,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medias_type ON medias(type);
CREATE INDEX IF NOT EXISTS idx_medias_date ON medias(date_creation DESC);
`;

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL manquant dans .env');
    process.exit(1);
  }

  console.log('🔌 Connexion à Neon.tech...');

  // On retire sslmode de l'URL pour utiliser l'option SSL de pg
  const cleanUrl = databaseUrl.replace(/\?sslmode=require/, '');
  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const test = await pool.query('SELECT version()');
    console.log(`✅ Connecté : ${test.rows[0].version.split(',')[0]}`);

    console.log('📦 Création de la table medias...');
    await pool.query(SQL_MIGRATION);
    console.log('✅ Table "medias" créée avec succès !');

    const check = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'medias' ORDER BY ordinal_position"
    );
    console.log('\n📋 Structure :');
    console.table(check.rows.map(c => ({ Colonne: c.column_name, Type: c.data_type })));
  } catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔒 Terminé.');
  }
}

migrate();

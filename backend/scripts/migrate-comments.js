import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const { Pool } = pkg;

const SQL_MIGRATION = `
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL REFERENCES medias(id) ON DELETE CASCADE,
  auteur VARCHAR(100) NOT NULL DEFAULT 'Anonyme',
  contenu TEXT NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_media_id ON comments(media_id);
CREATE INDEX IF NOT EXISTS idx_comments_date ON comments(date_creation DESC);
`;

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL manquant dans .env');
    process.exit(1);
  }

  console.log('Connexion a Neon.tech...');

  const cleanUrl = databaseUrl.replace(/\?sslmode=require/, '');
  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const test = await pool.query('SELECT version()');
    console.log(`Connecte : ${test.rows[0].version.split(',')[0]}`);

    console.log('Creation de la table comments...');
    await pool.query(SQL_MIGRATION);
    console.log('Table "comments" creee avec succes !');

    const check = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'comments' ORDER BY ordinal_position"
    );
    console.log('\nStructure :');
    console.table(check.rows.map(c => ({ Colonne: c.column_name, Type: c.data_type })));
  } catch (error) {
    console.error('Erreur :', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\nTermine.');
  }
}

migrate();

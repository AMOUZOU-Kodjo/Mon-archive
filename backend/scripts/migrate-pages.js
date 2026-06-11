import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const { Pool } = pkg;

const SQL_MIGRATION = `
ALTER TABLE medias ADD COLUMN IF NOT EXISTS pages INTEGER DEFAULT 0;
`;

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL manquant dans .env');
    process.exit(1);
  }

  const cleanUrl = databaseUrl.replace(/\?sslmode=require/, '');
  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await pool.query('SELECT version()');
    console.log('Connexion OK');

    console.log('Ajout de la colonne pages...');
    await pool.query(SQL_MIGRATION);
    console.log('Colonne "pages" ajoutée avec succès !');

    const check = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'medias' ORDER BY ordinal_position"
    );
    console.log('\nStructure :');
    console.table(check.rows.map(c => ({ Colonne: c.column_name, Type: c.data_type })));
  } catch (error) {
    console.error('Erreur :', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\nTerminé.');
  }
}

migrate();

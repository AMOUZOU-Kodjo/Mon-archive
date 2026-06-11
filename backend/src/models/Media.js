import pool from '../config/database.js';

/**
 * Script SQL d'initialisation de la table 'medias'.
 * À exécuter une fois sur Neon.tech (via leur console SQL ou un migration runner).
 *
 * ```sql
 * CREATE TABLE IF NOT EXISTS medias (
 *   id SERIAL PRIMARY KEY,
 *   type VARCHAR(20) NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'document')),
 *   titre VARCHAR(255) NOT NULL,
 *   description TEXT DEFAULT '',
 *   url TEXT NOT NULL,
 *   url_thumbnail TEXT DEFAULT '',
 *   tags TEXT DEFAULT '',         -- Tags séparés par des virgules
 *   categorie VARCHAR(100) DEFAULT '',
 *   taille_fichier BIGINT DEFAULT 0,
 *   nom_fichier VARCHAR(255) DEFAULT '',
 *   pages INTEGER DEFAULT 0,
 *   date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Index pour améliorer les performances des recherches
 * CREATE INDEX IF NOT EXISTS idx_medias_type ON medias(type);
 * CREATE INDEX IF NOT EXISTS idx_medias_tags ON medias USING gin(to_tsvector('french', tags));
 * CREATE INDEX IF NOT EXISTS idx_medias_titre ON medias USING gin(to_tsvector('french', titre));
 * ```
 */
export default pool;

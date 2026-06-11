import pool from '../config/database.js';

/**
 * Récupère tous les médias (avec filtre optionnel par type/catégorie).
 */
export async function getAllMedia(req, res) {
  try {
    const { type, tag, search, categorie, page, limit } = req.query;

    // No pagination params → return all (Dashboard, Accueil)
    if (!page && !limit) {
      let query = 'SELECT * FROM medias WHERE 1=1';
      const params = [];
      if (type) { params.push(type); query += ` AND type = $${params.length}`; }
      if (tag) { params.push(`%${tag}%`); query += ` AND tags ILIKE $${params.length}`; }
      if (search) { params.push(`%${search}%`); query += ` AND (titre ILIKE $${params.length} OR description ILIKE $${params.length})`; }
      if (categorie) { params.push(categorie); query += ` AND LOWER(categorie) = LOWER($${params.length})`; }
      query += ' ORDER BY date_creation DESC';
      const result = await pool.query(query, params);
      return res.status(200).json({ data: result.rows, pagination: null });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (type) {
      params.push(type);
      whereClause += ` AND type = $${params.length}`;
    }
    if (tag) {
      params.push(`%${tag}%`);
      whereClause += ` AND tags ILIKE $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (titre ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    if (categorie) {
      params.push(categorie);
      whereClause += ` AND LOWER(categorie) = LOWER($${params.length})`;
    }

    // Total count for pagination
    const countResult = await pool.query(`SELECT COUNT(*) FROM medias ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginated results
    const dataResult = await pool.query(
      `SELECT * FROM medias ${whereClause} ORDER BY date_creation DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      data: dataResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

/**
 * Récupère un média par son ID.
 */
export async function getMediaById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM medias WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Média non trouvé.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

/**
 * Ajoute un nouveau média (lien Cloudinary + métadonnées).
 */
export async function createMedia(req, res) {
  try {
    const { type, titre, description, url, url_thumbnail, tags, categorie, taille_fichier, pages } = req.body;

    if (!type || !titre || !url) {
      return res.status(400).json({ message: 'Type, titre et URL sont requis.' });
    }

    const result = await pool.query(
      `INSERT INTO medias (type, titre, description, url, url_thumbnail, tags, categorie, taille_fichier, pages)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [type, titre, description || '', url, url_thumbnail || '', tags || '', categorie || '', taille_fichier || 0, pages || 0]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du média:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

/**
 * Modifie un média.
 */
export async function updateMedia(req, res) {
  try {
    const { id } = req.params;
    const { titre, description, url, url_thumbnail, tags, categorie, pages } = req.body;

    const existing = await pool.query('SELECT * FROM medias WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Média non trouvé.' });
    }

    const result = await pool.query(
      `UPDATE medias SET
        titre = COALESCE($1, titre),
        description = COALESCE($2, description),
        url = COALESCE($3, url),
        url_thumbnail = COALESCE($4, url_thumbnail),
        tags = COALESCE($5, tags),
        categorie = COALESCE($6, categorie),
        pages = COALESCE($7, pages),
        date_modification = NOW()
       WHERE id = $8
       RETURNING *`,
      [titre, description, url, url_thumbnail, tags, categorie, pages ?? null, id]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la modification du média:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

/**
 * Supprime un média.
 */
export async function deleteMedia(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM medias WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Média non trouvé.' });
    }

    return res.status(200).json({ message: 'Média supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

/**
 * Retourne les statistiques pour le dashboard.
 */
export async function getStats(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE type = 'photo') AS photos,
        COUNT(*) FILTER (WHERE type = 'video') AS videos,
        COUNT(*) FILTER (WHERE type = 'audio') AS audios,
        COUNT(*) FILTER (WHERE type = 'document') AS documents,
        COUNT(*) AS total
      FROM medias
    `);
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

import pool from '../config/database.js';

export async function getComments(req, res) {
  try {
    const { mediaId } = req.params;
    const result = await pool.query(
      'SELECT * FROM comments WHERE media_id = $1 ORDER BY date_creation DESC',
      [mediaId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la recuperation des commentaires:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

export async function createComment(req, res) {
  try {
    const { mediaId } = req.params;
    const { auteur, contenu } = req.body;

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: 'Le contenu du commentaire est requis.' });
    }

    const result = await pool.query(
      'INSERT INTO comments (media_id, auteur, contenu) VALUES ($1, $2, $3) RETURNING *',
      [mediaId, (auteur || 'Anonyme').trim(), contenu.trim()]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la creation du commentaire:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM comments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Commentaire non trouve.' });
    }

    return res.status(200).json({ message: 'Commentaire supprime avec succes.' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}

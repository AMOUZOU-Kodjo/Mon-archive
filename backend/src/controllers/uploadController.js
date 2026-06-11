import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import pool from '../config/database.js';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 600000,
});

// Stockage en mémoire pour Multer (les fichiers sont ensuite envoyés à Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 Mo max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté.'), false);
    }
  },
});

// Middleware pour un fichier unique
export const uploadSingle = upload.single('fichier');

/**
 * Upload d'un fichier vers Cloudinary et enregistrement en base de données.
 */
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }

    const { originalname, size, mimetype, buffer } = req.file;
    const { titre, description, tags, categorie, pages } = req.body;

    // Déterminer le dossier Cloudinary et le resource_type
    let folder = 'mon-archive';
    let resourceType = 'auto';
    if (mimetype.startsWith('image/')) { folder += '/photos'; resourceType = 'image'; }
    else if (mimetype.startsWith('video/')) { folder += '/videos'; resourceType = 'video'; }
    else if (mimetype.startsWith('audio/')) { folder += '/audios'; resourceType = 'video'; }
    else if (mimetype === 'application/pdf') { folder += '/documents'; resourceType = 'image'; }

    // Upload du fichier vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          public_id: `${Date.now()}-${originalname.split('.')[0]}`,
          timeout: 600000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    const url = result.secure_url;

    // Générer une miniature pour les photos
    let url_thumbnail = '';
    if (mimetype.startsWith('image/')) {
      url_thumbnail = cloudinary.url(result.public_id, {
        width: 400,
        height: 400,
        crop: 'fill',
        format: 'webp',
      });
    }

    // Déterminer le type de média
    let type = 'document';
    if (mimetype.startsWith('image/')) type = 'photo';
    else if (mimetype.startsWith('video/')) type = 'video';
    else if (mimetype.startsWith('audio/')) type = 'audio';

    // Enregistrer dans la base de données
    const dbResult = await pool.query(
      `INSERT INTO medias (type, titre, description, url, url_thumbnail, tags, categorie, taille_fichier, nom_fichier, pages)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [type, titre || originalname, description || '', url, url_thumbnail, tags || '', categorie || '', size, originalname, pages || 0]
    );

    return res.status(201).json({
      message: 'Fichier uploadé avec succès.',
      media: dbResult.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    const detail = error.message || error.http_code || '';
    return res.status(500).json({ message: `Erreur lors de l'upload : ${detail}` });
  }
}

/**
 * Importe un PDF externe (URL) vers Cloudinary et crée l'entrée en base.
 * POST /api/upload/import-pdf  { url, titre, description, tags, categorie, pages }
 */
export async function importPdfByUrl(req, res) {
  try {
    const { url, titre, description, tags, categorie, pages } = req.body;

    if (!url || !titre) {
      return res.status(400).json({ message: 'URL et titre sont requis.' });
    }

    // Upload du PDF externe vers Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        url,
        {
          folder: 'mon-archive/documents',
          resource_type: 'image',
          public_id: `import-${Date.now()}`,
          timeout: 600000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const cloudinaryUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    // Vignette page 1
    const url_thumbnail = cloudinary.url(publicId, {
      width: 800,
      height: 300,
      crop: 'fill',
      format: 'jpg',
      quality: 80,
      page: 1,
    });

    // Enregistrer en base
    const dbResult = await pool.query(
      `INSERT INTO medias (type, titre, description, url, url_thumbnail, tags, categorie, taille_fichier, nom_fichier, pages)
       VALUES ('document', $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [titre, description || '', cloudinaryUrl, url_thumbnail, tags || '', categorie || '', uploadResult.bytes || 0, `import-${Date.now()}.pdf`, pages || 0]
    );

    return res.status(201).json({
      message: 'PDF importé avec succès.',
      media: dbResult.rows[0],
    });
  } catch (error) {
    console.error('Erreur lors de l\'import du PDF:', error);
    const detail = error.message || error.http_code || '';
    return res.status(500).json({ message: `Erreur lors de l'import du PDF : ${detail}` });
  }
}

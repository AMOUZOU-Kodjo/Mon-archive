import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import pool from '../config/database.js';

const MAX_CLOUDINARY_BYTES = 10 * 1024 * 1024; // 10 Mo — limite Cloudinary Free

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 600000,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_CLOUDINARY_BYTES },
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

export const uploadSingle = upload.single('fichier');

function makePublicId(prefix, originalname) {
  const ext = path.extname(originalname);
  const base = path.basename(originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
  return `${prefix}-${Date.now()}-${base}`;
}

export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }

    const { originalname, size, mimetype, buffer } = req.file;
    const { titre, description, tags, categorie, pages } = req.body;

    let url = '';
    let url_thumbnail = '';

    let type = 'document';
    if (mimetype.startsWith('image/')) type = 'photo';
    else if (mimetype.startsWith('video/')) type = 'video';
    else if (mimetype.startsWith('audio/')) type = 'audio';

    const isPDF = mimetype === 'application/pdf';
    let folder = 'mon-archive';
    let resourceType = 'auto';

    if (mimetype.startsWith('image/')) { folder += '/photos'; resourceType = 'image'; }
    else if (mimetype.startsWith('video/')) { folder += '/videos'; resourceType = 'video'; }
    else if (mimetype.startsWith('audio/')) { folder += '/audios'; resourceType = 'video'; }
    else if (isPDF) { folder += '/documents'; resourceType = 'image'; }

    const publicId = makePublicId('upload', originalname);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, public_id: publicId, timeout: 600000 },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    url = result.secure_url;

    if (mimetype.startsWith('image/')) {
      url_thumbnail = cloudinary.url(result.public_id, {
        width: 400, height: 400, crop: 'fill', format: 'webp',
      });
    } else if (isPDF) {
      url_thumbnail = cloudinary.url(result.public_id, {
        width: 800, height: 300, crop: 'fill', format: 'jpg', quality: 80, page: 1,
      });
    }

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

export async function importPdfByUrl(req, res) {
  try {
    const { url, titre, description, tags, categorie, pages } = req.body;

    if (!url || !titre) {
      return res.status(400).json({ message: 'URL et titre sont requis.' });
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      return res.status(400).json({ message: `Impossible de télécharger le PDF (HTTP ${resp.status}).` });
    }

    const pdfBuf = Buffer.from(await resp.arrayBuffer());
    const size = pdfBuf.length;

    const publicId = makePublicId('import', titre);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        url,
        {
          folder: 'mon-archive/documents',
          resource_type: 'image',
          public_id: publicId,
          timeout: 600000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const pdfUrl = uploadResult.secure_url;
    const url_thumbnail = cloudinary.url(uploadResult.public_id, {
      width: 800, height: 300, crop: 'fill', format: 'jpg', quality: 80, page: 1,
    });

    const dbResult = await pool.query(
      `INSERT INTO medias (type, titre, description, url, url_thumbnail, tags, categorie, taille_fichier, nom_fichier, pages)
       VALUES ('document', $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [titre, description || '', pdfUrl, url_thumbnail, tags || '', categorie || '', size, `import-${Date.now()}.pdf`, pages || 0]
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

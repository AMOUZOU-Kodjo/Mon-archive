import { Router } from 'express';
import { uploadSingle, uploadFile, importPdfByUrl } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// POST /api/upload — Uploader un fichier vers Cloudinary
router.post('/', (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Le fichier dépasse la limite autorisée (100 Mo).' });
      }
      return res.status(400).json({ message: err.message || 'Erreur lors de l\'upload.' });
    }
    uploadFile(req, res);
  });
});

// POST /api/upload/import-pdf — Importer un PDF externe par URL
router.post('/import-pdf', importPdfByUrl);

export default router;

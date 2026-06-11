import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineUpload, HiOutlineX, HiOutlineCheck, HiOutlineExclamationCircle } from 'react-icons/hi';
import api from '../utils/api';

/**
 * Zone d'upload par glisser-déposer (Drag & Drop).
 * Envoie les fichiers vers /api/upload et affiche la progression.
 */
export default function DragDropUpload({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles.map((f) => Object.assign(f, {
      preview: URL.createObjectURL(f),
    }))]);
    setUploadStatus(null);
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadStatus(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('fichier', file);
        formData.append('titre', file.name);
        await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setUploadStatus('success');
      setFiles([]);
      onUploadComplete?.();
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 100 * 1024 * 1024, // 100 Mo
  });

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50'
        }`}
      >
        <input {...getInputProps()} />
        <HiOutlineUpload className={`text-5xl mx-auto mb-3 transition-colors ${
          isDragActive ? 'text-primary' : 'text-base-content/30'
        }`} />
        <p className="font-medium text-base-content/70">
          {isDragActive
            ? 'Déposez vos fichiers ici...'
            : 'Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner'}
        </p>
        <p className="text-sm text-base-content/40 mt-1">Images, vidéos, audios, documents (max 100 Mo)</p>
      </div>

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{files.length} fichier(s) sélectionné(s)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {files.map((file, index) => (
              <div key={file.name + index} className="relative group bg-base-100 rounded-lg p-2 shadow-sm">
                {file.type.startsWith('image/') ? (
                  <img src={file.preview} alt={file.name} className="h-16 w-full object-cover rounded" />
                ) : (
                  <div className="h-16 flex items-center justify-center bg-base-200 rounded">
                    <span className="text-2xl">📄</span>
                  </div>
                )}
                <p className="text-xs mt-1 truncate">{file.name}</p>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1.5 -right-1.5 btn btn-ghost btn-xs btn-square bg-base-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <HiOutlineX />
                </button>
              </div>
            ))}
          </div>

          {/* Bouton d'upload */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary w-full"
          >
            {uploading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Upload en cours...
              </>
            ) : (
              <>
                <HiOutlineUpload className="text-lg" />
                Uploader {files.length} fichier(s)
              </>
            )}
          </button>
        </div>
      )}

      {/* Statut de l'upload */}
      {uploadStatus === 'success' && (
        <div className="alert alert-success shadow-sm">
          <HiOutlineCheck className="text-lg" />
          <span>Tous les fichiers ont été uploadés avec succès !</span>
        </div>
      )}
      {uploadStatus === 'error' && (
        <div className="alert alert-error shadow-sm">
          <HiOutlineExclamationCircle className="text-lg" />
          <span>Une erreur est survenue lors de l'upload.</span>
        </div>
      )}
    </div>
  );
}

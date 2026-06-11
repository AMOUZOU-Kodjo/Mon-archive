import { useState, useRef } from 'react';
import { HiOutlineLink, HiOutlineUpload, HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote, HiOutlineDocumentText, HiOutlineCheck, HiOutlineX, HiOutlineCloudUpload } from 'react-icons/hi';
import { getYouTubeThumbnail } from '../utils/thumbnails';
import api from '../utils/api';

const types = [
  { value: 'photo', label: 'Photo', icon: HiOutlinePhotograph, color: 'text-primary', accept: 'image/*' },
  { value: 'video', label: 'Vidéo', icon: HiOutlineVideoCamera, color: 'text-secondary', accept: 'video/*' },
  { value: 'audio', label: 'Audio', icon: HiOutlineMusicNote, color: 'text-accent', accept: 'audio/*' },
  { value: 'document', label: 'Document', icon: HiOutlineDocumentText, color: 'text-info', accept: '.pdf,.doc,.docx,.xls,.xlsx' },
];

/**
 * Formulaire d'ajout de média avec deux modes : lien URL ou upload fichier.
 * @param {string} mediaType - Type présélectionné (photo, video, audio, document)
 */
export default function AddMediaForm({ mediaType, onAddComplete }) {
  const [mode, setMode] = useState('link'); // 'link' | 'file'
  const [type, setType] = useState(mediaType || 'video');
  const [titre, setTitre] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [pages, setPages] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const currentType = types.find((t) => t.value === type);

  const resetForm = () => {
    setTitre('');
    setUrl('');
    setDescription('');
    setTags('');
    setPages('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // === Mode LIEN ===
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!url || !titre) { setError('Le lien et le titre sont requis.'); return; }
    // Auto-détection de la miniature (YouTube, etc.)
    const url_thumbnail = getYouTubeThumbnail(url) || '';

    setLoading(true);
    try {
      if (type === 'document') {
        await api.post('/upload/import-pdf', { url, titre, description, tags, pages: pages || 0 });
      } else {
        await api.post('/medias', { type, titre, url, url_thumbnail, description, tags, pages: pages || 0 });
      }
      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
      onAddComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout par lien.');
    } finally {
      setLoading(false);
    }
  };

  // === Mode FICHIER ===
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file || !titre) { setError('Le fichier et le titre sont requis.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fichier', file);
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('tags', tags);
      formData.append('pages', pages || 0);
      await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
      onAddComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!titre) setTitre(f.name.replace(/\.[^.]+$/, ''));
    }
  };

  return (
    <div className="space-y-4">
      {/* Messages */}
      {error && (
        <div className="alert alert-error shadow-sm text-sm">
          <HiOutlineX className="text-lg flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success shadow-sm text-sm">
          <HiOutlineCheck className="text-lg flex-shrink-0" />
          <span>Média ajouté avec succès !</span>
        </div>
      )}

      {/* Sélecteur de type */}
      {!mediaType && (
        <div className="flex flex-wrap gap-2">
          {types.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`btn btn-sm rounded-full gap-1.5 ${
                  type === t.value ? 'btn-primary' : 'btn-ghost bg-base-200/50 hover:bg-base-200'
                }`}
              >
                <Icon className="text-sm" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Mode */}
      <div className="join w-full">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`join-item btn btn-sm flex-1 ${mode === 'link' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <HiOutlineLink className="text-base" />
          Par lien
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`join-item btn btn-sm flex-1 ${mode === 'file' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <HiOutlineCloudUpload className="text-base" />
          Fichier
        </button>
      </div>

          {/* ==== Formulaire LIEN ==== */}
      {mode === 'link' && (
        <form onSubmit={handleLinkSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Lien du média</span></label>
            <div className="join w-full">
              <div className="join-item flex items-center pl-3 bg-base-200 border border-base-300 rounded-l-lg">
                <HiOutlineLink className="text-base-content/40" />
              </div>
              <input
                type="url"
                placeholder={
                  type === 'photo' ? 'https://exemple.com/photo.jpg' :
                  type === 'video' ? 'https://exemple.com/video.mp4' :
                  type === 'audio' ? 'https://exemple.com/audio.mp3' :
                  'https://exemple.com/document.pdf'
                }
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="join-item input input-bordered w-full border-l-0 rounded-r-lg focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Aperçu de la miniature détectée (YouTube uniquement) */}
          {type === 'video' && getYouTubeThumbnail(url) && (
            <div className="flex items-center gap-3 p-2 bg-base-200 rounded-lg">
              <img
                src={getYouTubeThumbnail(url)}
                alt="Aperçu miniature"
                className="w-20 h-14 object-cover rounded shadow-sm"
              />
              <div className="text-xs text-base-content/60">
                <span className="font-medium text-success block">Miniature YouTube détectée</span>
                <span>Elle sera automatiquement associée à la vidéo.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Titre</span></label>
              <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} className="input input-bordered focus:outline-none" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Tags</span></label>
              <input type="text" placeholder="travail, perso" value={tags} onChange={(e) => setTags(e.target.value)} className="input input-bordered focus:outline-none" />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered focus:outline-none" rows={2} />
          </div>

          {type === 'document' && (
            <div className="form-control">
              <label className="label"><span className="label-text">Nombre de pages</span></label>
              <input type="number" min="1" placeholder="ex: 24" value={pages} onChange={(e) => setPages(e.target.value)} className="input input-bordered focus:outline-none w-32" />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-sm">
            {loading ? <><span className="loading loading-spinner loading-sm" /> Ajout en cours...</> : <><HiOutlineLink className="text-lg" /> Ajouter par lien</>}
          </button>
        </form>
      )}

      {/* ==== Formulaire FICHIER ==== */}
      {mode === 'file' && (
        <form onSubmit={handleFileSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Fichier</span></label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-base-300 hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <HiOutlineCheck className="text-success text-xl" />
                  <span className="text-sm font-medium truncate max-w-[250px]">{file.name}</span>
                  <span className="text-xs text-base-content/40">({(file.size / 1024 / 1024).toFixed(1)} Mo)</span>
                </div>
              ) : (
                <div>
                  <HiOutlineCloudUpload className="text-3xl text-base-content/30 mx-auto mb-2" />
                  <p className="text-sm text-base-content/50">Cliquez pour sélectionner un fichier</p>
                  <p className="text-xs text-base-content/30 mt-1">
                    {currentType ? types.find(t => t.value === type)?.accept.replace(/,/g, ', ') : 'Tous les types'}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={currentType ? types.find(t => t.value === type)?.accept : undefined}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Titre</span></label>
              <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} className="input input-bordered focus:outline-none" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Tags</span></label>
              <input type="text" placeholder="travail, perso" value={tags} onChange={(e) => setTags(e.target.value)} className="input input-bordered focus:outline-none" />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered focus:outline-none" rows={2} />
          </div>

          {type === 'document' && (
            <div className="form-control">
              <label className="label"><span className="label-text">Nombre de pages</span></label>
              <input type="number" min="1" placeholder="ex: 24" value={pages} onChange={(e) => setPages(e.target.value)} className="input input-bordered focus:outline-none w-32" />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-sm">
            {loading ? <><span className="loading loading-spinner loading-sm" /> Upload en cours...</> : <><HiOutlineUpload className="text-lg" /> Uploader le fichier</>}
          </button>
        </form>
      )}
    </div>
  );
}

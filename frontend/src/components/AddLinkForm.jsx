import { useState } from 'react';
import { HiOutlineLink, HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote, HiOutlineDocumentText, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import api from '../utils/api';

const types = [
  { value: 'photo', label: 'Photo', icon: HiOutlinePhotograph, color: 'text-primary' },
  { value: 'video', label: 'Vidéo', icon: HiOutlineVideoCamera, color: 'text-secondary' },
  { value: 'audio', label: 'Audio', icon: HiOutlineMusicNote, color: 'text-accent' },
  { value: 'document', label: 'Document', icon: HiOutlineDocumentText, color: 'text-info' },
];

/**
 * Formulaire d'ajout d'un média par lien URL.
 * @param {string} mediaType - Type présélectionné (photo, video, audio, document)
 */
export default function AddLinkForm({ mediaType, onAddComplete }) {
  const [type, setType] = useState(mediaType || 'video');
  const [titre, setTitre] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!url || !titre) {
      setError('Le lien et le titre sont requis.');
      return;
    }

    setLoading(true);
    try {
      if (type === 'document') {
        await api.post('/upload/import-pdf', { url, titre, description, tags, pages: pages || 0 });
      } else {
        await api.post('/medias', { type, titre, url, description, tags, pages: pages || 0 });
      }
      setSuccess(true);
      setTitre('');
      setUrl('');
      setDescription('');
      setTags('');
      setTimeout(() => setSuccess(false), 3000);
      onAddComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout.');
    } finally {
      setLoading(false);
    }
  };

  const currentType = types.find((t) => t.value === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error shadow-sm text-sm">
          <HiOutlineX className="text-lg" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success shadow-sm text-sm">
          <HiOutlineCheck className="text-lg" />
          <span>Média ajouté avec succès !</span>
        </div>
      )}

      {/* Sélecteur de type (uniquement si pas de type imposé) */}
      {!mediaType && (
        <div>
          <label className="label"><span className="label-text">Type de média</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {types.map((t) => {
              const Icon = t.icon;
              const selected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-base-300 hover:border-base-content/30'
                  }`}
                >
                  <Icon className={`text-xl ${selected ? t.color : 'text-base-content/40'}`} />
                  <span className={`text-sm font-medium ${selected ? 'text-base-content' : 'text-base-content/60'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Type imposé (affiché en badge) */}
      {mediaType && currentType && (
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <currentType.icon className={`text-lg ${currentType.color}`} />
          <span>Ajout d'une <strong>{currentType.label.toLowerCase()}</strong> par lien</span>
        </div>
      )}

      {/* Lien URL */}
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

      {/* Titre */}
      <div className="form-control">
        <label className="label"><span className="label-text">Titre</span></label>
        <input type="text" placeholder="Titre du média" value={titre} onChange={(e) => setTitre(e.target.value)} className="input input-bordered focus:outline-none" required />
      </div>

      {/* Description */}
      <div className="form-control">
        <label className="label"><span className="label-text">Description (optionnelle)</span></label>
        <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered focus:outline-none" rows={2} />
      </div>

      {/* Tags */}
      <div className="form-control">
        <label className="label"><span className="label-text">Tags (séparés par des virgules)</span></label>
        <input type="text" placeholder="ex: travail, perso, important" value={tags} onChange={(e) => setTags(e.target.value)} className="input input-bordered focus:outline-none" />
      </div>

      {type === 'document' && (
        <div className="form-control">
          <label className="label"><span className="label-text">Nombre de pages</span></label>
          <input type="number" min="1" placeholder="ex: 24" value={pages} onChange={(e) => setPages(e.target.value)} className="input input-bordered focus:outline-none w-32" />
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full shadow-md">
        {loading ? (
          <><span className="loading loading-spinner loading-sm" /> Ajout en cours...</>
        ) : (
          <><HiOutlineLink className="text-lg" /> Ajouter la {currentType?.label.toLowerCase() || 'média'}</>
        )}
      </button>
    </form>
  );
}

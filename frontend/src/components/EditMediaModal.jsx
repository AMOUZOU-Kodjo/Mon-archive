import { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import api from '../utils/api';

const categories = ['Cours', 'Révision', 'Examen', 'Exercice'];

export default function EditMediaModal({ media, onClose, onSaved }) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [categorie, setCategorie] = useState('');
  const [pages, setPages] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (media) {
      setTitre(media.titre || '');
      setDescription(media.description || '');
      setTags(media.tags || '');
      setCategorie(media.categorie || '');
      setPages(media.pages || '');
    }
  }, [media]);

  if (!media) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/medias/${media.id}`, {
        titre,
        description,
        tags,
        categorie,
        pages: pages || 0,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-box max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Modifier</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-square">
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {error && (
          <div className="alert alert-error shadow-sm text-sm mb-4 py-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label"><span className="label-text">Titre</span></label>
            <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className="input input-bordered focus:outline-none" required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Description</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered focus:outline-none" rows={2} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Tags</span></label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input input-bordered focus:outline-none" placeholder="séparés par des virgules" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Catégorie</span></label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="select select-bordered focus:outline-none">
                <option value="">Aucune</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {media.type === 'document' && (
            <div className="form-control">
              <label className="label"><span className="label-text">Nombre de pages</span></label>
              <input type="number" min="1" value={pages} onChange={(e) => setPages(e.target.value)} className="input input-bordered focus:outline-none w-32" />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 gap-2">
              {loading ? <><span className="loading loading-spinner loading-sm" /> Enregistrement...</> : <><HiOutlineCheck className="text-lg" /> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { HiOutlineLink, HiOutlineDocumentText, HiOutlineCheck, HiOutlineX, HiOutlineCloudUpload } from 'react-icons/hi';
import api from '../utils/api';

export default function ImportPdfForm({ onAddComplete }) {
  const [url, setUrl] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [categorie, setCategorie] = useState('');
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
      await api.post('/upload/import-pdf', {
        url,
        titre,
        description,
        tags,
        categorie,
        pages: pages || 0,
      });
      setSuccess(true);
      setUrl('');
      setTitre('');
      setDescription('');
      setTags('');
      setCategorie('');
      setPages('');
      setTimeout(() => setSuccess(false), 3000);
      onAddComplete?.();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'import du PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <HiOutlineCloudUpload className="text-lg text-info" />
        <span className="text-sm font-medium">Importer un PDF externe par URL</span>
      </div>

      {error && (
        <div className="alert alert-error shadow-sm text-sm py-2">
          <HiOutlineX className="text-base" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success shadow-sm text-sm py-2">
          <HiOutlineCheck className="text-base" />
          <span>PDF importé avec succès !</span>
        </div>
      )}

      <div className="form-control">
        <div className="join w-full">
          <div className="join-item flex items-center pl-3 bg-base-200 border border-base-300 rounded-l-lg">
            <HiOutlineLink className="text-base-content/40" />
          </div>
          <input
            type="url"
            placeholder="https://exemple.com/rapport.pdf"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="join-item input input-bordered w-full border-l-0 rounded-r-lg focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="form-control sm:col-span-2">
          <input type="text" placeholder="Titre du document" value={titre} onChange={(e) => setTitre(e.target.value)} className="input input-bordered focus:outline-none" required />
        </div>
        <div className="form-control">
          <input type="number" min="1" placeholder="Pages" value={pages} onChange={(e) => setPages(e.target.value)} className="input input-bordered focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-control">
          <input type="text" placeholder="Tags (séparés par des virgules)" value={tags} onChange={(e) => setTags(e.target.value)} className="input input-bordered focus:outline-none" />
        </div>
        <div className="form-control">
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="select select-bordered focus:outline-none">
            <option value="">Catégorie...</option>
            <option value="Cours">Cours</option>
            <option value="Révision">Révision</option>
            <option value="Examen">Examen</option>
            <option value="Exercice">Exercice</option>
          </select>
        </div>
      </div>

      <div className="form-control">
        <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered focus:outline-none" rows={1} />
      </div>

      <button type="submit" disabled={loading} className="btn btn-info btn-sm w-full shadow-sm gap-2">
        {loading ? (
          <><span className="loading loading-spinner loading-sm" /> Import en cours...</>
        ) : (
          <><HiOutlineCloudUpload className="text-base" /> Importer le PDF</>
        )}
      </button>
    </form>
  );
}

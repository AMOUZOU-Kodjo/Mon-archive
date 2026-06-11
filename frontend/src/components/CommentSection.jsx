import { useState, useEffect } from 'react';
import { HiOutlineChat, HiOutlineTrash, HiOutlineUser } from 'react-icons/hi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ mediaId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auteur, setAuteur] = useState('');
  const [contenu, setContenu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { authenticated } = useAuth();

  useEffect(() => {
    api.get(`/comments/${mediaId}`)
      .then((res) => setComments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mediaId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/comments/${mediaId}`, {
        auteur: auteur.trim() || 'Anonyme',
        contenu: contenu.trim(),
      });
      setComments((prev) => [res.data, ...prev]);
      setContenu('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "a l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-4 pt-6 border-t border-base-200">
      <div className="flex items-center gap-2">
        <HiOutlineChat className="text-lg text-base-content/60" />
        <h3 className="font-semibold text-base-content/80">
          Commentaires {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Votre nom (optionnel)"
          value={auteur}
          onChange={(e) => setAuteur(e.target.value)}
          className="input input-bordered input-sm w-full max-w-xs"
        />
        <div className="flex gap-2">
          <textarea
            placeholder="Ecrire un commentaire..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={2}
            className="textarea textarea-bordered flex-1 resize-none"
            required
          />
          <button type="submit" disabled={submitting || !contenu.trim()} className="btn btn-primary btn-sm self-end">
            {submitting ? '...' : 'Envoyer'}
          </button>
        </div>
      </form>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-base-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-base-content/40 text-center py-4">
          Aucun commentaire pour le moment.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 bg-base-200/50 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0">
                <HiOutlineUser className="text-sm text-base-content/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{comment.auteur}</span>
                  <span className="text-xs text-base-content/40">{formatDate(comment.date_creation)}</span>
                </div>
                <p className="text-sm text-base-content/80 mt-1 whitespace-pre-wrap">{comment.contenu}</p>
              </div>
              {authenticated && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="btn btn-ghost btn-xs text-error"
                  title="Supprimer"
                >
                  <HiOutlineTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

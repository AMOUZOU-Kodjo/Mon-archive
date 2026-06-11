import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlinePhotograph, HiOutlineDownload, HiOutlineEye,
  HiOutlineCalendar, HiOutlineTag, HiOutlineInformationCircle,
  HiOutlineShare, HiOutlineCheck, HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';
import api from '../utils/api';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../context/AuthContext';
import EditMediaModal from '../components/EditMediaModal';

export default function PhotoDetail() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    api.get(`/medias/${id}`)
      .then((res) => {
        setPhoto(res.data);
        return api.get(`/medias?type=photo`);
      })
      .then((res) => {
        setSimilaires(res.data.data.filter((m) => m.id !== Number(id)).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-[60vh] w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <HiOutlinePhotograph className="text-6xl text-base-content/30 mb-4" />
        <p className="text-lg font-medium">Photo introuvable</p>
        <Link to="/photos" className="btn btn-primary btn-sm mt-4">Retour aux photos</Link>
      </div>
    );
  }

  const fileSize = photo.taille_fichier ? formatSize(photo.taille_fichier) : '';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-base-content/50">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/photos" className="hover:text-primary transition-colors">Photos</Link>
        <span>/</span>
        <span className="text-base-content/80 truncate max-w-[250px]">{photo.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale — aperçu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-base-100 rounded-2xl overflow-hidden border border-base-200 shadow-sm">
            <div className="flex items-center justify-center p-2 bg-base-300/20">
              <img
                src={photo.url}
                alt={photo.titre}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Description */}
          {photo.description && (
            <div className="bg-gradient-to-r from-primary/5 to-base-100 rounded-xl p-5 border-l-4 border-primary">
              <p className="text-sm leading-relaxed text-base-content/80">{photo.description}</p>
            </div>
          )}

          {/* Tags */}
          {photo.tags && (
            <div className="flex flex-wrap gap-2">
              {photo.tags.split(',').map((tag) => (
                <span key={tag.trim()} className="badge badge-ghost badge-sm gap-1">
                  <HiOutlineTag className="text-xs" /> {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Commentaires */}
          <CommentSection mediaId={photo.id} />
        </div>

        {/* Colonne latérale — infos + actions */}
        <div className="space-y-6">
          {/* Carte info */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <HiOutlinePhotograph className="text-2xl text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-snug">{photo.titre}</h1>
                  {photo.categorie && (
                    <span className="badge badge-primary badge-sm mt-1">{photo.categorie}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineCalendar className="text-base-content/40 shrink-0" />
                  <span className="text-base-content/60">
                    {new Date(photo.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {fileSize && (
                  <div className="flex items-center gap-3 text-sm">
                    <HiOutlineInformationCircle className="text-base-content/40 shrink-0" />
                    <span className="text-base-content/60">{fileSize}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineTag className="text-base-content/40 shrink-0" />
                  <span className="text-base-content/60 uppercase">Image</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-3">
              <a
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full gap-2 shadow-sm"
              >
                <HiOutlineEye className="text-lg" /> Consulter
              </a>
              <a
                href={photo.url}
                download
                className="btn btn-outline w-full gap-2"
              >
                <HiOutlineDownload className="text-lg" /> Télécharger
              </a>
              {authenticated && (
                <button onClick={() => setEditingMedia(photo)} className="btn btn-outline w-full gap-2">
                  <HiOutlinePencil className="text-lg" /> Modifier
                </button>
              )}
              {authenticated && (
                <button
                  onClick={async () => {
                    if (confirm('Supprimer ce media ?')) {
                      await api.delete(`/medias/${photo.id}`);
                      window.location.href = '/';
                    }
                  }}
                  className="btn btn-outline w-full gap-2 text-error hover:bg-error/10"
                >
                  <HiOutlineTrash className="text-lg" /> Supprimer
                </button>
              )}
              <button
                onClick={copyLink}
                className={`btn w-full gap-2 ${copied ? 'btn-success' : 'btn-ghost'}`}
              >
                {copied ? (
                  <><HiOutlineCheck className="text-lg" /> Lien copié !</>
                ) : (
                  <><HiOutlineShare className="text-lg" /> Partager</>
                )}
              </button>
            </div>
          </div>

          {/* Similaires */}
          {similaires.length > 0 && (
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-5">
                <h3 className="text-sm font-semibold mb-3">Photos similaires</h3>
                <div className="space-y-3">
                  {similaires.map((s) => (
                    <Link key={s.id} to={`/photos/${s.id}`} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-base-200">
                        <img
                          src={s.url_thumbnail || s.url}
                          alt={s.titre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {s.titre}
                        </p>
                        <p className="text-xs text-base-content/40">
                          {new Date(s.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onSaved={() => window.location.reload()}
        />
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return '';
  const num = Number(bytes);
  if (isNaN(num) || num <= 0) return '';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let i = 0;
  let size = num;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

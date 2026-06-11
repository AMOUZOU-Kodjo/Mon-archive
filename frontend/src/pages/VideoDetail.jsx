import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlineVideoCamera, HiOutlineDownload, HiOutlineEye,
  HiOutlineCalendar, HiOutlineTag, HiOutlineInformationCircle,
  HiOutlineShare, HiOutlineCheck, HiOutlineExclamationCircle, HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../utils/thumbnails';
import api from '../utils/api';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../context/AuthContext';
import EditMediaModal from '../components/EditMediaModal';

export default function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    api.get(`/medias/${id}`)
      .then((res) => {
        setVideo(res.data);
        return api.get(`/medias?type=video`);
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

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <HiOutlineVideoCamera className="text-6xl text-base-content/30 mb-4" />
        <p className="text-lg font-medium">Vidéo introuvable</p>
        <Link to="/videos" className="btn btn-primary btn-sm mt-4">Retour aux vidéos</Link>
      </div>
    );
  }

  const fileSize = video.taille_fichier ? formatSize(video.taille_fichier) : '';
  const isYouTubeVideo = isYouTubeUrl(video.url);
  const youTubeEmbedUrl = isYouTubeVideo ? getYouTubeEmbedUrl(video.url) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-base-content/50">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/videos" className="hover:text-primary transition-colors">Vidéos</Link>
        <span>/</span>
        <span className="text-base-content/80 truncate max-w-[250px]">{video.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black rounded-2xl overflow-hidden shadow-sm">
            {isYouTubeVideo ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={youTubeEmbedUrl}
                  title={video.titre}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <>
                <video controls className="w-full max-h-[70vh]" src={video.url} onError={() => setVideoError(true)}>
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                {videoError && (
                  <div className="flex items-center gap-2 text-xs text-error p-3 bg-base-100">
                    <HiOutlineExclamationCircle className="text-sm" />
                    <span>Lecture impossible — vérifiez que l'URL de la vidéo est accessible.</span>
                  </div>
                )}
              </>
            )}
          </div>

          {video.description && (
            <div className="bg-gradient-to-r from-secondary/5 to-base-100 rounded-xl p-5 border-l-4 border-secondary">
              <p className="text-sm leading-relaxed text-base-content/80">{video.description}</p>
            </div>
          )}

          {video.tags && (
            <div className="flex flex-wrap gap-2">
              {video.tags.split(',').map((tag) => (
                <span key={tag.trim()} className="badge badge-ghost badge-sm gap-1">
                  <HiOutlineTag className="text-xs" /> {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <CommentSection mediaId={video.id} />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <HiOutlineVideoCamera className="text-2xl text-secondary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-snug">{video.titre}</h1>
                  {video.categorie && (
                    <span className="badge badge-secondary badge-sm mt-1">{video.categorie}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineCalendar className="text-base-content/40 shrink-0" />
                  <span className="text-base-content/60">
                    {new Date(video.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                  <span className="text-base-content/60 uppercase">Vidéo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-3">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full gap-2 shadow-sm"
              >
                <HiOutlineEye className="text-lg" /> Consulter
              </a>
              <a
                href={video.url}
                download
                className="btn btn-outline w-full gap-2"
              >
                <HiOutlineDownload className="text-lg" /> Télécharger
              </a>
              {authenticated && (
                <button onClick={() => setEditingMedia(video)} className="btn btn-outline w-full gap-2">
                  <HiOutlinePencil className="text-lg" /> Modifier
                </button>
              )}
              {authenticated && (
                <button
                  onClick={async () => {
                    if (confirm('Supprimer ce media ?')) {
                      await api.delete(`/medias/${video.id}`);
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

          {similaires.length > 0 && (
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-5">
                <h3 className="text-sm font-semibold mb-3">Vidéos similaires</h3>
                <div className="space-y-3">
                  {similaires.map((s) => (
                    <Link key={s.id} to={`/videos/${s.id}`} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-base-200">
                        <img
                          src={s.url_thumbnail || s.url}
                          alt={s.titre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-secondary transition-colors">
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

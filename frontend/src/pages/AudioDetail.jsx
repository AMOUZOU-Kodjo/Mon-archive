import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlineMusicNote, HiOutlineDownload,
  HiOutlineCalendar, HiOutlineTag, HiOutlineInformationCircle,
  HiOutlineShare, HiOutlineCheck, HiOutlineExclamationCircle, HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';
import { needsAudioEmbed, getAudioEmbedUrl } from '../utils/thumbnails';
import api from '../utils/api';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../context/AuthContext';
import EditMediaModal from '../components/EditMediaModal';

export default function AudioDetail() {
  const { id } = useParams();
  const [audio, setAudio] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    api.get(`/medias/${id}`)
      .then((res) => {
        setAudio(res.data);
        return api.get(`/medias?type=audio`);
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
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="skeleton h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <HiOutlineMusicNote className="text-6xl text-base-content/30 mb-4" />
        <p className="text-lg font-medium">Audio introuvable</p>
        <Link to="/audios" className="btn btn-primary btn-sm mt-4">Retour aux audios</Link>
      </div>
    );
  }

  const fileSize = audio.taille_fichier ? formatSize(audio.taille_fichier) : '';
  const useEmbed = needsAudioEmbed(audio.url);
  const embedUrl = getAudioEmbedUrl(audio.url);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-base-content/50">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/audios" className="hover:text-primary transition-colors">Audios</Link>
        <span>/</span>
        <span className="text-base-content/80 truncate max-w-[250px]">{audio.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-base-100 rounded-2xl p-8 shadow-sm border border-base-200">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-inner">
                <HiOutlineMusicNote className="text-5xl text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{audio.titre}</h2>
                <p className="text-sm text-base-content/40">Piste audio</p>
              </div>
              {useEmbed && embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-[120px] rounded-lg"
                  title={audio.titre}
                  allow="autoplay *; encrypted-media *;"
                  sandbox="allow-forms allow-scripts allow-same-origin"
                />
              ) : (
                <>
                  <audio controls className="w-full" src={audio.url} onError={() => setAudioError(true)}>
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                  {audioError && (
                    <div className="flex items-center gap-2 text-xs text-error">
                      <HiOutlineExclamationCircle className="text-sm" />
                      <span>Lecture impossible — vérifiez que l'URL du fichier audio est accessible.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {audio.description && (
            <div className="bg-gradient-to-r from-accent/5 to-base-100 rounded-xl p-5 border-l-4 border-accent">
              <p className="text-sm leading-relaxed text-base-content/80">{audio.description}</p>
            </div>
          )}

          {audio.tags && (
            <div className="flex flex-wrap gap-2">
              {audio.tags.split(',').map((tag) => (
                <span key={tag.trim()} className="badge badge-ghost badge-sm gap-1">
                  <HiOutlineTag className="text-xs" /> {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <CommentSection mediaId={audio.id} />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <HiOutlineMusicNote className="text-2xl text-accent" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-snug">{audio.titre}</h1>
                  {audio.categorie && (
                    <span className="badge badge-accent badge-sm mt-1">{audio.categorie}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineCalendar className="text-base-content/40 shrink-0" />
                  <span className="text-base-content/60">
                    {new Date(audio.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                  <span className="text-base-content/60 uppercase">Audio</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-3">
              <a
                href={audio.url}
                download
                className="btn btn-accent w-full gap-2 shadow-sm"
              >
                <HiOutlineDownload className="text-lg" /> Télécharger
              </a>
              {authenticated && (
                <button onClick={() => setEditingMedia(audio)} className="btn btn-outline w-full gap-2">
                  <HiOutlinePencil className="text-lg" /> Modifier
                </button>
              )}
              {authenticated && (
                <button
                  onClick={async () => {
                    if (confirm('Supprimer ce media ?')) {
                      await api.delete(`/medias/${audio.id}`);
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
                <h3 className="text-sm font-semibold mb-3">Audios similaires</h3>
                <div className="space-y-3">
                  {similaires.map((s) => (
                    <Link key={s.id} to={`/audios/${s.id}`} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-accent/10 flex items-center justify-center">
                        <HiOutlineMusicNote className="text-xl text-accent/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
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

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlineDocumentText, HiOutlineDownload, HiOutlineEye,
  HiOutlineCalendar, HiOutlineTag, HiOutlineInformationCircle,
  HiOutlinePaperClip, HiOutlineExternalLink,
  HiOutlineShare, HiOutlineCheck, HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';
import api from '../utils/api';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../context/AuthContext';
import EditMediaModal from '../components/EditMediaModal';

const IMG_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

export default function DocumentDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const { authenticated } = useAuth();

  useEffect(() => {
    api.get(`/medias/${id}`)
      .then((res) => {
        setDoc(res.data);
        return api.get(`/medias?type=document`);
      })
      .then((res) => {
        setSimilaires(res.data.filter((m) => m.id !== Number(id)).slice(0, 4));
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
        <div className="skeleton h-56 w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-16 rounded-xl" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <HiOutlineDocumentText className="text-6xl text-base-content/30 mb-4" />
        <p className="text-lg font-medium">Document introuvable</p>
        <Link to="/documents" className="btn btn-primary btn-sm mt-4">Retour aux documents</Link>
      </div>
    );
  }

  const ext = doc.url?.split('.').pop()?.toLowerCase() || '';
  const isPdf = ext === 'pdf';
  const isImage = IMG_EXT.includes(ext);
  const fileName = doc.nom_fichier || doc.url?.split('/').pop() || '';
  const fileSize = doc.taille_fichier ? formatSize(doc.taille_fichier) : '';
  const isViewable = isPdf || isImage;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-base-content/50">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span>/</span>
        <Link to="/documents" className="hover:text-primary transition-colors">Documents</Link>
        <span>/</span>
        <span className="text-base-content/80 truncate max-w-[250px]">{doc.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bannière */}
          {(isImage || (isPdf && doc.url_thumbnail)) && (
            <div className="bg-base-200 rounded-2xl overflow-hidden border border-base-200 shadow-sm flex items-center justify-center max-h-72">
              <img
                src={isImage ? doc.url : doc.url_thumbnail}
                alt={doc.titre}
                className="max-h-72 object-contain w-full"
              />
            </div>
          )}

          {/* Description */}
          {doc.description && (
            <div className="bg-gradient-to-r from-info/5 to-base-100 rounded-xl p-5 border-l-4 border-info">
              <p className="text-sm leading-relaxed text-base-content/80">{doc.description}</p>
            </div>
          )}

          {/* Tags */}
          {doc.tags && (
            <div className="flex flex-wrap gap-2">
              {doc.tags.split(',').map((tag) => (
                <span key={tag.trim()} className="badge badge-ghost badge-sm gap-1">
                  <HiOutlineTag className="text-xs" /> {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Aperçu PDF inline */}
          {isPdf && (
            <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 bg-base-100/50">
                <span className="text-sm font-medium flex items-center gap-2">
                  <HiOutlineEye className="text-base" /> Aperçu
                </span>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs gap-1">
                  Plein écran <HiOutlineExternalLink className="text-xs" />
                </a>
              </div>
              <iframe
                src={doc.url}
                className="w-full h-[75vh]"
                title={doc.titre}
              />
            </div>
          )}

          {/* Grille métadonnées */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: HiOutlineDocumentText, label: 'Type', value: ext.toUpperCase() || 'Document', color: 'info' },
              { icon: HiOutlineInformationCircle, label: 'Taille', value: fileSize || 'Inconnue', color: 'success' },
              { icon: HiOutlineTag, label: 'Format', value: ext ? `.${ext}` : 'N/A', color: 'warning' },
              { icon: HiOutlinePaperClip, label: 'Fichier', value: fileName.length > 20 ? fileName.slice(0, 20) + '...' : fileName || 'Anonyme', color: 'secondary' },
              { icon: HiOutlineDocumentText, label: 'Pages', value: doc.pages ? `${doc.pages} p.` : '—', color: 'info' },
              { icon: HiOutlineCalendar, label: 'Date', value: new Date(doc.date_creation).toLocaleDateString('fr-FR'), color: 'primary' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`rounded-xl p-3 border bg-${item.color}/5 border-${item.color}/20 hover:shadow-md transition-shadow`}>
                  <div className={`flex items-center gap-1.5 text-${item.color} text-xs mb-1`}>
                    <Icon className="text-sm" /> {item.label}
                  </div>
                  <p className="font-semibold text-sm truncate">{item.value}</p>
                </div>
              );
            })}
          </div>

          <CommentSection mediaId={doc.id} />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                  <HiOutlineDocumentText className="text-2xl text-info" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-snug">{doc.titre}</h1>
                  {doc.categorie && (
                    <span className="badge badge-info badge-sm mt-1">{doc.categorie}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineCalendar className="text-base-content/40 shrink-0" />
                  <span className="text-base-content/60">
                    {new Date(doc.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                {fileSize && (
                  <div className="flex items-center gap-3 text-sm">
                    <HiOutlineInformationCircle className="text-base-content/40 shrink-0" />
                    <span className="text-base-content/60">{fileSize}</span>
                  </div>
                )}
                {doc.pages > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <HiOutlineDocumentText className="text-base-content/40 shrink-0" />
                    <span className="text-base-content/60">{doc.pages} pages</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineTag className="text-base-content/40 shrink-0" />
                  <span className="text-base-content/60 uppercase">{ext || 'Document'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5 space-y-3">
              {isViewable ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-info w-full gap-2 shadow-sm"
                >
                  <HiOutlineEye className="text-lg" /> Consulter
                </a>
              ) : (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline w-full gap-2"
                >
                  <HiOutlineExternalLink className="text-lg" /> Ouvrir
                </a>
              )}
              <a
                href={doc.url}
                download
                className="btn btn-outline w-full gap-2"
              >
                <HiOutlineDownload className="text-lg" /> Télécharger
              </a>
              {authenticated && (
                <button onClick={() => setEditingMedia(doc)} className="btn btn-outline w-full gap-2">
                  <HiOutlinePencil className="text-lg" /> Modifier
                </button>
              )}
              {authenticated && (
                <button
                  onClick={async () => {
                    if (confirm('Supprimer ce media ?')) {
                      await api.delete(`/medias/${doc.id}`);
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
                <h3 className="text-sm font-semibold mb-3">Documents similaires</h3>
                <div className="space-y-3">
                  {similaires.map((s) => (
                    <Link key={s.id} to={`/documents/${s.id}`} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-base-200 flex items-center justify-center">
                        <HiOutlineDocumentText className="text-xl text-info/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-info transition-colors">
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

import { useState } from 'react';
import {
  HiOutlineDownload, HiOutlineTrash, HiOutlinePlay, HiOutlinePencil,
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineDocumentReport,
  HiOutlineClock, HiOutlineEye,
} from 'react-icons/hi';
import { getMediaThumbnail, getTypeGradient } from '../utils/thumbnails';

const typeLabels = {
  photo: 'Photo',
  video: 'Vidéo',
  audio: 'Audio',
  document: 'Document',
};

const typeColors = {
  photo: 'badge-primary',
  video: 'badge-secondary',
  audio: 'badge-accent',
  document: 'badge-info',
};

function LazyImage({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 skeleton rounded-none" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}

const hoverShadowColors = {
  photo: 'rgba(0, 123, 255, 0.12)',
  video: 'rgba(108, 117, 125, 0.12)',
  audio: 'rgba(214, 51, 132, 0.12)',
  document: 'rgba(23, 162, 184, 0.12)',
};

const accentBarColors = {
  photo: 'bg-primary',
  video: 'bg-secondary',
  audio: 'bg-accent',
  document: 'bg-info',
};

export default function MediaCard({ media, onDelete, onEdit, onClick }) {
  const thumbnail = getMediaThumbnail(media);
  const gradient = getTypeGradient(media.type);
  const date = new Date(media.date_creation).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const tags = media.tags ? media.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const isAdmin = Boolean(onEdit || onDelete);
  const hasThumb = Boolean(thumbnail);
  const shadowColor = hoverShadowColors[media.type] || 'rgba(0,0,0,0.1)';
  const accentBar = accentBarColors[media.type] || 'bg-primary';

  return (
    <div
      data-type={media.type}
      className="card bg-base-100 shadow-sm transition-all duration-400 cursor-pointer group stagger-item overflow-hidden border border-base-200/50 hover:-translate-y-1.5 h-full flex flex-col shine-hover relative"
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      onClick={() => onClick?.(media)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 12px 32px -8px ${shadowColor}, 0 4px 16px -4px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Colored accent bar at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[1rem] ${accentBar} opacity-80 transition-all duration-300 group-hover:h-[4px] group-hover:opacity-100 z-30`} />

      <figure className={`relative overflow-hidden bg-base-300 shrink-0 ${media.type === 'document' ? 'aspect-[2/1]' : 'aspect-video'}`}>
        {/* Image de fond / vignette */}
        {media.type === 'photo' && (
          <LazyImage
            src={thumbnail || media.url}
            alt={media.titre}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {(media.type === 'video' || media.type === 'document') && hasThumb && (
          <LazyImage
            src={thumbnail}
            alt={media.titre}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Gradient overlay that deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent transition-all duration-300 group-hover:from-black/30 z-[1]" />

        {/* Fallback gradient + icône */}
        {!hasThumb && (
          <div className={`absolute inset-0 ${gradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}>
            {media.type === 'document' && (
              <HiOutlineDocumentReport className="text-6xl text-error/60 transition-transform duration-300 group-hover:scale-110" />
            )}
            {media.type === 'video' && (
              <HiOutlineVideoCamera className="text-5xl text-secondary/40 transition-transform duration-300 group-hover:scale-110" />
            )}
            {media.type === 'audio' && (
              <div className="flex items-end gap-1 h-16">
                {[40, 60, 80, 100, 75, 50, 85, 65, 45, 55].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-primary/40 rounded-full animate-pulse-soft"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}
            {media.type === 'photo' && (
              <HiOutlinePhotograph className="text-5xl text-primary/40 transition-transform duration-300 group-hover:scale-110" />
            )}
          </div>
        )}

        {/* Bouton play vidéo */}
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-black/60 shadow-lg">
              <HiOutlinePlay className="text-white text-2xl ml-0.5 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className={`badge badge-sm ${typeColors[media.type] || 'badge-ghost'} capitalize shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5`}>
            {typeLabels[media.type] || media.type}
          </span>
        </div>

        {media.categorie && (
          <div className="absolute top-2 right-2 z-10">
            <span className="badge badge-sm badge-ghost backdrop-blur-sm bg-base-100/70 capitalize transition-all duration-300 group-hover:bg-base-100/90 group-hover:-translate-y-0.5">
              {media.categorie}
            </span>
          </div>
        )}

        {/* Overlay Lire / Télécharger */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-2 group-hover:translate-y-0 z-20">
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn btn-ghost btn-xs text-white hover:bg-white/20 gap-1 backdrop-blur-sm flex-1 transition-all duration-200"
          >
            <HiOutlineEye className="text-sm" />
            {media.type === 'video' || media.type === 'audio' ? 'Lire' : 'Ouvrir'}
          </a>
          <a
            href={media.url}
            download
            onClick={(e) => e.stopPropagation()}
            className="btn btn-ghost btn-xs text-white hover:bg-white/20 gap-1 backdrop-blur-sm transition-all duration-200"
            title="Télécharger"
          >
            <HiOutlineDownload className="text-sm" />
          </a>
        </div>
      </figure>

      <div className="card-body p-3 flex-1 flex flex-col justify-between relative z-[1]">
        <div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {media.titre}
          </h3>

          <div className="flex items-center gap-2 text-xs text-base-content/50 mt-1">
            <HiOutlineClock className="text-xs" />
            <span>{date}</span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="badge badge-xs badge-ghost transition-all duration-200 hover:badge-primary">{tag}</span>
              ))}
              {tags.length > 2 && (
                <span className="badge badge-xs badge-ghost">+{tags.length - 2}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200/50">
          <span className="text-[10px] text-base-content/40 uppercase tracking-wider font-medium">
            {media.type === 'document'
              ? `${media.nom_fichier?.split('.').pop()?.toUpperCase() || 'PDF'}`
              : typeLabels[media.type]}
          </span>
          <div className="flex items-center gap-1">
            {media.type === 'document' && media.pages > 0 && (
              <span className="badge badge-ghost badge-xs">{media.pages} p.</span>
            )}
            <a
              href={media.url}
              download
              onClick={(e) => e.stopPropagation()}
              className="btn btn-ghost btn-sm text-base-content/50 hover:text-primary transition-colors gap-1 min-h-0 h-8 px-2"
              title="Télécharger"
            >
              <HiOutlineDownload className="text-base" />
            </a>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-base-200/50">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(media); }}
                className="btn btn-ghost btn-xs flex-1 gap-1 hover:bg-primary/10 active:scale-95 transition-transform"
              >
                <HiOutlinePencil className="text-sm text-primary" /> Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(media.id); }}
                className="btn btn-ghost btn-xs flex-1 gap-1 hover:bg-error/10 active:scale-95 transition-transform"
              >
                <HiOutlineTrash className="text-sm text-error" /> Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlay, HiOutlinePause, HiOutlineDownload, HiOutlineChevronRight, HiOutlineExclamationCircle } from 'react-icons/hi';
import { needsAudioEmbed, getAudioEmbedUrl } from '../utils/thumbnails';

/**
 * Lecteur audio stylisé avec progression et téléchargement.
 */
export default function AudioPlayer({ media }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);
  const useEmbed = needsAudioEmbed(media.url);
  const embedUrl = getAudioEmbedUrl(media.url);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(dur);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * duration;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="bg-base-100 rounded-xl p-4 shadow-sm group shine-hover relative border border-base-200/50 hover:-translate-y-1 transition-all duration-300"
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(214, 51, 132, 0.12), 0 4px 16px -4px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-xl bg-accent opacity-80 transition-all duration-300 group-hover:h-[4px] group-hover:opacity-100 z-30" />
      {useEmbed && embedUrl ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Link to={`/audios/${media.id}`} className="font-medium text-sm truncate hover:text-primary transition-colors flex items-center gap-1">
              {media.titre} <HiOutlineChevronRight className="text-xs opacity-0 group-hover:opacity-100" />
            </Link>
          </div>
          <iframe
            src={embedUrl}
            className="w-full h-[120px] rounded-lg"
            title={media.titre}
            allow="autoplay *; encrypted-media *;"
            sandbox="allow-forms allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <audio
            ref={audioRef}
            src={media.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleTimeUpdate}
            onError={() => setError(true)}
            preload="metadata"
          />
          {error && (
            <div className="flex items-center gap-2 text-xs text-error py-1">
              <HiOutlineExclamationCircle className="text-sm" />
              <span>Lecture impossible</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link to={`/audios/${media.id}`} className="font-medium text-sm truncate hover:text-primary transition-colors flex items-center gap-1">
              {media.titre} <HiOutlineChevronRight className="text-xs opacity-0 group-hover:opacity-100" />
            </Link>
            <a
              href={media.url}
              download={media.nom_fichier}
              className="btn btn-ghost btn-xs btn-square"
              title="Telecharger"
              onClick={(e) => e.stopPropagation()}
            >
              <HiOutlineDownload className="text-lg" />
            </a>
          </div>

          {/* Barre de progression */}
          <div
            className="h-2 bg-base-300 rounded-full cursor-pointer hover:h-3 transition-all"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-base-content/60">
            <span>{formatTime(currentTime)}</span>
            <button onClick={togglePlay} className="btn btn-primary btn-sm btn-circle shadow-md">
              {playing ? <HiOutlinePause className="text-lg" /> : <HiOutlinePlay className="text-lg ml-0.5" />}
            </button>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

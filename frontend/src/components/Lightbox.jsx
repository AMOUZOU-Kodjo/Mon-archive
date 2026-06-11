import { useEffect, useCallback } from 'react';
import { HiOutlineX } from 'react-icons/hi';

/**
 * Lightbox plein écran pour visualiser les photos.
 */
export default function Lightbox({ imageUrl, alt, onClose }) {
  // Fermeture avec la touche Échap
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 btn btn-ghost btn-square text-white hover:bg-white/10"
      >
        <HiOutlineX className="text-2xl" />
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

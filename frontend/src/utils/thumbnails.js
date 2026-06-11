const CLOUDINARY_RE = /res\.cloudinary\.com\/([^\/]+)/;

function isCloudinary(url) {
  return url?.includes('cloudinary.com');
}

function getCloudName(url) {
  const m = url?.match(CLOUDINARY_RE);
  return m ? m[1] : null;
}

// Dimensions uniformes pour TOUTES les vignettes (couvre h-48 = 192px)
const THUMB_W = 800;
const THUMB_H = 300;
const THUMB_QUALITY = 80;

function cloudinaryTransform(url, extraParams = '') {
  if (!url || !isCloudinary(url)) return null;
  const base = url.replace('/raw/upload/', '/image/upload/');
  const tx = `w_${THUMB_W},h_${THUMB_H},c_fill,g_auto${extraParams ? ',' + extraParams : ''},f_jpg,q_${THUMB_QUALITY}`;
  return base.replace('/image/upload/', `/image/upload/${tx}/`).replace(/\.\w+(\?.*)?$/, '.jpg');
}

export function getYouTubeThumbnail(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  }
  return null;
}

export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function isYouTubeUrl(url) {
  return Boolean(getYouTubeEmbedUrl(url));
}

export function isApplePodcastsUrl(url) {
  return url?.includes('podcasts.apple.com');
}

export function getApplePodcastsEmbedUrl(url) {
  if (!url || !isApplePodcastsUrl(url)) return null;
  // Extract podcast ID and episode ID from URL
  const podcastMatch = url.match(/\/id(\d+)/);
  const episodeMatch = url.match(/[?&]i=(\d+)/);
  const langMatch = url.match(/[?&]l=(\w+)/);
  const countryMatch = url.match(/\/\/([a-z]+)\.podcasts/);
  if (!podcastMatch) return null;
  const country = countryMatch ? countryMatch[1] : 'us';
  const lang = langMatch ? langMatch[1] : '';
  const podcastId = podcastMatch[1];
  let embedUrl = `https://embed.podcasts.apple.com/${country}/podcast/id${podcastId}`;
  if (episodeMatch) embedUrl += `?i=${episodeMatch[1]}`;
  if (lang) embedUrl += `${episodeMatch ? '&' : '?'}l=${lang}`;
  return embedUrl;
}

export function getAudioEmbedUrl(url) {
  if (!url) return null;
  if (isApplePodcastsUrl(url)) return getApplePodcastsEmbedUrl(url);
  return null;
}

export function needsAudioEmbed(url) {
  return Boolean(getAudioEmbedUrl(url));
}

export function getVideoThumbnail(url) {
  if (!url) return null;
  const yt = getYouTubeThumbnail(url);
  if (yt) return yt;
  if (url.includes('.mp4')) return cloudinaryTransform(url, 'so_0');
  return null;
}

export function getPdfThumbnail(url) {
  return cloudinaryTransform(url, 'pg_1');
}

export function getPhotoThumbnail(url) {
  return cloudinaryTransform(url);
}

export function getMediaThumbnail(media) {
  if (!media) return null;
  if (media.url_thumbnail) return media.url_thumbnail;
  if (media.type === 'photo') return getPhotoThumbnail(media.url);
  if (media.type === 'video') return getVideoThumbnail(media.url) || getYouTubeThumbnail(media.url);
  if (media.type === 'document') return getPdfThumbnail(media.url);
  return null;
}

export function getDocIcon(url) {
  const ext = url?.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { label: 'PDF', color: 'text-error' };
  if (['doc', 'docx'].includes(ext)) return { label: 'Word', color: 'text-primary' };
  if (['xls', 'xlsx'].includes(ext)) return { label: 'Excel', color: 'text-success' };
  return { label: 'FICH', color: 'text-base-content/50' };
}

export function getTypeGradient(type) {
  switch (type) {
    case 'photo':    return 'from-blue-400/20 to-purple-400/20';
    case 'video':    return 'from-red-400/20 to-orange-400/20';
    case 'audio':    return 'from-green-400/20 to-teal-400/20';
    case 'document': return 'from-indigo-400/20 to-blue-400/20';
    default:         return 'from-base-300 to-base-200';
  }
}

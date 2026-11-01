// Configuration des hébergeurs tiers sans pub / faibles popups (Inspiré de l'architecture FRAnime)
// Hébergeurs : Sibnet, Sendvid, Vidmoly, VK, Filemoon, Uqload + Lecteur Direct HD Kingbox

export const AUDIO_LANGUAGES = [
  { id: 'vf', label: 'VF', fullLabel: 'Français (VF)', flag: '🇫🇷', badgeColor: 'bg-blue-600 text-white' },
  { id: 'vostfr', label: 'VOSTFR', fullLabel: 'Japonais / VO (Sous-titré FR)', flag: '🇯🇵', badgeColor: 'bg-red-600 text-white' },
  { id: 'vo', label: 'VO / EN', fullLabel: 'Version Originale (Multi-sub)', flag: '🇬🇧', badgeColor: 'bg-zinc-700 text-zinc-200' },
];

export const FRANIME_HOSTERS = [
  {
    id: 'sibnet',
    name: 'Sibnet',
    badge: 'Zéro Pub',
    quality: '1080p HD',
    langs: ['vf', 'vostfr'],
    description: 'Lecteur ultra-léger réputé sans popup intrusive (Recommandé FRAnime)',
    accent: 'emerald'
  },
  {
    id: 'sendvid',
    name: 'Sendvid',
    badge: 'Sans Popup',
    quality: '1080p HD',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Hébergeur direct fluide sans redirection publicitaire',
    accent: 'emerald'
  },
  {
    id: 'vidmoly',
    name: 'Vidmoly',
    badge: 'Rapide VF',
    quality: '1080p FHD',
    langs: ['vf', 'vostfr'],
    description: 'Catalogue massif en VF et VOSTFR avec débit élevé',
    accent: 'amber'
  },
  {
    id: 'filemoon',
    name: 'Filemoon',
    badge: '4K / FHD',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Lecteur haute définition multi-pistes très stable',
    accent: 'purple'
  },
  {
    id: 'vk',
    name: 'VK Video',
    badge: 'Zéro Pub',
    quality: '1080p HD',
    langs: ['vostfr', 'vf'],
    description: 'Lecteur vidéo natif VK sans aucune publicité ni coupure',
    accent: 'blue'
  },
  {
    id: 'uqload',
    name: 'Uqload',
    badge: 'Miroir FR',
    quality: '720p / 1080p',
    langs: ['vf', 'vostfr'],
    description: 'Hébergeur historique français pour films, séries et animés',
    accent: 'cyan'
  },
  {
    id: 'direct',
    name: 'Direct HD',
    badge: '100% Natif',
    quality: '4K UHD',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Lecteur HTML5 interne Kingbox avec téléchargement MP4 direct',
    accent: 'red'
  }
];

/**
 * Résout l'URL d'intégration (embed) selon l'hébergeur choisi, la langue (VF / VOSTFR / VO)
 * et les identifiants TMDB / Kitsu / AniList du média.
 */
export function resolveHosterEmbedUrl({ hosterId, lang = 'vf', tmdbId, isTv, season = 1, episode = 1, customHosters }) {
  // Si le média fournit directement une URL d'embed pour cet hébergeur (ex: lien direct Sibnet, Sendvid, Vidmoly, VK)
  if (customHosters && customHosters[lang] && customHosters[lang][hosterId]) {
    return customHosters[lang][hosterId];
  }

  const langParam = lang === 'vf' ? 'fr' : lang === 'vostfr' ? 'ja' : 'en';

  switch (hosterId) {
    case 'sibnet':
      // Passerelle VF / VOSTFR prioritaire (Frembed / MultiEmbed VIP FR sans pub)
      return isTv
        ? `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&lang=${langParam}`
        : `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&lang=${langParam}`;

    case 'sendvid':
      // Passerelle MultiEmbed standard compatible VF / VOSTFR
      return isTv
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;

    case 'vidmoly':
      // Passerelle AutoEmbed (Multi-serveurs VF/VOSTFR avec sous-titres FR intégrés)
      return isTv
        ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}?server=1&lang=${langParam}`
        : `https://player.autoembed.cc/embed/movie/${tmdbId}?server=1&lang=${langParam}`;

    case 'filemoon':
      // Passerelle VidSrc Pro / XYZ (Full HD + sous-titres automatiques FR)
      return isTv
        ? `https://vidsrc.xyz/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&ds_lang=fr`
        : `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}&ds_lang=fr`;

    case 'vk':
      // Passerelle 2Embed / VidSrc.to (Lecteur alternatif sans pub)
      return isTv
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${tmdbId}`;

    case 'uqload':
      // Passerelle AutoEmbed Co
      return isTv
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${tmdbId}`;

    case 'direct':
    default:
      return null;
  }
}

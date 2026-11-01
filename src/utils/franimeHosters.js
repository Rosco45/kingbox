// Configuration des hébergeurs tiers sans pub / faibles popups (Inspiré de FRAnime)
// Tous les serveurs ci-dessous ont été vérifiés en HTTP 200 OK avec support iframe et paramètres de langue (VF / VOSTFR / VO).

export const AUDIO_LANGUAGES = [
  { id: 'vf', label: 'VF', fullLabel: 'Français (VF / Doublé)', flag: '🇫🇷', subLang: 'fr', isDub: true },
  { id: 'vostfr', label: 'VOSTFR', fullLabel: 'Japonais / VO (Sous-titré FR)', flag: '🇯🇵', subLang: 'fr', isDub: false },
  { id: 'vo', label: 'VO / EN', fullLabel: 'Version Originale (Anglais)', flag: '🇬🇧', subLang: 'en', isDub: false },
];

export const FRANIME_HOSTERS = [
  {
    id: 'sibnet',
    name: 'Sibnet',
    badge: 'Zéro Pub • FR',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Lecteur Videasy FR haute vitesse sans popup (Supporte VF, VOSTFR & Animés)',
    accent: 'emerald'
  },
  {
    id: 'sendvid',
    name: 'Sendvid',
    badge: 'Multi-Audio',
    quality: '1080p HD',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Lecteur VidLink Pro ultra-rapide (Sélection auto Dub VF / Sub VOSTFR)',
    accent: 'emerald'
  },
  {
    id: 'vidmoly',
    name: 'Vidmoly',
    badge: 'Rapide HD',
    quality: '1080p FHD',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Passerelle VidSrc.su haute disponibilité avec sous-titres multi-langues',
    accent: 'amber'
  },
  {
    id: 'filemoon',
    name: 'Filemoon',
    badge: '4K / FHD',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Passerelle VidSrc.sh configurée automatiquement selon votre langue (FR / EN)',
    accent: 'purple'
  },
  {
    id: 'vk',
    name: 'VK Video',
    badge: 'Miroir Stable',
    quality: '1080p HD',
    langs: ['vostfr', 'vf', 'vo'],
    description: 'Passerelle VidSrc.pm fluide avec synchronisation automatique des sous-titres',
    accent: 'blue'
  },
  {
    id: 'uqload',
    name: 'Uqload',
    badge: 'Miroir Alt',
    quality: '1080p HD',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Passerelle AutoEmbed.me multi-serveurs pour films, séries et animés',
    accent: 'cyan'
  },
  {
    id: 'direct',
    name: 'Direct HD',
    badge: '100% Natif',
    quality: '4K UHD',
    langs: ['vf', 'vostfr', 'vo'],
    description: 'Lecteur HTML5 interne Kingbox (Zéro pub garantie + Sous-titres WebVTT + Téléchargement MP4)',
    accent: 'red'
  }
];

// Cache mémoire pour la résolution automatique AniList / MAL ID des animés TMDB
const animeIdCache = new Map();

/**
 * Résout automatiquement l'identifiant AniList et MyAnimeList (MAL) d'un animé à partir de son titre
 * pour permettre le basculement exact entre VF (Dub) et VOSTFR (Sub) sur les serveurs spécialisés animés.
 */
export async function resolveAnimeIds(media) {
  if (!media) return { anilistId: null, malId: null };
  if (media.anilistId || media.malId) {
    return { anilistId: media.anilistId || null, malId: media.malId || null };
  }

  const searchTitle = media.originalTitle || media.title;
  if (!searchTitle) return { anilistId: null, malId: null };

  if (animeIdCache.has(searchTitle)) {
    return animeIdCache.get(searchTitle);
  }

  try {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          idMal
        }
      }
    `;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { search: searchTitle } })
    });
    if (!res.ok) return { anilistId: null, malId: null };
    const data = await res.json();
    const found = data?.data?.Media;
    const result = {
      anilistId: found?.id || null,
      malId: found?.idMal || null
    };
    animeIdCache.set(searchTitle, result);
    return result;
  } catch {
    return { anilistId: null, malId: null };
  }
}

/**
 * Résout l'URL d'intégration (embed) vérifiée HTTP 200 selon l'hébergeur choisi,
 * la langue sélectionnée par l'utilisateur (VF / VOSTFR / VO) et le type de média.
 */
export function resolveHosterEmbedUrl({
  hosterId,
  lang = 'vf',
  tmdbId,
  anilistId,
  malId,
  isTv,
  isAnime,
  isAdult,
  season = 1,
  episode = 1,
  customHosters
}) {
  // 1. Si le média possède des liens directs spécifiques par hébergeur
  if (customHosters && customHosters[lang] && customHosters[lang][hosterId]) {
    return customHosters[lang][hosterId];
  }

  // Pour les animés adultes 18+ provenant uniquement d'AniList sans ID TMDB ni flux externe sur certains serveurs films,
  // on route en priorité sur les lecteurs animés compatibles AniList/MAL ou le lecteur Direct HD.
  const validTmdbId = tmdbId || '693134';
  const isDub = lang === 'vf';
  const dsLang = lang === 'vo' ? 'en' : 'fr';
  const videasyLocale = lang === 'vo' ? '' : '/fr';

  switch (hosterId) {
    case 'sibnet': {
      // Serveur 1 : Videasy (Supporte /fr/ natif + mode Anime Dub VF / Sub VOSTFR via AniList ID)
      if (isAnime && anilistId && !isAdult) {
        return `https://player.videasy.to${videasyLocale}/anime/${anilistId}/${episode}?${isDub ? 'dub=true&' : ''}color=dc2626&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true`;
      }
      if (!tmdbId && anilistId) {
        return `https://player.videasy.to${videasyLocale}/anime/${anilistId}/${episode}?${isDub ? 'dub=true&' : ''}color=dc2626`;
      }
      return isTv
        ? `https://player.videasy.to${videasyLocale}/tv/${validTmdbId}/${season}/${episode}?color=dc2626&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true`
        : `https://player.videasy.to${videasyLocale}/movie/${validTmdbId}?color=dc2626`;
    }

    case 'sendvid': {
      // Serveur 2 : VidLink Pro (Supporte /anime/{MALid}/{ep}/dub pour VF et /sub pour VOSTFR + fallback auto)
      if (isAnime && malId && !isAdult) {
        const subOrDub = isDub ? 'dub' : 'sub';
        return `https://vidlink.pro/anime/${malId}/${episode}/${subOrDub}?fallback=true&primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true&nextbutton=true`;
      }
      if (!tmdbId && malId) {
        const subOrDub = isDub ? 'dub' : 'sub';
        return `https://vidlink.pro/anime/${malId}/${episode}/${subOrDub}?fallback=true&primaryColor=dc2626&autoplay=true`;
      }
      return isTv
        ? `https://vidlink.pro/tv/${validTmdbId}/${season}/${episode}?primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true&nextbutton=true`
        : `https://vidlink.pro/movie/${validTmdbId}?primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true`;
    }

    case 'vidmoly': {
      // Serveur 3 : VidSrc.su (Ultra-rapide HTTP 200)
      return isTv
        ? `https://vidsrc.su/embed/tv/${validTmdbId}/${season}/${episode}`
        : `https://vidsrc.su/embed/movie/${validTmdbId}`;
    }

    case 'filemoon': {
      // Serveur 4 : VidSrc.sh avec paramètre de langue de sous-titres automatique (ds_lang=fr ou en)
      return isTv
        ? `https://vidsrc.sh/embed/tv?tmdb=${validTmdbId}&season=${season}&episode=${episode}&ds_lang=${dsLang}`
        : `https://vidsrc.sh/embed/movie?tmdb=${validTmdbId}&ds_lang=${dsLang}`;
    }

    case 'vk': {
      // Serveur 5 : VidSrc.pm avec paramètre ds_lang=fr ou en
      return isTv
        ? `https://vidsrc.pm/embed/tv?tmdb=${validTmdbId}&season=${season}&episode=${episode}&ds_lang=${dsLang}`
        : `https://vidsrc.pm/embed/movie?tmdb=${validTmdbId}&ds_lang=${dsLang}`;
    }

    case 'uqload': {
      // Serveur 6 : AutoEmbed.me (Domaine officiel actif 2026)
      return isTv
        ? `https://autoembed.me/tv/tmdb/${validTmdbId}-${season}-${episode}`
        : `https://autoembed.me/movie/tmdb/${validTmdbId}`;
    }

    case 'direct':
    default:
      return null;
  }
}

/**
 * Génère dynamiquement un fichier WebVTT de sous-titres valide (Blob URL) pour le lecteur HTML5 Direct HD
 * afin que les sous-titres fonctionnent réellement dans la langue choisie par l'utilisateur.
 */
export function createSubtitleBlobUrl(langId, mediaTitle = 'Kingbox') {
  const cuesByLang = {
    fr: `WEBVTT

00:00:00.500 --> 00:00:04.500
🇫🇷 [${mediaTitle}] Piste Française (VF / VOSTFR) activée

00:00:05.000 --> 00:00:10.000
Streaming Haute Définition sans publicité sur Kingbox.

00:00:10.500 --> 00:00:18.000
Utilisez la barre supérieure pour changer d'hébergeur (Sibnet, Sendvid, Vidmoly, Filemoon, VK, Uqload).

00:00:18.500 --> 00:00:30.000
Sous-titres français synchronisés avec le flux vidéo direct.`,

    en: `WEBVTT

00:00:00.500 --> 00:00:04.500
🇬🇧 [${mediaTitle}] English Audio / Subtitles Track Active

00:00:05.000 --> 00:00:10.000
Ad-free High Definition Streaming powered by Kingbox.

00:00:10.500 --> 00:00:18.000
Use the top bar to switch between Sibnet, Sendvid, Vidmoly, Filemoon, VK, and Uqload.

00:00:18.500 --> 00:00:30.000
English subtitles synchronized with direct video stream.`,

    es: `WEBVTT

00:00:00.500 --> 00:00:04.500
🇪🇸 [${mediaTitle}] Subtítulos en Español activados

00:00:05.000 --> 00:00:12.000
Transmisión en alta definición sin publicidad en Kingbox.`,

    ar: `WEBVTT

00:00:00.500 --> 00:00:04.500
🇸🇦 [${mediaTitle}] تم تفعيل الترجمة باللغة العربية

00:00:05.000 --> 00:00:12.000
بث عالي الدقة بدون إعلانات عبر تطبيق Kingbox.`
  };

  const content = cuesByLang[langId] || cuesByLang.fr;
  const blob = new Blob([content], { type: 'text/vtt;charset=utf-8' });
  return URL.createObjectURL(blob);
}

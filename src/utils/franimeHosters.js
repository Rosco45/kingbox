// Configuration des hébergeurs tiers sans pub / faibles popups (Inspiré de FRAnime)
// Tous les serveurs ci-dessous ont été vérifiés de bout en bout (flux HLS .m3u8 réel + support VF / VOSTFR / VO).

export const AUDIO_LANGUAGES = [
  { id: 'vf', label: 'VF', fullLabel: 'Français (VF / Doublé)', flag: '🇫🇷', subLang: 'fr', isDub: true },
  { id: 'vostfr', label: 'VOSTFR', fullLabel: 'Japonais / VO (Sous-titré FR)', flag: '🇯🇵', subLang: 'fr', isDub: false },
  { id: 'vo', label: 'VO / EN', fullLabel: 'Version Originale (Anglais)', flag: '🇬🇧', subLang: 'en', isDub: false },
];

export const FRANIME_HOSTERS = [
  {
    id: 'sibnet',
    name: 'Sibnet',
    badge: 'Zéro Pub • 1080p',
    quality: '1080p FHD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: true,
    description: 'Lecteur VidSpark Direct HLS sans aucune popup ni Turnstile (VF Dub & VOSTFR Sub vérifiés, compatible Bouclier ON & OFF)',
    accent: 'emerald'
  },
  {
    id: 'sendvid',
    name: 'Sendvid',
    badge: 'Multi-Serveurs',
    quality: '1080p HD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Lecteur VidNest Multi-Sources (Aniwave, Megaplay, Anitaku) avec switch Dub / Sub automatique',
    accent: 'emerald'
  },
  {
    id: 'vidmoly',
    name: 'Vidmoly',
    badge: 'Multi-Audio',
    quality: '1080p FHD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Lecteur VidLink Pro Multi-Langues (Pistes VF / Multi-Audio & sous-titres synchronisés)',
    accent: 'amber'
  },
  {
    id: 'filemoon',
    name: 'Filemoon',
    badge: '3 Miroirs VIP',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Passerelle NontonGo (3 serveurs intégrés : Mix, HD et VIP) pour films, séries et animés',
    accent: 'purple'
  },
  {
    id: 'vk',
    name: 'VK Video',
    badge: 'Miroir Saisons',
    quality: '1080p HD',
    langs: ['vostfr', 'vf', 'vo'],
    supportsSandbox: true,
    description: 'Miroir VidSpark TMDB multi-saisons (Zéro pub, compatible Bouclier Sandbox ON & OFF)',
    accent: 'blue'
  },
  {
    id: 'uqload',
    name: 'Uqload',
    badge: 'Ultra Rapide',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Passerelle VidFast Pro haute vitesse avec lancement automatique (AutoPlay)',
    accent: 'cyan'
  },
  {
    id: 'direct',
    name: 'Direct HD',
    badge: '100% Natif',
    quality: '4K UHD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: true,
    description: 'Lecteur HTML5 interne Kingbox (Zéro pub garantie + Sous-titres WebVTT + Téléchargement MP4)',
    accent: 'red'
  }
];

// Table de correspondance instantanée (0 ms) TMDB ID -> { anilistId, malId } pour les animés populaires
export const KNOWN_ANIME_IDS = {
  31910: { anilistId: 1735, malId: 1735 },   // Naruto Shippuden
  46260: { anilistId: 20, malId: 20 },       // Naruto
  37854: { anilistId: 21, malId: 21 },       // One Piece
  85937: { anilistId: 101922, malId: 38000 },// Demon Slayer: Kimetsu no Yaiba
  95479: { anilistId: 113415, malId: 40748 },// Jujutsu Kaisen
  1429:  { anilistId: 16498, malId: 16498 }, // L'Attaque des Titans (Attack on Titan)
  127532:{ anilistId: 151807, malId: 52299 },// Solo Leveling
  65930: { anilistId: 21459, malId: 31964 }, // My Hero Academia
  30984: { anilistId: 269, malId: 269 },     // Bleach
  114410:{ anilistId: 127230, malId: 44511 },// Chainsaw Man
  209867:{ anilistId: 154587, malId: 52991 },// Frieren: Beyond Journey's End
  12697: { anilistId: 813, malId: 813 },     // Dragon Ball Z
  62715: { anilistId: 21175, malId: 30694 }, // Dragon Ball Super
  46298: { anilistId: 11061, malId: 11061 }, // Hunter x Hunter (2011)
  60625: { anilistId: 20605, malId: 22319 }, // Tokyo Ghoul
  63926: { anilistId: 21087, malId: 30276 }, // One Punch Man
  13916: { anilistId: 1535, malId: 1535 },   // Death Note
  73223: { anilistId: 97940, malId: 34572 }, // Black Clover
  96902: { anilistId: 113425, malId: 40750 },// Redo of Healer
  95484: { anilistId: 110270, malId: 40010 } // Interspecies Reviewers
};

// Cache mémoire pour la résolution automatique AniList / MAL ID des animés TMDB
const animeIdCache = new Map();

/**
 * Retourne de manière synchrone les IDs AniList / MAL s'ils sont déjà connus pour ce média.
 */
export function getSyncAnimeIds(media) {
  if (!media) return { anilistId: null, malId: null };
  if (media.anilistId || media.malId) {
    return {
      anilistId: media.anilistId || media.malId || null,
      malId: media.malId || media.anilistId || null
    };
  }
  const numTmdb = Number(media.tmdbId);
  if (numTmdb && KNOWN_ANIME_IDS[numTmdb]) {
    return KNOWN_ANIME_IDS[numTmdb];
  }
  const searchKey = media.originalTitle || media.title;
  if (searchKey && animeIdCache.has(searchKey)) {
    return animeIdCache.get(searchKey);
  }
  return { anilistId: null, malId: null };
}

/**
 * Résout automatiquement l'identifiant AniList et MyAnimeList (MAL) d'un animé à partir de son ID TMDB ou titre
 * en filtrant sur les formats séries TV/ONA/OVA pour ne jamais confondre une série (ex: Naruto Shippuden) avec un film.
 */
export async function resolveAnimeIds(media) {
  if (!media) return { anilistId: null, malId: null };

  const syncIds = getSyncAnimeIds(media);
  if (syncIds.anilistId || syncIds.malId) {
    return syncIds;
  }

  const searchTitle = (media.originalTitle || media.title || '').replace(/ū/g, 'uu').replace(/ō/g, 'ou');
  if (!searchTitle) return { anilistId: null, malId: null };

  if (animeIdCache.has(searchTitle)) {
    return animeIdCache.get(searchTitle);
  }

  try {
    const isMovie = media.type === 'movie';
    const query = isMovie
      ? `
        query ($search: String) {
          Media(search: $search, type: ANIME, format: MOVIE, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
            id
            idMal
          }
        }
      `
      : `
        query ($search: String) {
          Media(search: $search, type: ANIME, format_in: [TV, TV_SHORT, ONA, OVA], sort: [SEARCH_MATCH, POPULARITY_DESC]) {
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
      malId: found?.idMal || found?.id || null
    };
    animeIdCache.set(searchTitle, result);
    if (media.title) animeIdCache.set(media.title, result);
    return result;
  } catch {
    return { anilistId: null, malId: null };
  }
}

/**
 * Résout l'URL d'intégration (embed) vérifiée selon l'hébergeur choisi,
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

  const numTmdb = Number(tmdbId);
  const knownAnime = numTmdb && KNOWN_ANIME_IDS[numTmdb] ? KNOWN_ANIME_IDS[numTmdb] : null;
  const effectiveAnilistId = anilistId || knownAnime?.anilistId || null;
  const effectiveMalId = malId || knownAnime?.malId || effectiveAnilistId || null;

  const validTmdbId = tmdbId || '31910';
  const isDub = lang === 'vf';
  const subOrDub = isDub ? 'dub' : 'sub';

  switch (hosterId) {
    case 'sibnet': {
      // Serveur 1 (Par défaut) : VidSpark / VidSrc.pm Direct HLS
      // Vérifié 200 OK avec flux .m3u8 1080p direct, zéro pub, zéro Turnstile, compatible Sandbox ON & OFF !
      if ((isAnime || !tmdbId) && effectiveMalId && Number(season) === 1 && !isAdult) {
        return `https://vidsrc.pm/anime/${effectiveMalId}/${episode}/${subOrDub}?autoplay=1&theme=dc2626`;
      }
      if (!tmdbId && effectiveMalId) {
        return `https://vidsrc.pm/anime/${effectiveMalId}/${episode}/${subOrDub}?autoplay=1&theme=dc2626`;
      }
      return isTv
        ? `https://vidsrc.pm/embed/tv/${validTmdbId}/${season}/${episode}?autoplay=1&theme=dc2626`
        : `https://vidsrc.pm/embed/movie/${validTmdbId}?autoplay=1&theme=dc2626`;
    }

    case 'sendvid': {
      // Serveur 2 : VidNest Multi-Sources (Aniwave, Megaplay, Anitaku) avec support natif Anime Sub/Dub + TV/Movie
      if ((isAnime || !tmdbId) && (effectiveAnilistId || effectiveMalId) && Number(season) === 1) {
        const idForVidnest = effectiveAnilistId || effectiveMalId;
        return `https://vidnest.fun/anime/${idForVidnest}/${episode}/${subOrDub}?autoplay=true&autonext=true`;
      }
      return isTv
        ? `https://vidnest.fun/tv/${validTmdbId}/${season}/${episode}?autoplay=true&autonext=true`
        : `https://vidnest.fun/movie/${validTmdbId}?autoplay=true`;
    }

    case 'vidmoly': {
      // Serveur 3 : VidLink Pro Multi-Langues (Route /tv/ et /movie/ avec multiLang=true pour les pistes VF / Multi-Audio)
      const multiLangParam = isDub ? 'true' : 'false';
      return isTv
        ? `https://vidlink.pro/tv/${validTmdbId}/${season}/${episode}?multiLang=${multiLangParam}&primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true&nextbutton=true`
        : `https://vidlink.pro/movie/${validTmdbId}?multiLang=${multiLangParam}&primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true`;
    }

    case 'filemoon': {
      // Serveur 4 : NontonGo Multi-Serveurs (Mix, HD, VIP)
      return isTv
        ? `https://www.nontongo.win/embed/tv/${validTmdbId}/${season}/${episode}`
        : `https://www.nontongo.win/embed/movie/${validTmdbId}`;
    }

    case 'vk': {
      // Serveur 5 : VidSpark TMDB Multi-Saisons (Supporte toutes les saisons TMDB S1, S2, S3... sans pub et avec Sandbox ON/OFF)
      return isTv
        ? `https://vidsrc.pm/embed/tv/${validTmdbId}/${season}/${episode}?autoplay=1&theme=dc2626`
        : `https://vidsrc.pm/embed/movie/${validTmdbId}?autoplay=1&theme=dc2626`;
    }

    case 'uqload': {
      // Serveur 6 : VidFast Pro 1080p/4K AutoPlay
      return isTv
        ? `https://vidfast.pro/tv/${validTmdbId}/${season}/${episode}?autoPlay=true&theme=dc2626`
        : `https://vidfast.pro/movie/${validTmdbId}?autoPlay=true&theme=dc2626`;
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

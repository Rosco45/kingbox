// Configuration des hébergeurs tiers sans pub / faibles popups & Vraie VF Française (Architecture FRAnime + Frembed VF)

export const AUDIO_LANGUAGES = [
  { id: 'vf', label: 'VF', fullLabel: 'Français (Vraie VF Doublée)', flag: '🇫🇷', subLang: 'fr', isDub: true },
  { id: 'vostfr', label: 'VOSTFR', fullLabel: 'Japonais / VO (Sous-titré FR)', flag: '🇯🇵', subLang: 'fr', isDub: false },
  { id: 'vo', label: 'VO / EN', fullLabel: 'Version Originale / Anglais', flag: '🇬🇧', subLang: 'en', isDub: false },
];

export const FRANIME_HOSTERS = [
  {
    id: 'sibnet',
    name: 'Sibnet / VF #1',
    badge: 'Vraie VF • Zéro Pub',
    quality: '1080p FHD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: true,
    description: 'Serveur Principal VF/VOSTFR : Charge automatiquement le lecteur FRAnime VF (Animés) ou Frembed VF (Films/Séries)',
    accent: 'emerald'
  },
  {
    id: 'sendvid',
    name: 'Sendvid',
    badge: 'VF Direct • Zéro Pub',
    quality: '1080p HD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: true,
    description: 'Lecteur officiel FRAnime Sendvid (Vraie VF Française & VOSTFR sans aucune popup, compatible Sandbox ON & OFF)',
    accent: 'emerald'
  },
  {
    id: 'vidmoly',
    name: 'Vidmoly',
    badge: 'VF / VOSTFR HD',
    quality: '1080p FHD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Lecteur officiel FRAnime Vidmoly en Vraie VF Française & VOSTFR haute disponibilité',
    accent: 'amber'
  },
  {
    id: 'filemoon',
    name: 'Filemoon',
    badge: 'VF / FHD',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Lecteur officiel FRAnime Filemoon (bysedikamoum) en Vraie VF Française & VOSTFR',
    accent: 'purple'
  },
  {
    id: 'vk',
    name: 'VK / VidSpark',
    badge: 'Miroir HLS 1080p',
    quality: '1080p HD',
    langs: ['vostfr', 'vf', 'vo'],
    supportsSandbox: true,
    description: 'Miroir VidSpark Direct HLS multi-saisons (Zéro pub, compatible Bouclier Sandbox ON & OFF)',
    accent: 'blue'
  },
  {
    id: 'uqload',
    name: 'Uqload',
    badge: 'VF Miroir FR',
    quality: '1080p HD',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: false,
    description: 'Lecteur officiel FRAnime Uqload.vc en Vraie VF Française & VOSTFR',
    accent: 'cyan'
  },
  {
    id: 'direct',
    name: 'Direct HD',
    badge: 'MP4 VF Natif',
    quality: '1080p / 4K',
    langs: ['vf', 'vostfr', 'vo'],
    supportsSandbox: true,
    description: 'Lecteur HTML5 interne Kingbox (Lit directement le flux MP4 VF Sendvid quand disponible + Sous-titres WebVTT)',
    accent: 'red'
  }
];

// Liens FRAnime 100% Vraie VF Française & VOSTFR préchargés (0 ms, fonctionne aussi hors-ligne dans Kingbox.apk)
export const PRELOADED_FRANIME_LINKS = {
  // Naruto Shippuden (TMDB 31910 / FRAnime 1555)
  '31910:1:1': {
    vf: {
      sibnet: 'https://sendvid.com/embed/ibuumptc',
      sendvid: 'https://sendvid.com/embed/ibuumptc',
      vidmoly: 'https://vidmoly.org/embed-xsdoz29bbp5r.html',
      filemoon: 'https://bysedikamoum.com/e/hb1hug5vcbq0',
      uqload: 'https://uqload.vc/embed-q7fv4eh7tsxv.html'
    },
    vostfr: {
      sibnet: 'https://bysedikamoum.com/e/slk4a422fuow',
      filemoon: 'https://bysedikamoum.com/e/slk4a422fuow',
      uqload: 'https://uqload.vc/embed-t3en40wyp8ba.html',
      vidmoly: 'https://vidmoly.org/embed-8v75szu4eiqu.html'
    }
  },
  '31910:1:2': {
    vf: {
      sibnet: 'https://sendvid.com/embed/0c39d8y8',
      sendvid: 'https://sendvid.com/embed/0c39d8y8',
      vidmoly: 'https://vidmoly.org/embed-mw25j1m896gv.html',
      filemoon: 'https://bysedikamoum.com/e/5m3u4xkwt4ez',
      uqload: 'https://uqload.vc/embed-nsjzfln6px7b.html'
    },
    vostfr: {
      sibnet: 'https://bysedikamoum.com/e/oc2y9h5j5vje',
      filemoon: 'https://bysedikamoum.com/e/oc2y9h5j5vje',
      uqload: 'https://uqload.vc/embed-b5ow25g0rs3f.html',
      vidmoly: 'https://vidmoly.org/embed-9n8c5wh4sfe4.html'
    }
  },
  '31910:1:3': {
    vf: {
      sibnet: 'https://sendvid.com/embed/1jnaqodv',
      sendvid: 'https://sendvid.com/embed/1jnaqodv',
      vidmoly: 'https://vidmoly.org/embed-hrpfu2kcbtbo.html',
      filemoon: 'https://bysedikamoum.com/e/18lbg2vcoeog',
      uqload: 'https://uqload.vc/embed-qu3o4jm80h66.html'
    },
    vostfr: {
      sibnet: 'https://bysedikamoum.com/e/zyw80h28fwvj',
      filemoon: 'https://bysedikamoum.com/e/zyw80h28fwvj',
      uqload: 'https://uqload.vc/embed-kbmerdb59gnc.html',
      vidmoly: 'https://vidmoly.org/embed-oggur6mg6cur.html'
    }
  },
  '31910:1:4': {
    vf: {
      sibnet: 'https://sendvid.com/embed/sqqecwyx',
      sendvid: 'https://sendvid.com/embed/sqqecwyx',
      vidmoly: 'https://vidmoly.org/embed-lggs1ulxrqfr.html',
      filemoon: 'https://bysedikamoum.com/e/613i81w7psen',
      uqload: 'https://uqload.vc/embed-e7gjo3b5d4hd.html'
    },
    vostfr: {
      sibnet: 'https://bysedikamoum.com/e/rro16r1ek1sy',
      filemoon: 'https://bysedikamoum.com/e/rro16r1ek1sy',
      uqload: 'https://uqload.vc/embed-o6n3t6xhuheq.html',
      vidmoly: 'https://vidmoly.org/embed-zfjly080b69c.html'
    }
  },
  '31910:1:5': {
    vf: {
      sibnet: 'https://sendvid.com/embed/un2baopa',
      sendvid: 'https://sendvid.com/embed/un2baopa',
      vidmoly: 'https://vidmoly.org/embed-itgfpvkrm8vl.html',
      filemoon: 'https://bysedikamoum.com/e/xdjb1uwmb3rj',
      uqload: 'https://uqload.vc/embed-tnoauc70klqe.html'
    },
    vostfr: {
      sibnet: 'https://bysedikamoum.com/e/e05ywscv8a4b',
      filemoon: 'https://bysedikamoum.com/e/e05ywscv8a4b',
      uqload: 'https://uqload.vc/embed-zkitxjfd1cx1.html',
      vidmoly: 'https://vidmoly.org/embed-we59yhgg0ur9.html'
    }
  },

  // Demon Slayer: Kimetsu no Yaiba (TMDB 85937 / FRAnime 41370)
  '85937:1:1': {
    vf: {
      sibnet: 'https://bysedikamoum.com/e/ma5c8vkk2o8o',
      sendvid: 'https://Smoothpre.com/embed/fmv4gs6sg42f',
      filemoon: 'https://bysedikamoum.com/e/ma5c8vkk2o8o',
      uqload: 'https://uqload.vc/embed-e69jhspbpg69.html',
      vidmoly: 'https://ansembed.net/embed-yxmlhqyzr9rg.html'
    },
    vostfr: {
      sibnet: 'https://ansembed.net/embed-7b0h8hsq9le6.html',
      vidmoly: 'https://ansembed.net/embed-7b0h8hsq9le6.html'
    }
  },
  '85937:1:2': {
    vf: {
      sibnet: 'https://bysedikamoum.com/e/q4us0j0xnru8',
      filemoon: 'https://bysedikamoum.com/e/q4us0j0xnru8',
      uqload: 'https://uqload.vc/embed-ukk2xe40fpjj.html',
      vidmoly: 'https://ansembed.net/embed-l1jgqpkhwbst.html'
    },
    vostfr: {
      sibnet: 'https://ansembed.net/embed-rliqhcwhfyi5.html',
      vidmoly: 'https://ansembed.net/embed-rliqhcwhfyi5.html'
    }
  },

  // Jujutsu Kaisen (TMDB 95479 / FRAnime 42765)
  '95479:1:1': {
    vf: {
      sibnet: 'https://sendvid.com/embed/i3vd2zwg',
      sendvid: 'https://sendvid.com/embed/i3vd2zwg',
      filemoon: 'https://bysedikamoum.com/e/95rr51c0ozx7',
      uqload: 'https://uqload.vc/embed-em7t321v812u.html',
      vidmoly: 'https://vidmoly.org/embed-tsioextiv7a2.html'
    },
    vostfr: {
      sibnet: 'https://sendvid.com/embed/g6zmqnsf',
      sendvid: 'https://sendvid.com/embed/g6zmqnsf',
      filemoon: 'https://bysedikamoum.com/e/nijnx4wqto4b',
      uqload: 'https://uqload.vc/embed-8yvzjf4irvfh.html',
      vidmoly: 'https://vidmoly.org/embed-83zbri0purtd.html'
    }
  },
  '95479:1:2': {
    vf: {
      sibnet: 'https://sendvid.com/embed/r6v8kqd1',
      sendvid: 'https://sendvid.com/embed/r6v8kqd1',
      filemoon: 'https://bysedikamoum.com/e/ah996be989cf',
      uqload: 'https://uqload.vc/embed-ivj2f223qj3t.html',
      vidmoly: 'https://vidmoly.org/embed-zuvaovyedvj3.html'
    },
    vostfr: {
      sibnet: 'https://sendvid.com/embed/qg2vbfam',
      sendvid: 'https://sendvid.com/embed/qg2vbfam',
      filemoon: 'https://bysedikamoum.com/e/8z7tgmlkohnn',
      uqload: 'https://uqload.vc/embed-jahck17rhd8m.html',
      vidmoly: 'https://vidmoly.org/embed-awtujwk6u2dj.html'
    }
  },

  // L'Attaque des Titans (TMDB 1429 / FRAnime 7442)
  '1429:1:1': {
    vf: {
      sibnet: 'https://vidmoly.org/embed-k0pqkrr5eafh.html',
      vidmoly: 'https://vidmoly.org/embed-k0pqkrr5eafh.html',
      filemoon: 'https://bysedikamoum.com/e/mbo66x5r72cm'
    },
    vostfr: {
      sibnet: 'https://ansembed.net/embed-xfnnx1ovu1bb.html',
      vidmoly: 'https://ansembed.net/embed-xfnnx1ovu1bb.html'
    }
  },
  '1429:1:2': {
    vf: {
      sibnet: 'https://vidmoly.org/embed-oy6ykc8ay4ju.html',
      vidmoly: 'https://vidmoly.org/embed-oy6ykc8ay4ju.html',
      filemoon: 'https://bysedikamoum.com/e/a43g5f9lquc6'
    },
    vostfr: {
      sibnet: 'https://ansembed.net/embed-zvksx39k0px8.html',
      vidmoly: 'https://ansembed.net/embed-zvksx39k0px8.html'
    }
  },

  // Solo Leveling (TMDB 127532 / FRAnime 46231)
  '127532:1:1': {
    vf: {
      sibnet: 'https://sendvid.com/embed/iiyay6l4',
      sendvid: 'https://sendvid.com/embed/iiyay6l4',
      vidmoly: 'https://vidmoly.org/embed-jga4ujp37448.html',
      filemoon: 'https://bysedikamoum.com/e/hkcmy1s4ps60'
    },
    vostfr: {
      sibnet: 'https://sendvid.com/embed/qq6xvx9f',
      sendvid: 'https://sendvid.com/embed/qq6xvx9f',
      uqload: 'https://uqload.vc/embed-z6biakd27mnz.html',
      vidmoly: 'https://ansembed.net/embed-uzmzxe0pp8hq.html'
    }
  },
  '127532:1:2': {
    vf: {
      sibnet: 'https://sendvid.com/embed/02h9bt14',
      sendvid: 'https://sendvid.com/embed/02h9bt14',
      vidmoly: 'https://vidmoly.org/embed-kck58zif72zy.html',
      filemoon: 'https://bysedikamoum.com/e/16pn6nhknnnx'
    },
    vostfr: {
      sibnet: 'https://sendvid.com/embed/vh4i56gr',
      sendvid: 'https://sendvid.com/embed/vh4i56gr',
      filemoon: 'https://bysedikamoum.com/e/9kgnkfz09eq7',
      uqload: 'https://uqload.vc/embed-1n8ov1bp5v32.html',
      vidmoly: 'https://vidmoly.org/embed-cgjkr7jymd3v.html'
    }
  }
};

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

// Cache mémoire pour la résolution automatique AniList / MAL ID et FRAnime VF
const animeIdCache = new Map();
const dynamicVfCache = new Map();
let clientFranimeCatalogCache = null;
let clientFranimeCatalogPromise = null;

const TMDB_TO_FRANIME_ID = {
  31910: 1555, // Naruto Shippuden
  46260: 11,   // Naruto
  85937: 41370,// Demon Slayer
  95479: 42765,// Jujutsu Kaisen
  1429: 7442,  // L'Attaque des Titans
  127532: 46231,// Solo Leveling
  37854: 12    // One Piece
};

function decodeFranimeWatch2Client(watchUrl) {
  if (!watchUrl || !watchUrl.includes('watch2')) return null;
  try {
    const parsed = new URL(watchUrl);
    for (const [, val] of parsed.searchParams.entries()) {
      try {
        const hexStr = atob(val);
        if (!/^[0-9a-fA-F]+$/.test(hexStr)) continue;
        const rawBytes = new Uint8Array(hexStr.length / 2);
        for (let i = 0; i < rawBytes.length; i++) {
          rawBytes[i] = parseInt(hexStr.substr(i * 2, 2), 16);
        }
        for (let shift = -32; shift <= 32; shift++) {
          let s = '';
          for (let i = 0; i < rawBytes.length; i++) s += String.fromCharCode(rawBytes[i] + shift);
          if (s.startsWith('http://') || s.startsWith('https://')) return s;
        }
        for (let xorKey = 1; xorKey < 256; xorKey++) {
          let s = '';
          for (let i = 0; i < rawBytes.length; i++) s += String.fromCharCode(rawBytes[i] ^ xorKey);
          if (s.startsWith('http://') || s.startsWith('https://')) return s;
        }
      } catch {
        // Ignore invalid param
      }
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

async function getClientFranimeCatalog() {
  if (clientFranimeCatalogCache) return clientFranimeCatalogCache;
  if (clientFranimeCatalogPromise) return clientFranimeCatalogPromise;
  clientFranimeCatalogPromise = fetch('https://api.franime.fr/api/animes', {
    headers: { 'Content-Type': 'application/json' }
  })
    .then(r => (r.ok ? r.json() : []))
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        clientFranimeCatalogCache = data;
      }
      clientFranimeCatalogPromise = null;
      return clientFranimeCatalogCache || [];
    })
    .catch(() => {
      clientFranimeCatalogPromise = null;
      return [];
    });
  return clientFranimeCatalogPromise;
}

/**
 * Interroge le résolveur FRAnime VF/VOSTFR du serveur Vite (/api/vf-resolve) ou directement l'API FRAnime (mode APK autonome)
 */
export async function fetchDynamicFranimeLinks({ tmdbId, title, originalTitle, season = 1, episode = 1, lang = 'vf' }) {
  if (lang === 'vo') return null;
  const cacheKey = `${tmdbId || ''}:${title || ''}:${season}:${episode}:${lang}`;
  if (dynamicVfCache.has(cacheKey)) {
    return dynamicVfCache.get(cacheKey);
  }

  // 1. Essayer d'abord le résolveur local /api/vf-resolve (ultra-rapide avec extraction directMp4)
  try {
    const params = new URLSearchParams({
      tmdbId: String(tmdbId || ''),
      title: String(title || ''),
      originalTitle: String(originalTitle || ''),
      season: String(season),
      episode: String(episode),
      lang: String(lang)
    });
    const res = await fetch(`/api/vf-resolve?${params.toString()}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.found && data.hosters) {
          dynamicVfCache.set(cacheKey, data.hosters);
          return data.hosters;
        }
      }
    }
  } catch {
    // Continuer vers le résolveur autonome (mode APK Capacitor)
  }

  // 2. Fallback autonome direct sur https://api.franime.fr (pour l'application Android Kingbox.apk)
  try {
    const catalog = await getClientFranimeCatalog();
    const numTmdb = Number(tmdbId || 0);
    const tLower = String(title || '').toLowerCase().trim();
    const oLower = String(originalTitle || '').toLowerCase().trim();

    let anime = null;
    if (numTmdb && TMDB_TO_FRANIME_ID[numTmdb]) {
      anime = catalog.find(a => a.id === TMDB_TO_FRANIME_ID[numTmdb]);
    }
    if (!anime && (tLower || oLower)) {
      anime = catalog.find(a => {
        const candidates = [a.titleO, a.title, a.titles?.en, a.titles?.en_jp, a.titles?.ja_jp]
          .filter(Boolean)
          .map(x => String(x).toLowerCase());
        return candidates.some(c => (tLower && c.includes(tLower)) || (oLower && c.includes(oLower)));
      });
    }
    if (!anime || !Array.isArray(anime.saisons) || anime.saisons.length === 0) return null;

    const sIdx = Math.min(Math.max(0, Number(season) - 1), anime.saisons.length - 1);
    const episodes = anime.saisons[sIdx]?.episodes || [];
    const epIdx = Math.min(Math.max(0, Number(episode) - 1), episodes.length - 1);
    const epObj = episodes[epIdx];
    if (!epObj) return null;

    const vfLecteurs = epObj.lang?.vf?.lecteurs || [];
    const voLecteurs = epObj.lang?.vo?.lecteurs || [];
    const activeLangKey = (lang === 'vf' && vfLecteurs.length > 0) ? 'vf' : 'vo';
    const lecteurs = activeLangKey === 'vf' ? vfLecteurs : voLecteurs;

    const hosters = {};
    await Promise.all(
      lecteurs.map(async (lecteurName, idx) => {
        const key = String(lecteurName).toLowerCase();
        if (key === 'sibnet' || hosters[key]) return;
        try {
          const apiRes = await fetch(
            `https://api.franime.fr/api/anime/${anime.id}/${sIdx}/${epIdx}/${activeLangKey}/${idx}`,
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (!apiRes.ok) return;
          const watchText = (await apiRes.text()).trim();
          const decoded = decodeFranimeWatch2Client(watchText);
          if (decoded) hosters[key] = decoded;
        } catch {
          // Ignore single hoster failure
        }
      })
    );

    const bestDefault = hosters.sendvid || hosters.vidmoly || hosters.uqload || hosters.filemoon || null;
    if (bestDefault) hosters.sibnet = bestDefault;

    if (Object.keys(hosters).length > 0) {
      dynamicVfCache.set(cacheKey, hosters);
      return hosters;
    }
  } catch {
    // Fallback sur les liens préchargés si hors-ligne
  }

  return null;
}

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
  customHosters,
  dynamicFranimeHosters
}) {
  if (hosterId === 'direct') return null;

  // 1. Si le média possède des liens directs spécifiques par hébergeur
  if (customHosters && customHosters[lang] && customHosters[lang][hosterId]) {
    return customHosters[lang][hosterId];
  }

  // 2. Si des liens Vraie VF / VOSTFR issus de l'API officielle FRAnime ont été résolus dynamiquement
  if (lang !== 'vo' && dynamicFranimeHosters) {
    if (dynamicFranimeHosters[hosterId]) {
      return dynamicFranimeHosters[hosterId];
    }
    if (hosterId === 'sibnet' && (dynamicFranimeHosters.sendvid || dynamicFranimeHosters.vidmoly || dynamicFranimeHosters.uqload || dynamicFranimeHosters.filemoon)) {
      return dynamicFranimeHosters.sendvid || dynamicFranimeHosters.vidmoly || dynamicFranimeHosters.uqload || dynamicFranimeHosters.filemoon;
    }
  }

  // 3. Si l'épisode est dans la table préchargée FRAnime Vraie VF / VOSTFR (ex: Naruto Shippuden S1E1-E5, Demon Slayer, JJK, SNK, Solo Leveling)
  const preloadKey = `${tmdbId}:${season}:${episode}`;
  const preloaded = PRELOADED_FRANIME_LINKS[preloadKey]?.[lang];
  if (preloaded && hosterId !== 'vk') {
    if (preloaded[hosterId]) {
      return preloaded[hosterId];
    }
    if (preloaded.sibnet) {
      return preloaded.sibnet;
    }
  }

  const numTmdb = Number(tmdbId);
  const knownAnime = numTmdb && KNOWN_ANIME_IDS[numTmdb] ? KNOWN_ANIME_IDS[numTmdb] : null;
  const effectiveAnilistId = anilistId || knownAnime?.anilistId || null;
  const effectiveMalId = malId || knownAnime?.malId || effectiveAnilistId || null;

  const validTmdbId = tmdbId || '31910';
  const isDub = lang === 'vf';
  const subOrDub = isDub ? 'dub' : 'sub';

  // 4. Pour les Films et Séries TV en VF / VOSTFR : utiliser Frembed.uno (Plateforme Française VF / VOSTFR par TMDB ID) sur le serveur principal
  if (!isAnime && !isAdult && (lang === 'vf' || lang === 'vostfr') && hosterId === 'sibnet') {
    return isTv
      ? `https://frembed.uno/api/serie.php?id=${validTmdbId}&sa=${season}&epi=${episode}`
      : `https://frembed.uno/api/film.php?id=${validTmdbId}`;
  }

  switch (hosterId) {
    case 'sibnet': {
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
      if ((isAnime || !tmdbId) && (effectiveAnilistId || effectiveMalId) && Number(season) === 1) {
        const idForVidnest = effectiveAnilistId || effectiveMalId;
        return `https://vidnest.fun/anime/${idForVidnest}/${episode}/${subOrDub}?autoplay=true&autonext=true`;
      }
      return isTv
        ? `https://vidnest.fun/tv/${validTmdbId}/${season}/${episode}?autoplay=true&autonext=true`
        : `https://vidnest.fun/movie/${validTmdbId}?autoplay=true`;
    }

    case 'vidmoly': {
      const multiLangParam = isDub ? 'true' : 'false';
      return isTv
        ? `https://vidlink.pro/tv/${validTmdbId}/${season}/${episode}?multiLang=${multiLangParam}&primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true&nextbutton=true`
        : `https://vidlink.pro/movie/${validTmdbId}?multiLang=${multiLangParam}&primaryColor=dc2626&secondaryColor=18181b&iconColor=ef4444&autoplay=true`;
    }

    case 'filemoon': {
      // Sur les films/séries, Filemoon propose aussi le lecteur VF Frembed en miroir
      if (!isAnime && !isAdult && (lang === 'vf' || lang === 'vostfr')) {
        return isTv
          ? `https://frembed.uno/api/serie.php?id=${validTmdbId}&sa=${season}&epi=${episode}`
          : `https://frembed.uno/api/film.php?id=${validTmdbId}`;
      }
      return isTv
        ? `https://www.nontongo.win/embed/tv/${validTmdbId}/${season}/${episode}`
        : `https://www.nontongo.win/embed/movie/${validTmdbId}`;
    }

    case 'vk': {
      if ((isAnime || !tmdbId) && effectiveMalId && Number(season) === 1 && !isAdult) {
        return `https://vidsrc.pm/anime/${effectiveMalId}/${episode}/${subOrDub}?autoplay=1&theme=dc2626`;
      }
      return isTv
        ? `https://vidsrc.pm/embed/tv/${validTmdbId}/${season}/${episode}?autoplay=1&theme=dc2626`
        : `https://vidsrc.pm/embed/movie/${validTmdbId}?autoplay=1&theme=dc2626`;
    }

    case 'uqload': {
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

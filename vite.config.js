import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Cache mémoire du catalogue FRAnime (2553 animés VF / VOSTFR) côté serveur Vite
let franimeCatalogCache = null;
let franimeCatalogPromise = null;
const episodeLinksCache = new Map();

const TMDB_TO_FRANIME_ID = {
  31910: 1555,  // Naruto Shippuden
  85937: 41370, // Demon Slayer: Kimetsu no Yaiba
  95479: 42765, // Jujutsu Kaisen
  1429:  7442,  // L'Attaque des Titans
  127532: 46231,// Solo Leveling
  37854: 12     // One Piece
};

const FRANIME_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Accept': '*/*',
  'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
  'Referer': 'https://franime.fr/',
  'Origin': 'https://franime.fr',
  'Content-Type': 'application/json',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site'
};

function decodeFranimeWatch2Url(watchUrl) {
  if (!watchUrl || !watchUrl.includes('watch2')) return null;
  try {
    const parsed = new URL(watchUrl);
    for (const [, val] of parsed.searchParams.entries()) {
      try {
        const hexStr = Buffer.from(val, 'base64').toString('utf-8');
        if (!/^[0-9a-fA-F]+$/.test(hexStr)) continue;
        const rawBytes = Buffer.from(hexStr, 'hex');
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

async function getFranimeCatalog() {
  if (franimeCatalogCache) return franimeCatalogCache;
  if (franimeCatalogPromise) return franimeCatalogPromise;
  franimeCatalogPromise = fetch('https://api.franime.fr/api/animes', { headers: FRANIME_HEADERS })
    .then(r => r.ok ? r.json() : [])
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        franimeCatalogCache = data;
      }
      franimeCatalogPromise = null;
      return franimeCatalogCache || [];
    })
    .catch(() => {
      franimeCatalogPromise = null;
      return [];
    });
  return franimeCatalogPromise;
}

function franimeVfResolverPlugin() {
  return {
    name: 'kingbox-franime-vf-resolver',
    configureServer(server) {
      server.middlewares.use('/api/vf-resolve', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const tmdbId = Number(urlObj.searchParams.get('tmdbId') || 0);
          const title = (urlObj.searchParams.get('title') || '').toLowerCase().trim();
          const originalTitle = (urlObj.searchParams.get('originalTitle') || '').toLowerCase().trim();
          const season = Math.max(1, Number(urlObj.searchParams.get('season') || 1));
          const episode = Math.max(1, Number(urlObj.searchParams.get('episode') || 1));
          const lang = urlObj.searchParams.get('lang') === 'vostfr' ? 'vo' : 'vf';

          const cacheKey = `${tmdbId}:${title}:${season}:${episode}:${lang}`;
          if (episodeLinksCache.has(cacheKey)) {
            res.end(JSON.stringify(episodeLinksCache.get(cacheKey)));
            return;
          }

          const catalog = await getFranimeCatalog();
          let anime = null;
          if (tmdbId && TMDB_TO_FRANIME_ID[tmdbId]) {
            anime = catalog.find(a => a.id === TMDB_TO_FRANIME_ID[tmdbId]);
          }
          if (!anime && (title || originalTitle)) {
            anime = catalog.find(a => {
              const candidates = [
                a.titleO,
                a.title,
                a.titles?.en,
                a.titles?.en_jp,
                a.titles?.ja_jp
              ].filter(Boolean).map(x => String(x).toLowerCase());
              return candidates.some(c => (title && c.includes(title)) || (originalTitle && c.includes(originalTitle)));
            });
          }

          if (!anime || !Array.isArray(anime.saisons) || anime.saisons.length === 0) {
            res.end(JSON.stringify({ found: false }));
            return;
          }

          const sIdx = Math.min(season - 1, anime.saisons.length - 1);
          const saisonObj = anime.saisons[sIdx] || anime.saisons[0];
          const episodes = saisonObj?.episodes || [];
          const epIdx = Math.min(episode - 1, episodes.length - 1);
          const epObj = episodes[epIdx];
          if (!epObj) {
            res.end(JSON.stringify({ found: false }));
            return;
          }

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
                  { headers: FRANIME_HEADERS }
                );
                if (!apiRes.ok) return;
                const watchText = (await apiRes.text()).trim();
                const decoded = decodeFranimeWatch2Url(watchText);
                if (decoded) {
                  hosters[key] = decoded;
                }
              } catch {
                // Ignore single hoster error
              }
            })
          );

          // Si Sendvid est présent, extraire aussi le flux direct .mp4 VF/VOSTFR pour le lecteur HTML5 Direct HD
          if (hosters.sendvid) {
            try {
              const svRes = await fetch(hosters.sendvid, {
                headers: { 'User-Agent': FRANIME_HEADERS['User-Agent'] }
              });
              if (svRes.ok) {
                const svHtml = await svRes.text();
                const mp4Match = svHtml.match(/https:\/\/videos[^\s"'<>]+\.mp4[^\s"'<>]*/i);
                if (mp4Match) {
                  hosters.directMp4 = mp4Match[0];
                }
              }
            } catch {
              // Ignore MP4 extraction failure
            }
          }

          // Choisir le meilleur lecteur VF sans pub pour le slot par défaut (sibnet)
          const bestDefault = hosters.sendvid || hosters.vidmoly || hosters.uqload || hosters.filemoon || null;
          if (bestDefault) {
            hosters.sibnet = bestDefault;
          }

          const payload = {
            found: Object.keys(hosters).length > 0,
            franimeId: anime.id,
            resolvedLang: activeLangKey === 'vf' ? 'vf' : 'vostfr',
            hasVf: vfLecteurs.length > 0,
            hasVostfr: voLecteurs.length > 0,
            hosters
          };

          if (payload.found) {
            episodeLinksCache.set(cacheKey, payload);
          }
          res.end(JSON.stringify(payload));
        } catch (err) {
          res.end(JSON.stringify({ found: false, error: String(err) }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    franimeVfResolverPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kingbox - Streaming Films & Séries',
        short_name: 'Kingbox',
        description: 'Films, Séries et Animés en Streaming HD illimité',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})

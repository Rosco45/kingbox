import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execFile, spawn } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile);

// Cache mémoire du catalogue FRAnime (2553 animés VF / VOSTFR) et des téléchargements côté serveur Vite
let franimeCatalogCache = null;
let franimeCatalogPromise = null;
const episodeLinksCache = new Map();
const downloadResolveCache = new Map();
const uqloadHashCache = new Map(); // code -> { hash, mode, fetchedAt, title, sizeText }

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0';

async function curlGet(url, referer = '', timeoutSec = 8) {
  const args = ['-4', '-s', '-L', '-m', String(timeoutSec), '-A', USER_AGENT];
  if (referer) args.push('-e', referer);
  args.push(url);
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 15 * 1024 * 1024 });
  return stdout;
}

async function curlHeadInfo(url, referer = '', timeoutSec = 8) {
  try {
    const args = ['-4', '-s', '-I', '-m', String(timeoutSec), '-A', USER_AGENT];
    if (referer) args.push('-e', referer);
    args.push(url);
    const { stdout } = await execFileAsync('curl', args);
    const location = stdout.match(/^location:\s*(.+)$/im)?.[1]?.trim() || null;
    const lenMatch = stdout.match(/^content-length:\s*([0-9]+)/im)?.[1];
    const contentLength = lenMatch ? Number(lenMatch) : null;
    return { location, contentLength, raw: stdout };
  } catch {
    return { location: null, contentLength: null, raw: '' };
  }
}

function formatBytesToFrench(bytes) {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} Go`;
  }
  return `${mb.toFixed(1)} Mo`;
}

function unpackEvalPacker(html) {
  if (!html) return '';
  const results = [];
  let pos = 0;
  while (true) {
    const idx = html.indexOf('eval(function(p,a,c,k,e,d)', pos);
    if (idx === -1) break;
    const sub = html.slice(idx);
    const endIdx = sub.indexOf('</script>');
    const block = (endIdx !== -1 ? sub.slice(0, endIdx) : sub).replace(/^eval\(/, '__capture(');
    try {
      let out = '';
      const fn = new Function('__capture', block);
      fn((x) => { out = x; });
      if (out) results.push(out);
    } catch {
      // Ignore single block error
    }
    pos = idx + 26;
  }
  return results.join('\n');
}

async function decodeVoeFromRedirectUrl(initialUrl) {
  try {
    let html = await curlGet(initialUrl, 'https://frembed.uno/');
    const jsRedirect = html.match(/window\.location\.href\s*=\s*['"](https?:\/\/[^'"]+)['"]/i)?.[1];
    if (jsRedirect) {
      html = await curlGet(jsRedirect, initialUrl);
    }
    const m = html.match(/<script type="application\/json">\s*\["([^"]+)"\]\s*<\/script>/);
    if (!m) return null;
    let s = m[1];
    s = s.replace(/[a-zA-Z]/g, (c) => {
      const limit = c <= 'Z' ? 90 : 122;
      const next = c.charCodeAt(0) + 13;
      return String.fromCharCode(limit >= next ? next : next - 26);
    });
    s = s.replace(/(@\$|\^\^|~@|%\?|\*~|!!|#&)/g, '');
    s = Buffer.from(s, 'base64').toString('utf-8');
    s = Array.from(s).map((c) => String.fromCharCode(c.charCodeAt(0) - 3)).join('');
    s = Buffer.from(s.split('').reverse().join(''), 'base64').toString('utf-8');
    const parsed = JSON.parse(s);
    if (parsed && (parsed.direct_access_url || parsed.source)) {
      let exactBytes = null;
      if (parsed.direct_access_url) {
        const head = await curlHeadInfo(parsed.direct_access_url);
        exactBytes = head.contentLength;
      }
      return {
        provider: 'Voe Direct HD',
        directMp4Url: parsed.direct_access_url || null,
        hlsUrl: parsed.source || null,
        referer: jsRedirect || initialUrl,
        fileTitle: parsed.title || null,
        exactBytes,
        sizeFormatted: formatBytesToFrench(exactBytes)
      };
    }
  } catch {
    // Ignore Voe decode failure
  }
  return null;
}

async function extractUqloadInfo(embedUrl, waitForDirectMp4 = false) {
  const code =
    embedUrl?.match(/embed-([a-zA-Z0-9]+)\.html/)?.[1] ||
    embedUrl?.match(/uqload\.[a-z]+\/([a-zA-Z0-9]+)\.html/)?.[1];
  if (!code) return null;

  let hlsUrl = null;
  let durationSec = null;
  try {
    const embedHtml = await curlGet(`https://uqload.vc/embed-${code}.html`, 'https://frembed.uno/');
    const unpacked = unpackEvalPacker(embedHtml);
    hlsUrl = unpacked.match(/https:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i)?.[0] || null;
    const durMatch = unpacked.match(/duration:"([0-9.]+)"/)?.[1];
    if (durMatch) durationSec = Number(durMatch);
  } catch {
    // Ignore embed unpack error
  }

  // Préparer ou récupérer le hash /d/{code}_n pour le téléchargement MP4 direct Uqload
  let hashEntry = uqloadHashCache.get(code);
  if (!hashEntry || Date.now() - hashEntry.fetchedAt > 120000) {
    for (const mode of ['n', 'l', 'h']) {
      try {
        const dlPageUrl = `https://uqload.vc/d/${code}_${mode}`;
        const html = await curlGet(dlPageUrl, `https://uqload.vc/${code}.html`);
        const hash = html.match(/name="hash"\s+value="([^"]+)"/)?.[1];
        const title = html.match(/class="c-auth__title">([^<]+)</)?.[1] || null;
        const sizeText = html.match(/class="[^"]*pg-dl1__size">([^<]+)</)?.[1] || null;
        if (hash) {
          hashEntry = { hash, mode, fetchedAt: Date.now(), title, sizeText, dlPageUrl };
          uqloadHashCache.set(code, hashEntry);
          break;
        }
      } catch {
        // Try next quality mode
      }
    }
  }

  if (hashEntry && waitForDirectMp4) {
    const elapsed = Date.now() - hashEntry.fetchedAt;
    const waitMs = Math.max(0, 5250 - elapsed);
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
    try {
      const { stdout: postOut } = await execFileAsync('curl', [
        '-4', '-s', '-L', '-m', '10',
        '-A', USER_AGENT,
        '-e', hashEntry.dlPageUrl,
        '-d', `op=download_orig&id=${code}&mode=${hashEntry.mode}&hash=${hashEntry.hash}`,
        hashEntry.dlPageUrl
      ], { maxBuffer: 10 * 1024 * 1024 });
      const mp4Url = postOut.match(/https:\/\/strm[0-9]+\.uqload\.vc\/v\/[^\s"'<>]+\.mp4[^\s"'<>]*/i)?.[0] || null;
      const exactBytesStr = postOut.match(/Exact size<\/td><td>([0-9]+)\s*bytes/i)?.[1];
      const exactBytes = exactBytesStr ? Number(exactBytesStr) : null;
      if (mp4Url) {
        return {
          provider: 'Uqload Direct MP4',
          directMp4Url: mp4Url,
          hlsUrl,
          referer: 'https://uqload.vc/',
          fileTitle: hashEntry.title,
          exactBytes,
          sizeFormatted: formatBytesToFrench(exactBytes) || hashEntry.sizeText?.replace('MB', 'Mo')?.replace('GB', 'Go') || null,
          durationSec
        };
      }
    } catch {
      // Fall back to HLS if POST fails
    }
  }

  if (hashEntry || hlsUrl) {
    return {
      provider: hashEntry ? 'Uqload Direct MP4' : 'Uqload HLS HD',
      directMp4Url: null,
      hasPendingDirectMp4: !!hashEntry,
      hlsUrl,
      referer: 'https://uqload.vc/',
      fileTitle: hashEntry?.title || null,
      exactBytes: null,
      sizeFormatted: hashEntry?.sizeText?.replace('MB', 'Mo')?.replace('GB', 'Go') || null,
      durationSec
    };
  }
  return null;
}

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

async function curlFranime(url) {
  const args = [
    '-4', '-s', '-L', '-m', '10',
    '-A', FRANIME_HEADERS['User-Agent'],
    '-H', 'Accept: */*',
    '-H', 'Accept-Language: fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
    '-H', 'Referer: https://franime.fr/',
    '-H', 'Origin: https://franime.fr',
    '-H', 'Content-Type: application/json',
    '-H', 'Sec-Fetch-Dest: empty',
    '-H', 'Sec-Fetch-Mode: cors',
    '-H', 'Sec-Fetch-Site: same-site',
    url
  ];
  const { stdout } = await execFileAsync('curl', args, { maxBuffer: 25 * 1024 * 1024 });
  return stdout;
}

async function getFranimeCatalog() {
  if (franimeCatalogCache) return franimeCatalogCache;
  if (franimeCatalogPromise) return franimeCatalogPromise;
  franimeCatalogPromise = curlFranime('https://api.franime.fr/api/animes')
    .then(txt => JSON.parse(txt))
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
                const watchText = (await curlFranime(
                  `https://api.franime.fr/api/anime/${anime.id}/${sIdx}/${epIdx}/${activeLangKey}/${idx}`
                )).trim();
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
          if (hosters.sendvid && hosters.sendvid.includes('sendvid.com')) {
            try {
              const svHtml = await curlGet(hosters.sendvid, 'https://franime.fr/');
              const mp4Match = svHtml.match(/https:\/\/videos[^\s"'<>]+\.mp4[^\s"'<>]*/i);
              if (mp4Match) {
                hosters.directMp4 = mp4Match[0];
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

      // 2. Résolveur de téléchargement réel (Films, Séries TV et Animés en VF / VOSTFR / VO)
      server.middlewares.use('/api/download-resolve', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const tmdbId = Number(urlObj.searchParams.get('tmdbId') || 0);
          const type = (urlObj.searchParams.get('type') || 'movie').toLowerCase();
          const title = (urlObj.searchParams.get('title') || '').toLowerCase().trim();
          const originalTitle = (urlObj.searchParams.get('originalTitle') || '').toLowerCase().trim();
          const season = Math.max(1, Number(urlObj.searchParams.get('season') || 1));
          const episode = Math.max(1, Number(urlObj.searchParams.get('episode') || 1));
          const rawLang = (urlObj.searchParams.get('lang') || 'vf').toLowerCase();
          const lang = rawLang === 'vostfr' ? 'vostfr' : rawLang === 'vo' ? 'vo' : 'vf';
          const waitUqload = urlObj.searchParams.get('waitUqload') === '1';

          const cacheKey = `${type}:${tmdbId}:${title}:${season}:${episode}:${lang}`;
          if (!waitUqload && downloadResolveCache.has(cacheKey)) {
            const cached = downloadResolveCache.get(cacheKey);
            if (cached.directMp4Url || !cached.hasPendingDirectMp4) {
              res.end(JSON.stringify(cached));
              return;
            }
          }

          let result = null;

          // A. Pour les Animés : essayer d'abord FRAnime (Sendvid Direct MP4 VF/VOSTFR ou HLS)
          if (type === 'anime') {
            try {
              const catalog = await getFranimeCatalog();
              let anime = null;
              if (tmdbId && TMDB_TO_FRANIME_ID[tmdbId]) {
                anime = catalog.find(a => a.id === TMDB_TO_FRANIME_ID[tmdbId]);
              }
              if (!anime && (title || originalTitle)) {
                anime = catalog.find(a => {
                  const candidates = [a.titleO, a.title, a.titles?.en, a.titles?.en_jp, a.titles?.ja_jp]
                    .filter(Boolean)
                    .map(x => String(x).toLowerCase());
                  return candidates.some(c => (title && c.includes(title)) || (originalTitle && c.includes(originalTitle)));
                });
              }

              if (anime && Array.isArray(anime.saisons) && anime.saisons.length > 0) {
                const sIdx = Math.min(season - 1, anime.saisons.length - 1);
                const episodes = anime.saisons[sIdx]?.episodes || [];
                const epIdx = Math.min(episode - 1, episodes.length - 1);
                const epObj = episodes[epIdx];
                if (epObj) {
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
                        const watchText = (await curlFranime(
                          `https://api.franime.fr/api/anime/${anime.id}/${sIdx}/${epIdx}/${activeLangKey}/${idx}`
                        )).trim();
                        const decoded = decodeFranimeWatch2Url(watchText);
                        if (decoded) hosters[key] = decoded;
                      } catch {
                        // Ignore single hoster error
                      }
                    })
                  );

                  // 1. Sendvid Direct MP4 (si c'est un vrai lien sendvid.com)
                  if (hosters.sendvid && hosters.sendvid.includes('sendvid.com')) {
                    const svHtml = await curlGet(hosters.sendvid, 'https://franime.fr/');
                    const mp4Match = svHtml.match(/https:\/\/videos[^\s"'<>]+\.mp4[^\s"'<>]*/i);
                    if (mp4Match) {
                      const directMp4Url = mp4Match[0];
                      const head = await curlHeadInfo(directMp4Url);
                      result = {
                        found: true,
                        provider: 'FRAnime Sendvid Direct MP4',
                        directMp4Url,
                        hlsUrl: null,
                        referer: 'https://sendvid.com/',
                        fileTitle: `${anime.title || title} - S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')} (${activeLangKey.toUpperCase()}).mp4`,
                        exactBytes: head.contentLength,
                        sizeFormatted: formatBytesToFrench(head.contentLength),
                        resolvedLang: activeLangKey === 'vf' ? 'VF' : 'VOSTFR'
                      };
                    }
                  }

                  // 2. Si pas de Sendvid direct, extraire le flux HLS depuis Vidmoly / Smoothpre / Ansembed / Uqload
                  if (!result) {
                    const embedCandidates = [
                      { url: hosters.sendvid, name: 'FRAnime Smoothpre HD' },
                      { url: hosters.vidmoly, name: 'FRAnime Vidmoly HD' },
                      { url: hosters.uqload, name: 'FRAnime Uqload HD' }
                    ].filter(c => !!c.url);

                    for (const cand of embedCandidates) {
                      try {
                        const html = await curlGet(cand.url, 'https://franime.fr/');
                        const unpacked = unpackEvalPacker(html);
                        const hlsMatch =
                          unpacked.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i) ||
                          html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
                        if (hlsMatch) {
                          result = {
                            found: true,
                            provider: cand.name,
                            directMp4Url: null,
                            hlsUrl: hlsMatch[0],
                            referer: new URL(cand.url).origin + '/',
                            fileTitle: `${anime.title || title} - S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')} (${activeLangKey.toUpperCase()}).mp4`,
                            exactBytes: null,
                            sizeFormatted: '240 Mo (Flux Complet)',
                            resolvedLang: activeLangKey === 'vf' ? 'VF' : 'VOSTFR'
                          };
                          break;
                        }
                      } catch {
                        // Try next candidate
                      }
                    }
                  }
                }
              }
            } catch {
              // Fall through to Frembed
            }
          }

          // B. Frembed (Films, Séries TV et Animés disponibles sur Frembed avec Voe Direct MP4 ou Uqload Direct MP4)
          if ((!result || !result.directMp4Url) && tmdbId > 0) {
            try {
              const isMovie = type === 'movie';
              const apiUrl = isMovie
                ? `https://frembed.uno/api/films?id=${tmdbId}&idType=tmdb`
                : `https://frembed.uno/api/series?id=${tmdbId}&idType=tmdb&sa=${season}&epi=${episode}`;
              const refUrl = isMovie
                ? `https://frembed.uno/films?id=${tmdbId}`
                : `https://frembed.uno/series?id=${tmdbId}&sa=${season}&epi=${episode}`;

              const rawJson = await curlGet(apiUrl, refUrl);
              const data = JSON.parse(rawJson);
              const links = Array.isArray(data.links) ? data.links : [];

              const wantVo = lang === 'vostfr' || lang === 'vo';
              const matchLang = (l) => wantVo ? (l.lang === 'vostfr' || l.lang === 'vo') : l.lang === 'vf';

              // 1. Priorité Voe (Décodage instantané < 0.5s vers MP4 direct sans attente)
              const voeEntry =
                links.find(l => l.host?.slug === 'voe' && matchLang(l)) ||
                links.find(l => l.host?.slug === 'voe') ||
                (data.link3 ? { url: data.link3, lang: 'vf' } : null);

              if (voeEntry && voeEntry.url) {
                const head = await curlHeadInfo(`https://frembed.uno${voeEntry.url}`, refUrl);
                if (head.location) {
                  const voeDecoded = await decodeVoeFromRedirectUrl(head.location);
                  if (voeDecoded && (voeDecoded.directMp4Url || voeDecoded.hlsUrl)) {
                    result = {
                      found: true,
                      ...voeDecoded,
                      resolvedLang: (voeEntry.lang || 'vf').toUpperCase()
                    };
                  }
                }
              }

              // 2. Priorité Uqload Direct MP4 (pour les films comme Dune 2 où Voe est absent)
              if (!result || (!result.directMp4Url && !result.hlsUrl)) {
                const uqEntry =
                  links.find(l => l.host?.slug === 'uqload' && matchLang(l)) ||
                  links.find(l => l.host?.slug === 'uqload') ||
                  (data.link7 ? { url: data.link7, lang: 'vf' } : null);

                if (uqEntry && uqEntry.url) {
                  const head = await curlHeadInfo(`https://frembed.uno${uqEntry.url}`, refUrl);
                  if (head.location) {
                    const uqInfo = await extractUqloadInfo(head.location, waitUqload);
                    if (uqInfo) {
                      result = {
                        found: true,
                        ...uqInfo,
                        resolvedLang: (uqEntry.lang || 'vf').toUpperCase()
                      };
                    }
                  }
                }
              }
            } catch {
              // Ignore Frembed error
            }
          }

          if (result && result.found) {
            if (result.directMp4Url || !waitUqload) {
              downloadResolveCache.set(cacheKey, result);
            }
            res.end(JSON.stringify(result));
            return;
          }

          res.end(JSON.stringify({ found: false }));
        } catch (err) {
          res.end(JSON.stringify({ found: false, error: String(err) }));
        }
      });

      // 3. Flux de téléchargement binaire direct (.mp4 natif ou remuxage HLS -> MP4 temps réel via FFmpeg)
      server.middlewares.use('/api/download-stream', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const mp4Url = urlObj.searchParams.get('mp4Url') || '';
          const hlsUrl = urlObj.searchParams.get('hlsUrl') || '';
          const referer = urlObj.searchParams.get('referer') || '';
          const rawFilename = urlObj.searchParams.get('filename') || 'Kingbox_Video.mp4';
          const safeFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.mkv$/i, '.mp4');
          const finalFilename = safeFilename.endsWith('.mp4') ? safeFilename : `${safeFilename}.mp4`;

          if (mp4Url) {
            const head = await curlHeadInfo(mp4Url, referer, 8);
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (head.contentLength && head.contentLength > 0) {
              res.setHeader('Content-Length', String(head.contentLength));
            }
            if (req.method === 'HEAD') {
              res.end();
              return;
            }

            const args = ['-4', '-s', '-L', '-A', USER_AGENT];
            if (referer) args.push('-e', referer);
            args.push(mp4Url);

            const child = spawn('curl', args);
            child.stdout.pipe(res);
            req.on('close', () => {
              try { child.kill('SIGKILL'); } catch {}
            });
            return;
          }

          if (hlsUrl) {
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (req.method === 'HEAD') {
              res.end();
              return;
            }

            const headersStr = referer
              ? `Referer: ${referer}\r\nUser-Agent: ${USER_AGENT}\r\n`
              : `User-Agent: ${USER_AGENT}\r\n`;

            const ffArgs = [
              '-loglevel', 'error',
              '-headers', headersStr,
              '-i', hlsUrl,
              '-c', 'copy',
              '-bsf:a', 'aac_adtstoasc',
              '-movflags', 'frag_keyframe+empty_moov+faststart',
              '-f', 'mp4',
              'pipe:1'
            ];

            const child = spawn('ffmpeg', ffArgs);
            child.stdout.pipe(res);
            req.on('close', () => {
              try { child.kill('SIGKILL'); } catch {}
            });
            return;
          }

          res.statusCode = 400;
          res.end('Missing mp4Url or hlsUrl');
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
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

// Service complet TMDB pour Kingbox
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Récupère la clé TMDB depuis le stockage local ou la variable d'environnement
export function getTmdbApiKey() {
  return localStorage.getItem('kingbox_tmdb_key') || import.meta.env.VITE_TMDB_API_KEY || '';
}

export function setTmdbApiKey(key) {
  if (key) {
    localStorage.setItem('kingbox_tmdb_key', key.trim());
  } else {
    localStorage.removeItem('kingbox_tmdb_key');
  }
}

export const getTmdbImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// Formater un élément TMDB au format interne Kingbox
export function formatTmdbMedia(item, forcedType = null) {
  const isTv = forcedType === 'tv' || item.media_type === 'tv' || (!item.title && !!item.name);
  const isAnime = forcedType === 'anime' || (item.genre_ids && item.genre_ids.includes(16) && (item.origin_country?.includes('JP') || item.original_language === 'ja'));
  
  const type = isAnime ? 'anime' : (isTv ? 'tv' : 'movie');

  return {
    id: `tmdb-${type}-${item.id}`,
    tmdbId: item.id,
    title: item.title || item.name || 'Titre inconnu',
    originalTitle: item.original_title || item.original_name || '',
    type: type,
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.8,
    year: (item.release_date || item.first_air_date || '').split('-')[0] || new Date().getFullYear(),
    quality: '4K UHD',
    duration: type === 'movie' ? 'Film' : 'Série',
    genres: item.genres?.map(g => g.name) || [],
    poster: getTmdbImageUrl(item.poster_path, 'w500'),
    backdrop: getTmdbImageUrl(item.backdrop_path, 'original'),
    synopsis: item.overview || 'Aucun résumé en français disponible pour le moment.',
    cast: item.credits?.cast?.slice(0, 5).map(c => c.name) || [],
    trending: true,
    videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
    episodes: type !== 'movie' ? [
      { number: 1, title: "Épisode 1 : Le Début", duration: "24 min", videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
      { number: 2, title: "Épisode 2 : L'Éveil", duration: "25 min", videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4" },
      { number: 3, title: "Épisode 3 : L'Épreuve", duration: "23 min", videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" }
    ] : undefined
  };
}

// Vérifier la validité d'une clé API TMDB
export async function testTmdbApiKey(apiKey) {
  if (!apiKey) return false;
  try {
    const res = await fetch(`${TMDB_BASE_URL}/configuration?api_key=${apiKey}`);
    return res.ok;
  } catch {
    return false;
  }
}

// 1. Tendances
export async function fetchTrendingAll(apiKey, page = 1) {
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${apiKey}&language=fr-FR&page=${page}`);
    const data = await res.json();
    return (data.results || []).filter(r => r.media_type !== 'person').map(item => formatTmdbMedia(item));
  } catch (err) {
    console.error('Erreur fetchTrendingAll:', err);
    return [];
  }
}

// 2. Films populaires & nouveautés
export async function fetchPopularMovies(apiKey, page = 1) {
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=fr-FR&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(item => formatTmdbMedia(item, 'movie'));
  } catch (err) {
    console.error('Erreur fetchPopularMovies:', err);
    return [];
  }
}

// 3. Séries populaires
export async function fetchPopularSeries(apiKey, page = 1) {
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}&language=fr-FR&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(item => formatTmdbMedia(item, 'tv'));
  } catch (err) {
    console.error('Erreur fetchPopularSeries:', err);
    return [];
  }
}

// 4. Animés populaires (Animation japonaise)
export async function fetchPopularAnime(apiKey, page = 1) {
  if (!apiKey) return [];
  try {
    // TMDB genre 16 = Animation, origin_country = JP
    const res = await fetch(`${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}&language=fr-FR&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(item => formatTmdbMedia(item, 'anime'));
  } catch (err) {
    console.error('Erreur fetchPopularAnime:', err);
    return [];
  }
}

// 5. Recherche globale TMDB (Multi search)
export async function searchTmdbCatalog(apiKey, query, page = 1) {
  if (!apiKey || !query.trim()) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`);
    const data = await res.json();
    return (data.results || [])
      .filter(item => item.media_type !== 'person' && (item.poster_path || item.backdrop_path))
      .map(item => formatTmdbMedia(item));
  } catch (err) {
    console.error('Erreur searchTmdbCatalog:', err);
    return [];
  }
}

// 6. Détails complets avec saisons / épisodes
export async function fetchTmdbDetails(apiKey, type, tmdbId) {
  if (!apiKey || !tmdbId) return null;
  const endpoint = type === 'movie' ? 'movie' : 'tv';
  try {
    const res = await fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${apiKey}&language=fr-FR&append_to_response=credits,videos`);
    const data = await res.json();
    return formatTmdbMedia(data, type);
  } catch (err) {
    console.error('Erreur fetchTmdbDetails:', err);
    return null;
  }
}

// 7. Récupérer la liste des saisons complètes d'une série / animé
export async function fetchTvSeasonsInfo(apiKey, tmdbId) {
  if (!apiKey || !tmdbId) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${apiKey}&language=fr-FR`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.seasons || []).filter(s => s.season_number > 0);
  } catch (err) {
    console.error('Erreur fetchTvSeasonsInfo:', err);
    return [];
  }
}

// 8. Récupérer tous les épisodes d'une saison spécifique avec titres, résumés et images
export async function fetchSeasonEpisodes(apiKey, tmdbId, seasonNumber = 1) {
  if (!apiKey || !tmdbId) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${apiKey}&language=fr-FR`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.episodes || []).map(ep => ({
      number: ep.episode_number,
      title: ep.name || `Épisode ${ep.episode_number}`,
      duration: ep.runtime ? `${ep.runtime} min` : '45 min',
      overview: ep.overview || 'Aucun résumé disponible pour cet épisode.',
      still: ep.still_path ? getTmdbImageUrl(ep.still_path, 'w300') : null,
      airDate: ep.air_date,
      rating: ep.vote_average ? Number(ep.vote_average.toFixed(1)) : null,
      season: seasonNumber,
      videoUrl: ep.episode_number % 2 === 0 ? "https://media.w3.org/2010/05/sintel/trailer_hd.mp4" : "https://vjs.zencdn.net/v/oceans.mp4"
    }));
  } catch (err) {
    console.error(`Erreur fetchSeasonEpisodes saison ${seasonNumber}:`, err);
    return [];
  }
}


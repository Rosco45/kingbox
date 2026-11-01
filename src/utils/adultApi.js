// Service API pour la section adulte (AniList GraphQL & TMDB Adult)

const ANILIST_API_URL = 'https://graphql.anilist.co';

export function getAdultPin() {
  return localStorage.getItem('kingbox_adult_pin') || '0000';
}

export function setAdultPin(pin) {
  localStorage.setItem('kingbox_adult_pin', pin);
}

export function isAdultSessionUnlocked() {
  return sessionStorage.getItem('kingbox_adult_unlocked') === 'true';
}

export function setAdultSessionUnlocked(unlocked) {
  if (unlocked) {
    sessionStorage.setItem('kingbox_adult_unlocked', 'true');
  } else {
    sessionStorage.removeItem('kingbox_adult_unlocked');
  }
}

// Nettoyer le HTML des résumés AniList
function cleanHtml(text) {
  if (!text) return 'Aucun résumé disponible pour ce contenu.';
  return text.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

// 1. Récupérer les animés hentai / adultes depuis AniList
export async function fetchAdultAnimeList({ page = 1, perPage = 24, sort = 'POPULARITY_DESC', search = '' } = {}) {
  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $search: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
        }
        media(isAdult: true, type: ANIME, sort: $sort, search: $search) {
          id
          idMal
          title {
            english
            romaji
            native
          }
          coverImage {
            extraLarge
            large
          }
          bannerImage
          description
          episodes
          genres
          averageScore
          seasonYear
          status
        }
      }
    }
  `;

  const variables = {
    page,
    perPage,
    sort: [sort],
    search: search.trim() ? search.trim() : undefined
  };

  try {
    const res = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
    const data = await res.json();
    const mediaList = data?.data?.Page?.media || [];

    return mediaList.map(item => {
      const epCount = item.episodes || 1;
      const episodeList = [];
      for (let i = 1; i <= Math.min(epCount, 12); i++) {
        episodeList.push({
          number: i,
          title: `Épisode ${i}`,
          duration: "24 min",
          videoUrl: i % 2 === 0 ? "https://media.w3.org/2010/05/sintel/trailer_hd.mp4" : "https://vjs.zencdn.net/v/oceans.mp4"
        });
      }

      return {
        id: `adult-al-${item.id}`,
        anilistId: item.id,
        malId: item.idMal || item.id,
        tmdbId: null,
        title: item.title.english || item.title.romaji || 'Animé 18+',
        originalTitle: item.title.romaji || item.title.native || '',
        type: 'anime',
        isAdult: true,
        rating: item.averageScore ? Number((item.averageScore / 10).toFixed(1)) : 8.0,
        year: item.seasonYear || 2024,
        quality: '1080p FHD',
        duration: `${epCount} Épisode${epCount > 1 ? 's' : ''}`,
        genres: item.genres && item.genres.length > 0 ? item.genres : ['Hentai', 'Animation 18+'],
        poster: item.coverImage?.extraLarge || item.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        backdrop: item.bannerImage || item.coverImage?.extraLarge || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
        synopsis: cleanHtml(item.description),
        cast: ['Studio d\'animation japonais'],
        videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
        episodes: episodeList
      };
    });
  } catch (err) {
    console.error('Erreur AniList Adult fetch:', err);
    return getFallbackAdultList();
  }
}

// 2. Films adultes TMDB (si la clé TMDB est configurée)
export async function fetchTmdbAdultMovies(apiKey, page = 1) {
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&include_adult=true&certification_country=FR&sort_by=popularity.desc&page=${page}`);
    const data = await res.json();
    return (data.results || []).map(item => ({
      id: `adult-tmdb-${item.id}`,
      tmdbId: item.id,
      title: item.title || 'Film 18+',
      type: 'movie',
      isAdult: true,
      rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.2,
      year: (item.release_date || '').split('-')[0] || 2024,
      quality: '4K UHD',
      duration: 'Film 18+',
      genres: ['Adulte', 'Drame'],
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      synopsis: item.overview || 'Contenu réservé à un public adulte averti.',
      cast: [],
      videoUrl: "https://vjs.zencdn.net/v/oceans.mp4"
    }));
  } catch (err) {
    console.error('Erreur TMDB Adult:', err);
    return [];
  }
}

// Liste de secours hors-ligne en cas de coupure réseau
function getFallbackAdultList() {
  return [
    {
      id: "adult-fb-1",
      anilistId: 113425,
      malId: 40750,
      tmdbId: 96902,
      title: "Redo of Healer (Version intégrale)",
      originalTitle: "Kaifuku Jutsushi no Yarinaoshi",
      type: "anime",
      isAdult: true,
      rating: 8.5,
      year: 2021,
      quality: "1080p FHD",
      duration: "12 Épisodes",
      genres: ["Dark Fantasy", "Hentai", "Ecchi"],
      poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113425-tYGRUa5pgZje.jpg",
      backdrop: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113425-hcwuSZsuYMtt.jpg",
      synopsis: "Dans un monde fantastique impitoyable, Keyaru utilise son pouvoir pour remonter le temps et refaire son destin face à ses ennemis.",
      videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
      episodes: [
        { number: 1, title: "Épisode 1", duration: "24 min", videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" },
        { number: 2, title: "Épisode 2", duration: "24 min", videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4" }
      ]
    },
    {
      id: "adult-fb-2",
      anilistId: 110270,
      malId: 40010,
      tmdbId: 95484,
      title: "Interspecies Reviewers",
      originalTitle: "Ishuzoku Reviewers",
      type: "anime",
      isAdult: true,
      rating: 8.8,
      year: 2020,
      quality: "1080p FHD",
      duration: "12 Épisodes",
      genres: ["Comédie", "Fantastique", "Ecchi 18+"],
      poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx110270-4NVRRcffK70k.jpg",
      backdrop: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/110270-NIVO37S631oB.jpg",
      synopsis: "Une bande d'aventuriers parcourt les tavernes et quartiers insolites de leur monde fantastique.",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
      episodes: [
        { number: 1, title: "Épisode 1", duration: "24 min", videoUrl: "https://vjs.zencdn.net/v/oceans.mp4" }
      ]
    }
  ];
}

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Lock, Search, Flame, Sparkles, Film, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import MediaCard from './MediaCard';
import { fetchAdultAnimeList, fetchTmdbAdultMovies, setAdultSessionUnlocked } from '../utils/adultApi';
import { getTmdbApiKey } from '../utils/tmdb';

export default function AdultView({ 
  onSelectMedia, 
  onPlayMedia, 
  onToggleFavorite, 
  favorites = [], 
  onLockSection, 
  onChangePin 
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('popular'); // 'popular' | 'trending' | 'latest' | 'tmdb'
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const tmdbKey = getTmdbApiKey();

  const loadData = useCallback(async (reset = false, searchStr = searchQuery) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;

    try {
      if (activeSubTab === 'tmdb') {
        const tmdbResults = await fetchTmdbAdultMovies(tmdbKey, currentPage);
        setItems(prev => reset ? tmdbResults : [...prev, ...tmdbResults]);
        setHasMore(tmdbResults.length >= 10);
      } else {
        let sortParam = 'POPULARITY_DESC';
        if (activeSubTab === 'trending') sortParam = 'TRENDING_DESC';
        if (activeSubTab === 'latest') sortParam = 'START_DATE_DESC';

        const animeResults = await fetchAdultAnimeList({
          page: currentPage,
          perPage: 24,
          sort: sortParam,
          search: searchStr
        });

        setItems(prev => reset ? animeResults : [...prev, ...animeResults]);
        setHasMore(animeResults.length >= 24);
      }
    } catch (err) {
      console.error('Erreur de chargement AdultView:', err);
    } finally {
      setLoading(false);
    }
  }, [activeSubTab, page, searchQuery, tmdbKey]);

  useEffect(() => {
    setPage(1);
    loadData(true, searchQuery);
  }, [activeSubTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData(true, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(false, searchQuery);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen space-y-8 animate-fadeIn">
      
      {/* Top Banner & Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-red-950/60 via-purple-950/40 to-zinc-900 border border-red-900/40 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-xs font-black text-red-400 tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Zone 18+ Déverrouillée</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Catalogue Adulte & Animés Hentai
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Contenu propulsé par la base de données AniList et TMDB avec filtres réservés aux adultes.
          </p>
        </div>

        {/* Security Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onChangePin}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-colors"
            title="Modifier le code de sécurité"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Changer PIN</span>
          </button>

          <button
            onClick={onLockSection}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 active:scale-95"
            title="Reverrouiller immédiatement la section"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Reverrouiller</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Subtabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Subtabs Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'popular', label: '🔥 Hentais Populaires', icon: Flame },
              { id: 'trending', label: '⚡ Tendances', icon: Sparkles },
              { id: 'latest', label: '✨ Dernières Sorties', icon: Sparkles },
              { id: 'tmdb', label: '🎬 Films 18+ (TMDB)', icon: Film }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setSearchQuery('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-red-600/25'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Adult Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un animé 18+..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </form>
        </div>
      </div>

      {/* Grid of Adult Media */}
      <div>
        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-xs text-zinc-400">Chargement sécurisé du catalogue adulte...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <MediaCard
                    item={item}
                    onSelect={onSelectMedia}
                    onPlay={onPlayMedia}
                    isFavorite={favorites.some((fav) => fav.id === item.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                  {/* Subtle 18+ Overlay Badge */}
                  <span className="absolute top-2 right-2 z-20 pointer-events-none px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white shadow-md">
                    18+
                  </span>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs sm:text-sm font-semibold text-zinc-200 inline-flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-red-400" />
                      <span>Charger plus de contenus</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-zinc-500 space-y-3">
            <ShieldAlert className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
            <p className="text-base font-medium text-zinc-300">Aucun contenu trouvé</p>
            <p className="text-xs">
              {activeSubTab === 'tmdb' && !tmdbKey 
                ? "Activez votre clé API TMDB dans les paramètres pour afficher les films adultes." 
                : "Essayez de modifier votre terme de recherche."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

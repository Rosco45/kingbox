import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Film, Tv, Flame, Sparkles, Loader2 } from 'lucide-react';
import MediaCard from './MediaCard';
import { GENRES } from '../data/mockData';
import { getTmdbApiKey, searchTmdbCatalog } from '../utils/tmdb';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  items, 
  onSelectMedia, 
  onPlayMedia, 
  favorites, 
  onToggleFavorite 
}) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tous');
  const [selectedType, setSelectedType] = useState('all');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  // Debounced TMDB Live Search
  useEffect(() => {
    const apiKey = getTmdbApiKey();
    if (!apiKey || !query.trim()) {
      setTmdbResults([]);
      setIsSearchingTmdb(false);
      return;
    }

    setIsSearchingTmdb(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchTmdbCatalog(apiKey, query);
        setTmdbResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingTmdb(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  // Combine items (TMDB results take priority if active and present, otherwise local items)
  const displayItems = useMemo(() => {
    if (query.trim() && tmdbResults.length > 0) {
      return tmdbResults;
    }
    return items;
  }, [items, tmdbResults, query]);

  const filteredItems = useMemo(() => {
    return displayItems.filter((item) => {
      // Type match
      const matchesType = selectedType === 'all' || item.type === selectedType;

      // Genre match
      const matchesGenre = selectedGenre === 'Tous' || item.genres?.includes(selectedGenre);

      // Local query match (if not already filtered by TMDB API)
      if (tmdbResults.length > 0) {
        return matchesType && matchesGenre;
      }

      const q = query.toLowerCase().trim();
      const matchesQuery = !q || 
        item.title.toLowerCase().includes(q) ||
        item.genres?.some(g => g.toLowerCase().includes(q)) ||
        item.cast?.some(c => c.toLowerCase().includes(q));

      return matchesType && matchesGenre && matchesQuery;
    });
  }, [displayItems, query, selectedGenre, selectedType, tmdbResults]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-6 md:p-8 animate-fadeIn overflow-y-auto">
      <div className="max-w-7xl w-full mx-auto space-y-6">
        
        {/* Top Header: Input & Close */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            {isSearchingTmdb ? (
              <Loader2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 animate-spin" />
            ) : (
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            )}
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher parmi des milliers de films, séries, animés..."
              className="w-full pl-12 pr-10 py-3.5 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-base sm:text-lg shadow-inner"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setTmdbResults([]);
                }}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="space-y-3">
          {/* Type Selector (Films, Séries, Animés) */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Tous les médias' },
              { id: 'movie', label: 'Films' },
              { id: 'tv', label: 'Séries' },
              { id: 'anime', label: 'Animés' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedType === type.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Genres Selector */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  selectedGenre === genre
                    ? 'bg-zinc-700 text-white font-bold border border-zinc-500'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-2">
              <span>Résultats ({filteredItems.length})</span>
              {tmdbResults.length > 0 && (
                <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                  TMDB Live
                </span>
              )}
            </h3>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onSelect={(m) => {
                    onClose();
                    onSelectMedia(m);
                  }}
                  onPlay={(m) => {
                    onClose();
                    onPlayMedia(m);
                  }}
                  isFavorite={favorites.some((fav) => fav.id === item.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-zinc-500 space-y-2">
              <Search className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <p className="text-lg font-medium text-zinc-300">Aucun résultat trouvé pour "{query}"</p>
              <p className="text-sm">Essayez de modifier votre recherche ou vos filtres.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

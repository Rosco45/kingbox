import React from 'react';
import { Heart, Trash2, Play, Sparkles } from 'lucide-react';
import MediaCard from './MediaCard';

export default function FavoritesView({ 
  favorites, 
  onSelectMedia, 
  onPlayMedia, 
  onToggleFavorite, 
  onExplore 
}) {
  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[70vh]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-red-500" />
            <span>Votre Bibliothèque Personnelle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ma Liste & Favoris
          </h1>
        </div>
        <div className="text-sm text-zinc-400">
          {favorites.length} {favorites.length > 1 ? 'titres enregistrés' : 'titre enregistré'}
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {favorites.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelectMedia}
              onPlay={onPlayMedia}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/80 p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Votre liste est vide</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Cliquez sur le cœur d'un film, d'une série ou d'un animé pour l'ajouter à vos favoris et le retrouver facilement ici.
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explorer les tendances</span>
          </button>
        </div>
      )}
    </div>
  );
}

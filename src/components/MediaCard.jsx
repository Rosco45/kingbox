import React from 'react';
import { Play, Star, Heart } from 'lucide-react';

export default function MediaCard({ 
  item, 
  onSelect, 
  onPlay, 
  isFavorite, 
  onToggleFavorite 
}) {
  return (
    <div 
      className="group relative flex-shrink-0 w-36 sm:w-44 md:w-52 cursor-pointer transition-all duration-300"
      onClick={() => onSelect(item)}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-md group-hover:shadow-2xl group-hover:shadow-red-950/40 group-hover:border-red-600/50 transition-all duration-300 transform group-hover:-translate-y-1.5">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Quality & Lang Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1">
          <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-black/75 backdrop-blur-md text-amber-300 rounded border border-amber-500/30">
            {item.quality || 'HD'}
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-red-600/90 backdrop-blur-md text-white rounded shadow-sm">
            {item.type === 'anime' ? 'VF • VOSTFR' : 'VF • VO'}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded border border-zinc-700 text-[11px] font-bold text-amber-400">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{item.rating}</span>
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-zinc-900/80 backdrop-blur-sm text-zinc-300 border border-zinc-700/60">
            {item.type === 'anime' ? 'Animé' : item.type === 'tv' ? 'Série' : 'Film'}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/50 transform scale-90 group-hover:scale-100 transition-all duration-200"
            title="Lire directement"
          >
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </button>

          {/* Quick Favorite Icon in top corner of overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            className="absolute bottom-2.5 right-2.5 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
            title={isFavorite ? "Retirer" : "Ajouter aux favoris"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-zinc-300'}`} />
          </button>
        </div>
      </div>

      {/* Title & Info */}
      <div className="mt-2.5 px-0.5 space-y-0.5">
        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-red-400 truncate transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center text-xs text-zinc-400 space-x-2">
          <span>{item.year}</span>
          <span>•</span>
          <span className="truncate">{item.genres?.[0] || 'Général'}</span>
        </div>
      </div>
    </div>
  );
}

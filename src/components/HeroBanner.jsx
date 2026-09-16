import React from 'react';
import { Play, Info, Heart, Star, Flame, Download } from 'lucide-react';

export default function HeroBanner({ 
  featured, 
  onPlay, 
  onOpenDetails, 
  onDownload,
  isFavorite, 
  onToggleFavorite 
}) {
  if (!featured) return null;

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-end pb-16 pt-28 overflow-hidden">
      {/* Background Image with Cinematic Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={featured.backdrop}
          alt={featured.title}
          className="w-full h-full object-cover object-center scale-105 transform animate-fade-in filter brightness-[0.75]"
        />
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-[#09090e]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090e] via-[#09090e]/70 to-transparent w-full md:w-3/4"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-4">
          
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600/90 to-amber-600/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>{featured.badge || "TENDANCE N°1 DU JOUR"}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md leading-none">
            {featured.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-zinc-300">
            <div className="flex items-center space-x-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{featured.rating}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
              {featured.quality || '4K UHD'}
            </span>
            <span>{featured.year}</span>
            <span className="text-zinc-500">•</span>
            <span>{featured.duration}</span>
            <span className="text-zinc-500">•</span>
            <span className="capitalize text-red-400 font-medium">
              {featured.type === 'anime' ? 'Animé' : featured.type === 'tv' ? 'Série TV' : 'Film'}
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 text-xs">
            {featured.genres?.map((g) => (
              <span key={g} className="px-2.5 py-0.5 bg-zinc-800/80 text-zinc-300 rounded-md backdrop-blur-sm">
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow">
            {featured.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(featured)}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all transform hover:scale-105 shadow-xl shadow-red-600/40 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Regarder</span>
            </button>

            <button
              onClick={() => onDownload?.(featured)}
              className="flex items-center space-x-2 bg-zinc-800/90 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 px-4 py-3 rounded-xl font-semibold text-sm sm:text-base backdrop-blur-md transition-all border border-amber-500/30 hover:border-amber-500/50 active:scale-95 shadow-md shadow-black/40"
              title="Télécharger pour regarder hors-ligne"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Télécharger</span>
            </button>

            <button
              onClick={() => onOpenDetails(featured)}
              className="flex items-center space-x-2 bg-zinc-800/90 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl font-semibold text-sm sm:text-base backdrop-blur-md transition-all border border-zinc-700 hover:border-zinc-600 active:scale-95"
            >
              <Info className="w-5 h-5 text-zinc-400" />
              <span>Détails</span>
            </button>

            <button
              onClick={() => onToggleFavorite(featured)}
              className={`p-3 rounded-xl transition-all border active:scale-95 ${
                isFavorite
                  ? 'bg-red-600/20 border-red-500 text-red-500'
                  : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
              }`}
              title={isFavorite ? "Retirer de ma liste" : "Ajouter à ma liste"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

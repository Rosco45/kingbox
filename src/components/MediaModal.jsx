import React, { useState } from 'react';
import { X, Play, Heart, Star, Share2, Film, Check, Download, Tv } from 'lucide-react';

export default function MediaModal({ 
  item, 
  onClose, 
  onPlay, 
  onDownload,
  isFavorite, 
  onToggleFavorite 
}) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Kingbox - ${item.title}`,
        text: `Regarde ${item.title} en streaming sur Kingbox !`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#111118] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md transition-colors border border-zinc-700/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1">
          
          {/* Backdrop Header */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <img
              src={item.backdrop || item.poster}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-[#111118]/40 to-transparent"></div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => onPlay(item)}
                className="group p-5 rounded-full bg-red-600/90 hover:bg-red-500 text-white shadow-2xl shadow-red-600/60 backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
              >
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="px-6 sm:px-8 pb-8 -mt-12 relative z-20 space-y-6">
            
            {/* Title & Core Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-red-400 font-bold mb-1">
                  <span>{item.type === 'anime' ? 'Série Animée' : item.type === 'tv' ? 'Série Télévisée' : 'Film'}</span>
                  <span>•</span>
                  <span>{item.quality || '4K UHD'}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  {item.title}
                </h2>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onPlay(item)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/30 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Lecture</span>
                </button>

                <button
                  onClick={() => onDownload?.(item)}
                  className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  title="Télécharger pour regarder hors-ligne"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(item)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-red-600/20 border-red-500 text-red-500'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                  title={isFavorite ? "Retirer de ma liste" : "Ajouter aux favoris"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  title="Partager"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Badges: Rating, Year, Duration */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300">
              <div className="flex items-center space-x-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{item.rating} / 10</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800 font-semibold text-zinc-300">
                {item.year}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800 font-semibold text-zinc-300">
                {item.duration}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 font-semibold text-zinc-400 border border-zinc-700/50">
                Audio: Français (VF) / VOSTFR
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {item.genres?.map((g) => (
                <span key={g} className="px-3 py-1 bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 rounded-lg text-xs font-medium">
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Synopsis
              </h3>
              <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
                {item.synopsis}
              </p>
            </div>

            {/* Cast & Team */}
            {item.cast && item.cast.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Distribution
                </h3>
                <p className="text-xs text-zinc-300">
                  {item.cast.join(', ')}
                </p>
              </div>
            )}

            {/* If Series or Anime: Episodes List (Moviebox Style) */}
            {(item.type === 'tv' || item.type === 'anime') && item.episodes && (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tv className="w-5 h-5 text-red-500" />
                    <h3 className="text-base font-bold text-white">
                      Épisodes disponibles
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">
                    Saison 1 ({item.episodes.length} épisodes)
                  </span>
                </div>

                <div className="space-y-2.5">
                  {item.episodes.map((ep) => (
                    <div
                      key={ep.number}
                      className="group/ep flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <div 
                        onClick={() => onPlay({ ...item, currentEpisode: ep, videoUrl: ep.videoUrl || item.videoUrl })}
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover/ep:bg-red-600 text-zinc-300 group-hover/ep:text-white flex items-center justify-center font-bold text-xs transition-colors shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200 group-hover/ep:text-white">
                            Épisode {ep.number} : {ep.title}
                          </p>
                          <span className="text-xs text-zinc-500">Durée: {ep.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onDownload?.(item, ep)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 transition-colors"
                          title={`Télécharger l'épisode ${ep.number}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onPlay({ ...item, currentEpisode: ep, videoUrl: ep.videoUrl || item.videoUrl })}
                          className="text-xs font-semibold text-red-400 group-hover/ep:text-red-300 px-2 py-1"
                        >
                          Regarder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

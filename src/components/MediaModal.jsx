import React, { useState, useEffect } from 'react';
import { X, Play, Heart, Star, Share2, Check, Download, Tv, Calendar, Clock, Loader2, Sparkles, Film } from 'lucide-react';
import { getTmdbApiKey, fetchTvSeasonsInfo, fetchSeasonEpisodes } from '../utils/tmdb';

export default function MediaModal({ 
  item, 
  onClose, 
  onPlay, 
  onDownload,
  isFavorite, 
  onToggleFavorite 
}) {
  const [copied, setCopied] = useState(false);
  
  // Real TMDB Seasons & Episodes state
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const tmdbKey = getTmdbApiKey();
  const isShow = item?.type === 'tv' || item?.type === 'anime';

  // Load real TMDB seasons on mount
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    const loadSeasons = async () => {
      if (isShow && item.tmdbId && tmdbKey) {
        setLoadingEpisodes(true);
        try {
          const seasonList = await fetchTvSeasonsInfo(tmdbKey, item.tmdbId);
          if (isMounted) {
            if (seasonList.length > 0) {
              setSeasons(seasonList);
              const firstSeasonNum = seasonList[0].season_number || 1;
              setSelectedSeason(firstSeasonNum);
              const epList = await fetchSeasonEpisodes(tmdbKey, item.tmdbId, firstSeasonNum);
              if (isMounted) setEpisodes(epList);
            } else {
              setEpisodes(item.episodes || []);
            }
          }
        } catch (err) {
          console.error('Erreur chargement saisons TMDB:', err);
          if (isMounted) setEpisodes(item.episodes || []);
        } finally {
          if (isMounted) setLoadingEpisodes(false);
        }
      } else {
        setEpisodes(item.episodes || []);
      }
    };

    loadSeasons();
    return () => { isMounted = false; };
  }, [item, isShow, tmdbKey]);

  // Handle Season switch
  const handleSeasonChange = async (seasonNum) => {
    setSelectedSeason(seasonNum);
    if (item?.tmdbId && tmdbKey) {
      setLoadingEpisodes(true);
      try {
        const epList = await fetchSeasonEpisodes(tmdbKey, item.tmdbId, seasonNum);
        setEpisodes(epList);
      } catch (err) {
        console.error(`Erreur chargement saison ${seasonNum}:`, err);
      } finally {
        setLoadingEpisodes(false);
      }
    }
  };

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
                Audio: Français (VF) / Multi-langues
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

            {/* REAL SEASONS & EPISODES PICKER (TMDB Live Integration) */}
            {isShow && (
              <div className="pt-6 border-t border-zinc-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Tv className="w-5 h-5 text-red-500" />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Épisodes & Saisons
                    </h3>
                  </div>

                  {/* Season Selector Tabs */}
                  {seasons.length > 1 && (
                    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                      {seasons.map((s) => (
                        <button
                          key={s.id || s.season_number}
                          onClick={() => handleSeasonChange(s.season_number)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            selectedSeason === s.season_number
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                              : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60'
                          }`}
                        >
                          {s.name || `Saison ${s.season_number}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Episodes List */}
                {loadingEpisodes ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                    <span className="text-xs">Chargement des épisodes en haute définition...</span>
                  </div>
                ) : episodes && episodes.length > 0 ? (
                  <div className="space-y-3">
                    {episodes.map((ep) => (
                      <div
                        key={ep.number}
                        className="group/ep flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all gap-3"
                      >
                        <div 
                          onClick={() => onPlay({ 
                            ...item, 
                            currentEpisode: { ...ep, season: selectedSeason }, 
                            videoUrl: ep.videoUrl || item.videoUrl 
                          })}
                          className="flex items-start sm:items-center space-x-3.5 cursor-pointer flex-1"
                        >
                          {/* Thumbnail / Still preview */}
                          <div className="relative w-24 sm:w-28 aspect-video rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                            {ep.still ? (
                              <img src={ep.still} alt={ep.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                <Film className="w-6 h-6" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover/ep:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover/ep:scale-110 transition-transform">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono text-zinc-300">
                              {ep.duration}
                            </span>
                          </div>

                          {/* Episode Title & Synopsis */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-red-400">
                                Épisode {ep.number}
                              </span>
                              {ep.rating && (
                                <span className="text-[10px] text-amber-400 flex items-center space-x-0.5">
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>{ep.rating}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-100 group-hover/ep:text-white line-clamp-1">
                              {ep.title}
                            </h4>
                            {ep.overview && (
                              <p className="text-xs text-zinc-400 line-clamp-2 max-w-lg">
                                {ep.overview}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Episode Action Buttons */}
                        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => onDownload?.(item, { ...ep, season: selectedSeason })}
                            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 transition-colors border border-zinc-700/60"
                            title={`Télécharger l'épisode ${ep.number}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => onPlay({ 
                              ...item, 
                              currentEpisode: { ...ep, season: selectedSeason }, 
                              videoUrl: ep.videoUrl || item.videoUrl 
                            })}
                            className="flex items-center space-x-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Lire</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 py-4 text-center">
                    Aucun épisode disponible pour cette saison.
                  </p>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Play, Heart, Star, Share2, Check, Download, Tv, Loader2, Film, ShieldCheck, Server, Globe } from 'lucide-react';
import { getTmdbApiKey, fetchTvSeasonsInfo, fetchSeasonEpisodes } from '../utils/tmdb';
import { AUDIO_LANGUAGES, FRANIME_HOSTERS } from '../utils/franimeHosters';

export default function MediaModal({ 
  item, 
  onClose, 
  onPlay, 
  onDownload,
  isFavorite, 
  onToggleFavorite 
}) {
  const [copied, setCopied] = useState(false);
  
  // Sélection de langue & d'hébergeur sans pub (Style FRAnime)
  const [selectedLang, setSelectedLang] = useState('vf');
  const [selectedHoster, setSelectedHoster] = useState('sibnet');

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

  const handleLaunchPlay = (customEpisode = null, customHoster = null, customLang = null) => {
    const langToUse = customLang || selectedLang;
    const hosterToUse = customHoster || selectedHoster;
    const epToUse = customEpisode || (episodes.length > 0 ? { ...episodes[0], season: selectedSeason } : null);

    onPlay({
      ...item,
      preferredLang: langToUse,
      preferredHoster: hosterToUse,
      currentEpisode: isShow ? epToUse : null,
      videoUrl: epToUse?.videoUrl || item.videoUrl
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Kingbox - ${item.title}`,
        text: `Regarde ${item.title} en VF/VOSTFR sans pub sur Kingbox !`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentHosterInfo = FRANIME_HOSTERS.find(h => h.id === selectedHoster) || FRANIME_HOSTERS[0];

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
                onClick={() => handleLaunchPlay()}
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
                  <span>{item.quality || '1080p / 4K'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sans Pub</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                  {item.title}
                </h2>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleLaunchPlay()}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-600/30 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Lire en {selectedLang.toUpperCase()} ({currentHosterInfo.name})</span>
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
              <span className="px-2.5 py-1 rounded-md bg-blue-600/20 font-bold text-blue-300 border border-blue-500/30">
                🇫🇷 VF Disponible
              </span>
              <span className="px-2.5 py-1 rounded-md bg-red-600/20 font-bold text-red-300 border border-red-500/30">
                🇯🇵 VOSTFR Disponible
              </span>
            </div>

            {/* PANNEAU DE SÉLECTION STYLE FRANIME : LANGUE (VF / VOSTFR) & HÉBERGEURS SANS PUB */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-red-500" />
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    1. Choisir la version audio :
                  </span>
                </div>

                {/* Language Selector Pills */}
                <div className="flex items-center space-x-2">
                  {AUDIO_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLang(lang.id)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        selectedLang === lang.id
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/70'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Third-party Ad-free Hosters Selector (Sibnet, Sendvid, Vidmoly, VK, Filemoon, Uqload) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      2. Lecteur / Hébergeur Sans Pub (Architecture FRAnime) :
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                    ✓ Zéro popup intrusive
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {FRANIME_HOSTERS.map((hoster) => {
                    const isSelected = selectedHoster === hoster.id;
                    return (
                      <button
                        key={hoster.id}
                        onClick={() => setSelectedHoster(hoster.id)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-950/50'
                            : 'bg-zinc-800/70 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-extrabold truncate">{hoster.name}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                          {hoster.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
                  <span>
                    Lecteur actif : <strong className="text-white">{currentHosterInfo.name}</strong> — {currentHosterInfo.description}
                  </span>
                  <span className="text-amber-400 font-bold shrink-0 ml-2">{currentHosterInfo.quality}</span>
                </p>
              </div>
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

            {/* REAL SEASONS & EPISODES PICKER (TMDB Live Integration + FRAnime Hosters) */}
            {isShow && (
              <div className="pt-6 border-t border-zinc-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Tv className="w-5 h-5 text-red-500" />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Épisodes & Saisons ({selectedLang.toUpperCase()})
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
                    <span className="text-xs">Chargement des épisodes VF / VOSTFR en haute définition...</span>
                  </div>
                ) : episodes && episodes.length > 0 ? (
                  <div className="space-y-3">
                    {episodes.map((ep) => (
                      <div
                        key={ep.number}
                        className="group/ep flex flex-col p-3 sm:p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 transition-all gap-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div 
                            onClick={() => handleLaunchPlay({ ...ep, season: selectedSeason })}
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
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-red-400">
                                  Épisode {ep.number}
                                </span>
                                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-blue-600/20 text-blue-300 border border-blue-500/30">
                                  VF
                                </span>
                                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-red-600/20 text-red-300 border border-red-500/30">
                                  VOSTFR
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
                              onClick={() => handleLaunchPlay({ ...ep, season: selectedSeason })}
                              className="flex items-center space-x-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Lire ({selectedLang.toUpperCase()})</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Hoster Pills per Episode (Sibnet, Sendvid, Vidmoly, Filemoon, VK, Uqload) */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60 text-[10px]">
                          <span className="text-zinc-500 font-semibold mr-1">Lecteurs directs sans pub :</span>
                          {FRANIME_HOSTERS.map((h) => (
                            <button
                              key={h.id}
                              onClick={() => handleLaunchPlay({ ...ep, season: selectedSeason }, h.id, selectedLang)}
                              className={`px-2 py-0.5 rounded-md font-bold transition-colors border ${
                                selectedHoster === h.id
                                  ? 'bg-red-600/25 border-red-500/60 text-red-300'
                                  : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-500'
                              }`}
                            >
                              {h.name}
                            </button>
                          ))}
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

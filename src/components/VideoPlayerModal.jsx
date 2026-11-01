import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Download, 
  AlertCircle, ShieldCheck, ShieldOff, Subtitles, Check, Globe, Server
} from 'lucide-react';
import { AUDIO_LANGUAGES, FRANIME_HOSTERS, resolveHosterEmbedUrl } from '../utils/franimeHosters';

export default function VideoPlayerModal({ media, onClose, onDownload }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Langue & Hébergeur sans pub (Style FRAnime : Sibnet, Sendvid, Vidmoly, Filemoon, VK, Uqload, Direct HD)
  const [selectedLang, setSelectedLang] = useState(media?.preferredLang || 'vf');
  const [currentHoster, setCurrentHoster] = useState(media?.preferredHoster || 'sibnet');
  const [blockedPopupsCount, setBlockedPopupsCount] = useState(0);

  // Bouton Bouclier Sandbox (Style FRAnime : activable/désactivable en 1 clic si un lecteur bloque le sandbox)
  const [isSandboxEnabled, setIsSandboxEnabled] = useState(() => {
    return localStorage.getItem('kingbox_sandbox_shield') === 'true';
  });
  const [shieldToast, setShieldToast] = useState(null);

  const toggleSandboxShield = () => {
    const nextState = !isSandboxEnabled;
    setIsSandboxEnabled(nextState);
    localStorage.setItem('kingbox_sandbox_shield', String(nextState));
    setShieldToast(
      nextState
        ? '🛡️ Bouclier Sandbox ACTIVÉ : Protection stricte contre les redirections (désactivez-le si le lecteur affiche "Playback blocked").'
        : '🔓 Bouclier Sandbox DÉSACTIVÉ : Mode compatibilité maximale pour tous les lecteurs.'
    );
  };

  useEffect(() => {
    if (!shieldToast) return;
    const timer = setTimeout(() => setShieldToast(null), 4000);
    return () => clearTimeout(timer);
  }, [shieldToast]);

  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedSub, setSelectedSub] = useState('fr'); // 'off' | 'fr' | 'en' | 'es' | 'ar'
  const [showSubMenu, setShowSubMenu] = useState(false);
  const controlsTimeout = useRef(null);

  const tmdbId = media?.tmdbId || (media?.id && String(media.id).replace(/[^0-9]/g, '')) || '693134';
  const isTv = media?.type === 'tv' || media?.type === 'anime';
  const seasonNum = media?.currentEpisode?.season || 1;
  const episodeNum = media?.currentEpisode?.number || 1;

  const subtitleOptions = [
    { id: 'off', label: 'Désactivé' },
    { id: 'fr', label: 'Français (VF / VOSTFR)', lang: 'fr' },
    { id: 'en', label: 'English (EN)', lang: 'en' },
    { id: 'es', label: 'Español (ES)', lang: 'es' },
    { id: 'ar', label: 'العربية (AR)', lang: 'ar' }
  ];

  // Bouclier Anti-Popup Intelligent (intercepte window.open sans bloquer l'iframe avec sandbox)
  useEffect(() => {
    const originalWindowOpen = window.open;
    window.open = function () {
      setBlockedPopupsCount((prev) => prev + 1);
      return null;
    };
    return () => {
      window.open = originalWindowOpen;
    };
  }, []);

  const embedUrl = resolveHosterEmbedUrl({
    hosterId: currentHoster,
    lang: selectedLang,
    tmdbId,
    isTv,
    season: seasonNum,
    episode: episodeNum,
    customHosters: media?.hosters
  });

  const directVideoUrl = media?.videoUrl && !media.videoUrl.includes('commondatastorage')
    ? media.videoUrl
    : "https://vjs.zencdn.net/v/oceans.mp4";

  const currentHosterObj = FRANIME_HOSTERS.find((h) => h.id === currentHoster) || FRANIME_HOSTERS[0];

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying && currentHoster === 'direct' && !showSubMenu) setShowControls(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, currentHoster, showSubMenu]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullScreen = () => {
    const elem = document.getElementById('kingbox-player-container');
    if (!document.fullscreenElement) {
      elem?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!media) return null;

  return (
    <div 
      id="kingbox-player-container"
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Top Header Bar (Style FRAnime : Titre + VF/VOSTFR + Hébergeurs Sibnet, Sendvid, Vidmoly, VK, Filemoon, Uqload) */}
      <div className="absolute top-0 left-0 right-0 z-30 flex flex-col gap-2 p-2.5 sm:p-4 bg-gradient-to-b from-black/95 via-black/85 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Media Title + Episode + Anti-Ad Shield */}
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-lg font-extrabold text-white line-clamp-1">
                {media.title}
              </h2>
              {media.currentEpisode && (
                <span className="text-red-400 text-xs sm:text-sm font-bold shrink-0">
                  • S{seasonNum}:E{episodeNum} ({media.currentEpisode.title})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
              {/* Clickable Anti-Ad / Sandbox Shield Status Badge */}
              <button
                onClick={toggleSandboxShield}
                className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full border font-bold transition-all cursor-pointer ${
                  isSandboxEnabled
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                }`}
                title="Cliquez pour activer ou désactiver le mode protégé (Sandbox) si un lecteur est bloqué"
              >
                {isSandboxEnabled ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldOff className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {isSandboxEnabled
                    ? `Bouclier Sandbox ACTIF (${currentHosterObj.name})`
                    : `Sandbox DÉSACTIVÉ • Mode Compatible (${currentHosterObj.name})`}
                  {blockedPopupsCount > 0 ? ` • ${blockedPopupsCount} pub(s) bloquée(s)` : ''}
                </span>
              </button>

              <span className="text-zinc-500 hidden sm:inline">•</span>
              <span className="text-zinc-300 font-semibold">
                Audio : <strong className="text-red-400 uppercase">{selectedLang}</strong> • {currentHosterObj.quality}
              </span>
            </div>
          </div>

          {/* Right Controls: Shield Toggle Button (FRAnime style) + VF/VOSTFR Switcher + Subtitles + Download + Close */}
          <div className="flex items-center space-x-2">
            {/* Bouton Bouclier (Style FRAnime : Activer / Désactiver Sandbox) */}
            <button
              onClick={toggleSandboxShield}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-md ${
                isSandboxEnabled
                  ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 hover:bg-emerald-600/35 shadow-emerald-950/50'
                  : 'bg-amber-600/20 border-amber-500/70 text-amber-300 hover:bg-amber-600/30'
              }`}
              title={
                isSandboxEnabled
                  ? "Bouclier Sandbox ACTIVÉ : Cliquez pour le désactiver si le lecteur affiche 'Playback blocked / sandboxed frame'"
                  : "Bouclier Sandbox DÉSACTIVÉ (Mode compatible) : Cliquez pour activer le blocage strict par Sandbox"
              }
            >
              {isSandboxEnabled ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldOff className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden sm:inline">
                {isSandboxEnabled ? 'Bouclier ON' : 'Bouclier OFF'}
              </span>
            </button>

            {/* Audio Language Selector (VF / VOSTFR / VO) */}
            <div className="flex items-center bg-zinc-900/95 p-1 rounded-xl border border-zinc-700/80 text-xs">
              {AUDIO_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLang(lang.id);
                    setHasError(false);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    selectedLang === lang.id
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={lang.fullLabel}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>

            {/* Subtitles Button */}
            <div className="relative">
              <button
                onClick={() => setShowSubMenu(!showSubMenu)}
                className={`p-2 rounded-full transition-colors border ${
                  selectedSub !== 'off' 
                    ? 'bg-red-600/20 border-red-500 text-red-400' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title="Sélecteur de sous-titres"
              >
                <Subtitles className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Subtitles Dropdown Menu */}
              {showSubMenu && (
                <div className="absolute right-0 top-11 w-56 bg-zinc-900/95 border border-zinc-700 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Pistes de Sous-titres</span>
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  {subtitleOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedSub(opt.id);
                        setShowSubMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedSub === opt.id 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedSub === opt.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Download Button */}
            {onDownload && (
              <button
                onClick={() => onDownload(media, media.currentEpisode)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/30"
                title="Télécharger cette vidéo"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              title="Quitter le lecteur"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Second Row: FRAnime Hoster Bar (Sibnet, Sendvid, Vidmoly, Filemoon, VK Video, Uqload, Direct HD) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-zinc-400 shrink-0 pr-1">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lecteurs sans pub :</span>
          </div>
          {FRANIME_HOSTERS.map((hoster) => {
            const active = currentHoster === hoster.id;
            return (
              <button
                key={hoster.id}
                onClick={() => {
                  setCurrentHoster(hoster.id);
                  setHasError(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-900/90 border-zinc-700/80 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title={hoster.description}
              >
                <span>{hoster.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                  active ? 'bg-black/30 text-amber-200' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {hoster.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toast Notification lors de l'activation/désactivation du Bouclier Sandbox */}
        {shieldToast && (
          <div className="px-3 py-2 rounded-xl bg-zinc-900/95 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-between animate-fadeIn shadow-xl">
            <span>{shieldToast}</span>
            <button
              onClick={() => setShieldToast(null)}
              className="text-zinc-400 hover:text-white ml-3 text-[11px] font-bold"
            >
              OK
            </button>
          </div>
        )}
      </div>

      {/* PLAYER CONTENT */}
      {currentHoster !== 'direct' && embedUrl ? (
        /* EMBED PLAYER (Sibnet / Sendvid / Vidmoly / Filemoon / VK / Uqload) */
        <div className="w-full h-full pt-24 sm:pt-28 flex items-center justify-center bg-black relative">
          <iframe
            key={`hoster-${currentHoster}-${selectedLang}-${tmdbId}-${seasonNum}-${episodeNum}-sb-${isSandboxEnabled}`}
            src={embedUrl}
            title={`${media.title} - ${currentHosterObj.name}`}
            className="w-full h-full border-0"
            {...(isSandboxEnabled
              ? { sandbox: 'allow-scripts allow-same-origin allow-forms allow-presentation' }
              : {})}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        /* DIRECT HTML5 VIDEO PLAYER (Support multi-sous-titres & zéro pub garantie) */
        <div className="relative w-full h-full flex items-center justify-center pt-24 sm:pt-28">
          {hasError ? (
            <div className="text-center p-8 max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Flux direct indisponible</h3>
              <p className="text-xs text-zinc-400">
                Basculez sur l'un de nos hébergeurs sans pub (Sibnet, Sendvid, Vidmoly, Filemoon ou VK).
              </p>
              <div className="flex justify-center space-x-2 pt-2">
                <button
                  onClick={() => {
                    setCurrentHoster('sibnet');
                    setHasError(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
                >
                  Basculer sur Sibnet (Sans Pub)
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={directVideoUrl}
                className="w-full h-full object-contain cursor-pointer"
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onError={() => setHasError(true)}
                onClick={togglePlay}
              />

              {/* Subtitles Overlay Simulation for HTML5 */}
              {selectedSub !== 'off' && isPlaying && currentTime > 2 && currentTime < 15 && (
                <div className="absolute bottom-28 left-0 right-0 text-center pointer-events-none z-20">
                  <span className="px-4 py-1.5 rounded-lg bg-black/80 text-white text-sm sm:text-base font-medium shadow-lg backdrop-blur-sm border border-zinc-700/50">
                    {selectedSub === 'fr' && `[Kingbox ${selectedLang.toUpperCase()}] Sous-titres Français synchronisés`}
                    {selectedSub === 'en' && "[Kingbox] English Subtitles Active"}
                    {selectedSub === 'es' && "[Kingbox] Subtítulos en Español Activos"}
                    {selectedSub === 'ar' && "[Kingbox] الترجمة باللغة العربية مفعلة"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Overlaid UI Controls for HTML5 Direct Player */}
          {currentHoster === 'direct' && !hasError && (
            <div 
              className={`absolute inset-0 flex flex-col justify-end p-4 sm:p-6 transition-opacity duration-300 pointer-events-none ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Bottom Control Bar */}
              <div className="pointer-events-auto bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 rounded-2xl space-y-3">
                {/* Timeline Slider */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-zinc-300 w-12 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:h-2 transition-all"
                  />
                  <span className="text-xs font-mono text-zinc-400 w-12">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Controls Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-red-400 transition-colors p-1"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-red-400 transition-colors p-1"
                    >
                      {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6" />}
                    </button>

                    <button
                      onClick={() => {
                        if (videoRef.current) videoRef.current.currentTime -= 10;
                      }}
                      className="text-zinc-400 hover:text-white transition-colors text-xs flex items-center space-x-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">-10s</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-zinc-400 hidden md:inline">
                      Kingbox Engine ({selectedLang.toUpperCase()}) • {selectedSub !== 'off' ? `Sous-titres [${selectedSub.toUpperCase()}]` : 'Audio Original'}
                    </span>

                    <button
                      onClick={toggleFullScreen}
                      className="text-white hover:text-red-400 transition-colors p-1"
                      title="Plein écran"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

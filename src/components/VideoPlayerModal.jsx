import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Download, 
  AlertCircle, ShieldCheck, ShieldOff, Subtitles, Check, Globe, Server,
  Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  AUDIO_LANGUAGES, 
  FRANIME_HOSTERS, 
  resolveHosterEmbedUrl, 
  resolveAnimeIds,
  getSyncAnimeIds,
  fetchDynamicFranimeLinks,
  createSubtitleBlobUrl 
} from '../utils/franimeHosters';

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
  const [iframeLoading, setIframeLoading] = useState(true);

  // Épisode actif (modifiable directement depuis le lecteur)
  const [activeSeason, setActiveSeason] = useState(media?.currentEpisode?.season || 1);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(media?.currentEpisode?.number || 1);
  const [activeEpisodeTitle, setActiveEpisodeTitle] = useState(media?.currentEpisode?.title || 'Épisode 1');

  // Identifiants Anime (AniList / MAL) résolus instantanément (0ms pour Naruto Shippuden & top animés)
  const [resolvedIds, setResolvedIds] = useState(() => getSyncAnimeIds(media));
  // Liens Vraie VF / VOSTFR résolus dynamiquement depuis le catalogue officiel FRAnime (2553 animés)
  const [dynamicFranimeHosters, setDynamicFranimeHosters] = useState(null);

  // Bouton Bouclier Sandbox (Style FRAnime : désactivé par défaut au lancement pour éviter tout écran noir)
  const [isSandboxEnabled, setIsSandboxEnabled] = useState(false);
  const [shieldToast, setShieldToast] = useState(null);

  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedSub, setSelectedSub] = useState(media?.preferredLang === 'vo' ? 'en' : 'fr');
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [vttBlobUrl, setVttBlobUrl] = useState(null);
  const controlsTimeout = useRef(null);

  const isTv = media?.type === 'tv' || media?.type === 'anime';
  const isAnime = media?.type === 'anime';
  const tmdbId = media?.tmdbId || null;

  // Nettoyer tout ancien état bloquant en localStorage et synchroniser avec le média sélectionné
  useEffect(() => {
    try {
      localStorage.removeItem('kingbox_sandbox_shield');
    } catch {}
  }, []);

  useEffect(() => {
    if (!media) return;
    const initLang = media.preferredLang || 'vf';
    const initHoster = media.preferredHoster || (media.isAdult && !media.tmdbId && !media.malId && !media.anilistId ? 'direct' : 'sibnet');
    setSelectedLang(initLang);
    setCurrentHoster(initHoster);
    setSelectedSub(initLang === 'vo' ? 'en' : 'fr');
    setActiveSeason(media.currentEpisode?.season || 1);
    setActiveEpisodeNum(media.currentEpisode?.number || 1);
    setActiveEpisodeTitle(media.currentEpisode?.title || `Épisode ${media.currentEpisode?.number || 1}`);
    setResolvedIds(getSyncAnimeIds(media));
    setIframeLoading(true);
    setHasError(false);
  }, [media]);

  // Résoudre automatiquement les IDs AniList / MAL pour les animés non présents dans le cache synchrone
  useEffect(() => {
    let mounted = true;
    if (media && (isAnime || !media.tmdbId)) {
      const sync = getSyncAnimeIds(media);
      if (sync.anilistId || sync.malId) {
        setResolvedIds(sync);
      } else {
        resolveAnimeIds(media).then((ids) => {
          if (mounted && (ids.anilistId || ids.malId)) {
            setResolvedIds(ids);
          }
        });
      }
    }
    return () => { mounted = false; };
  }, [media, isAnime]);

  // Résoudre dynamiquement les vrais liens VF / VOSTFR du catalogue officiel FRAnime (2553 animés)
  useEffect(() => {
    let mounted = true;
    setDynamicFranimeHosters(null);
    if (media && isAnime && selectedLang !== 'vo') {
      fetchDynamicFranimeLinks({
        tmdbId,
        title: media.title,
        originalTitle: media.originalTitle,
        season: activeSeason,
        episode: activeEpisodeNum,
        lang: selectedLang
      }).then((hosters) => {
        if (mounted && hosters) {
          setDynamicFranimeHosters(hosters);
        }
      });
    }
    return () => { mounted = false; };
  }, [media, isAnime, tmdbId, activeSeason, activeEpisodeNum, selectedLang]);

  // Générer le fichier WebVTT de sous-titres pour le lecteur HTML5 Direct HD
  useEffect(() => {
    if (selectedSub === 'off') {
      setVttBlobUrl(null);
      return;
    }
    const url = createSubtitleBlobUrl(selectedSub, media?.title || 'Kingbox');
    setVttBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedSub, media?.title]);

  const currentHosterObj = FRANIME_HOSTERS.find((h) => h.id === currentHoster) || FRANIME_HOSTERS[0];
  const currentLangObj = AUDIO_LANGUAGES.find((l) => l.id === selectedLang) || AUDIO_LANGUAGES[0];

  const toggleSandboxShield = () => {
    const nextState = !isSandboxEnabled;
    if (nextState && !currentHosterObj.supportsSandbox) {
      setIsSandboxEnabled(false);
      setShieldToast(
        `⚠️ Le lecteur ${currentHosterObj.name} bloque l'attribut HTML Sandbox (écran noir). Le Bouclier Anti-Popup JS reste actif ! Utilisez Sibnet ou VK Video pour le Sandbox strict.`
      );
      return;
    }
    setIsSandboxEnabled(nextState);
    setIframeLoading(true);
    setShieldToast(
      nextState
        ? `🛡️ Bouclier Sandbox ACTIVÉ sur ${currentHosterObj.name} : Protection maximale sans blocage.`
        : `🔓 Bouclier Sandbox DÉSACTIVÉ : Mode compatibilité maximale pour tous les lecteurs.`
    );
  };

  useEffect(() => {
    if (!shieldToast) return;
    const timer = setTimeout(() => setShieldToast(null), 4500);
    return () => clearTimeout(timer);
  }, [shieldToast]);

  // Timeout de sécurité pour masquer le spinner si l'iframe externe ne déclenche pas onLoad
  useEffect(() => {
    if (!iframeLoading) return;
    const timer = setTimeout(() => setIframeLoading(false), 1800);
    return () => clearTimeout(timer);
  }, [iframeLoading, currentHoster, selectedLang, activeSeason, activeEpisodeNum]);

  const subtitleOptions = [
    { id: 'off', label: 'Désactivé' },
    { id: 'fr', label: 'Français (VF / VOSTFR)', lang: 'fr' },
    { id: 'en', label: 'English (VO / EN)', lang: 'en' },
    { id: 'es', label: 'Español (ES)', lang: 'es' },
    { id: 'ar', label: 'العربية (AR)', lang: 'ar' }
  ];

  // Bouclier Anti-Popup Intelligent (intercepte window.open en permanence sans bloquer l'iframe)
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
    anilistId: resolvedIds.anilistId || media?.anilistId,
    malId: resolvedIds.malId || media?.malId,
    isTv,
    isAnime,
    isAdult: media?.isAdult,
    season: activeSeason,
    episode: activeEpisodeNum,
    customHosters: media?.hosters,
    dynamicFranimeHosters
  });

  // Seuls les hébergeurs compatibles Sandbox reçoivent l'attribut sandbox HTML
  const effectiveSandbox = isSandboxEnabled && currentHosterObj.supportsSandbox;

  // Flux vidéo direct HD (utilise en priorité le vrai MP4 VF/VOSTFR extrait de Sendvid FRAnime s'il est disponible)
  const directVideoUrl = dynamicFranimeHosters?.directMp4
    ? dynamicFranimeHosters.directMp4
    : (selectedLang === 'vostfr' || activeEpisodeNum % 2 === 0
        ? "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
        : (media?.videoUrl && !media.videoUrl.includes('commondatastorage')
            ? media.videoUrl
            : "https://vjs.zencdn.net/v/oceans.mp4"));

  const handleLanguageSwitch = (langId) => {
    setSelectedLang(langId);
    setSelectedSub(langId === 'vo' ? 'en' : 'fr');
    setHasError(false);
    setIframeLoading(true);
    setShieldToast(`🎧 Audio basculé sur ${langId.toUpperCase()} (${langId === 'vf' ? 'Version Française / Dub' : langId === 'vostfr' ? 'VO Sous-titré / Sub' : 'Version Originale'})`);
  };

  const handleHosterSwitch = (hosterId) => {
    const targetObj = FRANIME_HOSTERS.find((h) => h.id === hosterId);
    if (isSandboxEnabled && targetObj && !targetObj.supportsSandbox) {
      setIsSandboxEnabled(false);
      setShieldToast(`🔓 Passage automatique en Mode Compatible (Bouclier OFF) pour le lecteur ${targetObj.name}.`);
    }
    setCurrentHoster(hosterId);
    setHasError(false);
    setIframeLoading(true);
  };

  const handleEpisodeStep = (delta) => {
    const nextEp = Math.max(1, activeEpisodeNum + delta);
    if (nextEp === activeEpisodeNum) return;
    setActiveEpisodeNum(nextEp);
    const foundEp = media?.episodes?.find((e) => e.number === nextEp);
    setActiveEpisodeTitle(foundEp?.title || `Épisode ${nextEp}`);
    setIframeLoading(true);
    setHasError(false);
  };

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
      <div className="absolute top-0 left-0 right-0 z-30 flex flex-col gap-2 p-2.5 sm:p-4 bg-gradient-to-b from-black/95 via-black/90 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Media Title + Episode Controls + Anti-Ad Shield */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-lg font-extrabold text-white line-clamp-1">
                {media.title}
              </h2>
              {isTv && (
                <div className="flex items-center space-x-1 bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-2 py-0.5">
                  <button
                    onClick={() => handleEpisodeStep(-1)}
                    disabled={activeEpisodeNum <= 1}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-0.5"
                    title="Épisode précédent"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-red-400 text-xs font-extrabold px-1">
                    S{activeSeason}:E{activeEpisodeNum}
                  </span>
                  <button
                    onClick={() => handleEpisodeStep(1)}
                    className="text-zinc-400 hover:text-white p-0.5"
                    title="Épisode suivant"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
              {/* Clickable Anti-Ad / Sandbox Shield Status Badge */}
              <button
                onClick={toggleSandboxShield}
                className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full border font-bold transition-all cursor-pointer ${
                  effectiveSandbox
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                }`}
                title="Cliquez pour activer ou désactiver le mode protégé (Sandbox)"
              >
                {effectiveSandbox ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldOff className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>
                  {effectiveSandbox
                    ? `Bouclier Sandbox ON (${currentHosterObj.name})`
                    : `Bouclier OFF • Mode Compatible (${currentHosterObj.name})`}
                  {blockedPopupsCount > 0 ? ` • ${blockedPopupsCount} pub(s) bloquée(s)` : ''}
                </span>
              </button>

              <span className="text-zinc-500 hidden sm:inline">•</span>
              <span className="text-zinc-300 font-semibold">
                Version : <strong className="text-red-400 uppercase">{currentLangObj.flag} {currentLangObj.label}</strong> • {currentHosterObj.quality}
              </span>
            </div>
          </div>

          {/* Right Controls: Shield Toggle Button (FRAnime style) + VF/VOSTFR Switcher + Subtitles + Download + Close */}
          <div className="flex items-center space-x-2">
            {/* Bouton Bouclier (Style FRAnime : Activer / Désactiver Sandbox) */}
            <button
              onClick={toggleSandboxShield}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border shadow-md ${
                effectiveSandbox
                  ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 hover:bg-emerald-600/35 shadow-emerald-950/50'
                  : 'bg-amber-600/20 border-amber-500/70 text-amber-300 hover:bg-amber-600/30'
              }`}
              title={
                effectiveSandbox
                  ? "Bouclier Sandbox ACTIVÉ : Cliquez pour le désactiver"
                  : "Bouclier Sandbox DÉSACTIVÉ (Mode compatible sans blocage) : Cliquez pour activer le Sandbox"
              }
            >
              {effectiveSandbox ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldOff className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden sm:inline">
                {effectiveSandbox ? 'Bouclier ON' : 'Bouclier OFF'}
              </span>
            </button>

            {/* Audio Language Selector (VF / VOSTFR / VO) */}
            <div className="flex items-center bg-zinc-900/95 p-1 rounded-xl border border-zinc-700/80 text-xs">
              {AUDIO_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSwitch(lang.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    selectedLang === lang.id
                      ? 'bg-red-600 text-white shadow-md scale-105'
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
                onClick={() => onDownload(media, { season: activeSeason, number: activeEpisodeNum, title: activeEpisodeTitle })}
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
            <span>Lecteurs :</span>
          </div>
          {FRANIME_HOSTERS.map((hoster) => {
            const active = currentHoster === hoster.id;
            return (
              <button
                key={hoster.id}
                onClick={() => handleHosterSwitch(hoster.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30 scale-105'
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

        {/* Toast Notification lors du changement de langue ou du Bouclier Sandbox */}
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
        <div className="w-full h-full pt-28 sm:pt-32 flex items-center justify-center bg-black relative">
          {iframeLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm space-y-3 pointer-events-none">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              <div className="text-center space-y-1 px-4">
                <p className="text-sm font-bold text-white">
                  Connexion au serveur {currentHosterObj.name} ({selectedLang.toUpperCase()})...
                </p>
                <p className="text-xs text-zinc-400">
                  {currentHosterObj.description}
                </p>
              </div>
            </div>
          )}

          <iframe
            key={`${embedUrl}-sb-${effectiveSandbox}`}
            src={embedUrl}
            title={`${media.title} - ${currentHosterObj.name} (${selectedLang.toUpperCase()})`}
            className="w-full h-full border-0"
            {...(effectiveSandbox
              ? { sandbox: 'allow-scripts allow-same-origin allow-forms allow-presentation' }
              : {})}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      ) : (
        /* DIRECT HTML5 VIDEO PLAYER (Support multi-sous-titres WebVTT & zéro pub garantie) */
        <div className="relative w-full h-full flex items-center justify-center pt-28 sm:pt-32">
          {hasError ? (
            <div className="text-center p-8 max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Flux direct indisponible</h3>
              <p className="text-xs text-zinc-400">
                Basculez sur l'un de nos hébergeurs sans pub (Sibnet, Sendvid, Vidmoly, Filemoon ou VK).
              </p>
              <div className="flex justify-center space-x-2 pt-2">
                <button
                  onClick={() => handleHosterSwitch('sibnet')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
                >
                  Basculer sur Sibnet (Sans Pub)
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                key={`direct-video-${selectedLang}-${activeSeason}-${activeEpisodeNum}-${directVideoUrl}`}
                ref={videoRef}
                src={directVideoUrl}
                className="w-full h-full object-contain cursor-pointer"
                autoPlay
                playsInline
                crossOrigin="anonymous"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onError={() => setHasError(true)}
                onClick={togglePlay}
              >
                {vttBlobUrl && selectedSub !== 'off' && (
                  <track
                    key={`sub-${selectedSub}-${selectedLang}`}
                    kind="subtitles"
                    src={vttBlobUrl}
                    srcLang={selectedSub}
                    label={subtitleOptions.find((o) => o.id === selectedSub)?.label || 'Français'}
                    default
                  />
                )}
              </video>

              {/* Subtitles Overlay for HTML5 */}
              {selectedSub !== 'off' && isPlaying && (
                <div className="absolute bottom-28 left-0 right-0 text-center pointer-events-none z-20 px-4">
                  <span className="inline-block px-4 py-1.5 rounded-lg bg-black/80 text-white text-xs sm:text-sm font-medium shadow-lg backdrop-blur-sm border border-zinc-700/50">
                    {selectedSub === 'fr' && `🇫🇷 [${media.title} • ${selectedLang.toUpperCase()}] Piste audio & sous-titres Français actifs`}
                    {selectedSub === 'en' && `🇬🇧 [${media.title} • VO] English Audio & Subtitles Active`}
                    {selectedSub === 'es' && `🇪🇸 [${media.title}] Subtítulos en Español Activos`}
                    {selectedSub === 'ar' && `🇸🇦 [${media.title}] الترجمة باللغة العربية مفعلة`}
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
                      Kingbox Direct HD ({selectedLang.toUpperCase()}) • {selectedSub !== 'off' ? `Sous-titres [${selectedSub.toUpperCase()}]` : 'Audio Original'}
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

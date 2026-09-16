import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Download, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function VideoPlayerModal({ media, onClose, onDownload }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentServer, setCurrentServer] = useState(1); // 1: AutoEmbed, 2: MultiEmbed, 3: 2Embed, 4: Direct MP4
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeout = useRef(null);

  const tmdbId = media.tmdbId || (media.id && media.id.replace(/[^0-9]/g, '')) || '693134';
  const isTv = media.type === 'tv' || media.type === 'anime';
  const seasonNum = media.currentEpisode?.season || 1;
  const episodeNum = media.currentEpisode?.number || 1;

  // Compute embed URL according to server
  const getEmbedUrl = (serverIndex) => {
    switch (serverIndex) {
      case 1: // AutoEmbed
        return isTv
          ? `https://autoembed.co/tv/tmdb/${tmdbId}-${seasonNum}-${episodeNum}`
          : `https://autoembed.co/movie/tmdb/${tmdbId}`;
      case 2: // MultiEmbed
        return isTv
          ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${seasonNum}&e=${episodeNum}`
          : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      case 3: // 2Embed
        return isTv
          ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${seasonNum}&e=${episodeNum}`
          : `https://www.2embed.cc/embed/${tmdbId}`;
      default:
        return null;
    }
  };

  const directVideoUrl = media.videoUrl && !media.videoUrl.includes('commondatastorage')
    ? media.videoUrl
    : "https://vjs.zencdn.net/v/oceans.mp4";

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying && currentServer === 4) setShowControls(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying, currentServer]);

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
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/95 via-black/70 to-transparent">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-lg font-bold text-white flex items-center space-x-2">
            <span className="line-clamp-1">{media.title}</span>
            {media.currentEpisode && (
              <span className="text-red-400 text-xs sm:text-sm font-normal shrink-0">
                - Ep. {media.currentEpisode.number} ({media.currentEpisode.title})
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-zinc-400">
            <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold rounded">
              EN STREAMING
            </span>
            <span>•</span>
            <span>{currentServer === 4 ? 'Flux Direct HD' : `Serveur S${currentServer} (Embed HD)`}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Server Switcher (Moviebox Multi-Server) */}
          <div className="flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-700/80 text-xs">
            <span className="text-zinc-400 hidden sm:inline px-1">Serveur:</span>
            {[
              { id: 1, label: 'S1 (Auto)' },
              { id: 2, label: 'S2 (VIP)' },
              { id: 3, label: 'S3 (Alt)' },
              { id: 4, label: 'Direct HD' }
            ].map((srv) => (
              <button
                key={srv.id}
                onClick={() => {
                  setCurrentServer(srv.id);
                  setHasError(false);
                  setIsLoading(true);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentServer === srv.id 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {srv.label}
              </button>
            ))}
          </div>

          {/* Quick Download Button */}
          {onDownload && (
            <button
              onClick={() => onDownload(media, media.currentEpisode)}
              className="p-2 sm:p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/30"
              title="Télécharger cette vidéo"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            title="Quitter le lecteur"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* PLAYER CONTENT */}
      {currentServer <= 3 ? (
        /* Embed Player (AutoEmbed, MultiEmbed, 2Embed) */
        <div className="w-full h-full pt-14 flex items-center justify-center bg-black relative">
          <iframe
            key={`srv-${currentServer}-${media.id}-${episodeNum}`}
            src={getEmbedUrl(currentServer)}
            title={media.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>
      ) : (
        /* Direct HTML5 Video Player */
        <div className="relative w-full h-full flex items-center justify-center pt-14">
          {hasError ? (
            <div className="text-center p-8 max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Impossible de charger ce flux direct</h3>
              <p className="text-xs text-zinc-400">
                Le lien vidéo direct rencontre une restriction. Basculez simplement sur l'un de nos serveurs de streaming (S1, S2, S3).
              </p>
              <div className="flex justify-center space-x-2 pt-2">
                <button
                  onClick={() => {
                    setCurrentServer(1);
                    setHasError(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
                >
                  Basculer sur Serveur 1
                </button>
              </div>
            </div>
          ) : (
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
          )}

          {/* Overlaid UI Controls for HTML5 Direct Player */}
          {currentServer === 4 && !hasError && (
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
                      Kingbox Streaming Engine • Qualité HD
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

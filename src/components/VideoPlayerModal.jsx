import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Download, Sparkles, Settings } from 'lucide-react';

export default function VideoPlayerModal({ media, onClose, onDownload }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentServer, setCurrentServer] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    // Reset controls auto-hide
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimeout.current);
    };
  }, [isPlaying]);

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
      {/* Video Element */}
      <video
        ref={videoRef}
        src={media.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
        className="w-full h-full object-contain cursor-pointer"
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Overlaid UI Elements (Show/Hide smoothly) */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 rounded-2xl">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center space-x-2">
              <span>{media.title}</span>
              {media.currentEpisode && (
                <span className="text-red-400 text-sm font-normal">
                  - Ep. {media.currentEpisode.number} ({media.currentEpisode.title})
                </span>
              )}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">
                LECTURE EN COURS
              </span>
              <span>•</span>
              <span>1080p FHD</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Server Switcher (Moviebox feature) */}
            <div className="hidden sm:flex items-center space-x-1 bg-zinc-900/80 px-2 py-1 rounded-xl border border-zinc-700 text-xs">
              <span className="text-zinc-400 mr-1">Serveur:</span>
              {[1, 2, 3].map((srv) => (
                <button
                  key={srv}
                  onClick={() => setCurrentServer(srv)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    currentServer === srv 
                      ? 'bg-red-600 text-white' 
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  S{srv}
                </button>
              ))}
            </div>

            {/* Quick Download Button inside player */}
            {onDownload && (
              <button
                onClick={() => onDownload(media, media.currentEpisode)}
                className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 transition-colors"
                title="Télécharger cette vidéo"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {/* Close / Return Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-colors"
              title="Quitter le lecteur"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Play Button (if paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={togglePlay}
              className="p-6 rounded-full bg-red-600/90 text-white shadow-2xl hover:scale-110 transition-transform"
            >
              <Play className="w-10 h-10 fill-white translate-x-1" />
            </button>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 rounded-2xl space-y-3">
          {/* Progress Timeline Slider */}
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
    </div>
  );
}

import React from 'react';
import { Download, Trash2, Play, HardDrive, Sparkles, WifiOff, Server } from 'lucide-react';

export default function DownloadsView({ 
  downloads, 
  onPlayMedia, 
  onDeleteDownload, 
  onExplore 
}) {
  const handleDirectSave = (item) => {
    const targetUrl = item.downloadStreamUrl || item.directMp4Url || item.videoUrl;
    if (!targetUrl) return;
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = item.fileTitle || `${(item.title || 'Kingbox').replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[70vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Download className="w-4 h-4 text-red-500" />
            <span>Mode Hors-Ligne & Fichiers Complets (.MP4)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Mes Téléchargements
          </h1>
        </div>

        {downloads.length > 0 && (
          <div className="flex items-center space-x-3 bg-zinc-900/80 px-4 py-2 rounded-2xl border border-zinc-800 text-xs">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400">
              {downloads.length} {downloads.length > 1 ? 'contenus complets' : 'contenu complet'} enregistré(s)
            </span>
          </div>
        )}
      </div>

      {downloads.length > 0 ? (
        <div className="space-y-4">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all gap-4"
            >
              <div className="flex items-center space-x-4">
                {/* Poster Thumbnail */}
                <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      onClick={() => onPlayMedia(item)}
                      className="p-2 rounded-full bg-red-600/90 text-white hover:scale-110 transition-transform"
                    >
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 flex items-center space-x-1">
                      <WifiOff className="w-2.5 h-2.5" />
                      <span>FICHIER COMPLET</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300">
                      {item.quality}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {item.audio}
                    </span>
                    {item.provider && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800/90 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                        <Server className="w-2.5 h-2.5" />
                        <span>{item.provider}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>
                  {item.episodeTitle && (
                    <p className="text-xs text-red-400 font-medium">{item.episodeTitle}</p>
                  )}
                  <p className="text-xs text-zinc-400">
                    Taille : <span className="text-zinc-200 font-semibold">{item.size}</span> • Téléchargé le {item.date}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2.5 self-end sm:self-center">
                <button
                  onClick={() => onPlayMedia(item)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Regarder</span>
                </button>

                {(item.downloadStreamUrl || item.directMp4Url) && (
                  <button
                    onClick={() => handleDirectSave(item)}
                    className="flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                    title="Enregistrer le fichier .MP4 sur l'appareil"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.MP4</span>
                  </button>
                )}

                <button
                  onClick={() => onDeleteDownload(item.id)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 border border-zinc-700/60 transition-colors"
                  title="Supprimer du stockage"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-zinc-800/80 p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Aucun téléchargement pour le moment</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Téléchargez vos films, séries et animés préférés en version intégrale (.mp4) pour pouvoir les regarder n'importe où, même sans connexion Internet.
          </p>
          <button
            onClick={onExplore}
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explorer le catalogue</span>
          </button>
        </div>
      )}
    </div>
  );
}

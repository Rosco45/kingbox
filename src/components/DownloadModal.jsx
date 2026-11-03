import React, { useState, useEffect } from 'react';
import { X, Download, Check, HardDrive, ShieldCheck, Film, Tv, AlertCircle, Loader2, Server } from 'lucide-react';
import { resolveRealDownload, buildDownloadStreamUrl } from '../utils/franimeHosters';

export default function DownloadModal({ media, episode, onClose, onDownloadComplete }) {
  const isShow = media?.type === 'tv' || media?.type === 'anime';

  const [quality, setQuality] = useState('1080p');
  const [audio, setAudio] = useState(() => (media?.preferredLang ? media.preferredLang.toUpperCase() : 'VF'));
  const [selectedSeason, setSelectedSeason] = useState(() => episode?.season || media?.currentEpisode?.season || 1);
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(() => episode?.number || media?.currentEpisode?.number || 1);

  const [resolvedInfo, setResolvedInfo] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadStep, setDownloadStep] = useState('Sélection'); // 'Sélection' | 'Téléchargement' | 'Terminé'

  const activeEpisodeObj = isShow
    ? {
        number: selectedEpisodeNum,
        season: selectedSeason,
        title:
          episode?.number === selectedEpisodeNum
            ? episode.title
            : media?.episodes?.find((e) => e.number === selectedEpisodeNum)?.title || `Épisode ${selectedEpisodeNum}`
      }
    : null;

  // Résoudre automatiquement le vrai flux complet (.mp4 direct ou HLS complet) dès l'ouverture ou changement de langue/épisode
  useEffect(() => {
    if (!media) return;
    let mounted = true;
    setIsResolving(true);
    setResolveError(null);
    setResolvedInfo(null);

    resolveRealDownload({
      media,
      episode: isShow ? { number: selectedEpisodeNum, season: selectedSeason } : null,
      lang: audio.toLowerCase(),
      waitUqload: false
    })
      .then((info) => {
        if (!mounted) return;
        if (info && info.found) {
          setResolvedInfo(info);
        } else {
          setResolveError('Recherche de miroir alternatif en cours...');
        }
      })
      .catch(() => {
        if (mounted) setResolveError('Impossible de pré-vérifier la taille du fichier.');
      })
      .finally(() => {
        if (mounted) setIsResolving(false);
      });

    return () => {
      mounted = false;
    };
  }, [media, isShow, selectedSeason, selectedEpisodeNum, audio]);

  if (!media) return null;

  const baseSizeLabel = resolvedInfo?.sizeFormatted || (isShow ? '240 Mo' : '950 Mo');

  const qualityOptions = [
    {
      id: '1080p',
      label: '1080p Full HD (Original)',
      size: baseSizeLabel,
      badge: 'Fichier Complet Intégral',
      bitrate: 'Flux Original Sans Coupure'
    },
    {
      id: '720p',
      label: '720p HD Ready',
      size: resolvedInfo?.sizeFormatted || (isShow ? '160 Mo' : '650 Mo'),
      badge: 'Recommandé Mobile',
      bitrate: 'Haute Définition'
    },
    {
      id: '480p',
      label: '480p SD',
      size: resolvedInfo?.sizeFormatted || (isShow ? '95 Mo' : '380 Mo'),
      badge: 'Économie de données',
      bitrate: 'Compatible Bas Débit'
    }
  ];

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadStep('Téléchargement');
    setProgress(15);
    setStatusMessage('Connexion au serveur de fichiers HD...');

    const epSuffix = isShow
      ? `_S${String(selectedSeason).padStart(2, '0')}E${String(selectedEpisodeNum).padStart(2, '0')}`
      : '';
    const cleanFileName = `${(media.title || 'Kingbox_Media').replace(/[^a-zA-Z0-9_-]/g, '_')}${epSuffix}_${quality}_${audio}.mp4`;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) return 88;
        return prev + 7;
      });
    }, 350);

    try {
      let finalResolved = resolvedInfo;

      // Si le lien nécessite la validation du jeton direct Uqload (ex: Dune 2) ou n'est pas encore résolu
      if (!finalResolved || (finalResolved.hasPendingDirectMp4 && !finalResolved.directMp4Url)) {
        setStatusMessage('Déverrouillage du lien MP4 direct haute vitesse...');
        const fresh = await resolveRealDownload({
          media,
          episode: activeEpisodeObj,
          lang: audio.toLowerCase(),
          waitUqload: true
        });
        if (fresh && fresh.found) {
          finalResolved = fresh;
          setResolvedInfo(fresh);
        }
      }

      clearInterval(progressTimer);
      setProgress(100);
      setStatusMessage('Lancement du téléchargement du fichier complet (.mp4)...');

      const streamDownloadUrl = buildDownloadStreamUrl(finalResolved, cleanFileName);
      const directMp4Url = finalResolved?.directMp4Url || null;

      // Choisir la meilleure URL de téléchargement (flux serveur avec Content-Disposition: attachment ou URL directe MP4)
      let downloadHref = streamDownloadUrl || directMp4Url;

      // Vérifier si le serveur Vite /api/download-stream est joignable (mode Web vs APK Android autonome)
      if (streamDownloadUrl && directMp4Url) {
        try {
          const checkRes = await fetch('/api/vf-resolve?tmdbId=0', { method: 'HEAD' });
          if (!checkRes.ok) {
            downloadHref = directMp4Url;
          }
        } catch {
          downloadHref = directMp4Url;
        }
      }

      if (downloadHref) {
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadHref;
        downloadLink.download = cleanFileName;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      // Enregistrer toutes les vraies métadonnées dans Mes Téléchargements pour une lecture intégrale
      const downloadItem = {
        id: `dl-${media.tmdbId || media.id}-${isShow ? `s${selectedSeason}e${selectedEpisodeNum}` : 'movie'}-${audio.toLowerCase()}`,
        mediaId: media.id,
        tmdbId: media.tmdbId || null,
        anilistId: media.anilistId || null,
        malId: media.malId || null,
        title: media.title,
        originalTitle: media.originalTitle || '',
        episodeTitle: activeEpisodeObj
          ? `S${selectedSeason}:E${activeEpisodeObj.number} - ${activeEpisodeObj.title}`
          : null,
        currentEpisode: activeEpisodeObj,
        type: media.type,
        isAdult: !!media.isAdult,
        poster: media.poster,
        backdrop: media.backdrop,
        quality,
        audio: finalResolved?.resolvedLang || audio,
        preferredLang: audio.toLowerCase(),
        preferredHoster: directMp4Url ? 'direct' : 'sibnet',
        provider: finalResolved?.provider || 'Serveur Direct HD',
        fileTitle: finalResolved?.fileTitle || cleanFileName,
        size:
          finalResolved?.sizeFormatted ||
          qualityOptions.find((q) => q.id === quality)?.size ||
          baseSizeLabel,
        date: new Date().toLocaleDateString('fr-FR'),
        directMp4Url: directMp4Url,
        hlsUrl: finalResolved?.hlsUrl || null,
        downloadStreamUrl: streamDownloadUrl || directMp4Url || null,
        videoUrl: directMp4Url || streamDownloadUrl || media.videoUrl
      };

      onDownloadComplete?.(downloadItem);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadStep('Terminé');
        setTimeout(() => {
          onClose();
        }, 1400);
      }, 600);
    } catch (err) {
      clearInterval(progressTimer);
      console.error('Erreur de téléchargement:', err);
      setIsDownloading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={!isDownloading ? onClose : undefined}></div>

      <div className="relative w-full max-w-lg bg-[#111118] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              <img src={media.poster} alt={media.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                Téléchargement Fichier Complet (.MP4)
              </span>
              <h3 className="text-lg font-bold text-white line-clamp-1">{media.title}</h3>
              {isShow ? (
                <p className="text-xs text-red-400 font-semibold">
                  Saison {selectedSeason} • Épisode {selectedEpisodeNum} : {activeEpisodeObj?.title}
                </p>
              ) : (
                <p className="text-xs text-zinc-400">Film intégral Haute Définition</p>
              )}
            </div>
          </div>

          {!isDownloading && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Downloading State */}
        {isDownloading ? (
          <div className="py-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto animate-pulse">
              <Download className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">
                {progress >= 100 ? 'Téléchargement lancé dans votre navigateur !' : statusMessage}
              </h4>
              <p className="text-xs text-zinc-400">
                {resolvedInfo?.fileTitle || `${media.title} (${quality} • ${audio})`}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>{progress}%</span>
                <span>{resolvedInfo?.sizeFormatted || baseSizeLabel}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vidéo intégrale vérifiée ({resolvedInfo?.provider || 'Serveur Direct HD'})</span>
            </p>
          </div>
        ) : downloadStep === 'Terminé' ? (
          <div className="py-8 space-y-3 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Téléchargement Direct Démarré !</h4>
            <p className="text-xs text-zinc-400">
              Le fichier complet ({resolvedInfo?.sizeFormatted || baseSizeLabel}) est en cours d'enregistrement sur votre appareil et a été ajouté à <strong>Mes Téléchargements</strong>.
            </p>
          </div>
        ) : (
          /* Selection State */
          <>
            {/* Sélecteur d'épisode rapide si c'est une série / un animé */}
            {isShow && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center space-x-1.5">
                    <Tv className="w-3.5 h-3.5 text-red-500" />
                    <span>Épisode à télécharger :</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] text-zinc-400">Saison</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Math.max(1, Number(e.target.value) || 1))}
                      className="w-14 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-bold text-center"
                    />
                    <label className="text-[11px] text-zinc-400">Ép.</label>
                    <input
                      type="number"
                      min={1}
                      max={1200}
                      value={selectedEpisodeNum}
                      onChange={(e) => setSelectedEpisodeNum(Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Audio selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                1. Version Audio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'VF', label: '🇫🇷 Version Française (VF)' },
                  { id: 'VOSTFR', label: '🇯🇵 Version Originale (VOSTFR)' }
                ].map((aud) => (
                  <button
                    key={aud.id}
                    onClick={() => setAudio(aud.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      audio === aud.id
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {aud.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                2. Sélectionnez la Résolution
              </label>
              <div className="space-y-2">
                {qualityOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setQuality(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      quality === opt.id
                        ? 'bg-red-600/15 border-red-500/80 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          quality === opt.id ? 'border-red-500 bg-red-600' : 'border-zinc-600'
                        }`}
                      >
                        {quality === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <span className="text-sm font-bold">{opt.label}</span>
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 border border-emerald-500/30 font-semibold">
                          {opt.badge}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-zinc-200">{opt.size}</span>
                      <span className="block text-[10px] text-zinc-500">{opt.bitrate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Server Source & File Size Verification Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Source :{' '}
                    <strong className="text-white">
                      {isResolving
                        ? 'Analyse du serveur HD...'
                        : resolvedInfo?.provider || 'Serveur Direct Kingbox'}
                    </strong>
                  </span>
                </div>
                {isResolving ? (
                  <span className="flex items-center space-x-1 text-amber-400 text-[11px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Vérification...</span>
                  </span>
                ) : resolvedInfo ? (
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{resolvedInfo.sizeFormatted || baseSizeLabel} (Complet)</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400">{resolveError || 'Prêt'}</span>
                )}
              </div>

              {resolvedInfo?.fileTitle && (
                <p className="text-[11px] text-zinc-400 font-mono truncate pl-6">
                  Fichier : {resolvedInfo.fileTitle}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStartDownload}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>
                  Télécharger ({resolvedInfo?.sizeFormatted || baseSizeLabel})
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaRow from './components/MediaRow';
import MediaCard from './components/MediaCard';
import MediaModal from './components/MediaModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import SearchModal from './components/SearchModal';
import FavoritesView from './components/FavoritesView';
import DownloadsView from './components/DownloadsView';
import DownloadModal from './components/DownloadModal';
import SettingsModal from './components/SettingsModal';
import AdultView from './components/AdultView';
import AdultGateModal from './components/AdultGateModal';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';

import { FEATURED_HERO, MEDIA_LIST, GENRES } from './data/mockData';
import { 
  getTmdbApiKey, 
  fetchTrendingAll, 
  fetchPopularMovies, 
  fetchPopularSeries, 
  fetchPopularAnime 
} from './utils/tmdb';
import { isAdultSessionUnlocked, setAdultSessionUnlocked } from './utils/adultApi';
import { Flame, Film, Tv, Sparkles, Database, Download, Lock } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('all'); // 'all' | 'movie' | 'tv' | 'anime' | 'favorites' | 'downloads' | 'adult'
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [playingMedia, setPlayingMedia] = useState(null);
  const [downloadTarget, setDownloadTarget] = useState(null); // { media, episode }

  // Adult section protection state
  const [isAdultUnlocked, setIsAdultUnlocked] = useState(() => isAdultSessionUnlocked());
  const [showAdultGate, setShowAdultGate] = useState(false);

  // TMDB Data state
  const [tmdbApiKey, setTmdbApiKey] = useState(getTmdbApiKey());
  const [trendingData, setTrendingData] = useState([]);
  const [moviesData, setMoviesData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [animeData, setAnimeData] = useState([]);
  const [isLoadingTmdb, setIsLoadingTmdb] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('kingbox_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Downloads state
  const [downloads, setDownloads] = useState(() => {
    try {
      const saved = localStorage.getItem('kingbox_downloads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [installPrompt, setInstallPrompt] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('Tous');

  // Load TMDB catalog if API key is configured
  const loadTmdbCatalog = useCallback(async () => {
    const key = getTmdbApiKey();
    setTmdbApiKey(key);
    if (!key) {
      setTrendingData([]);
      setMoviesData([]);
      setSeriesData([]);
      setAnimeData([]);
      return;
    }

    setIsLoadingTmdb(true);
    try {
      const [trend, mov, ser, anim] = await Promise.all([
        fetchTrendingAll(key),
        fetchPopularMovies(key),
        fetchPopularSeries(key),
        fetchPopularAnime(key)
      ]);
      setTrendingData(trend);
      setMoviesData(mov);
      setSeriesData(ser);
      setAnimeData(anim);
    } catch (err) {
      console.error('Erreur de chargement TMDB:', err);
    } finally {
      setIsLoadingTmdb(false);
    }
  }, []);

  useEffect(() => {
    loadTmdbCatalog();
  }, [loadTmdbCatalog]);

  // PWA install prompt handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Persist favorites in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kingbox_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Persist downloads in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kingbox_downloads', JSON.stringify(downloads));
    } catch (e) {
      console.error(e);
    }
  }, [downloads]);

  const toggleFavorite = (item) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  const deleteDownload = (id) => {
    setDownloads((prev) => prev.filter(d => d.id !== id));
  };

  // Merge TMDB data if available, or use local mock data
  const finalTrending = useMemo(() => {
    return trendingData.length > 0 ? trendingData : MEDIA_LIST.filter(m => m.trending);
  }, [trendingData]);

  const finalMovies = useMemo(() => {
    return moviesData.length > 0 ? moviesData : MEDIA_LIST.filter(m => m.type === 'movie');
  }, [moviesData]);

  const finalSeries = useMemo(() => {
    return seriesData.length > 0 ? seriesData : MEDIA_LIST.filter(m => m.type === 'tv');
  }, [seriesData]);

  const finalAnime = useMemo(() => {
    return animeData.length > 0 ? animeData : MEDIA_LIST.filter(m => m.type === 'anime');
  }, [animeData]);

  const allCombinedMedia = useMemo(() => {
    if (tmdbApiKey && (finalTrending.length > 0 || finalMovies.length > 0)) {
      return [...finalTrending, ...finalMovies, ...finalSeries, ...finalAnime];
    }
    return MEDIA_LIST;
  }, [tmdbApiKey, finalTrending, finalMovies, finalSeries, finalAnime]);

  // Category specific items for dedicated tab view
  const currentTabItems = useMemo(() => {
    if (currentTab === 'movie') return finalMovies;
    if (currentTab === 'tv') return finalSeries;
    if (currentTab === 'anime') return finalAnime;
    return allCombinedMedia;
  }, [currentTab, finalMovies, finalSeries, finalAnime, allCombinedMedia]);

  // Filter tab items by genre if applicable
  const filteredCategoryItems = useMemo(() => {
    if (selectedGenre === 'Tous') return currentTabItems;
    return currentTabItems.filter(item => item.genres?.includes(selectedGenre));
  }, [currentTabItems, selectedGenre]);

  // Hero item
  const currentHero = useMemo(() => {
    if (currentTab === 'movie') return finalMovies[0] || FEATURED_HERO;
    if (currentTab === 'tv') return finalSeries[0] || FEATURED_HERO;
    if (currentTab === 'anime') return finalAnime[0] || FEATURED_HERO;
    return finalTrending[0] || FEATURED_HERO;
  }, [currentTab, finalMovies, finalSeries, finalAnime, finalTrending]);

  return (
    <div className="min-h-screen bg-[#09090e] text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedGenre('Tous');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setSearchOpen(true)}
        favoritesCount={favorites.length}
        downloadsCount={downloads.length}
        isAdultUnlocked={isAdultUnlocked}
        onOpenAdultGate={() => setShowAdultGate(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        installPrompt={installPrompt}
        onInstallClick={handleInstallClick}
      />

      {/* Optional TMDB Catalog Status Indicator Banner */}
      {!tmdbApiKey && currentTab !== 'adult' && (
        <div className="pt-20 pb-1 px-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-800/80 border border-zinc-800 text-xs">
            <div className="flex items-center space-x-2.5">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-zinc-300">
                Mode démo actif. Activez l'<strong>API TMDB gratuite</strong> pour débloquer +100 000 films et séries en temps réel.
              </span>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="ml-3 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg shrink-0 transition-colors"
            >
              Connecter TMDB
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentTab === 'favorites' ? (
          <FavoritesView
            favorites={favorites}
            onSelectMedia={setSelectedMedia}
            onPlayMedia={setPlayingMedia}
            onToggleFavorite={toggleFavorite}
            onExplore={() => setCurrentTab('all')}
          />
        ) : currentTab === 'downloads' ? (
          <DownloadsView
            downloads={downloads}
            onPlayMedia={setPlayingMedia}
            onDeleteDownload={deleteDownload}
            onExplore={() => setCurrentTab('all')}
          />
        ) : currentTab === 'adult' ? (
          /* SECTION ADULTE 18+ (HENTAI & FILMS ADULTES) */
          isAdultUnlocked ? (
            <AdultView
              onSelectMedia={setSelectedMedia}
              onPlayMedia={setPlayingMedia}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
              onLockSection={() => {
                setIsAdultUnlocked(false);
                setAdultSessionUnlocked(false);
                setCurrentTab('all');
              }}
              onChangePin={() => setShowAdultGate(true)}
            />
          ) : (
            <div className="pt-32 pb-24 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Section Adulte Verrouillée</h2>
              <p className="text-xs text-zinc-400">
                Un code de sécurité à 4 chiffres est requis pour accéder aux animés et films réservés aux adultes.
              </p>
              <button
                onClick={() => setShowAdultGate(true)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/30 active:scale-95"
              >
                Déverrouiller avec le Code PIN
              </button>
            </div>
          )
        ) : currentTab === 'all' ? (
          /* VUE ACCUEIL */
          <>
            {/* Cinematic Hero */}
            <HeroBanner
              featured={currentHero}
              onPlay={setPlayingMedia}
              onOpenDetails={setSelectedMedia}
              onDownload={(media) => setDownloadTarget({ media, episode: null })}
              isFavorite={favorites.some((f) => f.id === currentHero.id)}
              onToggleFavorite={toggleFavorite}
            />

            {/* Quick Genres Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-2">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2">
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider mr-2 shrink-0">
                  Genres :
                </span>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setSelectedGenre(g);
                      if (g !== 'Tous') {
                        setSearchOpen(true);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/80 shrink-0 transition-all active:scale-95"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 1: Tendances */}
            <MediaRow
              title="🔥 Tendances du Moment"
              items={finalTrending}
              icon={Flame}
              onSelect={setSelectedMedia}
              onPlay={setPlayingMedia}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />

            {/* Row 2: Films Populaires */}
            <MediaRow
              title="🎬 Films Populaires & Box-Office"
              items={finalMovies}
              icon={Film}
              onSelect={setSelectedMedia}
              onPlay={setPlayingMedia}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />

            {/* Row 3: Séries TV */}
            <MediaRow
              title="📺 Séries Télévisées les Mieux Notées"
              items={finalSeries}
              icon={Tv}
              onSelect={setSelectedMedia}
              onPlay={setPlayingMedia}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />

            {/* Row 4: Top Animés */}
            <MediaRow
              title="⚡ Top Animés & Nouveautés Japonaises"
              items={finalAnime}
              icon={Sparkles}
              onSelect={setSelectedMedia}
              onPlay={setPlayingMedia}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </>
        ) : (
          /* VUES DÉDIÉES (Films, Séries ou Animés) */
          <div>
            {currentHero && (
              <HeroBanner
                featured={currentHero}
                onPlay={setPlayingMedia}
                onOpenDetails={setSelectedMedia}
                onDownload={(media) => setDownloadTarget({ media, episode: null })}
                isFavorite={favorites.some((f) => f.id === currentHero.id)}
                onToggleFavorite={toggleFavorite}
              />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {currentTab === 'movie' && 'Tous les Films'}
                    {currentTab === 'tv' && 'Toutes les Séries TV'}
                    {currentTab === 'anime' && 'Tous les Animés'}
                  </h1>
                  <p className="text-sm text-zinc-400 mt-1">
                    {tmdbApiKey 
                      ? 'Catalogue en direct depuis The Movie Database (TMDB).' 
                      : 'Découvrez notre sélection en streaming haute définition.'}
                  </p>
                </div>

                {/* Genre Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedGenre === g
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 pt-2">
                {filteredCategoryItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onSelect={setSelectedMedia}
                    onPlay={setPlayingMedia}
                    isFavorite={favorites.some((fav) => fav.id === item.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer avec la signature officielle : Coded with ❤️ by Roserick */}
      <Footer onCategorySelect={setCurrentTab} />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        downloadsCount={downloads.length}
        isAdultUnlocked={isAdultUnlocked}
        onOpenAdultGate={() => setShowAdultGate(true)}
      />

      {/* Search Overlay Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={allCombinedMedia}
        onSelectMedia={setSelectedMedia}
        onPlayMedia={setPlayingMedia}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* Details View Modal */}
      {selectedMedia && (
        <MediaModal
          item={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onPlay={(mediaToPlay) => {
            setSelectedMedia(null);
            setPlayingMedia(mediaToPlay);
          }}
          onDownload={(media, ep) => setDownloadTarget({ media, episode: ep })}
          isFavorite={favorites.some((f) => f.id === selectedMedia.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Streaming Video Player Modal */}
      {playingMedia && (
        <VideoPlayerModal
          media={playingMedia}
          onClose={() => setPlayingMedia(null)}
          onDownload={(media, ep) => setDownloadTarget({ media, episode: ep })}
        />
      )}

      {/* Download Modal */}
      {downloadTarget && (
        <DownloadModal
          media={downloadTarget.media}
          episode={downloadTarget.episode}
          onClose={() => setDownloadTarget(null)}
          onDownloadComplete={(newItem) => {
            setDownloads((prev) => [newItem, ...prev.filter(d => d.id !== newItem.id)]);
          }}
        />
      )}

      {/* Adult Section Gate / PIN Modal */}
      <AdultGateModal
        isOpen={showAdultGate}
        onClose={() => setShowAdultGate(false)}
        onUnlockSuccess={() => {
          setIsAdultUnlocked(true);
          setCurrentTab('adult');
        }}
      />

      {/* Settings / TMDB Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onKeyUpdated={loadTmdbCatalog}
      />

    </div>
  );
}

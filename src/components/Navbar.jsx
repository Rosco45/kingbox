import React, { useState, useEffect } from 'react';
import { Crown, Search, Heart, Film, Tv, Sparkles, Download, Menu, X, Settings, HardDrive } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenSearch, 
  favoritesCount = 0,
  downloadsCount = 0,
  onOpenSettings,
  installPrompt,
  onInstallClick
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'all', label: 'Accueil' },
    { id: 'movie', label: 'Films' },
    { id: 'tv', label: 'Séries' },
    { id: 'anime', label: 'Animés' },
    { id: 'favorites', label: 'Ma Liste', count: favoritesCount },
    { id: 'downloads', label: 'Téléchargements', count: downloadsCount, icon: Download }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#09090e]/95 backdrop-blur-md shadow-lg shadow-black/50 border-b border-zinc-800/60 py-3' 
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <button 
            onClick={() => setCurrentTab('all')}
            className="flex items-center space-x-2 group text-left focus:outline-none"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform duration-200">
              <Crown className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-wider text-white">
                  KING<span className="text-red-500">BOX</span>
                </span>
              </div>
              <span className="text-[10px] tracking-widest text-zinc-400 font-semibold block -mt-1">
                STREAMING
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all relative flex items-center space-x-1 ${
                    active
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      active ? 'bg-white text-zinc-950' : 'bg-red-600 text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side tools: Search, Settings (TMDB), Install App (PWA), Mobile menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Install PWA Button */}
          {installPrompt && (
            <button
              onClick={onInstallClick}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-zinc-950 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
              title="Installer l'application Kingbox sur votre appareil"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'app</span>
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full text-sm transition-all border border-zinc-700/50 backdrop-blur-sm active:scale-95"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline text-xs text-zinc-400">Rechercher...</span>
          </button>

          {/* Settings / TMDB API Key button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors border border-zinc-800"
            title="Catalogue & Clé API TMDB"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e0e14] border-b border-zinc-800 px-4 py-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                currentTab === item.id
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-zinc-300 hover:bg-zinc-800/80'
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="px-2 py-0.5 text-xs bg-zinc-900 text-white rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 mt-2"
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres API TMDB</span>
          </button>
          {installPrompt && (
            <button
              onClick={() => {
                onInstallClick();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-sm mt-2"
            >
              <Download className="w-4 h-4" />
              <span>Installer l'application Kingbox</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

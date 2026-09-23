import React from 'react';
import { Home, Film, Tv, Flame, Heart, Download, Lock, Unlock, ShieldAlert } from 'lucide-react';

export default function BottomNav({ 
  currentTab, 
  setCurrentTab, 
  favoritesCount = 0, 
  downloadsCount = 0,
  isAdultUnlocked = false,
  onOpenAdultGate 
}) {
  const tabs = [
    { id: 'all', label: 'Accueil', icon: Home },
    { id: 'movie', label: 'Films', icon: Film },
    { id: 'tv', label: 'Séries', icon: Tv },
    { id: 'anime', label: 'Animés', icon: Flame },
    { id: 'adult', label: '18+', icon: isAdultUnlocked ? Unlock : Lock, isAdult: true },
    { id: 'downloads', label: 'Offline', icon: Download, count: downloadsCount },
    { id: 'favorites', label: 'Favoris', icon: Heart, count: favoritesCount },
  ];

  const handleTabClick = (tab) => {
    if (tab.isAdult) {
      if (isAdultUnlocked) {
        setCurrentTab('adult');
      } else {
        onOpenAdultGate?.();
      }
    } else {
      setCurrentTab(tab.id);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090e]/95 backdrop-blur-lg border-t border-zinc-800/80 px-1 py-1.5 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 relative transition-all duration-200 ${
              isActive 
                ? tab.isAdult ? 'text-purple-400 font-bold scale-105' : 'text-red-500 font-bold scale-105' 
                : tab.isAdult && isAdultUnlocked ? 'text-red-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive && tab.id === 'favorites' ? 'fill-red-500' : ''}`} />
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {tab.count}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 tracking-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

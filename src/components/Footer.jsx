import React from 'react';
import { Crown, Heart, Film, Tv, Sparkles } from 'lucide-react';

export default function Footer({ onCategorySelect }) {
  return (
    <footer className="w-full bg-[#07070a] border-t border-zinc-800/80 text-zinc-400 pt-10 pb-24 md:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 text-white shadow-lg shadow-red-600/20">
                <Crown className="w-5 h-5 text-amber-200" />
              </div>
              <span className="text-2xl font-black tracking-wider text-white">
                KING<span className="text-red-500">BOX</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                HD & 4K
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              La plateforme ultime pour explorer et regarder vos films, séries TV et animés préférés en haute qualité, avec une interface fluide inspirée de Moviebox.
            </p>
            <div className="flex items-center space-x-2 text-xs text-zinc-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimisé pour Web, Mobile & Android (PWA / Capacitor)</span>
            </div>
          </div>

          {/* Col 2: Navigation rapide */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explorer
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onCategorySelect?.('all')} 
                  className="hover:text-red-400 transition-colors"
                >
                  Accueil & Tendances
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect?.('movie')} 
                  className="hover:text-red-400 transition-colors"
                >
                  Films Populaires
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect?.('tv')} 
                  className="hover:text-red-400 transition-colors"
                >
                  Séries du Moment
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onCategorySelect?.('anime')} 
                  className="hover:text-red-400 transition-colors"
                >
                  Top Animés
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Informations */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              À propos
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>Lecteur Haute Définition</li>
              <li>Multi-supports (Mobile & PC)</li>
              <li>Catalogue synchronisé</li>
              <li>Mode hors-ligne (PWA)</li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-zinc-800/80 my-8"></div>

        {/* SIGNATURE OFFICIELLE ROSERICK (User requirement) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-base md:text-lg font-medium text-zinc-200">
            <span>Coded with</span>
            <span className="inline-flex items-center justify-center animate-pulse text-red-500 text-xl mx-0.5">
              ❤️
            </span>
            <span>by <strong className="text-white font-bold tracking-wide hover:text-amber-400 transition-colors">Roserick</strong></span>
          </div>

          <div className="text-xs text-zinc-500 text-center sm:text-right">
            <p>© {new Date().getFullYear()} Kingbox Media. Tous droits réservés.</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Pour usage personnel et démonstration technologique.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

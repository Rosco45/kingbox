import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Database, Sparkles } from 'lucide-react';
import { getTmdbApiKey, setTmdbApiKey, testTmdbApiKey } from '../utils/tmdb';

export default function SettingsModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState(getTmdbApiKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setTmdbApiKey('');
      setTestResult({ success: true, message: 'Clé effacée. Mode catalogue démo activé.' });
      onKeyUpdated?.();
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const isValid = await testTmdbApiKey(apiKey.trim());
    setIsTesting(false);

    if (isValid) {
      setTmdbApiKey(apiKey.trim());
      setTestResult({
        success: true,
        message: 'Connexion TMDB réussie ! Catalogue mondial infini activé avec succès.'
      });
      onKeyUpdated?.();
    } else {
      setTestResult({
        success: false,
        message: 'Clé invalide ou problème de connexion avec TMDB. Vérifiez votre clé API.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-[#111118] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 text-white">
              <Database className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Source du Catalogue (TMDB)</h3>
              <p className="text-xs text-zinc-400">Connectez TMDB pour un catalogue infini</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Votre Clé API TMDB (v3 ou v4)</span>
              <span className="text-[11px] text-amber-400 font-normal">Gratuite & Illimitée</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Exemple: 8a4c1f82d49..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Test Status Message */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
              testResult.success 
                ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Instructions to get key */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 text-xs text-zinc-400">
            <p className="font-semibold text-zinc-200">Comment obtenir votre clé API TMDB en 2 minutes ?</p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Créez un compte gratuit sur <strong className="text-white">themoviedb.org</strong>.</li>
              <li>Allez dans <strong className="text-white">Paramètres &gt; API</strong>.</li>
              <li>Cliquez sur <strong className="text-white">Créer</strong> puis choisissez "Développeur".</li>
              <li>Copiez la <strong className="text-white">Clé API (v3 auth)</strong> et collez-la ici.</li>
            </ol>
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-red-400 hover:text-red-300 font-semibold pt-1"
            >
              <span>Accéder à la page API TMDB</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleTestAndSave}
            disabled={isTesting}
            className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tester & Enregistrer</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

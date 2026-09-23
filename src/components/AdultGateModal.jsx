import React, { useState } from 'react';
import { X, Lock, ShieldAlert, KeyRound, CheckCircle2, Delete, ArrowRight, RefreshCcw } from 'lucide-react';
import { getAdultPin, setAdultPin, setAdultSessionUnlocked } from '../utils/adultApi';

export default function AdultGateModal({ isOpen, onClose, onUnlockSuccess }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinStep, setNewPinStep] = useState(1); // 1: Old PIN, 2: New PIN
  const [tempNewPin, setTempNewPin] = useState('');

  if (!isOpen) return null;

  const currentSavedPin = getAdultPin();

  const handleKeyPress = (num) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      setErrorMsg('');

      // Auto-validate when 4 digits are typed
      if (next.length === 4) {
        processPin(next);
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const processPin = (enteredPin) => {
    if (isChangingPin) {
      if (newPinStep === 1) {
        if (enteredPin === currentSavedPin) {
          setNewPinStep(2);
          setPinInput('');
          setErrorMsg('');
        } else {
          setErrorMsg('Ancien code PIN incorrect');
          setPinInput('');
        }
      } else if (newPinStep === 2) {
        setAdultPin(enteredPin);
        setIsChangingPin(false);
        setNewPinStep(1);
        setPinInput('');
        setErrorMsg('Nouveau code PIN enregistré !');
      }
      return;
    }

    // Normal unlock check
    if (enteredPin === currentSavedPin) {
      setAdultSessionUnlocked(true);
      onUnlockSuccess?.();
      onClose();
    } else {
      setErrorMsg('Code PIN incorrect. Veuillez réessayer.');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn select-none">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-[#121118] border border-red-950/80 rounded-3xl overflow-hidden shadow-2xl z-10 p-6 space-y-5 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 p-0.5 mx-auto shadow-lg shadow-red-600/30">
          <div className="w-full h-full bg-[#121118] rounded-2xl flex items-center justify-center text-red-500">
            <Lock className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
        </div>

        {/* Title & Warning */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-[11px] font-black text-red-400 tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Contenu 18+ Verrouillé</span>
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {isChangingPin 
              ? (newPinStep === 1 ? 'Vérification de sécurité' : 'Définir le nouveau PIN') 
              : 'Accès Réservé aux Adultes'}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed px-2">
            {isChangingPin
              ? (newPinStep === 1 ? 'Entrez votre code PIN actuel' : 'Entrez votre nouveau code à 4 chiffres')
              : 'Cette section contient des contenus réservés à un public majeur. Entrez votre code PIN pour déverrouiller.'}
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center space-x-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  filled 
                    ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50' 
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <p className={`text-xs font-semibold ${errorMsg.includes('enregistré') ? 'text-green-400' : 'text-red-400'} animate-bounce`}>
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="h-12 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-lg font-bold text-white transition-all active:scale-90 shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => {
              setIsChangingPin(!isChangingPin);
              setNewPinStep(1);
              setPinInput('');
              setErrorMsg('');
            }}
            className="h-12 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-zinc-800/60 text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center justify-center"
            title="Modifier le code PIN"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-lg font-bold text-white transition-all active:scale-90 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/80 border border-zinc-800/60 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-colors active:scale-90"
            title="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Helper Note */}
        {!isChangingPin && currentSavedPin === '0000' && (
          <p className="text-[11px] text-zinc-500 pt-1">
            Astuce : Code PIN par défaut : <strong className="text-zinc-300">0000</strong>
          </p>
        )}

      </div>
    </div>
  );
}

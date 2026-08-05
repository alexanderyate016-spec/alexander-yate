import React, { useState } from 'react';
import { MedicalStore } from '../medical/MedicalStore';
import { X, Moon, Star, Check } from 'lucide-react';

interface Props {
  selectedDate: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSleepModal: React.FC<Props> = ({
  selectedDate,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    MedicalStore.saveSleepRecord({
      date: selectedDate,
      bedTime,
      wakeTime,
      quality
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#030712] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white">Registro de Descanso y Sueño</h3>
            <p className="text-xs text-slate-300 font-mono">Fecha: {selectedDate}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                Hora Acostarse
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={e => setBedTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                Hora Despertar
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={e => setWakeTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
              Calidad del Sueño
            </label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setQuality(star)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    quality >= star
                      ? 'bg-indigo-950/80 border-indigo-400 text-amber-300 shadow'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${quality >= star ? 'fill-amber-300 text-amber-300' : ''}`} />
                  <span>{star}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" /> Guardado
                </>
              ) : (
                'Guardar Registro'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

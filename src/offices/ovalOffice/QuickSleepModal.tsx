import React, { useState } from 'react';
import { MedicalStore } from '../medical/MedicalStore';
import { X, Moon, Check } from 'lucide-react';

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

  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(8);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    MedicalStore.addHealthRecord({
      date: selectedDate,
      sleepHours,
      sleepQuality
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-900 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 text-xl">
            🌙
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Registrar Sueño y Descanso</h3>
            <p className="text-xs text-slate-500 font-mono">Fecha: {selectedDate}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Horas de Sueño</label>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {sleepHours} hrs
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              step="0.5"
              value={sleepHours}
              onChange={e => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700">Calidad percibida (1 a 10)</label>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {sleepQuality} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sleepQuality}
              onChange={e => setSleepQuality(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" /> Registrado
                </>
              ) : (
                'Guardar Sueño'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

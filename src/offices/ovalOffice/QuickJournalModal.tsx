import React, { useState } from 'react';
import { PersonalDevStore } from '../personalDev/PersonalDevStore';
import { X, BookOpen, Sparkles, Check } from 'lucide-react';

interface Props {
  selectedDate: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickJournalModal: React.FC<Props> = ({
  selectedDate,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const existingEntry = PersonalDevStore.getEntryForDate(selectedDate);

  const [wordOfTheDay, setWordOfTheDay] = useState(existingEntry?.wordOfTheDay || '');
  const [philosophicalAnswer, setPhilosophicalAnswer] = useState(existingEntry?.philosophicalAnswer || '');
  const [freeReflection, setFreeReflection] = useState(existingEntry?.freeReflection || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    PersonalDevStore.saveJournalEntry({
      date: selectedDate,
      wordOfTheDay,
      philosophicalAnswer,
      freeReflection
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#030712] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white">Reflexión Diaria Ejecutiva</h3>
            <p className="text-xs text-slate-300 font-mono">Fecha: {selectedDate}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              Palabra del Día
            </label>
            <input
              type="text"
              value={wordOfTheDay}
              onChange={e => setWordOfTheDay(e.target.value)}
              placeholder="Ej. Claridad, Firmeza, Enfoque..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              Respuesta a la Pregunta Filosófica
            </label>
            <textarea
              rows={3}
              value={philosophicalAnswer}
              onChange={e => setPhilosophicalAnswer(e.target.value)}
              placeholder="¿Qué decisión tomada hoy reflejará con mayor claridad tus valores fundamentales?"
              className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              Reflexión Libre del Día
            </label>
            <textarea
              rows={3}
              value={freeReflection}
              onChange={e => setFreeReflection(e.target.value)}
              placeholder="Pensamientos, aprendizajes o notas personales de hoy..."
              className="w-full bg-white/5 border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none"
            />
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" /> Guardado
                </>
              ) : (
                'Guardar Registro Privado'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

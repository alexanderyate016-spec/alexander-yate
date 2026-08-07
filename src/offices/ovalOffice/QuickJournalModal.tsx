import React, { useState } from 'react';
import { PersonalDevStore } from '../personalDev/PersonalDevStore';
import { X, BookOpen, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full space-y-4 text-slate-900 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 text-xl">
            ✍️
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Reflexión Diaria Ejecutiva</h3>
            <p className="text-xs text-slate-500 font-mono">Fecha: {selectedDate}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Palabra del Día
            </label>
            <input
              type="text"
              value={wordOfTheDay}
              onChange={e => setWordOfTheDay(e.target.value)}
              placeholder="Ej. Claridad, Firmeza, Enfoque..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Respuesta a la Pregunta Filosófica
            </label>
            <textarea
              rows={2}
              value={philosophicalAnswer}
              onChange={e => setPhilosophicalAnswer(e.target.value)}
              placeholder="¿Qué decisión tomada hoy reflejará con mayor claridad tus valores fundamentales?"
              className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reflexión Libre del Día
            </label>
            <textarea
              rows={3}
              value={freeReflection}
              onChange={e => setFreeReflection(e.target.value)}
              placeholder="Pensamientos, aprendizajes o notas personales de hoy..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none transition-all resize-none"
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
                  <Check className="w-4 h-4 text-white" /> Guardado
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

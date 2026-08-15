import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalMood, JournalEntry } from '../../../types/store';
import { PersonalDevStore } from '../../personalDev/PersonalDevStore';
import { Sparkles, MessageSquare, Check } from 'lucide-react';

interface Props {
  todayEntry?: JournalEntry;
  todayStr: string;
}

const MOODS: Array<{ key: JournalMood; label: string; emoji: string; desc: string; color: string; border: string }> = [
  { key: 'excelente', label: 'Excelente', emoji: '🌟', desc: 'Lleno de energía y gratitud', color: 'from-amber-500/20 to-yellow-500/20 text-amber-300', border: 'border-amber-500/40' },
  { key: 'bueno', label: 'Bien', emoji: '😊', desc: 'En buen estado y productivo', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300', border: 'border-emerald-500/40' },
  { key: 'neutro', label: 'En calma', emoji: '🧘', desc: 'Tranquilo, reflexivo o normal', color: 'from-blue-500/20 to-indigo-500/20 text-blue-300', border: 'border-blue-500/40' },
  { key: 'dificil', label: 'Difícil', emoji: '😔', desc: 'Día pesado o con obstáculos', color: 'from-orange-500/20 to-amber-500/20 text-orange-300', border: 'border-orange-500/40' },
  { key: 'reflexivo', label: 'Agotado', emoji: '🌧️', desc: 'Poco ánimo o cansancio acumulado', color: 'from-purple-500/20 to-slate-500/20 text-purple-300', border: 'border-purple-500/40' }
];

export const MoodCheckin: React.FC<Props> = ({ todayEntry, todayStr }) => {
  const currentMood = todayEntry?.mood;
  const [showNoteInput, setShowNoteInput] = useState(!!todayEntry?.moodNote);
  const [note, setNote] = useState(todayEntry?.moodNote || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectMood = (mood: JournalMood) => {
    PersonalDevStore.setTodayMood(mood, note || undefined, todayStr);
    setShowNoteInput(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMood) {
      PersonalDevStore.setTodayMood(currentMood, note, todayStr);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">💭</span>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              ¿Cómo estás hoy?
            </h3>
            <p className="text-xs text-slate-400">
              Tómate un instante para registrar tu estado de ánimo con sinceridad.
            </p>
          </div>
        </div>

        {currentMood && (
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
            Registrado hoy
          </span>
        )}
      </div>

      {/* Mood Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {MOODS.map(m => {
          const isSelected = currentMood === m.key;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => handleSelectMood(m.key)}
              className={`p-3.5 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                isSelected
                  ? `bg-gradient-to-b ${m.color} ${m.border} scale-[1.03] shadow-md`
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-semibold block">{m.label}</span>
              <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional Note: "¿Quieres contarme por qué?" */}
      <AnimatePresence>
        {currentMood && showNoteInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveNote}
            className="pt-2 space-y-2 border-t border-slate-800/80"
          >
            <label className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              ¿Quieres contarme por qué te sientes así? (opcional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Escribe una breve razón o pensamiento..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold rounded-xl transition shrink-0 flex items-center gap-1"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

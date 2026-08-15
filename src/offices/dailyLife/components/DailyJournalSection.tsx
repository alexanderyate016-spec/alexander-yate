import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry } from '../../../types/store';
import { PersonalDevStore } from '../../personalDev/PersonalDevStore';
import {
  Feather,
  Sparkles,
  Check,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';

interface Props {
  todayEntry?: JournalEntry;
  todayStr: string;
  userName?: string;
}

interface PromptOption {
  key: 'wentWell' | 'learnedToday' | 'improveTomorrow' | 'gratefulFor';
  title: string;
  placeholder: string;
  emoji: string;
}

const PROMPTS: PromptOption[] = [
  { key: 'wentWell', title: '¿Qué salió bien hoy?', placeholder: 'Un logro, momento positivo o acierto...', emoji: '⭐' },
  { key: 'learnedToday', title: '¿Qué aprendiste hoy?', placeholder: 'Una nueva idea, lección o perspectiva...', emoji: '🧠' },
  { key: 'improveTomorrow', title: '¿Qué harías diferente?', placeholder: 'Un ajuste o mejora para mañana...', emoji: '🔄' },
  { key: 'gratefulFor', title: '¿Qué agradeces hoy?', placeholder: 'Una persona, oportunidad o instante de paz...', emoji: '🙏' }
];

export const DailyJournalSection: React.FC<Props> = ({
  todayEntry,
  todayStr,
  userName = 'Alex'
}) => {
  const [reflection, setReflection] = useState(todayEntry?.freeReflection || '');
  const [activePrompt, setActivePrompt] = useState<PromptOption['key'] | null>(null);
  const [promptValues, setPromptValues] = useState<Record<string, string>>({
    wentWell: todayEntry?.wentWell || '',
    learnedToday: todayEntry?.learnedToday || '',
    improveTomorrow: todayEntry?.improveTomorrow || '',
    gratefulFor: todayEntry?.gratefulFor || ''
  });

  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    if (todayEntry) {
      setReflection(todayEntry.freeReflection || '');
      setPromptValues({
        wentWell: todayEntry.wentWell || '',
        learnedToday: todayEntry.learnedToday || '',
        improveTomorrow: todayEntry.improveTomorrow || '',
        gratefulFor: todayEntry.gratefulFor || ''
      });
    }
  }, [todayEntry]);

  const handleSave = () => {
    PersonalDevStore.saveJournalEntry({
      date: todayStr,
      freeReflection: reflection,
      wentWell: promptValues.wentWell,
      learnedToday: promptValues.learnedToday,
      improveTomorrow: promptValues.improveTomorrow,
      gratefulFor: promptValues.gratefulFor
    });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handlePromptChange = (key: string, value: string) => {
    setPromptValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Mi Diario Personal
            </h3>
            <p className="text-xs text-slate-400">
              ¿Qué tienes en mente hoy, {userName}?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {savedStatus && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Guardar reflexión</span>
          </button>
        </div>
      </div>

      {/* Trigger Prompts Chips */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-400 block">
          Preguntas de inspiración (opcional):
        </span>
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map(p => {
            const hasValue = !!promptValues[p.key];
            const isOpen = activePrompt === p.key;

            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setActivePrompt(isOpen ? null : p.key)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                  isOpen
                    ? 'bg-purple-500/20 border-purple-500 text-purple-200 font-semibold'
                    : hasValue
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{p.emoji}</span>
                <span>{p.title}</span>
                {hasValue && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Prompt Form Box */}
      <AnimatePresence>
        {activePrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2"
          >
            {(() => {
              const prompt = PROMPTS.find(p => p.key === activePrompt);
              if (!prompt) return null;
              return (
                <div>
                  <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
                    <span>{prompt.emoji}</span>
                    <span>{prompt.title}</span>
                  </label>
                  <textarea
                    rows={2}
                    value={promptValues[prompt.key]}
                    onChange={e => handlePromptChange(prompt.key, e.target.value)}
                    placeholder={prompt.placeholder}
                    className="w-full bg-slate-950 border border-purple-500/30 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-400 resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        handleSave();
                        setActivePrompt(null);
                      }}
                      className="text-xs px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 font-medium rounded-lg"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free Notebook Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Escribe libremente lo que viviste hoy, lo que sientes o lo que quieras recordar..."
          className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 resize-y leading-relaxed"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1.5">
          <span>{reflection.length > 0 ? `${reflection.length} caracteres` : 'Pausa y escribe sin filtros'}</span>
          <span>Tus pensamientos son 100% privados</span>
        </div>
      </div>
    </div>
  );
};

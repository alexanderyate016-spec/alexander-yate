import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Circle, Plus, Trash2, Edit2, Sparkles, Check, X } from 'lucide-react';
import { DailyObjective } from '../../../types/store';
import { DailyLifeStore } from '../DailyLifeStore';

interface Props {
  goal?: DailyObjective | null;
  todayStr: string;
}

export const DailyGoalCard: React.FC<Props> = ({ goal, todayStr }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState(goal?.title || '');
  const [showCelebration, setShowCelebration] = useState(false);

  const isCompleted = goal?.status === 'completed';

  const handleSaveGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    DailyLifeStore.setDailyGoal(inputText.trim(), todayStr);
    setIsEditing(false);
  };

  const handleToggle = () => {
    if (!goal) return;
    const nextState = !isCompleted;
    DailyLifeStore.toggleDailyGoal(goal.id, todayStr);
    if (nextState) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const handleClear = () => {
    if (goal) {
      DailyLifeStore.clearDailyGoal(goal.id, todayStr);
      setInputText('');
      setIsEditing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide text-amber-300 uppercase">
            Meta Principal de Hoy
          </h2>
        </div>

        {goal && !isEditing && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <button
              onClick={() => {
                setInputText(goal.title);
                setIsEditing(true);
              }}
              className="p-1.5 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              title="Editar meta"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Eliminar meta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Goal Content */}
      {isEditing || !goal ? (
        <form onSubmit={handleSaveGoal} className="space-y-3">
          <p className="text-xs text-slate-400">
            ¿Qué es lo más importante que quieres lograr hoy?
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ej: Terminar informe de economía, Leer 20 min..."
              className="flex-1 bg-slate-900/80 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={handleToggle}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'border-2 border-amber-500/50 hover:border-amber-400 text-transparent hover:bg-amber-500/10'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>

            <div>
              <p
                className={`text-base font-medium transition ${
                  isCompleted
                    ? 'line-through text-slate-400'
                    : 'text-slate-100 font-semibold'
                }`}
              >
                🎯 {goal.title}
              </p>
              {isCompleted && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3" /> ¡Lo lograste hoy! Gran paso de avance.
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition self-start sm:self-auto flex items-center gap-1.5 ${
              isCompleted
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Completada</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Completar meta</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Celebration animation banner */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>¡Excelente trabajo, Alex! Cada meta cumplida fortalece tu disciplina.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

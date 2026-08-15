import React from 'react';
import { Sparkles, Trophy, Flame } from 'lucide-react';

interface Props {
  completedCount: number;
  totalCount: number;
  currentStreak: number;
}

export const DailyProgressFinch: React.FC<Props> = ({
  completedCount,
  totalCount,
  currentStreak
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Motivating encouragement based on Finch principles
  let motivation = '☀️ Tu día está listo. Elige tu primera acción con calma.';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

  if (totalCount > 0 && completedCount === totalCount) {
    motivation = '🎉 ¡Día completado con maestría! Eres imparable.';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  } else if (percentage >= 75) {
    motivation = '✨ ¡Gran impulso! Estás a muy poco de cerrar el día con éxito.';
    badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  } else if (percentage >= 50) {
    motivation = '🌱 Buen ritmo, la constancia se construye paso a paso.';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  } else if (completedCount > 0) {
    motivation = '🚀 Ya diste los primeros pasos. Mantén el enfoque.';
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Tu Progreso de Hoy
            </h3>
            <p className="text-xs text-slate-400">
              {totalCount > 0 ? `${completedCount} de ${totalCount} actividades completadas` : 'Sin actividades asignadas hoy'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Structured Progress Bar */}
      <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Finch-style gentle encouragement */}
      <div className={`text-xs px-3.5 py-2 rounded-xl border flex items-center gap-2 font-medium ${badgeColor}`}>
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{motivation}</span>
      </div>
    </div>
  );
};

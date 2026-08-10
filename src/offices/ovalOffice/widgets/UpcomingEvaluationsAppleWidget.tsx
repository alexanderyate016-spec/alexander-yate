import React from 'react';
import { MasterState } from '../../../types/store';
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react';

interface Props {
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
}

export const UpcomingEvaluationsAppleWidget: React.FC<Props> = ({ state, onNavigateToOffice }) => {
  const academic = state.offices.academica;
  const subjects = academic?.subjects || [];

  // Flatten all activities and evaluations across cuts
  const evaluations: Array<{
    subjectName: string;
    subjectColor: string;
    cutName: string;
    title: string;
    percentage: number;
    date?: string;
    daysDiff: number;
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  subjects.forEach(subject => {
    (subject.cuts || []).forEach(cut => {
      (cut.activities || []).forEach(act => {
        let daysDiff = 999;
        if (act.date) {
          const actDate = new Date(act.date);
          actDate.setHours(0, 0, 0, 0);
          daysDiff = Math.ceil((actDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        }

        if (act.status === 'pending' && daysDiff >= -1) {
          evaluations.push({
            subjectName: subject.name,
            subjectColor: subject.color || '#6366f1',
            cutName: cut.cutName,
            title: act.name,
            percentage: act.weightPercent || 0,
            date: act.date,
            daysDiff
          });
        }
      });
    });
  });

  // Sort by daysDiff ascending
  evaluations.sort((a, b) => a.daysDiff - b.daysDiff);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[220px]">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Próximas Evaluaciones
          </span>
        </div>

        <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {evaluations.length} pendientes
        </span>
      </div>

      {/* EVALUATIONS LIST */}
      <div className="my-3 space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
        {evaluations.length > 0 ? (
          evaluations.slice(0, 3).map((ev, i) => (
            <div
              key={i}
              className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ev.subjectColor }}
                  />
                  <span className="font-extrabold text-slate-900 dark:text-white truncate">
                    {ev.subjectName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {ev.title} ({ev.cutName})
                </div>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-500/20">
                  {ev.daysDiff === 0
                    ? '¡HOY!'
                    : ev.daysDiff === 1
                    ? 'Mañana'
                    : `En ${ev.daysDiff} días`}
                </span>
                {ev.percentage > 0 && (
                  <span className="block text-[10px] font-bold text-slate-400">
                    Peso: {ev.percentage}%
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 space-y-1">
            <BookOpen className="w-7 h-7 text-indigo-400 mx-auto opacity-70" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              No hay evaluaciones cercanas agendadas
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Oficina Académica</span>
        <button
          onClick={() => onNavigateToOffice('academica')}
          className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>Ver Calificaciones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

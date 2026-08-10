import React from 'react';
import { UnifiedExecutiveEvent } from '../../../types/store';
import { Calendar, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  events: UnifiedExecutiveEvent[];
  selectedDate: string;
  onOpenQuickAdd: () => void;
  onNavigateToOffice: (officeKey: string) => void;
}

export const AgendaAppleWidget: React.FC<Props> = ({
  events,
  selectedDate,
  onOpenQuickAdd,
  onNavigateToOffice,
}) => {
  // Sort chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.startTime || '23:59';
    const timeB = b.startTime || '23:59';
    return timeA.localeCompare(timeB);
  });

  const officeOfficeMap: Record<string, { label: string; bg: string }> = {
    academica: { label: 'Académica', bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' },
    medica: { label: 'Salud', bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' },
    vidaDiaria: { label: 'Personal', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
    vidaSocial: { label: 'Social', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
    financiera: { label: 'Finanzas', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' }
  };

  const getEventIcon = (type: string, office: string) => {
    if (office === 'academica') return '📚';
    if (office === 'medica') return '🩺';
    if (office === 'vidaSocial') return '👥';
    if (office === 'financiera') return '💳';
    if (type === 'habit') return '🏆';
    if (type === 'task') return '✅';
    return '📌';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[320px]">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center font-bold text-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              AGENDA DE HOY
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Horario cronológico • {events.length} actividades
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Evento</span>
        </button>
      </div>

      {/* EVENTS TIMELINE */}
      <div className="my-4 space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all text-xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* TIME BADGE */}
                <div className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                  {evt.startTime || 'Todo el día'}
                </div>

                {/* EMOJI & TITLE */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{getEventIcon(evt.type, evt.sourceOffice)}</span>
                  <div className="truncate">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm block truncate">
                      {evt.title}
                    </span>
                    {evt.subtitle && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {evt.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* OFFICE BADGE */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  officeOfficeMap[evt.sourceOffice]?.bg || 'bg-slate-100 text-slate-700'
                }`}>
                  {officeOfficeMap[evt.sourceOffice]?.label || evt.sourceOffice}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No hay compromisos agendados para este día
            </p>
            <p className="text-xs text-slate-400">
              Usa el botón "Agregar Evento" o revisa tus oficinas activas.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER ACTION */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Sincronización unificada de oficinas</span>
        <button
          onClick={() => onNavigateToOffice('agenda')}
          className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:underline"
        >
          <span>Abrir Despacho Completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

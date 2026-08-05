import React from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations, UnifiedNotification } from './OvalOfficeCalculations';
import { Brain, AlertTriangle, AlertCircle, Info, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
}

export const CentroInteligenciaEjecutiva: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice
}) => {
  const notifications = OvalOfficeCalculations.getNotifications(state, selectedDate);
  const events = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const conflicts = OvalOfficeCalculations.detectScheduleConflicts(events);

  // Group and sort notifications by priority
  const priorityOrder: Record<string, number> = { urgent: 1, high: 2, medium: 3, info: 4 };
  const sortedNotifications = [...notifications].sort((a, b) => {
    return (priorityOrder[a.type] || 5) - (priorityOrder[b.type] || 5);
  });

  const getPriorityBadge = (type: UnifiedNotification['type']) => {
    switch (type) {
      case 'urgent':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold uppercase font-mono flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Crítica
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase font-mono flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" /> Alta
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-950/80 text-yellow-300 border border-yellow-500/40 text-[10px] font-extrabold uppercase font-mono flex items-center gap-1">
            <Info className="w-3 h-3 text-yellow-400" /> Media
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold uppercase font-mono flex items-center gap-1">
            <Info className="w-3 h-3 text-blue-400" /> Informativa
          </span>
        );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#030712]/60 backdrop-blur-2xl border border-white/15 p-6 sm:p-7 text-white shadow-2xl space-y-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-300 shadow-inner">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-extrabold text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
              CENTRO DE INTELIGENCIA EJECUTIVA
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-400/30">
                {sortedNotifications.length + conflicts.length} Observaciones
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Monitoreo objetivo cross-office, detección de riesgos y alertas operativas en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* SCHEDULE CONFLICTS WARNING IF ANY */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-300 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Conflicto de Horario Detectado en Agenda ({conflicts.length})</span>
          </div>
          {conflicts.map((conf, idx) => (
            <div key={idx} className="text-xs text-slate-200 bg-black/40 p-2 rounded-xl border border-rose-500/30 font-mono">
              ⚠️ <span className="font-bold text-white">{conf.event1.title}</span> cruza con <span className="font-bold text-white">{conf.event2.title}</span> entre {conf.event1.startTime} y {conf.event1.endTime}.
            </div>
          ))}
        </div>
      )}

      {/* NOTIFICATIONS & OBSERVATIONS LIST */}
      {sortedNotifications.length === 0 && conflicts.length === 0 ? (
        <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="text-sm font-serif font-bold text-white">Sistema Operativo en Perfecto Equilibrio</p>
          <p className="text-xs text-slate-300">
            No existen conflictos de agenda ni alertas de riesgo activas para la fecha seleccionada.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {sortedNotifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(notif.type)}
                  <span className="text-[10px] font-mono font-bold text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                    Fuente: {notif.sourceOffice}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-white text-sm leading-tight">
                  {notif.title}
                </h4>
                <p className="text-slate-300 text-xs font-sans">
                  {notif.message}
                </p>
              </div>

              {notif.actionOffice && (
                <button
                  onClick={() => onNavigateToOffice(notif.actionOffice!)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 self-end sm:self-center"
                >
                  <span>Ver en Oficina</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

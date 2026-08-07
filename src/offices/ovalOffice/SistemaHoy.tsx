import React from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
  onOpenQuickJournalModal: () => void;
}

export const SistemaHoy: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice,
  onOpenQuickJournalModal
}) => {
  // 1. Upcoming Commitment / Class Today
  const events = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortedEvents = [...events].sort((a, b) => {
    const [h1, m1] = (a.startTime || '00:00').split(':').map(Number);
    const [h2, m2] = (b.startTime || '00:00').split(':').map(Number);
    return (h1 * 60 + m1) - (h2 * 60 + m2);
  });

  const nextEvent = sortedEvents.find(e => {
    const [h, m] = (e.startTime || '00:00').split(':').map(Number);
    return (h * 60 + m) >= currentMinutes;
  }) || sortedEvents[0] || null;

  // 2. Pending Habits Today
  const habits = state.offices.vidaDiaria?.habits || [];
  const pendingHabits = habits.filter(h => !h.logs?.[selectedDate]);

  // 3. Financial Obligations Due Soon
  const obligations = state.offices.financiera?.obligations || [];
  const dueObligations = obligations.filter(o => !o.isPaid);

  // 4. Daily Journal Reflection Status
  const journalEntries = state.offices.desarrolloPersonal?.journalEntries || [];
  const todayJournal = journalEntries.find(j => j.date === selectedDate);
  const hasJournalReflected = !!(todayJournal && (todayJournal.freeReflection || todayJournal.wordOfTheDay || todayJournal.philosophicalAnswer));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                <span>🏛️</span> SISTEMA HOY
              </h2>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Atención Inmediata
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compromisos, prioridades clave y foco ejecutivo para el día.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickJournalModal}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <span>{hasJournalReflected ? 'Ver Diario Personal' : 'Escribir Reflexión Diaria'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CORE ATTENTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* CARD 1: PRÓXIMO COMPROMISO */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wide">
            <span className="flex items-center gap-2">
              <span className="text-base">📅</span> Próximo Compromiso
            </span>
            {nextEvent && (
              <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 text-[11px] font-semibold">
                {nextEvent.startTime}
              </span>
            )}
          </div>

          {nextEvent ? (
            <div className="space-y-1 my-1">
              <h4 className="font-bold text-slate-900 text-sm leading-snug">
                {nextEvent.title}
              </h4>
              {(nextEvent as any).classroom && (
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <span>📍 Ubicación:</span>
                  <span className="font-semibold text-slate-900">{(nextEvent as any).classroom}</span>
                </div>
              )}
              {nextEvent.officeLabel && (
                <div className="text-[11px] text-purple-600 font-medium">
                  Sección: {nextEvent.officeLabel}
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 text-xs text-slate-500 italic text-center">
              Sin compromisos próximos programados para hoy.
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>{events.length} evento(s) hoy</span>
            {nextEvent?.sourceOffice && (
              <button
                onClick={() => onNavigateToOffice(nextEvent.sourceOffice!)}
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
              >
                <span>Ver Oficina</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: HÁBITOS PENDIENTES */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wide">
            <span className="flex items-center gap-2">
              <span className="text-base">🏆</span> Hábitos por Cumplir
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {habits.length - pendingHabits.length} / {habits.length}
            </span>
          </div>

          {pendingHabits.length > 0 ? (
            <div className="space-y-1.5 my-1">
              {pendingHabits.slice(0, 3).map(h => (
                <button
                  key={h.id}
                  onClick={() => DailyLifeStore.toggleHabitLog(h.id, selectedDate)}
                  className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-300 flex items-center justify-between text-xs text-slate-800 transition-all group"
                >
                  <span className="font-medium truncate group-hover:text-purple-700">{h.name}</span>
                  <Circle className="w-4 h-4 text-slate-700 group-hover:text-purple-600 shrink-0" />
                </button>
              ))}
              {pendingHabits.length > 3 && (
                <div className="text-[11px] text-slate-500 italic pt-0.5">
                  + {pendingHabits.length - 3} hábito(s) más pendientes...
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 text-xs text-emerald-700 font-medium flex items-center justify-center gap-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Todos los hábitos completados hoy!</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Vida Diaria</span>
            <button
              onClick={() => onNavigateToOffice('vidaDiaria')}
              className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
            >
              <span>Gestionar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* CARD 3: FINANZAS Y REFLEXIÓN */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wide">
            <span className="flex items-center gap-2">
              <span className="text-base">💰</span> Estado Financiero y Foco
            </span>
          </div>

          <div className="space-y-2 my-1 text-xs">
            {dueObligations.length > 0 ? (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 space-y-0.5">
                <span className="font-bold block">Obligaciones Pendientes ({dueObligations.length})</span>
                <span className="text-[11px] text-amber-700 block">
                  Próxima: {dueObligations[0].title} (${dueObligations[0].amount.toLocaleString()})
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Obligaciones al día sin moras</span>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-between">
              <span className="font-medium">Reflexión Diaria</span>
              {hasJournalReflected ? (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Completada
                </span>
              ) : (
                <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Pendiente
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Financiera</span>
            <button
              onClick={() => onNavigateToOffice('financiera')}
              className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
            >
              <span>Ver Cuentas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

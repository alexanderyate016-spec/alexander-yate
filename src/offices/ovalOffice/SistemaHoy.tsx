import React from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { 
  Sparkles, 
  Clock, 
  BookOpen, 
  Droplets, 
  Moon, 
  CheckCircle2, 
  Circle, 
  CreditCard, 
  Cake, 
  HelpCircle, 
  ChevronRight,
  ArrowRight
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

  // 3. Financial Obligations Due Soon (within 7 days)
  const obligations = state.offices.financiera?.obligations || [];
  const dueObligations = obligations.filter(o => !o.isPaid);

  // 4. Special Dates & Birthdays
  const people = state.offices.vidaSocial?.people || [];
  const todayMMDD = selectedDate.substring(5);
  const todayBirthday = people.find(p => p.birthday && p.birthday.endsWith(todayMMDD));

  // 5. Daily Journal Reflection Status
  const journalEntries = state.offices.desarrolloPersonal?.journalEntries || [];
  const todayJournal = journalEntries.find(j => j.date === selectedDate);
  const hasJournalReflected = !!(todayJournal && (todayJournal.freeReflection || todayJournal.wordOfTheDay || todayJournal.philosophicalAnswer));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#030712]/60 backdrop-blur-2xl border border-white/15 p-6 sm:p-7 text-white shadow-2xl transition-all duration-700 space-y-5">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-400/30 text-amber-300 shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif font-extrabold text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
              SISTEMA HOY <span className="text-xs font-mono font-normal text-amber-300/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-400/20">Atención Inmediata</span>
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              Compromisos, prioridades clave y foco ejecutivo para el día.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickJournalModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <span>{hasJournalReflected ? 'Ver Diario Personal' : 'Escribir Reflexión Diaria'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CORE ATTENTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* CARD 1: PRÓXIMO COMPROMISO / CLASE */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between hover:border-amber-400/30 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Próximo Compromiso
            </span>
            {nextEvent && (
              <span className="font-mono text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-400/30 text-[10px]">
                {nextEvent.startTime}
              </span>
            )}
          </div>

          {nextEvent ? (
            <div className="space-y-1 my-1">
              <h4 className="font-serif font-bold text-white text-base leading-tight">
                {nextEvent.title}
              </h4>
              {nextEvent.classroom && (
                <div className="text-xs text-slate-300 flex items-center gap-1">
                  <span>📍 Aula / Ubicación:</span>
                  <span className="font-semibold text-amber-200">{nextEvent.classroom}</span>
                </div>
              )}
              {nextEvent.officeLabel && (
                <div className="text-[10px] text-blue-300 font-mono">
                  Origen: {nextEvent.officeLabel}
                </div>
              )}
            </div>
          ) : (
            <div className="py-3 text-xs text-slate-400 italic font-sans text-center">
              Sin compromisos próximos programados para hoy.
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] font-mono text-slate-300">
            <span>{events.length} evento(s) en agenda hoy</span>
            {nextEvent?.sourceOffice && (
              <button
                onClick={() => onNavigateToOffice(nextEvent.sourceOffice!)}
                className="text-amber-300 hover:underline flex items-center gap-1 font-bold"
              >
                Ver <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: HÁBITOS PENDIENTES DEL DÍA */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between hover:border-amber-400/30 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hábitos de Hoy
            </span>
            <span className="font-mono text-emerald-200 text-[11px]">
              {habits.length - pendingHabits.length} / {habits.length} completados
            </span>
          </div>

          <div className="my-1 space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
            {pendingHabits.length === 0 ? (
              <div className="py-2 text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Todos los hábitos del día han sido completados!</span>
              </div>
            ) : (
              pendingHabits.slice(0, 3).map(h => (
                <div
                  key={h.id}
                  onClick={() => DailyLifeStore.toggleHabitLog(h.id, selectedDate)}
                  className="p-1.5 rounded-lg bg-black/30 hover:bg-white/10 cursor-pointer border border-white/5 flex items-center justify-between text-xs transition-colors group"
                >
                  <span className="text-slate-200 group-hover:text-white truncate font-medium">
                    {h.name}
                  </span>
                  <Circle className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] font-mono text-slate-300">
            <span>{pendingHabits.length} por realizar</span>
            <button
              onClick={() => onNavigateToOffice('vidaDiaria')}
              className="text-emerald-300 hover:underline flex items-center gap-1 font-bold"
            >
              Gestionar <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* CARD 3: FINANZAS & OBLIGACIONES / CUMPLEAÑOS */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 flex flex-col justify-between hover:border-amber-400/30 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-rose-400" /> Compromisos Financieros & Fechas
            </span>
            {todayBirthday && (
              <span className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded border border-purple-400/30 font-bold flex items-center gap-1">
                <Cake className="w-3 h-3" /> ¡Cumpleaños Hoy!
              </span>
            )}
          </div>

          <div className="my-1 space-y-1.5">
            {todayBirthday && (
              <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 flex items-center justify-between font-bold">
                <span>🎉 {todayBirthday.name}</span>
                <button
                  onClick={() => onNavigateToOffice('vidaSocial')}
                  className="text-[10px] underline text-purple-300"
                >
                  Saludar
                </button>
              </div>
            )}

            {dueObligations.length > 0 ? (
              <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1">
                <div className="font-bold text-rose-200 flex justify-between">
                  <span>Próximo Pago: {dueObligations[0].title}</span>
                  <span className="font-mono text-rose-300">${dueObligations[0].amount.toLocaleString('es-CO')}</span>
                </div>
                <div className="text-[10px] text-slate-300 font-mono">
                  Vence: {dueObligations[0].dueDate}
                </div>
              </div>
            ) : (
              <div className="py-2 text-xs text-slate-400 italic">
                Sin obligaciones ni pagos pendientes para esta semana.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] font-mono text-slate-300">
            <span>{dueObligations.length} obligaciones pendientes</span>
            <button
              onClick={() => onNavigateToOffice('financiera')}
              className="text-rose-300 hover:underline flex items-center gap-1 font-bold"
            >
              Ver Cuentas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* DAILY PHILOSOPHICAL REFLECTION PROMPT */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-serif font-bold text-amber-200 text-sm">
              Pregunta Filosófica de la Jornada
            </h4>
            <p className="text-xs text-slate-300 italic font-serif">
              "{todayJournal?.philosophicalAnswer ? todayJournal.philosophicalAnswer : '¿Qué decisión tomada hoy reflejará con mayor claridad tus valores fundamentales a largo plazo?'}"
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickJournalModal}
          className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-400/40 text-amber-200 text-xs font-bold rounded-xl transition-all shrink-0 self-end sm:self-center"
        >
          {hasJournalReflected ? 'Editar Respuesta' : 'Responder Ahora'}
        </button>
      </div>

    </div>
  );
};

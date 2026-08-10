import React from 'react';
import { UnifiedExecutiveEvent } from '../../../types/store';
import { Calendar, Clock, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

interface Props {
  events: UnifiedExecutiveEvent[];
  now: Date;
  onNavigateToOffice: (officeKey: string) => void;
}

export const NextEventAppleWidget: React.FC<Props> = ({ events, now, onNavigateToOffice }) => {
  // Sort events chronologically and pick the first one that is in the future or ongoing today
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.startTime || '00:00';
    const timeB = b.startTime || '00:00';
    return timeA.localeCompare(timeB);
  });

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next upcoming event
  const nextEvent = sortedEvents.find(e => {
    if (!e.startTime) return true;
    const [h, m] = e.startTime.split(':').map(Number);
    const eventMins = h * 60 + m;
    return eventMins >= nowMinutes - 30; // Within 30 mins or future
  }) || sortedEvents[0];

  let countdownText = 'Pendiente';
  if (nextEvent && nextEvent.startTime) {
    const [h, m] = nextEvent.startTime.split(':').map(Number);
    const eventMins = h * 60 + m;
    const diff = eventMins - nowMinutes;

    if (diff <= 0 && diff >= -60) {
      countdownText = '¡En curso ahora!';
    } else if (diff > 0 && diff < 60) {
      countdownText = `En ${diff} minutos`;
    } else if (diff >= 60) {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      countdownText = mins > 0 ? `En ${hours}h ${mins}m` : `En ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      countdownText = `Programado para ${nextEvent.startTime}`;
    }
  }

  const officeOfficeMap: Record<string, { label: string; bg: string; key: string }> = {
    academica: { label: 'Académica', bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', key: 'academica' },
    medica: { label: 'Salud', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', key: 'medica' },
    vidaDiaria: { label: 'Personal', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', key: 'vidaDiaria' },
    vidaSocial: { label: 'Social', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', key: 'vidaSocial' },
    financiera: { label: 'Finanzas', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30', key: 'financiera' }
  };

  const getIcon = (sourceOffice: string) => {
    if (sourceOffice === 'academica') return '📚';
    if (sourceOffice === 'medica') return '🩺';
    if (sourceOffice === 'vidaSocial') return '👥';
    if (sourceOffice === 'financiera') return '💳';
    return '📌';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[220px]">
      {/* TOP TITLE BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Próximo Evento
          </span>
        </div>

        {nextEvent && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {countdownText}
          </span>
        )}
      </div>

      {/* EVENT DETAILS */}
      {nextEvent ? (
        <div className="my-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getIcon(nextEvent.sourceOffice)}</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1">
              {nextEvent.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {nextEvent.startTime && (
              <span className="flex items-center gap-1 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                {nextEvent.startTime} {nextEvent.endTime ? `- ${nextEvent.endTime}` : ''}
              </span>
            )}

            {nextEvent.location && (
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {nextEvent.location}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="my-4 text-center py-4 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Sin eventos próximos agendados por hoy
          </p>
        </div>
      )}

      {/* FOOTER & OFFICE ACTION */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
        {nextEvent ? (
          <>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              officeOfficeMap[nextEvent.sourceOffice]?.bg || 'bg-slate-100 text-slate-700'
            }`}>
              {officeOfficeMap[nextEvent.sourceOffice]?.label || nextEvent.sourceOffice}
            </span>

            <button
              onClick={() => onNavigateToOffice(officeOfficeMap[nextEvent.sourceOffice]?.key || 'agenda')}
              className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              <span>Ver Detalle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <span className="text-slate-400 text-xs">Jornada despejada</span>
        )}
      </div>
    </div>
  );
};

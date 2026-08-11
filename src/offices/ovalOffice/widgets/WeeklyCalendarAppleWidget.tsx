import React from 'react';
import { MasterState } from '../../../types/store';
import { OvalOfficeCalculations } from '../OvalOfficeCalculations';
import { getWeekDaysForDate } from '../../../utils/dates';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
}

const START_HOUR = 7; // 07:00
const END_HOUR = 22;   // 22:00
const TOTAL_HOURS = END_HOUR - START_HOUR; // 15 hours
const HOUR_HEIGHT = 60; // 60px per hour for crisp proportional height

const parseMinutes = (timeStr?: string): number => {
  if (!timeStr) return START_HOUR * 60;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

interface ProcessedEvent {
  evt: any;
  startM: number;
  endM: number;
  durationM: number;
  topPx: number;
  heightPx: number;
  colIndex: number;
  totalCols: number;
}

const getDayLayout = (dayEvents: any[]): ProcessedEvent[] => {
  const timed = dayEvents.filter(e => e.startTime);
  const parsed: ProcessedEvent[] = timed.map(evt => {
    const startM = parseMinutes(evt.startTime);
    let endM = parseMinutes(evt.endTime);
    if (!endM || endM <= startM) {
      endM = startM + 60; // Default 1 hour duration
    }

    const dayStartM = START_HOUR * 60;
    const dayEndM = END_HOUR * 60;

    const clampedStart = Math.max(dayStartM, Math.min(dayEndM, startM));
    const clampedEnd = Math.max(dayStartM, Math.min(dayEndM, endM));

    const topMins = clampedStart - dayStartM;
    const durationMins = Math.max(15, clampedEnd - clampedStart);

    const topPx = (topMins / 60) * HOUR_HEIGHT;
    const heightPx = (durationMins / 60) * HOUR_HEIGHT;

    return {
      evt,
      startM: clampedStart,
      endM: clampedEnd,
      durationM: durationMins,
      topPx,
      heightPx,
      colIndex: 0,
      totalCols: 1,
    };
  });

  // Compute side-by-side overlap columns
  const clusters: ProcessedEvent[][] = [];
  parsed.forEach(item => {
    let placed = false;
    for (const cluster of clusters) {
      if (cluster.some(c => item.startM < c.endM && c.startM < item.endM)) {
        cluster.push(item);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push([item]);
    }
  });

  clusters.forEach(cluster => {
    cluster.sort((a, b) => a.startM - b.startM || (b.endM - b.startM) - (a.endM - a.startM));
    const totalCols = cluster.length;
    cluster.forEach((item, idx) => {
      item.colIndex = idx;
      item.totalCols = totalCols;
    });
  });

  return parsed;
};

export const WeeklyCalendarAppleWidget: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice,
}) => {
  const weekDays = getWeekDaysForDate(selectedDate).map(wd => ({
    dateISO: wd.dateStr,
    dayName: wd.dayShort,
    dayNum: parseInt(wd.dayNumberStr, 10),
    isToday: wd.isToday,
    isSelected: wd.dateStr === selectedDate
  }));

  // Hours from 07:00 to 22:00
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => {
    const h = START_HOUR + i;
    return {
      hourNum: h,
      label: `${String(h).padStart(2, '0')}:00`
    };
  });

  // Map unified events for each day
  const eventsByDayISO: Record<string, any[]> = {};
  weekDays.forEach(wd => {
    eventsByDayISO[wd.dateISO] = OvalOfficeCalculations.getUnifiedEventsForDate(state, wd.dateISO);
  });

  const getOfficeStyle = (sourceOffice: string) => {
    switch (sourceOffice) {
      case 'academica':
        return 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 border-l-4 border-l-indigo-500';
      case 'medica':
        return 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 border-l-4 border-l-rose-500';
      case 'vidaSocial':
        return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 border-l-4 border-l-emerald-500';
      case 'financiera':
        return 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 border-l-4 border-l-blue-500';
      case 'vidaDiaria':
        return 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 border-l-4 border-l-amber-500';
      default:
        return 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 border-l-4 border-l-purple-500';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[460px]">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold text-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              HORARIO SEMANAL
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Estructura diaria (07:00 – 22:00) • Bloques proporcionales a duración real
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToOffice('agenda')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs"
        >
          <span>Abrir Agenda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HOURLY TIMELINE GRID CONTAINER */}
      <div className="my-3 overflow-x-auto max-h-[460px] overflow-y-auto custom-scrollbar border border-slate-200/60 dark:border-slate-800/60 rounded-2xl bg-slate-50/30 dark:bg-slate-900/40">
        <div className="min-w-[700px] relative">
          {/* STICKY DAY HEADERS */}
          <div className="sticky top-0 z-20 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 flex">
            {/* Hour header label */}
            <div className="w-16 shrink-0 py-2.5 font-mono text-[10px] text-slate-400 font-extrabold text-center border-r border-slate-200/60 dark:border-slate-700/60 bg-slate-100/90 dark:bg-slate-800/90">
              HORA
            </div>
            {/* 7 Days Header */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200/40 dark:divide-slate-700/40">
              {weekDays.map(wd => (
                <div
                  key={wd.dateISO}
                  className={`py-2 text-center font-bold transition-all ${
                    wd.isToday
                      ? 'bg-purple-500/10 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : wd.isSelected
                      ? 'bg-slate-200/50 dark:bg-slate-700/50'
                      : ''
                  }`}
                >
                  <div className="text-[10px] tracking-wider opacity-75 uppercase">{wd.dayName}</div>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                      wd.isToday
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {wd.dayNum}
                    </span>
                    {wd.isToday && (
                      <span className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400">
                        Hoy
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TIMELINE BODY */}
          <div className="flex relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
            {/* HOUR MARKERS COLUMN */}
            <div className="w-16 shrink-0 relative border-r border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 select-none">
              {hours.map((slot, index) => (
                <div
                  key={slot.label}
                  className="absolute w-full pr-2 text-right font-mono text-[10px] text-slate-400 font-bold -mt-2"
                  style={{ top: `${index * HOUR_HEIGHT}px` }}
                >
                  {slot.label}
                </div>
              ))}
            </div>

            {/* 7 DAY COLUMNS CONTAINER */}
            <div className="flex-1 grid grid-cols-7 relative divide-x divide-slate-100 dark:divide-slate-800/60">
              {/* Horizontal Background Hour Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {hours.map((slot) => (
                  <div
                    key={slot.label}
                    className="w-full border-b border-slate-100 dark:border-slate-800/40"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  />
                ))}
              </div>

              {/* Day Columns with Proportional Event Blocks */}
              {weekDays.map(wd => {
                const dayEvents = eventsByDayISO[wd.dateISO] || [];
                const processed = getDayLayout(dayEvents);

                return (
                  <div
                    key={wd.dateISO}
                    className={`relative ${wd.isToday ? 'bg-purple-500/5 dark:bg-purple-900/10' : ''}`}
                    style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
                  >
                    {processed.map(({ evt, durationM, topPx, heightPx, colIndex, totalCols }) => {
                      const isCancelled = evt.status === 'cancelled' || evt.status === 'Cancelada' || evt.rawObject?.status === 'cancelled';
                      const leftPercent = (colIndex / totalCols) * 100;
                      const widthPercent = 100 / totalCols;

                      const session = evt.rawObject?.session || {};
                      const subject = evt.rawObject?.subject || {};
                      const classroom = session.classroom || subject.classroom || evt.location;
                      const modality = session.modality;
                      const notes = session.notes || evt.rawObject?.notes;

                      return (
                        <div
                          key={evt.id}
                          title={`${evt.title} (${evt.startTime}${evt.endTime ? ' - ' + evt.endTime : ''})${isCancelled ? ' [CANCELADA]' : ''}`}
                          className={`absolute p-2 rounded-xl border transition-all shadow-xs overflow-hidden flex flex-col justify-between hover:z-20 hover:shadow-md cursor-pointer ${
                            isCancelled
                              ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 border-l-4 border-l-rose-500 opacity-70'
                              : getOfficeStyle(evt.sourceOffice)
                          }`}
                          style={{
                            top: `${topPx}px`,
                            height: `${Math.max(26, heightPx - 2)}px`,
                            left: `calc(${leftPercent}% + 2px)`,
                            width: `calc(${widthPercent}% - 4px)`
                          }}
                        >
                          <div className="space-y-1">
                            {/* 1. TIME RANGE HEADER */}
                            <div className="flex items-center justify-between text-[10px] font-mono font-bold opacity-90 leading-none">
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span>{evt.startTime} – {evt.endTime || '??:??'}</span>
                              </span>
                              {durationM >= 60 && (
                                <span className="text-[8.5px] font-sans px-1 rounded bg-black/5 dark:bg-white/10 uppercase font-extrabold shrink-0">
                                  {Math.round((durationM / 60) * 10) / 10}h
                                </span>
                              )}
                            </div>

                            {/* 2. TITLE */}
                            <div className={`font-black text-xs leading-tight ${isCancelled ? 'line-through text-rose-800 dark:text-rose-300' : ''}`}>
                              {evt.title}
                            </div>

                            {/* CANCELLED BADGE */}
                            {isCancelled && (
                              <div className="inline-block text-[8px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-700 px-1 py-0.2 rounded">
                                ❌ Cancelada
                              </div>
                            )}

                            {/* 3. SUBTITLE / PROFESSOR */}
                            {!isCancelled && durationM >= 45 && evt.subtitle && (
                              <div className="text-[10px] font-medium opacity-85 leading-snug line-clamp-2">
                                {evt.subtitle}
                              </div>
                            )}

                            {/* 4. CLASSROOM & MODALITY */}
                            {!isCancelled && durationM >= 90 && (classroom || modality) && (
                              <div className="text-[9.5px] font-semibold opacity-80 flex flex-wrap gap-1.5 items-center pt-0.5">
                                {classroom && <span>📍 {classroom}</span>}
                                {modality && <span className="capitalize">🎓 {modality}</span>}
                              </div>
                            )}

                            {/* 5. EXTRA NOTES */}
                            {!isCancelled && durationM >= 120 && notes && (
                              <div className="text-[9px] opacity-75 italic line-clamp-2 pt-0.5 border-t border-black/5 dark:border-white/10">
                                📝 {notes}
                              </div>
                            )}
                          </div>

                          {/* FOOTER OFFICE LABEL (If duration >= 120 min) */}
                          {durationM >= 120 && (
                            <div className="text-[8.5px] font-extrabold uppercase tracking-wider opacity-60 self-end pt-1">
                              {evt.officeLabel || evt.sourceOffice}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">Sincronización unificada con Jefatura de Gabinete</span>
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Académica
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Salud
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Social
          </span>
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Agenda
          </span>
        </div>
      </div>
    </div>
  );
};


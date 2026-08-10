import React, { useState } from 'react';
import { AccentColor } from './GlassPanel';
import { Clock, Calendar, ChevronLeft, ChevronRight, Eye, Plus, Edit2, Trash2, X, CheckCircle2, AlertTriangle, BookOpen, User, MapPin } from 'lucide-react';
import { getWeekDaysForDate, getTodayDateString } from '../../utils/dates';
import { useTimeService } from '../../hooks/useTimeService';
import { DayPeriod } from '../../services/TimeService';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM or 'UNTIMED'
  endTime: string; // HH:MM or 'UNTIMED'
  color?: string;
  category?: string;
  officeLabel?: string;
  sourceOffice?: string;
  classroom?: string;
  professor?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
  isHabit?: boolean;
  completed?: boolean;
  status?: string;
  raw?: any;
}

export interface ExecutiveCalendarProps {
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  viewMode?: 'week' | 'day';
  onChangeViewMode?: (mode: 'week' | 'day') => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onAddActivity?: (dateStr?: string, hourStr?: string) => void;
  onEditActivity?: (event: CalendarEvent) => void;
  onDeleteActivity?: (eventId: string) => void;
  onNavigateToOffice?: (officeKey: string) => void;
  onCancelClassOccurrence?: (subjectId: string, scheduleId: string | undefined, dateStr: string) => void;
  onRescheduleActivity?: (event: CalendarEvent) => void;
  onRescheduleClass?: (event: CalendarEvent) => void;
  onCancelActivity?: (event: CalendarEvent) => void;
  accentColor?: AccentColor;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
  customHeaderActions?: React.ReactNode;
}

const START_HOUR = 6; // 06:00
const END_HOUR = 22; // 22:00
const TOTAL_HOURS = END_HOUR - START_HOUR; // 16 hours
const TOTAL_MINUTES = TOTAL_HOURS * 60; // 960 minutes

const parseMinutes = (timeStr: string): number => {
  if (!timeStr || timeStr === 'UNTIMED') return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

/**
 * Universal Adaptive Color Engine
 */
export function getAdaptiveActivityStyle(baseColor: string = '#3B82F6', period: DayPeriod = 'midday') {
  const isDark = period === 'dusk' || period === 'night';
  const isWarm = period === 'sunset' || period === 'dawn';

  if (isDark) {
    return {
      bg: `${baseColor}28`,
      border: baseColor,
      text: '#FFFFFF',
      titleColor: '#FFFFFF',
      subtext: '#CBD5E1',
      badgeBg: `${baseColor}40`,
      badgeText: '#F8FAFC',
      hoverShadow: `0 0 12px ${baseColor}50`
    };
  } else if (isWarm) {
    return {
      bg: `${baseColor}1E`,
      border: baseColor,
      text: '#290F02',
      titleColor: '#451A03',
      subtext: '#78350F',
      badgeBg: `${baseColor}25`,
      badgeText: '#451A03',
      hoverShadow: `0 2px 10px ${baseColor}30`
    };
  } else {
    // Light mode (morning, midday)
    return {
      bg: `${baseColor}14`,
      border: baseColor,
      text: '#0F172A',
      titleColor: '#0F172A',
      subtext: '#334155',
      badgeBg: `${baseColor}20`,
      badgeText: '#0F172A',
      hoverShadow: `0 2px 8px ${baseColor}25`
    };
  }
}

export interface RenderableEvent {
  event: CalendarEvent;
  startM: number;
  endM: number;
  topPercent: number;
  heightPercent: number;
  colIndex: number;
  totalCols: number;
  isConflict: boolean;
  conflictingEvents: CalendarEvent[];
}

export const ExecutiveCalendar: React.FC<ExecutiveCalendarProps> = ({
  events,
  selectedDate,
  onSelectDate,
  viewMode,
  onChangeViewMode,
  onSelectEvent,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onNavigateToOffice,
  onCancelClassOccurrence,
  onRescheduleActivity,
  onRescheduleClass,
  onCancelActivity,
  title = 'Horario Semanal Unificado',
  subtitle = 'Sistema de agenda integrada con sincronización en tiempo real',
  readOnly = false,
  customHeaderActions
}) => {
  const timeService = useTimeService();
  const period = timeService.period;

  const [activeEventModal, setActiveEventModal] = useState<CalendarEvent | null>(null);
  const [conflictModalData, setConflictModalData] = useState<{
    eventA: CalendarEvent;
    eventB: CalendarEvent;
  } | null>(null);

  const weekDays = getWeekDaysForDate(selectedDate);
  const todayStr = getTodayDateString();

  const handlePrevWeek = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() - 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${day}`);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${day}`);
  };

  const hoursArray = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  // Group events by date
  const eventsByDateMap = new Map<string, CalendarEvent[]>();
  events.forEach(evt => {
    if (!evt.date) return;
    const existing = eventsByDateMap.get(evt.date) || [];
    existing.push(evt);
    eventsByDateMap.set(evt.date, existing);
  });

  // Calculate day layout and conflicts for a given date's events
  const getDayEventsLayout = (dayEvts: CalendarEvent[]) => {
    const untimedEvents = dayEvts.filter(e => e.startTime === 'UNTIMED');
    const timed = dayEvts.filter(e => e.startTime !== 'UNTIMED');

    const parsed: RenderableEvent[] = timed.map(evt => {
      const startM = parseMinutes(evt.startTime);
      let endM = parseMinutes(evt.endTime || evt.startTime);
      if (endM <= startM) endM = startM + 60; // default 1 hr duration if equal

      const dayStartM = START_HOUR * 60;
      const topPercent = Math.max(0, Math.min(100, ((startM - dayStartM) / TOTAL_MINUTES) * 100));
      const heightPercent = Math.max(4, Math.min(100 - topPercent, ((endM - startM) / TOTAL_MINUTES) * 100));

      return {
        event: evt,
        startM,
        endM,
        topPercent,
        heightPercent,
        colIndex: 0,
        totalCols: 1,
        isConflict: false,
        conflictingEvents: []
      };
    });

    const conflictPairs: [CalendarEvent, CalendarEvent][] = [];

    // Detect conflicts among timed events
    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        const a = parsed[i];
        const b = parsed[j];
        if (a.startM < b.endM && b.startM < a.endM) {
          a.isConflict = true;
          b.isConflict = true;
          if (!a.conflictingEvents.some(x => x.id === b.event.id)) a.conflictingEvents.push(b.event);
          if (!b.conflictingEvents.some(x => x.id === a.event.id)) b.conflictingEvents.push(a.event);
          
          conflictPairs.push([a.event, b.event]);
        }
      }
    }

    // Compute overlapping column layouts so events render side-by-side
    const clusters: RenderableEvent[][] = [];
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

    return {
      untimedEvents,
      renderableEvents: parsed,
      hasConflict: conflictPairs.length > 0,
      conflictPairs
    };
  };

  // Collect all week conflict pairs for the banner
  const allWeekConflicts: { dateStr: string; pair: [CalendarEvent, CalendarEvent] }[] = [];
  weekDays.forEach(day => {
    const dayEvts = eventsByDateMap.get(day.dateStr) || [];
    const layout = getDayEventsLayout(dayEvts);
    layout.conflictPairs.forEach(pair => {
      allWeekConflicts.push({ dateStr: day.dateStr, pair });
    });
  });

  // Current Time Line
  const now = timeService.now;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const nowTotalMinutes = (currentHour - START_HOUR) * 60 + currentMinute;
  const showCurrentTimeLine = nowTotalMinutes >= 0 && nowTotalMinutes <= TOTAL_MINUTES;
  const currentTimeTopPercent = Math.max(0, Math.min(100, (nowTotalMinutes / TOTAL_MINUTES) * 100));
  const timeNowFormatted = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  const handleEventClick = (evt: CalendarEvent, e: React.MouseEvent, conflicts?: CalendarEvent[]) => {
    e.stopPropagation();
    if (conflicts && conflicts.length > 0) {
      setConflictModalData({ eventA: evt, eventB: conflicts[0] });
      return;
    }
    setActiveEventModal(evt);
    if (onSelectEvent) {
      onSelectEvent(evt);
    }
  };

  const dayEvents = eventsByDateMap.get(selectedDate) || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm transition-all duration-300 text-slate-900">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg tracking-wide flex items-center gap-2">
              {title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-sans font-semibold">
                {timeService.icon} {timeService.periodInfo.label}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {customHeaderActions}

          {!readOnly && onAddActivity && (
            <button
              onClick={() => onAddActivity(selectedDate)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Actividad</span>
            </button>
          )}

          <button
            onClick={() => onSelectDate(todayStr)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95"
          >
            Hoy
          </button>

          <div className="flex items-center border border-slate-300 bg-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => onChangeViewMode('week')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => onChangeViewMode('day')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diaria
            </button>
          </div>
        </div>
      </div>

      {/* SCHEDULE CONFLICT ALERT BANNER */}
      {allWeekConflicts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <strong className="block font-bold text-sm">⚠️ Conflicto de horario detectado</strong>
              <span className="text-xs text-amber-900">
                Tienes {allWeekConflicts.length} {allWeekConflicts.length === 1 ? 'evento que coincide' : 'eventos que coinciden'} en fecha y horario en esta semana.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const first = allWeekConflicts[0];
              setConflictModalData({ eventA: first.pair[0], eventB: first.pair[1] });
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Resolver Conflicto
          </button>
        </div>
      )}

      {/* WEEKLY GRID VIEW */}
      {viewMode === 'week' ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <div className="min-w-[850px]">
            {/* Days Header (Lunes a Domingo) */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center text-xs font-sans overflow-hidden">
              <div className="p-2.5 text-slate-500 text-[10px] uppercase tracking-wider font-mono flex items-center justify-center border-r border-slate-200 font-bold">
                ⏰ HORA
              </div>
              {weekDays.map(day => {
                const dayEvts = eventsByDateMap.get(day.dateStr) || [];
                const layout = getDayEventsLayout(dayEvts);

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => onSelectDate(day.dateStr)}
                    className={`p-2 border-r border-slate-200 cursor-pointer transition-all ${
                      day.isToday
                        ? 'bg-purple-100/80 font-bold border-b-2 border-b-purple-600 text-purple-950 shadow-inner'
                        : day.dateStr === selectedDate
                        ? 'bg-purple-50 font-bold border-b-2 border-b-purple-500 text-purple-900'
                        : 'hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-widest font-bold text-purple-800 flex items-center justify-center gap-1">
                      <span>{day.dayShort}</span>
                      {day.isToday && (
                        <span className="text-[8px] font-black uppercase text-purple-700 bg-purple-200 px-1 py-0.2 rounded-xs">
                          Hoy
                        </span>
                      )}
                      {layout.hasConflict && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" title="Conflicto de horario" />
                      )}
                    </div>
                    <div className="text-sm font-serif flex items-center justify-center mt-0.5">
                      <span className={day.isToday ? 'w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs' : 'text-slate-900 font-semibold'}>
                        {day.dayNumberStr}
                      </span>
                    </div>

                    {/* UNTIMED DUE DATES / DELIVERIES TOP STRIP */}
                    {layout.untimedEvents.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {layout.untimedEvents.map(uEvt => (
                          <div
                            key={uEvt.id}
                            onClick={(e) => handleEventClick(uEvt, e)}
                            className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded text-[9px] font-bold text-amber-950 truncate transition-colors flex items-center gap-1"
                            title={`Entrega: ${uEvt.title}`}
                          >
                            <span className="truncate">📌 {uEvt.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Timeline Area */}
            <div className="relative grid grid-cols-8 bg-slate-50/40 min-h-[580px]">
              
              {/* CURRENT TIME MOVING INDICATOR LINE */}
              {showCurrentTimeLine && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center transition-all duration-1000"
                  style={{ top: `${currentTimeTopPercent}%` }}
                >
                  <div className="bg-rose-600 text-white font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-r shadow-md border border-rose-300 transform -translate-y-1/2 shrink-0">
                    AHORA ({timeNowFormatted})
                  </div>
                  <div className="flex-1 h-[2px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  <div className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-md transform -translate-y-1/2 animate-pulse shrink-0" />
                </div>
              )}

              {/* Hour Column */}
              <div className="border-r border-slate-200 divide-y divide-slate-200 bg-slate-100/60 select-none">
                {hoursArray.slice(0, -1).map(h => (
                  <div key={h} className="h-10 text-[10px] font-mono text-slate-500 text-right pr-2 pt-1 font-semibold">
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map(day => {
                const dayEvts = eventsByDateMap.get(day.dateStr) || [];
                const layout = getDayEventsLayout(dayEvts);

                return (
                  <div key={day.dateStr} className={`relative border-r border-slate-200 ${day.isToday ? 'bg-purple-50/20' : ''}`}>
                    {/* Hour Guidelines with Click-to-Add capability */}
                    <div className="absolute inset-0 divide-y divide-slate-200 pointer-events-auto">
                      {hoursArray.slice(0, -1).map(h => {
                        const timeStr = `${String(h).padStart(2, '0')}:00`;
                        return (
                          <div
                            key={h}
                            className="h-10 hover:bg-purple-100/30 cursor-pointer transition-colors"
                            onClick={() => !readOnly && onAddActivity && onAddActivity(day.dateStr, timeStr)}
                            title={`Haga clic para agregar actividad a las ${timeStr}`}
                          />
                        );
                      })}
                    </div>

                    {/* CONTINUOUS ADAPTIVE EVENT BLOCKS */}
                    {layout.renderableEvents.map((rEvt, idx) => {
                      const evt = rEvt.event;
                      const isCancelled = evt.status === 'cancelled' || evt.status === 'Cancelada' || evt.raw?.status === 'cancelled';
                      const style = getAdaptiveActivityStyle(isCancelled ? '#EF4444' : (evt.color || '#3B82F6'), period);

                      // Calculate layout widths for overlapping side-by-side columns
                      const leftPercent = (rEvt.colIndex / rEvt.totalCols) * 96 + 2;
                      const widthPercent = (100 / rEvt.totalCols) - 3;

                      const hasActivitiesIndicator = Boolean(evt.raw?.hasPendingActivities);

                      return (
                        <div
                          key={evt.id || idx}
                          onClick={(e) => handleEventClick(evt, e, rEvt.conflictingEvents)}
                          className={`absolute rounded-lg p-1.5 text-xs border shadow-xs hover:z-30 hover:scale-[1.02] transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                            isCancelled
                              ? 'bg-rose-50/80 border-rose-300 opacity-65 dark:bg-rose-950/40 dark:border-rose-800'
                              : rEvt.isConflict
                              ? 'border-2 border-rose-500 bg-rose-50/90 shadow-md ring-2 ring-rose-300'
                              : ''
                          }`}
                          style={{
                            top: `${rEvt.topPercent}%`,
                            height: `${rEvt.heightPercent}%`,
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: isCancelled ? '#FEF2F2' : (rEvt.isConflict ? '#FFF1F2' : style.bg),
                            borderColor: isCancelled ? '#FCA5A5' : (rEvt.isConflict ? '#E11D48' : style.border),
                            borderLeftWidth: '4px',
                            color: isCancelled ? '#991B1B' : style.text
                          }}
                        >
                          <div>
                            <div className="font-bold text-[11px] leading-tight truncate flex items-center justify-between gap-1" style={{ color: isCancelled ? '#991B1B' : (rEvt.isConflict ? '#9F1239' : style.titleColor) }}>
                              <span className={`truncate flex items-center gap-1 ${isCancelled ? 'line-through opacity-80' : ''}`}>
                                {evt.completed && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                                <span className="truncate">{evt.title}</span>
                              </span>

                              {/* DISCRETE INDICATOR DOT FOR PENDING ACTIVITIES */}
                              {hasActivitiesIndicator && !isCancelled && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600 shrink-0 animate-pulse shadow-xs"
                                  title={`${evt.raw.pendingActivitiesCount} actividades/evaluaciones pendientes en esta materia`}
                                />
                              )}
                            </div>

                            {/* CANCELLED BADGE */}
                            {isCancelled && (
                              <div className="text-[9px] font-extrabold uppercase tracking-tight text-rose-800 bg-rose-100 border border-rose-300 px-1 py-0.5 rounded mt-0.5 flex items-center gap-0.5 w-fit">
                                <X className="w-2.5 h-2.5 shrink-0" />
                                <span>❌ Cancelada</span>
                              </div>
                            )}

                            {/* CONFLICT WARNING BADGE ON EVENT CARD */}
                            {!isCancelled && rEvt.isConflict && (
                              <div className="text-[9px] font-extrabold uppercase tracking-tight text-rose-700 bg-rose-100 border border-rose-300 px-1 py-0.5 rounded mt-0.5 flex items-center gap-0.5 w-fit">
                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                <span>Conflicto</span>
                              </div>
                            )}

                            {evt.classroom && (
                              <div className="text-[10px] truncate mt-0.5 opacity-90" style={{ color: style.subtext }}>
                                Aula: {evt.classroom}
                              </div>
                            )}
                            {evt.subtitle && (
                              <div className="text-[10px] truncate mt-0.5 opacity-85" style={{ color: style.subtext }}>
                                {evt.subtitle}
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] font-mono font-bold mt-1 opacity-90 flex justify-between items-center" style={{ color: style.subtext }}>
                            <span>{evt.startTime} – {evt.endTime}</span>
                            {evt.officeLabel && (
                              <span className="text-[9px] px-1 rounded uppercase font-sans tracking-tight" style={{ backgroundColor: style.badgeBg, color: style.badgeText }}>
                                {evt.officeLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

            </div>

          </div>
        </div>
      ) : (
        /* DAILY VIEW */
        <div className="space-y-3 pt-2">
          <div className="text-xs font-serif text-slate-700 border-b border-slate-200 pb-2 flex justify-between items-center">
            <span className="font-bold">Programación del día {selectedDate}</span>
            <span className="font-mono text-slate-500">{dayEvents.length} actividades programadas</span>
          </div>

          {dayEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-700">No hay actividades agendadas para esta fecha.</p>
              {!readOnly && onAddActivity && (
                <button
                  onClick={() => onAddActivity(selectedDate)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Crear nueva actividad
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayEvents.map((evt, idx) => {
                const style = getAdaptiveActivityStyle(evt.color || '#3B82F6', period);

                return (
                  <div
                    key={evt.id || idx}
                    onClick={(e) => handleEventClick(evt, e)}
                    className="p-4 rounded-xl border hover:border-purple-400 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs"
                    style={{
                      backgroundColor: style.bg,
                      borderColor: style.border,
                      borderLeftWidth: '5px'
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {evt.officeLabel && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                            {evt.officeLabel}
                          </span>
                        )}
                        {evt.classroom && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                            Aula: {evt.classroom}
                          </span>
                        )}
                        {evt.raw?.hasPendingActivities && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                            ● Actividades pendientes
                          </span>
                        )}
                      </div>
                      <div className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                        {evt.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {evt.title}
                      </div>
                      {evt.professor && <div className="text-xs text-slate-700">👤 Profesor: {evt.professor}</div>}
                      {evt.subtitle && <div className="text-xs text-slate-600">{evt.subtitle}</div>}
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 shadow-2xs">
                        {evt.startTime} – {evt.endTime}
                      </div>

                      {evt.sourceOffice && onNavigateToOffice && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToOffice(evt.sourceOffice!);
                          }}
                          className="p-2 bg-white hover:bg-slate-100 rounded-xl text-xs text-purple-700 border border-purple-200 flex items-center gap-1 transition-colors"
                          title="Ir a Oficina de origen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FOOTER LEGEND & COLOR SYSTEM */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-3 border-t border-slate-200 font-sans gap-2">
        <span className="font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
          🎨 Sistema de Color Adaptativo ({timeService.periodInfo.label}):
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Académica</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Financiera</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Médica</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Vida Diaria</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Relaciones</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Desarrollo</span>
        </div>
      </div>

      {/* EVENT DETAIL & CLASS ACTIVITIES MODAL */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setActiveEventModal(null)}>
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 text-slate-900 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  {activeEventModal.officeLabel || 'Actividad Académica'}
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">{activeEventModal.title}</h3>
              </div>
              <button onClick={() => setActiveEventModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="font-mono font-bold text-slate-900">{activeEventModal.date}</span>
                <span>({activeEventModal.startTime} – {activeEventModal.endTime})</span>
              </div>

              {activeEventModal.classroom && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-bold">Lugar / Aula:</span>
                  <span>{activeEventModal.classroom}</span>
                </div>
              )}

              {activeEventModal.professor && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-bold">Profesor:</span>
                  <span>{activeEventModal.professor}</span>
                </div>
              )}

              {activeEventModal.subtitle && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-sans">
                  {activeEventModal.subtitle}
                </div>
              )}
            </div>

            {/* CLASS ACTIVITIES SECTION (REQUIREMENT 3) */}
            {activeEventModal.raw?.type === 'class_session' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    📝 Actividades y Tareas de esta Materia
                  </h4>
                  {activeEventModal.raw?.hasPendingActivities && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                      {activeEventModal.raw.pendingActivitiesCount} pendientes
                    </span>
                  )}
                </div>

                {activeEventModal.raw?.pendingEvalActs?.length > 0 || activeEventModal.raw?.pendingAcadActs?.length > 0 ? (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {activeEventModal.raw?.pendingEvalActs?.map((act: any) => (
                      <div key={act.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-0.5 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1">
                            <span className="text-purple-600 font-extrabold">●</span> {act.name}
                          </span>
                          {act.weightPercent && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                              {act.weightPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center justify-between">
                          <span>{act.type} • {act.cutName || 'Corte'}</span>
                          <span className="font-mono text-[10px] text-slate-500">📅 Entrega: {act.date}</span>
                        </div>
                      </div>
                    ))}

                    {activeEventModal.raw?.pendingAcadActs?.map((act: any) => (
                      <div key={act.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-0.5 shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1">
                            <span className="text-amber-600 font-extrabold">●</span> {act.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">{act.type}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono text-[10px]">
                          📅 Fecha: {act.date} {act.startTime ? `(${act.startTime} - ${act.endTime})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    No existen actividades pendientes o tareas pendientes para esta materia.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100">
              {/* CANCEL OR UN-CANCEL EVENT BUTTON */}
              {onCancelActivity && (
                <button
                  onClick={() => {
                    const evt = activeEventModal;
                    setActiveEventModal(null);
                    onCancelActivity(evt);
                  }}
                  className={`px-3 py-1.5 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors border ${
                    activeEventModal.status === 'cancelled' || activeEventModal.status === 'Cancelada'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                  title={activeEventModal.status === 'cancelled' ? 'Reactivar esta actividad' : 'Marcar como cancelada en la agenda'}
                >
                  {activeEventModal.status === 'cancelled' ? '✅ Reactivar actividad' : '❌ Cancelar esta actividad'}
                </button>
              )}

              {/* CANCEL SPECIFIC CLASS OCCURRENCE BUTTON */}
              {activeEventModal.raw?.type === 'class_session' && onCancelClassOccurrence && (
                <button
                  onClick={() => {
                    const ses = activeEventModal.raw.session;
                    if (ses) {
                      onCancelClassOccurrence(ses.subjectId, ses.scheduleId, ses.date);
                      setActiveEventModal(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  title="Cancelar únicamente la clase de esta fecha sin borrar el semestre"
                >
                  🚫 Cancelar esta clase de hoy
                </button>
              )}

              {!readOnly && onDeleteActivity && activeEventModal.raw?.type !== 'class_session' && (
                <button
                  onClick={() => {
                    const evId = activeEventModal.id;
                    setActiveEventModal(null);
                    onDeleteActivity(evId);
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              )}

              {!readOnly && onEditActivity && (
                <button
                  onClick={() => {
                    const evt = activeEventModal;
                    setActiveEventModal(null);
                    onEditActivity(evt);
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              )}

              {activeEventModal.sourceOffice && onNavigateToOffice && (
                <button
                  onClick={() => {
                    const officeKey = activeEventModal.sourceOffice!;
                    setActiveEventModal(null);
                    onNavigateToOffice(officeKey);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Ir a Oficina
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT RESOLUTION MODAL (REQUIREMENTS 6, 7, 8, 9) */}
      {conflictModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={() => setConflictModalData(null)}>
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 text-slate-900 animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-rose-950">⚠️ Conflicto de Horario Detectado</h3>
                  <p className="text-xs text-slate-600">Tienes dos eventos programados en el mismo rango de fecha y hora.</p>
                </div>
              </div>
              <button onClick={() => setConflictModalData(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONFLICTING EVENTS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  {conflictModalData.eventA.raw?.type === 'class_session' ? '📚 Clase' : '📝 Actividad'}
                </span>
                <div className="font-bold text-slate-900 text-sm">{conflictModalData.eventA.title}</div>
                <div className="text-slate-600 font-mono text-[11px]">
                  ⏰ {conflictModalData.eventA.date} • {conflictModalData.eventA.startTime} - {conflictModalData.eventA.endTime}
                </div>
                {conflictModalData.eventA.classroom && (
                  <div className="text-slate-500 text-[11px]">📍 Aula: {conflictModalData.eventA.classroom}</div>
                )}
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                  {conflictModalData.eventB.raw?.type === 'class_session' ? '📚 Clase' : '📝 Actividad'}
                </span>
                <div className="font-bold text-slate-900 text-sm">{conflictModalData.eventB.title}</div>
                <div className="text-slate-600 font-mono text-[11px]">
                  ⏰ {conflictModalData.eventB.date} • {conflictModalData.eventB.startTime} - {conflictModalData.eventB.endTime}
                </div>
                {conflictModalData.eventB.classroom && (
                  <div className="text-slate-500 text-[11px]">📍 Aula: {conflictModalData.eventB.classroom}</div>
                )}
              </div>
            </div>

            {/* RESOLUTION OPTIONS */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-slate-800 block">¿Qué quieres hacer?</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* 1. MANTENER AMBOS */}
                <button
                  onClick={() => setConflictModalData(null)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold rounded-xl text-slate-800 text-left transition-all flex items-center gap-2"
                >
                  <span>👥 Mantener ambos</span>
                </button>

                {/* 2. REPROGRAMAR ACTIVIDAD */}
                <button
                  onClick={() => {
                    const actEvt = conflictModalData.eventA.raw?.type !== 'class_session' ? conflictModalData.eventA : conflictModalData.eventB;
                    setConflictModalData(null);
                    if (onRescheduleActivity) onRescheduleActivity(actEvt);
                    else if (onEditActivity) onEditActivity(actEvt);
                  }}
                  className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold rounded-xl text-purple-900 text-left transition-all flex items-center gap-2"
                >
                  <span>📅 Reprogramar la actividad</span>
                </button>

                {/* 3. REPROGRAMAR CLASE */}
                <button
                  onClick={() => {
                    const classEvt = conflictModalData.eventA.raw?.type === 'class_session' ? conflictModalData.eventA : conflictModalData.eventB;
                    setConflictModalData(null);
                    if (onRescheduleClass) onRescheduleClass(classEvt);
                    else if (onEditActivity) onEditActivity(classEvt);
                  }}
                  className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-bold rounded-xl text-purple-900 text-left transition-all flex items-center gap-2"
                >
                  <span>⏰ Reprogramar la clase</span>
                </button>

                {/* 4. CANCELAR ACTIVIDAD */}
                <button
                  onClick={() => {
                    const actEvt = conflictModalData.eventA.raw?.type !== 'class_session' ? conflictModalData.eventA : conflictModalData.eventB;
                    setConflictModalData(null);
                    if (onCancelActivity) onCancelActivity(actEvt);
                    else if (onDeleteActivity) onDeleteActivity(actEvt.id);
                  }}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold rounded-xl text-rose-800 text-left transition-all flex items-center gap-2"
                >
                  <span>❌ Cancelar la actividad</span>
                </button>

                {/* 5. CANCELAR CLASE (SOLO ESTA SESION) */}
                <button
                  onClick={() => {
                    const classEvt = conflictModalData.eventA.raw?.type === 'class_session' ? conflictModalData.eventA : conflictModalData.eventB;
                    if (classEvt?.raw?.session && onCancelClassOccurrence) {
                      onCancelClassOccurrence(classEvt.raw.session.subjectId, classEvt.raw.session.scheduleId, classEvt.raw.session.date);
                    }
                    setConflictModalData(null);
                  }}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 font-bold rounded-xl text-amber-900 text-left transition-all flex items-center gap-2"
                >
                  <span>🚫 Cancelar esta clase de hoy</span>
                </button>

                {/* 6. REVISAR CONFLICTO */}
                <button
                  onClick={() => setConflictModalData(null)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold rounded-xl text-slate-700 text-left transition-all flex items-center gap-2"
                >
                  <span>👁️ Revisar el conflicto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Universal Export alias for full compliance across all module usages
export const UniversalSchedule = ExecutiveCalendar;

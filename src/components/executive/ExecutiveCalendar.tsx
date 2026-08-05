import React from 'react';
import { AccentColor } from './GlassPanel';
import { Clock, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getWeekDaysForDate, getTodayDateString } from '../../utils/dates';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color?: string;
  officeLabel?: string;
  sourceOffice?: string;
  classroom?: string;
  professor?: string;
  raw?: any;
}

export interface ExecutiveCalendarProps {
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  viewMode: 'week' | 'day';
  onChangeViewMode: (mode: 'week' | 'day') => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onNavigateToOffice?: (officeKey: string) => void;
  accentColor?: AccentColor;
  title?: string;
  subtitle?: string;
}

const START_HOUR = 7; // 07:00
const END_HOUR = 21; // 21:00
const TOTAL_HOURS = END_HOUR - START_HOUR; // 14 hours
const TOTAL_MINUTES = TOTAL_HOURS * 60; // 840 minutes

const parseMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

export const ExecutiveCalendar: React.FC<ExecutiveCalendarProps> = ({
  events,
  selectedDate,
  onSelectDate,
  viewMode,
  onChangeViewMode,
  onSelectEvent,
  onNavigateToOffice,
  accentColor = 'gold',
  title = 'Horario Ejecutivo Unificado',
  subtitle = 'Proyección cronológica integrada de bloques continuos',
}) => {
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

  // Group events by date for quick lookup
  const eventsByDateMap = new Map<string, CalendarEvent[]>();
  events.forEach(evt => {
    if (!evt.date) return;
    const existing = eventsByDateMap.get(evt.date) || [];
    existing.push(evt);
    eventsByDateMap.set(evt.date, existing);
  });

  const dayEvents = eventsByDateMap.get(selectedDate) || [];

  // Current Time Moving Indicator Line Calculation
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const nowTotalMinutes = (currentHour - START_HOUR) * 60 + currentMinute;
  const showCurrentTimeLine = nowTotalMinutes >= 0 && nowTotalMinutes <= TOTAL_MINUTES;
  const currentTimeTopPercent = Math.max(0, Math.min(100, (nowTotalMinutes / TOTAL_MINUTES) * 100));
  const timeNowFormatted = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  return (
    <div className="bg-[#0B1528]/85 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl text-white">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base sm:text-lg tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onSelectDate(todayStr)}
            className="px-3 py-1.5 bg-[#162A45] hover:bg-[#1E3B61] border border-[#C5A059]/40 text-[#C5A059] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95"
          >
            Hoy
          </button>
          <div className="flex items-center border border-white/10 bg-[#162A45] rounded-xl overflow-hidden">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-[#132337] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => onChangeViewMode('week')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-[#C5A059] text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vista Semanal
            </button>
            <button
              onClick={() => onChangeViewMode('day')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-[#C5A059] text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vista Diaria
            </button>
          </div>
        </div>
      </div>

      {/* WEEKLY GRID WITH SINGLE CONTINUOUS EVENT BLOCKS */}
      {viewMode === 'week' ? (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-white/10 bg-[#132337]/90 text-center text-xs font-sans rounded-t-xl overflow-hidden">
              <div className="p-2 text-slate-400 text-[10px] uppercase tracking-wider font-mono flex items-center justify-center border-r border-white/10">
                HORA
              </div>
              {weekDays.map(day => (
                <div
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`p-2.5 border-r border-white/10 cursor-pointer transition-colors ${
                    day.dateStr === selectedDate ? 'bg-[#C5A059]/20 font-bold border-b-2 border-b-[#C5A059]' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="text-[10px] uppercase text-[#C5A059] tracking-widest">{day.dayShort}</div>
                  <div className={`text-sm font-serif ${day.isToday ? 'text-amber-300 font-extrabold' : 'text-white'}`}>
                    {day.dayNumberStr}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Area (Absolute Continuous Block Layer) */}
            <div className="relative grid grid-cols-8 border-b border-white/10 bg-[#0B1528]/50 min-h-[560px]">
              
              {/* CURRENT TIME MOVING INDICATOR LINE */}
              {showCurrentTimeLine && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center transition-all duration-1000"
                  style={{ top: `${currentTimeTopPercent}%` }}
                >
                  <div className="bg-gradient-to-r from-rose-600 to-rose-500 text-white font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-r shadow-lg border border-rose-300/60 transform -translate-y-1/2 shrink-0">
                    AHORA ({timeNowFormatted})
                  </div>
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
                  <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_12px_rgba(244,63,94,1)] transform -translate-y-1/2 animate-pulse shrink-0" />
                </div>
              )}

              {/* Left Hour Column Labels */}
              <div className="border-r border-white/10 divide-y divide-white/5 bg-[#132337]/30">
                {hoursArray.slice(0, -1).map(h => (
                  <div key={h} className="h-10 text-[10px] font-mono text-slate-400 text-right pr-2 pt-1">
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map(day => {
                const dayEvts = eventsByDateMap.get(day.dateStr) || [];

                return (
                  <div key={day.dateStr} className={`relative border-r border-white/10 ${day.isToday ? 'bg-amber-950/10' : ''}`}>
                    {/* Hour Background Guidelines */}
                    <div className="absolute inset-0 divide-y divide-white/5 pointer-events-none">
                      {hoursArray.slice(0, -1).map(h => (
                        <div key={h} className="h-10" />
                      ))}
                    </div>

                    {/* CONTINUOUS SINGLE BLOCK EVENT CARDS */}
                    {dayEvts.map((evt, idx) => {
                      const startM = parseMinutes(evt.startTime);
                      const endM = parseMinutes(evt.endTime || evt.startTime);
                      const safeEndM = Math.max(endM, startM + 30);

                      const dayStartM = START_HOUR * 60;
                      const topPercent = Math.max(0, Math.min(100, ((startM - dayStartM) / TOTAL_MINUTES) * 100));
                      const heightPercent = Math.max(4, Math.min(100 - topPercent, ((safeEndM - startM) / TOTAL_MINUTES) * 100));

                      const color = evt.color || '#3B82F6';

                      return (
                        <div
                          key={evt.id || idx}
                          onClick={() => onSelectEvent && onSelectEvent(evt)}
                          className="absolute left-1 right-1 rounded-lg p-2 text-xs border shadow-lg hover:z-20 hover:scale-[1.02] transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                          style={{
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                            backgroundColor: `${color}30`,
                            borderColor: color,
                            borderLeftWidth: '4px'
                          }}
                        >
                          <div>
                            <div className="font-bold text-white text-[11px] leading-tight truncate" style={{ color: color }}>
                              {evt.title}
                            </div>
                            {evt.classroom && (
                              <div className="text-[10px] text-slate-300 truncate mt-0.5">
                                Aula: {evt.classroom}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-300 font-mono font-bold mt-1 opacity-90">
                            {evt.startTime} – {evt.endTime}
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
        /* DAILY CONTINUOUS TIMELINE VIEW */
        <div className="space-y-3 pt-2">
          <div className="text-xs text-[#C5A059] font-serif italic border-b border-white/10 pb-2 flex justify-between items-center">
            <span>Programación detallada del {selectedDate}</span>
            <span className="font-mono text-slate-400">{dayEvents.length} bloques programados</span>
          </div>

          {dayEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#132337]/40 rounded-xl border border-dashed border-white/10 space-y-2">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No hay bloques de horario para esta fecha.</p>
              <p className="text-xs text-slate-500">Selecciona otro día o añade una sesión de clase / evento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  onClick={() => onSelectEvent && onSelectEvent(evt)}
                  className="p-4 bg-[#132337]/80 rounded-xl border border-white/10 hover:border-[#C5A059]/60 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md"
                  style={{ borderLeftWidth: '5px', borderLeftColor: evt.color || '#3B82F6' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {evt.officeLabel && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {evt.officeLabel}
                        </span>
                      )}
                      {evt.classroom && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Aula: {evt.classroom}
                        </span>
                      )}
                    </div>
                    <div className="font-serif font-bold text-white text-base">{evt.title}</div>
                    {evt.professor && <div className="text-xs text-slate-300">👤 Profesor: {evt.professor}</div>}
                    {evt.subtitle && <div className="text-xs text-slate-400">{evt.subtitle}</div>}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                    <div className="px-3 py-1.5 bg-[#0B1528] rounded-xl border border-white/10 text-xs font-mono font-bold text-[#C5A059] shrink-0">
                      {evt.startTime} – {evt.endTime}
                    </div>

                    {evt.sourceOffice && onNavigateToOffice && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToOffice(evt.sourceOffice!);
                        }}
                        className="p-2 bg-[#0B1528] hover:bg-white/10 rounded-xl text-xs text-[#C5A059] border border-[#C5A059]/30 flex items-center gap-1 transition-colors"
                        title="Ir a Oficina"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOOTER OFFICE LEGEND */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/10 font-sans">
        <span className="font-bold text-[#C5A059] uppercase tracking-wider">Convenio Institucional de Colores:</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Académica</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Financiera</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Médica</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Vida Diaria</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Relaciones</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Desarrollo</span>
        </div>
      </div>
    </div>
  );
};

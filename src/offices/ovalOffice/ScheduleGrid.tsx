import React from 'react';
import { UnifiedExecutiveEvent } from '../../types/store';
import { getWeekDaysForDate, getTodayDateString, getCurrentTimeString } from '../../utils/dates';
import { Clock, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface Props {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  viewMode: 'week' | 'day';
  onChangeViewMode: (mode: 'week' | 'day') => void;
  eventsByDate: Map<string, UnifiedExecutiveEvent[]>;
  eventsToday: UnifiedExecutiveEvent[];
  onNavigateToOffice: (officeKey: string) => void;
  onSelectEvent: (event: UnifiedExecutiveEvent) => void;
}

const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const ScheduleGrid: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  viewMode,
  onChangeViewMode,
  eventsByDate,
  eventsToday,
  onNavigateToOffice,
  onSelectEvent
}) => {
  const weekDays = getWeekDaysForDate(selectedDate);
  const todayStr = getTodayDateString();
  const currentTimeStr = getCurrentTimeString();

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

  const handleToday = () => {
    onSelectDate(todayStr);
  };

  return (
    <div className="bg-[#0A192F] text-white border border-[#D1C7B7]/30 shadow-md p-4 sm:p-6 space-y-4 rounded-sm">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D1C7B7]/20 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059]">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-serif font-bold text-white text-lg tracking-wide">
              Horario Ejecutivo Unificado
            </h3>
            <p className="text-xs text-[#C5A059]/80 font-sans">
              Proyección cronológica integrada de todas las oficinas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-[#162A45] hover:bg-[#1E3A5F] border border-[#C5A059]/40 text-[#C5A059] font-bold uppercase tracking-wider transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center border border-[#D1C7B7]/30 bg-[#162A45]">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-[#1E3A5F] text-white/80 transition-colors"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-[#1E3A5F] text-white/80 transition-colors"
              title="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-[#162A45] border border-[#D1C7B7]/30 p-0.5">
            <button
              onClick={() => onChangeViewMode('week')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                viewMode === 'week' ? 'bg-[#C5A059] text-[#0A192F]' : 'text-white/70 hover:text-white'
              }`}
            >
              Vista Semanal
            </button>
            <button
              onClick={() => onChangeViewMode('day')}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                viewMode === 'day' ? 'bg-[#C5A059] text-[#0A192F]' : 'text-white/70 hover:text-white'
              }`}
            >
              Vista Diaria
            </button>
          </div>
        </div>
      </div>

      {/* WEEKLY GRID VIEW */}
      {viewMode === 'week' ? (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Grid Header Days */}
            <div className="grid grid-cols-8 border-b border-[#D1C7B7]/20 bg-[#162A45]/80 text-center font-sans text-xs">
              <div className="p-2 text-white/50 text-[10px] uppercase tracking-wider font-mono flex items-center justify-center border-r border-[#D1C7B7]/20">
                HORA
              </div>
              {weekDays.map(day => (
                <div
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`p-2 border-r border-[#D1C7B7]/20 cursor-pointer transition-colors ${
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

            {/* Grid Hours Body */}
            <div className="divide-y divide-[#D1C7B7]/10 text-xs">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 min-h-[52px]">
                  {/* Hour Label */}
                  <div className="p-1.5 font-mono text-[11px] text-white/50 text-right pr-3 border-r border-[#D1C7B7]/20 bg-[#0F223D]/50 flex items-start justify-end">
                    {hour}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map(day => {
                    const dayEvents = eventsByDate.get(day.dateStr) || [];
                    const hourNum = parseInt(hour.split(':')[0]);
                    
                    // Filter events active during this hour block
                    const matchingEvents = dayEvents.filter(e => {
                      if (!e.startTime) return false;
                      const startH = parseInt(e.startTime.split(':')[0]);
                      const endH = e.endTime ? parseInt(e.endTime.split(':')[0]) : startH + 1;
                      return hourNum >= startH && hourNum < Math.max(endH, startH + 1);
                    });

                    return (
                      <div
                        key={day.dateStr}
                        className={`p-1 border-r border-[#D1C7B7]/10 relative transition-colors ${
                          day.isToday ? 'bg-amber-950/10' : ''
                        }`}
                      >
                        {matchingEvents.map((evt, idx) => (
                          <div
                            key={evt.id || idx}
                            onClick={() => onSelectEvent(evt)}
                            className="p-1.5 mb-1 rounded-xs text-[11px] font-sans border shadow-sm cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden truncate"
                            style={{
                              backgroundColor: `${evt.color}25`,
                              borderColor: evt.color,
                              borderLeftWidth: '3px'
                            }}
                          >
                            <div className="font-bold truncate text-white" style={{ color: evt.color }}>
                              {evt.title}
                            </div>
                            <div className="text-[9px] text-white/70 font-mono truncate">
                              {evt.startTime} - {evt.endTime || '09:00'}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* DAILY TIMELINE VIEW */
        <div className="space-y-3 pt-2">
          <div className="text-xs text-[#C5A059] font-serif italic border-b border-[#D1C7B7]/20 pb-2">
            Vista detallada para {selectedDate} ({eventsToday.length} eventos programados)
          </div>

          {eventsToday.length === 0 ? (
            <div className="p-8 text-center text-white/50 bg-[#162A45]/40 border border-dashed border-[#D1C7B7]/30">
              No hay eventos con horario específico programados para este día.
            </div>
          ) : (
            <div className="space-y-2">
              {eventsToday.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  onClick={() => onSelectEvent(evt)}
                  className="p-3.5 bg-[#162A45] border border-[#D1C7B7]/30 hover:border-[#C5A059] cursor-pointer transition-all flex justify-between items-center"
                  style={{ borderLeftWidth: '4px', borderLeftColor: evt.color || '#C5A059' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#0A192F] text-[#C5A059] border border-[#C5A059]/30">
                        {evt.officeLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {evt.startTime} - {evt.endTime || '09:00'}
                      </span>
                    </div>
                    <div className="font-bold font-serif text-white text-sm">{evt.title}</div>
                    {evt.subtitle && <div className="text-xs text-white/70 font-sans">{evt.subtitle}</div>}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToOffice(evt.sourceOffice);
                    }}
                    className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold px-3 py-1.5 bg-[#0A192F] hover:bg-white/10 border border-[#C5A059]/40 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Oficina →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COLOR LEGEND */}
      <div className="flex flex-wrap items-center justify-between text-[10px] text-white/70 pt-3 border-t border-[#D1C7B7]/20 font-sans">
        <span className="font-bold text-[#C5A059] uppercase tracking-wider">Oficinas:</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Académica</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Financiera</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Vida Diaria</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Relaciones</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Salud</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Personal</span>
        </div>
      </div>
    </div>
  );
};

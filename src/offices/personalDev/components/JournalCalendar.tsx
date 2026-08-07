import React, { useState } from 'react';
import { JournalEntry } from '../../../types/store';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { ExecutiveBadge } from '../../../components/executive';

interface JournalCalendarProps {
  entries: JournalEntry[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MOOD_COLORS: Record<string, string> = {
  excelente: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  bueno: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  neutro: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  dificil: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  reflexivo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
};

export const JournalCalendar: React.FC<JournalCalendarProps> = ({
  entries,
  selectedDate,
  onSelectDate
}) => {
  // Parsing date (YYYY-MM-DD)
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return parts[0] || new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const parts = selectedDate.split('-').map(Number);
    return (parts[1] || new Date().getMonth() + 1) - 1;
  });

  // Map entries by date YYYY-MM-DD
  const entriesMap = React.useMemo(() => {
    const map = new Map<string, JournalEntry>();
    entries.forEach(entry => {
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    onSelectDate(todayStr);
  };

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const calendarGrid = [];
  // Empty slots before 1st day of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarGrid.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarGrid.push({ dayNumber: d, dateStr });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
            <CalendarIcon className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-900 text-base tracking-tight flex items-center gap-2">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <p className="text-xs text-slate-500">
              Visualizador emocional mensual de reflexiones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs transition-all active:scale-95"
          >
            Hoy
          </button>
          <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-medium uppercase tracking-wider text-slate-500 pb-1">
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarGrid.map((item, index) => {
          if (!item) {
            return <div key={`empty-${index}`} className="h-16 sm:h-20 rounded-xl bg-transparent" />;
          }

          const { dayNumber, dateStr } = item;
          const entry = entriesMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`h-16 sm:h-20 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 relative overflow-hidden group ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/50'
                  : entry
                  ? 'border-slate-200 bg-slate-50/80 hover:border-white/30 hover:bg-slate-100'
                  : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-semibold rounded-md px-1.5 py-0.5 ${
                    isToday
                      ? 'bg-[#C5A059] text-slate-950 font-bold'
                      : isSelected
                      ? 'text-indigo-300'
                      : 'text-slate-700'
                  }`}
                >
                  {dayNumber}
                </span>

                {entry && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                )}
              </div>

              {/* Emotional Summary Badge / Word of the day */}
              {entry ? (
                <div className="w-full truncate mt-auto">
                  {entry.wordOfTheDay ? (
                    <span className="inline-block w-full truncate text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-200">
                      {entry.wordOfTheDay}
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] text-slate-500 italic truncate">
                      Reflexión✓
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-[9px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Escribir
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

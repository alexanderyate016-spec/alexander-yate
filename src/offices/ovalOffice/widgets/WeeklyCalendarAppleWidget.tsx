import React from 'react';
import { MasterState } from '../../../types/store';
import { OvalOfficeCalculations } from '../OvalOfficeCalculations';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
}

export const WeeklyCalendarAppleWidget: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice,
}) => {
  const currentDate = new Date(selectedDate);

  // Calculate Monday of the current selected week
  const day = currentDate.getDay(); // 0 is Sun, 1 is Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMon);

  const todayStr = new Date().toISOString().split('T')[0];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateISO = d.toISOString().split('T')[0];
    return {
      date: d,
      dateISO,
      dayName: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'][i],
      dayNum: d.getDate(),
      isToday: dateISO === todayStr,
      isSelected: dateISO === selectedDate
    };
  });

  // Hours from 07:00 to 22:00
  const hours = Array.from({ length: 16 }, (_, i) => {
    const h = 7 + i;
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
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[420px]">
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
              Estructura diaria (07:00 – 22:00) • 7 Días
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

      {/* HOURLY GRID CONTAINER */}
      <div className="my-3 overflow-x-auto max-h-[380px] overflow-y-auto custom-scrollbar border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
        <table className="w-full text-xs border-collapse min-w-[650px] table-fixed">
          {/* DAY HEADERS */}
          <thead className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80">
            <tr>
              <th className="w-16 py-2.5 font-mono text-[10px] text-slate-400 font-extrabold text-center border-r border-slate-200/60 dark:border-slate-700/60">
                HORA
              </th>
              {weekDays.map(wd => (
                <th
                  key={wd.dateISO}
                  className={`py-2 text-center font-bold transition-all border-r border-slate-200/40 dark:border-slate-700/40 last:border-r-0 ${
                    wd.isToday
                      ? 'bg-purple-500/10 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : wd.isSelected
                      ? 'bg-slate-200/50 dark:bg-slate-700/50'
                      : ''
                  }`}
                >
                  <div className="text-[10px] tracking-wider opacity-75">{wd.dayName}</div>
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
                </th>
              ))}
            </tr>
          </thead>

          {/* HOURLY ROWS (07:00 - 22:00) */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {hours.map(slot => {
              return (
                <tr key={slot.label} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* HOUR LABEL */}
                  <td className="py-2.5 pr-2 font-mono text-[10px] text-slate-400 font-bold text-center border-r border-slate-200/60 dark:border-slate-700/60 align-top bg-slate-50/50 dark:bg-slate-900/40">
                    {slot.label}
                  </td>

                  {/* 7 DAY CELLS */}
                  {weekDays.map(wd => {
                    const dayEvents = eventsByDayISO[wd.dateISO] || [];
                    // Find events starting in this hourly window
                    const slotEvents = dayEvents.filter(evt => {
                      if (!evt.startTime) return false;
                      const h = parseInt(evt.startTime.split(':')[0], 10);
                      return h === slot.hourNum;
                    });

                    return (
                      <td
                        key={wd.dateISO}
                        className={`p-1 align-top min-h-[44px] border-r border-slate-100 dark:border-slate-800/40 last:border-r-0 ${
                          wd.isToday ? 'bg-purple-500/5 dark:bg-purple-900/10' : ''
                        }`}
                      >
                        {slotEvents.map(se => (
                          <div
                            key={se.id}
                            title={`${se.title} (${se.startTime}${se.endTime ? ' - ' + se.endTime : ''})`}
                            className={`p-1.5 rounded-xl border mb-1 transition-all shadow-2xs ${getOfficeStyle(se.sourceOffice)}`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono font-semibold opacity-80 mb-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                {se.startTime}
                              </span>
                              {se.endTime && <span>{se.endTime}</span>}
                            </div>
                            <div className="font-extrabold text-[11px] leading-tight line-clamp-2">
                              {se.title}
                            </div>
                            {se.subtitle && (
                              <div className="text-[9px] opacity-75 truncate mt-0.5">
                                {se.subtitle}
                              </div>
                            )}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
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

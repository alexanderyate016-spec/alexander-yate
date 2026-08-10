import React from 'react';
import { MasterState } from '../../../types/store';
import { OvalOfficeCalculations } from '../OvalOfficeCalculations';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

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

  // Get start of week (Monday)
  const day = currentDate.getDay(); // 0 is Sun, 1 is Mon...
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMon);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      dateISO: d.toISOString().split('T')[0],
      dayName: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'][i],
      dayNum: d.getDate(),
      isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    };
  });

  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  // Map events for each day
  const eventsByDayISO: Record<string, any[]> = {};
  weekDays.forEach(wd => {
    eventsByDayISO[wd.dateISO] = OvalOfficeCalculations.getUnifiedEventsForDate(state, wd.dateISO);
  });

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[320px]">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold text-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              CALENDARIO SEMANAL
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Vista por bloques horarios • Sincronizado
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToOffice('agenda')}
          className="flex items-center gap-1 font-bold text-xs text-purple-600 dark:text-purple-400 hover:underline"
        >
          <span>Agenda Completa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* WEEKLY BLOCK GRID */}
      <div className="my-3 overflow-x-auto custom-scrollbar">
        <table className="w-full text-xs border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="w-14 pb-2 font-mono text-[10px] text-slate-400 font-bold text-center">
                HORA
              </th>
              {weekDays.map(wd => (
                <th
                  key={wd.dateISO}
                  className={`pb-2 text-center font-bold transition-all ${
                    wd.isToday
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-[10px] opacity-70">{wd.dayName}</div>
                  <div className={`text-xs w-6 h-6 mx-auto rounded-full flex items-center justify-center mt-0.5 ${
                    wd.isToday ? 'bg-purple-600 text-white font-black' : ''
                  }`}>
                    {wd.dayNum}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => {
              const slotHour = parseInt(slot.split(':')[0], 10);

              return (
                <tr key={slot} className="border-t border-slate-100 dark:border-slate-800/60">
                  <td className="py-2 pr-2 font-mono text-[10px] text-slate-400 font-semibold text-center align-top">
                    {slot}
                  </td>

                  {weekDays.map(wd => {
                    const dayEvents = eventsByDayISO[wd.dateISO] || [];
                    // Find events matching this time slot window
                    const slotEvents = dayEvents.filter(evt => {
                      if (!evt.startTime) return false;
                      const h = parseInt(evt.startTime.split(':')[0], 10);
                      return h >= slotHour && h < slotHour + 2;
                    });

                    return (
                      <td key={wd.dateISO} className="py-1 px-1 align-top h-12 border-l border-slate-100 dark:border-slate-800/40">
                        {slotEvents.map(se => (
                          <div
                            key={se.id}
                            title={`${se.title} (${se.startTime || ''})`}
                            className="p-1 rounded-lg bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 text-purple-900 dark:text-purple-200 text-[10px] font-bold mb-1 truncate flex items-center gap-1 shadow-2xs"
                          >
                            <span className="shrink-0">{se.icon || '📌'}</span>
                            <span className="truncate">{se.title}</span>
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
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span>Resumen interactivo de clases, compromisos y tareas</span>
        <span className="font-mono text-[11px] font-bold text-slate-400">7 Días</span>
      </div>
    </div>
  );
};

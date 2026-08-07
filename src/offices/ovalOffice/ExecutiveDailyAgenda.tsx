import React from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { Plus, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { getTodayDateString } from '../../utils/dates';

interface Props {
  state: MasterState;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onNavigateToOffice: (officeKey: string) => void;
  onOpenQuickAdd: () => void;
  onDismissConflict?: (idA: string, idB: string) => void;
}

export const ExecutiveDailyAgenda: React.FC<Props> = ({
  state,
  selectedDate,
  onSelectDate,
  onNavigateToOffice,
  onOpenQuickAdd
}) => {
  const events = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);

  const formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Generate date quick tabs (today + next 6 days)
  const today = new Date();
  const dateTabs = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('es-CO', { weekday: 'short' });
    return {
      dateStr,
      dayName,
      dayNum: d.getDate(),
      isToday: dateStr === getTodayDateString()
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">
              Agenda Diaria Ejecutiva
            </h3>
            <p className="text-xs text-slate-500">
              Cronograma unificado de compromisos, clases y actividades.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {/* DATE PICKER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {dateTabs.map(tab => {
          const isSelected = tab.dateStr === selectedDate;
          return (
            <button
              key={tab.dateStr}
              onClick={() => onSelectDate(tab.dateStr)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex flex-col items-center min-w-[60px] transition-all capitalize ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] uppercase opacity-80">{tab.dayName}</span>
              <span className="text-sm font-bold">{tab.dayNum}</span>
            </button>
          );
        })}
      </div>

      {/* EVENTS CHRONOLOGY LIST */}
      <div className="space-y-3 pt-1">
        {events.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="font-medium capitalize">No hay eventos ni clases agendados para {formatDateDisplay(selectedDate)}.</p>
          </div>
        ) : (
          events.map(e => (
            <div
              key={e.id}
              className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 hover:border-purple-400 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-mono font-bold shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">
                      {e.startTime || 'Todo el día'} {e.endTime ? `- ${e.endTime}` : ''}
                    </span>
                    <span className="text-[10px] font-semibold bg-white border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                      {e.officeLabel}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {e.title}
                  </h4>
                  {e.subtitle && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {e.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {e.sourceOffice && (
                <button
                  onClick={() => onNavigateToOffice(e.sourceOffice!)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <span>Ver Detalle</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

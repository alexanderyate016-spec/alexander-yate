import React from 'react';
import { MasterState } from '../../types/store';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { CheckCircle2, Circle, Plus, ArrowRight } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onOpenQuickAddTaskModal: () => void;
  onOpenQuickJournalModal: () => void;
  onNavigateToOffice: (officeKey: string) => void;
}

export const ChecklistDiario: React.FC<Props> = ({
  state,
  selectedDate,
  onOpenQuickAddTaskModal,
  onOpenQuickJournalModal,
  onNavigateToOffice
}) => {
  const tasks = state.offices.vidaDiaria?.tasks || [];
  const habits = state.offices.vidaDiaria?.habits || [];

  const todayTasks = tasks.filter(t => t.date === selectedDate || !t.date);
  const pendingTasks = todayTasks.filter(t => t.status === 'pending');
  const completedTasks = todayTasks.filter(t => t.status === 'completed');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Checklist Diario
            </h3>
            <p className="text-xs text-slate-500">
              Tareas y hábitos ejecutivos del día.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuickAddTaskModal}
          className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl transition-all font-semibold text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Tarea</span>
        </button>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-2">
        {todayTasks.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
            No hay tareas registradas para esta fecha.
          </div>
        ) : (
          todayTasks.map(t => {
            const isDone = t.status === 'completed';
            return (
              <div
                key={t.id}
                onClick={() => DailyLifeStore.toggleTaskStatus(t.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700 hover:text-purple-600 shrink-0" />
                  )}
                  <span className={`text-xs font-medium truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {t.name}
                  </span>
                </div>

                {t.priority && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    t.priority === 'high'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* HABITS SECTION */}
      {habits.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <span>🏆</span> Hábitos Principales
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {habits.slice(0, 4).map(h => {
              const isLogged = Boolean(h.logs?.[selectedDate]);
              return (
                <div
                  key={h.id}
                  onClick={() => DailyLifeStore.toggleHabitLog(h.id, selectedDate)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isLogged
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                      : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700'
                  }`}
                >
                  <span className="truncate">{h.name}</span>
                  {isLogged ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">✓ Cumplido</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Marcar</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER BUTTON */}
      <div className="pt-2">
        <button
          onClick={() => onNavigateToOffice('vidaDiaria')}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          <span>Ir a Vida Diaria</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { MasterState } from '../../../types/store';
import { DailyLifeStore } from '../../dailyLife/DailyLifeStore';
import { CheckSquare, Plus, CheckCircle2, Circle, Award } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onOpenQuickAddTaskModal: () => void;
  onNavigateToOffice: (officeKey: string) => void;
}

export const DailyTasksAppleWidget: React.FC<Props> = ({
  state,
  selectedDate,
  onOpenQuickAddTaskModal,
  onNavigateToOffice
}) => {
  const dailyLife = state.offices.vidaDiaria;
  const tasks = dailyLife?.tasks || [];

  // Filter tasks for selected date or pending
  const todayTasks = tasks.filter(t => !t.date || t.date === selectedDate || t.status === 'pending');

  const totalCount = todayTasks.length;
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    DailyLifeStore.updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="liquid-glass-card p-6 flex flex-col justify-between min-h-[220px]">
      {/* HEADER ROW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-theme">
              Tareas de Hoy
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20">
              {completedCount} / {totalCount}
            </span>
            <button
              onClick={onOpenQuickAddTaskModal}
              className="p-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs"
              title="Nueva Tarea"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* TASK LIST OR CELEBRATION */}
      <div className="my-3 space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
        {isAllDone && totalCount > 0 ? (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-sm">¡Felicidades, Alex!</p>
              <p className="opacity-90">Completaste todas tus tareas de hoy.</p>
            </div>
          </div>
        ) : todayTasks.length > 0 ? (
          todayTasks.slice(0, 4).map(task => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.status)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none text-xs ${
                  isCompleted
                    ? 'bg-slate-100/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-tertiary-theme line-through'
                    : 'bg-white/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500/50 text-primary-theme'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-semibold truncate">{task.name}</span>
                </div>

                {task.priority && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-xs text-tertiary-theme">
            No hay tareas pendientes. Clic en + para agregar.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-secondary-theme">
        <span className="font-medium">Gestión Personal</span>
        <button
          onClick={() => onNavigateToOffice('vidaDiaria')}
          className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
        >
          Ver Todas ({tasks.length})
        </button>
      </div>
    </div>
  );
};

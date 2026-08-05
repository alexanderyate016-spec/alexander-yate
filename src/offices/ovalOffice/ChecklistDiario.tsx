import React from 'react';
import { MasterState } from '../../types/store';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { AcademicStore } from '../academic/AcademicStore';
import { CheckSquare, Square, Plus, Sparkles, Clock, Trash2, Calendar } from 'lucide-react';

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
  const journalEntries = state.offices.desarrolloPersonal?.journalEntries || [];

  const todayTasks = tasks.filter(t => t.date === selectedDate);
  const todayJournal = journalEntries.find(j => j.date === selectedDate);
  const journalCompleted = !!(todayJournal && (todayJournal.freeReflection || todayJournal.wordOfTheDay || todayJournal.philosophicalAnswer));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#030712]/60 backdrop-blur-2xl border border-white/15 p-6 sm:p-7 text-white shadow-2xl space-y-4 flex flex-col justify-between">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif font-extrabold text-base text-white tracking-wide">
            CHECKLIST DIARIO INTELIGENTE
          </h3>
        </div>

        <button
          onClick={onOpenQuickAddTaskModal}
          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Nueva Tarea
        </button>
      </div>

      {/* CHECKLIST ENGINE */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">

        {/* 1. FIXED DIARY REFLECTION CHECK ITEM */}
        <div
          onClick={onOpenQuickJournalModal}
          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
            journalCompleted 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
              : 'bg-white/5 border-white/10 hover:border-amber-400/40 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {journalCompleted ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-xs">Diario Personal & Reflexión Filosófica</div>
              <div className="text-[10px] text-slate-300">
                {journalCompleted ? 'Reflexión completada para hoy' : 'Pendiente: escribir entrada del día'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-400/20">
            Diario
          </span>
        </div>

        {/* 2. HABITS FOR TODAY */}
        {habits.map((habit) => {
          const isDone = !!habit.logs?.[selectedDate];
          return (
            <div
              key={habit.id}
              onClick={() => DailyLifeStore.toggleHabitLog(habit.id, selectedDate)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                  : 'bg-white/5 border-white/10 hover:border-amber-400/40 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="font-medium text-xs">{habit.name}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Hábito
              </span>
            </div>
          );
        })}

        {/* 3. TODAY TASKS */}
        {todayTasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                  : 'bg-white/5 border-white/10 hover:border-amber-400/40 text-slate-100'
              }`}
            >
              <div
                onClick={() => DailyLifeStore.toggleTaskStatus(task.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="font-medium text-xs">{task.title}</div>
                  {task.subtitle && <div className="text-[10px] text-slate-300">{task.subtitle}</div>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  task.priority === 'high' ? 'bg-rose-950/80 text-rose-300 border-rose-500/40' : 'bg-slate-900 text-slate-300 border-white/10'
                }`}>
                  {task.priority === 'high' ? 'Alta' : 'Normal'}
                </span>
                <button
                  onClick={() => DailyLifeStore.deleteTask(task.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-slate-300 font-mono">
        <span>{todayTasks.filter(t => t.status === 'pending').length} tareas pendientes</span>
        <button
          onClick={() => onNavigateToOffice('vidaDiaria')}
          className="text-amber-300 hover:underline font-bold text-[11px]"
        >
          Ver Oficina Vida Diaria →
        </button>
      </div>

    </div>
  );
};

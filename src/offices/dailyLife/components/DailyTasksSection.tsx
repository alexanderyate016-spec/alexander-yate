import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyTask } from '../../../types/store';
import { DailyLifeStore } from '../DailyLifeStore';
import {
  CheckSquare,
  Plus,
  Check,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

interface Props {
  tasks: DailyTask[];
  todayStr: string;
}

export const DailyTasksSection: React.FC<Props> = ({ tasks = [], todayStr }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  // Filter tasks for today or general pending tasks
  const todayTasks = tasks.filter(t => t.date === todayStr || !t.date);
  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalCount = todayTasks.length;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskName.trim()) return;

    if (editingTask) {
      DailyLifeStore.updateTask(editingTask.id, {
        name: taskName.trim(),
        priority
      });
      setEditingTask(null);
    } else {
      DailyLifeStore.addTask({
        name: taskName.trim(),
        priority,
        date: todayStr
      });
    }

    setTaskName('');
    setShowAddForm(false);
  };

  const handleToggle = (taskId: string) => {
    DailyLifeStore.toggleTaskStatus(taskId);
  };

  const handleDelete = (taskId: string) => {
    DailyLifeStore.deleteTask(taskId);
  };

  const handleOpenEdit = (task: DailyTask) => {
    setEditingTask(task);
    setTaskName(task.name);
    setPriority(task.priority || 'medium');
    setShowAddForm(true);
  };

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
            Alta
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            Media
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            Baja
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <h3 className="text-base font-semibold text-slate-100">
            Tareas de Hoy
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {completedCount}/{totalCount}
          </span>
        </div>

        {!showAddForm && (
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskName('');
              setPriority('medium');
              setShowAddForm(true);
            }}
            className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir tarea</span>
          </button>
        )}
      </div>

      {/* Quick Add / Edit Inline Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300">
              {editingTask ? 'Editar tarea' : '¿Qué tarea quieres realizar hoy?'}
            </span>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="Ej: Organizar escritorio, Lavar ropa, Revisar notas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1">Prioridad:</span>
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                          : p === 'medium'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-700 border-slate-500 text-slate-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!taskName.trim()}
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                >
                  {editingTask ? 'Actualizar' : 'Guardar Tarea'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Task List */}
      {todayTasks.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400 space-y-2">
          <p className="text-sm">No tienes tareas pendientes para hoy.</p>
          <button
            onClick={() => {
              setEditingTask(null);
              setTaskName('');
              setPriority('medium');
              setShowAddForm(true);
            }}
            className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir una tarea
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {todayTasks.map(task => {
            const isDone = task.status === 'completed';

            return (
              <motion.div
                key={task.id}
                layout
                className={`relative group rounded-2xl p-3.5 border transition-all duration-200 flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-400'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-indigo-500 text-white shadow-sm scale-105'
                        : 'border-2 border-slate-600 hover:border-indigo-400 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium block truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {getPriorityBadge(task.priority || 'medium')}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

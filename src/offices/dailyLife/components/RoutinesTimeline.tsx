import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RoutineItem, RoutineStep } from '../../../types/store';
import { DailyLifeStore } from '../DailyLifeStore';
import {
  Sun,
  Moon,
  Clock,
  Plus,
  Check,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface Props {
  routines: RoutineItem[];
  todayStr: string;
}

export const RoutinesTimeline: React.FC<Props> = ({ routines = [], todayStr }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [time, setTime] = useState('07:00');
  const [emoji, setEmoji] = useState('☀️');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [stepsInput, setStepsInput] = useState('');

  // Default seed sample routines if list is completely empty
  const displayRoutines = routines.length > 0 ? routines : [
    {
      id: 'rtn_morning_sample',
      name: 'Rutina de la Mañana',
      time: '06:30',
      timeOfDay: 'morning' as const,
      emoji: '☀️',
      isRecurring: true,
      completedToday: false,
      steps: [
        { id: 's1', title: 'Levantarme & estiramiento', completedToday: false },
        { id: 's2', title: 'Tomar un vaso de agua', completedToday: false },
        { id: 's3', title: 'Ducha y preparación', completedToday: false }
      ]
    },
    {
      id: 'rtn_night_sample',
      name: 'Rutina de la Noche',
      time: '22:30',
      timeOfDay: 'evening' as const,
      emoji: '🌙',
      isRecurring: true,
      completedToday: false,
      steps: [
        { id: 's4', title: 'Desconectar pantallas', completedToday: false },
        { id: 's5', title: 'Preparar ropa de mañana', completedToday: false },
        { id: 's6', title: 'Dormir temprano', completedToday: false }
      ]
    }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rawSteps = stepsInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const steps: RoutineStep[] = rawSteps.map(title => ({
      id: 'stp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title,
      completedToday: false
    }));

    DailyLifeStore.addRoutine({
      name: name.trim(),
      time,
      timeOfDay,
      emoji,
      steps,
      isRecurring: true
    });

    setName('');
    setTime('07:00');
    setStepsInput('');
    setShowAddModal(false);
  };

  const handleToggleRoutine = (routineId: string) => {
    DailyLifeStore.toggleRoutine(routineId);
  };

  const handleToggleStep = (routineId: string, stepId: string) => {
    DailyLifeStore.toggleRoutineStep(routineId, stepId);
  };

  const handleDelete = (routineId: string) => {
    DailyLifeStore.deleteRoutine(routineId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌅</span>
          <h3 className="text-base font-semibold text-slate-100">
            Mi Rutina
          </h3>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir rutina</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayRoutines.map(routine => {
          const isAllStepsDone =
            routine.steps && routine.steps.length > 0
              ? routine.steps.every(s => s.completedToday)
              : !!routine.completedToday;

          return (
            <div
              key={routine.id}
              className={`rounded-2xl p-4 border transition-all duration-200 space-y-3 ${
                isAllStepsDone
                  ? 'bg-slate-900/90 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{routine.emoji || '☀️'}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 truncate">
                      {routine.name}
                    </h4>
                    {routine.time && (
                      <span className="text-xs font-mono text-amber-400/90 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {routine.time}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRoutine(routine.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isAllStepsDone
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'border-2 border-slate-600 hover:border-emerald-400 text-transparent'
                    }`}
                    title={isAllStepsDone ? 'Marcar pendiente' : 'Marcar todo completado'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <button
                    onClick={() => handleDelete(routine.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded-lg"
                    title="Eliminar rutina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Steps checklist */}
              {routine.steps && routine.steps.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  {routine.steps.map(step => (
                    <div
                      key={step.id}
                      onClick={() => handleToggleStep(routine.id, step.id)}
                      className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                          step.completedToday
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 bg-slate-950 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span
                        className={`${
                          step.completedToday
                            ? 'line-through text-slate-500'
                            : 'text-slate-200'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Routine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-semibold text-slate-100">
                Nueva Rutina
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nombre de la rutina
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Rutina de Mañana, Antes de Dormir..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Momento del día
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={e => {
                      const val = e.target.value as any;
                      setTimeOfDay(val);
                      if (val === 'morning') setEmoji('☀️');
                      else if (val === 'afternoon') setEmoji('🌤️');
                      else setEmoji('🌙');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="morning">Mañana ☀️</option>
                    <option value="afternoon">Tarde 🌤️</option>
                    <option value="evening">Noche 🌙</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Hora estimada
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Pasos de la rutina (uno por línea)
                </label>
                <textarea
                  rows={3}
                  value={stepsInput}
                  onChange={e => setStepsInput(e.target.value)}
                  placeholder="Ej:&#10;Levantarme & estiramiento&#10;Tomar agua&#10;Ducha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-xl transition"
                >
                  Crear Rutina
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

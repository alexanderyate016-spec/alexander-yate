import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HabitItem } from '../../../types/store';
import { DailyLifeStore } from '../DailyLifeStore';
import { DailyLifeCalculations } from '../DailyLifeCalculations';
import {
  Sparkles,
  Plus,
  Check,
  Circle,
  Trash2,
  Edit2,
  Clock,
  Flame,
  X,
  Repeat
} from 'lucide-react';

interface Props {
  habits: HabitItem[];
  todayStr: string;
  userName?: string;
}

const EMOJI_OPTIONS = ['📖', '💧', '🏋️', '🧘', '🏃', '🥗', '🚶', '✍️', '🛌', '🍏', '💻', '🧠', '☕', '🎯'];

export const HabitsSection: React.FC<Props> = ({ habits = [], todayStr, userName = 'Alex' }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📖');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);

  const completedCount = habits.filter(h => h.logs && h.logs[todayStr]).length;
  const totalCount = habits.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  const handleOpenAdd = () => {
    setName('');
    setEmoji('📖');
    setFrequency('daily');
    setScheduledTime('');
    setIsRecurring(true);
    setEditingHabit(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (habit: HabitItem) => {
    setEditingHabit(habit);
    setName(habit.name);
    setEmoji(habit.emoji || '📖');
    setFrequency(habit.frequency || 'daily');
    setScheduledTime(habit.scheduledTime || '');
    setIsRecurring(habit.isRecurring !== false);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingHabit) {
      DailyLifeStore.updateHabit(editingHabit.id, {
        name: name.trim(),
        emoji,
        frequency,
        scheduledTime: scheduledTime || undefined,
        isRecurring
      });
    } else {
      DailyLifeStore.addHabit({
        name: name.trim(),
        emoji,
        color: '#10B981',
        frequency,
        scheduledTime: scheduledTime || undefined,
        isRecurring
      });
    }

    setShowAddModal(false);
    setEditingHabit(null);
  };

  const handleToggle = (habitId: string) => {
    DailyLifeStore.toggleHabitLog(habitId, todayStr);
  };

  const handleDelete = (habitId: string) => {
    DailyLifeStore.deleteHabit(habitId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h3 className="text-base font-semibold text-slate-100">
            Hábitos de Hoy
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {completedCount}/{totalCount}
          </span>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir hábito</span>
        </button>
      </div>

      {/* Finch Warm Reward Banner when all completed */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-emerald-900/40 to-teal-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl shrink-0">
            🎉
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              ¡Día Victorioso!
            </div>
            <p className="text-sm font-medium text-emerald-100">
              ¡Felicidades, {userName}! Completaste todos tus hábitos de hoy.
            </p>
          </div>
        </motion.div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400 space-y-2">
          <p className="text-sm">No tienes hábitos registrados aún.</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Crear mi primer hábito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {habits.map(habit => {
            const isDone = !!(habit.logs && habit.logs[todayStr]);
            const streak = DailyLifeCalculations.calculateHabitStreak(habit, todayStr);

            return (
              <motion.div
                key={habit.id}
                layout
                className={`relative group rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-900/90 border-emerald-500/30 text-slate-300'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                        : 'border-2 border-slate-600 hover:border-emerald-400 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  {/* Habit info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">{habit.emoji || '✨'}</span>
                      <span
                        className={`text-sm font-medium truncate transition ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      {habit.scheduledTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {habit.scheduledTime}
                        </span>
                      )}
                      {streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-amber-400 font-semibold">
                          <Flame className="w-3 h-3" />
                          {streak}d
                        </span>
                      )}
                      {habit.isRecurring === false && (
                        <span className="text-slate-500 text-[10px]">Único</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(habit)}
                    className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
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

      {/* Add / Edit Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-semibold text-slate-100">
                {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
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
                  Nombre del hábito
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Leer 20 minutos, Tomar agua..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Icono / Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition ${
                        emoji === em
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-110'
                          : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Frecuencia
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="daily">Todos los días</option>
                    <option value="weekdays">Lunes a Viernes</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Hora estimada (opcional)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">
                      Hábito recurrente
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Se mantendrá activo en tus próximos días
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
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
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl transition"
                >
                  {editingHabit ? 'Actualizar' : 'Crear Hábito'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

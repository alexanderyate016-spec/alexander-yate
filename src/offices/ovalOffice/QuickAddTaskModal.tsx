import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export const QuickAddTaskModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedDate
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [hasTime, setHasTime] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    DailyLifeStore.addTask({
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      date: selectedDate,
      startTime: hasTime ? startTime : undefined,
      endTime: hasTime ? endTime : undefined
    });

    setName('');
    setDescription('');
    setHasTime(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h3 className="font-bold text-base text-slate-900">
              Nueva Tarea / Pendiente
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la tarea *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Revisar informe presupuestal..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción opcional
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles adicionales..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-4">
                <input
                  type="checkbox"
                  checked={hasTime}
                  onChange={e => setHasTime(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">Asignar hora</span>
              </label>
            </div>
          </div>

          {hasTime && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Guardar Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

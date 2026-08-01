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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0A192F] text-white border-2 border-[#C5A059] max-w-md w-full p-6 shadow-2xl space-y-4 rounded-sm">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#C5A059]/40 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif font-bold text-base text-white">
              Nueva Tarea / Pendiente Ejecutivo
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-white/80 font-bold block">Nombre de la Tarea / Pendiente</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej. Revisar informe presupuestal..."
              className="w-full p-2.5 bg-[#162A45] border border-[#D1C7B7]/40 text-white focus:border-[#C5A059] focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/80 font-bold block">Descripción / Detalles (Opcional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Contexto adicional o instrucciones..."
              className="w-full p-2.5 bg-[#162A45] border border-[#D1C7B7]/40 text-white focus:border-[#C5A059] focus:outline-none h-16"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/80 font-bold block">Prioridad</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full p-2.5 bg-[#162A45] border border-[#D1C7B7]/40 text-white focus:border-[#C5A059] focus:outline-none"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta (Urgente)</option>
            </select>
          </div>

          <div className="p-3 bg-[#162A45] border border-[#D1C7B7]/20 space-y-2">
            <label className="flex items-center gap-2 font-bold cursor-pointer text-amber-200">
              <input
                type="checkbox"
                checked={hasTime}
                onChange={e => setHasTime(e.target.checked)}
                className="accent-[#C5A059]"
              />
              Assignar Horario Fijo (Irá directamente al Horario Ejecutivo)
            </label>

            {hasTime && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D1C7B7]/10">
                <div>
                  <label className="text-white/70 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-2 bg-[#0A192F] border border-[#D1C7B7]/30 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2 bg-[#0A192F] border border-[#D1C7B7]/30 text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#C5A059]/40 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/10 text-white/80 border border-white/20 uppercase font-bold tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A192F] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              <Check className="w-4 h-4" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

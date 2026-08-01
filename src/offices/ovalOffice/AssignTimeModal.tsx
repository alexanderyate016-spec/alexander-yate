import React, { useState } from 'react';
import { AgendaItem } from './OvalOfficeCalculations';
import { X, Clock, Check } from 'lucide-react';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: AgendaItem | null;
  selectedDate: string;
}

export const AssignTimeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  item,
  selectedDate
}) => {
  if (!isOpen || !item) return null;

  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (item.sourceOffice === 'vidaDiaria') {
      if (item.type === 'task') {
        const rawTask = item.rawObject;
        DailyLifeStore.addTask({
          name: rawTask.name,
          description: rawTask.description,
          priority: rawTask.priority || 'medium',
          date: rawTask.date || selectedDate,
          startTime: startTime,
          endTime: endTime
        });
        DailyLifeStore.deleteTask(rawTask.id);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0A192F] text-white border-2 border-[#C5A059] max-w-md w-full p-6 shadow-2xl space-y-4 rounded-sm">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#C5A059]/40 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif font-bold text-base text-white">
              Asignar Horario Ejecutivo
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-white/60 font-sans uppercase tracking-wider">
            Elemento Seleccionado:
          </div>
          <div className="p-2.5 bg-[#162A45] border border-[#D1C7B7]/20 font-serif font-bold text-amber-200 text-sm">
            {item.title}
          </div>
          <p className="text-[11px] text-[#C5A059] font-sans italic">
            Al asignar una hora, este elemento dejará la Agenda y pasará automáticamente al Horario Ejecutivo.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-white/80 font-bold block">Hora Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2 bg-[#162A45] border border-[#D1C7B7]/40 text-white font-mono focus:border-[#C5A059] focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-white/80 font-bold block">Hora Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2 bg-[#162A45] border border-[#D1C7B7]/40 text-white font-mono focus:border-[#C5A059] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#C5A059]/40 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/10 text-white/80 border border-white/20 text-xs font-bold uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              <Check className="w-4 h-4" /> Confirmar & Mover
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

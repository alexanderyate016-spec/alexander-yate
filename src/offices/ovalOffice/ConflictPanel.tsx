import React from 'react';
import { UnifiedExecutiveEvent } from '../../types/store';
import { AlertOctagon, Clock, Calendar, Check, X } from 'lucide-react';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';

interface Props {
  conflicts: Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }>;
  onDismissConflict: (idA: string, idB: string) => void;
}

export const ConflictPanel: React.FC<Props> = ({
  conflicts,
  onDismissConflict
}) => {
  if (conflicts.length === 0) return null;

  const handleResolveTimeShift = (evt: UnifiedExecutiveEvent) => {
    // Shift event B forward by 1 hour
    if (evt.sourceOffice === 'vidaDiaria') {
      const task = DailyLifeStore.getData().tasks.find(t => t.id === evt.rawObject?.id);
      if (task && task.startTime) {
        const [h, m] = task.startTime.split(':').map(Number);
        const newStart = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        DailyLifeStore.addTask({
          ...task,
          startTime: newStart
        });
        DailyLifeStore.deleteTask(task.id);
      }
    }
    onDismissConflict(evt.id, evt.id);
  };

  return (
    <div className="bg-rose-950/40 border-2 border-rose-500/60 p-4 shadow-md space-y-3 rounded-sm text-white">
      <div className="flex items-center gap-2 border-b border-rose-500/30 pb-2">
        <AlertOctagon className="w-5 h-5 text-rose-400" />
        <div>
          <h3 className="font-serif font-bold text-sm tracking-wide text-rose-200">
            Panel de Solución de Conflictos de Horario
          </h3>
          <p className="text-[10px] text-rose-300/80 font-sans">
            Se han detectado traslapes de eventos en el Horario Ejecutivo
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {conflicts.map(({ eventA, eventB }, idx) => (
          <div
            key={`${eventA.id}_${eventB.id}_${idx}`}
            className="p-3 bg-[#0A192F] border border-rose-500/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          >
            <div className="space-y-1 text-xs font-sans">
              <div className="font-serif font-bold text-rose-300">
                Conflicto entre dos eventos programados:
              </div>
              <div className="flex flex-wrap items-center gap-2 text-white">
                <span className="font-bold text-amber-300">1. {eventA.title}</span> ({eventA.startTime} - {eventA.endTime})
                <span className="text-white/40">vs</span>
                <span className="font-bold text-blue-300">2. {eventB.title}</span> ({eventB.startTime} - {eventB.endTime})
              </div>
            </div>

            {/* RESOLUTION OPTIONS */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[10px] font-sans">
              <button
                onClick={() => handleResolveTimeShift(eventB)}
                className="px-2.5 py-1 bg-[#162A45] hover:bg-rose-900 border border-rose-400/40 text-rose-200 font-bold uppercase tracking-wider transition-colors"
              >
                Mover 1h
              </button>

              <button
                onClick={() => onDismissConflict(eventA.id, eventB.id)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold uppercase tracking-wider transition-colors"
              >
                Mantener Ambos
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

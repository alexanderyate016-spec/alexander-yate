import React from 'react';
import { ExecutiveSuggestion } from './OvalOfficeCalculations';
import { Lightbulb, Check, X } from 'lucide-react';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';

interface Props {
  suggestions: ExecutiveSuggestion[];
  onDismissSuggestion: (id: string) => void;
}

export const SuggestionsPanel: React.FC<Props> = ({
  suggestions,
  onDismissSuggestion
}) => {
  if (suggestions.length === 0) return null;

  const handleApprove = (s: ExecutiveSuggestion) => {
    if (s.actionType === 'assign_task_time' && s.actionPayload) {
      // Find task and set time
      const task = DailyLifeStore.getData().tasks.find(t => t.id === s.actionPayload.taskId);
      if (task) {
        DailyLifeStore.addTask({
          ...task,
          startTime: s.actionPayload.startTime,
          endTime: s.actionPayload.endTime
        });
        DailyLifeStore.deleteTask(task.id);
      }
    } else if (s.actionType === 'schedule_study' || s.actionType === 'take_rest') {
      DailyLifeStore.addTimePlan({
        title: s.actionPayload.title,
        category: s.actionType === 'schedule_study' ? 'study' : 'rest',
        date: s.actionPayload.date,
        startTime: s.actionPayload.startTime,
        durationMinutes: 120,
        color: s.actionType === 'schedule_study' ? '#3B82F6' : '#10B981',
        description: s.description
      });
    }

    onDismissSuggestion(s.id);
  };

  return (
    <div className="bg-[#0A192F] text-white border-2 border-[#C5A059] p-4 shadow-md space-y-3 rounded-sm">
      <div className="flex items-center gap-2 border-b border-[#C5A059]/30 pb-2">
        <Lightbulb className="w-5 h-5 text-[#C5A059]" />
        <div>
          <h3 className="font-serif font-bold text-sm tracking-wide text-white">
            Sugerencias de Inteligencia Ejecutiva
          </h3>
          <p className="text-[10px] text-[#C5A059]/80 font-sans">
            Optimización del tiempo y balance operativo • Aprobar o Rechazar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map(s => (
          <div
            key={s.id}
            className="p-3 bg-[#162A45] border border-[#D1C7B7]/30 flex flex-col justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="font-serif font-bold text-xs text-amber-200">{s.title}</div>
              <p className="text-xs text-white/80 font-sans">{s.description}</p>
            </div>

            {/* ACTION BUTTONS ONLY: APPROVE / REJECT */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D1C7B7]/10">
              <button
                onClick={() => onDismissSuggestion(s.id)}
                className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Rechazar
              </button>

              <button
                onClick={() => handleApprove(s)}
                className="px-3 py-1 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A192F] text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" /> Aprobar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

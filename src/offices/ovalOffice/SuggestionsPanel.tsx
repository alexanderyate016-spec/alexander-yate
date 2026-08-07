import React from 'react';
import { ExecutiveSuggestion } from './OvalOfficeCalculations';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface Props {
  suggestions: ExecutiveSuggestion[];
  onDismissSuggestion: (id: string) => void;
}

export const SuggestionsPanel: React.FC<Props> = ({
  suggestions,
  onDismissSuggestion
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4.5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wide">
          <span className="text-base">💡</span>
          <span>Sugerencias de Inteligencia Executive ({suggestions.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map(s => (
          <div
            key={s.id}
            className="p-3.5 bg-white border border-purple-200 rounded-xl space-y-2 relative shadow-xs"
          >
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                {s.title}
              </h4>
              <button
                onClick={() => onDismissSuggestion(s.id)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Descartar sugerencia"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

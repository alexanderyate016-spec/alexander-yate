import React, { useState } from 'react';
import { Coffee, Sparkles, X, RefreshCw, Quote } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const QUOTES = [
  "El liderazgo no es una posición o un título, es una decisión diaria de impactar positivamente.",
  "Planifica hoy los mejores recuerdos de mañana.",
  "La disciplina constante vence al talento ocasional.",
  "En la Casa Blanca Personal, las grandes decisiones se toman con calma y visión clara.",
  "El tiempo bien administrado es la verdadera riqueza del ejecutivo.",
  "Cada día es un lienzo para escribir tu propia historia de excelencia.",
  "La excelencia no es un acto, es un hábito sostenido.",
  "Consistencia, enfoque y serenidad ante los desafíos del día."
];

export const MugQuoteModal: React.FC<Props> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  // Pick quote based on day of year to remain persistent, with option to cycle
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const [quoteIndex, setQuoteIndex] = useState<number>(dayOfYear % QUOTES.length);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329]/95 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-800">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-200">
              Reflexión Ejecutiva del Día
            </h3>
            <p className="text-xs text-slate-700">
              Café Casa Blanca • {userName}
            </p>
          </div>
        </div>

        <div className="my-6 p-5 rounded-xl bg-white border border-amber-500/20 relative">
          <Quote className="w-8 h-8 text-amber-500/20 absolute top-3 left-3" />
          <p className="text-sm font-serif italic text-amber-100 leading-relaxed relative z-10 pl-4">
            "{QUOTES[quoteIndex]}"
          </p>
          <div className="mt-3 text-right text-xs font-mono text-amber-400 font-semibold">
            — Casa Blanca Personal
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            onClick={handleNextQuote}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-amber-800 font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Otra reflexión
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

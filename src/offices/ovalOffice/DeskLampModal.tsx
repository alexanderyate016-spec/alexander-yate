import React from 'react';
import { Sun, Moon, Sparkles, X, Lightbulb } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lampMode: 'claro' | 'oscuro' | 'auto';
  onSelectMode: (mode: 'claro' | 'oscuro' | 'auto') => void;
}

export const LampModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lampMode,
  onSelectMode
}) => {
  if (!isOpen) return null;

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
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-amber-200">
              Lámpara de Escritorio
            </h3>
            <p className="text-xs text-slate-700">
              Ajusta el modo de iluminación ambiental del Despacho Oval
            </p>
          </div>
        </div>

        <div className="space-y-3 my-5">
          <button
            onClick={() => {
              onSelectMode('claro');
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              lampMode === 'claro'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-800" />
              <div className="text-left">
                <span className="font-bold text-sm block">Modo Claro</span>
                <span className="text-[11px] text-slate-500 block">Luz de escritorio cálida e intensa</span>
              </div>
            </div>
            {lampMode === 'claro' && <span className="text-xs text-amber-800 font-bold">Activo</span>}
          </button>

          <button
            onClick={() => {
              onSelectMode('oscuro');
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              lampMode === 'oscuro'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-300" />
              <div className="text-left">
                <span className="font-bold text-sm block">Modo Oscuro</span>
                <span className="text-[11px] text-slate-500 block">Ambiente nocturno tenue de alta concentración</span>
              </div>
            </div>
            {lampMode === 'oscuro' && <span className="text-xs text-amber-800 font-bold">Activo</span>}
          </button>

          <button
            onClick={() => {
              onSelectMode('auto');
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              lampMode === 'auto'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <div className="text-left">
                <span className="font-bold text-sm block">Modo Automático</span>
                <span className="text-[11px] text-slate-500 block">Sincronizado dinámicamente con la hora solar local</span>
              </div>
            </div>
            {lampMode === 'auto' && <span className="text-xs text-amber-800 font-bold">Activo</span>}
          </button>
        </div>

        <div className="text-[11px] text-slate-500 text-center border-t border-slate-200 pt-3 italic">
          El despacho adapta sus reflejos y tonos de sombra según el modo seleccionado.
        </div>
      </div>
    </div>
  );
};

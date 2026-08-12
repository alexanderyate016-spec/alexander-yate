import React from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalCalculations } from '../MedicalCalculations';
import { MedicalStore } from '../MedicalStore';
import { Droplet, Plus, ChevronRight } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
  onOpenDetails?: () => void;
}

export const HydrationAppleWidget: React.FC<Props> = ({ data, todayStr, onOpenDetails }) => {
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const targetLiters = metrics.targetWater || 2.0;
  const currentLiters = metrics.hydrationLiters || 0;
  const fillPct = metrics.hydrationPct || 0;

  const handleQuickAdd = (ml: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    MedicalStore.addWaterIntake(todayStr, ml, `${ml} ml`, time);
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div 
          onClick={onOpenDetails} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl">
            <Droplet className="w-5 h-5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              💧 Hidratación <span className="text-[10px] text-slate-400 font-mono font-normal">Hoy</span>
            </h3>
            <p className="text-[11px] text-slate-400">Control de consumo de agua</p>
          </div>
        </div>

        <button
          onClick={onOpenDetails}
          className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-0.5"
        >
          Detalle <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* DYNAMIC BOTTLE PREVIEW & STATS */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div>
          <div className="text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-1.5">
            <span>{currentLiters.toFixed(1)} L</span>
            <span className="text-sm font-bold text-slate-400">/ {targetLiters.toFixed(1)} L</span>
          </div>

          <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5">
            {fillPct}% completado
          </div>

          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {metrics.remainingWaterMl > 0
              ? `Faltan ${(metrics.remainingWaterMl / 1000).toFixed(1)} L para la meta`
              : '🎉 ¡Meta diaria alcanzada!'}
          </div>
        </div>

        {/* Dynamic Water Bottle Graphic */}
        <div 
          onClick={onOpenDetails}
          className="w-14 h-24 rounded-2xl bg-slate-800/80 border-2 border-cyan-500/40 p-1 relative flex flex-col justify-end overflow-hidden cursor-pointer shadow-inner shrink-0 group-hover:border-cyan-400 transition-all"
        >
          {/* Bottle cap */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-cyan-400 rounded-b-sm" />

          {/* Water liquid with wave animation */}
          <div 
            className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 rounded-xl transition-all duration-700 relative overflow-hidden"
            style={{ height: `${Math.max(8, Math.min(100, fillPct))}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>

          {/* Percentage overlay */}
          <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-[11px] text-white drop-shadow-md">
            {fillPct}%
          </div>
        </div>
      </div>

      {/* QUICK ADD BUTTONS */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-800 mt-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          + Toma rápida:
        </span>
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none">
          {[
            { ml: 250, label: '+250ml' },
            { ml: 500, label: '+500ml' },
            { ml: 1000, label: '+1 L' }
          ].map(btn => (
            <button
              key={btn.ml}
              onClick={(e) => handleQuickAdd(btn.ml, e)}
              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-mono font-bold rounded-xl transition-all border border-cyan-500/30 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" /> {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

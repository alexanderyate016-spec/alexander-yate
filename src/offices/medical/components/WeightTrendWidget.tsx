import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { MedicalCalculations } from '../MedicalCalculations';
import { GlassPanel, ExecutiveButton, ExecutiveInput } from '../../../components/executive';
import { Scale, TrendingUp, TrendingDown, Minus, Plus, Activity } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const WeightTrendWidget: React.FC<Props> = ({ data, todayStr }) => {
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const records = [...(data.healthRecords || [])]
    .filter(r => r.weightKg !== undefined && r.weightKg !== null && r.weightKg > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const [inputWeight, setInputWeight] = useState<number | ''>('');

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputWeight === '') return;
    MedicalStore.addHealthRecord({
      date: todayStr,
      weightKg: Number(inputWeight)
    });
    setInputWeight('');
  };

  return (
    <GlassPanel accentColor="rose" padding="lg" className="space-y-6 bg-gradient-to-br from-[#1C0A15]/90 to-[#2A0E1C]/80 border-rose-500/30">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-2xl text-rose-300 shadow-lg shadow-rose-950/50">
            <Scale className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white tracking-wide">
              Control e Historial de Peso Corporal
            </h3>
            <p className="text-xs text-rose-200/80 font-sans">
              Seguimiento de tendencia, peso máximo, mínimo y promedio histórico
            </p>
          </div>
        </div>
      </div>

      {/* METRICS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block">Peso Actual</span>
          <p className="text-2xl font-bold font-mono text-white">
            {metrics.weight !== null ? `${metrics.weight} kg` : 'Sin datos'}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-200">
            {metrics.weightTrend === 'up' && <span className="text-amber-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> Sube</span>}
            {metrics.weightTrend === 'down' && <span className="text-emerald-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> Baja</span>}
            {metrics.weightTrend === 'stable' && <span className="text-slate-700 flex items-center gap-0.5"><Minus className="w-3 h-3" /> Estabilizado</span>}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">Máximo</span>
          <p className="text-2xl font-bold font-mono text-white">
            {metrics.maxWeight !== null ? `${metrics.maxWeight} kg` : 'N/R'}
          </p>
          <span className="text-[10px] text-slate-500">Pico más alto</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">Mínimo</span>
          <p className="text-2xl font-bold font-mono text-white">
            {metrics.minWeight !== null ? `${metrics.minWeight} kg` : 'N/R'}
          </p>
          <span className="text-[10px] text-slate-500">Mínimo registrado</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">Promedio</span>
          <p className="text-2xl font-bold font-mono text-white">
            {metrics.avgWeight !== null ? `${metrics.avgWeight} kg` : 'N/R'}
          </p>
          <span className="text-[10px] text-slate-500">Promedio de registros</span>
        </div>
      </div>

      {/* VISUAL CHART / BARS */}
      {records.length > 0 && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            Evolución de Registros Físicos
          </h4>

          <div className="h-32 flex items-end gap-2 pt-4 px-2 overflow-x-auto">
            {records.slice(-10).map((r, idx) => {
              const maxVal = metrics.maxWeight || 100;
              const minVal = (metrics.minWeight || 50) - 5;
              const range = Math.max(10, maxVal - minVal);
              const pct = Math.min(100, Math.max(15, (((r.weightKg || 0) - minVal) / range) * 100));

              return (
                <div key={r.id || idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono font-bold text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {r.weightKg}k
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-24 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${pct}%` }}
                      className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 truncate max-w-[40px]">
                    {r.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FORM TO REGISTER WEIGHT */}
      <form onSubmit={handleSaveWeight} className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-rose-400" /> Registrar Pesaje del Día
        </h4>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <ExecutiveInput
              label="Peso Corporal (kg)"
              type="number"
              step="0.1"
              placeholder="Ej: 73.5"
              value={inputWeight}
              onChange={e => setInputWeight(e.target.value === '' ? '' : Number(e.target.value))}
              accentColor="rose"
              required
            />
          </div>
          <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
            Guardar Pesaje
          </ExecutiveButton>
        </div>
      </form>
    </GlassPanel>
  );
};

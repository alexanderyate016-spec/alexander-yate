import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalCalculations } from '../MedicalCalculations';
import { MedicalStore } from '../MedicalStore';
import { Scale, Plus, TrendingDown, TrendingUp, Minus, CheckCircle2 } from 'lucide-react';
import { ExecutiveInput } from '../../../components/executive';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
  onOpenDetails?: () => void;
}

export const WeightAppleWidget: React.FC<Props> = ({ data, todayStr, onOpenDetails }) => {
  const [showModal, setShowModal] = useState(false);
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  
  const [weightKg, setWeightKg] = useState<number>(metrics.weight || 70.2);
  const [notes, setNotes] = useState('');

  const currentWeight = metrics.weight || 70.2;
  const prevWeight = metrics.prevWeight;

  let deltaStr = '';
  let isDown = false;
  let isUp = false;

  if (prevWeight !== null && prevWeight !== undefined) {
    const diff = Number((currentWeight - prevWeight).toFixed(1));
    if (diff < 0) {
      deltaStr = `↓ ${Math.abs(diff)} kg`;
      isDown = true;
    } else if (diff > 0) {
      deltaStr = `↑ ${diff} kg`;
      isUp = true;
    } else {
      deltaStr = '= 0.0 kg';
    }
  }

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || weightKg <= 0) return;

    MedicalStore.addHealthRecord({
      date: todayStr,
      weightKg,
      notes: notes.trim() || undefined
    });

    setShowModal(false);
    setNotes('');
  };

  // Sparkline calculation
  const weightRecords = (data.healthRecords || [])
    .filter(r => r.weightKg && r.weightKg > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  const svgWidth = 120;
  const svgHeight = 40;
  let pointsStr = '';

  if (weightRecords.length > 1) {
    const weights = weightRecords.map(r => r.weightKg as number);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const range = Math.max(0.5, maxW - minW);

    pointsStr = weightRecords.map((item, idx) => {
      const x = (idx / (weightRecords.length - 1)) * svgWidth;
      const y = svgHeight - (((item.weightKg as number) - minW) / range) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div 
          onClick={onOpenDetails} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
            <Scale className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              ⚖️ Peso Corporal
            </h3>
            <p className="text-[11px] text-slate-400">Control de peso & evolución</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-bold transition-all border border-amber-500/30 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Pesarse
        </button>
      </div>

      {/* MAIN DISPLAY & SPARKLINE */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div>
          <div className="text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-1.5">
            <span>{currentWeight}</span>
            <span className="text-sm font-bold text-amber-400">kg</span>
          </div>

          {deltaStr ? (
            <div className={`text-xs font-mono font-bold flex items-center gap-1 mt-1 ${
              isDown ? 'text-emerald-400' : isUp ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {isDown && <TrendingDown className="w-3.5 h-3.5" />}
              {isUp && <TrendingUp className="w-3.5 h-3.5" />}
              {!isDown && !isUp && <Minus className="w-3.5 h-3.5" />}
              <span>{deltaStr} respecto al anterior</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono mt-1">Primer registro de peso</div>
          )}
        </div>

        {/* SVG Sparkline */}
        {pointsStr ? (
          <div className="w-28 h-10 shrink-0">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsStr}
              />
            </svg>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 font-mono italic">Sin historial</div>
        )}
      </div>

      {/* QUICK LOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" /> Registrar Peso Corporal
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-3">
              <ExecutiveInput
                label="Peso Corporal (kg) *"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
                icon={<Scale className="w-4 h-4 text-amber-400" />}
                required
              />

              <ExecutiveInput
                label="Notas opcionales"
                placeholder="Ej: Medición en ayunas..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Peso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

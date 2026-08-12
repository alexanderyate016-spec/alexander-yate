import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalCalculations } from '../MedicalCalculations';
import { MedicalStore } from '../MedicalStore';
import { Heart, Plus, TrendingUp, TrendingDown, Minus, Clock, CheckCircle2 } from 'lucide-react';
import { ExecutiveInput } from '../../../components/executive';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
  onOpenDetails?: () => void;
}

export const HeartRateWidget: React.FC<Props> = ({ data, todayStr, onOpenDetails }) => {
  const [showModal, setShowModal] = useState(false);
  const [bpm, setBpm] = useState<number>(72);
  const [context, setContext] = useState<'reposo' | 'ejercicio' | 'post_ejercicio' | 'general'>('reposo');
  const [notes, setNotes] = useState('');

  const metrics = MedicalCalculations.getHeartRateMetrics(data);

  const handleSaveHeartRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpm || bpm <= 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    MedicalStore.addHeartRateLog({
      date: todayStr,
      time: timeStr,
      bpm,
      context,
      notes: notes.trim() || undefined
    });

    setShowModal(false);
    setNotes('');
  };

  // Generate SVG path for trendline
  const history = metrics.history.slice().reverse(); // Chronological
  const svgWidth = 120;
  const svgHeight = 40;
  let pointsStr = '';

  if (history.length > 1) {
    const bpmValues = history.map(h => h.bpm);
    const minBpm = Math.min(...bpmValues) - 5;
    const maxBpm = Math.max(...bpmValues) + 5;
    const range = Math.max(1, maxBpm - minBpm);

    pointsStr = history.map((item, idx) => {
      const x = (idx / (history.length - 1)) * svgWidth;
      const y = svgHeight - ((item.bpm - minBpm) / range) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-rose-500/40 transition-all">
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-600/20 transition-all" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div 
          onClick={onOpenDetails} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl">
            <Heart className="w-5 h-5 animate-pulse text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              ❤️ Frecuencia Cardíaca
            </h3>
            <p className="text-[11px] text-slate-400">Pulsaciones por minuto</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Medir
        </button>
      </div>

      {/* MAIN DISPLAY & TREND SPARKLINE */}
      <div className="flex items-center justify-between gap-4 py-2">
        <div>
          <div className="text-3xl font-black font-mono text-white tracking-tight flex items-baseline gap-1.5">
            <span>{metrics.latestBpm ? metrics.latestBpm : '--'}</span>
            <span className="text-sm font-bold text-rose-400">BPM</span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
            {metrics.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-amber-400" />}
            {metrics.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
            {metrics.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span>
              {metrics.context ? `Medición en ${metrics.context}` : 'Normal en reposo'}
            </span>
          </div>
        </div>

        {/* SVG Sparkline */}
        {pointsStr ? (
          <div className="w-28 h-10 shrink-0">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <polyline
                fill="none"
                stroke="#F43F5E"
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
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Registrar Frecuencia Cardíaca
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHeartRate} className="space-y-3">
              <ExecutiveInput
                label="Frecuencia Cardíaca (BPM) *"
                type="number"
                min="30"
                max="220"
                value={bpm}
                onChange={e => setBpm(Number(e.target.value))}
                icon={<Heart className="w-4 h-4 text-rose-400" />}
                required
              />

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Contexto de la Medición</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'reposo', label: 'Reposo / Normal' },
                    { id: 'ejercicio', label: 'Durante Ejercicio' },
                    { id: 'post_ejercicio', label: 'Recuperación' },
                    { id: 'general', label: 'Medición General' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContext(item.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        context === item.id
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <ExecutiveInput
                label="Notas opcionales"
                placeholder="Ej: Medido con oxímetro..."
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
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Medición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

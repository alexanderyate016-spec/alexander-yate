import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalCalculations, formatMinutesToText } from '../MedicalCalculations';
import { MedicalStore } from '../MedicalStore';
import { Moon, Sunrise, Sunset, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { ExecutiveInput } from '../../../components/executive';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
  onOpenDetails?: () => void;
}

export const SleepAppleWidget: React.FC<Props> = ({ data, todayStr, onOpenDetails }) => {
  const [showModal, setShowModal] = useState(false);
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const todayRec = metrics.todaySleepRecord;

  const [bedTime, setBedTime] = useState(todayRec?.bedTime || '23:30');
  const [wakeTime, setWakeTime] = useState(todayRec?.wakeTime || '07:00');
  const [notes, setNotes] = useState(todayRec?.notes || '');

  const targetHours = data.sleepTargetHours || 8.0;
  const totalMins = metrics.totalTodaySleepMins || 450;
  const totalHours = Number((totalMins / 60).toFixed(1));
  const sleepPct = Math.min(100, Math.round((totalHours / targetHours) * 100));

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    MedicalStore.saveSleepRecord({
      date: todayStr,
      bedTime,
      wakeTime,
      notes: notes.trim() || undefined
    });
    setShowModal(false);
  };

  // Recent 5 days sleep history
  const recentSleep = (data.sleepRecords || []).slice(-5).reverse();

  // SVG Ring calculation
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (sleepPct / 100) * circumference;

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-all">
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div 
          onClick={onOpenDetails} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
            <Moon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              😴 Sueño <span className="text-[10px] text-slate-400 font-mono font-normal">Anoche</span>
            </h3>
            <p className="text-[11px] text-slate-400">Descanso & Recuperación</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-500/30 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Registrar
        </button>
      </div>

      {/* MAIN STATS & RING */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div>
          <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1.5">
            <span>{formatMinutesToText(totalMins)}</span>
            <span className="text-xs text-slate-400 font-normal">/ {targetHours}h meta</span>
          </div>

          <div className="text-xs font-bold text-indigo-400 font-mono mt-0.5">
            {sleepPct}% de la meta ({totalHours}h / {targetHours}h)
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono mt-2 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-indigo-400" /> {todayRec?.bedTime || '23:30'}
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-400" /> {todayRec?.wakeTime || '07:00'}
            </span>
          </div>
        </div>

        {/* Ring Progress */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
              stroke="#1E1B4B"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="url(#indigoGradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <defs>
              <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-white">
            {sleepPct}%
          </div>
        </div>
      </div>

      {/* RECENT SLEEP HISTORY BARS */}
      {recentSleep.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Últimos Días
          </span>
          <div className="flex items-center justify-between gap-1">
            {recentSleep.map(rec => {
              const recMins = rec.durationMinutes || 420;
              const recHours = (recMins / 60).toFixed(1);
              const dayName = new Date(rec.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' });
              return (
                <div key={rec.id} className="flex-1 text-center p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="text-[10px] font-bold uppercase text-slate-400">{dayName}</div>
                  <div className="text-xs font-mono font-bold text-indigo-300">{recHours}h</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK LOG SLEEP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" /> Registrar Horas de Sueño
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSleep} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ExecutiveInput
                  label="Hora de Acostarse *"
                  type="time"
                  value={bedTime}
                  onChange={e => setBedTime(e.target.value)}
                  icon={<Sunset className="w-4 h-4 text-indigo-400" />}
                  required
                />

                <ExecutiveInput
                  label="Hora de Levantarse *"
                  type="time"
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  icon={<Sunrise className="w-4 h-4 text-amber-400" />}
                  required
                />
              </div>

              <ExecutiveInput
                label="Notas / Calidad del sueño (opcional)"
                placeholder="Ej: Sueño profundo, reparador..."
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
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Sueño
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

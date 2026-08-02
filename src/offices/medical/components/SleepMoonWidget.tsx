import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { MedicalCalculations } from '../MedicalCalculations';
import { GlassPanel, ExecutiveButton, ExecutiveInput } from '../../../components/executive';
import { Moon, Star, Plus, Calendar, Clock, Award } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const SleepMoonWidget: React.FC<Props> = ({ data, todayStr }) => {
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const sleepHours = metrics.sleep || 0;
  const weeklyAvg = metrics.weeklyAvgSleep;
  const monthlyAvg = metrics.monthlyAvgSleep;

  const targetHours = 8.0;
  const sleepRatio = Math.min(1.0, sleepHours / targetHours);
  const sleepPct = Math.round(sleepRatio * 100);

  const [inputHours, setInputHours] = useState<number | ''>('');
  const [inputQuality, setInputQuality] = useState<number>(4);

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputHours === '') return;
    MedicalStore.addHealthRecord({
      date: todayStr,
      sleepHours: Number(inputHours),
      sleepQuality: inputQuality
    });
    setInputHours('');
  };

  return (
    <GlassPanel accentColor="indigo" padding="lg" className="space-y-6 bg-gradient-to-br from-[#0F172A]/90 to-[#1E1B4B]/80 border-indigo-500/30">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 border border-indigo-400/40 rounded-2xl text-indigo-300 shadow-lg shadow-indigo-950/50">
            <Moon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white tracking-wide">
              Monitoreo y Calidad del Sueño
            </h3>
            <p className="text-xs text-indigo-200/80 font-sans">
              Registro del descanso nocturno y promedios de recuperación
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* INTERACTIVE MOON GRAPHIC */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG MOON WITH PROGRESS FILL */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">
              <defs>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c7d2fe" stopOpacity="1" />
                  <stop offset="70%" stopColor="#818cf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity="0.3" />
                </radialGradient>
              </defs>

              {/* Background Full Moon Circle */}
              <circle cx="50" cy="50" r="40" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

              {/* Dynamic Filled Crescent/Full Moon */}
              {/* Radius = 40. Fill according to sleepRatio */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="url(#moonGlow)"
                style={{
                  clipPath: `inset(${100 - sleepPct}% 0 0 0)`,
                  transition: 'clip-path 0.8s ease-out'
                }}
              />

              {/* Moon Craters overlay for realistic style */}
              <circle cx="38" cy="38" r="6" fill="#312e81" opacity="0.3" />
              <circle cx="60" cy="45" r="9" fill="#312e81" opacity="0.25" />
              <circle cx="45" cy="65" r="7" fill="#312e81" opacity="0.3" />
            </svg>

            {/* OVERLAY HOURS COUNTER */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold font-mono text-white drop-shadow-md">
                {sleepHours > 0 ? `${sleepHours}h` : '0h'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                {sleepPct}% Descanso
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-indigo-200/90 font-medium text-center">
            {sleepHours >= 7 ? '✨ Descanso óptimo alcanzado' : sleepHours > 0 ? '🌙 Descanso parcial registrado' : 'Sin registro de sueño hoy'}
          </p>
        </div>

        {/* LOG FORM & AVERAGES */}
        <div className="md:col-span-7 space-y-5">
          {/* STATS COMPARISON */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Promedio Semanal</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                {weeklyAvg !== null ? `${weeklyAvg} hrs` : 'Sin datos'}
              </p>
              <p className="text-[10px] text-slate-400">Últimos 7 días</p>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-slate-700/60 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Award className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Promedio Mensual</span>
              </div>
              <p className="text-2xl font-bold font-mono text-white">
                {monthlyAvg !== null ? `${monthlyAvg} hrs` : 'Sin datos'}
              </p>
              <p className="text-[10px] text-slate-400">Últimos 30 días</p>
            </div>
          </div>

          {/* LOG SLEEP FORM */}
          <form onSubmit={handleSaveSleep} className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" /> Registrar Sueño Anoche
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <ExecutiveInput
                label="Horas Dormidas"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="Ej: 7.5"
                value={inputHours}
                onChange={e => setInputHours(e.target.value === '' ? '' : Number(e.target.value))}
                accentColor="rose"
                required
              />

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Calidad del Sueño</label>
                <div className="flex items-center gap-1 bg-[#091322] border border-indigo-500/30 p-2 rounded-xl">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setInputQuality(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= inputQuality ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Moon className="w-4 h-4" />}>
                Guardar Registro de Sueño
              </ExecutiveButton>
            </div>
          </form>
        </div>
      </div>
    </GlassPanel>
  );
};

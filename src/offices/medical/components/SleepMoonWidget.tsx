import React, { useState } from 'react';
import { MedicalOfficeData, SleepRecord, NapRecord } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { MedicalCalculations, formatMinutesToText } from '../MedicalCalculations';
import { GlassPanel } from '../../../components/executive';
import { Moon, Star, Plus, Calendar, Clock, Award, Trash2, Edit2, Sunrise, Sunset, AlertCircle, Settings, Check } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const SleepMoonWidget: React.FC<Props> = ({ data, todayStr }) => {
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  
  const todaySleepRecord = metrics.todaySleepRecord;
  const todayNaps = metrics.todayNaps || [];
  const targetHours = data.sleepTargetHours || 8.0;

  // Form states for Night Sleep
  const [bedTimeInput, setBedTimeInput] = useState<string>(todaySleepRecord?.bedTime || '22:45');
  const [wakeTimeInput, setWakeTimeInput] = useState<string>(todaySleepRecord?.wakeTime || '06:30');
  const [sleepQuality, setSleepQuality] = useState<number>(todaySleepRecord?.quality || 4);
  const [sleepNotes, setSleepNotes] = useState<string>(todaySleepRecord?.notes || '');

  // Form states for Naps (Siestas)
  const [showNapForm, setShowNapForm] = useState(false);
  const [napStart, setNapStart] = useState<string>('14:00');
  const [napEnd, setNapEnd] = useState<string>('14:45');
  const [napNotes, setNapNotes] = useState<string>('');

  // Target edit state
  const [showTargetEdit, setShowTargetEdit] = useState(false);
  const [customTarget, setCustomTarget] = useState<number>(targetHours);

  // Auto-calculated preview durations
  const previewNightDuration = React.useMemo(() => {
    if (!bedTimeInput || !wakeTimeInput) return 0;
    const [h1, m1] = bedTimeInput.split(':').map(Number);
    const [h2, m2] = wakeTimeInput.split(':').map(Number);
    const startMins = (h1 || 0) * 60 + (m1 || 0);
    let endMins = (h2 || 0) * 60 + (m2 || 0);
    if (endMins <= startMins) endMins += 24 * 60;
    return Math.max(0, endMins - startMins);
  }, [bedTimeInput, wakeTimeInput]);

  const previewNapDuration = React.useMemo(() => {
    if (!napStart || !napEnd) return 0;
    const [h1, m1] = napStart.split(':').map(Number);
    const [h2, m2] = napEnd.split(':').map(Number);
    const startMins = (h1 || 0) * 60 + (m1 || 0);
    let endMins = (h2 || 0) * 60 + (m2 || 0);
    if (endMins < startMins) endMins += 24 * 60;
    return Math.max(0, endMins - startMins);
  }, [napStart, napEnd]);

  // Calculate moon fill ratio
  const totalMinsToday = (todaySleepRecord?.durationMinutes || 0) + todayNaps.reduce((s, n) => s + n.durationMinutes, 0);
  const totalHoursToday = Number((totalMinsToday / 60).toFixed(1));
  const sleepRatio = Math.min(1.0, totalHoursToday / targetHours);
  const sleepPct = Math.round(sleepRatio * 100);

  const handleSaveNightSleep = (e: React.FormEvent) => {
    e.preventDefault();
    MedicalStore.saveSleepRecord({
      date: todayStr,
      bedTime: bedTimeInput,
      wakeTime: wakeTimeInput,
      quality: sleepQuality,
      notes: sleepNotes
    });
  };

  const handleDeleteSleepRecord = () => {
    if (todaySleepRecord) {
      MedicalStore.deleteSleepRecord(todaySleepRecord.id);
    }
  };

  const handleAddNap = (e: React.FormEvent) => {
    e.preventDefault();
    MedicalStore.addNapRecord({
      date: todayStr,
      startTime: napStart,
      endTime: napEnd,
      notes: napNotes
    });
    setShowNapForm(false);
    setNapNotes('');
  };

  const handleDeleteNap = (id: string) => {
    MedicalStore.deleteNapRecord(id);
  };

  const handleSaveTarget = () => {
    if (customTarget > 0) {
      MedicalStore.setSleepTarget(customTarget);
      setShowTargetEdit(false);
    }
  };

  return (
    <GlassPanel accentColor="indigo" padding="lg" className="space-y-6 bg-gradient-to-br from-[#0F172A]/90 to-[#1E1B4B]/80 border-indigo-500/30">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 border border-indigo-400/40 rounded-2xl text-indigo-300 shadow-lg shadow-indigo-950/50">
            <Moon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white tracking-wide">
              Monitoreo y Cálculo Inteligente del Sueño
            </h3>
            <p className="text-xs text-indigo-200/80 font-sans">
              Cálculo automático de duración (acostarse/levantarse), siestas e indicadores de descanso
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTargetEdit(!showTargetEdit)}
          className="text-xs text-indigo-300 hover:text-indigo-100 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" /> Meta: {targetHours} h/día
        </button>
      </div>

      {/* EDIT TARGET INLINE BAR */}
      {showTargetEdit && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center gap-3 animate-fadeIn">
          <label className="text-xs text-indigo-200 font-bold whitespace-nowrap">Ajustar Objetivo de Sueño (Horas):</label>
          <input
            type="number"
            step="0.5"
            min="4"
            max="12"
            value={customTarget}
            onChange={e => setCustomTarget(Number(e.target.value))}
            className="w-24 p-1.5 bg-[#091322] border border-indigo-500/50 rounded-lg text-xs font-bold text-indigo-200 focus:outline-none"
          />
          <button
            onClick={handleSaveTarget}
            className="px-3 py-1 bg-indigo-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-indigo-400 transition-colors"
          >
            Guardar
          </button>
        </div>
      )}

      {/* DYNAMIC AUTOMATED STATS GRID (LIQUID GLASS BADGES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Acostarse / Levantarse Hoy */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Sunset className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Acostarse Hoy</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {todaySleepRecord ? todaySleepRecord.bedTime : 'Sin registro'}
          </p>
          <span className="text-[10px] text-slate-500 block font-mono">
            {todaySleepRecord ? `Levantarse: ${todaySleepRecord.wakeTime}` : 'Ingresa horarios'}
          </span>
        </div>

        {/* Duración Total Hoy */}
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Duración Total</span>
          </div>
          <p className="text-lg font-bold font-mono text-amber-300">
            {totalMinsToday > 0 ? formatMinutesToText(totalMinsToday) : '0 h'}
          </p>
          <span className="text-[10px] text-indigo-200/80 block font-mono">
            {todayNaps.length > 0 ? `Incluye ${todayNaps.length} siesta(s)` : 'Sueño nocturno'}
          </span>
        </div>

        {/* Promedio Semanal */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Promedio Semanal</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {metrics.weeklyAvgSleep !== null ? `${metrics.weeklyAvgSleep} h` : 'Sin datos'}
          </p>
          <span className="text-[10px] text-slate-500 block font-mono">
            Acostarse prom: {metrics.avgBedTime || '--:--'}
          </span>
        </div>

        {/* Promedio Mensual & Alertas */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Promedio Mensual</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {metrics.monthlyAvgSleep !== null ? `${metrics.monthlyAvgSleep} h` : 'Sin datos'}
          </p>
          <span className="text-[10px] text-rose-300 block font-mono">
            {metrics.daysBelowGoal > 0 ? `⚠️ ${metrics.daysBelowGoal} días < ${targetHours}h` : ' Meta cumplida'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* INTERACTIVE MOON GRAPHIC */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
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

              {/* Moon Craters overlay */}
              <circle cx="38" cy="38" r="6" fill="#312e81" opacity="0.3" />
              <circle cx="60" cy="45" r="9" fill="#312e81" opacity="0.25" />
              <circle cx="45" cy="65" r="7" fill="#312e81" opacity="0.3" />
            </svg>

            {/* OVERLAY HOURS COUNTER */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-bold font-mono text-white drop-shadow-md">
                {totalMinsToday > 0 ? formatMinutesToText(totalMinsToday) : '0h'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                {sleepPct}% Objetivo
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-indigo-200/90 font-medium text-center">
            {totalHoursToday >= targetHours
              ? '✨ Descanso óptimo alcanzado'
              : totalHoursToday > 0
              ? `🌙 Descanso registrado: faltan ${formatMinutesToText((targetHours * 60) - totalMinsToday)}`
              : 'Sin registro de sueño hoy'}
          </p>
        </div>

        {/* AUTOMATED TIME INPUT FORM & NAP SECTION */}
        <div className="md:col-span-7 space-y-5">
          {/* NIGHT SLEEP ENTRY FORM */}
          <form onSubmit={handleSaveNightSleep} className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Registrar Horarios de Sueño Nocturno
              </h4>
              {todaySleepRecord && (
                <button
                  type="button"
                  onClick={handleDeleteSleepRecord}
                  className="text-[11px] text-rose-400 hover:text-rose-200 flex items-center gap-1 transition-colors"
                  title="Eliminar registro de hoy"
                >
                  <Trash2 className="w-3 h-3" /> Borrar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Sunset className="w-3.5 h-3.5 text-amber-400" /> Hora en que me acosté
                </label>
                <input
                  type="time"
                  value={bedTimeInput}
                  onChange={e => setBedTimeInput(e.target.value)}
                  className="w-full p-2 bg-[#091322] border border-indigo-500/40 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-300" /> Hora en que me desperté
                </label>
                <input
                  type="time"
                  value={wakeTimeInput}
                  onChange={e => setWakeTimeInput(e.target.value)}
                  className="w-full p-2 bg-[#091322] border border-indigo-500/40 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            {/* AUTOMATIC DURATION DISPLAY BANNER */}
            <div className="p-2.5 bg-indigo-900/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-200">
                Duración calculada automáticamente:
              </span>
              <span className="text-sm font-mono font-bold text-amber-300">
                {formatMinutesToText(previewNightDuration)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Calidad del Sueño</label>
                <div className="flex items-center gap-1 bg-[#091322] border border-indigo-500/30 p-2 rounded-xl">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= sleepQuality ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Guardar Horarios Nocturnos
                </button>
              </div>
            </div>
          </form>

          {/* SIESTAS / NAPS SECTION */}
          <div className="pt-2 border-t border-indigo-500/20 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Siestas del Día ({todayNaps.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowNapForm(!showNapForm)}
                className="text-[11px] font-bold text-amber-300 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Añadir Siesta
              </button>
            </div>

            {/* ADD NAP FORM */}
            {showNapForm && (
              <form onSubmit={handleAddNap} className="p-3 bg-indigo-950/80 border border-amber-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-200 block mb-1">Hora Inicio Siesta</label>
                    <input
                      type="time"
                      value={napStart}
                      onChange={e => setNapStart(e.target.value)}
                      className="w-full p-2 bg-[#091322] border border-amber-500/40 rounded-lg text-xs font-mono text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-200 block mb-1">Hora Fin Siesta</label>
                    <input
                      type="time"
                      value={napEnd}
                      onChange={e => setNapEnd(e.target.value)}
                      className="w-full p-2 bg-[#091322] border border-amber-500/40 rounded-lg text-xs font-mono text-white"
                      required
                    />
                  </div>
                </div>

                <div className="p-2 bg-indigo-900/50 rounded-lg text-xs font-mono text-amber-300 flex justify-between">
                  <span>Duración de la siesta:</span>
                  <span className="font-bold">{formatMinutesToText(previewNapDuration)}</span>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNapForm(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Guardar Siesta
                  </button>
                </div>
              </form>
            )}

            {/* LIST OF NAPS */}
            {todayNaps.length > 0 && (
              <div className="space-y-2">
                {todayNaps.map(nap => (
                  <div key={nap.id} className="p-2.5 bg-indigo-950/30 border border-amber-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white font-mono">
                          {nap.startTime} — {nap.endTime}
                        </span>
                        <span className="text-[11px] font-mono text-amber-300 block">
                          Duración: {formatMinutesToText(nap.durationMinutes)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNap(nap.id)}
                      className="p-1 text-rose-400 hover:text-rose-200 rounded"
                      title="Eliminar siesta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

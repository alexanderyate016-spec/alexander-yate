import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalCalculations } from '../MedicalCalculations';
import { MedicalStore } from '../MedicalStore';
import { Activity, Flame, Footprints, Plus, Clock, Target, CheckCircle2 } from 'lucide-react';
import { ExecutiveInput } from '../../../components/executive';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
  onOpenDetails?: () => void;
}

export const ActivityWidget: React.FC<Props> = ({ data, todayStr, onOpenDetails }) => {
  const [showModal, setShowModal] = useState(false);
  const [activityType, setActivityType] = useState<'ejercicio' | 'caminata' | 'actividad' | 'pasos'>('ejercicio');
  const [minutes, setMinutes] = useState<number>(30);
  const [steps, setSteps] = useState<number>(3000);
  const [notes, setNotes] = useState('');

  const metrics = MedicalCalculations.getActivityMetrics(data, todayStr);

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    MedicalStore.addActivityLog({
      date: todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: activityType,
      minutes: activityType === 'pasos' ? undefined : minutes,
      steps: activityType === 'pasos' || steps > 0 ? steps : undefined,
      notes: notes.trim() || undefined
    });
    setShowModal(false);
    setNotes('');
  };

  // SVG Ring calculation
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (metrics.minutesPct / 100) * circumference;

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-rose-500/40 transition-all">
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div 
          onClick={onOpenDetails} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              🏃 Actividad <span className="text-[10px] text-slate-400 font-mono font-normal">Hoy</span>
            </h3>
            <p className="text-[11px] text-slate-400">Minutos & Pasos activos</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Registrar
        </button>
      </div>

      {/* MAIN DISPLAY - APPLE HEALTH RING & STATS */}
      <div className="flex items-center justify-between gap-4 py-2">
        {/* Left Stats */}
        <div className="space-y-2">
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1">
              <span>{metrics.todayMinutes}</span>
              <span className="text-sm text-slate-400 font-normal">/ {metrics.targetMinutes} min</span>
            </div>
            <div className="text-xs font-bold text-rose-400 font-mono">
              {metrics.minutesPct}% de la meta
            </div>
          </div>

          {metrics.todaySteps > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono pt-1 border-t border-slate-800/80">
              <Footprints className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{metrics.todaySteps.toLocaleString()} / {metrics.targetSteps.toLocaleString()} pasos</span>
            </div>
          )}
        </div>

        {/* Right SVG Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              stroke="#331825"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress Circle */}
            <circle
              stroke="url(#roseGradient)"
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
              <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="100%" stopColor="#FB7185" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-white">
            {metrics.minutesPct}%
          </div>
        </div>
      </div>

      {/* QUICK LOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" /> Registrar Actividad Física
              </h4>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Tipo de Actividad</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ejercicio', label: 'Ejercicio min' },
                    { id: 'caminata', label: 'Caminata min' },
                    { id: 'actividad', label: 'Actividad General' },
                    { id: 'pasos', label: 'Conteo Pasos' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivityType(item.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        activityType === item.id
                          ? 'bg-rose-500 text-white border-rose-400'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {activityType !== 'pasos' && (
                <ExecutiveInput
                  label="Minutos de Actividad *"
                  type="number"
                  min="1"
                  max="600"
                  value={minutes}
                  onChange={e => setMinutes(Number(e.target.value))}
                  icon={<Clock className="w-4 h-4 text-rose-400" />}
                />
              )}

              <ExecutiveInput
                label="Pasos realizados (opcional)"
                type="number"
                min="0"
                step="100"
                value={steps}
                onChange={e => setSteps(Number(e.target.value))}
                icon={<Footprints className="w-4 h-4 text-emerald-400" />}
              />

              <ExecutiveInput
                label="Notas / Lugar (opcional)"
                placeholder="Ej: Trote en parque, Gimnasio..."
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
                  <CheckCircle2 className="w-4 h-4" /> Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

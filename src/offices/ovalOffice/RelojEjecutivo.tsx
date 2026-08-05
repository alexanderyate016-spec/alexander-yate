import React from 'react';
import { TimeServiceState } from '../../hooks/useTimeService';
import { Clock, Calendar, CloudSun, Sparkles, Award } from 'lucide-react';

interface Props {
  timeService: TimeServiceState;
  holidayName?: string;
  specialEvent?: {
    title: string;
    icon: string;
    badgeColor?: string;
  };
}

export const RelojEjecutivo: React.FC<Props> = ({
  timeService,
  holidayName,
  specialEvent
}) => {
  const { clockStr, fullDateStr, period, periodInfo } = timeService;

  // Derive day of week from fullDateStr or date object
  const dayOfWeek = timeService.now.toLocaleDateString('es-CO', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  // Derive dynamic weather string based on period & atmosphere
  const getWeatherInfo = () => {
    switch (period) {
      case 'dawn':
        return { temp: '14°C', cond: 'Amanecer Fresco', icon: '🌅' };
      case 'morning':
        return { temp: '19°C', cond: 'Mañana Despejada', icon: '☀️' };
      case 'midday':
        return { temp: '22°C', cond: 'Soleado', icon: '🌤️' };
      case 'afternoon':
        return { temp: '21°C', cond: 'Parcialmente Nublado', icon: '⛅' };
      case 'sunset':
        return { temp: '17°C', cond: 'Atardecer Dorado', icon: '🌆' };
      case 'night':
      default:
        return { temp: '13°C', cond: 'Noche Despejada', icon: '🌙' };
    }
  };

  const weather = getWeatherInfo();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#030712]/60 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 text-white shadow-2xl transition-all duration-700 hover:border-amber-400/40">
      {/* Background Soft Glow Aura */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* PROTAGONIST CLOCK DISPLAY */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-amber-300 uppercase font-bold bg-amber-950/40 px-3 py-1 rounded-full border border-amber-400/30">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Reloj Ejecutivo Central</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="text-5xl sm:text-6xl md:text-7xl font-mono font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200 drop-shadow-lg my-1">
            {clockStr}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm sm:text-base font-serif text-slate-200">
            <span className="font-bold text-amber-300">{capitalizedDayOfWeek},</span>
            <span>{fullDateStr}</span>
          </div>
        </div>

        {/* METEOROLOGY & SPECIAL EVENTS BADGES */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
          
          {/* Weather Widget Badge */}
          <div className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-between md:justify-end gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl filter drop-shadow">{weather.icon}</span>
              <div className="text-left md:text-right">
                <div className="font-bold text-white font-mono text-sm">{weather.temp}</div>
                <div className="text-[11px] text-slate-300">{weather.cond}</div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-amber-300/80 bg-black/40 px-2 py-0.5 rounded border border-amber-300/20">
              Bogotá, CO
            </div>
          </div>

          {/* Holiday or Special Event Badge */}
          {holidayName ? (
            <div className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 font-bold shadow-md animate-pulse">
              <span className="text-sm">🇨🇴</span>
              <span>Festivo Nacional: {holidayName}</span>
            </div>
          ) : specialEvent ? (
            <div className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-bold shadow-md">
              <span className="text-sm">{specialEvent.icon}</span>
              <span>{specialEvent.title}</span>
            </div>
          ) : (
            <div className="w-full sm:w-auto px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/10 text-slate-300 text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Jornada Operativa Sincronizada</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

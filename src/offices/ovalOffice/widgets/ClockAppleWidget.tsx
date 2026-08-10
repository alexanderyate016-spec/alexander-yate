import React from 'react';
import { TimeServiceState } from '../../../hooks/useTimeService';
import { Clock, MapPin, Thermometer } from 'lucide-react';

interface Props {
  timeService: TimeServiceState;
  lampOn?: boolean;
}

export const ClockAppleWidget: React.FC<Props> = ({ timeService, lampOn }) => {
  const { clockStr, periodInfo, now } = timeService;

  // Day of week capitalized
  const dayOfWeek = now.toLocaleDateString('es-CO', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  // Date format e.g. "10 de agosto"
  const dateFormatted = now.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });

  // Time hours & minutes
  const hoursMinutes = clockStr.slice(0, 5);
  const seconds = clockStr.slice(6, 8);

  const getWeatherForPeriod = () => {
    switch (periodInfo.period) {
      case 'dawn':
        return { temp: '14°C', cond: 'Amanecer Dorado', emoji: '🌅' };
      case 'morning':
        return { temp: '19°C', cond: 'Mañana Despejada', emoji: '☀️' };
      case 'midday':
        return { temp: '22°C', cond: 'Tarde Luminosa', emoji: '🌤️' };
      case 'sunset':
        return { temp: '18°C', cond: 'Atardecer Cálido', emoji: '🌇' };
      case 'dusk':
        return { temp: '16°C', cond: 'Crepúsculo Sereno', emoji: '🌆' };
      case 'night':
      default:
        return { temp: '13°C', cond: 'Noche Despejada', emoji: '🌙' };
    }
  };

  const weather = getWeatherForPeriod();

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-xl border transition-all duration-500 shadow-xl flex flex-col justify-between min-h-[220px] ${
      lampOn
        ? 'bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-amber-900/40 text-amber-100 border-amber-500/40'
        : periodInfo.period === 'night' || periodInfo.period === 'dusk'
        ? 'bg-gradient-to-br from-slate-900/90 via-indigo-950/90 to-slate-950/90 text-white border-slate-800'
        : periodInfo.period === 'dawn' || periodInfo.period === 'sunset'
        ? 'bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-orange-500/15 text-slate-900 dark:text-white border-amber-300/40'
        : 'bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border-white/50 dark:border-slate-800 shadow-slate-200/50'
    }`}>
      {/* GLOW DECORATION */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      {/* TOP ROW: LOCATION & PERIOD */}
      <div className="flex items-center justify-between text-xs font-semibold opacity-80">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-500" />
          <span>Casa Blanca • Bogotá, CO</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
          <span>{weather.emoji}</span>
          <span className="font-mono">{weather.temp}</span>
        </div>
      </div>

      {/* CENTER CLOCK DISPLAY */}
      <div className="my-3 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl sm:text-6xl font-mono font-black tracking-tight drop-shadow-xs">
            {hoursMinutes}
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
            :{seconds}s
          </span>
        </div>

        {/* DATE UNDERNEATH EXACTLY AS SPECIFIED */}
        <div className="text-lg sm:text-xl font-bold font-serif opacity-95 tracking-tight">
          {capitalizedDayOfWeek}, {dateFormatted}
        </div>
      </div>

      {/* FOOTER: WEATHER CONDITION */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-xs font-medium opacity-80">
        <span className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          {weather.cond}
        </span>
        <span className="font-mono text-[11px]">
          Semana {timeService.weekNumber}
        </span>
      </div>
    </div>
  );
};

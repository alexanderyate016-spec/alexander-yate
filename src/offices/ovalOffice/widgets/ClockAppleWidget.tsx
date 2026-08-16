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

  const isDarkAtmosphere = lampOn || periodInfo.period === 'night' || periodInfo.period === 'dusk';

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-xl border transition-all duration-500 shadow-xl flex flex-col justify-between min-h-[220px] ${
      lampOn
        ? 'bg-gradient-to-br from-amber-950/90 via-slate-900/95 to-amber-900/50 text-amber-100 border-amber-500/40'
        : periodInfo.period === 'night' || periodInfo.period === 'dusk'
        ? 'bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-950/95 text-slate-100 border-indigo-500/30'
        : periodInfo.period === 'sunset' || periodInfo.period === 'dawn'
        ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-rose-50/70 text-amber-950 border-amber-300/60 shadow-amber-900/5'
        : 'bg-white/85 text-slate-900 border-slate-200/80 shadow-slate-200/50'
    }`}>
      {/* GLOW DECORATION */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      {/* TOP ROW: LOCATION & PERIOD */}
      <div className={`flex items-center justify-between text-xs font-medium ${isDarkAtmosphere ? 'text-slate-300' : 'text-slate-600'}`}>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold">Casa Blanca • Bogotá, CO</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
          isDarkAtmosphere 
            ? 'bg-white/10 border-white/15 text-slate-200' 
            : 'bg-black/5 border-black/10 text-slate-800'
        }`}>
          <span>{weather.emoji}</span>
          <span className="font-mono">{weather.temp}</span>
        </div>
      </div>

      {/* CENTER CLOCK DISPLAY */}
      <div className="my-3 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl sm:text-6xl font-mono font-bold tracking-tight ${isDarkAtmosphere ? 'text-white' : 'text-slate-900'}`}>
            {hoursMinutes}
          </span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
            isDarkAtmosphere
              ? 'bg-purple-500/25 text-purple-200 border-purple-400/40'
              : 'bg-purple-100 text-purple-800 border-purple-200'
          }`}>
            :{seconds}s
          </span>
        </div>

        {/* DATE UNDERNEATH WITH APPLE SF PRO DISPLAY */}
        <div className={`text-lg sm:text-xl font-semibold tracking-tight ${isDarkAtmosphere ? 'text-slate-200' : 'text-slate-800'}`}>
          {capitalizedDayOfWeek}, {dateFormatted}
        </div>
      </div>

      {/* FOOTER: WEATHER CONDITION */}
      <div className={`flex items-center justify-between pt-3 border-t text-xs font-medium ${
        isDarkAtmosphere 
          ? 'border-white/10 text-slate-400' 
          : 'border-slate-200/80 text-slate-600'
      }`}>
        <span className="flex items-center gap-1.5 font-medium">
          <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          {weather.cond}
        </span>
        <span className="font-mono text-[11px] font-semibold">
          Semana {timeService.weekNumber}
        </span>
      </div>
    </div>
  );
};

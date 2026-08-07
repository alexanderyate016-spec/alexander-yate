import React from 'react';
import { TimeServiceState } from '../../hooks/useTimeService';

interface Props {
  timeService: TimeServiceState;
  holidayName?: string;
}

export const RelojEjecutivo: React.FC<Props> = ({ timeService, holidayName }) => {
  const { clockStr, fullDateStr, weekNumber, period } = timeService;

  // Day of week capitalized
  const dayOfWeek = timeService.now.toLocaleDateString('es-CO', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  // Dynamic weather info matching period
  const getWeatherInfo = () => {
    switch (period) {
      case 'dawn':
        return { temp: '14°C', cond: 'Amanecer Dorado', icon: '🌅' };
      case 'morning':
        return { temp: '19°C', cond: 'Mañana Despejada', icon: '☀️' };
      case 'midday':
        return { temp: '22°C', cond: 'Soleado y Luminoso', icon: '🌤️' };
      case 'sunset':
        return { temp: '18°C', cond: 'Atardecer Cálido', icon: '🌇' };
      case 'dusk':
        return { temp: '16°C', cond: 'Crepúsculo Sereno', icon: '🌆' };
      case 'night':
      default:
        return { temp: '13°C', cond: 'Noche Despejada', icon: '🌙' };
    }
  };

  const weather = getWeatherInfo();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xs select-none space-y-3">
      {/* PROTAGONIST CLOCK - LARGE & CLEAN */}
      <div className="flex items-center justify-center gap-3">
        <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-slate-900">
          {clockStr.slice(0, 5)}
        </div>
        <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 self-start mt-2">
          {clockStr.slice(6, 8)}s
        </span>
      </div>

      {/* UNDERNEATH METADATA: DAY, FULL DATE, WEEK NUMBER */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base text-slate-700">
        <span className="font-bold text-purple-700">{capitalizedDayOfWeek},</span>
        <span className="font-medium text-slate-900">{fullDateStr}</span>
        <span className="text-slate-700">•</span>
        <span className="bg-purple-50 text-purple-700 px-3 py-0.5 rounded-full text-xs font-semibold border border-purple-200">
          Semana {weekNumber}
        </span>
      </div>

      {/* HOLIDAY OR WEATHER TAG */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {holidayName && (
          <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
            <span>🇨🇴</span>
            <span>Festivo Nacional: {holidayName}</span>
          </div>
        )}

        <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-2 font-sans font-medium">
          <span>{weather.icon}</span>
          <span className="font-mono font-bold text-slate-900">{weather.temp}</span>
          <span className="text-slate-500">{weather.cond}</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { TimeServiceState } from '../../../hooks/useTimeService';
import { DayPeriod } from '../../../services/TimeService';
import { Sparkles, Sun, Sunset, Moon, Sunrise, Lightbulb, Calendar, RefreshCw } from 'lucide-react';

interface Props {
  userName: string;
  timeService: TimeServiceState;
  simulatedPeriod: DayPeriod | 'auto';
  onSimulatePeriod: (period: DayPeriod | 'auto') => void;
  lampOn: boolean;
  onToggleLamp: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const HeaderGreetingBar: React.FC<Props> = ({
  userName,
  timeService,
  simulatedPeriod,
  onSimulatePeriod,
  lampOn,
  onToggleLamp,
  selectedDate,
  onSelectDate,
}) => {
  const { periodInfo, clockStr, fullDateStr } = timeService;
  const special = periodInfo.specialDateInfo;

  // Determine actual greeting according to spec
  let displayGreeting = periodInfo.greeting;
  if (special) {
    displayGreeting = special.greeting;
  } else if (periodInfo.holidayGreeting) {
    displayGreeting = periodInfo.holidayGreeting;
  }

  const periodBadges: Record<DayPeriod, { icon: React.ReactNode; label: string; style: string }> = {
    dawn: { icon: <Sunrise className="w-3.5 h-3.5" />, label: 'Amanecer', style: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
    morning: { icon: <Sun className="w-3.5 h-3.5" />, label: 'Mañana', style: 'bg-sky-500/20 text-sky-200 border-sky-400/30' },
    midday: { icon: <Sun className="w-3.5 h-3.5 text-amber-300" />, label: 'Mediodía / Tarde', style: 'bg-amber-400/20 text-amber-100 border-amber-300/30' },
    sunset: { icon: <Sunset className="w-3.5 h-3.5" />, label: 'Atardecer', style: 'bg-orange-500/20 text-orange-200 border-orange-400/30' },
    dusk: { icon: <Moon className="w-3.5 h-3.5" />, label: 'Crepúsculo', style: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30' },
    night: { icon: <Moon className="w-3.5 h-3.5" />, label: 'Noche', style: 'bg-blue-950/60 text-slate-200 border-slate-700/60' },
  };

  const currentBadge = periodBadges[periodInfo.period];

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-700 border shadow-xl ${
      lampOn
        ? 'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-950 text-white border-amber-500/40 shadow-amber-900/20'
        : periodInfo.period === 'night' || periodInfo.period === 'dusk'
        ? 'bg-gradient-to-r from-slate-950/90 via-indigo-950/90 to-slate-900/90 text-white border-slate-800 shadow-slate-950/50'
        : 'bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white border-white/40 dark:border-slate-800 shadow-slate-200/50'
    }`}>
      {/* BACKGROUND AMBIENT GLOW */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
        lampOn
          ? 'bg-amber-500/20'
          : periodInfo.period === 'dawn'
          ? 'bg-rose-400/20'
          : periodInfo.period === 'sunset'
          ? 'bg-orange-500/20'
          : periodInfo.period === 'night'
          ? 'bg-indigo-600/15'
          : 'bg-sky-400/15'
      }`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* LEFT BRAND & GREETING */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-purple-500/30 bg-purple-500/15 text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Despacho Oval
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${currentBadge.style}`}>
              {currentBadge.icon}
              {currentBadge.label}
            </span>

            {special && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${special.badgeBg} ${special.badgeText}`}>
                <span>{special.emoji}</span>
                <span>{special.name}</span>
              </span>
            )}

            {periodInfo.colombianHoliday?.isHoliday && !special && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                🇨🇴 Festivo: {periodInfo.colombianHoliday.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif drop-shadow-xs">
            {displayGreeting}
          </h1>

          <p className="text-sm sm:text-base opacity-80 font-medium">
            Sincronización presidencial activa • {fullDateStr}
          </p>
        </div>

        {/* RIGHT CONTROLS & TIME SWITCHER */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* DATE SELECTOR */}
          <div className="flex items-center gap-2 bg-black/10 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-1.5 px-3">
            <Calendar className="w-4 h-4 opacity-70" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer"
            />
            {selectedDate !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={() => onSelectDate(new Date().toISOString().split('T')[0])}
                title="Volver a Hoy"
                className="p-1 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
              >
                Hoy
              </button>
            )}
          </div>

          {/* DESK LAMP TOGGLE */}
          <button
            onClick={onToggleLamp}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              lampOn
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 ring-2 ring-amber-300/50 shadow-amber-500/30'
                : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 border border-white/20 dark:border-slate-700/50'
            }`}
            title="Lámpara de Escritorio Oval"
          >
            <Lightbulb className={`w-4 h-4 ${lampOn ? 'fill-amber-950 text-amber-950' : 'opacity-70'}`} />
            <span>Lámpara {lampOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* TIME PERIOD SELECTOR SIMULATOR */}
          <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-1">
            <span className="text-[11px] font-semibold px-2 opacity-70 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Ambiente:
            </span>
            <select
              value={simulatedPeriod}
              onChange={(e) => onSimulatePeriod(e.target.value as DayPeriod | 'auto')}
              className="bg-transparent text-xs font-bold focus:outline-hidden cursor-pointer pr-2 text-inherit"
            >
              <option value="auto" className="text-slate-900 bg-white">Auto (Real)</option>
              <option value="dawn" className="text-slate-900 bg-white">🌅 Amanecer (05:00 - 08:00)</option>
              <option value="morning" className="text-slate-900 bg-white">☀️ Mañana (08:00 - 12:00)</option>
              <option value="midday" className="text-slate-900 bg-white">🌤️ Tarde (12:00 - 17:00)</option>
              <option value="sunset" className="text-slate-900 bg-white">🌇 Atardecer (17:00 - 19:30)</option>
              <option value="dusk" className="text-slate-900 bg-white">🌆 Crepúsculo (19:30 - 21:00)</option>
              <option value="night" className="text-slate-900 bg-white">🌙 Noche (21:00 - 05:00)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

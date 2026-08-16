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

  const isDarkAtmosphere = lampOn || periodInfo.period === 'night' || periodInfo.period === 'dusk';

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-700 border shadow-xl ${
      lampOn
        ? 'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-950 text-white border-amber-500/40 shadow-amber-900/20'
        : periodInfo.period === 'night' || periodInfo.period === 'dusk'
        ? 'bg-gradient-to-r from-slate-950/95 via-indigo-950/95 to-slate-900/95 text-slate-100 border-indigo-500/30 shadow-slate-950/50'
        : periodInfo.period === 'sunset' || periodInfo.period === 'dawn'
        ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-rose-50/70 text-amber-950 border-amber-300/60 shadow-amber-900/5'
        : 'bg-white/85 text-slate-900 border-slate-200/80 shadow-slate-200/50'
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
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              isDarkAtmosphere
                ? 'border-purple-500/30 bg-purple-500/20 text-purple-200'
                : 'border-purple-200 bg-purple-100 text-purple-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Despacho Oval
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${currentBadge.style}`}>
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
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isDarkAtmosphere
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                🇨🇴 Festivo: {periodInfo.colombianHoliday.name}
              </span>
            )}
          </div>

          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
            isDarkAtmosphere ? 'text-white' : 'text-slate-900'
          }`}>
            {displayGreeting}
          </h1>

          <p className={`text-sm sm:text-base font-medium ${
            isDarkAtmosphere ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Sincronización presidencial activa • {fullDateStr}
          </p>
        </div>

        {/* RIGHT CONTROLS & TIME SWITCHER */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* DATE SELECTOR */}
          <div className={`flex items-center gap-2 backdrop-blur-md border rounded-2xl p-1.5 px-3 ${
            isDarkAtmosphere
              ? 'bg-white/10 border-white/15 text-slate-100'
              : 'bg-slate-100/90 border-slate-200 text-slate-800'
          }`}>
            <Calendar className="w-4 h-4 opacity-70" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer text-inherit"
            />
            {selectedDate !== new Date().toISOString().split('T')[0] && (
              <button
                onClick={() => onSelectDate(new Date().toISOString().split('T')[0])}
                title="Volver a Hoy"
                className={`p-1 rounded-lg text-xs font-bold transition-colors ${
                  isDarkAtmosphere ? 'hover:bg-white/20 text-purple-300' : 'hover:bg-slate-200 text-purple-700'
                }`}
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
                : isDarkAtmosphere
                ? 'bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
            }`}
            title="Lámpara de Escritorio Oval"
          >
            <Lightbulb className={`w-4 h-4 ${lampOn ? 'fill-amber-950 text-amber-950' : 'opacity-70'}`} />
            <span>Lámpara {lampOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* TIME PERIOD SELECTOR SIMULATOR */}
          <div className={`flex items-center gap-1 backdrop-blur-md border rounded-2xl p-1 ${
            isDarkAtmosphere
              ? 'bg-white/10 border-white/15 text-slate-100'
              : 'bg-slate-100/90 border-slate-200 text-slate-800'
          }`}>
            <span className="text-[11px] font-semibold px-2 opacity-75 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Ambiente:
            </span>
            <select
              value={simulatedPeriod}
              onChange={(e) => onSimulatePeriod(e.target.value as DayPeriod | 'auto')}
              className="bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer pr-2 text-inherit"
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

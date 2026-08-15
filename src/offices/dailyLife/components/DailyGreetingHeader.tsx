import React from 'react';
import { Sparkles, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { formatFriendlyDate, getTodayDateString } from '../../../utils/dates';

interface Props {
  userName?: string;
  habitsCompletedToday: number;
  totalHabits: number;
  currentStreak: number;
}

export const DailyGreetingHeader: React.FC<Props> = ({
  userName = 'Alex',
  habitsCompletedToday,
  totalHabits,
  currentStreak
}) => {
  const todayStr = getTodayDateString();
  const currentHour = new Date().getHours();

  // Dynamic greeting based on current local hour
  let greeting = `Buenos días, ${userName}`;
  let greetingIcon = '☀️';
  let greetingSub = 'Un pequeño paso también es progreso.';

  if (currentHour >= 12 && currentHour < 19) {
    greeting = `Buenas tardes, ${userName}`;
    greetingIcon = '🌤️';
    greetingSub = 'Continúa con calma y determinación.';
  } else if (currentHour >= 19 || currentHour < 5) {
    greeting = `Buenas noches, ${userName}`;
    greetingIcon = '🌙';
    greetingSub = 'Momento para pausar, reflexionar y descansar.';
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border border-slate-700/50 p-6 sm:p-8 text-white shadow-xl">
      {/* Subtle decorative glow */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl" role="img" aria-label="sun">
              {greetingIcon}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {greeting}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-300 font-normal">
            {greetingSub}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {formatFriendlyDate(todayStr)}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Espacio Personal Privado
            </span>
          </div>
        </div>

        {/* Quick Streak & Harmony Card */}
        <div className="flex items-center gap-3 bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-3.5 sm:px-4 sm:py-3 shadow-inner self-start md:self-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shrink-0">
            🔥
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Racha Activa
            </div>
            <div className="text-sm font-semibold text-amber-200 flex items-center gap-1.5">
              <span>{currentStreak > 0 ? `${currentStreak} días seguidos` : 'Iniciando racha'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

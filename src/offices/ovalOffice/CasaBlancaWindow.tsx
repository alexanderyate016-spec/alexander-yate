import React from 'react';
import { MasterState } from '../../types/store';
import { TimeServiceState } from '../../hooks/useTimeService';
import { Sparkles, Calendar, CheckCircle2, Clock, AlertCircle, Award, Stethoscope, BookOpen } from 'lucide-react';

interface Props {
  state: MasterState;
  timeService: TimeServiceState;
}

export const CasaBlancaWindow: React.FC<Props> = ({ state, timeService }) => {
  const { period, periodInfo, clockStr, shortClockStr, fullDateStr, greeting, icon, isNight } = timeService;
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';

  // 1. Compute Contextual Academic Summary
  const academicData = state.offices.academica;
  const now = timeService.now;
  const currentHour = now.getHours();

  let academicStatus = 'Jornada académica sin actividades pendientes.';
  if (currentHour >= 18 || currentHour < 5) {
    academicStatus = 'Tu jornada académica ha finalizado por hoy.';
  } else if (academicData?.subjects && academicData.subjects.length > 0) {
    const totalSubjects = academicData.subjects.length;
    academicStatus = `Monitoreando ${totalSubjects} asignaturas activas en tu plan académico.`;
  }

  // 2. Compute Contextual Medical Summary
  const medicalData = state.offices.medica;
  const upcomingAppointments = (medicalData?.appointments || []).filter(a => a.status === 'Programada');
  let medicalStatus = 'Sin citas médicas próximas agendadas.';

  if (upcomingAppointments.length > 0) {
    const nextAppt = upcomingAppointments[0];
    medicalStatus = `Tienes cita médica: "${nextAppt.title || nextAppt.doctor}" (${nextAppt.date} ${nextAppt.startTime || ''}).`;
  }

  // 3. Compute Habits Summary
  const habits = state.offices.vidaDiaria?.habits || [];
  const todayStr = timeService.dateStr;
  const completedHabitsCount = habits.filter(h => Boolean(h.logs?.[todayStr])).length;
  const habitsStatus = habits.length > 0
    ? `Has cumplido ${completedHabitsCount} de ${habits.length} hábitos hoy.`
    : 'No hay hábitos configurados para hoy.';

  // 4. Compute Pending Tasks Summary
  const tasks = state.offices.vidaDiaria?.tasks || [];
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const pendingCount = pendingTasks.length;
  const tasksStatus = pendingCount === 1
    ? 'Queda pendiente 1 tarea por completar.'
    : pendingCount > 1
    ? `Quedan pendientes ${pendingCount} tareas.`
    : '¡Has completado todas tus tareas del día!';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#C5A059]/40 shadow-xl transition-all duration-1000">
      {/* Dynamic Background Window Horizon */}
      <div className={`relative w-full min-h-[190px] sm:min-h-[210px] bg-gradient-to-br ${periodInfo.atmosphere.skyGradient} p-5 sm:p-7 text-white flex flex-col justify-between transition-all duration-1000`}>

        {/* WINDOW ARCH FRAME & ATMOSPHERIC GRAPHICS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-90">
          {/* Subtle Window Panes Grid Effect */}
          <div className="absolute inset-0 border-[6px] border-black/20 rounded-2xl"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 hidden sm:block"></div>
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10 hidden sm:block"></div>

          {/* SUN / MOON CELESTIAL BODY WITH GLOW */}
          <div className={`absolute transition-all duration-1000 ${periodInfo.atmosphere.sunMoonPosition}`}>
            {period === 'night' ? (
              <div className="relative">
                {/* Crescent Moon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-100 to-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.6)] flex items-center justify-center">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#0b1329] translate-x-2 -translate-y-1"></div>
                </div>
                {/* Stars in night sky */}
                <span className="absolute -top-6 -left-10 text-amber-200/80 text-xs animate-pulse">✦</span>
                <span className="absolute -top-3 left-16 text-amber-200/90 text-sm animate-ping">✧</span>
                <span className="absolute top-12 -left-16 text-amber-100/70 text-xs animate-pulse">✦</span>
                <span className="absolute top-16 left-20 text-white/80 text-[10px] animate-pulse">✧</span>
              </div>
            ) : period === 'dawn' ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-t from-orange-400 via-amber-300 to-yellow-200 shadow-[0_0_45px_rgba(251,146,60,0.8)] animate-pulse"></div>
            ) : period === 'sunset' ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-amber-300 via-rose-400 to-purple-600 shadow-[0_0_50px_rgba(244,63,94,0.7)]"></div>
            ) : (
              /* Sun during morning / midday / afternoon */
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-400 shadow-[0_0_60px_rgba(253,224,71,0.9)] flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/40 blur-xs"></div>
                </div>
                {/* Sun Light Rays */}
                <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-yellow-200/30 scale-150 animate-ping"></div>
              </div>
            )}
          </div>

          {/* Soft Clouds / Horizon Rays */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* OVERLAY CONTENT INSIDE WINDOW */}
        <div className="relative z-10 space-y-4">

          {/* HEADER ROW INSIDE WINDOW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl filter drop-shadow-md">{icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold bg-black/30 px-2 py-0.5 rounded border border-amber-300/30">
                    Ventanal Casa Blanca • {periodInfo.label}
                  </span>
                  {periodInfo.colombianHoliday.isHoliday && (
                    <span className="text-[10px] bg-rose-500/80 text-white font-bold px-2 py-0.5 rounded shadow-sm">
                      🇨🇴 Festivo Nacional
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md mt-0.5">
                  {greeting}
                </h2>
              </div>
            </div>

            {/* LIVE CLOCK & DATE EMBEDDED */}
            <div className="bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-right self-start sm:self-center">
              <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300 tracking-wider flex items-center gap-2 justify-end">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                {clockStr}
              </div>
              <div className="text-[11px] font-sans text-slate-200 font-medium">
                {fullDateStr}
              </div>
            </div>
          </div>

          {/* CONTEXTUAL SUMMARY GRID OVERLAY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* Academic */}
            <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-slate-100 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-200 block text-[11px] uppercase tracking-wider">Académico</span>
                <span className="text-[11px] text-slate-200 leading-tight block mt-0.5">{academicStatus}</span>
              </div>
            </div>

            {/* Medical */}
            <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-slate-100 flex items-start gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-200 block text-[11px] uppercase tracking-wider">Salud y Citas</span>
                <span className="text-[11px] text-slate-200 leading-tight block mt-0.5">{medicalStatus}</span>
              </div>
            </div>

            {/* Habits */}
            <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-slate-100 flex items-start gap-2">
              <Award className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-200 block text-[11px] uppercase tracking-wider">Hábitos del Día</span>
                <span className="text-[11px] text-slate-200 leading-tight block mt-0.5">{habitsStatus}</span>
              </div>
            </div>

            {/* Pendings */}
            <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-slate-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-200 block text-[11px] uppercase tracking-wider">Pendientes</span>
                <span className="text-[11px] text-slate-200 leading-tight block mt-0.5">{tasksStatus}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

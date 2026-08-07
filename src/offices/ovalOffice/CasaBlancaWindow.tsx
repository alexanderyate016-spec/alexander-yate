import React from 'react';
import { MasterState } from '../../types/store';
import { TimeServiceState } from '../../hooks/useTimeService';
import { Clock, CheckCircle2, Award, Stethoscope, BookOpen } from 'lucide-react';

interface Props {
  state: MasterState;
  timeService: TimeServiceState;
}

export const CasaBlancaWindow: React.FC<Props> = ({ state, timeService }) => {
  const { periodInfo, clockStr, fullDateStr, greeting, icon } = timeService;

  // 1. Compute Contextual Academic Summary
  const academicData = state.offices.academica;
  const now = timeService.now;
  const currentHour = now.getHours();

  let academicStatus = 'Jornada académica sin actividades pendientes.';
  if (currentHour >= 18 || currentHour < 5) {
    academicStatus = 'Tu jornada académica ha finalizado por hoy.';
  } else if (academicData?.subjects && academicData.subjects.length > 0) {
    const totalSubjects = academicData.subjects.length;
    academicStatus = `Monitoreando ${totalSubjects} asignaturas activas en tu plan.`;
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
    ? `Cumplidos ${completedHabitsCount} de ${habits.length} hábitos hoy.`
    : 'No hay hábitos configurados.';

  // 4. Compute Pending Tasks Summary
  const tasks = state.offices.vidaDiaria?.tasks || [];
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const pendingCount = pendingTasks.length;
  const tasksStatus = pendingCount === 1
    ? 'Queda pendiente 1 tarea por completar.'
    : pendingCount > 1
    ? `Quedan pendientes ${pendingCount} tareas.`
    : '¡Has completado todas tus tareas!';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center text-2xl shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Despacho Oval • {periodInfo.label}
              </span>
              {periodInfo.colombianHoliday.isHoliday && (
                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full">
                  🇨🇴 Festivo Nacional
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {greeting}
            </h2>
          </div>
        </div>

        {/* CLOCK & DATE EMBEDDED */}
        <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-right self-start sm:self-center">
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tracking-tight flex items-center gap-2 justify-end">
            <Clock className="w-4 h-4 text-purple-600" />
            {clockStr}
          </div>
          <div className="text-xs font-medium text-slate-500 mt-0.5">
            {fullDateStr}
          </div>
        </div>
      </div>

      {/* CONTEXTUAL SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Academic */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-start gap-3">
          <span className="text-xl shrink-0">🎓</span>
          <div>
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">Académico</span>
            <span className="text-xs text-slate-500 leading-snug block mt-1">{academicStatus}</span>
          </div>
        </div>

        {/* Medical */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-start gap-3">
          <span className="text-xl shrink-0">🩺</span>
          <div>
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">Salud y Citas</span>
            <span className="text-xs text-slate-500 leading-snug block mt-1">{medicalStatus}</span>
          </div>
        </div>

        {/* Habits */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-start gap-3">
          <span className="text-xl shrink-0">🏆</span>
          <div>
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">Hábitos del Día</span>
            <span className="text-xs text-slate-500 leading-snug block mt-1">{habitsStatus}</span>
          </div>
        </div>

        {/* Pendings */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-start gap-3">
          <span className="text-xl shrink-0">📅</span>
          <div>
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">Pendientes</span>
            <span className="text-xs text-slate-500 leading-snug block mt-1">{tasksStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

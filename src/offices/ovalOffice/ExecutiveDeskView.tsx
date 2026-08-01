import React from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { FinancialCalculations } from '../financial/FinancialCalculations';
import { 
  GraduationCap, 
  Landmark, 
  HeartPulse, 
  Sun, 
  Users, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  PlusCircle,
  FileText
} from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
  onFocusAgenda: () => void;
}

export const ExecutiveDeskView: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice,
  onFocusAgenda
}) => {
  // 1. Academic Metrics & Calculation
  const subjects = state.offices.academica?.subjects || [];
  const hasSubjects = subjects.length > 0;
  let academicGPA: string | null = null;
  if (hasSubjects) {
    let totalGradeWeighted = 0;
    let totalWeight = 0;
    subjects.forEach(sub => {
      (sub.cuts || []).forEach(cut => {
        (cut.activities || []).forEach(act => {
          if (act.status === 'graded' && typeof act.grade === 'number') {
            const cutWeightFrac = (cut.cutWeightPercent || 33.3) / 100;
            const actWeightFrac = (act.weightPercent || 100) / 100;
            totalGradeWeighted += act.grade * actWeightFrac * cutWeightFrac;
            totalWeight += actWeightFrac * cutWeightFrac;
          }
        });
      });
    });
    if (totalWeight > 0) {
      academicGPA = (Math.round((totalGradeWeighted / totalWeight) * 100) / 100).toFixed(2);
    }
  }

  // 2. Financial Metrics & Calculation (Calculado dinámicamente desde FinancialCalculations)
  const financialData = state.offices.financiera;
  const accounts = financialData?.accounts || [];
  const transactions = financialData?.transactions || [];
  const hasAccounts = accounts.length > 0;
  const liquidNW = financialData ? FinancialCalculations.calculateLiquidNetWorth(financialData) : { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };
  const investedNW = financialData ? FinancialCalculations.calculateInvestedNetWorth(financialData) : { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };
  const totalNW = financialData ? FinancialCalculations.calculateTotalNetWorth(financialData) : { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };
  const totalBalance = liquidNW.COP || 0;

  // 3. Medical Metrics & Calculation
  const appointments = state.offices.medica?.appointments || [];
  const upcomingAppointments = appointments
    .filter(a => a.date >= selectedDate)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextAppt = upcomingAppointments[0] || null;

  // 4. Daily Life Metrics & Calculation
  const habitsList = state.offices.vidaDiaria?.habits || [];
  const habitsCount = habitsList.length;
  const habitsDoneToday = habitsList.filter(h => h.logs?.[selectedDate]).length;
  const habitPct = habitsCount > 0 ? Math.round((habitsDoneToday / habitsCount) * 100) : null;

  const tasksList = state.offices.vidaDiaria?.tasks || [];
  const tasksPendingToday = tasksList.filter(t => t.date === selectedDate && t.status === 'pending').length;

  // 5. Social Metrics & Calculation
  const people = state.offices.vidaSocial?.people || [];
  const hasPeople = people.length > 0;
  const todayMMDD = selectedDate.substring(5);
  const todayBirthday = people.find(p => p.birthday && p.birthday.endsWith(todayMMDD));
  const upcomingBirthday = people.find(p => p.birthday);

  // 6. Events, Free Hours, Alerts
  const eventsToday = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const eventsTodayCount = eventsToday.length;

  // Calculate occupied hours in 08:00 - 18:00 window (10 hours total)
  let occupiedHours = 0;
  eventsToday.forEach(e => {
    if (e.startTime && e.endTime) {
      const [h1, m1] = e.startTime.split(':').map(Number);
      const [h2, m2] = e.endTime.split(':').map(Number);
      const startMin = Math.max(8 * 60, h1 * 60 + m1);
      const endMin = Math.min(18 * 60, h2 * 60 + m2);
      if (endMin > startMin) {
        occupiedHours += (endMin - startMin) / 60;
      }
    }
  });
  const freeHoursToday = Math.max(0, Math.round((10 - occupiedHours) * 10) / 10);

  const notifications = OvalOfficeCalculations.getNotifications(state, selectedDate);
  const conflicts = OvalOfficeCalculations.detectScheduleConflicts(eventsToday);
  const alertsCount = notifications.filter(n => n.type === 'urgent').length + conflicts.length;

  const highPriorityPending = tasksList.filter(t => t.date === selectedDate && t.priority === 'high' && t.status === 'pending').length;

  // 7. System-wide Total Item Count & Executive Summary Generation
  const totalSystemItems = 
    subjects.length +
    accounts.length +
    appointments.length +
    habitsCount +
    tasksList.length +
    people.length;

  let summaryMessage = "";
  if (totalSystemItems === 0) {
    summaryMessage = "No existe información suficiente para generar un resumen ejecutivo. Comienza registrando información en las oficinas correspondientes.";
  } else {
    const parts: string[] = [];
    if (eventsTodayCount > 0) parts.push(`${eventsTodayCount} evento(s) programado(s) hoy`);
    if (tasksPendingToday > 0) parts.push(`${tasksPendingToday} tarea(s) pendiente(s)`);
    if (nextAppt) parts.push(`cita médica (${nextAppt.title}) el ${nextAppt.date}`);
    if (hasAccounts) parts.push(`patrimonio líquido registrado de $${totalBalance?.toLocaleString('es-CO')} COP`);
    if (todayBirthday) parts.push(`cumpleaños de ${todayBirthday.name} hoy`);

    if (parts.length > 0) {
      summaryMessage = `Estado general: Tienes ${parts.join(', ')}.`;
    } else {
      summaryMessage = `Sistema sincronizado. Sin eventos ni compromisos registrados para la fecha seleccionada (${selectedDate}).`;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      
      {/* ========================================== */}
      {/* LEFT COLUMN: DASHBOARD EJECUTIVO & RESUMEN */}
      {/* ========================================== */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* CARD 1: DASHBOARD EJECUTIVO */}
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg p-4 shadow-lg text-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A059] flex items-center justify-between border-b border-[#1E3A5F] pb-2">
            <span>DASHBOARD EJECUTIVO</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">{selectedDate}</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-amber-400">📋</span> Prioridades
              </span>
              <span className="font-bold font-mono text-white">
                {highPriorityPending > 0 ? (
                  <span className="text-amber-400">{highPriorityPending} altas</span>
                ) : (
                  <span className="text-slate-400">0 pendientes</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-blue-400">📅</span> Eventos hoy
              </span>
              <span className="font-bold font-mono text-white">
                {eventsTodayCount > 0 ? (
                  <span className="text-blue-400">{eventsTodayCount} programados</span>
                ) : (
                  <span className="text-slate-400">Sin eventos</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-emerald-400">☑️</span> Tareas pendientes
              </span>
              <span className="font-bold font-mono text-white">
                {tasksPendingToday > 0 ? (
                  <span className="text-emerald-400">{tasksPendingToday} hoy</span>
                ) : (
                  <span className="text-slate-400">Al día</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-purple-400">⏱️</span> Hábitos
              </span>
              <span className="font-bold font-mono text-white">
                {habitPct !== null ? (
                  <span className="text-purple-400">{habitPct}% cumplo</span>
                ) : (
                  <span className="text-slate-400">Sin registrar</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-yellow-300">⏳</span> Horas disponibles
              </span>
              <span className="font-bold font-mono text-yellow-300">
                {freeHoursToday} h libres
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="text-rose-400">🔔</span> Alertas urgentes
              </span>
              <span className="font-bold font-mono">
                {alertsCount > 0 ? (
                  <span className="text-rose-400">{alertsCount} activas</span>
                ) : (
                  <span className="text-slate-400">0 activas</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: RESUMEN GENERAL CON ESTADOS VACÍOS REALES */}
        <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg p-4 shadow-lg text-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A059] border-b border-[#1E3A5F] pb-2">
            RESUMEN GENERAL
          </h3>

          {/* Dynamic Text Statement */}
          <div className="p-3 bg-[#132337] border border-[#1E3A5F] rounded text-xs text-slate-300 leading-relaxed font-sans italic">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
              <span>{summaryMessage}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Academic Section */}
            <div className="p-2.5 bg-[#132337] border border-blue-500/20 rounded space-y-1">
              <div className="flex items-center justify-between font-semibold text-blue-400">
                <span className="flex items-center gap-1.5">🎓 Académico</span>
                {hasSubjects && (
                  <span className="text-[10px] font-mono text-slate-400">{subjects.length} materias</span>
                )}
              </div>

              {!hasSubjects ? (
                <div className="pt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 italic">Sin materias registradas.</span>
                  <button
                    onClick={() => onNavigateToOffice('academica')}
                    className="px-2 py-0.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-400/30 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    Ir a Oficina <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => onNavigateToOffice('academica')}
                  className="cursor-pointer text-slate-300 font-mono text-[11px] pt-0.5 hover:text-white transition-colors"
                >
                  Promedio actual: <span className="font-bold text-white">{academicGPA ? academicGPA : 'Sin notas'}</span>
                </div>
              )}
            </div>

            {/* Financial Section */}
            <div className="p-2.5 bg-[#132337] border border-emerald-500/20 rounded space-y-1">
              <div className="flex items-center justify-between font-semibold text-emerald-400">
                <span className="flex items-center gap-1.5">🏛️ Financiero</span>
                {hasAccounts && (
                  <span className="text-[10px] font-mono text-slate-400">{accounts.length} cuentas</span>
                )}
              </div>

              {!hasAccounts ? (
                <div className="pt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 italic">Sin cuentas registradas.</span>
                  <button
                    onClick={() => onNavigateToOffice('financiera')}
                    className="px-2 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-400/30 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    Ir a Oficina <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => onNavigateToOffice('financiera')}
                  className="cursor-pointer text-slate-300 font-mono text-[11px] pt-0.5 hover:text-white transition-colors"
                >
                  Patrimonio líquido: <span className="font-bold text-white">${totalBalance?.toLocaleString('es-CO')} COP</span>
                </div>
              )}
            </div>

            {/* Medical Section */}
            <div className="p-2.5 bg-[#132337] border border-rose-500/20 rounded space-y-1">
              <div className="flex items-center justify-between font-semibold text-rose-400">
                <span className="flex items-center gap-1.5">❤️ Salud</span>
              </div>

              {!nextAppt ? (
                <div className="pt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 italic">Sin citas médicas registradas.</span>
                  <button
                    onClick={() => onNavigateToOffice('medica')}
                    className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-400/30 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    Ir a Oficina <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => onNavigateToOffice('medica')}
                  className="cursor-pointer text-slate-300 font-mono text-[11px] pt-0.5 hover:text-white transition-colors"
                >
                  Próxima cita: <span className="font-bold text-white">{nextAppt.date} ({nextAppt.title})</span>
                </div>
              )}
            </div>

            {/* Daily Life Section */}
            <div className="p-2.5 bg-[#132337] border border-amber-500/20 rounded space-y-1">
              <div className="flex items-center justify-between font-semibold text-amber-400">
                <span className="flex items-center gap-1.5">🌿 Vida Diaria</span>
              </div>

              {habitsCount === 0 && tasksList.length === 0 ? (
                <div className="pt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 italic">Sin hábitos ni tareas registradas.</span>
                  <button
                    onClick={() => onNavigateToOffice('vidaDiaria')}
                    className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-400/30 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    Ir a Oficina <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => onNavigateToOffice('vidaDiaria')}
                  className="cursor-pointer text-slate-300 font-mono text-[11px] pt-0.5 hover:text-white transition-colors"
                >
                  Hábitos completados hoy: <span className="font-bold text-white">{habitsDoneToday}/{habitsCount}</span>
                </div>
              )}
            </div>

            {/* Relationships Section */}
            <div className="p-2.5 bg-[#132337] border border-purple-500/20 rounded space-y-1">
              <div className="flex items-center justify-between font-semibold text-purple-400">
                <span className="flex items-center gap-1.5">👥 Relaciones</span>
              </div>

              {!hasPeople ? (
                <div className="pt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 italic">Sin contactos registrados.</span>
                  <button
                    onClick={() => onNavigateToOffice('vidaSocial')}
                    className="px-2 py-0.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-400/30 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    Ir a Oficina <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => onNavigateToOffice('vidaSocial')}
                  className="cursor-pointer text-slate-300 font-mono text-[11px] pt-0.5 hover:text-white transition-colors"
                >
                  {todayBirthday ? (
                    <span>Cumpleaños hoy: <span className="font-bold text-amber-300">🎉 {todayBirthday.name}</span></span>
                  ) : upcomingBirthday ? (
                    <span>Próximo cumpleaños: <span className="font-bold text-white">{upcomingBirthday.name} ({upcomingBirthday.birthday})</span></span>
                  ) : (
                    <span>Contactos activos: <span className="font-bold text-white">{people.length}</span></span>
                  )}
                </div>
              )}
            </div>

            {/* View All Button */}
            <button
              onClick={() => onNavigateToOffice('academica')}
              className="w-full py-2 mt-2 bg-[#1C324E] hover:bg-[#254267] border border-[#C5A059]/40 text-[#C5A059] font-bold text-xs uppercase tracking-wider rounded transition-colors text-center"
            >
              Navegar a Oficinas Sincronizadas
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: DESK SCENE WITH REALISTIC MACBOOK, IPHONE & AGENDA */}
      {/* ============================================================== */}
      <div className="lg:col-span-9 bg-gradient-to-b from-[#111A24] via-[#1a120b] to-[#2a1b12] border-2 border-[#C5A059]/60 rounded-lg p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Oval Office Window & Desk Backdrop Styling */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900/80 to-slate-950 pointer-events-none" />
        
        {/* Wooden desk reflection line */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#2a1708]/90 via-[#3a200b]/40 to-transparent pointer-events-none border-t border-[#8B5A2B]/30" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* 1. MACBOOK (OFICINAS EJECUTIVAS) - 7 COLS */}
          <div className="md:col-span-7 flex flex-col items-center">
            {/* Laptop Screen Frame */}
            <div className="w-full bg-[#0d131a] rounded-t-xl p-3 border-4 border-[#2c3540] shadow-2xl relative overflow-hidden">
              {/* Screen Header */}
              <div className="text-center pb-3 border-b border-white/10 mb-3">
                <div className="text-[10px] tracking-[0.25em] font-serif font-extrabold uppercase text-[#C5A059]">
                  OFICINAS EJECUTIVAS
                </div>
              </div>

              {/* Laptop Screen Content - 3 Executive Cards */}
              <div className="grid grid-cols-3 gap-2 py-2">
                
                {/* Oficina Académica */}
                <div
                  onClick={() => onNavigateToOffice('academica')}
                  className="bg-gradient-to-b from-[#162a45] to-[#0d1829] hover:from-[#1e3b61] hover:to-[#12223b] border border-blue-500/40 rounded-lg p-2.5 text-center cursor-pointer transition-all group flex flex-col justify-between h-[150px] shadow-md hover:scale-[1.03]"
                >
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div className="w-9 h-9 rounded-full bg-blue-900/60 border border-blue-400/50 flex items-center justify-center text-blue-300 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="font-serif font-bold text-white text-xs leading-tight">
                      Oficina Académica
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-300 font-sans leading-tight line-clamp-3">
                    {hasSubjects ? `${subjects.length} materia(s) registradas` : 'Acceder para registrar materias y notas.'}
                  </p>
                </div>

                {/* Oficina Financiera */}
                <div
                  onClick={() => onNavigateToOffice('financiera')}
                  className="bg-gradient-to-b from-[#113129] to-[#0a1e19] hover:from-[#18453a] hover:to-[#0f2d25] border border-emerald-500/40 rounded-lg p-2.5 text-center cursor-pointer transition-all group flex flex-col justify-between h-[150px] shadow-md hover:scale-[1.03]"
                >
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div className="w-9 h-9 rounded-full bg-emerald-900/60 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div className="font-serif font-bold text-white text-xs leading-tight">
                      Oficina Financiera
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-300 font-sans leading-tight line-clamp-3">
                    {hasAccounts ? `${accounts.length} cuenta(s) activa(s)` : 'Acceder para configurar patrimonio y cuentas.'}
                  </p>
                </div>

                {/* Oficina Médica */}
                <div
                  onClick={() => onNavigateToOffice('medica')}
                  className="bg-gradient-to-b from-[#3a1a1e] to-[#210f11] hover:from-[#50242a] hover:to-[#2c1417] border border-rose-500/40 rounded-lg p-2.5 text-center cursor-pointer transition-all group flex flex-col justify-between h-[150px] shadow-md hover:scale-[1.03]"
                >
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div className="w-9 h-9 rounded-full bg-rose-900/60 border border-rose-400/50 flex items-center justify-center text-rose-300 shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div className="font-serif font-bold text-white text-xs leading-tight">
                      Oficina Médica
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-300 font-sans leading-tight line-clamp-3">
                    {nextAppt ? `Próxima cita el ${nextAppt.date}` : 'Acceder para agendar citas y registros de salud.'}
                  </p>
                </div>

              </div>

              {/* Screen Footer */}
              <div className="text-[9px] text-slate-400 font-mono text-center pt-2 border-t border-white/10 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#C5A059]" /> Acceso seguro | Sincronización Directa
              </div>
            </div>

            {/* Laptop Base Keyboard Notch */}
            <div className="w-[108%] h-3 bg-[#1e252e] border-t border-[#404c5a] rounded-b-lg shadow-2xl relative flex items-center justify-center">
              <div className="w-16 h-1 bg-[#0d131a] rounded-full" />
            </div>
            {/* Laptop Shadow */}
            <div className="w-[110%] h-2 bg-black/60 blur-md rounded-full mt-1" />
          </div>


          {/* 2. IPHONE (OFICINAS PERSONALES) - 5 COLS */}
          <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-around gap-4">
            
            {/* iPhone Chassis Frame */}
            <div className="w-[200px] bg-[#000000] rounded-[28px] p-2.5 border-4 border-[#333a42] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
              
              {/* iPhone Notch & Speaker */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-b-xl z-20 flex items-center justify-center">
                <div className="w-6 h-1 bg-[#222] rounded-full" />
              </div>

              {/* iPhone Display Screen */}
              <div className="bg-[#0b131f] rounded-[20px] pt-5 pb-3 px-2.5 text-center text-white space-y-2 border border-slate-800">
                <div className="text-[9px] tracking-widest font-serif font-bold uppercase text-[#C5A059] border-b border-white/10 pb-1.5">
                  OFICINAS PERSONALES
                </div>

                <div className="space-y-2">
                  {/* Vida Diaria Pill */}
                  <div
                    onClick={() => onNavigateToOffice('vidaDiaria')}
                    className="p-2 bg-gradient-to-r from-amber-950/80 to-amber-900/60 hover:from-amber-900 hover:to-amber-800 border border-amber-500/40 rounded-xl text-left cursor-pointer transition-all flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Sun className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xs text-amber-200 leading-tight">Vida Diaria</div>
                      <div className="text-[8px] text-slate-300 font-sans leading-none">
                        {habitsCount > 0 ? `${habitsCount} hábitos activos` : 'Sin hábitos registrados'}
                      </div>
                    </div>
                  </div>

                  {/* Relaciones Pill */}
                  <div
                    onClick={() => onNavigateToOffice('vidaSocial')}
                    className="p-2 bg-gradient-to-r from-purple-950/80 to-purple-900/60 hover:from-purple-900 hover:to-purple-800 border border-purple-500/40 rounded-xl text-left cursor-pointer transition-all flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xs text-purple-200 leading-tight">Relaciones</div>
                      <div className="text-[8px] text-slate-300 font-sans leading-none">
                        {hasPeople ? `${people.length} contactos` : 'Sin contactos registrados'}
                      </div>
                    </div>
                  </div>

                  {/* Agenda Pill */}
                  <div
                    onClick={onFocusAgenda}
                    className="p-2 bg-gradient-to-r from-cyan-950/80 to-cyan-900/60 hover:from-cyan-900 hover:to-cyan-800 border border-cyan-500/40 rounded-xl text-left cursor-pointer transition-all flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-serif font-bold text-xs text-cyan-200 leading-tight">Agenda</div>
                      <div className="text-[8px] text-slate-300 font-sans leading-none">Eventos y pendientes del día</div>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] font-mono text-slate-500 pt-1">
                  ••• Sincronización en vivo
                </div>
              </div>
            </div>

            {/* 3. PHYSICAL LEATHER AGENDA BINDER (AGENDA EJECUTIVA) */}
            <div
              onClick={onFocusAgenda}
              className="w-[180px] h-[210px] bg-[#1d120a] hover:bg-[#281a0f] border-2 border-[#C5A059] rounded-r-lg rounded-l-xs p-4 shadow-2xl cursor-pointer relative group flex flex-col justify-between transition-all hover:scale-[1.03] border-l-4 border-l-[#3d2412]"
            >
              {/* Gold Spine Lines */}
              <div className="absolute left-1 top-0 bottom-0 w-2 border-r border-[#C5A059]/40 flex flex-col justify-around py-3">
                <div className="w-full h-1 bg-[#C5A059]" />
                <div className="w-full h-1 bg-[#C5A059]" />
                <div className="w-full h-1 bg-[#C5A059]" />
              </div>

              {/* Cover Header */}
              <div className="text-center pt-2 pl-2">
                <div className="text-[12px] font-serif font-extrabold tracking-wider text-[#C5A059] border-b border-[#C5A059]/30 pb-2 uppercase">
                  AGENDA EJECUTIVA
                </div>
              </div>

              {/* Gold Presidential Crest Emblem */}
              <div className="flex flex-col items-center justify-center my-auto pl-2 opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full border-2 border-[#C5A059] bg-[#2a1a0e] flex flex-col items-center justify-center p-1 shadow-inner">
                  <div className="text-xs font-serif font-bold text-[#C5A059]">CBP</div>
                  <div className="text-[7px] text-[#C5A059]/80 uppercase tracking-tighter font-sans">Elegancia</div>
                </div>
              </div>

              {/* Gold Stylus Pen overlay effect */}
              <div className="absolute -right-2 top-8 w-3 h-28 bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#AA7C11] rounded-full shadow-lg border border-[#8B6508] transform rotate-12 group-hover:rotate-6 transition-transform" />

              <div className="text-[9px] font-sans text-amber-200/80 text-center pl-2 font-bold tracking-wider uppercase">
                Abrir Checklist ↓
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { MedicalStore } from '../medical/MedicalStore';
import { MedicalCalculations } from '../medical/MedicalCalculations';
import { FinancialCalculations } from '../financial/FinancialCalculations';
import { Droplets, Moon, Landmark, GraduationCap, Activity, Plus, ChevronRight, Check } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
  onOpenQuickSleepModal: () => void;
}

export const WidgetsVivos: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice,
  onOpenQuickSleepModal
}) => {
  const [addedWaterAnimation, setAddedWaterAnimation] = useState<boolean>(false);

  // 1. MEDICAL & WATER DATA
  const medicalData = state.offices.medica;
  const healthMetrics = medicalData ? MedicalCalculations.getLatestHealthMetrics(medicalData, selectedDate) : null;
  const currentWaterMl = healthMetrics ? Math.round(healthMetrics.hydrationLiters * 1000) : 0;
  const targetWaterMl = Math.round((medicalData?.dailyWaterTargetLiters || 2.5) * 1000);
  const waterPct = Math.min(100, Math.round((currentWaterMl / targetWaterMl) * 100));

  const handleQuickAddWater = (amountMl: number) => {
    MedicalStore.addWaterIntake(selectedDate, amountMl);
    setAddedWaterAnimation(true);
    setTimeout(() => setAddedWaterAnimation(false), 1500);
  };

  // 2. SLEEP DATA
  const sleepTarget = medicalData?.sleepTargetHours || 8.0;
  const sleepHours = healthMetrics?.sleepHours || 0;
  const sleepPct = Math.min(100, Math.round((sleepHours / sleepTarget) * 100));
  const sleepQuality = healthMetrics?.sleepQuality || 0;

  // 3. FINANCIAL DATA
  const financialData = state.offices.financiera;
  const accounts = financialData?.accounts || [];
  const liquidNW = financialData ? FinancialCalculations.calculateLiquidNetWorth(financialData) : { COP: 0 };
  const totalBalanceCOP = liquidNW.COP || 0;
  const pendingObligations = (financialData?.obligations || []).filter(o => !o.isPaid);

  // 4. ACADEMIC DATA
  const subjects = state.offices.academica?.subjects || [];
  let academicGPA: string | null = null;
  if (subjects.length > 0) {
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

  // 5. WELLBEING OVERALL INDEX
  const habits = state.offices.vidaDiaria?.habits || [];
  const habitsCompleted = habits.filter(h => h.logs?.[selectedDate]).length;
  const habitRatio = habits.length > 0 ? habitsCompleted / habits.length : 1;

  const tasks = state.offices.vidaDiaria?.tasks || [];
  const tasksPendingToday = tasks.filter(t => t.date === selectedDate && t.status === 'pending').length;
  const tasksCompletedToday = tasks.filter(t => t.date === selectedDate && t.status === 'completed').length;
  const taskTotal = tasksPendingToday + tasksCompletedToday;
  const taskRatio = taskTotal > 0 ? tasksCompletedToday / taskTotal : 1;

  const waterRatio = Math.min(1, currentWaterMl / targetWaterMl);
  const sleepRatio = Math.min(1, sleepHours / sleepTarget);

  const wellbeingPercent = Math.round(((habitRatio * 0.3) + (taskRatio * 0.2) + (waterRatio * 0.25) + (sleepRatio * 0.25)) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

      {/* 1. BOTELLA DE AGUA VIVA */}
      <div className="relative overflow-hidden rounded-2xl bg-[#030712]/60 backdrop-blur-xl border border-cyan-500/20 p-4 text-white shadow-xl transition-all hover:border-cyan-400/40 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Hidratación
          </span>
          <span className="text-xs font-mono font-bold text-cyan-200">{waterPct}%</span>
        </div>

        {/* Dynamic Water Bottle Container */}
        <div className="my-3 flex items-center gap-3">
          {/* Animated Water Cylinder */}
          <div className="relative w-10 h-24 rounded-xl border-2 border-cyan-400/40 bg-black/40 overflow-hidden shrink-0 flex flex-col justify-end">
            <div
              className="w-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-sky-300 transition-all duration-1000 relative"
              style={{ height: `${waterPct}%` }}
            >
              {/* Fluid wave effect overlay */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-cyan-200/60 animate-pulse" />
            </div>
            {/* Measuring ticks */}
            <div className="absolute inset-y-1 right-1 flex flex-col justify-between text-[7px] text-cyan-200/50 font-mono pointer-events-none">
              <span>MAX</span>
              <span>50%</span>
              <span>MIN</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-lg font-mono font-extrabold text-white">
              {(currentWaterMl / 1000).toFixed(2)} L
            </div>
            <div className="text-[11px] text-slate-300">
              Meta: {(targetWaterMl / 1000).toFixed(1)} L/día
            </div>
            {addedWaterAnimation && (
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-bounce">
                <Check className="w-3 h-3" /> +Agua registrada
              </div>
            )}
          </div>
        </div>

        {/* Quick Intake Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
          <button
            onClick={() => handleQuickAddWater(250)}
            className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3 text-cyan-400" /> +250ml
          </button>
          <button
            onClick={() => handleQuickAddWater(500)}
            className="px-2 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-200 text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3 text-cyan-400" /> +500ml
          </button>
        </div>
      </div>

      {/* 2. MONITOR DE SUEÑO */}
      <div className="relative overflow-hidden rounded-2xl bg-[#030712]/60 backdrop-blur-xl border border-indigo-500/20 p-4 text-white shadow-xl transition-all hover:border-indigo-400/40 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-400" />
            Descanso y Sueño
          </span>
          <span className="text-xs font-mono font-bold text-indigo-200">{sleepPct}%</span>
        </div>

        <div className="my-3 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-extrabold text-white">
              {sleepHours > 0 ? `${sleepHours} hrs` : 'Sin registro'}
            </span>
            {sleepQuality > 0 && (
              <span className="text-xs text-amber-300 font-mono">
                {'★'.repeat(sleepQuality)}
              </span>
            )}
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-700"
              style={{ width: `${sleepPct}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-300 flex justify-between">
            <span>Meta: {sleepTarget} h</span>
            <span className="text-indigo-300 font-semibold">
              {sleepHours >= sleepTarget ? 'Óptimo' : 'Pendiente'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenQuickSleepModal}
          className="w-full py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-200 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" /> Registrar Sueño
        </button>
      </div>

      {/* 3. RESUMEN PATRIMONIAL */}
      <div
        onClick={() => onNavigateToOffice('financiera')}
        className="relative overflow-hidden rounded-2xl bg-[#030712]/60 backdrop-blur-xl border border-emerald-500/20 p-4 text-white shadow-xl transition-all hover:border-emerald-400/40 cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Patrimonio Líquido
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition-colors" />
        </div>

        <div className="my-3 space-y-1">
          <div className="text-xl font-mono font-extrabold text-white truncate">
            ${totalBalanceCOP.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-slate-300">
            {accounts.length} cuenta(s) activa(s)
          </div>
          {pendingObligations.length > 0 && (
            <div className="text-[10px] text-amber-300 font-mono">
              ⚠️ {pendingObligations.length} pago(s) pendiente(s)
            </div>
          )}
        </div>

        <div className="text-[10px] font-mono text-emerald-300/80 pt-2 border-t border-white/10 flex justify-between items-center">
          <span>Ver Finanzas Completa</span>
          <span>COP</span>
        </div>
      </div>

      {/* 4. PROMEDIO ACADÉMICO */}
      <div
        onClick={() => onNavigateToOffice('academica')}
        className="relative overflow-hidden rounded-2xl bg-[#030712]/60 backdrop-blur-xl border border-blue-500/20 p-4 text-white shadow-xl transition-all hover:border-blue-400/40 cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            Rendimiento Académico
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-300 transition-colors" />
        </div>

        <div className="my-3 space-y-1">
          <div className="text-2xl font-mono font-extrabold text-white">
            {academicGPA ? `${academicGPA} / 5.0` : 'Sin notas'}
          </div>
          <div className="text-[11px] text-slate-300">
            {subjects.length > 0 ? `${subjects.length} asignatura(s) en curso` : 'Sin materias activas'}
          </div>
        </div>

        <div className="text-[10px] font-mono text-blue-300/80 pt-2 border-t border-white/10 flex justify-between items-center">
          <span>Ver Plan de Estudios</span>
          <span>0.0 – 5.0</span>
        </div>
      </div>

      {/* 5. ÍNDICE DE BIENESTAR GENERAL */}
      <div className="relative overflow-hidden rounded-2xl bg-[#030712]/60 backdrop-blur-xl border border-amber-500/20 p-4 text-white shadow-xl transition-all hover:border-amber-400/40 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            Estado General
          </span>
          <span className="text-xs font-mono font-bold text-amber-200">{wellbeingPercent}%</span>
        </div>

        <div className="my-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-extrabold text-white">{wellbeingPercent}%</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30 font-bold">
              {wellbeingPercent >= 80 ? 'Excelente' : wellbeingPercent >= 50 ? 'Equilibrado' : 'Requiere atención'}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-emerald-400 transition-all duration-700"
              style={{ width: `${wellbeingPercent}%` }}
            />
          </div>

          <div className="text-[10px] text-slate-300 flex justify-between font-mono">
            <span>Hábitos: {habitsCompleted}/{habits.length}</span>
            <span>Tareas: {tasksCompletedToday}/{taskTotal}</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-amber-300/80 pt-2 border-t border-white/10 text-center">
          Cumplimiento Integral Sincronizado
        </div>
      </div>

    </div>
  );
};

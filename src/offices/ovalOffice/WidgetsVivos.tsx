import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { MedicalStore } from '../medical/MedicalStore';
import { MedicalCalculations } from '../medical/MedicalCalculations';
import { FinancialCalculations } from '../financial/FinancialCalculations';
import { Check, Plus, ChevronRight } from 'lucide-react';

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
  const sleepHours = (healthMetrics as any)?.sleepHours || healthMetrics?.sleep || 0;
  const sleepPct = Math.min(100, Math.round((sleepHours / sleepTarget) * 100));

  // 3. FINANCIAL DATA
  const financialData = state.offices.financiera;
  const liquidNW = financialData ? FinancialCalculations.calculateLiquidNetWorth(financialData) : { COP: 0 };
  const totalBalanceCOP = liquidNW.COP || 0;

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

      {/* 1. HIDRATACIÓN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
            <span className="text-base">💧</span> Hidratación
          </span>
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {waterPct}%
          </span>
        </div>

        <div className="my-1 flex items-center gap-3">
          <div className="relative w-8 h-20 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex flex-col justify-end">
            <div
              className="w-full bg-purple-600 transition-all duration-700"
              style={{ height: `${waterPct}%` }}
            />
          </div>

          <div className="space-y-0.5">
            <div className="text-base font-mono font-bold text-slate-900">
              {(currentWaterMl / 1000).toFixed(2)} L
            </div>
            <div className="text-xs text-slate-500">
              Meta: {(targetWaterMl / 1000).toFixed(1)} L/día
            </div>
            {addedWaterAnimation && (
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-bounce">
                <Check className="w-3 h-3" /> +Agua registrada
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => handleQuickAddWater(250)}
            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" /> 250ml
          </button>
          <button
            onClick={() => handleQuickAddWater(500)}
            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" /> 500ml
          </button>
        </div>
      </div>

      {/* 2. SUEÑO Y DESCANSO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
            <span className="text-base">🌙</span> Sueño y Descanso
          </span>
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {sleepPct}%
          </span>
        </div>

        <div className="my-1 space-y-1">
          <div className="text-base font-mono font-bold text-slate-900">
            {sleepHours} hrs
          </div>
          <div className="text-xs text-slate-500">
            Meta: {sleepTarget} hrs recomendadas
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-purple-600 h-full transition-all duration-700"
              style={{ width: `${sleepPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={onOpenQuickSleepModal}
          className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <span>Registrar Sueño</span>
        </button>
      </div>

      {/* 3. BALANCE FINANCIERO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
            <span className="text-base">💰</span> Balance Financiero
          </span>
        </div>

        <div className="my-1 space-y-1">
          <div className="text-base font-mono font-bold text-slate-900">
            ${totalBalanceCOP.toLocaleString()} COP
          </div>
          <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
            Patrimonio Líquido Activo
          </div>
        </div>

        <button
          onClick={() => onNavigateToOffice('financiera')}
          className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
        >
          <span>Ver Finanzas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. RENDIMIENTO ACADÉMICO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
            <span className="text-base">🎓</span> Plan Académico
          </span>
        </div>

        <div className="my-1 space-y-1">
          <div className="text-base font-mono font-bold text-slate-900">
            {academicGPA ? `${academicGPA} / 5.0` : `${subjects.length} Mat. Activas`}
          </div>
          <div className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block">
            Promedio Ponderado
          </div>
        </div>

        <button
          onClick={() => onNavigateToOffice('academica')}
          className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
        >
          <span>Ir a Materias</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. ÍNDICE DE BIENESTAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
            <span className="text-base">🩺</span> Índice Bienestar
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {wellbeingPercent}%
          </span>
        </div>

        <div className="my-1 space-y-1">
          <div className="text-base font-bold text-slate-900">
            {wellbeingPercent >= 80 ? 'Óptimo' : wellbeingPercent >= 50 ? 'Aceptable' : 'Atención'}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-700"
              style={{ width: `${wellbeingPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onNavigateToOffice('medica')}
          className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
        >
          <span>Ver Salud</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

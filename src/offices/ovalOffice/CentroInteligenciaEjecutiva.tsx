import React from 'react';
import { MasterState } from '../../types/store';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { ArrowRight } from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
}

export const CentroInteligenciaEjecutiva: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice
}) => {
  const events = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const tasks = state.offices.vidaDiaria?.tasks || [];
  const habits = state.offices.vidaDiaria?.habits || [];

  const completedTasks = tasks.filter(t => t.date === selectedDate && t.status === 'completed').length;
  const completedHabits = habits.filter(h => h.logs?.[selectedDate]).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Inteligencia Ejecutiva
            </h3>
            <p className="text-xs text-slate-500">
              Resumen de métricas de desempeño y carga.
            </p>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">Compromisos</span>
          <div className="text-xl font-mono font-bold text-slate-900">{events.length}</div>
          <span className="text-[11px] text-purple-700 font-medium">Eventos agendados</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">Tareas Listas</span>
          <div className="text-xl font-mono font-bold text-slate-900">{completedTasks}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Completadas hoy</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">Hábitos Logrados</span>
          <div className="text-xl font-mono font-bold text-slate-900">{completedHabits}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Cumplidos hoy</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">Seguridad</span>
          <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
            <span>🛡️</span> Activa
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Cifrado local</span>
        </div>
      </div>

      {/* QUICK ACCESS BUTTON */}
      <button
        onClick={() => onNavigateToOffice('vidaDiaria')}
        className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
      >
        <span>Gestión Personal</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
      </button>
    </div>
  );
};

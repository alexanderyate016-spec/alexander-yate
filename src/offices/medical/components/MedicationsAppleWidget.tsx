import React from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { Pill, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
  onOpenDetails?: () => void;
}

export const MedicationsAppleWidget: React.FC<Props> = ({ data, todayStr, onOpenDetails }) => {
  const medications = (data.medications || []).filter(m => m.status === 'active');
  const totalMeds = medications.length;

  const takenMeds = medications.filter(m => m.takenDates && m.takenDates.includes(todayStr));
  const completedCount = takenMeds.length;
  const pendingMeds = medications.filter(m => !m.takenDates || !m.takenDates.includes(todayStr));
  const pendingCount = pendingMeds.length;

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
      {/* Background Glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div 
          onClick={onOpenDetails} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl">
            <Pill className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              💊 Medicamentos <span className="text-[10px] text-slate-400 font-mono font-normal">Hoy</span>
            </h3>
            <p className="text-[11px] text-slate-400">Control de tomas diarias</p>
          </div>
        </div>

        <button
          onClick={onOpenDetails}
          className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-0.5"
        >
          Ver todos <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-3">
        <div className="text-xl font-black font-mono text-white flex items-baseline gap-2">
          <span>{completedCount} de {totalMeds} tomas completadas</span>
        </div>
        {pendingCount > 0 ? (
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{pendingCount} toma{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} hoy</span>
          </div>
        ) : totalMeds > 0 ? (
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>¡Todas las tomas completadas hoy!</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">Sin medicamentos activos en el botiquín</div>
        )}
      </div>

      {/* PENDING MEDS LIST WITH 1-CLICK TOGGLE */}
      {pendingMeds.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Pendientes de tomar:
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {pendingMeds.map(med => (
              <div 
                key={med.id}
                className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-2 hover:border-cyan-500/40 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{med.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                    <span>{med.dose}</span>
                    <span>• {med.timeOfDay || '08:00'}</span>
                  </div>
                </div>

                <button
                  onClick={() => MedicalStore.toggleMedicationTaken(med.id, todayStr)}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-bold rounded-xl transition-all border border-cyan-500/40 shrink-0 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Marcar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

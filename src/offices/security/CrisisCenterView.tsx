import React from 'react';
import { CrisisCenterData } from '../../types/store';
import { CrisisStore } from './SecurityStore';
import { AlertTriangle, ShieldAlert, CheckCircle, Radio } from 'lucide-react';

interface Props {
  crisisData: CrisisCenterData;
}

export const CrisisCenterView: React.FC<Props> = ({ crisisData }) => {
  const handleDeactivate = () => {
    CrisisStore.toggleCrisis(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white text-slate-900 border border-slate-200 p-6 sm:p-8 space-y-6 rounded-2xl shadow-xl relative">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Centro de Gestión de Crisis
            </h1>
            <p className="text-xs text-rose-600 uppercase tracking-wider font-semibold">
              Protocolo de Emergencia Presidencial Nivel: {crisisData.crisisLevel || 'HIGH'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 space-y-2">
          <div className="font-bold text-rose-900 flex items-center gap-2 uppercase tracking-wider text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            Estado de Excepción Activado
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            Todas las operaciones ordinarias han sido suspendidas temporalmente. Revisa tus planes de acción y contactos de emergencia.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Contactos Principales de Emergencia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {crisisData.emergencyContacts.length === 0 ? (
              <div className="col-span-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Sin contactos de emergencia registrados.
              </div>
            ) : (
              crisisData.emergencyContacts.map(c => (
                <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-slate-900">{c.name} ({c.role})</div>
                  <div className="text-slate-500 font-mono">📞 {c.phone}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleDeactivate}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
          >
            <CheckCircle className="w-4 h-4 stroke-[2]" /> Desactivar Modo de Crisis & Volver
          </button>
        </div>
      </div>
    </div>
  );
};

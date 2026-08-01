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
    <div className="min-h-screen bg-[#0A192F] text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#F9F7F2] text-[#1A1A1A] border border-[#D1C7B7] p-6 md:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center gap-3 border-b border-[#D1C7B7] pb-4">
          <div className="p-2.5 bg-[#0A192F] border border-[#C5A059] text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0A192F]">
              Centro de Gestión de Crisis
            </h1>
            <p className="text-[10px] text-[#8B8378] uppercase tracking-[0.2em] font-sans font-bold">
              Protocolo de Emergencia Presidencial Nivel: {crisisData.crisisLevel || 'HIGH'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2">
          <div className="font-bold text-rose-900 flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            Estado de Excepción Activado
          </div>
          <p className="text-xs">
            Todas las operaciones ordinarias han sido suspendidas temporalmente. Revisa tus planes de acción y contactos de emergencia.
          </p>
        </div>

        <div className="space-y-3 font-sans">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8B8378]">
            Contactos Principales de Emergencia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {crisisData.emergencyContacts.length === 0 ? (
              <div className="col-span-full p-4 bg-[#F4F1EA] border border-[#D1C7B7] text-center text-xs text-[#8B8378]">
                Sin contactos de emergencia registrados.
              </div>
            ) : (
              crisisData.emergencyContacts.map(c => (
                <div key={c.id} className="p-3 bg-[#F4F1EA] border border-[#D1C7B7] text-xs space-y-1">
                  <div className="font-bold text-[#0A192F]">{c.name} ({c.role})</div>
                  <div className="text-[#8B8378] font-mono">📞 {c.phone}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#D1C7B7] flex justify-end">
          <button
            onClick={handleDeactivate}
            className="px-6 py-2.5 bg-[#0A192F] hover:bg-[#162A45] text-white font-bold text-xs uppercase tracking-widest border border-[#C5A059] transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-[#C5A059]" /> Desactivar Modo de Crisis & Volver
          </button>
        </div>
      </div>
    </div>
  );
};

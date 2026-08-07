import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { Activity, Users, Lock, Unlock, X, ChevronRight, Clock, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
}

export const IPhoneModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  onNavigateToOffice
}) => {
  if (!isOpen) return null;

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-xl animate-in fade-in duration-200">
      {/* IPHONE CHASSIS FRAME */}
      <div className="relative w-80 h-[560px] bg-white rounded-[48px] border-[6px] border-[#222] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between text-white select-none">
        
        {/* DYNAMIC ISLAND / NOTCH */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2.5 border border-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-200"></div>
          <div className="w-2 h-2 rounded-full bg-blue-900/60 animate-pulse"></div>
        </div>

        {/* STATUS BAR */}
        <div className="pt-3 px-6 text-[11px] font-semibold font-mono flex items-center justify-between z-20 text-slate-800">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100% 🔋</span>
          </div>
        </div>

        {/* SCREEN CONTENT */}
        <div className="flex-1 relative flex flex-col justify-between p-6 bg-gradient-to-b from-[#0a1128] via-[#001428] to-[#0d0d1e] overflow-hidden">
          
          {/* Lock Screen View */}
          {!isUnlocked ? (
            <div className="flex-1 flex flex-col justify-between pt-8 pb-4 text-center animate-in fade-in duration-300">
              <div className="space-y-2 mt-4">
                <div className="flex justify-center text-slate-500">
                  <Lock className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <h1 className="text-5xl font-light font-mono tracking-tight text-white drop-shadow-md">
                  {currentTime}
                </h1>
                <p className="text-xs text-slate-700 capitalize font-medium">
                  {currentDate}
                </p>
              </div>

              {/* Seal Emblem on Lockscreen */}
              <div className="p-4 rounded-2xl bg-white border border-amber-500/30 text-center my-auto backdrop-blur-md">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full border border-amber-400/40 bg-amber-500/20 flex items-center justify-center text-amber-800 text-xs font-bold font-serif">
                  CBP
                </div>
                <span className="text-xs font-bold text-amber-200 block">Casa Blanca Executive</span>
                <span className="text-[10px] text-slate-700 block">iPhone Personal • {userName}</span>
              </div>

              {/* Unlock Action Button */}
              <button
                onClick={() => setIsUnlocked(true)}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Unlock className="w-4 h-4" /> Tocar para Desbloquear
              </button>
            </div>
          ) : (
            /* Unlocked Home Screen View */
            <div className="flex-1 flex flex-col justify-between pt-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-amber-800">CasaBlanca Mobile</span>
                  </div>
                  <button
                    onClick={() => setIsUnlocked(false)}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs text-slate-700"
                    title="Bloquear iPhone"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-sans">
                  Aplicaciones móviles independientes de tu despacho:
                </p>

                {/* APP ICONS GRID */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Vida Diaria App */}
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToOffice('vidaDiaria');
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/40 to-blue-700/30 border border-indigo-400/30 flex flex-col items-center text-center gap-2 hover:scale-105 transition-all shadow-lg group"
                  >
                    <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-md group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white font-sans">Vida Diaria</span>
                    <span className="text-[9px] text-slate-700 font-mono">Rutinas y Hábitos</span>
                  </button>

                  {/* Relaciones App */}
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToOffice('vidaSocial');
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/40 to-rose-700/30 border border-amber-400/30 flex flex-col items-center text-center gap-2 hover:scale-105 transition-all shadow-lg group"
                  >
                    <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white font-sans">Relaciones</span>
                    <span className="text-[9px] text-slate-700 font-mono">Agenda & Personas</span>
                  </button>
                </div>
              </div>

              {/* Close iPhone Overlay */}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-white text-xs font-medium transition-colors border border-slate-200 flex items-center justify-center gap-1.5 mt-4"
              >
                <X className="w-3.5 h-3.5" /> Dejar en el Escritorio
              </button>
            </div>
          )}

          {/* HOME INDICATOR BAR */}
          <div className="w-32 h-1 bg-white/60 rounded-full mx-auto mt-3"></div>
        </div>
      </div>
    </div>
  );
};

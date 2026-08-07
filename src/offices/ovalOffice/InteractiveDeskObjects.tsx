import React from 'react';
import { MasterState } from '../../types/store';
import { CheckSquare, Square, Sparkles, Coffee, Laptop, Smartphone, Lightbulb } from 'lucide-react';

interface Props {
  state: MasterState;
  onOpenLampModal: () => void;
  onOpenMugModal: () => void;
  onOpenMacBookModal: () => void;
  onOpenIPhoneModal: () => void;
  onNavigateToOffice: (officeKey: string) => void;
}

export const InteractiveDeskObjects: React.FC<Props> = ({
  state,
  onOpenLampModal,
  onOpenMugModal,
  onOpenMacBookModal,
  onOpenIPhoneModal,
  onNavigateToOffice
}) => {
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';

  // Retrieve today agenda items from state or default structured schedule
  const timePlans = state.offices.vidaDiaria?.timePlans || [];
  const defaultAgendaItems = [
    { time: '08:00', title: 'Desayuno', color: 'bg-sky-400' },
    { time: '10:00', title: 'Almuerzo con Andrés', color: 'bg-amber-400' },
    { time: '12:30', title: 'Clase de Fisiología', color: 'bg-emerald-400' },
    { time: '14:00', title: 'Estudio', color: 'bg-blue-400' },
    { time: '16:00', title: 'Café con Laura', color: 'bg-purple-400' },
    { time: '18:00', title: 'Entrenamiento', color: 'bg-rose-400' },
    { time: '20:00', title: 'Cena familiar', color: 'bg-yellow-400' },
    { time: '22:30', title: 'Lectura', color: 'bg-indigo-400' }
  ];

  const priorities = [
    { title: 'Estudiar Fisiología', completed: false },
    { title: 'Proyecto Académico', completed: false },
    { title: 'Entrenamiento', completed: true },
    { title: 'Leer 30 minutos', completed: false },
    { title: 'Preparar presentación', completed: false }
  ];

  return (
    <div className="relative w-full min-h-[380px] sm:min-h-[420px] rounded-3xl overflow-hidden border border-[#C5A059]/40 bg-gradient-to-b from-[#1b120c] via-[#2c1d13] to-[#120a06] shadow-2xl p-4 sm:p-6 text-white select-none transition-all">
      
      {/* DESK WOOD SURFACE GRAIN & LEATHER DESK BLOTTER BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3e2718] via-[#1a0f08] to-[#0a0503] opacity-90"></div>
      <div className="absolute inset-x-8 bottom-0 top-12 bg-[#120a05] rounded-t-3xl border-t-2 border-x-2 border-[#C5A059]/30 shadow-inner opacity-80 pointer-events-none"></div>

      {/* AMBIENT DESK REFLECTION GLOW */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* DESK INTERACTIVE OBJECTS CONTAINER GRID */}
      <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-6 py-2">
        
        {/* LEFT SECTION: LAMP & MUG */}
        <div className="flex items-end gap-5 shrink-0">
          
          {/* 1. BANKERS LAMP */}
          <div
            onClick={onOpenLampModal}
            className="group cursor-pointer flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95"
            title="Tocar Lámpara de Escritorio (Cambiar Modo de Luz)"
          >
            <div className="relative flex flex-col items-center">
              {/* Lamp shade glow */}
              <div className="w-20 h-10 rounded-t-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 shadow-[0_0_35px_rgba(251,191,36,0.6)] flex items-center justify-center group-hover:shadow-[0_0_50px_rgba(251,191,36,0.9)] transition-all">
                <Lightbulb className="w-5 h-5 text-slate-950 animate-pulse" />
              </div>
              {/* Lamp brass neck */}
              <div className="w-2.5 h-14 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 rounded-sm"></div>
              {/* Lamp brass base */}
              <div className="w-16 h-4 bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-800 rounded-t-lg border-t border-amber-300/40 shadow-md"></div>
            </div>
            <span className="text-[10px] font-mono text-amber-800/90 font-bold mt-1 bg-slate-50 px-2 py-0.5 rounded-full border border-amber-400/30 opacity-80 group-hover:opacity-100 transition-opacity">
              💡 Lámpara
            </span>
          </div>

          {/* 2. BLACK CERAMIC COFFEE MUG */}
          <div
            onClick={onOpenMugModal}
            className="group cursor-pointer flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95"
            title="Tocar Taza Casa Blanca (Reflexión Ejecutiva)"
          >
            <div className="relative w-16 h-16 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black rounded-b-2xl rounded-t-md border-2 border-amber-500/40 shadow-xl flex flex-col items-center justify-center p-1 group-hover:border-amber-300 transition-all">
              {/* Handle */}
              <div className="absolute -left-3 top-2 w-4 h-9 rounded-l-full border-2 border-r-0 border-amber-500/40 bg-zinc-900"></div>
              {/* Gold Emblem on Mug */}
              <div className="w-7 h-7 rounded-full border border-amber-400/60 bg-amber-500/20 flex items-center justify-center text-[8px] font-bold text-amber-800 font-serif">
                CBP
              </div>
              <span className="text-[7px] font-bold text-amber-200 uppercase tracking-tighter mt-0.5">
                CASA BLANCA
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-800/90 font-bold mt-1 bg-slate-50 px-2 py-0.5 rounded-full border border-amber-400/30 opacity-80 group-hover:opacity-100 transition-opacity">
              ☕ Reflexión
            </span>
          </div>

        </div>

        {/* CENTER SECTION: OPEN LEATHER AGENDA NOTEBOOK */}
        <div
          onClick={() => onNavigateToOffice('vidaDiaria')}
          className="flex-1 max-w-lg bg-[#2d2118] border-2 border-[#C5A059]/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative cursor-pointer group hover:border-amber-300 transition-all transform hover:-translate-y-0.5"
          title="Tocar Agenda de Escritorio (Abrir Agenda Ejecutiva)"
        >
          {/* Leather binder cover texture */}
          <div className="absolute inset-0 bg-[#3a2a1d] opacity-40 rounded-2xl pointer-events-none"></div>

          {/* Spiral binder center rings */}
          <div className="absolute left-1/2 top-2 bottom-2 -translate-x-1/2 w-4 flex flex-col justify-between py-2 z-20 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-5 h-2 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full shadow-md -translate-x-0.5 border border-black/40"></div>
            ))}
          </div>

          {/* TWO PAGES DISPLAY */}
          <div className="relative z-10 grid grid-cols-2 gap-4 bg-[#fbf8ee] text-slate-900 rounded-xl p-3 sm:p-4 shadow-inner text-xs font-sans">
            
            {/* LEFT PAGE: AGENDA DE HOY */}
            <div className="border-r border-slate-300/70 pr-3 space-y-1.5">
              <h4 className="font-serif font-bold text-amber-900 border-b border-amber-800/20 pb-1 text-xs">
                Agenda de hoy
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-800">
                {defaultAgendaItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 hover:bg-amber-100/60 p-0.5 rounded transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`}></span>
                    <span className="font-bold text-slate-700 shrink-0">{item.time}</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PAGE: PRIORIDADES & MOTIVATIONAL QUOTE */}
            <div className="pl-1 space-y-2 flex flex-col justify-between">
              <div>
                <h4 className="font-serif font-bold text-amber-900 border-b border-amber-800/20 pb-1 text-xs">
                  Prioridades
                </h4>
                <div className="space-y-1.5 mt-1.5 text-[11px] font-sans">
                  {priorities.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-800">
                      {p.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className={p.completed ? 'line-through text-slate-500' : ''}>
                        {p.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature quote at bottom right */}
              <div className="border-t border-amber-800/20 pt-2 text-right">
                <p className="font-serif italic text-[10px] text-amber-950 font-semibold">
                  "Disciplina hoy, libertad siempre."
                </p>
                <span className="text-[9px] font-mono text-amber-800 font-bold">— {userName}</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SECTION: MACBOOK & IPHONE */}
        <div className="flex items-end gap-5 shrink-0">
          
          {/* 3. MACBOOK (CLOSED FLAT LAPTOP WITH GOLD CREST) */}
          <div
            onClick={onOpenMacBookModal}
            className="group cursor-pointer flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95"
            title="Tocar MacBook (Abrir Dashboard Ejecutivo)"
          >
            {/* Metallic Laptop Lid */}
            <div className="w-36 h-24 sm:w-40 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 border-2 border-slate-200 shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center relative p-2 group-hover:border-amber-300 group-hover:shadow-[0_20px_35px_rgba(251,191,36,0.3)] transition-all">
              {/* Display lip bevel */}
              <div className="w-full h-1 bg-slate-200 rounded-t-xl mb-auto"></div>
              {/* Gold Crest Seal on Lid */}
              <div className="w-10 h-10 rounded-full border-2 border-amber-400/80 bg-gradient-to-br from-amber-500/30 to-amber-700/40 flex items-center justify-center text-[#C5A059] font-serif font-extrabold text-xs shadow-md">
                CBP
              </div>
              <span className="text-[8px] font-bold text-slate-800 uppercase tracking-widest mt-1">
                MacBook Pro
              </span>
              {/* Bottom base lip */}
              <div className="w-full h-1.5 bg-slate-600 rounded-b-xl mt-auto border-t border-slate-400"></div>
            </div>
            <span className="text-[10px] font-mono text-amber-800/90 font-bold mt-1.5 bg-slate-50 px-2 py-0.5 rounded-full border border-amber-400/30 opacity-80 group-hover:opacity-100 transition-opacity">
              💻 MacBook (Abrir)
            </span>
          </div>

          {/* 4. IPHONE */}
          <div
            onClick={onOpenIPhoneModal}
            className="group cursor-pointer flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95"
            title="Tocar iPhone (Encender y Desbloquear)"
          >
            <div className="w-14 h-24 sm:w-16 sm:h-28 rounded-2xl bg-white border-2 border-slate-200 shadow-xl flex flex-col justify-between p-1.5 relative group-hover:border-amber-400 transition-all">
              {/* Notch */}
              <div className="w-6 h-1.5 bg-black rounded-full mx-auto"></div>
              {/* Lockscreen preview */}
              <div className="text-center my-auto space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-amber-800 block">07:45</span>
                <div className="w-4 h-4 rounded-full border border-amber-400/60 mx-auto flex items-center justify-center text-[6px] text-amber-800">
                  ★
                </div>
              </div>
              <div className="w-6 h-0.5 bg-white/40 rounded-full mx-auto"></div>
            </div>
            <span className="text-[10px] font-mono text-amber-800/90 font-bold mt-1.5 bg-slate-50 px-2 py-0.5 rounded-full border border-amber-400/30 opacity-80 group-hover:opacity-100 transition-opacity">
              📱 iPhone
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

import React from 'react';
import {
  Crown,
  Building2,
  Activity,
  BookOpen,
  Landmark,
  Stethoscope,
  Heart,
  Compass,
  BrainCircuit,
  Settings
} from 'lucide-react';

interface Props {
  activeOffice: string;
  onNavigateToOffice: (officeKey: string) => void;
}

export const OvalOfficeLeftSidebar: React.FC<Props> = ({
  activeOffice,
  onNavigateToOffice
}) => {
  const navItems = [
    { key: 'ovalOffice', label: 'Oval Office', icon: Crown },
    { key: 'westWing', label: 'West Wing', icon: Building2 },
    { key: 'vidaDiaria', label: 'Gestión Personal', icon: Activity },
    { key: 'academica', label: 'Académica', icon: BookOpen },
    { key: 'financiera', label: 'Financiera', icon: Landmark },
    { key: 'medica', label: 'Médica', icon: Stethoscope },
    { key: 'vidaSocial', label: 'Relaciones', icon: Heart },
    { key: 'inteligencia', label: 'Centro de Inteligencia', icon: BrainCircuit },
    { key: 'seguridad', label: 'Ajustes', icon: Settings }
  ];

  return (
    <div className="w-56 sm:w-64 bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-3.5 shadow-2xl flex flex-col justify-between text-slate-900 shrink-0">
      
      {/* SIDEBAR HEADER / PRESIDENTIAL SEAL EMBLEM */}
      <div>
        <div
          onClick={() => onNavigateToOffice('ovalOffice')}
          className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-700/5 border border-amber-500/20 mb-4 cursor-pointer group hover:bg-amber-500/15 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-[1.5px] shadow-md shrink-0">
            <div className="w-full h-full rounded-full bg-[#0b1329] flex items-center justify-center text-[#C5A059] font-serif font-extrabold text-xs">
              CBP
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif font-extrabold text-xs uppercase tracking-wider text-amber-700 group-hover:text-amber-800">
              OVAL OFFICE
            </span>
            <span className="text-[10px] text-slate-700 font-sans">
              Casa Blanca Personal
            </span>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeOffice === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigateToOffice(item.key)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-3 transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-lg shadow-amber-500/10 font-bold'
                    : 'text-slate-800 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-amber-800' : 'text-amber-400/80 group-hover:text-amber-800'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER STATUS */}
      <div className="pt-3 border-t border-slate-200 mt-4 text-[10px] font-mono text-slate-500 flex items-center justify-between px-2">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Sistema En Línea
        </span>
        <span className="text-slate-500">v2.5</span>
      </div>
    </div>
  );
};

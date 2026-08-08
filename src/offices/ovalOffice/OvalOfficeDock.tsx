import React from 'react';
import {
  Crown,
  Calendar,
  Users,
  Stethoscope,
  Compass,
  Sun
} from 'lucide-react';

interface Props {
  activeOffice: string;
  onNavigateToOffice: (officeKey: string) => void;
}

export const OvalOfficeDock: React.FC<Props> = ({
  activeOffice,
  onNavigateToOffice
}) => {
  const dockIcons = [
    { key: 'ovalOffice', label: 'Oval Office', icon: Crown },
    { key: 'vidaDiaria', label: 'Agenda', icon: Calendar },
    { key: 'vidaSocial', label: 'Relaciones', icon: Users },
    { key: 'medica', label: 'Salud', icon: Stethoscope },
    { key: 'desarrolloPersonal', label: 'Desarrollo', icon: Compass }
  ];

  return (
    <div className="w-full bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-900 font-sans">
      
      {/* LEFT: WEATHER WIDGET */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <Sun className="w-5 h-5 text-amber-800 animate-spin-slow" />
        <div className="flex flex-col text-left leading-tight">
          <span className="font-bold text-amber-900">22°C • Soleado</span>
          <span className="text-[10px] text-slate-700">Washington, D.C.</span>
        </div>
      </div>

      {/* CENTER: MOTTO / QUOTE */}
      <div className="text-center">
        <p className="font-serif italic text-xs sm:text-sm text-amber-900 font-medium tracking-wide flex items-center justify-center gap-2">
          <span className="text-amber-600">★</span>
          Planifica hoy los mejores recuerdos de mañana
          <span className="text-amber-600">★</span>
        </p>
      </div>

      {/* RIGHT: MACOS FLOATING GLASS DOCK */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 backdrop-blur-3xl shadow-xl">
        {dockIcons.map((item) => {
          const Icon = item.icon;
          const isActive = activeOffice === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigateToOffice(item.key)}
              className={`group relative p-2.5 rounded-full transition-all duration-300 transform hover:scale-125 hover:-translate-y-1 ${
                isActive
                  ? 'bg-amber-500/30 border border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 text-amber-800 group-hover:text-amber-100 transition-colors" />

              {/* Tooltip on hover */}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-amber-200 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-amber-500/30">
                {item.label}
              </span>

              {/* Active dot below icon */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

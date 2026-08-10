import React from 'react';
import { MasterState } from '../../../types/store';
import { Users, Heart, ArrowRight } from 'lucide-react';

interface Props {
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
}

export const SocialLifeAppleWidget: React.FC<Props> = ({ state, onNavigateToOffice }) => {
  const socialData = state.offices.vidaSocial;
  const people = socialData?.people || [];
  const commitments = socialData?.commitments || [];
  const specialDates = socialData?.specialDates || [];

  // Combine commitments and events
  const socialList: Array<{
    title: string;
    personOrDetails?: string;
    icon: string;
    dateStr: string;
  }> = [];

  // 1. Birthdays from people
  people.forEach(p => {
    if (p.birthday) {
      socialList.push({
        title: `Cumpleaños de ${p.name}`,
        personOrDetails: p.relationship || 'Contacto',
        icon: '🎂',
        dateStr: p.birthday
      });
    }
  });

  // 2. Commitments
  commitments.forEach(cm => {
    socialList.push({
      title: cm.title || cm.description || 'Compromiso Social',
      personOrDetails: cm.location ? `Lugar: ${cm.location}` : undefined,
      icon: cm.type === 'Almuerzo' ? '🍽️' : cm.type === 'Salida' ? '✈️' : cm.type === 'Celebración' ? '🎉' : '👥',
      dateStr: cm.date || 'Próximamente'
    });
  });

  // 3. Special Dates
  specialDates.forEach(sd => {
    socialList.push({
      title: sd.title,
      personOrDetails: sd.description,
      icon: '✨',
      dateStr: sd.date
    });
  });

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 text-slate-900 dark:text-white border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col justify-between min-h-[220px]">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Vida Social & Relaciones
          </span>
        </div>

        <span className="text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/20">
          {people.length} contactos
        </span>
      </div>

      {/* ITEMS LIST */}
      <div className="my-3 space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
        {socialList.length > 0 ? (
          socialList.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="truncate">
                  <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                    {item.title}
                  </span>
                  {item.personOrDetails && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                      {item.personOrDetails}
                    </span>
                  )}
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300 font-mono text-[10px] font-bold border border-rose-500/20 shrink-0">
                {item.dateStr}
              </span>
            </div>
          ))
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <Heart className="w-6 h-6 text-rose-400 mx-auto opacity-70" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Círculo Social Activo
            </p>
            <p className="text-[11px] text-slate-400">
              Gestiona cumpleaños, citas y relaciones importantes desde la oficina.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Oficina de Relaciones</span>
        <button
          onClick={() => onNavigateToOffice('vidaSocial')}
          className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 hover:underline"
        >
          <span>Ver Círculo Social</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SocialPerson, SocialOfficeData } from '../../types/store';
import { SocialCalculations } from './SocialCalculations';
import { getTodayDateString, COLOMBIAN_NATIONAL_HOLIDAYS } from '../../utils/dates';
import { GlassPanel, ExecutiveBadge } from '../../components/executive';
import { Calendar as CalendarIcon, Cake, Heart, Clock, Flag, Sparkles, User } from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  onSelectPerson: (person: SocialPerson) => void;
}

export const SocialCalendarView: React.FC<Props> = ({ data, onSelectPerson }) => {
  const [filterType, setFilterType] = useState<'all' | 'birthday' | 'anniversary' | 'commitment' | 'holiday'>('all');
  const todayStr = getTodayDateString();

  const upcomingDates = SocialCalculations.getUpcomingDatesList(data, todayStr);

  // Colombian Holidays
  const holidays = COLOMBIAN_NATIONAL_HOLIDAYS.map((h, idx) => {
    const { daysLeft, isToday, nextDateStr } = SocialCalculations.getDaysUntilNextOccurrence(h.monthDay, todayStr);
    return {
      id: `hol_${idx}_${h.monthDay}`,
      type: 'holiday' as const,
      title: `🇨🇴 ${h.title}: ${h.message}`,
      dateStr: nextDateStr,
      daysLeft,
      isToday,
      description: 'Festividad Nacional de Colombia'
    };
  });

  // Combine and sort events
  const allEvents = [
    ...upcomingDates.map(d => ({ ...d, isHoliday: false })),
    ...holidays.map(h => ({ ...h, isHoliday: true, personId: undefined, personName: undefined }))
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  const filteredEvents = allEvents.filter(ev => {
    if (filterType === 'all') return true;
    if (filterType === 'birthday') return ev.type === 'birthday';
    if (filterType === 'anniversary') return ev.type === 'anniversary';
    if (filterType === 'commitment') return ev.type === 'commitment';
    if (filterType === 'holiday') return ev.type === 'holiday';
    return true;
  });

  return (
    <div className="space-y-6">
      <GlassPanel accentColor="purple" padding="md">
        <div className="flex flex-wrap justify-between items-center mb-4 border-b border-white/10 pb-3 gap-3">
          <div>
            <h3 className="font-serif font-bold text-white text-base sm:text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              Calendario Social Exclusivo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumpleaños, aniversarios, compromisos, fechas especiales y festividades nacionales de Colombia.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Todos ({allEvents.length})
            </button>
            <button
              onClick={() => setFilterType('birthday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                filterType === 'birthday'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Cake className="w-3.5 h-3.5" /> Cumpleaños
            </button>
            <button
              onClick={() => setFilterType('anniversary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                filterType === 'anniversary'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Aniversarios
            </button>
            <button
              onClick={() => setFilterType('commitment')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                filterType === 'commitment'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Compromisos
            </button>
            <button
              onClick={() => setFilterType('holiday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                filterType === 'holiday'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5" /> Festividades
            </button>
          </div>
        </div>

        {/* EVENTS LIST */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No hay eventos para el filtro seleccionado.</p>
          ) : (
            filteredEvents.slice(0, 30).map(ev => {
              const person = ev.personId ? (data.people || []).find(p => p.id === ev.personId) : undefined;

              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border backdrop-blur-md flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 transition-all ${
                    ev.isToday
                      ? 'bg-gradient-to-r from-purple-900/40 to-amber-950/30 border-amber-500/50 shadow-lg'
                      : 'bg-[#132337]/80 border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      ev.type === 'birthday'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : ev.type === 'anniversary'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : ev.type === 'commitment'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : ev.type === 'holiday'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {ev.type === 'birthday' ? (
                        <Cake className="w-5 h-5" />
                      ) : ev.type === 'anniversary' ? (
                        <Heart className="w-5 h-5" />
                      ) : ev.type === 'commitment' ? (
                        <Clock className="w-5 h-5" />
                      ) : ev.type === 'holiday' ? (
                        <Flag className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-white text-sm">{ev.title}</h4>
                        <ExecutiveBadge variant="subtle" accentColor={
                          ev.type === 'birthday' ? 'amber' : ev.type === 'anniversary' ? 'rose' : ev.type === 'commitment' ? 'blue' : 'purple'
                        }>
                          {ev.type === 'birthday' ? 'Cumpleaños' : ev.type === 'anniversary' ? 'Aniversario' : ev.type === 'commitment' ? 'Compromiso' : ev.type === 'holiday' ? 'Festividad' : 'Fecha Especial'}
                        </ExecutiveBadge>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{ev.dateStr}</p>
                      {ev.description && <p className="text-xs text-slate-400 mt-0.5">{ev.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {ev.isToday ? (
                        <span className="text-sm font-bold text-amber-300 block">¡Es hoy!</span>
                      ) : (
                        <span className="text-xs font-semibold text-purple-300 block">En {ev.daysLeft} días</span>
                      )}
                    </div>

                    {person && (
                      <button
                        onClick={() => onSelectPerson(person)}
                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Ver Expediente</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

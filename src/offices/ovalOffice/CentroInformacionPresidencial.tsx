import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { ChiefOfStaffSync } from '../chiefOfStaff/ChiefOfStaffSync';
import { getTodayDateString } from '../../utils/dates';
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertTriangle,
  Bell,
  Star,
  Shield,
  Calendar,
  Sparkles,
  X
} from 'lucide-react';

interface Props {
  state: MasterState;
  selectedDate: string;
  onNavigateToOffice: (officeKey: string) => void;
}

export const CentroInformacionPresidencial: React.FC<Props> = ({
  state,
  selectedDate,
  onNavigateToOffice
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const todayStr = getTodayDateString();
  const briefing = ChiefOfStaffSync.buildExecutiveBriefing(state, selectedDate);
  const reminders = ChiefOfStaffSync.getExecutiveReminders(state, todayStr);

  const nowReminders = reminders.filter(r => r.tier === 'ahora');
  const upcomingReminders = reminders.filter(r => r.tier === 'proximo');
  const importantReminders = reminders.filter(r => r.tier === 'importante');
  const overdueReminders = reminders.filter(r => r.tier === 'vencido');

  return (
    <>
      {/* DISCREET TRIGGER TAB ON THE LEFT EDGE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Abrir Centro de Información Presidencial (Jefatura de Gabinete)"
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-2.5 py-4 rounded-r-2xl bg-slate-900/90 text-amber-400 border-y border-r border-amber-500/30 shadow-2xl backdrop-blur-md hover:bg-slate-800 transition-all duration-300 group ${
          isOpen ? 'translate-x-[360px] sm:translate-x-[420px]' : 'translate-x-0'
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <Shield className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 py-1 text-slate-200">
            CIP • Gabinete
          </span>
          {briefing.conflictCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          )}
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>
      </button>

      {/* OVERLAY BACKDROP */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
        />
      )}

      {/* SLIDE-OUT LIQUID GLASS SIDEBAR */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[360px] sm:w-[420px] bg-slate-900/85 backdrop-blur-2xl border-r border-amber-500/20 text-slate-100 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Centro de Información
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  CIP
                </span>
              </h2>
              <p className="text-xs text-slate-400">Jefatura de Gabinete • Vista Ejecutiva</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIDEBAR SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Executive Status Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/90 border border-amber-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Estado de Agenda
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{selectedDate}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{briefing.summaryText}</p>
          </div>

          {/* Conflicts Alert */}
          {briefing.conflictCount > 0 && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{briefing.conflictCount} Conflictos Detectados</span>
              </div>
              <p className="text-[11px] text-red-300">
                Existen compromisos encimados en su horario. La Jefatura requiere su autorización para resolverlos.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToOffice('jefaturaGabinete');
                }}
                className="w-full mt-1 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 rounded-lg text-red-100 font-semibold transition-all text-[11px] flex justify-center items-center gap-1"
              >
                Resolver en Jefatura <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Reminders - AHORA */}
          {nowReminders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Bell className="w-3.5 h-3.5 animate-bounce" /> Ahora Mismo (🔴)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono">
                  {nowReminders.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {nowReminders.map(rem => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-red-500/30 flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-white">{rem.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">{rem.subtitle}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 font-semibold shrink-0">
                      {rem.timeLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priorities / Compromisos Clave */}
          <div className="space-y-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Star className="w-3.5 h-3.5" /> Compromisos & Prioridades Clave
            </span>
            {briefing.priorities.length === 0 ? (
              <p className="text-slate-400 text-xs italic">Sin actividades registradas para esta fecha.</p>
            ) : (
              <div className="space-y-2">
                {briefing.priorities.map((pri, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-amber-500/30 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-medium text-slate-100 truncate">{pri.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="text-amber-400/80">{pri.office}</span>
                        {pri.category && (
                          <>
                            <span>•</span>
                            <span className="truncate">{pri.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                        pri.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {pri.priority === 'high' ? 'Alta' : 'Normal'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Importante & Próximos */}
          {importantReminders.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-orange-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" /> Próximas Evaluaciones y Compromisos (3 Días)
              </span>
              <div className="space-y-1.5">
                {importantReminders.slice(0, 4).map(rem => (
                  <div
                    key={rem.id}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-orange-500/20 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{rem.title}</div>
                      <div className="text-[10px] text-slate-400">{rem.subtitle}</div>
                    </div>
                    <span className="text-[10px] text-orange-300 font-mono">{rem.timeLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free Slots */}
          {briefing.freeTimeGaps.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> Espacios Libres Disponibles
              </span>
              <div className="space-y-1.5">
                {briefing.freeTimeGaps.slice(0, 3).map(gap => (
                  <div
                    key={gap.id}
                    className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-300">
                        {gap.startTime} – {gap.endTime}
                      </span>
                      <p className="text-[10px] text-emerald-400/80">{gap.durationFormatted} libre</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Sugerencia: {gap.suggestions[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR FOOTER ACTION */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={() => {
              setIsOpen(false);
              onNavigateToOffice('jefaturaGabinete');
            }}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2"
          >
            Abrir Oficina de Jefatura de Gabinete <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

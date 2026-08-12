import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalCalculations } from '../MedicalCalculations';
import { GlassPanel } from '../../../components/executive';
import { Calendar, Filter, Activity, Stethoscope, FileText, ShieldCheck, Droplet, Moon, Scale, Heart } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const ConsolidatedTimelineSection: React.FC<Props> = ({ data }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const events = MedicalCalculations.getConsolidatedTimeline(data);

  const filteredEvents = categoryFilter === 'all'
    ? events
    : events.filter(e => e.category === categoryFilter);

  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const mIdx = parseInt(m, 10) - 1;
      return `${d} ${months[mIdx] || m}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER BAR */}
      <GlassPanel accentColor="purple" padding="md" className="space-y-4 bg-gradient-to-br from-[#1B0B2B]/90 to-[#280F40]/80 border-purple-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 border border-purple-400/40 rounded-2xl text-purple-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Historial de Salud Consolidado</h3>
              <p className="text-xs text-purple-200/80">
                Línea temporal unificada de todos los eventos, mediciones, consultas y exámenes de salud
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 rounded-xl">
            {filteredEvents.length} Eventos Registrados
          </div>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0 mr-1" />
          {[
            { id: 'all', label: 'Todos los Eventos' },
            { id: 'cita', label: '🩺 Consultas' },
            { id: 'examen', label: '🔬 Exámenes' },
            { id: 'vacuna', label: '💉 Vacunas' },
            { id: 'peso', label: '⚖️ Peso' },
            { id: 'sueño', label: '😴 Sueño' },
            { id: 'actividad', label: '🏃 Actividad' },
            { id: 'corazon', label: '❤️ Corazón' },
            { id: 'agua', label: '💧 Hidratación' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setCategoryFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                categoryFilter === f.id
                  ? 'bg-purple-500 text-white border-purple-400 shadow-lg'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* TIMELINE LIST */}
      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/80 before:via-rose-500/50 before:to-slate-800">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => (
            <div key={ev.id} className="relative group animate-fadeIn">
              {/* Timeline Bullet Point */}
              <div className="absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full bg-slate-900 border-2 border-purple-400 flex items-center justify-center text-xs shadow-lg group-hover:scale-110 transition-transform">
                {ev.icon}
              </div>

              {/* Card Event Container */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold text-[10px] rounded-lg">
                      {formatEventDate(ev.date)}
                    </span>
                    {ev.time && (
                      <span className="text-[10px] font-mono text-slate-400">{ev.time}</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">{ev.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{ev.subtitle}</p>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-lg self-start sm:self-center">
                  {ev.category}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 text-xs italic">
            No hay eventos registrados en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
};

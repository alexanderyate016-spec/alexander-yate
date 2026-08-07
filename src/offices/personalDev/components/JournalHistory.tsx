import React, { useState, useMemo } from 'react';
import { JournalEntry, JournalMood } from '../../../types/store';
import {
  Search,
  Calendar,
  Filter,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  Smile,
  Tag,
  Clock
} from 'lucide-react';
import { ExecutiveEmptyState, ExecutiveBadge } from '../../../components/executive';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onSelectEntry: (dateStr: string) => void;
}

const MOOD_LABELS: Record<string, { label: string; icon: string; class: string }> = {
  excelente: { label: 'Excelente', icon: '✨', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  bueno: { label: 'Bueno', icon: '🙂', class: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  neutro: { label: 'Neutro', icon: '😐', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  reflexivo: { label: 'Reflexivo', icon: '🤔', class: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  dificil: { label: 'Difícil', icon: '🌧️', class: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
};

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  entries,
  onSelectEntry
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('all');

  // Available Year-Month options
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => {
      if (e.date && e.date.length >= 7) {
        set.add(e.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      // Mood filter
      if (selectedMood !== 'all' && e.mood !== selectedMood) {
        return false;
      }
      // Year-Month filter
      if (selectedYearMonth !== 'all' && !e.date.startsWith(selectedYearMonth)) {
        return false;
      }
      // Search query filter (Word of the day, free reflection, learnings, etc.)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesWord = e.wordOfTheDay?.toLowerCase().includes(q);
        const matchesReflection = e.freeReflection?.toLowerCase().includes(q) || e.reflection?.toLowerCase().includes(q);
        const matchesQuestion = e.philosophicalAnswer?.toLowerCase().includes(q);
        const matchesLearned = e.learnedToday?.toLowerCase().includes(q) || e.learned?.toLowerCase().includes(q);
        const matchesGrateful = e.gratefulFor?.toLowerCase().includes(q);
        const matchesBest = e.bestThingToday?.toLowerCase().includes(q);
        const matchesDate = e.date.includes(q);

        if (!matchesWord && !matchesReflection && !matchesQuestion && !matchesLearned && !matchesGrateful && !matchesBest && !matchesDate) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, searchQuery, selectedMood, selectedYearMonth]);

  return (
    <div className="space-y-6">
      {/* Search Bar & Filters */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Text Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por palabra del día, texto, fecha o aprendizaje..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-indigo-400/30 transition-all"
            />
          </div>

          {/* Month Dropdown */}
          <select
            value={selectedYearMonth}
            onChange={e => setSelectedYearMonth(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600 transition-all"
          >
            <option value="all">Todos los meses</option>
            {monthOptions.map(ym => (
              <option key={ym} value={ym}>
                {ym}
              </option>
            ))}
          </select>

          {/* Mood Dropdown */}
          <select
            value={selectedMood}
            onChange={e => setSelectedMood(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600 transition-all"
          >
            <option value="all">Todos los estados</option>
            <option value="excelente">✨ Excelente</option>
            <option value="bueno">🙂 Bueno</option>
            <option value="neutro">😐 Neutro</option>
            <option value="reflexivo">🤔 Reflexivo</option>
            <option value="dificil">🌧️ Difícil</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Mostrando <strong className="text-slate-900">{filteredEntries.length}</strong> de {entries.length} reflexiones
          </span>
          {(searchQuery || selectedMood !== 'all' || selectedYearMonth !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMood('all');
                setSelectedYearMonth('all');
              }}
              className="text-indigo-400 hover:underline text-[11px]"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      {filteredEntries.length === 0 ? (
        <ExecutiveEmptyState
          icon={<BookOpen className="w-8 h-8 text-indigo-400" />}
          title="No se encontraron reflexiones"
          description="Ajusta los términos de búsqueda o escribe una nueva entrada en el diario."
          accentColor="indigo"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map(e => {
            const moodInfo = MOOD_LABELS[e.mood || 'reflexivo'] || MOOD_LABELS.reflexivo;
            return (
              <div
                key={e.id}
                onClick={() => onSelectEntry(e.date)}
                className="bg-white/70 backdrop-blur-2xl border border-slate-200 rounded-2xl p-5 shadow-xl hover:border-purple-300 hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Glass top reflection */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                <div>
                  {/* Header info */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-900 font-mono">
                        {e.date}
                      </span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${moodInfo.class}`}>
                      <span>{moodInfo.icon}</span>
                      <span>{moodInfo.label}</span>
                    </span>
                  </div>

                  {/* Word of the day badge */}
                  {e.wordOfTheDay && (
                    <div className="pt-2.5 pb-1">
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 tracking-wide">
                        Palabra: {e.wordOfTheDay}
                      </span>
                    </div>
                  )}

                  {/* Content snippets */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-700">
                    {e.philosophicalAnswer && (
                      <p className="line-clamp-2 text-indigo-200/90 italic font-serif">
                        "{e.philosophicalAnswer}"
                      </p>
                    )}

                    {e.freeReflection && (
                      <p className="line-clamp-3 leading-relaxed text-slate-700">
                        {e.freeReflection}
                      </p>
                    )}

                    {e.learnedToday && (
                      <p className="line-clamp-2 text-blue-300/90">
                        <strong className="text-blue-400 font-medium">Aprendí:</strong> {e.learnedToday}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[11px] text-slate-500">
                  <span className="group-hover:text-indigo-300 transition-colors flex items-center gap-1">
                    Ver o editar reflexión completa <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

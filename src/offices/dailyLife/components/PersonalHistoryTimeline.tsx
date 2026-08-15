import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { JournalEntry, LifeLesson, DailyHistoryRecord } from '../../../types/store';
import {
  BookOpen,
  Calendar,
  Search,
  Tag,
  Sparkles,
  Heart,
  ChevronRight,
  Filter,
  MessageSquare
} from 'lucide-react';
import { formatFriendlyDate } from '../../../utils/dates';

interface Props {
  journalEntries: JournalEntry[];
  lifeLessons: LifeLesson[];
  dailyHistory?: DailyHistoryRecord[];
}

type FilterType = 'all' | 'journal' | 'lessons';

export const PersonalHistoryTimeline: React.FC<Props> = ({
  journalEntries = [],
  lifeLessons = [],
  dailyHistory = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Group and sort historical items
  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      date: string;
      type: 'journal' | 'lesson';
      title: string;
      content: string;
      mood?: string;
      moodNote?: string;
      wentWell?: string;
      gratefulFor?: string;
      learnedToday?: string;
      tags?: string[];
    }> = [];

    // Add journal entries
    journalEntries.forEach(entry => {
      if (entry.freeReflection || entry.wentWell || entry.learnedToday || entry.mood) {
        items.push({
          id: entry.id,
          date: entry.date,
          type: 'journal',
          title: `Reflexión del día`,
          content: entry.freeReflection || entry.wentWell || entry.learnedToday || 'Registro de estado de ánimo',
          mood: entry.mood,
          moodNote: entry.moodNote,
          wentWell: entry.wentWell,
          gratefulFor: entry.gratefulFor,
          learnedToday: entry.learnedToday
        });
      }
    });

    // Add life lessons
    lifeLessons.forEach(lesson => {
      items.push({
        id: lesson.id,
        date: lesson.date,
        type: 'lesson',
        title: `💡 ${lesson.title}`,
        content: lesson.description,
        tags: lesson.tags
      });
    });

    // Sort descending by date
    items.sort((a, b) => b.date.localeCompare(a.date));

    // Filter by type & search
    return items.filter(item => {
      if (filterType === 'journal' && item.type !== 'journal') return false;
      if (filterType === 'lessons' && item.type !== 'lesson') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(query)))
        );
      }
      return true;
    });
  }, [journalEntries, lifeLessons, filterType, searchTerm]);

  const getMoodEmoji = (m?: string) => {
    switch (m) {
      case 'excelente': return '🌟';
      case 'bueno': return '😊';
      case 'neutro': return '🧘';
      case 'dificil': return '😔';
      case 'reflexivo': return '🌧️';
      default: return '✨';
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Mi Historia & Memoria Personal
            </h3>
            <p className="text-xs text-slate-400">
              Tus vivencias, reflexiones y aprendizajes a lo largo del tiempo.
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar memorias..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filterType === 'all'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilterType('journal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filterType === 'journal'
                  ? 'bg-slate-800 text-purple-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Diario
            </button>
            <button
              onClick={() => setFilterType('lessons')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filterType === 'lessons'
                  ? 'bg-slate-800 text-teal-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lecciones
            </button>
          </div>
        </div>
      </div>

      {/* Memory Timeline List */}
      {timelineItems.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-500 text-xs">
          No hay memorias registradas con este criterio de búsqueda.
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {timelineItems.map(item => (
            <motion.div
              key={item.id}
              layout
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-mono text-xs">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {formatFriendlyDate(item.date)}
                  </span>
                  {item.mood && (
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                      <span>{getMoodEmoji(item.mood)}</span>
                      <span className="capitalize">{item.mood}</span>
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    item.type === 'journal'
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                      : 'bg-teal-500/10 border border-teal-500/20 text-teal-300'
                  }`}
                >
                  {item.type === 'journal' ? 'Diario' : 'Lección'}
                </span>
              </div>

              {/* Mood Note */}
              {item.moodNote && (
                <div className="text-xs text-amber-200/90 italic bg-amber-950/20 border border-amber-500/20 p-2 rounded-xl">
                  "{item.moodNote}"
                </div>
              )}

              {/* Content / Reflection */}
              <p className="text-sm text-slate-200 leading-relaxed">
                {item.content}
              </p>

              {/* Extras if journal */}
              {item.type === 'journal' && (item.wentWell || item.gratefulFor) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {item.wentWell && (
                    <div className="bg-slate-900/60 p-2 rounded-xl text-xs text-slate-300 border border-slate-800">
                      <span className="text-amber-400 font-semibold block text-[10px]">
                        ⭐ Salió bien:
                      </span>
                      {item.wentWell}
                    </div>
                  )}
                  {item.gratefulFor && (
                    <div className="bg-slate-900/60 p-2 rounded-xl text-xs text-slate-300 border border-slate-800">
                      <span className="text-emerald-400 font-semibold block text-[10px]">
                        🙏 Agradezco:
                      </span>
                      {item.gratefulFor}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map(t => (
                    <span key={t} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

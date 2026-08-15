import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LifeLesson, LifeLessonType } from '../../../types/store';
import { PersonalDevStore } from '../../personalDev/PersonalDevStore';
import {
  Lightbulb,
  Plus,
  Trash2,
  Tag,
  BookOpen,
  Calendar,
  X,
  Sparkles
} from 'lucide-react';
import { formatFriendlyDate } from '../../../utils/dates';

interface Props {
  lessons: LifeLesson[];
  todayStr: string;
}

const CATEGORIES: Array<{ key: LifeLessonType; label: string; emoji: string }> = [
  { key: 'aprendizaje', label: 'Aprendizaje general', emoji: '💡' },
  { key: 'acierto', label: 'Acierto o descubrimiento', emoji: '⭐' },
  { key: 'error', label: 'Lección tras un error', emoji: '🔄' },
  { key: 'consejo', label: 'Consejo o conversación', emoji: '💬' },
  { key: 'idea', label: 'Libro o estudio', emoji: '📖' }
];

export const LearningMemoriesSection: React.FC<Props> = ({ lessons = [], todayStr }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<LifeLessonType>('aprendizaje');
  const [tagInput, setTagInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    PersonalDevStore.addLifeLesson({
      title: title.trim() || 'Aprendizaje de vida',
      description: description.trim() || title.trim(),
      type,
      date: todayStr,
      tags: tags.length > 0 ? tags : ['Crecimiento']
    });

    setTitle('');
    setDescription('');
    setTagInput('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    PersonalDevStore.deleteLifeLesson(id);
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🧠</span>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Lo que Aprendí
            </h3>
            <p className="text-xs text-slate-400">
              Banco de aprendizajes, descubrimientos de libros, universidad y vivencias.
            </p>
          </div>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Anotar aprendizaje</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300">
              "Hoy aprendí que..."
            </span>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título o resumen del aprendizaje..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                autoFocus
              />
            </div>

            <div>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="¿Por qué es importante o cómo lo aplicarás?..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Categoría
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Ej: Lectura, Economía, Relaciones..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim() && !description.trim()}
                className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold rounded-xl transition"
              >
                Guardar Aprendizaje
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Learnings Grid */}
      {lessons.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-400 text-xs">
          Aún no tienes aprendizajes guardados. Haz clic en "Anotar aprendizaje" para registrar tus reflexiones.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lessons.slice(0, 6).map(lesson => (
            <div
              key={lesson.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-2.5 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-300">
                    {lesson.type}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {formatFriendlyDate(lesson.date)}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100">
                  {lesson.title}
                </h4>
                {lesson.description && lesson.description !== lesson.title && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {lesson.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div className="flex flex-wrap gap-1">
                  {(lesson.tags || []).map(t => (
                    <span key={t} className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleDelete(lesson.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

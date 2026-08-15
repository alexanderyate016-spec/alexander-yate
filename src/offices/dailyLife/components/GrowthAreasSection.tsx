import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GrowthObjective } from '../../../types/store';
import { PersonalDevStore } from '../../personalDev/PersonalDevStore';
import {
  Compass,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatFriendlyDate } from '../../../utils/dates';

interface Props {
  objectives: GrowthObjective[];
}

export const GrowthAreasSection: React.FC<Props> = ({ objectives = [] }) => {
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Active note input per area
  const [activeAreaForNote, setActiveAreaForNote] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    PersonalDevStore.addGrowthObjective({
      title: newTitle.trim(),
      category: newCategory.trim() || 'Crecimiento',
      description: newDescription.trim()
    });

    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setShowAddAreaModal(false);
  };

  const handleAddNote = (objId: string) => {
    if (!noteInput.trim()) return;
    PersonalDevStore.addGrowthProgressNote(objId, noteInput.trim());
    setNoteInput('');
    setActiveAreaForNote(null);
  };

  const handleDelete = (id: string) => {
    PersonalDevStore.deleteGrowthObjective(id);
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌱</span>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              En qué estoy creciendo
            </h3>
            <p className="text-xs text-slate-400">
              Áreas de desarrollo a largo plazo donde cultivas hábitos, carácter y mentalidad.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddAreaModal(true)}
          className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva área</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {objectives.map(obj => {
          const notesCount = obj.progressNotes?.length || 0;
          const isNoteOpen = activeAreaForNote === obj.id;

          return (
            <div
              key={obj.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    {obj.category || 'Crecimiento'}
                  </span>
                  <button
                    onClick={() => handleDelete(obj.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Eliminar área"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-slate-100">
                  {obj.title}
                </h4>
                {obj.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {obj.description}
                  </p>
                )}
              </div>

              {/* Progress notes log */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                {obj.progressNotes && obj.progressNotes.length > 0 ? (
                  <div className="bg-slate-900/60 rounded-xl p-2.5 space-y-1 border border-slate-800/60 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Último avance ({formatFriendlyDate(obj.progressNotes[0].date)}):
                    </span>
                    <p className="text-slate-300 italic line-clamp-2">
                      "{obj.progressNotes[0].note}"
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Sin reflexiones registradas aún.
                  </p>
                )}

                {/* Inline Note Form */}
                {isNoteOpen ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Escribe tu reflexión o avance reciente..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setActiveAreaForNote(null);
                          setNoteInput('');
                        }}
                        className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleAddNote(obj.id)}
                        disabled={!noteInput.trim()}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-[11px] font-semibold rounded-lg"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveAreaForNote(obj.id);
                      setNoteInput('');
                    }}
                    className="w-full py-1.5 text-center text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition font-medium flex items-center justify-center gap-1 border border-dashed border-emerald-500/20"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Anotar avance</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Growth Area Modal */}
      {showAddAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-semibold text-slate-100">
                Nueva Área de Crecimiento
              </h4>
              <button
                onClick={() => setShowAddAreaModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArea} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre del área o aspiración
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ej: Ser más disciplinado, Mejorar mi oratoria..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Ej: Hábitos, Salud, Comunicación, Finanzas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Propósito o qué significa para ti
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Describe por qué deseas cultivar esta dimensión..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAreaModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl transition"
                >
                  Crear Área
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

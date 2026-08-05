import React, { useState, useMemo } from 'react';
import { LifeLesson, LifeLessonType } from '../../../types/store';
import { PersonalDevStore } from '../PersonalDevStore';
import { showToast, ExecutiveConfirmDialog, ExecutiveModal, ExecutiveButton, ExecutiveInput, ExecutiveEmptyState } from '../../../components/executive';
import {
  Lightbulb,
  Plus,
  Search,
  Tag,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Award,
  HelpCircle,
  Compass
} from 'lucide-react';

interface LifeLessonsModuleProps {
  lessons: LifeLesson[];
}

const TYPE_CONFIG: Record<LifeLessonType, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  aprendizaje: {
    label: 'Aprendizaje',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/30'
  },
  error: {
    label: 'Error Lección',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/30'
  },
  acierto: {
    label: 'Acierto',
    icon: <Award className="w-3.5 h-3.5" />,
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
  },
  consejo: {
    label: 'Consejo',
    icon: <Compass className="w-3.5 h-3.5" />,
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
  },
  idea: {
    label: 'Idea Clave',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
  }
};

export const LifeLessonsModule: React.FC<LifeLessonsModuleProps> = ({ lessons }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LifeLesson | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LifeLessonType>('aprendizaje');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsStr, setTagsStr] = useState('');

  // Delete State
  const [lessonToDelete, setLessonToDelete] = useState<LifeLesson | null>(null);

  // All unique tags across lessons
  const allTags = useMemo(() => {
    const set = new Set<string>();
    lessons.forEach(l => {
      if (l.tags && Array.isArray(l.tags)) {
        l.tags.forEach(t => set.add(t.trim().toLowerCase()));
      }
    });
    return Array.from(set).sort();
  }, [lessons]);

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      // Type Filter
      if (selectedType !== 'all' && l.type !== selectedType) {
        return false;
      }
      // Tag Filter
      if (selectedTag !== 'all') {
        const hasTag = l.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchDesc = l.description.toLowerCase().includes(q);
        const matchTags = l.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [lessons, searchQuery, selectedType, selectedTag]);

  const handleOpenCreateModal = () => {
    setEditingLesson(null);
    setTitle('');
    setType('aprendizaje');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTagsStr('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lesson: LifeLesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setType(lesson.type);
    setDescription(lesson.description);
    setDate(lesson.date);
    setTagsStr(lesson.tags ? lesson.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Por favor completa el título y la descripción', 'error');
      return;
    }

    const tagsArray = tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingLesson) {
      PersonalDevStore.updateLifeLesson(editingLesson.id, {
        title: title.trim(),
        type,
        description: description.trim(),
        date,
        tags: tagsArray
      });
      showToast('✓ Lección actualizada correctamente', 'success');
    } else {
      PersonalDevStore.addLifeLesson({
        title: title.trim(),
        type,
        description: description.trim(),
        date,
        tags: tagsArray
      });
      showToast('✓ Lección registrada con éxito', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (lessonToDelete) {
      PersonalDevStore.deleteLifeLesson(lessonToDelete.id);
      showToast('✓ Lección eliminada correctamente', 'success');
      setLessonToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Lesson Action */}
      <div className="bg-[#0F1B2E]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-white text-base tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-400 stroke-[1.75]" />
            Lecciones de Vida & Sabiduría Acumulada
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro duradero de aprendizajes, errores superados, aciertos y consejos clave
          </p>
        </div>

        <ExecutiveButton
          onClick={handleOpenCreateModal}
          variant="primary"
          accentColor="indigo"
          icon={<Plus className="w-4 h-4" />}
        >
          Nueva Lección
        </ExecutiveButton>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#0F1B2E]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-3">
        {/* Text Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar en lecciones por título, contenido o etiqueta..."
            className="w-full bg-[#070D18] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all"
          />
        </div>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="w-full md:w-48 bg-[#070D18] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 transition-all"
        >
          <option value="all">Todos los tipos</option>
          <option value="aprendizaje">💡 Aprendizaje</option>
          <option value="error">⚠️ Error Lección</option>
          <option value="acierto">🏆 Acierto</option>
          <option value="consejo">🧭 Consejo</option>
          <option value="idea">💡 Idea Clave</option>
        </select>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="w-full md:w-48 bg-[#070D18] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 transition-all"
          >
            <option value="all">Todas las etiquetas</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <ExecutiveEmptyState
          icon={<Lightbulb className="w-8 h-8 text-indigo-400" />}
          title="No hay lecciones registradas"
          description="Guarda lecciones clave sobre tus aprendizajes, errores y aciertos para consultar en el futuro."
          actionLabel="Registrar Primera Lección"
          onAction={handleOpenCreateModal}
          accentColor="indigo"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map(lesson => {
            const typeConf = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.aprendizaje;
            return (
              <div
                key={lesson.id}
                className="bg-[#0F1B2E]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group"
              >
                {/* Top reflection */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${typeConf.badgeClass}`}>
                      {typeConf.icon}
                      <span>{typeConf.label}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(lesson)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Editar Lección"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setLessonToDelete(lesson)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar Lección"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-sans font-semibold text-white text-sm sm:text-base tracking-tight pt-3 pb-1">
                    {lesson.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {lesson.description}
                  </p>
                </div>

                {/* Footer tags and date */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex flex-wrap gap-1">
                    {lesson.tags && lesson.tags.map((t, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400 shrink-0">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {lesson.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create/Edit Lesson */}
      <ExecutiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? 'Editar Lección de Vida' : 'Nueva Lección de Vida'}
        subtitle="Registra principios, aprendizajes y verdades descubiertas en tu experiencia"
        icon={<Lightbulb className="w-5 h-5 text-indigo-400" />}
        accentColor="indigo"
        maxWidth="md"
      >
        <form onSubmit={handleSaveLesson} className="space-y-4">
          <ExecutiveInput
            label="Título de la Lección *"
            placeholder="Ej. Nunca tomar decisiones importantes bajo cansancio"
            value={title}
            onChange={e => setTitle(e.target.value)}
            accentColor="indigo"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300 block">Tipo de Lección *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as LifeLessonType)}
                className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="aprendizaje">💡 Aprendizaje</option>
                <option value="error">⚠️ Error Lección</option>
                <option value="acierto">🏆 Acierto</option>
                <option value="consejo">🧭 Consejo</option>
                <option value="idea">💡 Idea Clave</option>
              </select>
            </div>

            <ExecutiveInput
              label="Fecha *"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              accentColor="indigo"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300 block">Descripción y Contexto *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Explica detalladamente la experiencia y la enseñanza práctica que dejó..."
              className="w-full bg-[#070D18] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-all"
              required
            />
          </div>

          <ExecutiveInput
            label="Etiquetas (separadas por comas)"
            placeholder="Ej: disciplina, decisiones, salud, caracter"
            value={tagsStr}
            onChange={e => setTagsStr(e.target.value)}
            accentColor="indigo"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <ExecutiveButton
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </ExecutiveButton>
            <ExecutiveButton
              type="submit"
              variant="primary"
              accentColor="indigo"
              icon={<CheckCircle2 className="w-4 h-4 stroke-[2]" />}
            >
              Guardar Lección
            </ExecutiveButton>
          </div>
        </form>
      </ExecutiveModal>

      {/* Confirm Delete Dialog */}
      <ExecutiveConfirmDialog
        isOpen={!!lessonToDelete}
        title="Eliminar Lección"
        message={`¿Estás seguro de que deseas eliminar permanentemente la lección "${lessonToDelete?.title}"?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setLessonToDelete(null)}
      />
    </div>
  );
};

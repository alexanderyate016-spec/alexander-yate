import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalMood } from '../../../types/store';
import { PersonalDevStore } from '../PersonalDevStore';
import { getQuestionForDate } from '../PhilosophicalQuestions';
import { showToast } from '../../../components/executive';
import {
  Feather,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Trash2,
  Smile,
  Meh,
  Frown,
  HelpCircle,
  Sun,
  Award,
  Lightbulb,
  HeartHandshake,
  Compass,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ExecutiveButton, ExecutiveConfirmDialog } from '../../../components/executive';

interface JournalEditorProps {
  selectedDate: string;
  entry?: JournalEntry;
  onSaveSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

const MOOD_OPTIONS: { key: JournalMood; label: string; icon: string; color: string; activeClass: string }[] = [
  { key: 'excelente', label: 'Excelente', icon: '✨', color: 'emerald', activeClass: 'bg-emerald-500/25 border-emerald-400 text-emerald-200' },
  { key: 'bueno', label: 'Bueno', icon: '🙂', color: 'blue', activeClass: 'bg-blue-500/25 border-blue-400 text-blue-200' },
  { key: 'neutro', label: 'Neutro', icon: '😐', color: 'amber', activeClass: 'bg-amber-500/25 border-amber-400 text-amber-200' },
  { key: 'reflexivo', label: 'Reflexivo', icon: '🤔', color: 'indigo', activeClass: 'bg-indigo-500/25 border-indigo-400 text-indigo-200' },
  { key: 'dificil', label: 'Difícil', icon: '🌧️', color: 'rose', activeClass: 'bg-rose-500/25 border-rose-400 text-rose-200' }
];

const SUGGESTED_WORDS = [
  'Constancia', 'Gratitud', 'Esperanza', 'Disciplina', 'Enfoque',
  'Paz', 'Superación', 'Resiliencia', 'Claridad', 'Serenidad', 'Determinación'
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  selectedDate,
  entry,
  onSaveSuccess,
  onDeleteSuccess
}) => {
  // Form state initialized from entry or empty
  const [wordOfTheDay, setWordOfTheDay] = useState('');
  const [mood, setMood] = useState<JournalMood>('reflexivo');
  const [bestThingToday, setBestThingToday] = useState('');
  const [learnedToday, setLearnedToday] = useState('');
  const [improveTomorrow, setImproveTomorrow] = useState('');
  const [importantDecision, setImportantDecision] = useState('');
  const [gratefulFor, setGratefulFor] = useState('');
  const [freeReflection, setFreeReflection] = useState('');
  const [philosophicalAnswer, setPhilosophicalAnswer] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state whenever selectedDate or entry changes
  useEffect(() => {
    if (entry) {
      setWordOfTheDay(entry.wordOfTheDay || '');
      setMood(entry.mood || 'reflexivo');
      setBestThingToday(entry.bestThingToday || '');
      setLearnedToday(entry.learnedToday || entry.learned || '');
      setImproveTomorrow(entry.improveTomorrow || entry.improve || '');
      setImportantDecision(entry.importantDecision || entry.decisions || '');
      setGratefulFor(entry.gratefulFor || '');
      setFreeReflection(entry.freeReflection || entry.reflection || '');
      setPhilosophicalAnswer(entry.philosophicalAnswer || '');
    } else {
      setWordOfTheDay('');
      setMood('reflexivo');
      setBestThingToday('');
      setLearnedToday('');
      setImproveTomorrow('');
      setImportantDecision('');
      setGratefulFor('');
      setFreeReflection('');
      setPhilosophicalAnswer('');
    }
  }, [selectedDate, entry]);

  // Philosophical question for selected date
  const questionInfo = getQuestionForDate(selectedDate);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    PersonalDevStore.saveJournalEntry({
      date: selectedDate,
      wordOfTheDay: wordOfTheDay.trim(),
      mood,
      bestThingToday: bestThingToday.trim(),
      learnedToday: learnedToday.trim(),
      improveTomorrow: improveTomorrow.trim(),
      importantDecision: importantDecision.trim(),
      gratefulFor: gratefulFor.trim(),
      freeReflection: freeReflection.trim(),
      philosophicalAnswer: philosophicalAnswer.trim()
    });

    showToast(`✓ Reflexión del ${selectedDate} guardada exitosamente`, 'success');
    if (onSaveSuccess) onSaveSuccess();
  };

  const handleDelete = () => {
    if (entry?.id) {
      PersonalDevStore.deleteJournalEntry(entry.id);
      showToast('✓ Entrada eliminada correctamente', 'success');
      setIsDeleting(false);
      if (onDeleteSuccess) onDeleteSuccess();
    }
  };

  // Format date display
  const dateFormatted = React.useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="bg-[#0F1B2E]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Top Glass Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Feather className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 block">
              Cuaderno Personal de Reflexión
            </span>
            <h2 className="text-lg sm:text-xl font-sans font-semibold text-white capitalize tracking-tight">
              {dateFormatted}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {entry && (
            <button
              onClick={() => setIsDeleting(true)}
              className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all active:scale-95"
              title="Eliminar entrada de este día"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <ExecutiveButton
            onClick={handleSave}
            variant="primary"
            accentColor="indigo"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4 stroke-[2]" />}
          >
            Guardar Diario
          </ExecutiveButton>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. PALABRA DEL DÍA & ESTADO DE ÁNIMO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PALABRA DEL DÍA */}
          <div className="space-y-2.5 bg-[#0B1528]/60 p-4 rounded-xl border border-white/10">
            <label className="block text-xs font-medium text-slate-300">
              Palabra del Día <span className="text-indigo-400 font-normal">(Resumen Emocional)</span>
            </label>
            <input
              type="text"
              value={wordOfTheDay}
              onChange={e => setWordOfTheDay(e.target.value)}
              placeholder="Ej. Constancia, Gratitud, Esperanza..."
              maxLength={30}
              className="w-full bg-[#070D18] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/80 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans font-semibold tracking-wide"
            />
            {/* Quick Word Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_WORDS.map(word => (
                <button
                  type="button"
                  key={word}
                  onClick={() => setWordOfTheDay(word)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    wordOfTheDay === word
                      ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 font-medium'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* ESTADO DE ÁNIMO */}
          <div className="space-y-2.5 bg-[#0B1528]/60 p-4 rounded-xl border border-white/10">
            <label className="block text-xs font-medium text-slate-300">
              Estado de Ánimo del Día
            </label>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {MOOD_OPTIONS.map(m => {
                const isSelected = mood === m.key;
                return (
                  <button
                    type="button"
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? m.activeClass + ' shadow-md font-semibold'
                        : 'bg-[#070D18] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg leading-none mb-1">{m.icon}</span>
                    <span className="text-[10px] truncate max-w-full">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. PREGUNTA FILOSÓFICA DEL DÍA */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-[#0B1528]/80 to-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-4 h-4 stroke-[1.75]" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pregunta Filosófica {questionInfo.index} de {questionInfo.total}
              </span>
            </div>
            <span className="text-[10px] text-indigo-300/70 font-mono">
              Autoconocimiento
            </span>
          </div>

          <p className="text-sm sm:text-base font-serif italic text-white leading-relaxed pl-1">
            "{questionInfo.question}"
          </p>

          <div>
            <textarea
              value={philosophicalAnswer}
              onChange={e => setPhilosophicalAnswer(e.target.value)}
              rows={3}
              placeholder="Escribe tu respuesta honesta y profunda a la pregunta de hoy..."
              className="w-full bg-[#070D18]/90 border border-indigo-500/30 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/80 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* 3. PREGUNTAS ESTRUCTURADAS DE REFLEXIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Lo mejor que ocurrió hoy */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              ¿Qué fue lo mejor que ocurrió hoy?
            </label>
            <textarea
              value={bestThingToday}
              onChange={e => setBestThingToday(e.target.value)}
              rows={2}
              placeholder="Momentos positivos, aciertos, alegrías..."
              className="w-full bg-[#0B1528]/80 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans"
            />
          </div>

          {/* Aprendizaje del día */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
              ¿Qué aprendí hoy?
            </label>
            <textarea
              value={learnedToday}
              onChange={e => setLearnedToday(e.target.value)}
              rows={2}
              placeholder="Nuevas lecciones, descubrimientos..."
              className="w-full bg-[#0B1528]/80 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans"
            />
          </div>

          {/* Por mejorar */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              ¿Qué debo mejorar?
            </label>
            <textarea
              value={improveTomorrow}
              onChange={e => setImproveTomorrow(e.target.value)}
              rows={2}
              placeholder="Actitudes, acciones o enfoques a pulir..."
              className="w-full bg-[#0B1528]/80 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans"
            />
          </div>

          {/* Decisión importante */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              ¿Qué decisión importante tomé?
            </label>
            <textarea
              value={importantDecision}
              onChange={e => setImportantDecision(e.target.value)}
              rows={2}
              placeholder="Resoluciones, elecciones clave..."
              className="w-full bg-[#0B1528]/80 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans"
            />
          </div>
        </div>

        {/* Gratitud */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            ¿Qué agradezco hoy?
          </label>
          <input
            type="text"
            value={gratefulFor}
            onChange={e => setGratefulFor(e.target.value)}
            placeholder="Personas, salud, oportunidades, detalles sencillos..."
            className="w-full bg-[#0B1528]/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans"
          />
        </div>

        {/* Reflexión Libre */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-indigo-400" />
            Reflexión Libre
          </label>
          <textarea
            value={freeReflection}
            onChange={e => setFreeReflection(e.target.value)}
            rows={5}
            placeholder="Escribe libremente sobre tus pensamientos, sentimientos o reflexiones del día sin restricciones..."
            className="w-full bg-[#0B1528]/80 border border-white/15 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans leading-relaxed"
          />
        </div>

        {/* Action Bottom */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <ExecutiveButton
            type="submit"
            variant="primary"
            accentColor="indigo"
            size="lg"
            icon={<CheckCircle2 className="w-4 h-4 stroke-[2]" />}
          >
            Guardar Diario del Día
          </ExecutiveButton>
        </div>
      </form>

      {/* Confirm Deletion Modal */}
      <ExecutiveConfirmDialog
        isOpen={isDeleting}
        title="Eliminar Entrada de Diario"
        message={`¿Estás seguro de que deseas eliminar permanentemente la entrada del diario correspondiente al ${selectedDate}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Definitivamente"
        cancelLabel="Cancelar"
        isDanger={true}
        onConfirm={handleDelete}
        onClose={() => setIsDeleting(false)}
      />
    </div>
  );
};

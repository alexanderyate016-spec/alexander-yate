import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry, JournalMood } from '../../../types/store';
import { PersonalDevStore } from '../PersonalDevStore';
import { DayContextDetector, DayContextSummary, DetectedDayEvent } from '../DayContextDetector';
import { PersonalReflectionEngine, ReflectionResult } from '../PersonalReflectionEngine';
import { showToast, ExecutiveButton, ExecutiveConfirmDialog } from '../../../components/executive';
import {
  Feather,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Sun,
  Lightbulb,
  Compass,
  HeartHandshake,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  History,
  ShieldCheck,
  Star,
  Zap,
  Smile,
  GraduationCap,
  FileText,
  Activity,
  UserCheck,
  CheckSquare,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';

interface MiDiaExperienceProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  journalEntries: JournalEntry[];
  onSaveSuccess?: () => void;
}

const MOOD_OPTIONS: { key: JournalMood; label: string; icon: string; activeClass: string }[] = [
  { key: 'excelente', label: 'Excelente', icon: '✨', activeClass: 'bg-emerald-500/25 border-emerald-400 text-emerald-200' },
  { key: 'bueno', label: 'Bueno', icon: '🙂', activeClass: 'bg-blue-500/25 border-blue-400 text-blue-200' },
  { key: 'neutro', label: 'Neutro', icon: '😐', activeClass: 'bg-amber-500/25 border-amber-400 text-amber-200' },
  { key: 'reflexivo', label: 'Reflexivo', icon: '🤔', activeClass: 'bg-indigo-500/25 border-indigo-400 text-indigo-200' },
  { key: 'dificil', label: 'Difícil', icon: '🌧️', activeClass: 'bg-rose-500/25 border-rose-400 text-rose-200' }
];

const SUGGESTED_WORDS = [
  'Constancia', 'Gratitud', 'Enfoque', 'Paz', 'Superación',
  'Resiliencia', 'Claridad', 'Serenidad', 'Determinación', 'Aceptación'
];

export const MiDiaExperience: React.FC<MiDiaExperienceProps> = ({
  selectedDate,
  onSelectDate,
  journalEntries,
  onSaveSuccess
}) => {
  const currentEntry = useMemo(() => {
    return PersonalDevStore.getEntryForDate(selectedDate);
  }, [selectedDate, journalEntries]);

  // Form State
  const [wordOfTheDay, setWordOfTheDay] = useState('');
  const [mood, setMood] = useState<JournalMood>('reflexivo');
  const [freeReflection, setFreeReflection] = useState('');
  const [contextualAnswer, setContextualAnswer] = useState('');
  const [philosophicalAnswer, setPhilosophicalAnswer] = useState('');

  // Momentos del día (Opcionales)
  const [wentWell, setWentWell] = useState('');
  const [learnedToday, setLearnedToday] = useState('');
  const [overcame, setOvercame] = useState('');
  const [enjoyed, setEnjoyed] = useState('');
  const [improveTomorrow, setImproveTomorrow] = useState('');

  // UI Toggles
  const [showOptionalMoments, setShowOptionalMoments] = useState(false);
  const [showSummaryClose, setShowSummaryClose] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state whenever selectedDate or entry changes
  useEffect(() => {
    if (currentEntry) {
      setWordOfTheDay(currentEntry.wordOfTheDay || '');
      setMood(currentEntry.mood || 'reflexivo');
      setFreeReflection(currentEntry.freeReflection || currentEntry.reflection || '');
      setContextualAnswer(currentEntry.contextualAnswer || '');
      setPhilosophicalAnswer(currentEntry.philosophicalAnswer || '');
      setWentWell(currentEntry.wentWell || currentEntry.bestThingToday || '');
      setLearnedToday(currentEntry.learnedToday || currentEntry.learned || '');
      setOvercame(currentEntry.overcame || '');
      setEnjoyed(currentEntry.enjoyed || '');
      setImproveTomorrow(currentEntry.improveTomorrow || currentEntry.improve || '');

      if (currentEntry.wentWell || currentEntry.overcame || currentEntry.enjoyed) {
        setShowOptionalMoments(true);
      }
    } else {
      setWordOfTheDay('');
      setMood('reflexivo');
      setFreeReflection('');
      setContextualAnswer('');
      setPhilosophicalAnswer('');
      setWentWell('');
      setLearnedToday('');
      setOvercame('');
      setEnjoyed('');
      setImproveTomorrow('');
      setShowOptionalMoments(false);
    }
  }, [selectedDate, currentEntry]);

  // Query Tienda Casablanca for events on selectedDate
  const dayContext: DayContextSummary = useMemo(() => {
    return DayContextDetector.getContextForDate(selectedDate);
  }, [selectedDate]);

  // Analyze day context and user writings
  const reflectionResult: ReflectionResult = useMemo(() => {
    return PersonalReflectionEngine.analyzeDay(
      dayContext,
      {
        date: selectedDate,
        wordOfTheDay,
        mood,
        freeReflection,
        wentWell,
        learnedToday,
        overcame,
        enjoyed,
        improveTomorrow
      },
      journalEntries
    );
  }, [dayContext, selectedDate, wordOfTheDay, mood, freeReflection, wentWell, learnedToday, overcame, enjoyed, improveTomorrow, journalEntries]);

  // Format date display
  const dateFormatted = useMemo(() => {
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

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    PersonalDevStore.saveJournalEntry({
      date: selectedDate,
      wordOfTheDay: wordOfTheDay.trim(),
      mood,
      freeReflection: freeReflection.trim(),
      contextualAnswer: contextualAnswer.trim(),
      philosophicalAnswer: philosophicalAnswer.trim(),
      wentWell: wentWell.trim(),
      bestThingToday: wentWell.trim(),
      learnedToday: learnedToday.trim(),
      overcame: overcame.trim(),
      enjoyed: enjoyed.trim(),
      improveTomorrow: improveTomorrow.trim()
    });

    showToast(`✓ Reflexión del ${selectedDate} guardada en tu Diario Personal`, 'success');
    if (onSaveSuccess) onSaveSuccess();
  };

  const handleDelete = () => {
    if (currentEntry?.id) {
      PersonalDevStore.deleteJournalEntry(currentEntry.id);
      showToast('✓ Entrada eliminada correctamente', 'success');
      setIsDeleting(false);
      if (onSaveSuccess) onSaveSuccess();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. SELECCIÓN DE FECHA & ENCABEZADO DE "MI DÍA" */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#0F1B2E] to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-lg">
            <Feather className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Mi Día
              </span>
              <span className="text-xs text-slate-700 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Contexto activo de la Tienda Casablanca
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 capitalize tracking-tight mt-1">
              {dateFormatted}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <input
            type="date"
            value={selectedDate}
            onChange={e => onSelectDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-indigo-400/30"
          />
          {currentEntry && (
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
            Guardar Día
          </ExecutiveButton>
        </div>
      </div>

      {/* 2. EXPERIENCIA "MI DÍA": Detección de Acontecimientos Reales de Casablanca */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="text-xl">{dayContext.highlightEmoji}</span>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Lo que ocurrió hoy en tus Oficinas
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {dayContext.totalEventsCount} acontecimiento(s) detectado(s)
          </span>
        </div>

        {/* Dynamic Highlight Prompt */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-[#0B1528] to-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 text-base">
            {dayContext.highlightEmoji}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 block">
              Observatorio de Vida
            </span>
            <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
              {dayContext.highlightPrompt}
            </p>
          </div>
        </div>

        {/* Events Cards Grid */}
        {dayContext.hasEvents ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Prácticas */}
            {dayContext.practices.map(p => (
              <div key={p.id} className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">🎓</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Práctica Académica</span>
                  <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                  {p.details && <p className="text-[11px] text-slate-700 truncate">{p.details}</p>}
                </div>
              </div>
            ))}

            {/* Exámenes */}
            {dayContext.exams.map(ex => (
              <div key={ex.id} className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">📝</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Examen / Evaluación</span>
                  <p className="font-semibold text-slate-900 truncate">{ex.title}</p>
                  {ex.details && <p className="text-[11px] text-slate-700 truncate">{ex.details}</p>}
                </div>
              </div>
            ))}

            {/* Clases */}
            {dayContext.classes.map(cl => (
              <div key={cl.id} className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">🏫</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Clase Programada</span>
                  <p className="font-semibold text-slate-900 truncate">{cl.title}</p>
                  {cl.time && <p className="text-[10px] text-blue-300/80 font-mono">{cl.time}</p>}
                </div>
              </div>
            ))}

            {/* Citas Médicas */}
            {dayContext.appointments.map(ap => (
              <div key={ap.id} className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">🩺</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Compromiso Salud</span>
                  <p className="font-semibold text-slate-900 truncate">{ap.title}</p>
                  {ap.details && <p className="text-[11px] text-slate-700 truncate">{ap.details}</p>}
                </div>
              </div>
            ))}

            {/* Compromisos Sociales */}
            {dayContext.commitments.map(cm => (
              <div key={cm.id} className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">🤝</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Vida Social</span>
                  <p className="font-semibold text-slate-900 truncate">{cm.title}</p>
                  {cm.details && <p className="text-[11px] text-slate-700 truncate">{cm.details}</p>}
                </div>
              </div>
            ))}

            {/* Hábitos y Tareas */}
            {dayContext.tasks.map(t => (
              <div key={t.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-200 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">✅</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tarea Registrada</span>
                  <p className="font-semibold text-slate-900 truncate">{t.title}</p>
                </div>
              </div>
            ))}

            {dayContext.habits.map(h => (
              <div key={h.id} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-xs">
                <span className="text-base shrink-0">{h.icon}</span>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Hábito Completado</span>
                  <p className="font-semibold text-slate-900 truncate">{h.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-500 italic flex items-center gap-2">
            <span>🍃</span>
            <span>No hay clases, prácticas ni tareas registradas en otras oficinas para este día. Es una jornada en calma.</span>
          </div>
        )}
      </div>

      {/* 3. DIARIO PERSONAL: Libre Escritura y Estado de Ánimo */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
              Reflexión Principal
            </span>
            <h3 className="text-base font-semibold text-slate-900">
              ¿Qué quieres dejar de este día?
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Estado de ánimo:</span>
            <div className="flex items-center gap-1">
              {MOOD_OPTIONS.map(m => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 border ${
                    mood === m.key
                      ? m.activeClass + ' font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                  title={m.label}
                >
                  <span>{m.icon}</span>
                  <span className="hidden sm:inline text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Palabra del Día */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700">
            Palabra del Día <span className="text-indigo-400 font-normal">(Esencia en una sola palabra)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={wordOfTheDay}
              onChange={e => setWordOfTheDay(e.target.value)}
              placeholder="Ej. Constancia, Gratitud, Claridad..."
              maxLength={30}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-indigo-400/30 font-semibold"
            />
            <div className="flex flex-wrap gap-1.5 items-center">
              {SUGGESTED_WORDS.slice(0, 6).map(w => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWordOfTheDay(w)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                    wordOfTheDay === w
                      ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Libre Escritura Textarea */}
        <div className="space-y-2">
          <textarea
            value={freeReflection}
            onChange={e => setFreeReflection(e.target.value)}
            rows={5}
            placeholder="Escribe libremente lo que viviste, pensaste o sentiste hoy... Acontecimientos, emociones, aprendizajes o simplemente algo que quieras recordar."
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-indigo-400/30 transition-all leading-relaxed font-sans"
          />
        </div>
      </div>

      {/* 4. REFLEXIÓN SOBRE LO QUE REALMENTE PASÓ & PREGUNTA FILOSÓFICA & MEMORIA */}
      <div className="space-y-6">
        {/* A) Reflexión Contextual sobre lo que pasó */}
        {reflectionResult.contextualQuestion && (
          <div className="bg-gradient-to-r from-indigo-950/60 via-[#0E182A] to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Reflexión sobre lo que realmente pasó
              </span>
            </div>
            <p className="text-sm font-sans font-medium text-slate-900 leading-relaxed">
              "{reflectionResult.contextualQuestion}"
            </p>
            <textarea
              value={contextualAnswer}
              onChange={e => setContextualAnswer(e.target.value)}
              rows={2}
              placeholder="Tu respuesta sincera..."
              className="w-full bg-slate-50/90 border border-indigo-500/30 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
            />
          </div>
        )}

        {/* B) Pregunta Filosófica (O nota de día tranquilo) */}
        {!reflectionResult.isQuietDay && reflectionResult.philosophicalQuestion ? (
          <div className="bg-gradient-to-r from-purple-950/50 via-[#120E22] to-indigo-950/50 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-purple-300">
              <Compass className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pregunta Filosófica de tu Vida Real
              </span>
            </div>
            <p className="text-sm sm:text-base font-serif italic text-slate-900 leading-relaxed">
              "{reflectionResult.philosophicalQuestion}"
            </p>
            <textarea
              value={philosophicalAnswer}
              onChange={e => setPhilosophicalAnswer(e.target.value)}
              rows={3}
              placeholder="Profundiza sobre tu escala de valores y la persona que estás construyendo..."
              className="w-full bg-slate-50/90 border border-purple-500/30 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
            />
          </div>
        ) : (
          <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Parece que hoy fue un día tranquilo. No hay una reflexión filosófica forzada.</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">Paz y serenidad</span>
          </div>
        )}

        {/* C) Memoria y Continuidad (Si existe contraste o historial) */}
        {reflectionResult.continuityMemory && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#0B1A1E] to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <History className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Memoria y Continuidad ({reflectionResult.continuityMemory.pastDate})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/40 p-3 rounded-xl border border-slate-200/40">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Anteriormente ({reflectionResult.continuityMemory.pastDate})</span>
                <p className="italic text-slate-700">"{reflectionResult.continuityMemory.pastExcerpt}"</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">Hoy ({selectedDate})</span>
                <p className="italic text-slate-900 font-medium">"{reflectionResult.continuityMemory.todayExcerpt}"</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-sans font-semibold text-emerald-200 pt-1">
              {reflectionResult.continuityMemory.reflectionQuestion}
            </p>
          </div>
        )}
      </div>

      {/* 5. MOMENTOS DEL DÍA (Opcionales) */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
        <button
          onClick={() => setShowOptionalMoments(!showOptionalMoments)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-900 hover:text-indigo-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Momentos del Día (Opcionales)</span>
            <span className="text-[10px] font-normal text-slate-500">(Salió bien, aprendí, superé, disfruté, por mejorar)</span>
          </div>
          {showOptionalMoments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showOptionalMoments && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 animate-fade-in">
            {/* ⭐ Salió bien */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> ⭐ Algo que salió bien
              </label>
              <input
                type="text"
                value={wentWell}
                onChange={e => setWentWell(e.target.value)}
                placeholder="Un logro, un acierto..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* 🧠 Aprendí */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" /> 🧠 Algo que aprendí
              </label>
              <input
                type="text"
                value={learnedToday}
                onChange={e => setLearnedToday(e.target.value)}
                placeholder="Un concepto, una lección..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* 💪 Superé */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> 💪 Algo que superé
              </label>
              <input
                type="text"
                value={overcame}
                onChange={e => setOvercame(e.target.value)}
                placeholder="Un obstáculo o incomodidad vencida..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* ❤️ Disfruté */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" /> ❤️ Algo que disfruté
              </label>
              <input
                type="text"
                value={enjoyed}
                onChange={e => setEnjoyed(e.target.value)}
                placeholder="Un detalle sencillo, una conversación..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* ⚠️ Quiero mejorar */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" /> ⚠️ Algo que quiero mejorar
              </label>
              <input
                type="text"
                value={improveTomorrow}
                onChange={e => setImproveTomorrow(e.target.value)}
                placeholder="Un aspecto de paciencia, enfoque o actitud..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. CIERRE DEL DÍA (Resumen Visual) */}
      <div className="bg-gradient-to-b from-[#0B1426] to-[#060B15] border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                Resumen de Cierre
              </span>
              <h3 className="text-lg font-sans font-semibold text-slate-900">
                Mi Día ({selectedDate})
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono text-indigo-300 bg-indigo-950 px-3 py-1 rounded-xl border border-indigo-500/30">
            Palabra: {wordOfTheDay || '—'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Lo que ocurrió */}
          <div className="flex items-start gap-2.5">
            <span className="text-base">🎓</span>
            <div>
              <span className="font-bold text-indigo-300">Lo que ocurrió:</span>{' '}
              <span className="text-slate-300">
                {dayContext.hasEvents
                  ? `${dayContext.totalEventsCount} acontecimiento(s) en tu agenda/oficinas.`
                  : 'Un día en calma y sin sobrecarga de compromisos.'}
              </span>
            </div>
          </div>

          {/* Lo que aprendí */}
          {learnedToday && (
            <div className="flex items-start gap-2.5">
              <span className="text-base">🧠</span>
              <div>
                <span className="font-bold text-blue-300">Lo que aprendí:</span>{' '}
                <span className="text-slate-300">{learnedToday}</span>
              </div>
            </div>
          )}

          {/* Lo que logré */}
          {(wentWell || overcame) && (
            <div className="flex items-start gap-2.5">
              <span className="text-base">🏆</span>
              <div>
                <span className="font-bold text-emerald-300">Lo que logré:</span>{' '}
                <span className="text-slate-300">{wentWell || overcame}</span>
              </div>
            </div>
          )}

          {/* Lo que quiero mejorar */}
          {improveTomorrow && (
            <div className="flex items-start gap-2.5">
              <span className="text-base">🌱</span>
              <div>
                <span className="font-bold text-purple-300">Lo que quiero mejorar:</span>{' '}
                <span className="text-slate-300">{improveTomorrow}</span>
              </div>
            </div>
          )}

          {/* Reflexión */}
          {(freeReflection || contextualAnswer || philosophicalAnswer) && (
            <div className="flex items-start gap-2.5">
              <span className="text-base">💭</span>
              <div>
                <span className="font-bold text-amber-300">Reflexión que surgió:</span>{' '}
                <span className="text-slate-300 italic">
                  "{freeReflection || contextualAnswer || philosophicalAnswer}"
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cierre final prompt */}
        <div className="pt-4 border-t border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-indigo-200 font-medium italic">
            ¿Hay algo más que quieras guardar de hoy?
          </p>

          <ExecutiveButton
            onClick={handleSave}
            variant="primary"
            accentColor="indigo"
            size="lg"
            icon={<CheckCircle2 className="w-5 h-5 stroke-[2]" />}
          >
            Guardar Día de Hoy
          </ExecutiveButton>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      <ExecutiveConfirmDialog
        isOpen={isDeleting}
        title="Eliminar Entrada de Diario"
        message={`¿Estás seguro de que deseas eliminar permanentemente la entrada del diario del ${selectedDate}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Definitivamente"
        cancelLabel="Cancelar"
        isDanger={true}
        onConfirm={handleDelete}
        onClose={() => setIsDeleting(false)}
      />
    </div>
  );
};

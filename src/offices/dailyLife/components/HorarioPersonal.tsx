import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TimePlan, AcademicSubject, MasterState, UnifiedExecutiveEvent } from '../../../types/store';
import { storeInstance } from '../../../store/CasaBlancaStore';
import { DailyLifeStore } from '../DailyLifeStore';
import { DailyLifeCalculations } from '../DailyLifeCalculations';
import { OvalOfficeCalculations } from '../../ovalOffice/OvalOfficeCalculations';
import { MedicalCalculations } from '../../medical/MedicalCalculations';
import { checkColombianHoliday } from '../../../utils/colombianHolidays';
import { getTodayDateString, addDaysToDateStr, formatFriendlyDate } from '../../../utils/dates';
import {
  GlassPanel,
  ExecutiveButton,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveModal,
  ExecutiveInput,
  ExecutiveSelect
} from '../../../components/executive';
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Moon,
  Flame,
  CheckSquare,
  Lock,
  Zap,
  Activity,
  Layers,
  Check,
  Flag
} from 'lucide-react';

interface Props {
  selectedDateStr?: string;
}

export const HorarioPersonal: React.FC<Props> = ({ selectedDateStr }) => {
  const [currentDate, setCurrentDate] = useState<string>(selectedDateStr || getTodayDateString());
  const todayStr = getTodayDateString();

  // Toast State
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get full store state reactively
  const fullState = storeInstance.getState();
  const dailyLifeData = fullState.offices.vidaDiaria;
  const academicSubjects = fullState.offices.academica?.subjects || [];

  // Holiday & Weekend Check
  const holidayInfo = useMemo(() => checkColombianHoliday(currentDate), [currentDate]);
  const isWeekend = useMemo(() => {
    const d = new Date(currentDate + 'T12:00:00');
    const day = d.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }, [currentDate]);

  // 1. Get Fixed Events across all offices (Clases, Citas, Pagos, Compromisos Sociales)
  const rawFixedEvents = useMemo(() => {
    return OvalOfficeCalculations.getUnifiedEventsForDate(fullState, currentDate);
  }, [fullState, currentDate]);

  // Filter fixed events: On Colombian national holidays, do NOT auto-schedule academic class sessions!
  const fixedEvents = useMemo(() => {
    if (holidayInfo.isHoliday) {
      return rawFixedEvents.filter(e => e.type !== 'class');
    }
    return rawFixedEvents;
  }, [rawFixedEvents, holidayInfo]);

  // 2. Get Personal Blocks from Daily Life Store
  const personalBlocks = useMemo(() => {
    return (dailyLifeData.timePlans || []).filter(p => p.date === currentDate);
  }, [dailyLifeData, currentDate]);

  // Medical Health Metrics (Water & Sleep)
  const healthMetrics = useMemo(() => {
    return MedicalCalculations.getLatestHealthMetrics(fullState.offices.medica, currentDate);
  }, [fullState.offices.medica, currentDate]);

  // Form & Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimePlan | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TimePlan['category']>('study');
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [color, setColor] = useState('#8B5CF6');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [subjectId, setSubjectId] = useState('');
  const [subjectTopic, setSubjectTopic] = useState('');
  const [notes, setNotes] = useState('');

  // Overlap Detection Helper
  const checkOverlap = (
    checkStart: string,
    checkDuration: number,
    ignoreBlockId?: string
  ): string | null => {
    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = timeToMins(checkStart);
    const newEnd = newStart + checkDuration;

    // Check fixed events
    for (const fe of fixedEvents) {
      if (!fe.startTime) continue;
      const fStart = timeToMins(fe.startTime);
      const fEnd = fe.endTime ? timeToMins(fe.endTime) : fStart + 60;
      if (newStart < fEnd && newEnd > fStart) {
        return fe.title || 'Evento Institucional Requerido';
      }
    }

    // Check other personal blocks
    for (const pb of personalBlocks) {
      if (ignoreBlockId && pb.id === ignoreBlockId) continue;
      const pStart = timeToMins(pb.startTime);
      const pEnd = pStart + pb.durationMinutes;
      if (newStart < pEnd && newEnd > pStart) {
        return pb.title || 'Bloque Personal Existente';
      }
    }

    return null;
  };

  const overlapError = useMemo(() => {
    if (!isModalOpen || !startTime) return null;
    return checkOverlap(startTime, Number(durationMinutes), editingBlock?.id);
  }, [isModalOpen, startTime, durationMinutes, editingBlock, fixedEvents, personalBlocks]);

  // Open Modal for New Block
  const handleOpenNewBlock = (defaultStart = '10:00', defaultDur = 60) => {
    setEditingBlock(null);
    setTitle('');
    setCategory('study');
    setStartTime(defaultStart);
    setDurationMinutes(defaultDur);
    setColor('#8B5CF6');
    setPriority('medium');
    setSubjectId('');
    setSubjectTopic('');
    setNotes('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit Block
  const handleOpenEditBlock = (block: TimePlan) => {
    setEditingBlock(block);
    setTitle(block.title);
    setCategory(block.category);
    setStartTime(block.startTime);
    setDurationMinutes(block.durationMinutes);
    setColor(block.color);
    setPriority(block.priority || 'medium');
    setSubjectId(block.subjectId || '');
    setSubjectTopic(block.subjectTopic || '');
    setNotes(block.notes || '');
    setIsModalOpen(true);
  };

  // Save Block (Create or Update)
  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (overlapError) {
      triggerToast(`Error: Conflicto con "${overlapError}". Cambia la hora o duración.`, 'warning');
      return;
    }

    if (editingBlock) {
      DailyLifeStore.updateTimePlan(editingBlock.id, {
        title: title.trim(),
        category,
        startTime,
        durationMinutes: Number(durationMinutes),
        color,
        priority,
        subjectId: category === 'study' ? subjectId : undefined,
        subjectTopic: category === 'study' ? subjectTopic : undefined,
        notes: notes.trim()
      });
      triggerToast('Bloque personal actualizado exitosamente ✨');
    } else {
      DailyLifeStore.addTimePlan({
        title: title.trim(),
        category,
        date: currentDate,
        startTime,
        durationMinutes: Number(durationMinutes),
        color,
        priority,
        subjectId: category === 'study' ? subjectId : undefined,
        subjectTopic: category === 'study' ? subjectTopic : undefined,
        notes: notes.trim()
      });
      triggerToast(`Bloque "${title}" agregado al horario personal 🎯`);
    }

    setIsModalOpen(false);
  };

  // Delete Block
  const handleDeleteBlock = (id: string) => {
    DailyLifeStore.deleteTimePlan(id);
    triggerToast('Bloque eliminado del horario', 'warning');
  };

  // Toggle Complete Block
  const handleToggleComplete = (block: TimePlan) => {
    DailyLifeStore.updateTimePlan(block.id, {
      completed: !block.completed
    });
    triggerToast(
      block.completed ? `Bloque "${block.title}" reabierto.` : `¡Felicitaciones! Completaste "${block.title}".`,
      block.completed ? 'info' : 'success'
    );
  };

  // Category Color Presets
  const categoryPresets: Record<TimePlan['category'], { label: string; color: string; icon: string }> = {
    study: { label: '📚 Estudio / Formación', color: '#8B5CF6', icon: '📚' },
    gym: { label: '🏃 Gimnasio / Deporte', color: '#10B981', icon: '🏃' },
    lunch: { label: '🍽 Almuerzo / Alimentación', color: '#F59E0B', icon: '🍽' },
    breakfast: { label: '☕ Desayuno', color: '#EAB308', icon: '☕' },
    dinner: { label: '🌙 Cena', color: '#F97316', icon: '🌙' },
    rest: { label: '☕ Descanso & Pausa', color: '#06B6D4', icon: '☕' },
    commute: { label: '🚗 Desplazamiento', color: '#3B82F6', icon: '🚗' },
    shopping: { label: '🛒 Compras / Diligencias', color: '#EC4899', icon: '🛒' },
    free_time: { label: '✨ Tiempo Libre / Ocio', color: '#A855F7', icon: '✨' },
    personal: { label: '👤 Asuntos Personales', color: '#14B8A6', icon: '👤' }
  };

  // Day Aggregates & Statistics
  const dayStats = useMemo(() => {
    let occupiedMins = 0;
    let studyMins = 0;
    let gymMins = 0;
    let restMins = 0;

    // Sum fixed events
    fixedEvents.forEach(fe => {
      if (fe.startTime) {
        const [h1, m1] = fe.startTime.split(':').map(Number);
        const [h2, m2] = (fe.endTime || fe.startTime).split(':').map(Number);
        const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        occupiedMins += Math.max(diff, 45);
      }
    });

    // Sum personal blocks
    personalBlocks.forEach(pb => {
      occupiedMins += pb.durationMinutes;
      if (pb.category === 'study') studyMins += pb.durationMinutes;
      else if (pb.category === 'gym') gymMins += pb.durationMinutes;
      else if (pb.category === 'rest' || pb.category === 'free_time') restMins += pb.durationMinutes;
    });

    const activeDayMins = 15 * 60; // 07:00 - 22:00 = 15 hours
    const freeMins = Math.max(0, activeDayMins - occupiedMins);

    const formatMins = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      if (h === 0) return `${min} m`;
      if (min === 0) return `${h} h`;
      return `${h} h ${min} m`;
    };

    return {
      occupiedFormatted: formatMins(occupiedMins),
      freeFormatted: formatMins(freeMins),
      studyFormatted: formatMins(studyMins),
      gymFormatted: formatMins(gymMins),
      restFormatted: formatMins(restMins),
      occupiedPercent: Math.min(100, Math.round((occupiedMins / activeDayMins) * 100))
    };
  }, [fixedEvents, personalBlocks]);

  // Combine and sort chronological timeline with free time gaps
  const combinedTimeline = useMemo(() => {
    interface TimelineItem {
      type: 'fixed' | 'personal' | 'free_gap';
      id: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      fixedData?: UnifiedExecutiveEvent;
      personalData?: TimePlan;
    }

    const items: TimelineItem[] = [];

    // Add fixed events
    fixedEvents.forEach(fe => {
      if (fe.startTime) {
        const start = fe.startTime;
        const end = fe.endTime || fe.startTime;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const dur = Math.max(30, (h2 * 60 + m2) - (h1 * 60 + m1));

        items.push({
          type: 'fixed',
          id: `fixed_${fe.id}`,
          startTime: start,
          endTime: end,
          durationMinutes: dur,
          fixedData: fe
        });
      }
    });

    // Add personal blocks
    personalBlocks.forEach(pb => {
      items.push({
        type: 'personal',
        id: `pb_${pb.id}`,
        startTime: pb.startTime,
        endTime: pb.endTime,
        durationMinutes: pb.durationMinutes,
        personalData: pb
      });
    });

    // Sort chronologically
    items.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Inject Free Gaps between 07:00 and 22:00
    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const minsToTime = (m: number) => {
      const h = String(Math.floor(m / 60) % 24).padStart(2, '0');
      const min = String(m % 60).padStart(2, '0');
      return `${h}:${min}`;
    };

    const result: TimelineItem[] = [];
    let cursorMins = 7 * 60; // 07:00
    const endOfDayMins = 22 * 60; // 22:00

    items.forEach(item => {
      const itemStart = timeToMins(item.startTime);
      const itemEnd = timeToMins(item.endTime);

      if (itemStart > cursorMins + 20) {
        const gapMins = itemStart - cursorMins;
        result.push({
          type: 'free_gap',
          id: `gap_${cursorMins}`,
          startTime: minsToTime(cursorMins),
          endTime: minsToTime(itemStart),
          durationMinutes: gapMins
        });
      }

      result.push(item);
      cursorMins = Math.max(cursorMins, itemEnd);
    });

    if (endOfDayMins > cursorMins + 30) {
      const gapMins = endOfDayMins - cursorMins;
      result.push({
        type: 'free_gap',
        id: `gap_end_${cursorMins}`,
        startTime: minsToTime(cursorMins),
        endTime: minsToTime(endOfDayMins),
        durationMinutes: gapMins
      });
    }

    return result;
  }, [fixedEvents, personalBlocks]);

  return (
    <div className="space-y-6 text-slate-100 font-sans relative">
      {/* TOAST NOTIFICATION FLOATING BANNER */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-bold text-white ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-500/20'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 shadow-amber-500/20'
                : 'bg-slate-900/90 border-blue-500/50 shadow-blue-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. NAVEGADOR Y CONTROLES DE FECHA */}
      <GlassPanel accentColor="amber" padding="md" className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ExecutiveBadge variant="solid" accentColor="amber">
                Oficina de Vida Diaria
              </ExecutiveBadge>
              <span className="text-xs font-mono text-slate-400">Ejecución del Tiempo Personal</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400" />
              Horario Personal
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Administración estratégica de tu tiempo libre y actividades cotidianas sin duplicar la Agenda Ejecutiva.
            </p>
          </div>

          {/* DATE SELECTOR & BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center bg-[#132337] border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setCurrentDate(addDaysToDateStr(currentDate, -1))}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Día Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentDate(todayStr)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentDate === todayStr ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Hoy
              </button>

              <button
                onClick={() => setCurrentDate(addDaysToDateStr(currentDate, 1))}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Día Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={currentDate}
                onChange={e => e.target.value && setCurrentDate(e.target.value)}
                className="bg-transparent text-xs text-amber-300 font-mono px-2 py-1 border-none focus:outline-none"
              />
            </div>

            <ExecutiveButton
              variant="primary"
              accentColor="amber"
              onClick={() => handleOpenNewBlock()}
              icon={<Plus className="w-4 h-4" />}
            >
              Nuevo Bloque
            </ExecutiveButton>
          </div>
        </div>

        {/* COLOMBIAN HOLIDAY BANNER */}
        {holidayInfo.isHoliday && (
          <div className="mt-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <Flag className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <span className="text-xs font-bold text-amber-300 font-mono block">
                🇨🇴 Festivo Nacional de Colombia: {holidayInfo.name}
              </span>
              <span className="text-[11px] text-slate-300">
                Las clases del Horario Académico se pausaron automáticamente para este festivo.
              </span>
            </div>
          </div>
        )}

        {/* WEEKEND BANNER */}
        {!holidayInfo.isHoliday && isWeekend && (
          <div className="mt-4 p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-indigo-300 font-mono block">
                🗓 Fin de Semana Activo
              </span>
              <span className="text-[11px] text-slate-300">
                Aprovecha para descansar, repasar de forma autónoma, hacer deporte o compartir con tu familia.
              </span>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* 2. RESUMEN DEL DÍA Y MÉTRICAS INSTITUCIONALES */}
      <GlassPanel accentColor="amber" padding="md">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tiempo Ocupado</span>
            <span className="text-lg font-mono font-bold text-amber-300">{dayStats.occupiedFormatted}</span>
            <span className="text-[10px] text-slate-400 block">{dayStats.occupiedPercent}% de la jornada</span>
          </div>

          <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Tiempo Libre</span>
            <span className="text-lg font-mono font-bold text-emerald-300">{dayStats.freeFormatted}</span>
            <span className="text-[10px] text-slate-400 block">disponible para planear</span>
          </div>

          <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Estudio / Formación</span>
            <span className="text-lg font-mono font-bold text-purple-300">{dayStats.studyFormatted}</span>
            <span className="text-[10px] text-slate-400 block">dedicado hoy</span>
          </div>

          <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Deporte / Gym</span>
            <span className="text-lg font-mono font-bold text-teal-300">{dayStats.gymFormatted}</span>
            <span className="text-[10px] text-slate-400 block">actividad física</span>
          </div>

          <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-blue-400 block flex items-center gap-1">
              <Droplet className="w-3 h-3 text-blue-400" /> Agua de Hoy
            </span>
            <span className="text-lg font-mono font-bold text-blue-300">
              {healthMetrics.hydrationLiters.toFixed(1)} L
            </span>
            <span className="text-[10px] text-slate-400 block">Meta: {healthMetrics.targetWater} L</span>
          </div>

          <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-indigo-400 block flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-400" /> Sueño Anoche
            </span>
            <span className="text-lg font-mono font-bold text-indigo-300">
              {healthMetrics.todaySleepRecord ? `${(healthMetrics.todaySleepRecord.durationMinutes / 60).toFixed(1)} h` : 'Sin registro'}
            </span>
            <span className="text-[10px] text-slate-400 block">Meta: {healthMetrics.targetSleepHours} h</span>
          </div>
        </div>
      </GlassPanel>

      {/* 3. CRONOGRAMA UNIFICADO EN TIEMPO REAL */}
      <GlassPanel accentColor="amber" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-serif font-bold text-white">
              Plan de la Jornada ({formatFriendlyDate(currentDate)})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {fixedEvents.length} eventos institucionales • {personalBlocks.length} bloques personales
          </span>
        </div>

        {combinedTimeline.length === 0 ? (
          <ExecutiveEmptyState
            icon={<Clock className="w-8 h-8 text-amber-400" />}
            title="Sin actividades agendadas para este día"
            description="Haz clic en 'Nuevo Bloque' para organizar tu tiempo libre o asigna tareas."
          />
        ) : (
          <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-amber-500/30">
            {combinedTimeline.map(item => {
              // CASE 1: FIXED EVENT (Clases, Citas, Obligaciones)
              if (item.type === 'fixed' && item.fixedData) {
                const fe = item.fixedData;
                return (
                  <div
                    key={item.id}
                    className="relative pl-10 p-3.5 bg-[#0F1B2D]/90 border border-blue-500/30 rounded-xl flex items-center justify-between shadow-lg"
                  >
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-[#0B1528] shadow-[0_0_8px_rgba(59,130,246,0.8)]" />

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-blue-300">
                          {fe.startTime} - {fe.endTime || ''} ({item.durationMinutes}m)
                        </span>
                        <ExecutiveBadge variant="solid" accentColor="blue" className="text-[10px]">
                          🔒 {fe.officeLabel || 'Institucional'}
                        </ExecutiveBadge>
                      </div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {fe.title}
                      </h4>
                      {fe.subtitle && <p className="text-xs text-slate-400">{fe.subtitle}</p>}
                    </div>

                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs font-mono flex items-center gap-1.5 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      Fijo
                    </div>
                  </div>
                );
              }

              // CASE 2: PERSONAL EDITABLE BLOCK
              if (item.type === 'personal' && item.personalData) {
                const pb = item.personalData;
                const preset = categoryPresets[pb.category] || { label: pb.category, color: pb.color || '#F59E0B', icon: '⚡' };

                return (
                  <div
                    key={item.id}
                    className={`relative pl-10 p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                      pb.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 opacity-80'
                        : 'bg-[#132337]/90 border-amber-500/30 hover:border-amber-400/60 shadow-lg'
                    }`}
                  >
                    <div
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0B1528]"
                      style={{ backgroundColor: pb.color || '#F59E0B', boxShadow: `0 0 8px ${pb.color || '#F59E0B'}` }}
                    />

                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {pb.startTime} - {pb.endTime} ({pb.durationMinutes} min)
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                          style={{
                            backgroundColor: `${pb.color}20`,
                            borderColor: `${pb.color}50`,
                            color: pb.color
                          }}
                        >
                          {preset.label}
                        </span>
                        {pb.completed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                            ✓ Completado
                          </span>
                        )}
                      </div>

                      <h4 className={`text-sm font-bold ${pb.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {pb.title}
                      </h4>

                      {pb.subjectId && (
                        <div className="text-xs text-purple-300 font-mono flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                          Materia: {academicSubjects.find(s => s.id === pb.subjectId)?.name || 'Asignatura'}
                          {pb.subjectTopic && ` • Tema: ${pb.subjectTopic}`}
                        </div>
                      )}

                      {pb.notes && <p className="text-xs text-slate-400 italic">{pb.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComplete(pb)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          pb.completed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-white/10'
                        }`}
                        title={pb.completed ? 'Reabrir' : 'Marcar Completado'}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditBlock(pb)}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Editar Bloque"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteBlock(pb.id)}
                        className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                        title="Eliminar Bloque"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              // CASE 3: FREE TIME GAP
              if (item.type === 'free_gap') {
                return (
                  <div
                    key={item.id}
                    className="relative pl-10 p-3 bg-dashed border-2 border-dashed border-amber-500/30 hover:border-amber-400/70 rounded-xl flex items-center justify-between transition-all bg-amber-950/10 group cursor-pointer"
                    onClick={() => handleOpenNewBlock(item.startTime, Math.min(item.durationMinutes, 120))}
                  >
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-500/30 border border-amber-400" />

                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-amber-300 font-mono">
                        Espacio Libre: {item.startTime} - {item.endTime} ({item.durationMinutes} min)
                      </span>
                    </div>

                    <ExecutiveButton variant="outline" accentColor="amber" size="sm">
                      ➕ Planificar este espacio
                    </ExecutiveButton>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </GlassPanel>

      {/* MODAL CREAR / EDITAR BLOQUE PERSONAL */}
      {isModalOpen && (
        <ExecutiveModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBlock ? 'Editar Bloque Personal' : 'Crear Bloque en Horario Personal'}
          accentColor="amber"
        >
          <form onSubmit={handleSaveBlock} className="space-y-4 py-2">
            {/* OVERLAP WARNING BANNER */}
            {overlapError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center gap-3 text-xs text-rose-300 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>⚠️ Conflicto de Horario: Se solapa con "{overlapError}". El sistema no permite superposiciones.</span>
              </div>
            )}

            <ExecutiveInput
              label="Nombre del Bloque"
              placeholder="Ej: Estudiar Fisiología, Gimnasio, Almuerzo..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              accentColor="amber"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ExecutiveSelect
                label="Categoría de Actividad"
                value={category}
                onChange={e => setCategory(e.target.value as TimePlan['category'])}
                accentColor="amber"
                options={[
                  { value: 'study', label: '📚 Estudio / Formación' },
                  { value: 'gym', label: '🏃 Gimnasio / Deporte' },
                  { value: 'lunch', label: '🍽 Almuerzo / Alimentación' },
                  { value: 'breakfast', label: '☕ Desayuno' },
                  { value: 'dinner', label: '🌙 Cena' },
                  { value: 'rest', label: '☕ Descanso & Pausa' },
                  { value: 'commute', label: '🚗 Desplazamiento' },
                  { value: 'shopping', label: '🛒 Compras / Diligencias' },
                  { value: 'free_time', label: '✨ Tiempo Libre / Ocio' },
                  { value: 'personal', label: '👤 Asuntos Personales' }
                ]}
              />

              <ExecutiveSelect
                label="Prioridad"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                accentColor="amber"
                options={[
                  { value: 'low', label: 'Baja' },
                  { value: 'medium', label: 'Media' },
                  { value: 'high', label: 'Alta' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ExecutiveInput
                label="Hora de Inicio"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                accentColor="amber"
                required
              />

              <ExecutiveInput
                label="Duración (Minutos)"
                type="number"
                min={15}
                max={360}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                accentColor="amber"
                required
              />
            </div>

            {/* QUICK PRESETS FOR DURATION */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[15, 30, 45, 60, 90, 120].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    durationMinutes === m
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-[#132337] text-slate-300 border-white/10 hover:border-amber-400/40'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>

            {/* ACADEMIC INTEGRATION (FOR STUDY CATEGORY) */}
            {category === 'study' && (
              <div className="p-3 bg-[#132337] border border-purple-500/30 rounded-xl space-y-3">
                <span className="text-xs font-bold text-purple-300 font-mono block flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-400" /> Integración con Oficina Académica
                </span>

                <ExecutiveSelect
                  label="Asignatura / Materia"
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  accentColor="purple"
                  options={[
                    { value: '', label: '-- Seleccionar Materia --' },
                    ...academicSubjects.map(s => ({ value: s.id, label: s.name }))
                  ]}
                />

                <ExecutiveInput
                  label="Tema o Capítulo Específico"
                  placeholder="Ej: Sistema Endocrino, Derivadas, etc."
                  value={subjectTopic}
                  onChange={e => setSubjectTopic(e.target.value)}
                  accentColor="purple"
                />
              </div>
            )}

            <ExecutiveInput
              label="Observaciones / Notas"
              placeholder="Detalles opcionales..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              accentColor="amber"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <ExecutiveButton
                variant="outline"
                accentColor="amber"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </ExecutiveButton>

              <ExecutiveButton
                variant="primary"
                accentColor="amber"
                type="submit"
                disabled={Boolean(overlapError)}
              >
                {editingBlock ? 'Guardar Cambios' : 'Agendar Bloque'}
              </ExecutiveButton>
            </div>
          </form>
        </ExecutiveModal>
      )}
    </div>
  );
};

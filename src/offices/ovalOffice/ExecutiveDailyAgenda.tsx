import React, { useState } from 'react';
import { MasterState, UnifiedExecutiveEvent } from '../../types/store';
import { OvalOfficeCalculations, FreeTimeGap } from './OvalOfficeCalculations';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Circle,
  Eye,
  Plus,
  BookOpen,
  CheckSquare,
  Coffee,
  Activity,
  Target,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Edit3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  HeartPulse,
  DollarSign,
  Gift,
  FileText
} from 'lucide-react';
import {
  getTodayDateString,
  formatFriendlyDate,
  addDaysToDateStr,
  getDayOfWeekName,
  getDayOfWeekNumber
} from '../../utils/dates';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { AcademicStore } from '../academic/AcademicStore';

interface Props {
  state: MasterState;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onNavigateToOffice: (officeKey: string) => void;
  onOpenQuickAdd: () => void;
  onDismissConflict: (idA: string, idB: string) => void;
  onOpenAssignTimeModal?: (event: UnifiedExecutiveEvent) => void;
}

export const ExecutiveDailyAgenda: React.FC<Props> = ({
  state,
  selectedDate,
  onSelectDate,
  onNavigateToOffice,
  onOpenQuickAdd,
  onDismissConflict
}) => {
  const [editingEvent, setEditingEvent] = useState<UnifiedExecutiveEvent | null>(null);
  const [newStartTime, setNewStartTime] = useState<string>('09:00');
  const [newEndTime, setNewEndTime] = useState<string>('10:00');
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);

  // Offset for 7-day selector window (0 means starting from today)
  const [windowOffset, setWindowOffset] = useState<number>(0);

  const todayStr = getTodayDateString();

  // Calculate 7 days for selector based on windowOffset
  const windowDays = Array.from({ length: 7 }).map((_, idx) => {
    const dStr = addDaysToDateStr(todayStr, windowOffset + idx);
    const dayNum = getDayOfWeekNumber(dStr);
    const dayName = getDayOfWeekName(dayNum);
    const parts = dStr.split('-');
    const dayMonthStr = `${parseInt(parts[2])} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(parts[1]) - 1]}`;

    let relativeLabel = dayName;
    if (dStr === todayStr) relativeLabel = 'Hoy';
    else if (dStr === addDaysToDateStr(todayStr, 1)) relativeLabel = 'Mañana';
    else if (dStr === addDaysToDateStr(todayStr, 2)) relativeLabel = 'Pasado mañana';

    const flags = OvalOfficeCalculations.getDayIndicatorFlags(state, dStr);

    return {
      dateStr: dStr,
      dayName,
      dayMonthStr,
      relativeLabel,
      flags,
      isSelected: dStr === selectedDate,
      isToday: dStr === todayStr
    };
  });

  // Dynamic calculations for selectedDate
  const eventsToday = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const freeGaps = OvalOfficeCalculations.findFreeTimeGaps(eventsToday);
  const rawConflicts = OvalOfficeCalculations.detectScheduleConflicts(eventsToday);
  const metrics = OvalOfficeCalculations.getDaySummaryMetrics(state, selectedDate);
  const upcomingEvents = OvalOfficeCalculations.getUpcomingEvents(state, todayStr, 5);

  // Navigation handlers for 7-day selector
  const handlePrevWindow = () => setWindowOffset(prev => prev - 1);
  const handleNextWindow = () => setWindowOffset(prev => prev + 1);
  const handleResetToToday = () => {
    setWindowOffset(0);
    onSelectDate(todayStr);
  };

  // Helper to toggle event status
  const handleToggleEventStatus = (evt: UnifiedExecutiveEvent) => {
    if (evt.sourceOffice === 'vidaDiaria') {
      if (evt.type === 'task' && evt.rawObject?.id) {
        DailyLifeStore.toggleTaskStatus(evt.rawObject.id);
      }
    } else if (evt.sourceOffice === 'academica') {
      if (evt.type === 'academic_activity' && evt.rawObject?.academicActivity?.id) {
        const currentStatus = evt.rawObject.academicActivity.status;
        const newStatus = currentStatus === 'Realizada' ? 'Pendiente' : 'Realizada';
        AcademicStore.updateAcademicActivity(evt.rawObject.academicActivity.id, { status: newStatus });
      }
    }
  };

  // Helper to handle time reschedule with user confirmation
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (editingEvent.sourceOffice === 'vidaDiaria' && editingEvent.rawObject?.id) {
      DailyLifeStore.addTask({
        ...editingEvent.rawObject,
        startTime: newStartTime,
        endTime: newEndTime
      });
      DailyLifeStore.deleteTask(editingEvent.rawObject.id);
    } else if (editingEvent.sourceOffice === 'academica' && editingEvent.rawObject?.academicActivity?.id) {
      AcademicStore.updateAcademicActivity(editingEvent.rawObject.academicActivity.id, {
        startTime: newStartTime,
        endTime: newEndTime
      });
    }

    setEditingEvent(null);
  };

  // Quick shift +1 hour
  const handleShiftOneHour = (evt: UnifiedExecutiveEvent) => {
    if (!evt.startTime) return;
    const [h, m] = evt.startTime.split(':').map(Number);
    const endH = evt.endTime ? Number(evt.endTime.split(':')[0]) : h + 1;
    const endM = evt.endTime ? Number(evt.endTime.split(':')[1]) : m;

    const shiftedStart = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const shiftedEnd = `${String((endH + 1) % 24).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    if (evt.sourceOffice === 'vidaDiaria' && evt.rawObject?.id) {
      DailyLifeStore.addTask({
        ...evt.rawObject,
        startTime: shiftedStart,
        endTime: shiftedEnd
      });
      DailyLifeStore.deleteTask(evt.rawObject.id);
    } else if (evt.sourceOffice === 'academica' && evt.rawObject?.academicActivity?.id) {
      AcademicStore.updateAcademicActivity(evt.rawObject.academicActivity.id, {
        startTime: shiftedStart,
        endTime: shiftedEnd
      });
    }
  };

  // Get icon by event type
  const getEventIcon = (evt: UnifiedExecutiveEvent) => {
    switch (evt.type) {
      case 'class':
        return '📘';
      case 'evaluation':
        return '📝';
      case 'academic_activity':
        return '🚌';
      case 'appointment':
        return '🩺';
      case 'task':
        return '📄';
      case 'commitment':
        return '🤝';
      case 'obligation':
        return '💵';
      case 'habit':
        return '🏃';
      case 'birthday':
        return '🎂';
      default:
        return '📅';
    }
  };

  // Interleave events and free time gaps chronologically
  const sortedItems: Array<
    { kind: 'event'; item: UnifiedExecutiveEvent; minutes: number } |
    { kind: 'gap'; gap: FreeTimeGap; minutes: number }
  > = [];

  const parseMins = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  eventsToday.forEach(evt => {
    sortedItems.push({
      kind: 'event',
      item: evt,
      minutes: parseMins(evt.startTime || '00:00')
    });
  });

  freeGaps.forEach(gap => {
    sortedItems.push({
      kind: 'gap',
      gap,
      minutes: parseMins(gap.startTime)
    });
  });

  sortedItems.sort((a, b) => a.minutes - b.minutes);

  return (
    <div className="bg-[#0A192F]/90 border-2 border-[#C5A059] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-white font-sans">
      
      {/* 1. TOP SELECTOR: 7-DAY NAVIGATION WITH INDICATOR BADGES */}
      <div className="space-y-3 border-b border-[#C5A059]/40 pb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif font-bold text-base text-white tracking-wide">
              Planificación Temporal (Próximos 7 Días)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToToday}
              className="px-2.5 py-1 bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#C5A059] border border-[#C5A059]/50 font-mono text-xs font-bold rounded-lg transition-colors"
            >
              Ir a Hoy
            </button>
            <div className="flex items-center gap-1 bg-[#081225] p-1 rounded-lg border border-white/10">
              <button
                onClick={handlePrevWindow}
                className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextWindow}
                className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 7-DAY HORIZONTAL CAROUSEL PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {windowDays.map((day) => (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[76px] ${
                day.isSelected
                  ? 'bg-[#162A45] border-[#C5A059] shadow-lg ring-2 ring-[#C5A059]/40 text-white'
                  : 'bg-[#081225]/80 border-white/10 hover:border-white/30 text-slate-300 hover:bg-[#0F233D]'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-xs font-serif font-bold ${day.isSelected ? 'text-[#C5A059]' : 'text-slate-200'}`}>
                  {day.relativeLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {day.dayMonthStr}
                </span>
              </div>

              {/* INDICATOR DOTS / BADGES */}
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {day.flags.hasConflicts && (
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded" title="Conflictos detectados">
                    🔴
                  </span>
                )}
                {day.flags.hasEvaluation && (
                  <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded" title="Evaluación programada">
                    📝
                  </span>
                )}
                {day.flags.hasMedical && (
                  <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded" title="Cita médica">
                    🩺
                  </span>
                )}
                {day.flags.hasFinancial && (
                  <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded" title="Obligación financiera">
                    💰
                  </span>
                )}
                {day.flags.hasBirthday && (
                  <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded" title="Cumpleaños / Compromiso">
                    🎂
                  </span>
                )}
                {day.flags.isHighVolume && (
                  <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded" title="Alta densidad de eventos">
                    📅
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. CARD: PRÓXIMOS EVENTOS DE LA LÍNEA DE TIEMPO */}
      {upcomingEvents.length > 0 && (
        <div className="bg-[#081225] border border-[#C5A059]/40 p-4 rounded-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C5A059]" />
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#C5A059]">
                Próximos Eventos Destacados
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Siguientes en la agenda
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {upcomingEvents.map((item, idx) => (
              <div
                key={`up_evt_${item.event.id}_${idx}`}
                onClick={() => onSelectDate(item.dateStr)}
                className="p-2.5 bg-[#0F233D] hover:bg-[#162A45] border border-white/10 hover:border-[#C5A059]/60 rounded-lg cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[#C5A059] font-bold">
                    {item.relativeLabel}
                  </span>
                  <span className="text-slate-400">
                    {item.event.startTime || 'Todo el día'}
                  </span>
                </div>
                <div className="font-serif font-bold text-xs text-white group-hover:text-amber-200 truncate">
                  {getEventIcon(item.event)} {item.event.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {item.event.officeLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ENCABEZADO DEL DÍA SELECCIONADO & SUMMARY METRICS */}
      <div className="bg-[#0F233D]/90 border border-[#C5A059]/40 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold text-[#C5A059]">
                Agenda Ejecutiva del Día
              </span>
              {selectedDate === todayStr && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  HOY
                </span>
              )}
            </div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-white capitalize">
              {formatFriendlyDate(selectedDate)}
            </h2>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Programar Actividad
          </button>
        </div>

        {/* SUMMARY METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-sans">
          <div className="p-2.5 bg-[#081225] rounded-xl border border-white/10 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Eventos Totales</span>
              <span className="font-mono font-bold text-white text-sm">{metrics.eventsCount}</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${metrics.conflictsCount > 0 ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' : 'bg-[#081225] border-white/10 text-white'}`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${metrics.conflictsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Conflictos</span>
              <span className="font-mono font-bold text-sm">{metrics.conflictsCount}</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#081225] rounded-xl border border-white/10 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Tiempo Ocupado</span>
              <span className="font-mono font-bold text-white text-xs">{metrics.occupiedFormatted}</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#081225] rounded-xl border border-white/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Tiempo Libre</span>
              <span className="font-mono font-bold text-emerald-300 text-xs">{metrics.freeFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONFLICT DETECTION WARNING PANEL */}
      {rawConflicts.length > 0 && (
        <div className="bg-rose-950/60 border-2 border-rose-500 p-4 rounded-xl space-y-3 shadow-xl">
          <div className="flex items-center gap-2 border-b border-rose-500/40 pb-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <h4 className="font-serif font-bold text-sm text-rose-200">
                ⚠️ Conflictos de Horario Detectados en la Agenda ({rawConflicts.length})
              </h4>
              <p className="text-xs text-rose-300/90 font-sans">
                Se detectaron traslapes de tiempo. Requiere aprobación del usuario para reprogramar:
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {rawConflicts.map(({ eventA, eventB }, idx) => (
              <div
                key={`agenda_conf_${eventA.id}_${eventB.id}_${idx}`}
                className="p-3 bg-[#081225] border border-rose-500/50 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-rose-300">
                    Traslape entre 2 eventos:
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-white font-mono">
                    <span className="text-amber-300 font-bold">{getEventIcon(eventA)} {eventA.title}</span>
                    <span className="text-slate-400">({eventA.startTime} - {eventA.endTime})</span>
                    <span className="text-rose-400 font-bold">vs</span>
                    <span className="text-blue-300 font-bold">{getEventIcon(eventB)} {eventB.title}</span>
                    <span className="text-slate-400">({eventB.startTime} - {eventB.endTime})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-sans text-[11px]">
                  <button
                    onClick={() => handleShiftOneHour(eventB)}
                    className="px-2.5 py-1.5 bg-[#162A45] hover:bg-rose-900 border border-rose-400 text-rose-200 font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" /> Mover 2do evento +1h
                  </button>

                  <button
                    onClick={() => {
                      setEditingEvent(eventB);
                      setNewStartTime(eventB.startTime || '09:00');
                      setNewEndTime(eventB.endTime || '10:00');
                    }}
                    className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Cambiar Hora
                  </button>

                  <button
                    onClick={() => onDismissConflict(eventA.id, eventB.id)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 rounded-lg transition-colors"
                    title="Ignorar Conflicto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CHRONOLOGICAL TIMELINE EVENTS & FREE GAPS */}
      {sortedItems.length === 0 ? (
        <div className="p-12 text-center bg-[#0d213a]/50 rounded-2xl border border-dashed border-[#C5A059]/30 space-y-3">
          <Clock className="w-12 h-12 text-[#C5A059]/60 mx-auto" />
          <p className="text-base font-serif font-bold text-amber-200">
            No hay eventos programados en la Agenda para el {formatFriendlyDate(selectedDate)}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
            Las clases recurrentes, evaluaciones, actividades académicas, citas médicas y tareas aparecerán automáticamente aquí al ser agendadas.
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            + Programar Actividad
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((entry, idx) => {
            if (entry.kind === 'event') {
              const evt = entry.item;
              const color = evt.color || '#3B82F6';
              const isCompleted = evt.rawObject?.status === 'completed' || evt.rawObject?.academicActivity?.status === 'Realizada';

              return (
                <div
                  key={`agenda_evt_${evt.id}_${idx}`}
                  className="group relative p-4 bg-[#0F233D]/90 border border-white/10 hover:border-[#C5A059]/60 rounded-2xl transition-all shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  style={{ borderLeftWidth: '6px', borderLeftColor: color }}
                >
                  <div className="flex items-start gap-3">
                    {/* Completion toggle button */}
                    {(evt.type === 'task' || evt.type === 'academic_activity') && (
                      <button
                        onClick={() => handleToggleEventStatus(evt)}
                        className="mt-0.5 p-1 text-slate-400 hover:text-amber-400 transition-colors"
                        title={isCompleted ? 'Marcar como pendiente' : 'Marcar como realizada'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base">{getEventIcon(evt)}</span>
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{ backgroundColor: `${color}20`, borderColor: `${color}50`, color: color }}
                        >
                          {evt.officeLabel}
                        </span>

                        {evt.priority === 'high' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Alta Prioridad
                          </span>
                        )}
                      </div>

                      <h4 className={`font-serif font-bold text-base sm:text-lg ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {evt.title}
                      </h4>

                      {evt.subtitle && (
                        <p className="text-xs text-slate-300 font-sans">
                          {evt.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Time interval block & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                    <div className="px-3 py-1.5 bg-[#081225] rounded-xl border border-white/15 text-xs font-mono font-bold text-[#C5A059] flex items-center gap-1.5 shrink-0 shadow-inner">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{evt.startTime || '08:00'} – {evt.endTime || '09:00'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingEvent(evt);
                          setNewStartTime(evt.startTime || '09:00');
                          setNewEndTime(evt.endTime || '10:00');
                        }}
                        className="p-2 bg-[#081225] hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
                        title="Reprogramar Hora"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {evt.sourceOffice && (
                        <button
                          onClick={() => onNavigateToOffice(evt.sourceOffice)}
                          className="p-2 bg-[#081225] hover:bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-xl text-xs text-[#C5A059] flex items-center gap-1 transition-colors"
                          title="Ir a Oficina de Origen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            } else {
              // FREE TIME GAP ITEM
              const gap = entry.gap;
              const isExpanded = expandedGapId === gap.id;

              return (
                <div
                  key={`agenda_gap_${gap.id}_${idx}`}
                  className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 text-emerald-200 transition-all shadow-inner space-y-2"
                >
                  <div
                    onClick={() => setExpandedGapId(isExpanded ? null : gap.id)}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:opacity-90"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/40">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-emerald-300">
                          Espacio Libre de {gap.durationFormatted}
                        </span>
                        <span className="text-xs text-emerald-400/80 font-mono ml-2">
                          ({gap.startTime} – {gap.endTime})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-sans text-emerald-400">
                      <span className="hidden sm:inline italic">Ver sugerencias de aprovechamiento</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded suggestions for this free gap */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-emerald-500/20 space-y-2 text-xs font-sans">
                      <p className="text-emerald-300/90 font-medium">
                        Sugerencias ejecutivas para aprovechar esta ventana de {gap.durationFormatted}:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                        <div className="p-2 bg-[#081225]/80 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-slate-200">
                          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>📘 Estudiar / Repasar materias</span>
                        </div>

                        <div className="p-2 bg-[#081225]/80 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-slate-200">
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>✅ Completar tareas pendientes</span>
                        </div>

                        <div className="p-2 bg-[#081225]/80 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-slate-200">
                          <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>☕ Pausa activa o descanso</span>
                        </div>

                        <div className="p-2 bg-[#081225]/80 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-slate-200">
                          <Activity className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>🏃 Realizar hábitos diarios</span>
                        </div>

                        <div className="p-2 bg-[#081225]/80 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-slate-200">
                          <Target className="w-4 h-4 text-yellow-400 shrink-0" />
                          <span>🎯 Adelantar objetivos</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>
      )}

      {/* 6. RESCHEDULE MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0A192F] text-white border-2 border-[#C5A059] max-w-md w-full p-6 shadow-2xl space-y-4 rounded-xl">
            <div className="flex justify-between items-center border-b border-[#C5A059]/40 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-base text-white">
                  Reprogramar Horario de Evento
                </h3>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-sans">
                Evento a Reprogramar:
              </span>
              <div className="p-3 bg-[#162A45] border border-[#C5A059]/40 text-amber-200 font-serif font-bold text-sm rounded-lg">
                {editingEvent.title}
              </div>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-white/80 font-bold block">Nueva Hora Inicio</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full p-2.5 bg-[#162A45] border border-[#C5A059]/40 text-white font-mono rounded-lg focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/80 font-bold block">Nueva Hora Fin</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full p-2.5 bg-[#162A45] border border-[#C5A059]/40 text-white font-mono rounded-lg focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#C5A059]/40 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 bg-transparent hover:bg-white/10 text-white/80 border border-white/20 text-xs font-bold uppercase tracking-wider rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
                >
                  Confirmar Reprogramación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

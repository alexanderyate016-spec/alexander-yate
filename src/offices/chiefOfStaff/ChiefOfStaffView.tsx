import React, { useState, useEffect } from 'react';
import { MasterState, ChiefOfStaffEvent, CommuteRoute } from '../../types/store';
import { ChiefOfStaffSync, minutesToTime, timeToMinutes, formatMinutesHuman } from './ChiefOfStaffSync';
import { ChiefOfStaffStore } from './ChiefOfStaffStore';
import { ExecutiveCalendar, CalendarEvent, showToast } from '../../components/executive';
import { getTodayDateString, addDaysToDateStr, getWeekDaysForDate } from '../../utils/dates';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Sparkles,
  Shield,
  Bell,
  CheckCircle2,
  XCircle,
  MapPin,
  Car,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Trash2,
  Zap,
  Info,
  CalendarDays,
  ListOrdered,
  ArrowRight,
  Edit2,
  Check,
  RefreshCw,
  X
} from 'lucide-react';

interface Props {
  state: MasterState;
  onNavigateToOffice?: (officeKey: string) => void;
}

const CATEGORIES = [
  { id: 'academic', label: '🎓 Académico', color: '#3B82F6', defaultEmoji: '🎓' },
  { id: 'medical', label: '🩺 Médico', color: '#F43F5E', defaultEmoji: '🩺' },
  { id: 'social', label: '👥 Social', color: '#EC4899', defaultEmoji: '👥' },
  { id: 'personal', label: '💼 Personal', color: '#8B5CF6', defaultEmoji: '💼' },
  { id: 'commute', label: '🚗 Desplazamiento', color: '#64748B', defaultEmoji: '🚗' },
  { id: 'dining', label: '🍽️ Alimentación', color: '#F59E0B', defaultEmoji: '🍽️' },
  { id: 'rest', label: '😴 Descanso', color: '#10B981', defaultEmoji: '😴' },
  { id: 'other', label: '📋 Otro', color: '#0EA5E9', defaultEmoji: '📋' },
];

export const ChiefOfStaffView: React.FC<Props> = ({ state, onNavigateToOffice }) => {
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'conflicts' | 'reminders' | 'config'>('daily');
  const [calendarViewMode, setCalendarViewMode] = useState<'week' | 'day'>('week');

  // Natural language instruction input
  const [instructionInput, setInstructionInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChiefOfStaffEvent | null>(null);
  const [isMorningBriefingOpen, setIsMorningBriefingOpen] = useState(false);
  const [isNightBriefingOpen, setIsNightBriefingOpen] = useState(false);

  // New/Edit event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventEmoji, setNewEventEmoji] = useState('🗓️');
  const [newEventCategory, setNewEventCategory] = useState<string>('personal');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState(selectedDate);
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventPriority, setNewEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventTravelMins, setNewEventTravelMins] = useState<number>(0);
  const [newEventReminderMins, setNewEventReminderMins] = useState<number>(30);
  const [newEventIsRecurring, setNewEventIsRecurring] = useState(false);
  const [newEventRecurrenceType, setNewEventRecurrenceType] = useState<'daily' | 'weekly'>('weekly');

  // Conflict resolution form
  const [customResolutionText, setCustomResolutionText] = useState<{ [key: string]: string }>({});

  // Real-time clock for personal secretary
  const [nowDate, setNowDate] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Sync data calculations
  const secretaryState = ChiefOfStaffSync.buildRealTimeSecretaryState(state, selectedDate, nowDate);
  const briefing = ChiefOfStaffSync.buildExecutiveBriefing(state, selectedDate);
  const unifiedEvents = ChiefOfStaffSync.getUnifiedEventsForDate(state, selectedDate);
  const reminders = ChiefOfStaffSync.getExecutiveReminders(state, todayStr);
  const config = state.offices.jefaturaGabinete?.config || {
    wakeUpTime: '06:30',
    sleepTime: '23:00',
    breakfastTime: '07:30',
    lunchTime: '12:30',
    dinnerTime: '19:30',
    commuteRoutes: []
  };

  // Convert all week events for UniversalSchedule
  const weekDays = getWeekDaysForDate(selectedDate);
  const weekEventsRaw = weekDays.flatMap(day => ChiefOfStaffSync.getUnifiedEventsForDate(state, day.dateStr));
  const calendarEvents: CalendarEvent[] = ChiefOfStaffSync.convertToCalendarEvents(weekEventsRaw);

  // Process natural language command
  const handleSendInstruction = (inputTextToProcess?: string) => {
    const textToUse = inputTextToProcess || instructionInput;
    if (!textToUse.trim()) return;

    const res = ChiefOfStaffStore.processPresidentInstruction(textToUse, selectedDate);
    setLastFeedback(res.summary);
    showToast(res.summary, 'success');
    setInstructionInput('');
  };

  // Open Add Modal
  const openAddModal = (dateStr?: string, timeStr?: string) => {
    setEditingEvent(null);
    setNewEventTitle('');
    setNewEventEmoji('🗓️');
    setNewEventCategory('personal');
    setNewEventDesc('');
    setNewEventDate(dateStr || selectedDate);
    setNewEventStartTime(timeStr || '09:00');
    setNewEventEndTime(timeStr ? minutesToTime(timeToMinutes(timeStr) + 60) : '10:00');
    setNewEventPriority('medium');
    setNewEventLocation('');
    setNewEventTravelMins(0);
    setNewEventReminderMins(30);
    setNewEventIsRecurring(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (evt: ChiefOfStaffEvent) => {
    setEditingEvent(evt);
    setNewEventTitle(evt.title);
    setNewEventEmoji(evt.emoji || '🗓️');
    setNewEventCategory(evt.category || 'personal');
    setNewEventDesc(evt.description || '');
    setNewEventDate(evt.date);
    setNewEventStartTime(evt.startTime);
    setNewEventEndTime(evt.endTime);
    setNewEventPriority(evt.priority || 'medium');
    setNewEventLocation(evt.location || '');
    setNewEventTravelMins(evt.travelTimeMinutes || 0);
    setNewEventReminderMins(evt.reminderMinutes || 30);
    setNewEventIsRecurring(!!evt.isRecurring);
    setIsAddModalOpen(true);
  };

  // Add / Edit standalone cabinet event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Por favor ingrese el título del compromiso', 'error');
      return;
    }

    const payload = {
      title: newEventTitle,
      emoji: newEventEmoji,
      category: newEventCategory as any,
      description: newEventDesc,
      date: newEventDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      sourceOffice: 'jefatura' as const,
      priority: newEventPriority,
      location: newEventLocation,
      travelTimeMinutes: newEventTravelMins > 0 ? newEventTravelMins : undefined,
      reminderMinutes: newEventReminderMins > 0 ? newEventReminderMins : undefined,
      isRecurring: newEventIsRecurring,
      recurrenceRule: newEventIsRecurring
        ? {
            type: newEventRecurrenceType,
            startDate: newEventDate,
            daysOfWeek: [1, 2, 3, 4, 5]
          }
        : undefined
    };

    if (editingEvent) {
      ChiefOfStaffStore.updateEvent(editingEvent.id, payload);
      showToast('✓ Compromiso actualizado en la Oficina de Agenda', 'success');
    } else {
      ChiefOfStaffStore.addEvent(payload);
      showToast('✓ Compromiso agendado correctamente en la Oficina de Agenda', 'success');
    }

    setIsAddModalOpen(false);
  };

  // Schedule task in free gap
  const handleScheduleTaskInGap = (taskTitle: string, gapStartTime: string, gapEndTime: string) => {
    // End time default 45 mins or gap end
    const startMins = timeToMinutes(gapStartTime);
    const endMins = Math.min(startMins + 45, timeToMinutes(gapEndTime));
    const targetEndTime = minutesToTime(endMins);

    ChiefOfStaffStore.scheduleTaskInFreeGap(taskTitle, selectedDate, gapStartTime, targetEndTime, '📚', 'academic');
    showToast(`✓ Agendado '${taskTitle}' de ${gapStartTime} a ${targetEndTime}`, 'success');
  };

  // Resolve conflict
  const handleResolveConflict = (
    conflictId: string,
    eventA: any,
    eventB: any,
    actionType: 'cancel_A' | 'cancel_B' | 'reschedule_A' | 'reschedule_B' | 'keep_both' | 'custom'
  ) => {
    const decisionNote = customResolutionText[conflictId] || 'Decisión ejecutiva tomada en Oficina de Agenda';
    ChiefOfStaffStore.resolveConflict(
      conflictId,
      { id: eventA.id, title: eventA.title, office: eventA.officeLabel },
      { id: eventB.id, title: eventB.title, office: eventB.officeLabel },
      selectedDate,
      decisionNote,
      actionType
    );
    showToast('✓ Conflicto resuelto. Agenda de tiempo actualizada.', 'success');
  };

  // Config handlers
  const handleUpdateConfig = (key: string, val: any) => {
    ChiefOfStaffStore.updateConfig({ [key]: val });
    showToast('✓ Horario personal base actualizado', 'success');
  };

  const handleAddCommute = (route: CommuteRoute) => {
    const updated = [...(config.commuteRoutes || []), route];
    ChiefOfStaffStore.updateConfig({ commuteRoutes: updated });
    showToast('✓ Ruta de desplazamiento registrada', 'success');
  };

  const handleDeleteCommute = (id: string) => {
    const updated = (config.commuteRoutes || []).filter(r => r.id !== id);
    ChiefOfStaffStore.updateConfig({ commuteRoutes: updated });
    showToast('✓ Ruta eliminada', 'success');
  };

  // Fetch pending tasks from vidaDiaria for free time suggestions
  const pendingTasks = (state.offices.vidaDiaria?.tasks || []).filter(
    t => t.status === 'pending' && (!t.date || t.date === selectedDate)
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. SECRETARÍA PERSONAL - DASHBOARD EN TIEMPO REAL */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bar Top: Saludo, Hora Real, Selector Fecha & Controles */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oficina de Agenda • Secretaría Personal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              {secretaryState.greeting}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Indicador de Hora Real */}
            <div className="px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{secretaryState.timeStr}</span>
              <span className="text-[10px] text-slate-400 font-sans font-medium">Hora del sistema</span>
            </div>

            {/* Selector de Fecha */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setSelectedDate(addDaysToDateStr(selectedDate, -1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-all"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-100 font-mono font-bold px-2 py-0.5 focus:outline-none cursor-pointer"
              />
              <button
                onClick={() => setSelectedDate(addDaysToDateStr(selectedDate, 1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-all"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {selectedDate !== todayStr && (
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 ml-1 transition-all"
                >
                  Hoy
                </button>
              )}
            </div>

            {/* Estado de Conflictos */}
            {secretaryState.hasConflicts ? (
              <button
                onClick={() => setActiveTab('conflicts')}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all animate-pulse"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{secretaryState.conflictsText}</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{secretaryState.conflictsText}</span>
              </div>
            )}

            {/* Briefings buttons */}
            <button
              onClick={() => setIsMorningBriefingOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Informe Matutino"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Matutino</span>
            </button>

            <button
              onClick={() => setIsNightBriefingOpen(true)}
              className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Cierre Nocturno"
            >
              <Moon className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Nocturno</span>
            </button>

            {/* Botón Nuevo Evento */}
            <button
              onClick={() => openAddModal()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Evento</span>
            </button>
          </div>
        </div>

        {/* Mensaje Principal de la Secretaria (Voz Ejecutiva) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-slate-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-sm">{secretaryState.greeting}</h3>
            <p className="text-slate-200 font-medium leading-relaxed">{secretaryState.summaryMessage}</p>
          </div>
        </div>

        {/* 4 Indicadores del Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Hoy */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Hoy</span>
            <div className="text-2xl font-black text-white mt-1 flex items-baseline gap-1.5">
              {secretaryState.totalToday}
              <span className="text-xs text-slate-400 font-medium">compromisos</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Total del día</span>
          </div>

          {/* Completados */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Completados</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-baseline gap-1.5">
              {secretaryState.completedTodayCount}
              <span className="text-xs text-slate-400 font-medium">/ {secretaryState.totalToday}</span>
            </div>
            <span className="text-[11px] text-emerald-300 mt-1 font-medium">
              {secretaryState.totalToday > 0
                ? `${Math.round((secretaryState.completedTodayCount / secretaryState.totalToday) * 100)}% finalizado`
                : 'Sin actividades'}
            </span>
          </div>

          {/* Ahora */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Ahora</span>
              {!secretaryState.currentActivity.isFreeTime && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <div className="text-sm font-bold text-amber-300 mt-1 truncate">
              {secretaryState.currentNowText}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 truncate">
              {secretaryState.currentActivity.isFreeTime
                ? 'Tiempo libre'
                : `${secretaryState.currentActivity.startTime} – ${secretaryState.currentActivity.endTime}`}
            </span>
          </div>

          {/* Próximo */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Próximo</span>
            <div className="text-sm font-bold text-purple-300 mt-1 truncate">
              {secretaryState.nextEventText}
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Siguiente en agenda</span>
          </div>
        </div>

        {/* AHORA, DESPUÉS & PRÓXIMO ESPACIO LIBRE Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          {/* Tarjeta AHORA */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{secretaryState.currentActivity.emoji}</span>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">AHORA</h3>
              </div>
              {!secretaryState.currentActivity.isFreeTime && secretaryState.currentActivity.remainingMins !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Quedan {secretaryState.currentActivity.remainingMins} min
                </span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">
                {secretaryState.currentActivity.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {secretaryState.currentActivity.isFreeTime
                  ? secretaryState.currentActivity.location
                  : `${secretaryState.currentActivity.startTime} – ${secretaryState.currentActivity.endTime} ${secretaryState.currentActivity.location ? '• ' + secretaryState.currentActivity.location : ''}`}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Próximo espacio libre:</span>
              <span className="font-mono font-bold text-emerald-400 text-[11px]">
                {secretaryState.nextFreeGapText}
              </span>
            </div>
          </div>

          {/* Sección DESPUÉS (Ocupa 2 columnas) */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">DESPUÉS</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {secretaryState.afterActivities.length} actividades siguientes
              </span>
            </div>

            {secretaryState.afterActivities.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 italic">
                No tienes más actividades programadas para el resto del día.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {secretaryState.afterActivities.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between gap-2 hover:border-purple-500/40 transition-all"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          {item.time}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{item.title}</span>
                      </div>
                      {item.location && (
                        <div className="text-[10px] text-slate-400 truncate pl-0.5">
                          📍 {item.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MODIFICACIÓN NATURAL DE LA AGENDA (COMANDOS EN LENGUAJE NATURAL) */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-5 border border-purple-500/30 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Modificación Natural de la Agenda (Asistente de Tiempo)
            </span>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-500/30">
            Intérprete Ejecutivo
          </span>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendInstruction();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={instructionInput}
            onChange={e => setInstructionInput(e.target.value)}
            placeholder="Ej: 'Pedí permiso para la cita hasta las 11', 'Ese día no tengo clase', 'Reprograma la cita para mañana'..."
            className="flex-1 bg-slate-800/90 border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Procesar
          </button>
        </form>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="text-slate-400">Ejemplos rápidos:</span>
          {[
            'Pedí permiso para la cita hasta las 11',
            'Ese día no tengo clase',
            'Reprograma la cita para mañana',
            'Mantén las dos'
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendInstruction(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 transition-all hover:scale-102"
            >
              "{chip}"
            </button>
          ))}
        </div>

        {lastFeedback && (
          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs animate-in fade-in duration-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{lastFeedback}</span>
          </div>
        )}
      </div>

      {/* 4. TABS DE NAVEGACIÓN */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'daily'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" /> Vista Diaria (Structured)
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'weekly'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Vista Semanal (Calendario)
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'conflicts'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Conflictos de Agenda
          {briefing.conflictCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono font-bold">
              {briefing.conflictCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'reminders'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" /> Recordatorios
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'config'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" /> Horarios Base & Rutas
        </button>
      </div>

      {/* 5. TAB CONTENIDO */}

      {/* TAB 1: VISTA DIARIA STRUCTURED */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>📅</span> Secuencia Cronológica del Día • {selectedDate}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualización continua del flujo del tiempo, actividades, desplazamientos y espacios libres.
                </p>
              </div>

              <button
                onClick={() => openAddModal()}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Compromiso
              </button>
            </div>

            {/* Structured Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {/* Wake up base node */}
              <div className="relative flex items-center gap-3 text-xs text-slate-500 font-mono">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-xs z-10">
                  🌅
                </div>
                <span className="font-bold text-amber-700">{config.wakeUpTime}</span>
                <span className="font-medium text-slate-600">Levantarse y rutina matutina habitual</span>
              </div>

              {unifiedEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-sm text-slate-800">Día completamente libre de compromisos.</p>
                  <p className="text-xs text-slate-400">
                    No hay clases, evaluaciones ni citas programadas para esta fecha.
                  </p>
                  <button
                    onClick={() => openAddModal()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Crear un evento nuevo
                  </button>
                </div>
              ) : (
                unifiedEvents.map((evt, idx) => {
                  const hasTravel = evt.travelTimeMinutes && evt.travelTimeMinutes > 0;
                  const travelStartMins = hasTravel ? timeToMinutes(evt.startTime) - evt.travelTimeMinutes! : 0;
                  const travelStartStr = hasTravel ? minutesToTime(travelStartMins) : '';
                  const durationMins = evt.startTime && evt.endTime ? timeToMinutes(evt.endTime) - timeToMinutes(evt.startTime) : 60;

                  return (
                    <div key={evt.id || idx} className="space-y-2 relative">
                      {/* Desplazamiento block if specified */}
                      {hasTravel && (
                        <div className="relative p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between font-mono shadow-2xs">
                          <div className="absolute -left-6 sm:-left-8 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] z-10">
                            🚗
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-amber-600" />
                            <span className="font-bold">Desplazamiento</span>
                            <span className="text-amber-700">({evt.travelTimeMinutes} min de margen)</span>
                          </div>
                          <span className="font-semibold text-amber-900">
                            {travelStartStr} – {evt.startTime}
                          </span>
                        </div>
                      )}

                      {/* Main Structured Event Card */}
                      <div className="relative p-4 rounded-xl border bg-white border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center text-xs z-10 shadow-2xs">
                          {evt.rawObject?.emoji || '🗓️'}
                        </div>

                        <div className="flex items-start gap-3">
                          <div
                            className="w-2.5 h-12 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: evt.color || '#8B5CF6' }}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                                style={{ backgroundColor: evt.color || '#8B5CF6' }}
                              >
                                {evt.officeLabel}
                              </span>
                              {evt.priority === 'high' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                  Prioridad Alta
                                </span>
                              )}
                              {evt.status === 'rescheduled' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Reprogramado
                                </span>
                              )}
                            </div>

                            {evt.subtitle && <p className="text-xs text-slate-600">{evt.subtitle}</p>}

                            {evt.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{evt.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0 gap-1.5">
                          <div className="font-mono font-bold text-slate-900 text-sm">
                            {evt.startTime || 'Todo el día'} {evt.endTime ? `– ${evt.endTime}` : ''}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                            {formatMinutesHuman(durationMins)}
                          </span>

                          {/* Quick action controls */}
                          <div className="flex items-center gap-1 pt-1">
                            {evt.sourceOffice === 'jefatura' && (
                              <button
                                onClick={() => openEditModal(evt.rawObject)}
                                className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg transition-all"
                                title="Editar compromiso"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {evt.sourceOffice && evt.sourceOffice !== 'jefatura' && (
                              <button
                                onClick={() => onNavigateToOffice && onNavigateToOffice(evt.sourceOffice)}
                                className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md flex items-center gap-1 transition-all"
                              >
                                <span>Ir a Oficina</span>
                                <ArrowRight className="w-3 h-3 text-purple-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Sleep base node */}
              <div className="relative flex items-center gap-3 text-xs text-slate-500 font-mono pt-2">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center text-xs z-10">
                  🌙
                </div>
                <span className="font-bold text-indigo-700">{config.sleepTime}</span>
                <span className="font-medium text-slate-600">Hora de descanso y sueño programado</span>
              </div>
            </div>
          </div>

          {/* Bloques de Tiempo Libre & Sugerencias de Gestión Personal */}
          <div className="bg-emerald-50/70 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Bloques Libres & Sugerencias de Gestión Personal
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Optimización de Agenda
              </span>
            </div>

            {briefing.freeTimeGaps.length === 0 ? (
              <p className="text-xs text-emerald-800 italic">No hay bloques libres significativos hoy.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {briefing.freeTimeGaps.map((gap, gIdx) => {
                  const suggestedTask = pendingTasks[gIdx % Math.max(1, pendingTasks.length)];

                  return (
                    <div key={gap.id} className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-emerald-900 text-sm">
                          🕐 {gap.startTime} – {gap.endTime}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {gap.durationFormatted} libre
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {gap.suggestions.map((sug, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100"
                            >
                              {sug}
                            </span>
                          ))}
                        </div>

                        {/* Direct task integration from Gestión Personal */}
                        {suggestedTask && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">
                                📌 Tarea pendiente en Gestión Personal
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{suggestedTask.priority}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-xs">
                              {suggestedTask.name}
                            </p>
                            <button
                              onClick={() => handleScheduleTaskInGap(suggestedTask.name, gap.startTime, gap.endTime)}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agendar en este espacio ({gap.startTime})</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VISTA SEMANAL (REUTILIZANDO MODELO DE CALENDARIO) */}
      {activeTab === 'weekly' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" />
                Calendario Semanal Unificado
              </h3>
              <p className="text-xs text-slate-500">
                Modelo estructural unificado con bloques por día, colores adaptativos y grilla horaria.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  calendarViewMode === 'week' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setCalendarViewMode('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  calendarViewMode === 'day' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Día
              </button>
            </div>
          </div>

          <ExecutiveCalendar
            events={calendarEvents}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            viewMode={calendarViewMode}
            onChangeViewMode={setCalendarViewMode}
            onAddActivity={(dStr, hStr) => openAddModal(dStr, hStr)}
            onSelectEvent={evt => {
              if (evt.raw && evt.raw.sourceOffice === 'jefatura') {
                openEditModal(evt.raw.rawObject || evt.raw);
              } else if (evt.sourceOffice && onNavigateToOffice) {
                onNavigateToOffice(evt.sourceOffice);
              }
            }}
            accentColor="purple"
            title="Horario Ejecutivo Presidencial"
            subtitle="Académico, Médico, Personal, Social y Rutinas"
          />
        </div>
      )}

      {/* TAB 3: CONFLICTOS DE AGENDA */}
      {activeTab === 'conflicts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Detección & Resolución de Conflictos de Horario
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                {briefing.conflictCount} traslapes activos
              </span>
            </div>

            {briefing.conflicts.length === 0 ? (
              <div className="p-10 text-center text-slate-500 space-y-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-sm text-slate-800">¡Agenda Despejada! No hay traslapes ni conflictos para {selectedDate}.</p>
                <p className="text-xs text-slate-500">
                  Todos sus eventos y compromisos se encuentran libres de solapamientos horarios.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {briefing.conflicts.map(conf => (
                  <div key={conf.id} className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between gap-2 border-b border-red-200 pb-3">
                      <div>
                        <span className="font-bold text-red-900 text-sm flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Conflicto Detectado: {conf.timeRange}
                        </span>
                        <p className="text-xs text-red-800 mt-1">{conf.description}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-red-200 text-red-900 font-mono text-xs font-bold rounded-lg shrink-0">
                        {conf.overlapMinutes} min de traslape
                      </span>
                    </div>

                    {/* Events involved */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white rounded-xl border border-red-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Evento A ({conf.eventA.officeLabel})
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{conf.eventA.title}</h4>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {conf.eventA.startTime} – {conf.eventA.endTime}
                        </p>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-red-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Evento B ({conf.eventB.officeLabel})
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{conf.eventB.title}</h4>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {conf.eventB.startTime} – {conf.eventB.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Resolution action buttons */}
                    <div className="space-y-2 pt-2 border-t border-red-200">
                      <span className="text-xs font-bold text-slate-900 block">
                        Opciones de Resolución Ejecutiva:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleResolveConflict(conf.id, conf.eventA, conf.eventB, 'cancel_A')}
                          className="px-3 py-1.5 bg-white hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition-all"
                        >
                          Cancelar {conf.eventA.title.slice(0, 18)}...
                        </button>

                        <button
                          onClick={() => handleResolveConflict(conf.id, conf.eventA, conf.eventB, 'cancel_B')}
                          className="px-3 py-1.5 bg-white hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition-all"
                        >
                          Cancelar {conf.eventB.title.slice(0, 18)}...
                        </button>

                        <button
                          onClick={() => handleResolveConflict(conf.id, conf.eventA, conf.eventB, 'keep_both')}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Mantener Ambos (Aceptar traslape)
                        </button>
                      </div>

                      {/* Custom decision free text */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Indique otra solución personalizada..."
                          value={customResolutionText[conf.id] || ''}
                          onChange={e =>
                            setCustomResolutionText({ ...customResolutionText, [conf.id]: e.target.value })
                          }
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            handleResolveConflict(conf.id, conf.eventA, conf.eventB, 'custom')
                          }
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Guardar Decisión
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RECORDATORIOS */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Centro de Recordatorios & Avisos de Compromiso
            </h3>
            <span className="text-xs text-slate-500 font-mono">Sincronización Multióficina</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AHORA (🔴) */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                Ahora Mismo (🔴 En Curso / &lt;30 min)
              </h4>
              {reminders.filter(r => r.tier === 'ahora').length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay compromisos inmediatos en este instante.</p>
              ) : (
                reminders
                  .filter(r => r.tier === 'ahora')
                  .map(rem => (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-red-950 text-xs">{rem.title}</div>
                      <div className="text-[11px] text-red-800">{rem.subtitle}</div>
                    </div>
                  ))
              )}
            </div>

            {/* PRÓXIMO (🟡) */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Próximos Compromisos (🟡 Hoy & Mañana)
              </h4>
              {reminders.filter(r => r.tier === 'proximo').length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin compromisos próximos inmediatos.</p>
              ) : (
                reminders
                  .filter(r => r.tier === 'proximo')
                  .slice(0, 5)
                  .map(rem => (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-amber-950 text-xs">{rem.title}</div>
                      <div className="text-[11px] text-amber-800">{rem.subtitle}</div>
                    </div>
                  ))
              )}
            </div>

            {/* IMPORTANTE (🟠) */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                Importante (🟠 Evaluaciones & Citas Próximas)
              </h4>
              {reminders.filter(r => r.tier === 'importante').length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin parciales o evaluaciones urgentes esta semana.</p>
              ) : (
                reminders
                  .filter(r => r.tier === 'importante')
                  .map(rem => (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-orange-950 text-xs">{rem.title}</div>
                      <div className="text-[11px] text-orange-800">{rem.subtitle}</div>
                    </div>
                  ))
              )}
            </div>

            {/* VENCIDO (🔴) */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-700"></span>
                Vencidos / Atrasados (🔴 Pendientes atrasados)
              </h4>
              {reminders.filter(r => r.tier === 'vencido').length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay tareas u obligaciones financieras atrasadas.</p>
              ) : (
                reminders
                  .filter(r => r.tier === 'vencido')
                  .map(rem => (
                    <div
                      key={rem.id}
                      className="p-3.5 rounded-xl bg-red-100/80 border border-red-300 space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-red-950 text-xs">{rem.title}</div>
                      <div className="text-[11px] text-red-800">{rem.subtitle}</div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HORARIOS Y DESPLAZAMIENTOS */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-700" />
              Horarios Personales Base & Rutas de Desplazamiento
            </h3>
            <span className="text-xs text-slate-500 font-mono">Estructura Habitual</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Hours & Meal Config */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Horario Personal Habitual
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    🌅 Hora de Levantarse
                  </label>
                  <input
                    type="time"
                    value={config.wakeUpTime}
                    onChange={e => handleUpdateConfig('wakeUpTime', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    🌙 Hora de Dormir
                  </label>
                  <input
                    type="time"
                    value={config.sleepTime}
                    onChange={e => handleUpdateConfig('sleepTime', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-800 block">Horarios Habituales de Comida:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">🍳 Desayuno</label>
                    <input
                      type="time"
                      value={config.breakfastTime}
                      onChange={e => handleUpdateConfig('breakfastTime', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">🍲 Almuerzo</label>
                    <input
                      type="time"
                      value={config.lunchTime}
                      onChange={e => handleUpdateConfig('lunchTime', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">🥗 Cena</label>
                    <input
                      type="time"
                      value={config.dinnerTime}
                      onChange={e => handleUpdateConfig('dinnerTime', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Commute Routes Config */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>🚗 Rutas de Desplazamiento Habituales</span>
              </h4>

              <div className="space-y-2">
                {(config.commuteRoutes || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay rutas registradas.</p>
                ) : (
                  (config.commuteRoutes || []).map(r => (
                    <div
                      key={r.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.origin} → {r.destination} • {r.durationMinutes} minutos
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCommute(r.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO / EDITAR EVENTO DE AGENDA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                {editingEvent ? 'Editar Evento de Agenda' : 'Nuevo Evento de Agenda'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título del Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reunión con Profesor / Cita médica"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={newEventCategory}
                    onChange={e => {
                      setNewEventCategory(e.target.value);
                      const catObj = CATEGORIES.find(c => c.id === e.target.value);
                      if (catObj) setNewEventEmoji(catObj.defaultEmoji);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emoji Representativo</label>
                  <input
                    type="text"
                    value={newEventEmoji}
                    onChange={e => setNewEventEmoji(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={newEventStartTime}
                    onChange={e => setNewEventStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={newEventEndTime}
                    onChange={e => setNewEventEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ubicación</label>
                  <input
                    type="text"
                    placeholder="Ej: Consultorio 302 / Aula 101"
                    value={newEventLocation}
                    onChange={e => setNewEventLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Desplazamiento Previo (Min)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="30"
                    value={newEventTravelMins}
                    onChange={e => setNewEventTravelMins(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas / Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales o preparativos..."
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prioridad</label>
                  <select
                    value={newEventPriority}
                    onChange={e => setNewEventPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta (Urgente)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recordatorio Previo</label>
                  <select
                    value={newEventReminderMins}
                    onChange={e => setNewEventReminderMins(parseInt(e.target.value, 10) || 15)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                  >
                    <option value={15}>15 minutos antes</option>
                    <option value={30}>30 minutos antes</option>
                    <option value={60}>1 hora antes</option>
                    <option value={120}>2 horas antes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={newEventIsRecurring}
                  onChange={e => setNewEventIsRecurring(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="recurringCheck" className="text-slate-700 font-medium">
                  Evento Recurrente (semanal / diario)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Agendar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INFORME MATUTINO */}
      {isMorningBriefingOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-amber-500/30 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-300 text-base">Informe Matutino de Agenda</h3>
              </div>
              <button onClick={() => setIsMorningBriefingOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <p className="font-bold text-sm text-white">{briefing.greeting}</p>
              <p className="leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                {briefing.summaryText}
              </p>

              <div className="space-y-1">
                <span className="font-bold text-amber-400 block">Puntos de Atención:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>Primera actividad: {briefing.firstActivityTime}</li>
                  <li>Conflictos detectados: {briefing.conflictCount}</li>
                  <li>Próximo bloque libre: {briefing.nextFreeGapText}</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsMorningBriefingOpen(false)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Cerrar Informe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INFORME NOCTURNO */}
      {isNightBriefingOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-purple-500/30 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-purple-300 text-base">Informe Nocturno del Cierre de Día</h3>
              </div>
              <button onClick={() => setIsNightBriefingOpen(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <p className="font-bold text-sm text-white">Resumen de Ejecución del Día ({selectedDate})</p>
              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span>Compromisos Totales del Día:</span>
                  <span className="font-mono font-bold text-purple-300">{briefing.totalCommitments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hora Recomendada de Descanso:</span>
                  <span className="font-mono font-bold text-amber-400">{config.sleepTime}</span>
                </div>
              </div>

              <p className="text-slate-400 italic text-[11px]">
                La Oficina de Agenda ha resguardado sus horarios para garantizar un descanso óptimo antes de la jornada de mañana.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsNightBriefingOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs"
              >
                Cerrar Cierre Nocturno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export alias for seamless routing compatibility
export const AgendaView = ChiefOfStaffView;

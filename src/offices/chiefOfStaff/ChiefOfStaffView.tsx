import React, { useState } from 'react';
import { MasterState, ChiefOfStaffEvent, CommuteRoute } from '../../types/store';
import { ChiefOfStaffSync, minutesToTime, timeToMinutes, formatMinutesHuman } from './ChiefOfStaffSync';
import { ChiefOfStaffStore } from './ChiefOfStaffStore';
import { showToast } from '../../components/executive';
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
  HelpCircle,
  FileText,
  Trash2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

interface Props {
  state: MasterState;
}

export const ChiefOfStaffView: React.FC<Props> = ({ state }) => {
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'conflicts' | 'reminders' | 'config'>('daily');

  // Natural language instruction input
  const [instructionInput, setInstructionInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMorningBriefingOpen, setIsMorningBriefingOpen] = useState(false);
  const [isNightBriefingOpen, setIsNightBriefingOpen] = useState(false);

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventPriority, setNewEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventTravelMins, setNewEventTravelMins] = useState<number>(0);
  const [newEventIsRecurring, setNewEventIsRecurring] = useState(false);
  const [newEventRecurrenceType, setNewEventRecurrenceType] = useState<'daily' | 'weekly'>('weekly');

  // Conflict resolution form
  const [customResolutionText, setCustomResolutionText] = useState<{ [key: string]: string }>({});

  // Sync data calculations
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

  // Process natural language command
  const handleSendInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructionInput.trim()) return;

    const res = ChiefOfStaffStore.processPresidentInstruction(instructionInput, selectedDate);
    setLastFeedback(res.summary);
    showToast(res.summary, 'success');
    setInstructionInput('');
  };

  // Add new standalone cabinet event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Por favor ingrese el título del compromiso', 'error');
      return;
    }

    ChiefOfStaffStore.addEvent({
      title: newEventTitle,
      description: newEventDesc,
      date: selectedDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      sourceOffice: 'jefatura',
      priority: newEventPriority,
      location: newEventLocation,
      travelTimeMinutes: newEventTravelMins > 0 ? newEventTravelMins : undefined,
      isRecurring: newEventIsRecurring,
      recurrenceRule: newEventIsRecurring
        ? {
            type: newEventRecurrenceType,
            startDate: selectedDate,
            daysOfWeek: [1, 2, 3, 4, 5]
          }
        : undefined
    });

    showToast('✓ Compromiso agendado correctamente en Jefatura de Gabinete', 'success');
    setIsAddModalOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
  };

  // Resolve conflict
  const handleResolveConflict = (
    conflictId: string,
    eventA: any,
    eventB: any,
    actionType: 'cancel_A' | 'cancel_B' | 'reschedule_A' | 'reschedule_B' | 'keep_both' | 'custom'
  ) => {
    const decisionNote = customResolutionText[conflictId] || 'Decisión ejecutiva del Presidente';
    ChiefOfStaffStore.resolveConflict(
      conflictId,
      { id: eventA.id, title: eventA.title, office: eventA.officeLabel },
      { id: eventB.id, title: eventB.title, office: eventB.officeLabel },
      selectedDate,
      decisionNote,
      actionType
    );
    showToast('✓ Conflicto resuelto. Agenda actualizada.', 'success');
  };

  // Config handlers
  const handleUpdateConfig = (key: string, val: any) => {
    ChiefOfStaffStore.updateConfig({ [key]: val });
    showToast('✓ Configuración de horario actualizada', 'success');
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

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. ENCABEZA EJECUTIVO DE JEFATURA DE GABINETE */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Oficina de Jefatura de Gabinete
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                    Secretaría Ejecutiva
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fuente Única de Verdad y Protección del Tiempo del Presidente {userName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700 text-xs">
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
                className="bg-transparent text-slate-100 font-mono font-semibold px-2 py-1 focus:outline-none cursor-pointer"
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
                  className="px-2 py-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 ml-1 transition-all"
                >
                  Hoy
                </button>
              )}
            </div>

            {/* Briefings buttons */}
            <button
              onClick={() => setIsMorningBriefingOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Sun className="w-4 h-4 text-amber-400" /> Informe Matutino
            </button>

            <button
              onClick={() => setIsNightBriefingOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Moon className="w-4 h-4 text-purple-400" /> Informe Nocturno
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Nuevo Compromiso
            </button>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC EXECUTIVE REPORT & METRICS CARD */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Informe Ejecutivo de la Jefatura
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">Fecha: {selectedDate}</span>
        </div>

        {/* Executive summary text */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed font-medium flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 mb-1">{briefing.greeting}</p>
            <p className="text-slate-700">{briefing.summaryText}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-medium">Compromisos Totales</span>
            <div className="text-xl font-bold text-slate-900 mt-1 flex items-baseline gap-1.5">
              {briefing.totalCommitments}
              <span className="text-xs text-slate-500 font-normal">eventos</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('conflicts')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              briefing.conflictCount > 0
                ? 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Conflictos</span>
              {briefing.conflictCount > 0 && <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />}
            </div>
            <div className="text-xl font-bold mt-1">
              {briefing.conflictCount > 0 ? `${briefing.conflictCount} requeridos` : '0 traslapes'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-medium">Primera Actividad</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {briefing.firstActivityTime}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col justify-between">
            <span className="text-xs font-medium text-emerald-700">Siguiente Espacio Libre</span>
            <div className="text-xs font-bold font-mono text-emerald-900 mt-1 truncate">
              {briefing.nextFreeGapText}
            </div>
          </div>
        </div>
      </div>

      {/* 3. NATURAL LANGUAGE INSTRUCTION BAR (SECRETARÍA DE INTELIGENCIA NATURAL) */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-900 rounded-2xl p-5 border border-purple-500/30 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Instrucciones Directas del Presidente (Lenguaje Natural)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Intérprete Inteligente Activo</span>
        </div>

        <form onSubmit={handleSendInstruction} className="flex gap-2">
          <input
            type="text"
            value={instructionInput}
            onChange={e => setInstructionInput(e.target.value)}
            placeholder="Ej: 'Pide permiso para la cita hasta las 11', 'Tengo que salir de casa 30 minutos antes', 'Mover la clase del viernes'..."
            className="flex-1 bg-slate-800/90 border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Procesar
          </button>
        </form>

        {lastFeedback && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs animate-in fade-in duration-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{lastFeedback}</span>
          </div>
        )}
      </div>

      {/* 4. NAVIGATION TABS */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-xs flex gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'daily'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4 text-amber-400" /> Agenda Diaria
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'weekly'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-400" /> Calendario Semanal
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeTab === 'conflicts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-400" /> Conflictos & Prioridades
          {briefing.conflictCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-mono">
              {briefing.conflictCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'reminders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-400" /> Recordatorios
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'config'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" /> Horarios & Desplazamientos
        </button>
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB 1: AGENDA DIARIA */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-600" /> Línea de Tiempo Diaria • {selectedDate}
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Horario activo: {config.wakeUpTime} – {config.sleepTime}
              </span>
            </div>

            {unifiedEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-medium text-sm">No hay compromisos agendados para este día.</p>
                <p className="text-xs text-slate-400">
                  Puede agregar un nuevo compromiso o usar el intérprete de lenguaje natural.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Agendar Evento
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {unifiedEvents.map((evt, idx) => {
                  const hasTravel = evt.travelTimeMinutes && evt.travelTimeMinutes > 0;
                  const travelStartMins = hasTravel ? timeToMinutes(evt.startTime) - evt.travelTimeMinutes! : 0;
                  const travelStartStr = hasTravel ? minutesToTime(travelStartMins) : '';

                  return (
                    <div key={evt.id || idx} className="space-y-1">
                      {/* Desplazamiento block if specified */}
                      {hasTravel && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between ml-6 font-mono">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-amber-600" />
                            <span className="font-bold">🚗 Desplazamiento / Camino</span>
                            <span className="text-amber-700">({evt.travelTimeMinutes} min antes)</span>
                          </div>
                          <span className="font-semibold">
                            {travelStartStr} – {evt.startTime}
                          </span>
                        </div>
                      )}

                      {/* Main Event Card */}
                      <div className="p-4 rounded-xl border bg-white border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-3 h-12 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: evt.color || '#3B82F6' }}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                                style={{ backgroundColor: evt.color || '#3B82F6' }}
                              >
                                {evt.officeLabel}
                              </span>
                              {evt.priority === 'high' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                  Prioridad Alta
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600">{evt.subtitle || evt.type}</p>

                            {evt.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{evt.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                          <div className="font-mono font-bold text-slate-900 text-sm">
                            {evt.startTime || 'Sin hora'} {evt.endTime ? `– ${evt.endTime}` : ''}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {evt.startTime && evt.endTime
                              ? formatMinutesHuman(timeToMinutes(evt.endTime) - timeToMinutes(evt.startTime))
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Explicit Free Time Gaps */}
          <div className="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Bloques de Tiempo Libre Identificados
              </h3>
              <span className="text-xs font-semibold text-emerald-700">Jefatura de Gabinete</span>
            </div>

            {briefing.freeTimeGaps.length === 0 ? (
              <p className="text-xs text-emerald-800 italic">No hay bloques libres extensos entre sus compromisos.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {briefing.freeTimeGaps.map(gap => (
                  <div key={gap.id} className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-900 text-sm">
                        🕐 {gap.startTime} – {gap.endTime}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {gap.durationFormatted} libre
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Sugerencias de la Jefatura:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {gap.suggestions.map((sug, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            {sug}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CALENDARIO SEMANAL */}
      {activeTab === 'weekly' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" /> Vista Semanal Integrada de Agenda
            </h3>
            <span className="text-xs text-slate-500 font-mono">Semana de {selectedDate}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {getWeekDaysForDate(selectedDate).map((day, dIdx) => {
              const dayEvents = ChiefOfStaffSync.getUnifiedEventsForDate(state, day.dateStr);
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === todayStr;

              return (
                <div
                  key={dIdx}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 min-h-[160px] flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                      : isToday
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="border-b pb-2 flex justify-between items-center border-slate-200">
                    <span className="font-bold text-xs text-slate-900">{day.dayShort}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isToday ? 'bg-amber-500 text-slate-950' : 'text-slate-500'
                      }`}
                    >
                      {day.dateStr.slice(8)}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[220px]">
                    {dayEvents.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic block pt-2">Libre</span>
                    ) : (
                      dayEvents.map((evt, eIdx) => (
                        <div
                          key={eIdx}
                          className="p-1.5 rounded-lg text-[10px] font-semibold text-white truncate shadow-2xs"
                          style={{ backgroundColor: evt.color || '#3B82F6' }}
                          title={`${evt.startTime || ''} ${evt.title} (${evt.officeLabel})`}
                        >
                          <span className="font-mono">{evt.startTime || '•'}</span> {evt.title}
                        </div>
                      ))
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 text-right block pt-1 border-t border-slate-200">
                    {dayEvents.length} eventos
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONFLICTOS Y PRIORIDADES */}
      {activeTab === 'conflicts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Gestor de Conflictos de Horario (Autorización Presidencial)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                {briefing.conflictCount} traslapes activos
              </span>
            </div>

            {briefing.conflicts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-sm text-slate-800">¡Agenda Perfecta! No existen conflictos de horario.</p>
                <p className="text-xs text-slate-500">
                  Todos sus compromisos están organizados ordenadamente en la línea de tiempo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {briefing.conflicts.map(conf => (
                  <div key={conf.id} className="p-5 rounded-xl bg-red-50/60 border border-red-200 space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-red-200 pb-3">
                      <div>
                        <span className="font-bold text-red-900 text-sm flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Conflicto de Horario: {conf.timeRange}
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
                          Compromiso A ({conf.eventA.officeLabel})
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{conf.eventA.title}</h4>
                        <p className="text-[11px] text-slate-600 font-mono">
                          {conf.eventA.startTime} – {conf.eventA.endTime}
                        </p>
                      </div>

                      <div className="p-3.5 bg-white rounded-xl border border-red-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Compromiso B ({conf.eventB.officeLabel})
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
                        Opciones de Resolución Recomendadas:
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
              Centro de Recordatorios Ejecutivos
            </h3>
            <span className="text-xs text-slate-500 font-mono">Actualizado en tiempo real</span>
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
                Importante (🟠 Evaluaciones & Entregas en &lt;3 días)
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
                Vencidos / Atrasados (🔴 Tareas u Obligaciones pasadas)
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
              Información Personal del Horario y Desplazamientos
            </h3>
            <span className="text-xs text-slate-500 font-mono">Parámetros de Estructura</span>
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

      {/* MODAL: NUEVO COMPROMISO PRESIDENCIAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" /> Agendar Compromiso Presidencial
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título del Compromiso</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reunión con Ministro de Hacienda"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descripción / Notas</label>
                <textarea
                  rows={2}
                  placeholder="Detalles adicionales..."
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={newEventStartTime}
                    onChange={e => setNewEventStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hora Fin</label>
                  <input
                    type="time"
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
                    placeholder="Ej: Despacho / Aula 201"
                    value={newEventLocation}
                    onChange={e => setNewEventLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Desplazamiento (Min)</label>
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
                <label className="font-semibold text-slate-700 block mb-1">Prioridad</label>
                <select
                  value={newEventPriority}
                  onChange={e => setNewEventPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta (Presidencial)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  Agendar Evento
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
                <h3 className="font-bold text-amber-300 text-base">Informe Matutino de la Jefatura</h3>
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
                <span className="font-bold text-amber-400 block">Puntos de Atención Prioritaria:</span>
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
                  <span className="font-mono font-bold text-amber-400">{briefing.totalCommitments}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hora Recomendada de Descanso:</span>
                  <span className="font-mono font-bold text-purple-300">{config.sleepTime}</span>
                </div>
              </div>

              <p className="text-slate-400 italic text-[11px]">
                La Jefatura de Gabinete ha resguardado sus horarios para garantizar un descanso óptimo antes de la jornada de mañana.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsNightBriefingOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs"
              >
                Cerrar Informe Nocturno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

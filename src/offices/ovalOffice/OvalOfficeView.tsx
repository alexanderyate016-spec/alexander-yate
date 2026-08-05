import React, { useState, useRef } from 'react';
import { MasterState, UnifiedExecutiveEvent } from '../../types/store';
import { OvalOfficeCalculations, AgendaItem } from './OvalOfficeCalculations';
import { ScheduleGrid } from './ScheduleGrid';
import { AgendaChecklist } from './AgendaChecklist';
import { ExecutiveDailyAgenda } from './ExecutiveDailyAgenda';
import { NotificationsModal } from './NotificationsModal';
import { AssignTimeModal } from './AssignTimeModal';
import { QuickAddTaskModal } from './QuickAddTaskModal';
import { CasaBlancaWindow } from './CasaBlancaWindow';
import { RelojEjecutivo } from './RelojEjecutivo';
import { SistemaHoy } from './SistemaHoy';
import { WidgetsVivos } from './WidgetsVivos';
import { CentroInteligenciaEjecutiva } from './CentroInteligenciaEjecutiva';
import { ChecklistDiario } from './ChecklistDiario';
import { QuickJournalModal } from './QuickJournalModal';
import { QuickSleepModal } from './QuickSleepModal';
import { useTimeService } from '../../hooks/useTimeService';
import { getTodayDateString, formatFriendlyDate } from '../../utils/dates';
import { Bell, Calendar, Lock, AlertTriangle, Crown, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { SecurityStore, CrisisStore } from '../security/SecurityStore';

interface Props {
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
  onActivateEmergencyLock?: () => void;
}

export const OvalOfficeView: React.FC<Props> = ({
  state,
  onNavigateToOffice,
  onActivateEmergencyLock
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [scheduleViewMode, setScheduleViewMode] = useState<'week' | 'day'>('week');
  
  // Modals & Panels state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAssignTimeOpen, setIsAssignTimeOpen] = useState<boolean>(false);
  const [selectedAgendaItem, setSelectedAgendaItem] = useState<AgendaItem | null>(null);
  const [isQuickAddTaskOpen, setIsQuickAddTaskOpen] = useState<boolean>(false);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState<boolean>(false);
  const [isQuickSleepOpen, setIsQuickSleepOpen] = useState<boolean>(false);

  const agendaRef = useRef<HTMLDivElement>(null);

  // Time Service Integration
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const timeService = useTimeService(userName);
  const greeting = timeService.greeting;

  const eventsToday = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const eventsWeek = OvalOfficeCalculations.getHorarioEventsForWeek(state, selectedDate);
  const agendaItems = OvalOfficeCalculations.getAgendaItems(state, selectedDate);
  const notifications = OvalOfficeCalculations.getNotifications(state, selectedDate);

  const handleFocusAgenda = () => {
    if (agendaRef.current) {
      agendaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAssignTime = (item: AgendaItem) => {
    setSelectedAgendaItem(item);
    setIsAssignTimeOpen(true);
  };

  const handleTriggerEmergencyLock = () => {
    SecurityStore.lockApp();
    if (onActivateEmergencyLock) onActivateEmergencyLock();
  };

  const handleTriggerCrisisMode = () => {
    CrisisStore.toggleCrisis(true, 'high');
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-white">
      
      {/* 1. VENTANAL DE LA CASA BLANCA (ATMOSPHERIC SKY HORIZON & GREETING) */}
      <CasaBlancaWindow state={state} timeService={timeService} />

      {/* 2. PRESIDENTIAL TOP BAR CONTROLS */}
      <div className="bg-[#030712]/80 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-serif font-extrabold tracking-wide text-white">
              Despacho Oval • Centro Ejecutivo de Decisiones
            </h1>
            <p className="text-xs text-slate-300 font-sans">
              {greeting} — {formatFriendlyDate(selectedDate)}
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto justify-end">
          {/* Date Picker */}
          <div className="flex items-center bg-black/40 border border-white/15 px-3 py-1.5 rounded-xl text-white">
            <Calendar className="w-3.5 h-3.5 text-amber-300 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/15 text-amber-300 font-bold rounded-xl transition-all flex items-center gap-2 relative active:scale-95"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificaciones</span>
            {notifications.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Crisis Center Button */}
          <button
            onClick={handleTriggerCrisisMode}
            className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> <span className="hidden sm:inline">Centro de Crisis</span>
          </button>

          {/* Emergency Lock */}
          <button
            onClick={handleTriggerEmergencyLock}
            className="p-2 bg-black/40 hover:bg-amber-950/80 border border-amber-500/40 text-amber-300 rounded-xl transition-all active:scale-95"
            title="Bloqueo de Seguridad Inmediato"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. RELOJ EJECUTIVO PROTAGONISTA & METEOROLOGÍA */}
      <RelojEjecutivo
        timeService={timeService}
        holidayName={timeService.periodInfo.colombianHoliday.name}
      />

      {/* 4. SISTEMA HOY (CENTRALIZED IMMEDIATE ATTENTION HUB) */}
      <SistemaHoy
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
        onOpenQuickJournalModal={() => setIsQuickJournalOpen(true)}
      />

      {/* 5. WIDGETS VIVOS INTERACTIVOS (BOTELLA DE AGUA VIVA, SUEÑO, PATRIMONIO, ACADÉMICO, BIENESTAR) */}
      <WidgetsVivos
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
        onOpenQuickSleepModal={() => setIsQuickSleepOpen(true)}
      />

      {/* 6. CENTRO DE INTELIGENCIA EJECUTIVA (CRITICAL OBSERVATIONS & SYSTEM ALERTS) */}
      <CentroInteligenciaEjecutiva
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
      />

      {/* 7. AGENDA EJECUTIVA DEL DÍA */}
      <div ref={agendaRef}>
        <ExecutiveDailyAgenda
          state={state}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onNavigateToOffice={onNavigateToOffice}
          onOpenQuickAdd={() => setIsQuickAddTaskOpen(true)}
          onDismissConflict={() => {}}
          onOpenAssignTimeModal={(evt) => {
            const agItem: AgendaItem = {
              id: evt.id,
              title: evt.title,
              sourceOffice: evt.sourceOffice as any,
              officeLabel: evt.officeLabel,
              color: evt.color || '#3B82F6',
              priority: 'medium',
              status: 'pending',
              type: 'task',
              date: evt.date,
              rawObject: evt.rawObject
            };
            handleOpenAssignTime(agItem);
          }}
        />
      </div>

      {/* 9. SCHEDULE TIMELINE (WITH MOVING TIME INDICATOR LINE) & SMART CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* HORARIO EJECUTIVO TIMELINE (8 COLS) */}
        <div className="lg:col-span-8">
          <ScheduleGrid
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            viewMode={scheduleViewMode}
            onChangeViewMode={setScheduleViewMode}
            eventsByDate={eventsWeek}
            eventsToday={eventsToday}
            onNavigateToOffice={onNavigateToOffice}
            onSelectEvent={(evt) => onNavigateToOffice(evt.sourceOffice)}
          />
        </div>

        {/* SMART ACTIONABLE CHECKLIST (4 COLS) */}
        <div className="lg:col-span-4 h-full">
          <ChecklistDiario
            state={state}
            selectedDate={selectedDate}
            onOpenQuickAddTaskModal={() => setIsQuickAddTaskOpen(true)}
            onOpenQuickJournalModal={() => setIsQuickJournalOpen(true)}
            onNavigateToOffice={onNavigateToOffice}
          />
        </div>

      </div>

      {/* MODALS */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notices={notifications}
        onNavigateToOffice={onNavigateToOffice}
      />

      <AssignTimeModal
        isOpen={isAssignTimeOpen}
        onClose={() => setIsAssignTimeOpen(false)}
        item={selectedAgendaItem}
        selectedDate={selectedDate}
      />

      <QuickAddTaskModal
        isOpen={isQuickAddTaskOpen}
        onClose={() => setIsQuickAddTaskOpen(false)}
        selectedDate={selectedDate}
      />

      <QuickJournalModal
        selectedDate={selectedDate}
        isOpen={isQuickJournalOpen}
        onClose={() => setIsQuickJournalOpen(false)}
      />

      <QuickSleepModal
        selectedDate={selectedDate}
        isOpen={isQuickSleepOpen}
        onClose={() => setIsQuickSleepOpen(false)}
      />

    </div>
  );
};

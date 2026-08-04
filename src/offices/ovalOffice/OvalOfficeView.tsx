import React, { useState, useRef } from 'react';
import { MasterState, UnifiedExecutiveEvent } from '../../types/store';
import { OvalOfficeCalculations, AgendaItem } from './OvalOfficeCalculations';
import { ExecutiveDeskView } from './ExecutiveDeskView';
import { ScheduleGrid } from './ScheduleGrid';
import { AgendaChecklist } from './AgendaChecklist';
import { ExecutiveDailyAgenda } from './ExecutiveDailyAgenda';
import { NotificationsModal } from './NotificationsModal';
import { SuggestionsPanel } from './SuggestionsPanel';
import { ConflictPanel } from './ConflictPanel';
import { AssignTimeModal } from './AssignTimeModal';
import { QuickAddTaskModal } from './QuickAddTaskModal';
import { CasaBlancaWindow } from './CasaBlancaWindow';
import { useTimeService } from '../../hooks/useTimeService';
import { getTodayDateString, formatFriendlyDate } from '../../utils/dates';
import { Bell, Calendar, Lock, AlertTriangle, Crown, Sparkles, RefreshCw } from 'lucide-react';
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
  
  // Dismissed suggestions / conflicts
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const [dismissedConflictKeys, setDismissedConflictKeys] = useState<string[]>([]);

  const agendaRef = useRef<HTMLDivElement>(null);

  // Time Service Integration
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const timeService = useTimeService(userName);
  const greeting = timeService.greeting;

  const eventsToday = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);
  const eventsWeek = OvalOfficeCalculations.getHorarioEventsForWeek(state, selectedDate);
  const agendaItems = OvalOfficeCalculations.getAgendaItems(state, selectedDate);
  const notifications = OvalOfficeCalculations.getNotifications(state, selectedDate);
  const rawSuggestions = OvalOfficeCalculations.getSuggestions(state, selectedDate);
  const rawConflicts = OvalOfficeCalculations.detectScheduleConflicts(eventsToday);
  const freeGaps = OvalOfficeCalculations.findFreeTimeGaps(eventsToday);

  // Filter out dismissed items
  const activeSuggestions = rawSuggestions.filter(s => !dismissedSuggestionIds.includes(s.id));
  const activeConflicts = rawConflicts.filter(c => {
    const key = `${c.eventA.id}_${c.eventB.id}`;
    return !dismissedConflictKeys.includes(key);
  });

  const handleFocusAgenda = () => {
    if (agendaRef.current) {
      agendaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAssignTime = (item: AgendaItem) => {
    setSelectedAgendaItem(item);
    setIsAssignTimeOpen(true);
  };

  const handleDismissSuggestion = (id: string) => {
    setDismissedSuggestionIds(prev => [...prev, id]);
  };

  const handleDismissConflict = (idA: string, idB: string) => {
    const key = `${idA}_${idB}`;
    setDismissedConflictKeys(prev => [...prev, key]);
  };

  const handleTriggerEmergencyLock = () => {
    SecurityStore.lockApp();
    if (onActivateEmergencyLock) onActivateEmergencyLock();
  };

  const handleTriggerCrisisMode = () => {
    CrisisStore.toggleCrisis(true, 'high');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-[#1A1A1A]">
      
      {/* 0. VENTANAL DE LA CASA BLANCA (LIVING INTERFACE) */}
      <CasaBlancaWindow state={state} timeService={timeService} />

      {/* 1. TOP PRESIDENTIAL BAR */}
      <div className="bg-[#0A192F] text-white border-b-2 border-[#C5A059] p-4 sm:p-6 shadow-md rounded-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#C5A059]" />
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
                Despacho Oval • Centro de Coordinación Central
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-[#C5A059]">
              <span className="font-bold">{greeting}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">{formatFriendlyDate(selectedDate)}</span>
            </div>
          </div>

          {/* TOP ACTIONS */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Date selector */}
            <div className="flex items-center bg-[#162A45] border border-[#C5A059]/40 px-2.5 py-1.5 text-white">
              <Calendar className="w-3.5 h-3.5 text-[#C5A059] mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Notifications Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="px-3 py-1.5 bg-[#162A45] hover:bg-[#1E3A5F] border border-[#C5A059]/40 text-[#C5A059] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span>Notificaciones</span>
              {notifications.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Crisis Center Button */}
            <button
              onClick={handleTriggerCrisisMode}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Centro de Crisis
            </button>

            {/* Emergency Lock */}
            <button
              onClick={handleTriggerEmergencyLock}
              className="p-1.5 bg-[#162A45] hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 transition-colors"
              title="Bloqueo de Seguridad Inmediato"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTELLIGENCE PANELS (SUGGESTIONS & CONFLICTS) */}
      {activeSuggestions.length > 0 && (
        <SuggestionsPanel
          suggestions={activeSuggestions}
          onDismissSuggestion={handleDismissSuggestion}
        />
      )}

      {activeConflicts.length > 0 && (
        <ConflictPanel
          conflicts={activeConflicts}
          onDismissConflict={handleDismissConflict}
        />
      )}

      {/* 3. EXECUTIVE DESK CANVAS (MACBOOK, IPHONE, LEATHER BINDER) */}
      <ExecutiveDeskView
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
        onFocusAgenda={handleFocusAgenda}
      />

      {/* 4. AGENDA EJECUTIVA DEL DÍA (NUEVO COMPONENTE DESTACADO PRINCIPAL DE LA OVAL OFFICE) */}
      <div ref={agendaRef}>
        <ExecutiveDailyAgenda
          state={state}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onNavigateToOffice={onNavigateToOffice}
          onOpenQuickAdd={() => setIsQuickAddTaskOpen(true)}
          onDismissConflict={handleDismissConflict}
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

      {/* 5. MAIN SCHEDULE & AGENDA CHECKLIST (2-COLUMN LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* HORARIO SEMANAL RECURRENTE (8 COLS) */}
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

        {/* CHECKLIST DE PENDIENTES (4 COLS) */}
        <div className="lg:col-span-4 h-full">
          <AgendaChecklist
            items={agendaItems}
            selectedDate={selectedDate}
            onOpenAssignTimeModal={handleOpenAssignTime}
            onOpenQuickAddTaskModal={() => setIsQuickAddTaskOpen(true)}
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

    </div>
  );
};

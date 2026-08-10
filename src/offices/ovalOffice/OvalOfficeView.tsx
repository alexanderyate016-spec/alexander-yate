import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { useTimeService } from '../../hooks/useTimeService';
import { TimeService, DayPeriod } from '../../services/TimeService';
import { getTodayDateString } from '../../utils/dates';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';

// Apple Widgets
import { HeaderGreetingBar } from './widgets/HeaderGreetingBar';
import { ClockAppleWidget } from './widgets/ClockAppleWidget';
import { NextEventAppleWidget } from './widgets/NextEventAppleWidget';
import { DailyTasksAppleWidget } from './widgets/DailyTasksAppleWidget';
import { AgendaAppleWidget } from './widgets/AgendaAppleWidget';
import { UpcomingEvaluationsAppleWidget } from './widgets/UpcomingEvaluationsAppleWidget';
import { WeeklyCalendarAppleWidget } from './widgets/WeeklyCalendarAppleWidget';
import { SocialLifeAppleWidget } from './widgets/SocialLifeAppleWidget';

// Supplementary components
import { WidgetsVivos } from './WidgetsVivos';
import { CentroInformacionPresidencial } from './CentroInformacionPresidencial';
import { SuggestionsPanel } from './SuggestionsPanel';
import { QuickAddTaskModal } from './QuickAddTaskModal';
import { QuickJournalModal } from './QuickJournalModal';
import { QuickSleepModal } from './QuickSleepModal';
import { ExecutiveStore } from './ExecutiveStore';

interface Props {
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
  onActivateEmergencyLock?: () => void;
}

export const OvalOfficeView: React.FC<Props> = ({
  state,
  onNavigateToOffice,
  onActivateEmergencyLock,
}) => {
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const realTimeService = useTimeService(userName);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Simulation and Desk Lamp States
  const [simulatedPeriod, setSimulatedPeriod] = useState<DayPeriod | 'auto'>('auto');
  const [lampOn, setLampOn] = useState<boolean>(false);

  // Compute active timeService (respecting simulation if active)
  let activeTimeService = realTimeService;
  if (simulatedPeriod !== 'auto') {
    const dummyDate = new Date(realTimeService.now);
    const hourMap: Record<DayPeriod, number> = {
      dawn: 6,
      morning: 9,
      midday: 13,
      sunset: 18,
      dusk: 20,
      night: 22,
    };
    dummyDate.setHours(hourMap[simulatedPeriod], 0, 0, 0);
    const simulatedInfo = TimeService.getPeriodInfo(dummyDate, userName);
    activeTimeService = {
      ...realTimeService,
      periodInfo: simulatedInfo,
      period: simulatedPeriod,
    };
  }

  // Auto-set default lamp state based on period if not manually toggled
  const isNightOrDusk = activeTimeService.period === 'night' || activeTimeService.period === 'dusk';
  const effectiveLampOn = lampOn || (isNightOrDusk && activeTimeService.periodInfo.atmosphere.lampDefaultOn);

  // Modal States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [isQuickSleepOpen, setIsQuickSleepOpen] = useState(false);

  // Suggestions state
  const suggestions = OvalOfficeCalculations.getSuggestions(state, selectedDate);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id));

  const handleDismissSuggestion = (id: string) => {
    setDismissedSuggestions(prev => [...prev, id]);
  };

  // Unified events for selected date
  const unifiedEvents = OvalOfficeCalculations.getUnifiedEventsForDate(state, selectedDate);

  return (
    <div className={`space-y-6 pb-12 relative min-h-screen transition-colors duration-1000 ${
      effectiveLampOn
        ? 'bg-slate-950 text-slate-100'
        : activeTimeService.periodInfo.atmosphere.appBgClass
    }`}>
      {/* SIDEBAR PRESIDENCIAL (CIP) */}
      <CentroInformacionPresidencial
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
      />

      {/* 1. DYNAMIC HEADER & ATMOSPHERIC GREETING BAR */}
      <HeaderGreetingBar
        userName={userName}
        timeService={activeTimeService}
        simulatedPeriod={simulatedPeriod}
        onSimulatePeriod={setSimulatedPeriod}
        lampOn={effectiveLampOn}
        onToggleLamp={() => setLampOn(prev => !prev)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* 2. SUGERENCIAS DE INTELIGENCIA */}
      {activeSuggestions.length > 0 && (
        <SuggestionsPanel
          suggestions={activeSuggestions}
          onDismissSuggestion={handleDismissSuggestion}
        />
      )}

      {/* 3. APPLE WIDGETS GRID - ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* WIDGET RELOJ VISUAL */}
        <ClockAppleWidget
          timeService={activeTimeService}
          lampOn={effectiveLampOn}
        />

        {/* WIDGET PRÓXIMO EVENTO */}
        <NextEventAppleWidget
          events={unifiedEvents}
          now={activeTimeService.now}
          onNavigateToOffice={onNavigateToOffice}
        />

        {/* WIDGET TAREAS Y METAS DE HOY */}
        <DailyTasksAppleWidget
          state={state}
          selectedDate={selectedDate}
          onOpenQuickAddTaskModal={() => setIsQuickAddOpen(true)}
          onNavigateToOffice={onNavigateToOffice}
        />
      </div>

      {/* 4. APPLE WIDGETS GRID - ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WIDGET GRANDE: AGENDA DE HOY (SPAN 2) */}
        <div className="lg:col-span-2">
          <AgendaAppleWidget
            events={unifiedEvents}
            selectedDate={selectedDate}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onNavigateToOffice={onNavigateToOffice}
          />
        </div>

        {/* WIDGET MEDIANO: PRÓXIMAS EVALUACIONES */}
        <UpcomingEvaluationsAppleWidget
          state={state}
          onNavigateToOffice={onNavigateToOffice}
        />
      </div>

      {/* 5. APPLE WIDGETS GRID - ROW 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WIDGET GRANDE: CALENDARIO SEMANAL (SPAN 2) */}
        <div className="lg:col-span-2">
          <WeeklyCalendarAppleWidget
            state={state}
            selectedDate={selectedDate}
            onNavigateToOffice={onNavigateToOffice}
          />
        </div>

        {/* WIDGET MEDIANO: VIDA SOCIAL & RELACIONES */}
        <SocialLifeAppleWidget
          state={state}
          onNavigateToOffice={onNavigateToOffice}
        />
      </div>

      {/* 6. WIDGETS VIVOS (SALUD, FINANZAS, SUEÑO, AGUA) */}
      <WidgetsVivos
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
        onOpenQuickSleepModal={() => setIsQuickSleepOpen(true)}
      />

      {/* MODALES DE ACCIÓN RÁPIDA */}
      <QuickAddTaskModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        selectedDate={selectedDate}
      />

      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        selectedDate={selectedDate}
        onClose={() => setIsQuickJournalOpen(false)}
      />

      <QuickSleepModal
        isOpen={isQuickSleepOpen}
        selectedDate={selectedDate}
        onClose={() => setIsQuickSleepOpen(false)}
      />
    </div>
  );
};

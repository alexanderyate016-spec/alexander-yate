import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { useTimeService } from '../../hooks/useTimeService';
import { getTodayDateString } from '../../utils/dates';
import { OvalOfficeCalculations } from './OvalOfficeCalculations';
import { CasaBlancaWindow } from './CasaBlancaWindow';
import { RelojEjecutivo } from './RelojEjecutivo';
import { SistemaHoy } from './SistemaHoy';
import { WidgetsVivos } from './WidgetsVivos';
import { ChecklistDiario } from './ChecklistDiario';
import { ExecutiveDailyAgenda } from './ExecutiveDailyAgenda';
import { CentroInteligenciaEjecutiva } from './CentroInteligenciaEjecutiva';
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
  onActivateEmergencyLock
}) => {
  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const timeService = useTimeService(userName);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

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

  const handleDismissConflict = (idA: string, idB: string) => {
    ExecutiveStore.ignoreConflict(
      { id: idA, date: selectedDate, title: 'Evento' } as any,
      { id: idB, date: selectedDate, title: 'Evento' } as any
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. VENTANAL CASA BLANCA (PANORAMA Y VISTA ATMOSFÉRICA) */}
      <CasaBlancaWindow
        state={state}
        timeService={timeService}
      />

      {/* 2. RELOJ EJECUTIVO CENTRAL */}
      <RelojEjecutivo
        timeService={timeService}
        holidayName={timeService.periodInfo.colombianHoliday?.name}
      />

      {/* 3. SUGERENCIAS DE INTELIGENCIA EJECUTIVA */}
      {activeSuggestions.length > 0 && (
        <SuggestionsPanel
          suggestions={activeSuggestions}
          onDismissSuggestion={handleDismissSuggestion}
        />
      )}

      {/* 4. SISTEMA HOY (ATENCIÓN INMEDIATA Y FOCO) */}
      <SistemaHoy
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
        onOpenQuickJournalModal={() => setIsQuickJournalOpen(true)}
      />

      {/* 5. WIDGETS VIVOS (AGUA, SUEÑO, FINANZAS, ACADÉMICO, BIENESTAR) */}
      <WidgetsVivos
        state={state}
        selectedDate={selectedDate}
        onNavigateToOffice={onNavigateToOffice}
        onOpenQuickSleepModal={() => setIsQuickSleepOpen(true)}
      />

      {/* 6. LAYOUT PRINCIPAL: AGENDA DIARIA EJECUTIVA Y CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ExecutiveDailyAgenda
            state={state}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onNavigateToOffice={onNavigateToOffice}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onDismissConflict={handleDismissConflict}
          />
        </div>

        <div className="space-y-6">
          <ChecklistDiario
            state={state}
            selectedDate={selectedDate}
            onOpenQuickAddTaskModal={() => setIsQuickAddOpen(true)}
            onOpenQuickJournalModal={() => setIsQuickJournalOpen(true)}
            onNavigateToOffice={onNavigateToOffice}
          />

          <CentroInteligenciaEjecutiva
            state={state}
            selectedDate={selectedDate}
            onNavigateToOffice={onNavigateToOffice}
          />
        </div>
      </div>

      {/* MODALS */}
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

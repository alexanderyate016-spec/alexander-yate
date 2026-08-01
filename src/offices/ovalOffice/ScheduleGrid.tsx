import React from 'react';
import { UnifiedExecutiveEvent } from '../../types/store';
import { ExecutiveCalendar, CalendarEvent } from '../../components/executive';

interface Props {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  viewMode: 'week' | 'day';
  onChangeViewMode: (mode: 'week' | 'day') => void;
  eventsByDate: Map<string, UnifiedExecutiveEvent[]>;
  eventsToday: UnifiedExecutiveEvent[];
  onNavigateToOffice: (officeKey: string) => void;
  onSelectEvent: (event: UnifiedExecutiveEvent) => void;
}

export const ScheduleGrid: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  viewMode,
  onChangeViewMode,
  eventsByDate,
  eventsToday,
  onNavigateToOffice,
  onSelectEvent
}) => {
  // Flatten events from map into CalendarEvent array
  const allEvents: CalendarEvent[] = [];
  
  eventsByDate.forEach((evtList, dateKey) => {
    evtList.forEach(e => {
      allEvents.push({
        id: e.id,
        title: e.title,
        subtitle: e.subtitle,
        date: dateKey,
        startTime: e.startTime || '08:00',
        endTime: e.endTime || '09:00',
        color: e.color || '#C5A059',
        officeLabel: e.officeLabel,
        sourceOffice: e.sourceOffice,
        raw: e
      });
    });
  });

  return (
    <ExecutiveCalendar
      events={allEvents}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      viewMode={viewMode}
      onChangeViewMode={onChangeViewMode}
      onSelectEvent={(calEvt) => {
        if (calEvt.raw) {
          onSelectEvent(calEvt.raw);
        }
      }}
      onNavigateToOffice={onNavigateToOffice}
      accentColor="gold"
      title="Horario Ejecutivo Unificado"
      subtitle="Proyección cronológica integrada de todas las oficinas con bloques de horario continuos"
    />
  );
};

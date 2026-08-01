import { MedicalOfficeData, UnifiedExecutiveEvent } from '../../types/store';

export const MedicalSync = {
  projectMedicalEvents(data: MedicalOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];

    // Medical Appointments
    (data?.appointments || []).forEach(apt => {
      if (apt.date === targetDateStr) {
        events.push({
          id: `med_apt_${apt.id}`,
          sourceOffice: 'medica',
          officeLabel: 'Oficina Médica',
          color: '#10B981',
          title: `🩺 Cita Médica: ${apt.title}`,
          subtitle: `Especialidad: ${apt.specialty} ${apt.doctor ? '| Dr(a): ' + apt.doctor : ''}`,
          date: apt.date,
          startTime: apt.startTime,
          endTime: apt.endTime || '11:00',
          type: 'appointment',
          priority: 'high',
          rawObject: apt
        });
      }
    });

    return events;
  }
};

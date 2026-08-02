import { MedicalOfficeData, UnifiedExecutiveEvent } from '../../types/store';

export const MedicalSync = {
  projectMedicalEvents(data: MedicalOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];

    // 1. Medical Appointments
    (data?.appointments || []).forEach(apt => {
      if (apt.date === targetDateStr && apt.status !== 'Cancelada') {
        events.push({
          id: `med_apt_${apt.id}`,
          sourceOffice: 'medica',
          officeLabel: 'Oficina Médica',
          color: '#10B981',
          title: `🩺 Cita Médica: ${apt.title}`,
          subtitle: `Esp: ${apt.specialty}${apt.doctor ? ' | Dr(a): ' + apt.doctor : ''}${apt.institution ? ' | Clin: ' + apt.institution : ''}`,
          date: apt.date,
          startTime: apt.startTime || '09:00',
          endTime: apt.endTime || '09:30',
          type: 'appointment',
          priority: 'high',
          rawObject: apt
        });
      }
    });

    // 2. Active Scheduled Medications
    (data?.medications || []).forEach(med => {
      if (med.status === 'active') {
        const start = med.startDate;
        const end = med.endDate;
        const isStarted = !start || start <= targetDateStr;
        const isNotEnded = !end || end >= targetDateStr;

        if (isStarted && isNotEnded) {
          const medTime = med.timeOfDay || '08:00';
          // Calculate end time 15m later
          const [h, m] = medTime.split(':').map(Number);
          const endM = (m + 15) % 60;
          const endH = h + Math.floor((m + 15) / 60);
          const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

          events.push({
            id: `med_item_${med.id}_${targetDateStr}`,
            sourceOffice: 'medica',
            officeLabel: 'Oficina Médica',
            color: '#06B6D4',
            title: `💊 Tomar ${med.name}`,
            subtitle: `Dosis: ${med.dose} (${med.schedule})`,
            date: targetDateStr,
            startTime: medTime,
            endTime: endTimeStr,
            type: 'commitment',
            priority: 'medium',
            rawObject: med
          });
        }
      }
    });

    // 3. Vaccine Booster / Next Dose Reminders
    (data?.immunizations || []).forEach(vac => {
      if (vac.nextDoseDate === targetDateStr) {
        events.push({
          id: `med_vac_${vac.id}`,
          sourceOffice: 'medica',
          officeLabel: 'Oficina Médica',
          color: '#F59E0B',
          title: `💉 Dosis / Refuerzo de Vacuna: ${vac.name}`,
          subtitle: `Previene: ${vac.preventsDisease || 'Infección'} | Dosis ${vac.dosesReceived + 1} de ${vac.dosesRequired}`,
          date: targetDateStr,
          startTime: '09:00',
          endTime: '09:30',
          type: 'commitment',
          priority: 'high',
          rawObject: vac
        });
      }
    });

    // 4. Medical Exams & Controls
    (data?.medicalExams || []).forEach(exam => {
      if (exam.date === targetDateStr || exam.nextControlDate === targetDateStr) {
        events.push({
          id: `med_exam_${exam.id}`,
          sourceOffice: 'medica',
          officeLabel: 'Oficina Médica',
          color: '#8B5CF6',
          title: `📋 Examen Médico: ${exam.name}`,
          subtitle: `Estado: ${exam.status || 'Pendiente'} ${exam.doctor ? '| Dr: ' + exam.doctor : ''}`,
          date: targetDateStr,
          startTime: '08:00',
          endTime: '08:30',
          type: 'commitment',
          priority: 'medium',
          rawObject: exam
        });
      }
    });

    return events;
  }
};

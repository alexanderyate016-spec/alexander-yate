import { MasterState, UnifiedExecutiveEvent } from '../../types/store';
import { AcademicSync } from '../academic/AcademicSync';
import { DailyLifeSync } from '../dailyLife/DailyLifeSync';
import { FinancialSync } from '../financial/FinancialSync';
import { SocialSync } from '../social/SocialSync';
import { MedicalSync } from '../medical/MedicalSync';
import { getWeekDaysForDate, COLOMBIAN_NATIONAL_HOLIDAYS } from '../../utils/dates';

export interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  sourceOffice: 'academica' | 'vidaDiaria' | 'financiera' | 'vidaSocial' | 'medica' | 'desarrolloPersonal';
  officeLabel: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  type: 'task' | 'habit' | 'objective' | 'obligation' | 'commitment' | 'medical' | 'reflection';
  date: string;
  rawObject?: any;
}

export interface ExecutiveNotice {
  id: string;
  sourceOffice: string;
  officeLabel: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  date: string;
}

export interface ExecutiveSuggestion {
  id: string;
  title: string;
  description: string;
  officeKey: string;
  actionType: 'schedule_study' | 'assign_task_time' | 'take_rest' | 'reschedule_event';
  actionPayload?: any;
}

export const OvalOfficeCalculations = {
  // Timed events for a single date
  getUnifiedEventsForDate(state: MasterState, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [
      ...AcademicSync.projectAcademicEvents(state.offices.academica, targetDateStr),
      ...DailyLifeSync.projectDailyLifeEvents(state.offices.vidaDiaria, targetDateStr),
      ...FinancialSync.projectFinancialEvents(state.offices.financiera, targetDateStr),
      ...SocialSync.projectSocialEvents(state.offices.vidaSocial, targetDateStr),
      ...MedicalSync.projectMedicalEvents(state.offices.medica, targetDateStr)
    ];

    // Sort chronologically by startTime
    events.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    return events;
  },

  // Timed events for the entire 7-day week
  getUnifiedEventsForWeek(state: MasterState, dateInWeek: string): Map<string, UnifiedExecutiveEvent[]> {
    const weekDays = getWeekDaysForDate(dateInWeek);
    const weekMap = new Map<string, UnifiedExecutiveEvent[]>();

    weekDays.forEach(day => {
      weekMap.set(day.dateStr, this.getUnifiedEventsForDate(state, day.dateStr));
    });

    return weekMap;
  },

  // Agenda / Checklist items WITHOUT fixed time
  getAgendaItems(state: MasterState, selectedDate: string): AgendaItem[] {
    const items: AgendaItem[] = [];

    // 1. Vida Diaria Tasks (WITHOUT startTime)
    (state.offices.vidaDiaria?.tasks || []).forEach(task => {
      if (task.date === selectedDate && !task.startTime) {
        items.push({
          id: task.id,
          title: task.name,
          subtitle: task.description,
          sourceOffice: 'vidaDiaria',
          officeLabel: 'Vida Diaria',
          color: '#F59E0B',
          priority: task.priority || 'medium',
          status: task.status === 'completed' ? 'completed' : 'pending',
          type: 'task',
          date: task.date,
          rawObject: task
        });
      }
    });

    // 2. Vida Diaria Habits for selectedDate
    (state.offices.vidaDiaria?.habits || []).forEach(habit => {
      const isDone = habit.logs?.[selectedDate] || false;
      items.push({
        id: `agenda_hab_${habit.id}`,
        title: `Hábito: ${habit.name}`,
        subtitle: habit.description || `Frecuencia: ${habit.frequency}`,
        sourceOffice: 'vidaDiaria',
        officeLabel: 'Vida Diaria',
        color: '#10B981',
        priority: 'medium',
        status: isDone ? 'completed' : 'pending',
        type: 'habit',
        date: selectedDate,
        rawObject: habit
      });
    });

    // 3. Daily Objectives
    (state.offices.vidaDiaria?.objectives || []).forEach(obj => {
      if (obj.date === selectedDate) {
        items.push({
          id: obj.id,
          title: `Objetivo: ${obj.title}`,
          subtitle: obj.description,
          sourceOffice: 'vidaDiaria',
          officeLabel: 'Vida Diaria',
          color: '#EAB308',
          priority: 'high',
          status: obj.status === 'completed' ? 'completed' : 'pending',
          type: 'objective',
          date: obj.date,
          rawObject: obj
        });
      }
    });

    // 4. Financial Obligations due on/before selectedDate (unpaid, without time)
    (state.offices.financiera?.obligations || []).forEach(ob => {
      if (ob.dueDate === selectedDate && !ob.isPaid) {
        items.push({
          id: `agenda_fin_${ob.id}`,
          title: `Pago: ${ob.title}`,
          subtitle: `Monto: $${ob.amount.toLocaleString('es-CO')} ${ob.currency}`,
          sourceOffice: 'financiera',
          officeLabel: 'Financiera',
          color: '#3B82F6',
          priority: 'high',
          status: 'pending',
          type: 'obligation',
          date: ob.dueDate,
          rawObject: ob
        });
      }
    });

    // 5. Social Commitments without time
    (state.offices.vidaSocial?.commitments || []).forEach(com => {
      if (com.date === selectedDate && !com.startTime) {
        items.push({
          id: `agenda_soc_${com.id}`,
          title: `Compromiso: ${com.title}`,
          subtitle: com.location ? `Lugar: ${com.location}` : undefined,
          sourceOffice: 'vidaSocial',
          officeLabel: 'Relaciones',
          color: '#8B5CF6',
          priority: com.priority || 'medium',
          status: 'pending',
          type: 'commitment',
          date: com.date,
          rawObject: com
        });
      }
    });

    // 6. Medical Medications pending today
    (state.offices.medica?.medications || []).forEach(med => {
      items.push({
        id: `agenda_med_${med.id}`,
        title: `Dosis: ${med.name} (${med.dose})`,
        subtitle: `Horario: ${med.schedule}`,
        sourceOffice: 'medica',
        officeLabel: 'Salud',
        color: '#06B6D4',
        priority: 'high',
        status: 'pending',
        type: 'medical',
        date: selectedDate,
        rawObject: med
      });
    });

    return items;
  },

  // Central System Notifications
  getNotifications(state: MasterState, targetDateStr: string): ExecutiveNotice[] {
    const notices: ExecutiveNotice[] = [];
    const todayMMDD = targetDateStr.substring(5);

    // 1. Classes today
    const eventsToday = this.getUnifiedEventsForDate(state, targetDateStr);
    eventsToday.filter(e => e.type === 'class').forEach(c => {
      notices.push({
        id: `not_cls_${c.id}`,
        sourceOffice: 'academica',
        officeLabel: 'Oficina Académica',
        title: 'Clase Programada Hoy',
        message: `${c.title} a las ${c.startTime} - ${c.endTime}. ${c.subtitle || ''}`,
        type: 'info',
        date: targetDateStr
      });
    });

    // 2. Evaluations today
    eventsToday.filter(e => e.type === 'evaluation').forEach(ev => {
      notices.push({
        id: `not_eval_${ev.id}`,
        sourceOffice: 'academica',
        officeLabel: 'Oficina Académica',
        title: 'Evaluación Académica Hoy',
        message: `Atención: ${ev.title} a las ${ev.startTime}.`,
        type: 'urgent',
        date: targetDateStr
      });
    });

    // 3. Financial Obligations
    (state.offices.financiera?.obligations || []).forEach(ob => {
      if (ob.dueDate === targetDateStr && !ob.isPaid) {
        notices.push({
          id: `not_fin_${ob.id}`,
          sourceOffice: 'financiera',
          officeLabel: 'Oficina Financiera',
          title: 'Obligación Financiera Pendiente',
          message: `Vencimiento hoy: ${ob.title} por $${ob.amount.toLocaleString('es-CO')} ${ob.currency}.`,
          type: 'urgent',
          date: targetDateStr
        });
      }
    });

    // 4. Medical Appointments
    (state.offices.medica?.appointments || []).forEach(apt => {
      if (apt.date === targetDateStr) {
        notices.push({
          id: `not_med_${apt.id}`,
          sourceOffice: 'medica',
          officeLabel: 'Oficina Médica',
          title: 'Cita Médica Programada',
          message: `Cita: ${apt.title} con ${apt.doctor || 'médico'} (${apt.specialty}) a las ${apt.startTime || '09:00'}.`,
          type: 'urgent',
          date: targetDateStr
        });
      }
    });

    // 5. Birthdays today
    (state.offices.vidaSocial?.people || []).forEach(person => {
      if (person.birthday && person.birthday.endsWith(todayMMDD)) {
        notices.push({
          id: `not_bday_${person.id}`,
          sourceOffice: 'vidaSocial',
          officeLabel: 'Oficina de Relaciones',
          title: 'Cumpleaños Hoy 🎂',
          message: `Hoy es el cumpleaños de ${person.name} (${person.relationship || 'Contacto'}).`,
          type: 'info',
          date: targetDateStr
        });
      }
    });

    // 6. Colombian Holiday
    const holiday = COLOMBIAN_NATIONAL_HOLIDAYS.find(h => h.monthDay === todayMMDD);
    if (holiday) {
      notices.push({
        id: `not_hol_${holiday.monthDay}`,
        sourceOffice: 'vidaSocial',
        officeLabel: 'Calendario Oficial',
        title: `Festivo Nacional: ${holiday.title}`,
        message: holiday.message,
        type: 'info',
        date: targetDateStr
      });
    }

    return notices;
  },

  // AI / Executive Intelligence Suggestions
  getSuggestions(state: MasterState, targetDateStr: string): ExecutiveSuggestion[] {
    const suggestions: ExecutiveSuggestion[] = [];
    const events = this.getUnifiedEventsForDate(state, targetDateStr);
    const agenda = this.getAgendaItems(state, targetDateStr);

    // 1. Detect unassigned priority tasks
    const highPriorityUnassigned = agenda.find(a => a.priority === 'high' && a.type === 'task');
    if (highPriorityUnassigned) {
      suggestions.push({
        id: `sug_assign_${highPriorityUnassigned.id}`,
        title: 'Asignar horario a tarea prioritaria',
        description: `La tarea "${highPriorityUnassigned.title}" no tiene hora específica. ¿Asignar a las 11:00 AM para asegurar su ejecución?`,
        officeKey: 'vidaDiaria',
        actionType: 'assign_task_time',
        actionPayload: { taskId: highPriorityUnassigned.rawObject.id, date: targetDateStr, startTime: '11:00', endTime: '12:00' }
      });
    }

    // 2. Suggest study time if classes exist today
    const classesToday = events.filter(e => e.type === 'class');
    if (classesToday.length > 0 && events.length < 5) {
      suggestions.push({
        id: `sug_study_${targetDateStr}`,
        title: 'Bloque de Estudio Recomendado',
        description: `Tienes ${classesToday.length} clase(s) hoy. ¿Agendar un bloque de repaso académico a las 16:00 (16:00 - 18:00)?`,
        officeKey: 'academica',
        actionType: 'schedule_study',
        actionPayload: { date: targetDateStr, startTime: '16:00', endTime: '18:00', title: 'Estudio y Repaso Académico' }
      });
    }

    // 3. High workload rest suggestion
    if (events.length >= 4) {
      suggestions.push({
        id: `sug_rest_${targetDateStr}`,
        title: 'Pausa Ejecutiva Recomendada',
        description: `Tienes ${events.length} compromisos programados hoy. ¿Programar una pausa activa de 30 minutos a las 13:00?`,
        officeKey: 'vidaDiaria',
        actionType: 'take_rest',
        actionPayload: { date: targetDateStr, startTime: '13:00', endTime: '13:30', title: 'Pausa de Descanso y Recuperación' }
      });
    }

    return suggestions;
  },

  // Conflict Detection
  detectScheduleConflicts(events: UnifiedExecutiveEvent[]): Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }> {
    const conflicts: Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }> = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];

        if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) continue;

        // Check time overlap: (StartA < EndB) and (EndA > StartB)
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          conflicts.push({ eventA: a, eventB: b });
        }
      }
    }

    return conflicts;
  }
};

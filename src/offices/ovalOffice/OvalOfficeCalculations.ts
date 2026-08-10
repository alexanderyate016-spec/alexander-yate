import { MasterState, UnifiedExecutiveEvent } from '../../types/store';
import { AcademicSync } from '../academic/AcademicSync';
import { DailyLifeSync } from '../dailyLife/DailyLifeSync';
import { FinancialSync } from '../financial/FinancialSync';
import { SocialSync } from '../social/SocialSync';
import { MedicalSync } from '../medical/MedicalSync';
import { ChiefOfStaffSync } from '../chiefOfStaff/ChiefOfStaffSync';
import { getWeekDaysForDate, getTodayDateString, addDaysToDateStr, getDaysDifference, COLOMBIAN_NATIONAL_HOLIDAYS } from '../../utils/dates';

export interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  sourceOffice: 'academica' | 'vidaDiaria' | 'financiera' | 'vidaSocial' | 'medica' | 'desarrolloPersonal';
  officeLabel: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  type: 'task' | 'habit' | 'objective' | 'obligation' | 'commitment' | 'medical' | 'reflection' | 'academic_activity' | 'evaluation';
  date: string;
  startTime?: string;
  endTime?: string;
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

export interface FreeTimeGap {
  id: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  durationMinutes: number;
  durationFormatted: string;
  suggestions: string[];
}

export const formatMinutesToHumanReadable = (mins: number): string => {
  if (mins < 60) {
    return `${mins} minutos`;
  }
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  return `${hours} ${hours === 1 ? 'hora' : 'horas'} y ${remainder} minutos`;
};

export const OvalOfficeCalculations = {
  // Horario = Actividades recurrentes y estructurales (Clases semanales)
  getHorarioEventsForDate(state: MasterState, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [
      ...AcademicSync.projectHorarioEvents(state.offices.academica, targetDateStr),
      ...DailyLifeSync.projectDailyLifeEvents(state.offices.vidaDiaria, targetDateStr)
    ];

    events.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    return events;
  },

  // Horario para la semana entera (7 días)
  getHorarioEventsForWeek(state: MasterState, dateInWeek: string): Map<string, UnifiedExecutiveEvent[]> {
    const weekDays = getWeekDaysForDate(dateInWeek);
    const weekMap = new Map<string, UnifiedExecutiveEvent[]>();

    weekDays.forEach(day => {
      weekMap.set(day.dateStr, this.getHorarioEventsForDate(state, day.dateStr));
    });

    return weekMap;
  },

  // Timed events unificados para un día específico (Horario + Agenda) para ocupación y detección de conflictos
  getUnifiedEventsForDate(state: MasterState, targetDateStr: string): UnifiedExecutiveEvent[] {
    return ChiefOfStaffSync.getUnifiedEventsForDate(state, targetDateStr);
  },

  // Timed events for the entire 7-day week (Unificado total)
  getUnifiedEventsForWeek(state: MasterState, dateInWeek: string): Map<string, UnifiedExecutiveEvent[]> {
    const weekDays = getWeekDaysForDate(dateInWeek);
    const weekMap = new Map<string, UnifiedExecutiveEvent[]>();

    weekDays.forEach(day => {
      weekMap.set(day.dateStr, this.getUnifiedEventsForDate(state, day.dateStr));
    });

    return weekMap;
  },

  // Agenda = Eventos puntuales con fecha concreta (Actividades académicas, evaluaciones, citas, pagos, tareas)
  getAgendaItems(state: MasterState, selectedDate: string): AgendaItem[] {
    const items: AgendaItem[] = [];

    // 1. Actividades Académicas puntualizadas para selectedDate -> AGENDA
    (state.offices.academica?.subjects || []).forEach(sub => {
      (sub.academicActivities || []).forEach(act => {
        if (act.date === selectedDate && act.status !== 'Cancelada') {
          const timeStr = act.startTime ? `${act.startTime}${act.endTime ? ' - ' + act.endTime : ''}` : '';
          items.push({
            id: `agenda_acad_act_${sub.id}_${act.id}`,
            title: `Actividad: ${act.name} (${sub.name})`,
            subtitle: `${act.type}${timeStr ? ' • ' + timeStr : ''}${act.location ? ' • ' + act.location : ''}`,
            sourceOffice: 'academica',
            officeLabel: 'Oficina Académica',
            color: sub.color || '#3B82F6',
            priority: 'medium',
            status: act.status === 'Realizada' ? 'completed' : 'pending',
            type: 'academic_activity',
            date: act.date,
            startTime: act.startTime,
            endTime: act.endTime,
            rawObject: { subject: sub, academicActivity: act }
          });
        }
      });

      // 2. Evaluaciones Programadas para selectedDate -> AGENDA
      (sub.cuts || []).forEach(cut => {
        (cut.activities || []).forEach(act => {
          if (act.date === selectedDate) {
            items.push({
              id: `agenda_acad_eval_${sub.id}_${act.id}`,
              title: `Evaluación: ${act.name} (${sub.name})`,
              subtitle: `${cut.cutName} (${act.weightPercent}%)${act.time ? ' • ' + act.time : ''}`,
              sourceOffice: 'academica',
              officeLabel: 'Oficina Académica',
              color: '#8B5CF6',
              priority: 'high',
              status: act.status === 'graded' ? 'completed' : 'pending',
              type: 'evaluation',
              date: act.date,
              startTime: act.time || '09:00',
              endTime: act.time ? `${parseInt(act.time.split(':')[0]) + 1}:${act.time.split(':')[1]}` : '10:00',
              rawObject: { subject: sub, cut, activity: act }
            });
          }
        });
      });
    });

    // 3. Vida Diaria Tasks
    (state.offices.vidaDiaria?.tasks || []).forEach(task => {
      if (task.date === selectedDate) {
        items.push({
          id: task.id,
          title: task.name,
          subtitle: task.description || (task.startTime ? `Hora: ${task.startTime}` : undefined),
          sourceOffice: 'vidaDiaria',
          officeLabel: 'Vida Diaria',
          color: '#F59E0B',
          priority: task.priority || 'medium',
          status: task.status === 'completed' ? 'completed' : 'pending',
          type: 'task',
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
          rawObject: task
        });
      }
    });

    // 4. Vida Diaria Habits for selectedDate
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

    // 5. Daily Objectives
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

    // 6. Financial Obligations due on selectedDate
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

    // 7. Social Commitments for selectedDate
    (state.offices.vidaSocial?.commitments || []).forEach(com => {
      if (com.date === selectedDate) {
        items.push({
          id: `agenda_soc_${com.id}`,
          title: `Compromiso: ${com.title}`,
          subtitle: com.location ? `Lugar: ${com.location}${com.startTime ? ' • ' + com.startTime : ''}` : (com.startTime ? `Hora: ${com.startTime}` : undefined),
          sourceOffice: 'vidaSocial',
          officeLabel: 'Relaciones',
          color: '#8B5CF6',
          priority: com.priority || 'medium',
          status: 'pending',
          type: 'commitment',
          date: com.date,
          startTime: com.startTime,
          endTime: com.endTime,
          rawObject: com
        });
      }
    });

    // 8. Medical Medications pending today
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

  // Conflict Detection - Only detects real conflicts between competing commitments
  detectScheduleConflicts(events: UnifiedExecutiveEvent[], state?: MasterState): Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }> {
    const conflicts: Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }> = [];
    const dismissed = new Set(state?.executive?.dismissedConflicts || []);

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];

        if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) continue;

        // 1. Skip cancelled events
        if (a.status === 'Cancelada' || a.status === 'cancelled' || b.status === 'Cancelada' || b.status === 'cancelled') continue;
        if (a.rawObject?.status === 'Cancelada' || a.rawObject?.academicActivity?.status === 'Cancelada' || b.rawObject?.status === 'Cancelada' || b.rawObject?.academicActivity?.status === 'Cancelada') continue;

        // 2. Skip events with justified absence
        if (a.isJustifiedAbsence || b.isJustifiedAbsence || a.rawObject?.isJustifiedAbsence || b.rawObject?.isJustifiedAbsence) continue;

        // 3. Skip same-subject class & activity substitutions or complements
        const subA = a.rawObject?.subject?.id;
        const subB = b.rawObject?.subject?.id;
        if (subA && subB && subA === subB) {
          if ((a.type === 'class' && b.type === 'academic_activity') || (b.type === 'class' && a.type === 'academic_activity')) {
            const act = a.type === 'academic_activity' ? a : b;
            const relation = act.classRelation || 'replaces';
            if (relation === 'replaces' || relation === 'complements') {
              continue; // Substitution or complement, NOT a conflict
            }
          }
        }

        // 4. Skip if conflict key was resolved or dismissed
        const confKey1 = `${a.id}_${b.id}`;
        const confKey2 = `${b.id}_${a.id}`;
        if (dismissed.has(confKey1) || dismissed.has(confKey2)) continue;

        // Check time overlap: (StartA < EndB) and (EndA > StartB)
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          conflicts.push({ eventA: a, eventB: b });
        }
      }
    }

    return conflicts;
  },

  // Identification of Free Time Gaps between scheduled events
  findFreeTimeGaps(events: UnifiedExecutiveEvent[], dayStartHour = 7, dayEndHour = 22): FreeTimeGap[] {
    const parseMins = (timeStr?: string): number | null => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    };

    const formatMins = (mins: number): string => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Filter events with valid times and sort by startTime
    const timedEvents = events
      .map(e => ({
        startM: parseMins(e.startTime),
        endM: parseMins(e.endTime || e.startTime)
      }))
      .filter((e): e is { startM: number; endM: number } => e.startM !== null && e.endM !== null && e.endM > e.startM)
      .sort((a, b) => a.startM - b.startM);

    if (timedEvents.length === 0) return [];

    // Merge overlapping/adjacent intervals to get actual busy blocks
    const busyBlocks: Array<{ startM: number; endM: number }> = [];
    timedEvents.forEach(evt => {
      if (busyBlocks.length === 0) {
        busyBlocks.push({ ...evt });
      } else {
        const last = busyBlocks[busyBlocks.length - 1];
        if (evt.startM <= last.endM) {
          last.endM = Math.max(last.endM, evt.endM);
        } else {
          busyBlocks.push({ ...evt });
        }
      }
    });

    const gaps: FreeTimeGap[] = [];
    const minDayM = dayStartHour * 60;
    const maxDayM = dayEndHour * 60;

    // Check gap before first busy block
    if (busyBlocks[0].startM - minDayM >= 20) {
      const dur = busyBlocks[0].startM - minDayM;
      gaps.push({
        id: `gap_start_${minDayM}`,
        startTime: formatMins(minDayM),
        endTime: formatMins(busyBlocks[0].startM),
        durationMinutes: dur,
        durationFormatted: formatMinutesToHumanReadable(dur),
        suggestions: ['estudiar', 'completar tareas', 'descansar', 'realizar hábitos', 'adelantar objetivos']
      });
    }

    // Check gaps between consecutive busy blocks
    for (let i = 0; i < busyBlocks.length - 1; i++) {
      const currentEnd = busyBlocks[i].endM;
      const nextStart = busyBlocks[i + 1].startM;
      const gapMins = nextStart - currentEnd;

      if (gapMins >= 15) {
        gaps.push({
          id: `gap_${i}_${currentEnd}`,
          startTime: formatMins(currentEnd),
          endTime: formatMins(nextStart),
          durationMinutes: gapMins,
          durationFormatted: formatMinutesToHumanReadable(gapMins),
          suggestions: ['estudiar', 'completar tareas', 'descansar', 'realizar hábitos', 'adelantar objetivos']
        });
      }
    }

    // Check gap after last busy block
    const lastEnd = busyBlocks[busyBlocks.length - 1].endM;
    if (maxDayM - lastEnd >= 30) {
      const dur = maxDayM - lastEnd;
      gaps.push({
        id: `gap_end_${lastEnd}`,
        startTime: formatMins(lastEnd),
        endTime: formatMins(maxDayM),
        durationMinutes: dur,
        durationFormatted: formatMinutesToHumanReadable(dur),
        suggestions: ['estudiar', 'completar tareas', 'descansar', 'realizar hábitos', 'adelantar objetivos']
      });
    }

    return gaps;
  },

  // Resumen de métricas para el encabezado del día
  getDaySummaryMetrics(state: MasterState, dateStr: string) {
    const events = this.getUnifiedEventsForDate(state, dateStr);
    const conflicts = this.detectScheduleConflicts(events, state);
    const gaps = this.findFreeTimeGaps(events);

    let occupiedMins = 0;
    events.forEach(e => {
      if (e.startTime && e.endTime) {
        const [h1, m1] = e.startTime.split(':').map(Number);
        const [h2, m2] = e.endTime.split(':').map(Number);
        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
          const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (diff > 0) occupiedMins += diff;
        }
      } else if (e.startTime) {
        occupiedMins += 60; // Default 1 hr if no end time
      }
    });

    let freeMins = gaps.reduce((acc, g) => acc + g.durationMinutes, 0);

    return {
      eventsCount: events.length,
      conflictsCount: conflicts.length,
      occupiedMinutes: occupiedMins,
      occupiedFormatted: formatMinutesToHumanReadable(occupiedMins),
      freeMinutes: freeMins,
      freeFormatted: formatMinutesToHumanReadable(freeMins)
    };
  },

  // Indicadores visuales para las píldoras del selector de 7 días
  getDayIndicatorFlags(state: MasterState, dateStr: string) {
    const events = this.getUnifiedEventsForDate(state, dateStr);
    const conflicts = this.detectScheduleConflicts(events, state);

    return {
      hasConflicts: conflicts.length > 0,
      hasBirthday: events.some(e => e.type === 'birthday' || e.sourceOffice === 'vidaSocial'),
      hasMedical: events.some(e => e.type === 'appointment' || e.sourceOffice === 'medica'),
      hasEvaluation: events.some(e => e.type === 'evaluation'),
      hasFinancial: events.some(e => e.type === 'obligation' || e.sourceOffice === 'financiera'),
      isHighVolume: events.length > 4
    };
  },

  // Próximos eventos destacados a partir de la fecha de inicio
  getUpcomingEvents(state: MasterState, fromDateStr: string = getTodayDateString(), limit = 5) {
    const upcoming: Array<{
      event: UnifiedExecutiveEvent;
      dateStr: string;
      relativeLabel: string;
    }> = [];

    const todayStr = getTodayDateString();

    for (let i = 0; i < 14; i++) {
      const curDate = addDaysToDateStr(fromDateStr, i);
      const events = this.getUnifiedEventsForDate(state, curDate);

      const diff = getDaysDifference(todayStr, curDate);
      let relativeLabel = `En ${diff} días`;
      if (diff === 0) relativeLabel = 'Hoy';
      else if (diff === 1) relativeLabel = 'Mañana';

      events.forEach(evt => {
        upcoming.push({
          event: evt,
          dateStr: curDate,
          relativeLabel
        });
      });

      if (upcoming.length >= limit * 3) break;
    }

    // Sort chronologically
    upcoming.sort((a, b) => {
      if (a.dateStr !== b.dateStr) {
        return a.dateStr.localeCompare(b.dateStr);
      }
      const timeA = a.event.startTime || '00:00';
      const timeB = b.event.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    return upcoming.slice(0, limit);
  }
};

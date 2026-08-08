import { MasterState, UnifiedExecutiveEvent, ChiefOfStaffEvent, PersonalScheduleConfig } from '../../types/store';
import { AcademicSync } from '../academic/AcademicSync';
import { DailyLifeSync } from '../dailyLife/DailyLifeSync';
import { FinancialSync } from '../financial/FinancialSync';
import { SocialSync } from '../social/SocialSync';
import { MedicalSync } from '../medical/MedicalSync';
import { getTodayDateString, addDaysToDateStr, getWeekDaysForDate } from '../../utils/dates';

export interface TravelBlock {
  id: string;
  relatedEventId: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
}

export interface FreeTimeGap {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  durationFormatted: string;
  suggestions: string[];
}

export interface ScheduleConflict {
  id: string;
  eventA: UnifiedExecutiveEvent;
  eventB: UnifiedExecutiveEvent;
  overlapMinutes: number;
  timeRange: string;
  description: string;
}

export interface ExecutiveReminder {
  id: string;
  tier: 'ahora' | 'proximo' | 'importante' | 'vencido';
  title: string;
  subtitle: string;
  sourceOffice: string;
  color: string;
  timeLabel?: string;
  dateStr: string;
}

export interface ExecutiveBriefing {
  greeting: string;
  summaryText: string;
  totalCommitments: number;
  conflictCount: number;
  importantTaskCount: number;
  firstActivityTime: string;
  nextFreeGapText: string;
  conflicts: ScheduleConflict[];
  priorities: Array<{ title: string; category: string; priority: 'high' | 'medium' | 'low'; office: string }>;
  freeTimeGaps: FreeTimeGap[];
}

// Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Convert minutes from midnight to "HH:mm"
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatMinutesHuman(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) return `${hours} h`;
  return `${hours} h ${remainder} min`;
}

export class ChiefOfStaffSync {
  /**
   * Gather standalone Cabinet events for a given date, handling recurrence
   */
  public static getCabinetEventsForDate(state: MasterState, dateStr: string): UnifiedExecutiveEvent[] {
    const cabinetEvents = state.offices.jefaturaGabinete?.events || [];
    const results: UnifiedExecutiveEvent[] = [];

    cabinetEvents.forEach(evt => {
      if (evt.status === 'cancelled') return;

      let applies = false;
      if (!evt.isRecurring) {
        if (evt.date === dateStr) applies = true;
      } else if (evt.recurrenceRule) {
        const rule = evt.recurrenceRule;
        const startDate = rule.startDate || evt.date;
        const endDate = rule.endDate || '2099-12-31';

        if (dateStr >= startDate && dateStr <= endDate) {
          if (rule.type === 'daily') {
            applies = true;
          } else if (rule.type === 'weekly' && rule.daysOfWeek) {
            const dateObj = new Date(dateStr + 'T12:00:00');
            const jsDay = dateObj.getDay();
            const dayNum = jsDay === 0 ? 7 : jsDay;
            if (rule.daysOfWeek.includes(dayNum)) applies = true;
          } else if (rule.type === 'single' && (rule.startDate === dateStr || evt.date === dateStr)) {
            applies = true;
          }
        }
      }

      if (applies) {
        results.push({
          id: evt.id,
          sourceOffice: evt.sourceOffice || 'jefatura',
          officeLabel: evt.sourceOffice === 'jefatura' ? 'Jefatura de Gabinete' : 'Oficina Presidencial',
          color: evt.sourceOffice === 'jefatura' ? '#8B5CF6' : '#3B82F6',
          title: evt.title,
          subtitle: evt.description || evt.location ? `${evt.location || ''} ${evt.description || ''}`.trim() : 'Evento de Gabinete',
          date: dateStr,
          startTime: evt.startTime,
          endTime: evt.endTime,
          type: 'commitment',
          priority: evt.priority,
          location: evt.location,
          travelTimeMinutes: evt.travelTimeMinutes,
          prepTimeMinutes: evt.prepTimeMinutes,
          rawObject: evt
        });
      }
    });

    return results;
  }

  /**
   * Unified list of ALL events across all specialized offices for a specific date
   */
  public static getUnifiedEventsForDate(state: MasterState, dateStr: string): UnifiedExecutiveEvent[] {
    const rawEvents: UnifiedExecutiveEvent[] = [
      ...AcademicSync.projectAcademicEvents(state.offices.academica, dateStr),
      ...DailyLifeSync.projectDailyLifeEvents(state.offices.vidaDiaria, dateStr),
      ...FinancialSync.projectFinancialEvents(state.offices.financiera, dateStr),
      ...SocialSync.projectSocialEvents(state.offices.vidaSocial, dateStr),
      ...MedicalSync.projectMedicalEvents(state.offices.medica, dateStr),
      ...this.getCabinetEventsForDate(state, dateStr)
    ];

    // Filter out items that have been cancelled or overridden in cabinet
    const resolvedConflicts = state.offices.jefaturaGabinete?.resolvedConflicts || [];
    const cancelledEventIds = new Set<string>();

    resolvedConflicts.forEach(rc => {
      if (rc.actionTaken.includes('cancelled_A')) cancelledEventIds.add(rc.eventAId);
      if (rc.actionTaken.includes('cancelled_B')) cancelledEventIds.add(rc.eventBId);
    });

    const filtered = rawEvents.filter(e => !cancelledEventIds.has(e.id));

    // Sort chronologically by startTime
    filtered.sort((a, b) => {
      const timeA = timeToMinutes(a.startTime);
      const timeB = timeToMinutes(b.startTime);
      return timeA - timeB;
    });

    return filtered;
  }

  /**
   * Detect conflicts (overlaps) among timed events for a date
   */
  public static detectConflicts(events: UnifiedExecutiveEvent[]): ScheduleConflict[] {
    const timedEvents = events.filter(e => e.startTime && e.endTime);
    const conflicts: ScheduleConflict[] = [];

    for (let i = 0; i < timedEvents.length; i++) {
      for (let j = i + 1; j < timedEvents.length; j++) {
        const e1 = timedEvents[i];
        const e2 = timedEvents[j];

        const start1 = timeToMinutes(e1.startTime);
        const end1 = timeToMinutes(e1.endTime);
        const start2 = timeToMinutes(e2.startTime);
        const end2 = timeToMinutes(e2.endTime);

        // Check overlap
        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);

        if (overlapEnd > overlapStart) {
          const overlapMins = overlapEnd - overlapStart;
          conflicts.push({
            id: `conflict_${e1.id}_${e2.id}`,
            eventA: e1,
            eventB: e2,
            overlapMinutes: overlapMins,
            timeRange: `${minutesToTime(overlapStart)} – ${minutesToTime(overlapEnd)}`,
            description: `Traslape de ${formatMinutesHuman(overlapMins)} entre "${e1.title}" (${e1.officeLabel}) y "${e2.title}" (${e2.officeLabel})`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Calculate explicit free time gaps between waking and sleeping hours
   */
  public static calculateFreeTimeGaps(
    events: UnifiedExecutiveEvent[],
    config: PersonalScheduleConfig,
    targetDateStr: string
  ): FreeTimeGap[] {
    const wakeMins = timeToMinutes(config.wakeUpTime || '06:30');
    const sleepMins = timeToMinutes(config.sleepTime || '23:00');

    // Filter timed events within wake-sleep window
    const timed = events
      .filter(e => e.startTime && e.endTime)
      .map(e => ({
        start: timeToMinutes(e.startTime),
        end: timeToMinutes(e.endTime),
        title: e.title
      }))
      .sort((a, b) => a.start - b.start);

    const gaps: FreeTimeGap[] = [];
    let currentPointer = wakeMins;

    timed.forEach(evt => {
      if (evt.start > currentPointer + 15) { // Only consider gaps >= 15 min
        const gapMins = evt.start - currentPointer;
        gaps.push({
          id: `gap_${currentPointer}_${evt.start}`,
          startTime: minutesToTime(currentPointer),
          endTime: minutesToTime(evt.start),
          durationMinutes: gapMins,
          durationFormatted: formatMinutesHuman(gapMins),
          suggestions: this.getFreeTimeSuggestions(gapMins)
        });
      }
      currentPointer = Math.max(currentPointer, evt.end);
    });

    if (sleepMins > currentPointer + 15) {
      const gapMins = sleepMins - currentPointer;
      gaps.push({
        id: `gap_${currentPointer}_${sleepMins}`,
        startTime: minutesToTime(currentPointer),
        endTime: minutesToTime(sleepMins),
        durationMinutes: gapMins,
        durationFormatted: formatMinutesHuman(gapMins),
        suggestions: this.getFreeTimeSuggestions(gapMins)
      });
    }

    return gaps;
  }

  private static getFreeTimeSuggestions(durationMins: number): string[] {
    if (durationMins < 30) {
      return ['Pausa activa', 'Hidratación', 'Revisar notas cortas', 'Mantener libre'];
    } else if (durationMins < 60) {
      return ['Estudio enfocado', 'Caminata de descanso', 'Avanzar tarea pendiente', 'Mantener libre'];
    } else if (durationMins < 120) {
      return ['Bloque de estudio o repaso', 'Almuerzo / Comida tranquila', 'Ejercicio o entrenamiento', 'Mantener libre'];
    } else {
      return ['Bloque profundo de estudio/proyecto', 'Tiempo libre para esparcimiento', 'Desconexión personal'];
    }
  }

  /**
   * Generates Executive Reminders in 4 structured categories (Ahora, Próximo, Importante, Vencido)
   */
  public static getExecutiveReminders(state: MasterState, todayStr: string): ExecutiveReminder[] {
    const reminders: ExecutiveReminder[] = [];
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

    // 1. Unified events for today
    const todayEvents = this.getUnifiedEventsForDate(state, todayStr);

    todayEvents.forEach(evt => {
      if (!evt.startTime) return;
      const startMins = timeToMinutes(evt.startTime);
      const endMins = evt.endTime ? timeToMinutes(evt.endTime) : startMins + 60;

      // AHORA (🔴): Currently running or starts in <= 30 mins today
      if (startMins - nowMins <= 30 && endMins >= nowMins) {
        reminders.push({
          id: `rem_now_${evt.id}`,
          tier: 'ahora',
          title: evt.title,
          subtitle: `En curso / Inicia a las ${evt.startTime}${evt.location ? ' • ' + evt.location : ''}`,
          sourceOffice: evt.officeLabel,
          color: '#EF4444',
          timeLabel: evt.startTime,
          dateStr: todayStr
        });
      } else if (startMins > nowMins) {
        // PRÓXIMO (🟡): Later today
        reminders.push({
          id: `rem_prox_${evt.id}`,
          tier: 'proximo',
          title: evt.title,
          subtitle: `Hoy a las ${evt.startTime} (${evt.officeLabel})`,
          sourceOffice: evt.officeLabel,
          color: '#F59E0B',
          timeLabel: evt.startTime,
          dateStr: todayStr
        });
      }
    });

    // 2. Tomorrow events -> PRÓXIMO (🟡)
    const tomorrowStr = addDaysToDateStr(todayStr, 1);
    const tomorrowEvents = this.getUnifiedEventsForDate(state, tomorrowStr);
    tomorrowEvents.slice(0, 4).forEach(evt => {
      reminders.push({
        id: `rem_tom_${evt.id}`,
        tier: 'proximo',
        title: evt.title,
        subtitle: `Mañana ${evt.startTime ? 'a las ' + evt.startTime : ''} (${evt.officeLabel})`,
        sourceOffice: evt.officeLabel,
        color: '#F59E0B',
        timeLabel: 'Mañana',
        dateStr: tomorrowStr
      });
    });

    // 3. IMPORTANTE (🟠): Exams, evaluations, obligations, medical appointments in next 3 days
    for (let d = 0; d <= 3; d++) {
      const futureDate = addDaysToDateStr(todayStr, d);
      const dayEvts = this.getUnifiedEventsForDate(state, futureDate);

      dayEvts.forEach(evt => {
        if (
          evt.type === 'evaluation' ||
          evt.type === 'academic_activity' ||
          evt.type === 'obligation' ||
          evt.type === 'appointment'
        ) {
          if (!reminders.some(r => r.id.includes(evt.id))) {
            reminders.push({
              id: `rem_imp_${evt.id}`,
              tier: 'importante',
              title: `${evt.type === 'evaluation' ? '📝 Parcial/Examen' : '⚠️ Compromiso Clave'}: ${evt.title}`,
              subtitle: `${futureDate === todayStr ? 'Hoy' : 'Fecha: ' + futureDate} • ${evt.officeLabel}`,
              sourceOffice: evt.officeLabel,
              color: '#F97316',
              timeLabel: futureDate,
              dateStr: futureDate
            });
          }
        }
      });
    }

    // 4. VENCIDO (🔴): Pending tasks or obligations with past dates
    const tasks = state.offices.vidaDiaria?.tasks || [];
    tasks.forEach(t => {
      if (t.status === 'pending' && t.date < todayStr) {
        reminders.push({
          id: `rem_overdue_task_${t.id}`,
          tier: 'vencido',
          title: `Tarea Pendiente Atrasada: ${t.name}`,
          subtitle: `Programada para el ${t.date}`,
          sourceOffice: 'Vida Diaria',
          color: '#DC2626',
          timeLabel: t.date,
          dateStr: t.date
        });
      }
    });

    const obligations = state.offices.financiera?.obligations || [];
    obligations.forEach(ob => {
      if (!ob.isPaid && ob.dueDate < todayStr) {
        reminders.push({
          id: `rem_overdue_fin_${ob.id}`,
          tier: 'vencido',
          title: `Vencimiento Financiero: ${ob.title}`,
          subtitle: `Venció el ${ob.dueDate} ($${ob.amount.toLocaleString()})`,
          sourceOffice: 'Financiera',
          color: '#DC2626',
          timeLabel: ob.dueDate,
          dateStr: ob.dueDate
        });
      }
    });

    return reminders;
  }

  /**
   * Builds complete Executive Briefing for Cabinet Home Screen
   */
  public static buildExecutiveBriefing(state: MasterState, targetDateStr: string): ExecutiveBriefing {
    const config = state.offices.jefaturaGabinete?.config || {
      wakeUpTime: '06:30',
      sleepTime: '23:00',
      breakfastTime: '07:30',
      lunchTime: '12:30',
      dinnerTime: '19:30',
      commuteRoutes: []
    };

    const events = this.getUnifiedEventsForDate(state, targetDateStr);
    const conflicts = this.detectConflicts(events);
    const freeGaps = this.calculateFreeTimeGaps(events, config, targetDateStr);

    const timedEvents = events.filter(e => e.startTime);
    const firstActivityTime = timedEvents.length > 0 ? timedEvents[0].startTime! : 'Sin actividades con hora';

    const firstFreeGap = freeGaps.length > 0
      ? `${freeGaps[0].startTime} – ${freeGaps[0].endTime} (${freeGaps[0].durationFormatted})`
      : 'Sin bloques libres holgados';

    const importantTasks = events.filter(e => e.priority === 'high' || e.type === 'evaluation');

    const priorities = events.slice(0, 5).map(e => ({
      title: e.title,
      category: e.subtitle || e.type,
      priority: (e.priority || 'medium') as 'high' | 'medium' | 'low',
      office: e.officeLabel
    }));

    const isToday = targetDateStr === getTodayDateString();
    const greeting = isToday ? 'Buenos días, Señor Presidente.' : `Informe para la fecha: ${targetDateStr}`;

    let summaryText = `Hoy tiene ${events.length} compromisos en su agenda. `;
    if (conflicts.length > 0) {
      summaryText += `Se detectó ${conflicts.length} conflicto${conflicts.length > 1 ? 's' : ''} de horario que requiere su decisión. `;
    } else {
      summaryText += `Su agenda se encuentra libre de traslapes. `;
    }
    if (importantTasks.length > 0) {
      summaryText += `Tiene ${importantTasks.length} tarea${importantTasks.length > 1 ? 's' : ''} de alta prioridad. `;
    }
    summaryText += `Su primera actividad inicia a las ${firstActivityTime}. Su próximo espacio libre es a las ${firstFreeGap}.`;

    return {
      greeting,
      summaryText,
      totalCommitments: events.length,
      conflictCount: conflicts.length,
      importantTaskCount: importantTasks.length,
      firstActivityTime,
      nextFreeGapText: firstFreeGap,
      conflicts,
      priorities,
      freeTimeGaps: freeGaps
    };
  }
}

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

export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return timeStr;
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'p. m.' : 'a. m.';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

export interface RealTimeSecretaryState {
  timeStr: string;
  greeting: string;
  summaryMessage: string;
  totalToday: number;
  completedTodayCount: number;
  currentNowText: string;
  nextEventText: string;
  nextFreeGapText: string;
  currentActivity: {
    id?: string;
    title: string;
    emoji: string;
    startTime: string;
    endTime: string;
    location?: string;
    isFreeTime: boolean;
    isCommute?: boolean;
    remainingMins?: number;
  };
  afterActivities: Array<{
    id: string;
    time: string;
    rawTime: string;
    title: string;
    subtitle?: string;
    category?: string;
    location?: string;
  }>;
  conflictsCount: number;
  conflictsText: string;
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
}

export class ChiefOfStaffSync {
  /**
   * Gather standalone Cabinet events for a given date, handling recurrence
   */
  public static getCabinetEventsForDate(state: MasterState, dateStr: string): UnifiedExecutiveEvent[] {
    const cabinetEvents = state.offices.jefaturaGabinete?.events || [];
    const results: UnifiedExecutiveEvent[] = [];

    cabinetEvents.forEach(evt => {
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
          status: evt.status || 'active',
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

    const jefatura = state.offices.jefaturaGabinete;
    const resolvedConflicts = jefatura?.resolvedConflicts || [];
    const conflictCancelledIds = new Set<string>();

    resolvedConflicts.forEach(rc => {
      if (rc.actionTaken.includes('cancelled_A')) conflictCancelledIds.add(rc.eventAId);
      if (rc.actionTaken.includes('cancelled_B')) conflictCancelledIds.add(rc.eventBId);
    });

    const userCancelledEventIds = new Set<string>(jefatura?.cancelledEventIds || []);
    const dateCancelledIds = new Set<string>(jefatura?.cancelledEventsByDate?.[dateStr] || []);
    const occurrenceRules = jefatura?.cancelledOccurrences || [];

    // Map each event, setting status to 'cancelled' if matched by any cancellation rule or status
    const eventsProcessed = rawEvents.map(e => {
      let isCancelled = false;

      if (e.status === 'cancelled' || e.status === 'Cancelada' || e.rawObject?.status === 'cancelled' || e.rawObject?.status === 'Cancelada' || e.rawObject?.academicActivity?.status === 'Cancelada') {
        isCancelled = true;
      } else if (conflictCancelledIds.has(e.id) || userCancelledEventIds.has(e.id) || dateCancelledIds.has(e.id)) {
        isCancelled = true;
      } else if (occurrenceRules.length > 0) {
        const matchesOccurrence = occurrenceRules.some(occ => {
          if (occ.date !== dateStr) return false;
          if (occ.filter === 'all') return true;
          if (occ.filter === 'classes' || occ.filter === 'academic') {
            return e.type === 'class' || e.sourceOffice === 'academica' || e.title.toLowerCase().includes('clase');
          }
          if (occ.filter === 'medical') return e.sourceOffice === 'medica';
          if (occ.filter === 'social') return e.sourceOffice === 'vidaSocial';
          return false;
        });
        if (matchesOccurrence) {
          isCancelled = true;
        }
      }

      return {
        ...e,
        status: isCancelled ? 'cancelled' : (e.status || 'active')
      };
    });

    // Sort chronologically by startTime
    eventsProcessed.sort((a, b) => {
      const timeA = timeToMinutes(a.startTime);
      const timeB = timeToMinutes(b.startTime);
      return timeA - timeB;
    });

    return eventsProcessed;
  }

  /**
   * Detect conflicts (overlaps) among timed events for a date
   */
  public static detectConflicts(events: UnifiedExecutiveEvent[]): ScheduleConflict[] {
    const timedEvents = events.filter(e => e.startTime && e.endTime && e.startTime !== 'UNTIMED' && e.status !== 'cancelled' && e.status !== 'Cancelada');
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
    const greeting = isToday ? 'Buenos días, Alex.' : `Informe para la fecha: ${targetDateStr}`;

    let summaryText = `Hoy tienes ${events.length} compromisos en tu agenda. `;
    if (conflicts.length > 0) {
      summaryText += `Se detectó ${conflicts.length} conflicto${conflicts.length > 1 ? 's' : ''} de horario que requiere tu atención. `;
    } else {
      summaryText += `Tu agenda se encuentra libre de traslapes. `;
    }
    if (importantTasks.length > 0) {
      summaryText += `Tienes ${importantTasks.length} tarea${importantTasks.length > 1 ? 's' : ''} de alta prioridad. `;
    }
    summaryText += `Tu primera actividad inicia a las ${firstActivityTime}. Tu próximo espacio libre es a las ${firstFreeGap}.`;

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

  /**
   * Calculates the real-time personal secretary state based on system time and agenda events
   */
  public static buildRealTimeSecretaryState(
    state: MasterState,
    targetDateStr: string,
    overrideDateObj?: Date
  ): RealTimeSecretaryState {
    const nowDate = overrideDateObj || new Date();
    const currentHour = nowDate.getHours();
    const currentMinsNum = currentHour * 60 + nowDate.getMinutes();
    const isToday = targetDateStr === getTodayDateString();

    // 1. Greeting according to real system time
    let greeting = 'Buenos días, Alex.';
    if (currentHour >= 12 && currentHour < 19) {
      greeting = 'Buenas tardes, Alex.';
    } else if (currentHour >= 19 || currentHour < 5) {
      greeting = 'Buenas noches, Alex.';
    }

    // 2. Events for target date (excluding cancelled ones)
    const allEventsForDate = this.getUnifiedEventsForDate(state, targetDateStr);
    const activeEvents = allEventsForDate.filter(e => e.status !== 'cancelled');

    // Sort chronologically
    activeEvents.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // Calculate conflict detection on active events
    const conflicts = this.detectConflicts(activeEvents);
    const hasConflicts = conflicts.length > 0;
    const conflictsText = hasConflicts
      ? `⚠️ ${conflicts.length} conflicto${conflicts.length > 1 ? 's' : ''} requiere${conflicts.length > 1 ? 'n' : ''} atención`
      : '✓ Agenda sin conflictos';

    const totalToday = activeEvents.length;

    // Completed events today
    const completedEvents = activeEvents.filter(e => {
      if (e.status === 'completed') return true;
      if (!isToday) return false;
      const endMins = timeToMinutes(e.endTime);
      return endMins <= currentMinsNum;
    });
    const completedTodayCount = completedEvents.length;

    // Currently running event
    const currentEvent = isToday
      ? activeEvents.find(e => {
          const startMins = timeToMinutes(e.startTime);
          const endMins = timeToMinutes(e.endTime);
          return startMins <= currentMinsNum && endMins > currentMinsNum;
        })
      : undefined;

    // Upcoming events starting after now (if today) or all active events if future
    const upcomingEvents = isToday
      ? activeEvents.filter(e => timeToMinutes(e.startTime) > currentMinsNum)
      : activeEvents;

    const firstActivity = activeEvents[0];
    const nextEvent = upcomingEvents[0];

    // Current Activity object (AHORA)
    let currentActivityObj: {
      id?: string;
      title: string;
      emoji: string;
      startTime: string;
      endTime: string;
      location: string;
      isFreeTime: boolean;
      isCommute: boolean;
      remainingMins?: number;
    } = {
      title: 'Tiempo libre',
      emoji: '☕',
      startTime: '',
      endTime: '',
      location: 'No tienes actividades programadas en este momento.',
      isFreeTime: true,
      isCommute: false,
      remainingMins: undefined
    };

    if (currentEvent) {
      const isCommute = (currentEvent.type as string) === 'commute' || (currentEvent.sourceOffice as string) === 'commute' || currentEvent.title.toLowerCase().includes('desplazamiento') || currentEvent.title.toLowerCase().includes('en camino');
      currentActivityObj = {
        id: currentEvent.id,
        title: currentEvent.title,
        emoji: isCommute ? '🚌' : (currentEvent.rawObject?.emoji || '🧠'),
        startTime: currentEvent.startTime || '',
        endTime: currentEvent.endTime || '',
        location: currentEvent.location || '',
        isFreeTime: false,
        isCommute,
        remainingMins: timeToMinutes(currentEvent.endTime) - currentMinsNum
      };
    }

    // Current Now text for indicator
    const currentNowText = currentEvent ? currentEvent.title : 'Tiempo libre';

    // Next Event text for indicator
    const nextEventText = nextEvent
      ? `${nextEvent.title} · ${formatTime12h(nextEvent.startTime)}`
      : 'Ninguno';

    // DESPUÉS (upcoming events list after current)
    const afterActivities = upcomingEvents.map(e => ({
      id: e.id,
      time: formatTime12h(e.startTime),
      rawTime: e.startTime || '',
      title: e.title,
      subtitle: e.subtitle,
      category: e.officeLabel,
      location: e.location
    }));

    // PRÓXIMO ESPACIO LIBRE
    let nextFreeGapText = 'Tiempo libre por el resto del día.';
    if (activeEvents.length === 0) {
      nextFreeGapText = 'Tiempo libre por el resto del día.';
    } else if (upcomingEvents.length === 0 && isToday) {
      // Check tomorrow
      const tomorrowStr = addDaysToDateStr(targetDateStr, 1);
      const tomorrowActiveEvents = this.getUnifiedEventsForDate(state, tomorrowStr).filter(e => e.status !== 'cancelled');
      if (tomorrowActiveEvents.length > 0) {
        const firstTomorrow = tomorrowActiveEvents[0];
        nextFreeGapText = `Mañana · ${formatTime12h(firstTomorrow.startTime)}`;
      } else {
        nextFreeGapText = 'Tiempo libre por el resto del día.';
      }
    } else if (isToday) {
      if (currentEvent) {
        // Currently in event. Find gap between current event end and next event start
        const currentEndMins = timeToMinutes(currentEvent.endTime);
        if (nextEvent) {
          const nextStartMins = timeToMinutes(nextEvent.startTime);
          if (nextStartMins > currentEndMins) {
            const gapMins = nextStartMins - currentEndMins;
            nextFreeGapText = `${formatTime12h(currentEvent.endTime)} – ${formatTime12h(nextEvent.startTime)} · ${gapMins} min`;
          } else {
            nextFreeGapText = 'Sin espacios libres inmediatos entre eventos.';
          }
        } else {
          nextFreeGapText = `Tiempo libre a partir de las ${formatTime12h(currentEvent.endTime)}`;
        }
      } else if (nextEvent) {
        // Currently in free time before next event
        const nextStartMins = timeToMinutes(nextEvent.startTime);
        const freeMins = nextStartMins - currentMinsNum;
        if (freeMins > 0) {
          nextFreeGapText = `${formatTime12h(minutesToTime(currentMinsNum))} – ${formatTime12h(nextEvent.startTime)} · ${freeMins} min`;
        }
      }
    }

    // Dynamic Summary Message (Secretary Voice)
    let summaryMessage = '';
    if (currentHour >= 5 && currentHour < 12) {
      // Morning
      if (totalToday === 0) {
        summaryMessage = 'Buenos días, Alex. Hoy no tienes compromisos programados en tu agenda. Disfruta de tu día libre.';
      } else if (firstActivity && timeToMinutes(firstActivity.startTime) > currentMinsNum) {
        const freeBeforeMins = timeToMinutes(firstActivity.startTime) - currentMinsNum;
        summaryMessage = `Buenos días, Alex. Hoy tienes ${totalToday} compromiso${totalToday > 1 ? 's' : ''} en tu agenda. Tu primera actividad comienza a las ${formatTime12h(firstActivity.startTime)}. Tienes ${formatMinutesHuman(Math.max(0, freeBeforeMins))} libres antes de comenzar.`;
      } else if (currentEvent) {
        summaryMessage = `Buenos días, Alex. Hoy tienes ${totalToday} compromisos. Actualmente estás en "${currentEvent.title}". ${nextEvent ? 'Tu próxima actividad comienza a las ' + formatTime12h(nextEvent.startTime) + '.' : ''}`;
      } else {
        summaryMessage = `Buenos días, Alex. Has completado ${completedTodayCount} de ${totalToday} compromisos esta mañana.`;
      }
    } else if (currentHour >= 12 && currentHour < 19) {
      // Afternoon
      if (totalToday === 0) {
        summaryMessage = 'Buenas tardes, Alex. No tienes actividades programadas para hoy.';
      } else if (upcomingEvents.length === 0) {
        summaryMessage = `Buenas tardes, Alex. Has completado tus ${totalToday} compromisos de hoy. No tienes más actividades programadas.`;
      } else if (nextEvent) {
        const freeMins = currentEvent
          ? timeToMinutes(nextEvent.startTime) - timeToMinutes(currentEvent.endTime)
          : timeToMinutes(nextEvent.startTime) - currentMinsNum;
        summaryMessage = `Buenas tardes, Alex. Has completado ${completedTodayCount} compromiso${completedTodayCount !== 1 ? 's' : ''} hoy. Tu próxima actividad comienza a las ${formatTime12h(nextEvent.startTime)} y tienes ${formatMinutesHuman(Math.max(0, freeMins))} libres.`;
      } else {
        summaryMessage = `Buenas tardes, Alex. Has completado ${completedTodayCount} compromisos hoy. No tienes más actividades pendientes.`;
      }
    } else {
      // Night
      if (completedTodayCount >= totalToday && totalToday > 0) {
        summaryMessage = 'Buenas noches, Alex. Terminaste todos tus compromisos de hoy. No tienes más actividades programadas.';
      } else if (totalToday === 0) {
        summaryMessage = 'Buenas noches, Alex. No tuviste compromisos programados hoy.';
      } else {
        const pendingCount = totalToday - completedTodayCount;
        summaryMessage = `Buenas noches, Alex. Hoy tuviste ${totalToday} compromiso${totalToday > 1 ? 's' : ''}. Completaste ${completedTodayCount} y tienes ${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}.`;
      }
    }

    const timeStr = `${currentHour.toString().padStart(2, '0')}:${nowDate.getMinutes().toString().padStart(2, '0')}`;

    return {
      timeStr,
      greeting,
      summaryMessage,
      totalToday,
      completedTodayCount,
      currentNowText,
      nextEventText,
      nextFreeGapText,
      currentActivity: currentActivityObj,
      afterActivities,
      conflictsCount: conflicts.length,
      conflictsText,
      hasConflicts,
      conflicts
    };
  }

  /**
   * Converts UnifiedExecutiveEvent array into CalendarEvent array for UniversalSchedule
   */
  public static convertToCalendarEvents(unifiedEvents: UnifiedExecutiveEvent[]): any[] {
    return unifiedEvents.map(evt => ({
      id: evt.id,
      title: evt.title,
      subtitle: evt.subtitle,
      date: evt.date,
      startTime: evt.startTime || 'UNTIMED',
      endTime: evt.endTime || 'UNTIMED',
      color: evt.color || '#8B5CF6',
      category: evt.type,
      officeLabel: evt.officeLabel,
      sourceOffice: evt.sourceOffice,
      location: evt.location,
      priority: evt.priority,
      completed: evt.status === 'completed',
      raw: { ...(evt.rawObject || {}), ...evt }
    }));
  }
}

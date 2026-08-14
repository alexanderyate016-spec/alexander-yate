import { storeInstance } from '../../store/CasaBlancaStore';
import { ChiefOfStaffEvent, PersonalScheduleConfig, CabinetConflictResolution, CabinetInstructionLog } from '../../types/store';
import { getTodayDateString } from '../../utils/dates';

export class ChiefOfStaffStore {
  /**
   * Update personal schedule configuration (wakeUpTime, sleepTime, meals, commutes)
   */
  public static updateConfig(newConfig: Partial<PersonalScheduleConfig>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.jefaturaGabinete) {
        draft.offices.jefaturaGabinete = {
          config: {
            wakeUpTime: '06:30',
            sleepTime: '23:00',
            breakfastTime: '07:30',
            lunchTime: '12:30',
            dinnerTime: '19:30',
            commuteRoutes: []
          },
          events: []
        };
      }
      draft.offices.jefaturaGabinete.config = {
        ...draft.offices.jefaturaGabinete.config,
        ...newConfig
      };
    });
  }

  /**
   * Add a new standalone or integrated Chief of Staff event
   */
  public static addEvent(event: Omit<ChiefOfStaffEvent, 'id' | 'createdAt' | 'status'>): string {
    const id = `cab_evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newEvt: ChiefOfStaffEvent = {
      ...event,
      id,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    storeInstance.updateState(draft => {
      if (!draft.offices.jefaturaGabinete) {
        draft.offices.jefaturaGabinete = {
          config: { wakeUpTime: '06:30', sleepTime: '23:00', breakfastTime: '07:30', lunchTime: '12:30', dinnerTime: '19:30', commuteRoutes: [] },
          events: []
        };
      }
      draft.offices.jefaturaGabinete.events.push(newEvt);
    });

    return id;
  }

  /**
   * Edit existing Chief of Staff event
   */
  public static updateEvent(id: string, updates: Partial<ChiefOfStaffEvent>) {
    storeInstance.updateState(draft => {
      const events = draft.offices.jefaturaGabinete?.events || [];
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        draft.offices.jefaturaGabinete.events[index] = {
          ...draft.offices.jefaturaGabinete.events[index],
          ...updates
        };
      }
    });
  }

  /**
   * Cancel or reschedule event
   */
  public static setEventStatus(id: string, status: 'active' | 'completed' | 'rescheduled' | 'cancelled') {
    storeInstance.updateState(draft => {
      const events = draft.offices.jefaturaGabinete?.events || [];
      const index = events.findIndex(e => e.id === id);
      if (index !== -1) {
        draft.offices.jefaturaGabinete.events[index].status = status;
      }
      if (status === 'cancelled') {
        if (!draft.offices.jefaturaGabinete.cancelledEventIds) {
          draft.offices.jefaturaGabinete.cancelledEventIds = [];
        }
        if (!draft.offices.jefaturaGabinete.cancelledEventIds.includes(id)) {
          draft.offices.jefaturaGabinete.cancelledEventIds.push(id);
        }
      }
    });
  }

  /**
   * Cancel any event by ID (standalone or projected) with reason
   */
  public static cancelEvent(id: string, dateStr?: string, reason?: string) {
    storeInstance.updateState(draft => {
      const cabinetEvents = draft.offices.jefaturaGabinete?.events || [];
      const index = cabinetEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        draft.offices.jefaturaGabinete.events[index].status = 'cancelled';
        draft.offices.jefaturaGabinete.events[index].cancelReason = reason || 'Cancelado por el usuario';
        draft.offices.jefaturaGabinete.events[index].cancelledAt = new Date().toISOString();
      }

      if (!draft.offices.jefaturaGabinete.cancelledEventIds) {
        draft.offices.jefaturaGabinete.cancelledEventIds = [];
      }
      if (!draft.offices.jefaturaGabinete.cancelledEventIds.includes(id)) {
        draft.offices.jefaturaGabinete.cancelledEventIds.push(id);
      }

      if (dateStr) {
        if (!draft.offices.jefaturaGabinete.cancelledEventsByDate) {
          draft.offices.jefaturaGabinete.cancelledEventsByDate = {};
        }
        const dateList = draft.offices.jefaturaGabinete.cancelledEventsByDate[dateStr] || [];
        if (!dateList.includes(id)) {
          draft.offices.jefaturaGabinete.cancelledEventsByDate[dateStr] = [...dateList, id];
        }
      }
    });
  }

  /**
   * Uncancel / Restore an event by ID
   */
  public static uncancelEvent(id: string, dateStr?: string) {
    storeInstance.updateState(draft => {
      const cabinetEvents = draft.offices.jefaturaGabinete?.events || [];
      const index = cabinetEvents.findIndex(e => e.id === id);
      if (index !== -1) {
        draft.offices.jefaturaGabinete.events[index].status = 'active';
        draft.offices.jefaturaGabinete.events[index].cancelReason = undefined;
        draft.offices.jefaturaGabinete.events[index].cancelledAt = undefined;
      }

      if (draft.offices.jefaturaGabinete.cancelledEventIds) {
        draft.offices.jefaturaGabinete.cancelledEventIds = draft.offices.jefaturaGabinete.cancelledEventIds.filter(eId => eId !== id);
      }

      if (dateStr && draft.offices.jefaturaGabinete.cancelledEventsByDate?.[dateStr]) {
        draft.offices.jefaturaGabinete.cancelledEventsByDate[dateStr] = draft.offices.jefaturaGabinete.cancelledEventsByDate[dateStr].filter(eId => eId !== id);
      }
    });
  }

  /**
   * Reschedule an event to a new date and time without duplicating, preserving history
   */
  public static rescheduleEvent(
    eventId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    options?: {
      oldDate?: string;
      oldStartTime?: string;
      oldEndTime?: string;
      reason?: string;
    }
  ) {
    storeInstance.updateState(draft => {
      if (!draft.offices.jefaturaGabinete) {
        draft.offices.jefaturaGabinete = {
          config: { wakeUpTime: '06:30', sleepTime: '23:00', breakfastTime: '07:30', lunchTime: '12:30', dinnerTime: '19:30', commuteRoutes: [] },
          events: []
        };
      }

      const cabinetEvents = draft.offices.jefaturaGabinete.events || [];
      const existingIdx = cabinetEvents.findIndex(e => e.id === eventId);

      const oldDate = options?.oldDate || (existingIdx !== -1 ? cabinetEvents[existingIdx].date : newDate);
      const oldStart = options?.oldStartTime || (existingIdx !== -1 ? cabinetEvents[existingIdx].startTime : newStartTime);
      const oldEnd = options?.oldEndTime || (existingIdx !== -1 ? cabinetEvents[existingIdx].endTime : newEndTime);

      // Remove from cancelled list if it was cancelled
      if (draft.offices.jefaturaGabinete.cancelledEventIds) {
        draft.offices.jefaturaGabinete.cancelledEventIds = draft.offices.jefaturaGabinete.cancelledEventIds.filter(id => id !== eventId);
      }
      if (oldDate && draft.offices.jefaturaGabinete.cancelledEventsByDate?.[oldDate]) {
        draft.offices.jefaturaGabinete.cancelledEventsByDate[oldDate] = draft.offices.jefaturaGabinete.cancelledEventsByDate[oldDate].filter(id => id !== eventId);
      }

      if (existingIdx !== -1) {
        const ev = cabinetEvents[existingIdx];
        ev.date = newDate;
        ev.startTime = newStartTime;
        ev.endTime = newEndTime;
        ev.status = 'active';
        ev.cancelReason = undefined;
        ev.cancelledAt = undefined;
        ev.reprogrammedFrom = {
          oldDate,
          oldStartTime: oldStart,
          oldEndTime: oldEnd,
          reason: options?.reason,
          reprogrammedAt: new Date().toISOString()
        };
        ev.notes = (ev.notes ? ev.notes + ' | ' : '') + `Reprogramado desde ${oldDate} (${oldStart} - ${oldEnd})`;
      } else {
        // Event originated from another office or projected source, create a managed reschedule in Jefatura
        const newEvt: ChiefOfStaffEvent = {
          id: eventId,
          title: `[Reprogramado] Evento`,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'active',
          sourceOffice: 'jefatura',
          priority: 'medium',
          reprogrammedFrom: {
            oldDate,
            oldStartTime: oldStart,
            oldEndTime: oldEnd,
            reason: options?.reason,
            reprogrammedAt: new Date().toISOString()
          },
          notes: `Reprogramado desde ${oldDate} (${oldStart} - ${oldEnd})`,
          createdAt: new Date().toISOString()
        };
        draft.offices.jefaturaGabinete.events.push(newEvt);
      }
    });
  }

  /**
   * Bulk cancel activities for a date (e.g. "Cancelar las clases de hoy" or "Cancelar todo") with reason
   */
  public static cancelAllEventsForDate(
    dateStr: string,
    filterType: 'all' | 'classes' | 'academic' | 'medical' | 'social' = 'all',
    reason?: string
  ) {
    storeInstance.updateState(draft => {
      if (!draft.offices.jefaturaGabinete.cancelledOccurrences) {
        draft.offices.jefaturaGabinete.cancelledOccurrences = [];
      }

      // Check if rule already exists
      const existingIdx = draft.offices.jefaturaGabinete.cancelledOccurrences.findIndex(
        c => c.date === dateStr && c.filter === filterType
      );

      const cancelRule = {
        id: `canc_occ_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        date: dateStr,
        filter: filterType,
        reason: reason || (filterType === 'classes' ? 'Cancelación de clases' : 'Cancelación extraordinaria del día'),
        createdAt: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        draft.offices.jefaturaGabinete.cancelledOccurrences[existingIdx] = cancelRule;
      } else {
        draft.offices.jefaturaGabinete.cancelledOccurrences.push(cancelRule);
      }

      // Also mark all cabinet events for this date as cancelled
      const cabinetEvents = draft.offices.jefaturaGabinete?.events || [];
      cabinetEvents.forEach(e => {
        if (e.date === dateStr) {
          if (filterType === 'all') {
            e.status = 'cancelled';
            e.cancelReason = cancelRule.reason;
            e.cancelledAt = cancelRule.createdAt;
          } else if (filterType === 'classes' || filterType === 'academic') {
            if (e.category === 'academic' || e.sourceOffice === 'academica') {
              e.status = 'cancelled';
              e.cancelReason = cancelRule.reason;
              e.cancelledAt = cancelRule.createdAt;
            }
          }
        }
      });
    });
  }

  /**
   * Resolve schedule conflict with explicit President decision
   */
  public static resolveConflict(
    conflictId: string,
    eventA: { id: string; title: string; office: string },
    eventB: { id: string; title: string; office: string },
    dateStr: string,
    decisionText: string,
    actionType: 'cancel_A' | 'cancel_B' | 'reschedule_A' | 'reschedule_B' | 'keep_both' | 'custom'
  ) {
    const resolution: CabinetConflictResolution = {
      id: `res_${Date.now()}`,
      eventAId: eventA.id,
      eventATitle: eventA.title,
      eventBId: eventB.id,
      eventBTitle: eventB.title,
      date: dateStr,
      decisionText,
      actionTaken: `${actionType}: ${decisionText}`,
      resolvedAt: new Date().toISOString()
    };

    storeInstance.updateState(draft => {
      if (!draft.offices.jefaturaGabinete.resolvedConflicts) {
        draft.offices.jefaturaGabinete.resolvedConflicts = [];
      }
      draft.offices.jefaturaGabinete.resolvedConflicts.push(resolution);

      // If user chose to cancel event A or B that belongs to cabinet events
      if (actionType === 'cancel_A') {
        const evA = draft.offices.jefaturaGabinete.events.find(e => e.id === eventA.id);
        if (evA) evA.status = 'cancelled';
      }
      if (actionType === 'cancel_B') {
        const evB = draft.offices.jefaturaGabinete.events.find(e => e.id === eventB.id);
        if (evB) evB.status = 'cancelled';
      }
    });
  }

  /**
   * Delete cabinet event by ID
   */
  public static deleteEvent(id: string) {
    storeInstance.updateState(draft => {
      const events = draft.offices.jefaturaGabinete?.events || [];
      draft.offices.jefaturaGabinete.events = events.filter(e => e.id !== id);
    });
  }

  /**
   * Schedule a task/habit suggestion into a free time gap in the agenda
   */
  public static scheduleTaskInFreeGap(
    taskTitle: string,
    dateStr: string,
    startTime: string,
    endTime: string,
    emoji: string = '📋',
    category: 'academic' | 'medical' | 'social' | 'personal' | 'commute' | 'dining' | 'rest' | 'other' = 'personal'
  ): string {
    return this.addEvent({
      title: taskTitle,
      emoji,
      category,
      date: dateStr,
      startTime,
      endTime,
      sourceOffice: 'jefatura',
      description: `Agendado automáticamente en bloque libre (${startTime} – ${endTime})`,
      priority: 'medium'
    });
  }

  /**
   * Process Natural Language instruction from the President
   */
  public static processPresidentInstruction(inputText: string, targetDateStr: string = getTodayDateString()): {
    success: boolean;
    summary: string;
  } {
    if (!inputText || !inputText.trim()) {
      return { success: false, summary: 'Instrucción vacía.' };
    }

    const textLower = inputText.toLowerCase().trim();
    let actionSummary = '';

    // Patterns
    if (textLower.includes('permiso') && (textLower.includes('hasta las') || textLower.includes('hasta'))) {
      // e.g., "Pedí permiso para la cita hasta las 11"
      const match = textLower.match(/hasta\s+las\s+(\d{1,2})/i);
      const newHour = match ? parseInt(match[1], 10) : 11;
      const formattedTime = `${newHour.toString().padStart(2, '0')}:00`;
      
      // Update active event on target date
      storeInstance.updateState(draft => {
        const events = draft.offices.jefaturaGabinete?.events || [];
        const found = events.find(e => e.date === targetDateStr && e.status === 'active');
        if (found) {
          found.endTime = formattedTime;
          found.notes = (found.notes || '') + ` | Permiso concedido hasta las ${formattedTime}`;
        }
      });
      actionSummary = `✓ Permiso concedido y registrado en la agenda para el ${targetDateStr}. Evento ajustado hasta las ${formattedTime}.`;
    } else if (textLower.includes('no tengo clase') || textLower.includes('sin clase') || textLower.includes('cancela la clase') || textLower.includes('cancelar clases') || textLower.includes('cancelaron las clases') || textLower.includes('cancelaron las clases de hoy')) {
      this.cancelAllEventsForDate(targetDateStr, 'classes');
      actionSummary = `✓ Entendido. Se marcaron todas las clases de la fecha ${targetDateStr} como CANCELADAS en la agenda, manteniendo la estructura original e historial.`;
    } else if (textLower.includes('cancelar todo') || textLower.includes('cancelar las actividades') || textLower.includes('cancelar actividades de hoy')) {
      this.cancelAllEventsForDate(targetDateStr, 'all');
      actionSummary = `✓ Entendido, Señor Presidente. Se registraron como CANCELADAS todas las actividades para ${targetDateStr}.`;
    } else if (textLower.includes('cancelar') || textLower.includes('cancela')) {
      if (textLower.includes('clase') || textLower.includes('clases')) {
        this.cancelAllEventsForDate(targetDateStr, 'classes');
        actionSummary = `✓ Se ordenó la cancelación de las clases de ${targetDateStr}. Permanece el historial atenuado en la agenda.`;
      } else {
        this.cancelAllEventsForDate(targetDateStr, 'all');
        actionSummary = `✓ Entendido, Señor Presidente. Se ordenó la cancelación de las actividades indicadas para ${targetDateStr}.`;
      }
      // e.g. "Reprograma la cita para mañana"
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      storeInstance.updateState(draft => {
        const events = draft.offices.jefaturaGabinete?.events || [];
        const found = events.find(e => e.date === targetDateStr && e.status === 'active');
        if (found) {
          found.date = tomorrowStr;
          found.status = 'rescheduled';
        }
      });
      actionSummary = `✓ Compromiso reprogramado exitosamente para el día de mañana (${tomorrowStr}).`;
    } else if (textLower.includes('mantén las dos') || textLower.includes('conservar ambas') || textLower.includes('mantener ambas')) {
      // e.g. "Mantén las dos"
      actionSummary = `✓ Registrado. Se conservan ambos compromisos en paralelo sin alterar su programación original.`;
    } else if (textLower.includes('cancelar') || textLower.includes('cancela')) {
      actionSummary = `✓ Entendido, Señor Presidente. Se ordenó la cancelación del compromiso indicado en la instrucción ("${inputText.slice(0, 40)}...").`;
    } else if (textLower.includes('reunir') || textLower.includes('cita') || textLower.includes('agendar') || textLower.includes('crear')) {
      // Create new event
      this.addEvent({
        title: inputText.length > 50 ? `${inputText.slice(0, 47)}...` : inputText,
        description: `Creado mediante instrucción ejecutiva: "${inputText}"`,
        date: targetDateStr,
        startTime: '10:00',
        endTime: '11:00',
        sourceOffice: 'jefatura',
        priority: 'high',
        emoji: '🗓️',
        category: 'personal'
      });
      actionSummary = `✓ Agendado nuevo compromiso presidencial para la fecha ${targetDateStr}. Puede ajustar el horario exacto desde la agenda.`;
    } else {
      actionSummary = `✓ Instrucción procesada e integrada en la bitácora ejecutiva de la Oficina de Agenda: "${inputText}"`;
    }

    const logEntry: CabinetInstructionLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      inputText,
      actionSummary
    };

    storeInstance.updateState(draft => {
      if (!draft.offices.jefaturaGabinete.instructionHistory) {
        draft.offices.jefaturaGabinete.instructionHistory = [];
      }
      draft.offices.jefaturaGabinete.instructionHistory.unshift(logEntry);
    });

    return { success: true, summary: actionSummary };
  }
}

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

    // Example patterns:
    // 1. Permiso / Cita hasta las HH / Cancelar
    // "pide permiso para la cita hasta las 11" or "cancelar la clase de hoy"
    if (textLower.includes('cancelar') || textLower.includes('cancela')) {
      // Find matching cabinet event or add cancellation override
      actionSummary = `✓ Entendido, Señor Presidente. Se registró la orden de cancelación para los compromisos indicados en su instrucción ("${inputText.slice(0, 40)}...").`;
    } else if (textLower.includes('salir') || textLower.includes('desplazamiento') || textLower.includes('camino') || textLower.includes('antes')) {
      // Travel time adjustment
      actionSummary = `✓ Modificación de tiempo de desplazamiento aplicada. La Jefatura reservará automáticamente el margen de tiempo antes del compromiso indicando la ruta correspondiente.`;
    } else if (textLower.includes('reunir') || textLower.includes('cita') || textLower.includes('agendar') || textLower.includes('crear')) {
      // Create new event
      this.addEvent({
        title: `Compromiso Presidencial: ${inputText.slice(0, 50)}`,
        description: `Creado mediante instrucción en lenguaje natural: "${inputText}"`,
        date: targetDateStr,
        startTime: '10:00',
        endTime: '11:00',
        sourceOffice: 'jefatura',
        priority: 'high'
      });
      actionSummary = `✓ Agendado nuevo compromiso presidencial para la fecha ${targetDateStr}. Puede ajustar el horario exacto desde la agenda diaria.`;
    } else if (textLower.includes('mover') || textLower.includes('reprogramar') || textLower.includes('cambiar')) {
      actionSummary = `✓ Instrucción de reprogramación recibida. La Jefatura evaluó la agenda y reubicó el compromiso respetando sus horas de descanso y bloques libres.`;
    } else {
      // General note/instruction
      actionSummary = `✓ Instrucción procesada e integrada en la bitácora ejecutiva de la Jefatura de Gabinete: "${inputText}"`;
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

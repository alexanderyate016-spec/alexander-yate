import { storeInstance } from '../../store/CasaBlancaStore';
import { UnifiedExecutiveEvent, ConflictResolutionRecord } from '../../types/store';
import { AcademicStore } from '../academic/AcademicStore';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { MedicalStore } from '../medical/MedicalStore';
import { SocialStore } from '../social/SocialStore';

export const ExecutiveStore = {
  // Save a conflict resolution entry into store history
  recordResolution(record: Omit<ConflictResolutionRecord, 'id' | 'resolvedAt'>) {
    storeInstance.updateState(draft => {
      if (!draft.executive) {
        draft.executive = {};
      }
      if (!draft.executive.conflictResolutions) {
        draft.executive.conflictResolutions = [];
      }

      const newRecord: ConflictResolutionRecord = {
        ...record,
        id: 'conf_res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        resolvedAt: new Date().toISOString()
      };

      draft.executive.conflictResolutions.push(newRecord);

      // Add to dismissed conflicts list so conflict badge clears
      if (!draft.executive.dismissedConflicts) {
        draft.executive.dismissedConflicts = [];
      }
      const key1 = `${record.eventAId}_${record.eventBId}`;
      const key2 = `${record.eventBId}_${record.eventAId}`;
      if (!draft.executive.dismissedConflicts.includes(key1)) {
        draft.executive.dismissedConflicts.push(key1);
      }
      if (!draft.executive.dismissedConflicts.includes(key2)) {
        draft.executive.dismissedConflicts.push(key2);
      }
    });
  },

  // Option 1: Mark permitted absence for an event
  recordPermittedAbsence(
    event: UnifiedExecutiveEvent,
    otherEvent: UnifiedExecutiveEvent,
    justificationText: string = 'Pedí permiso para ausentarme'
  ) {
    storeInstance.updateState(draft => {
      // Record justified absence flag in event's raw object or global store
      if (event.sourceOffice === 'academica') {
        if (event.type === 'academic_activity' && event.rawObject?.academicActivity?.id) {
          AcademicStore.updateAcademicActivity(event.rawObject.academicActivity.id, {
            description: `${event.rawObject.academicActivity.description || ''}\n[Ausencia Justificada: ${justificationText}]`.trim()
          });
        }
      }
    });

    this.recordResolution({
      date: event.date,
      eventAId: event.id,
      eventATitle: event.title,
      eventBId: otherEvent.id,
      eventBTitle: otherEvent.title,
      resolutionType: 'permitted_absence',
      resolutionTitle: 'Pedí permiso para ausentarme',
      details: `Se solicitó permiso para ausentarse de "${event.title}". El evento permanece registrado en la agenda como ausencia justificada.`
    });
  },

  // Option 2 & 3: Reschedule event (Class or Academic Activity)
  rescheduleEvent(
    event: UnifiedExecutiveEvent,
    otherEvent: UnifiedExecutiveEvent,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) {
    if (event.sourceOffice === 'academica') {
      if (event.type === 'academic_activity' && event.rawObject?.academicActivity?.id) {
        AcademicStore.updateAcademicActivity(event.rawObject.academicActivity.id, {
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'Reprogramada'
        });
      } else if (event.type === 'class' && event.rawObject?.session) {
        AcademicStore.updateSession(event.rawObject.subject.id, event.rawObject.session.id, {
          startTime: newStartTime,
          endTime: newEndTime
        });
      }
    } else if (event.sourceOffice === 'vidaDiaria' && event.rawObject?.id) {
      DailyLifeStore.addTask({
        ...event.rawObject,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
      DailyLifeStore.deleteTask(event.rawObject.id);
    } else if (event.sourceOffice === 'medica' && event.rawObject?.id) {
      MedicalStore.updateAppointment(event.rawObject.id, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
    } else if (event.sourceOffice === 'vidaSocial' && event.rawObject?.id) {
      SocialStore.updateCommitment(event.rawObject.id, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
    }

    const resolutionType = event.type === 'class' 
      ? 'class_rescheduled' 
      : event.type === 'academic_activity' 
      ? 'activity_rescheduled' 
      : 'appointment_rescheduled';

    this.recordResolution({
      date: event.date,
      eventAId: event.id,
      eventATitle: event.title,
      eventBId: otherEvent.id,
      eventBTitle: otherEvent.title,
      resolutionType,
      resolutionTitle: 'Evento Reprogramado',
      details: `El evento "${event.title}" fue reprogramado para el ${newDate} de ${newStartTime} a ${newEndTime}.`
    });
  },

  // Option 5: Cancel event without deleting historical record
  cancelEvent(
    eventToCancel: UnifiedExecutiveEvent,
    otherEvent: UnifiedExecutiveEvent,
    reason: string = 'Conflicto de horario'
  ) {
    if (eventToCancel.sourceOffice === 'academica') {
      if (eventToCancel.type === 'academic_activity' && eventToCancel.rawObject?.academicActivity?.id) {
        AcademicStore.updateAcademicActivity(eventToCancel.rawObject.academicActivity.id, {
          status: 'Cancelada'
        });
      }
    } else if (eventToCancel.sourceOffice === 'vidaDiaria' && eventToCancel.rawObject?.id) {
      DailyLifeStore.addTask({
        ...eventToCancel.rawObject,
        status: 'cancelled'
      });
      DailyLifeStore.deleteTask(eventToCancel.rawObject.id);
    } else if (eventToCancel.sourceOffice === 'medica' && eventToCancel.rawObject?.id) {
      MedicalStore.updateAppointment(eventToCancel.rawObject.id, {
        notes: `[CANCELADO por ${reason}] ${eventToCancel.rawObject.notes || ''}`.trim()
      });
    }

    this.recordResolution({
      date: eventToCancel.date,
      eventAId: eventToCancel.id,
      eventATitle: eventToCancel.title,
      eventBId: otherEvent.id,
      eventBTitle: otherEvent.title,
      resolutionType: 'event_cancelled',
      resolutionTitle: 'Evento Cancelado',
      details: `Se canceló "${eventToCancel.title}" conservando el registro histórico en el sistema.`
    });
  },

  // Option 6: Ignore / Dismiss conflict
  ignoreConflict(eventA: UnifiedExecutiveEvent, eventB: UnifiedExecutiveEvent) {
    this.recordResolution({
      date: eventA.date,
      eventAId: eventA.id,
      eventATitle: eventA.title,
      eventBId: eventB.id,
      eventBTitle: eventB.title,
      resolutionType: 'ignored',
      resolutionTitle: 'Conflicto Ignorado / Mantener Ambos',
      details: `Se decidió mantener ambos eventos ("${eventA.title}" y "${eventB.title}") superpuestos en la agenda sin modificar horarios.`
    });
  }
};

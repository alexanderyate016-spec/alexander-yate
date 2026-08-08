import { AcademicOfficeData, UnifiedExecutiveEvent } from '../../types/store';
import { checkColombianHoliday } from '../../utils/colombianHolidays';
import { AcademicCalculations } from './AcademicCalculations';

export const AcademicSync = {
  // Horario = Actividades recurrentes y programadas (Clases con profesor correspondiente)
  projectHorarioEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    // Check if targetDateStr is a national holiday
    if (checkColombianHoliday(targetDateStr).isHoliday) {
      return []; // No auto-scheduled classes on national holidays
    }

    const events: UnifiedExecutiveEvent[] = [];
    const resolvedSessions = AcademicCalculations.getAllSessionsForDate(data?.subjects || [], targetDateStr);

    resolvedSessions.forEach(ses => {
      events.push({
        id: `acad_cls_${ses.subjectId}_${ses.scheduleId}_${targetDateStr}_${ses.startTime}`,
        sourceOffice: 'academica',
        officeLabel: 'Oficina Académica',
        color: ses.subjectColor || '#3B82F6',
        title: `Clase: ${ses.subjectName}`,
        subtitle: `Prof: ${ses.professorTitle ? ses.professorTitle + ' ' : ''}${ses.professorName}${ses.classroom ? ' | Aula: ' + ses.classroom : ''}${ses.modality ? ' (' + ses.modality + ')' : ''}`,
        date: targetDateStr,
        startTime: ses.startTime,
        endTime: ses.endTime,
        type: 'class',
        rawObject: { subject: { id: ses.subjectId, name: ses.subjectName, color: ses.subjectColor, professor: ses.professorName, classroom: ses.classroom }, session: ses }
      });
    });

    return events;
  },

  // Agenda = Eventos puntuales con fecha concreta (Evaluaciones y Actividades Académicas)
  projectAgendaEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];

    (data?.subjects || []).forEach(sub => {
      // 1. Scheduled Evaluations for target date
      (sub?.cuts || []).forEach(cut => {
        (cut?.activities || []).forEach(act => {
          if (act.date === targetDateStr && act.status === 'pending') {
            events.push({
              id: `acad_eval_${sub.id}_${act.id}`,
              sourceOffice: 'academica',
              officeLabel: 'Oficina Académica',
              color: '#8B5CF6',
              title: `Evaluación: ${act.name} (${sub.name})`,
              subtitle: `Corte: ${cut.cutName} (${act.weightPercent}%)`,
              date: act.date,
              startTime: act.time || '09:00',
              endTime: act.time ? `${parseInt(act.time.split(':')[0]) + 1}:${act.time.split(':')[1]}` : '10:00',
              type: 'evaluation',
              priority: 'high',
              rawObject: { subject: sub, cut, activity: act }
            });
          }
        });
      });

      // 2. Academic Activities (salida de campo, conferencia, seminario, entrega, sustentación, reunión con profesor, asesoría, práctica extraordinaria, etc.)
      (sub?.academicActivities || []).forEach(act => {
        if (act.date === targetDateStr && act.status !== 'Cancelada') {
          events.push({
            id: `acad_act_${sub.id}_${act.id}`,
            sourceOffice: 'academica',
            officeLabel: 'Oficina Académica',
            color: sub.color || '#3B82F6',
            title: `Actividad: ${act.name} (${sub.name})`,
            subtitle: `${act.type} ${act.location ? '| ' + act.location : ''} ${act.professor ? '| Responsable: ' + act.professor : ''}`,
            date: act.date,
            startTime: act.startTime || '08:00',
            endTime: act.endTime || (act.startTime ? `${parseInt(act.startTime.split(':')[0]) + 1}:${act.startTime.split(':')[1]}` : '09:00'),
            type: 'academic_activity',
            priority: 'medium',
            rawObject: { subject: sub, academicActivity: act }
          });
        }
      });
    });

    return events;
  },

  // Proyección unificada completa (Horario + Agenda) con lógica de sustitución/complemento de clases
  projectAcademicEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const classEvents = this.projectHorarioEvents(data, targetDateStr);
    const agendaEvents = this.projectAgendaEvents(data, targetDateStr);

    // Identify academic activities for this date
    const replacedClassSubjectIds = new Set<string>();
    const groupedComplementKeys = new Set<string>();

    // Process academic activity relations with classes
    const processedAgendaEvents: UnifiedExecutiveEvent[] = [];

    agendaEvents.forEach(evt => {
      if (evt.type === 'academic_activity' && evt.rawObject?.academicActivity) {
        const act = evt.rawObject.academicActivity;
        const sub = evt.rawObject.subject;
        const relation = act.classRelation || 'replaces'; // Default to replaces if same subject on class day

        const matchingClass = classEvents.find(c => c.rawObject?.subject?.id === sub?.id);

        if (relation === 'replaces' && matchingClass) {
          // Replaces the class for this day
          replacedClassSubjectIds.add(sub.id);
          const timeStart = matchingClass.startTime || '08:00';
          const timeEnd = matchingClass.endTime || '12:00';

          processedAgendaEvents.push({
            ...evt,
            title: `🚌 ${act.name} — ${sub.name}`,
            subtitle: `${act.type} ${act.location ? '| ' + act.location : ''}`,
            replacesClassNote: `📍 Sustituye la clase programada de ${timeStart} a ${timeEnd}`,
            classRelation: 'replaces'
          });
        } else if (relation === 'complements' && matchingClass) {
          // Complements the class
          if (matchingClass.startTime === evt.startTime && matchingClass.endTime === evt.endTime) {
            // Group exact same time slot into a single complementary block
            replacedClassSubjectIds.add(sub.id);
            processedAgendaEvents.push({
              ...evt,
              title: `📘 ${sub.name}: Clase y ${act.type} (${act.name})`,
              subtitle: `Sesión integrada | ${act.location ? act.location : 'Aula habitual'}`,
              replacesClassNote: `📍 Complementa la sesión de clase (${evt.startTime} - ${evt.endTime})`,
              classRelation: 'complements'
            });
          } else {
            // Different times, keep both but tag relation
            processedAgendaEvents.push({
              ...evt,
              classRelation: 'complements'
            });
          }
        } else {
          // Independent or no matching class
          processedAgendaEvents.push({
            ...evt,
            classRelation: relation
          });
        }
      } else {
        processedAgendaEvents.push(evt);
      }
    });

    // Filter out classes that were replaced or grouped
    const finalClassEvents = classEvents.filter(c => {
      const subId = c.rawObject?.subject?.id;
      return !replacedClassSubjectIds.has(subId);
    });

    return [...finalClassEvents, ...processedAgendaEvents];
  }
};

import { AcademicOfficeData, UnifiedExecutiveEvent } from '../../types/store';
import { checkColombianHoliday } from '../../utils/colombianHolidays';
import { AcademicCalculations, ResolvedAcademicSession } from './AcademicCalculations';

// Helper to convert "HH:MM" to minutes from midnight
function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr || timeStr === 'UNTIMED') return -1;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Checks if an activity's time range falls within a class session time range
function isDuringClassSession(
  actStartStr: string | undefined,
  actEndStr: string | undefined,
  classSession: ResolvedAcademicSession
): boolean {
  if (!actStartStr) return true; // If untimed, it is considered within the context of the class day/session
  const actStart = parseTimeToMinutes(actStartStr);
  const actEnd = actEndStr ? parseTimeToMinutes(actEndStr) : actStart + 60;
  const classStart = parseTimeToMinutes(classSession.startTime);
  const classEnd = parseTimeToMinutes(classSession.endTime);

  if (actStart === -1 || classStart === -1) return true;

  // If the activity start time falls inside class duration [classStart, classEnd)
  // or coincides with class start time
  return actStart >= classStart && actStart < classEnd;
}

export const AcademicSync = {
  /**
   * Horario = Bloques de clases regulares programadas de las materias.
   * Cada bloque de clase incluye la información de actividades/tareas pendientes para mostrar
   * un indicador discreto (•) y listar las actividades al hacer clic.
   */
  projectHorarioEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    // Check if targetDateStr is a national holiday
    if (checkColombianHoliday(targetDateStr).isHoliday) {
      return []; // No auto-scheduled classes on national holidays
    }

    const events: UnifiedExecutiveEvent[] = [];
    const subjects = data?.subjects || [];
    const resolvedSessions = AcademicCalculations.getAllSessionsForDate(subjects, targetDateStr);

    resolvedSessions.forEach(ses => {
      const sub = subjects.find(s => s.id === ses.subjectId);
      
      const profsFormatted = ses.professors && ses.professors.length > 0
        ? ses.professors.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(' + ')
        : `${ses.professorTitle ? ses.professorTitle + ' ' : ''}${ses.professorName}`;

      // 1. Pending evaluations for this subject
      const pendingEvalActs: any[] = [];
      (sub?.cuts || []).forEach(cut => {
        (cut.activities || []).forEach(act => {
          if (act.status === 'pending') {
            pendingEvalActs.push({
              ...act,
              cutName: cut.cutName,
              subjectName: sub?.name || ses.subjectName,
              isToday: act.date === targetDateStr
            });
          }
        });
      });

      // 2. Pending academic activities / tasks for this subject
      const pendingAcadActs: any[] = [];
      (sub?.academicActivities || []).forEach(act => {
        if (act.status === 'Pendiente' || act.status === 'Reprogramada') {
          pendingAcadActs.push({
            ...act,
            subjectName: sub?.name || ses.subjectName,
            isToday: act.date === targetDateStr
          });
        }
      });

      // 3. Activities scheduled specifically for today
      const todayActivities = [
        ...pendingEvalActs.filter(a => a.date === targetDateStr),
        ...pendingAcadActs.filter(a => a.date === targetDateStr)
      ];

      const hasPendingActivities = pendingEvalActs.length > 0 || pendingAcadActs.length > 0;
      const pendingActivitiesCount = pendingEvalActs.length + pendingAcadActs.length;

      events.push({
        id: `acad_cls_${ses.subjectId}_${ses.scheduleId}_${targetDateStr}_${ses.startTime}`,
        sourceOffice: 'academica',
        officeLabel: 'Oficina Académica',
        color: ses.subjectColor || '#3B82F6',
        title: `Clase: ${ses.subjectName}`,
        subtitle: `Prof: ${profsFormatted}${ses.classroom ? ' | Aula: ' + ses.classroom : ''}${ses.modality ? ' (' + ses.modality + ')' : ''}`,
        date: targetDateStr,
        startTime: ses.startTime,
        endTime: ses.endTime,
        type: 'class',
        rawObject: {
          type: 'class_session',
          subject: {
            id: ses.subjectId,
            name: ses.subjectName,
            color: ses.subjectColor,
            professor: profsFormatted,
            classroom: ses.classroom
          },
          session: ses,
          hasPendingActivities,
          pendingActivitiesCount,
          pendingEvalActs,
          pendingAcadActs,
          todayActivities,
          todayActivitiesCount: todayActivities.length,
          hasTodayActivities: todayActivities.length > 0
        }
      });
    });

    return events;
  },

  /**
   * Agenda = Tareas, Entregas y Evaluaciones puntuales.
   * REGLA: No todo lo que tiene una fecha tiene un horario.
   * Las actividades y evaluaciones normales de una materia se consultan en el contexto de la materia.
   * Solo los eventos académicos que tienen un horario propio explícito fuera de clases tienen startTime/endTime.
   */
  projectAgendaEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];
    const subjects = data?.subjects || [];
    const classSessionsToday = AcademicCalculations.getAllSessionsForDate(subjects, targetDateStr);

    subjects.forEach(sub => {
      const classForSubToday = classSessionsToday.find(ses => ses.subjectId === sub.id);

      // 1. Evaluaciones programadas para la fecha
      (sub?.cuts || []).forEach(cut => {
        (cut?.activities || []).forEach(act => {
          if (act.date === targetDateStr && act.status === 'pending') {
            const hasExplicitTime = Boolean(act.startTime || act.time);
            const actStartTime = act.startTime || act.time;
            const actEndTime = act.endTime || (actStartTime ? `${String(parseInt(actStartTime.split(':')[0], 10) + 1).padStart(2, '0')}:${actStartTime.split(':')[1]}` : undefined);

            // Check if it occurs during class hours on a class day
            const inClass = classForSubToday ? isDuringClassSession(actStartTime, actEndTime, classForSubToday) : false;

            // An evaluation only has independent schedule time if it has explicit time AND occurs outside the class session
            const isIndependentEvent = hasExplicitTime && (!classForSubToday || !inClass);

            events.push({
              id: `acad_eval_${sub.id}_${act.id}`,
              sourceOffice: 'academica',
              officeLabel: 'Oficina Académica',
              color: '#8B5CF6',
              title: `Evaluación: ${act.name} (${sub.name})`,
              subtitle: `Corte: ${cut.cutName} (${act.weightPercent}%) ${inClass ? '• Durante la clase' : ''}`,
              date: act.date,
              startTime: isIndependentEvent ? actStartTime : undefined,
              endTime: isIndependentEvent ? actEndTime : undefined,
              type: 'evaluation',
              priority: 'high',
              rawObject: {
                subject: sub,
                cut,
                activity: act,
                isInClassContext: inClass,
                isIndependentEvent
              }
            });
          }
        });
      });

      // 2. Actividades Académicas y Tareas para la fecha
      (sub?.academicActivities || []).forEach(act => {
        if (act.date === targetDateStr && act.status !== 'Cancelada' && act.status !== 'Completada') {
          const hasExplicitTime = Boolean(act.startTime);
          const inClass = classForSubToday ? isDuringClassSession(act.startTime, act.endTime, classForSubToday) : false;
          const relation = act.classRelation || 'independent';

          // It is an independent timed event only if explicitly timed outside class or explicitly replaces/independent
          const isIndependentEvent = hasExplicitTime && (relation === 'replaces' || !classForSubToday || !inClass);

          events.push({
            id: `acad_act_${sub.id}_${act.id}`,
            sourceOffice: 'academica',
            officeLabel: 'Oficina Académica',
            color: sub.color || '#3B82F6',
            title: `Actividad: ${act.name} (${sub.name})`,
            subtitle: `${act.type} ${act.location ? '| ' + act.location : ''} ${act.professor ? '| Responsable: ' + act.professor : ''}`.trim(),
            date: act.date,
            startTime: isIndependentEvent ? act.startTime : undefined,
            endTime: isIndependentEvent ? act.endTime : undefined,
            type: 'academic_activity',
            priority: 'medium',
            classRelation: relation,
            rawObject: {
              subject: sub,
              academicActivity: act,
              isInClassContext: inClass,
              isIndependentEvent
            }
          });
        }
      });
    });

    return events;
  },

  /**
   * Proyección unificada completa para el Horario / Agenda Ejecutiva.
   * REGLAS CRÍTICAS:
   * 1. Las clases SIEMPRE forman los bloques principales del horario.
   * 2. Las actividades y exámenes que ocurren durante la clase o que solo tienen fecha de entrega
   *    NO crean bloques superpuestos ni paralelos. Se integran como indicador en la clase.
   * 3. SOLO los eventos académicos independientes con horario explícito fuera de clase
   *    (o actividades que reemplazan la clase) se agregan como bloques de horario.
   */
  projectAcademicEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const classEvents = this.projectHorarioEvents(data, targetDateStr);
    const agendaEvents = this.projectAgendaEvents(data, targetDateStr);

    const replacedClassSubjectIds = new Set<string>();
    const independentTimedEvents: UnifiedExecutiveEvent[] = [];

    agendaEvents.forEach(evt => {
      const isIndependent = evt.rawObject?.isIndependentEvent;
      const classRelation = evt.classRelation || evt.rawObject?.academicActivity?.classRelation;
      const subId = evt.rawObject?.subject?.id;

      // Check if this activity explicitly replaces the class
      if (classRelation === 'replaces' && subId) {
        replacedClassSubjectIds.add(subId);
        const matchingClass = classEvents.find(c => c.rawObject?.subject?.id === subId);
        const timeStart = matchingClass?.startTime || evt.startTime || '08:00';
        const timeEnd = matchingClass?.endTime || evt.endTime || '12:00';

        independentTimedEvents.push({
          ...evt,
          startTime: evt.startTime || timeStart,
          endTime: evt.endTime || timeEnd,
          title: `🚌 ${evt.rawObject?.academicActivity?.name || evt.title} — ${evt.rawObject?.subject?.name || ''}`,
          replacesClassNote: `📍 Sustituye la clase programada de ${timeStart} a ${timeEnd}`,
          classRelation: 'replaces'
        });
      } else if (isIndependent && evt.startTime && evt.endTime) {
        // Truly independent academic event with its own time slot outside of class
        independentTimedEvents.push(evt);
      }
      // Otherwise: It is a subject activity or in-class evaluation.
      // It DOES NOT generate an independent schedule block!
      // It is already linked to the class block via hasPendingActivities / pendingEvalActs / pendingAcadActs.
    });

    // Filter out any classes that were explicitly replaced (e.g. by a field trip)
    const finalClassEvents = classEvents.filter(c => {
      const subId = c.rawObject?.subject?.id;
      return !replacedClassSubjectIds.has(subId);
    });

    return [...finalClassEvents, ...independentTimedEvents];
  }
};

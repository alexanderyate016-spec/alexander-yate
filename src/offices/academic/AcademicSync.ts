import { AcademicOfficeData, UnifiedExecutiveEvent } from '../../types/store';
import { getDayOfWeekNumber } from '../../utils/dates';

export const AcademicSync = {
  projectAcademicEvents(data: AcademicOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];
    const dayNum = getDayOfWeekNumber(targetDateStr);

    // 1. Classes for target date
    (data?.subjects || []).forEach(sub => {
      (sub?.scheduleSessions || []).forEach(ses => {
        if (ses.day === dayNum) {
          events.push({
            id: `acad_cls_${sub.id}_${ses.id}_${targetDateStr}`,
            sourceOffice: 'academica',
            officeLabel: 'Oficina Académica',
            color: sub.color || '#3B82F6',
            title: `Clase: ${sub.name}`,
            subtitle: `Prof: ${sub.professor} ${ses.classroom ? '| Aula: ' + ses.classroom : ''}`,
            date: targetDateStr,
            startTime: ses.startTime,
            endTime: ses.endTime,
            type: 'class',
            rawObject: { subject: sub, session: ses }
          });
        }
      });

      // 2. Scheduled Evaluations for target date
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

      // 3. Academic Activities (non-graded) for target date
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
  }
};

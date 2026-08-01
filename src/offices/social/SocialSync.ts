import { SocialOfficeData, UnifiedExecutiveEvent } from '../../types/store';

export const SocialSync = {
  projectSocialEvents(data: SocialOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];
    const targetMMDD = targetDateStr.substring(5); // "MM-DD"

    // 1. Social commitments
    data.commitments.forEach(c => {
      if (c.date === targetDateStr) {
        events.push({
          id: `soc_com_${c.id}`,
          sourceOffice: 'vidaSocial',
          officeLabel: 'Oficina de Vida Social',
          color: '#EC4899',
          title: `Compromiso: ${c.title}`,
          subtitle: c.location ? `Lugar: ${c.location}` : undefined,
          date: c.date,
          startTime: c.startTime || '12:00',
          endTime: c.endTime || '13:00',
          type: 'commitment',
          priority: c.priority,
          rawObject: c
        });
      }
    });

    // 2. Birthdays on target date
    data.people.forEach(p => {
      if (p.birthday && p.birthday.endsWith(targetMMDD)) {
        events.push({
          id: `soc_bday_${p.id}_${targetDateStr}`,
          sourceOffice: 'vidaSocial',
          officeLabel: 'Oficina de Vida Social',
          color: '#F43F5E',
          title: `🎂 Cumpleaños: ${p.name}`,
          subtitle: `Categoría: ${p.category}`,
          date: targetDateStr,
          startTime: '08:00',
          endTime: '09:00',
          type: 'birthday',
          priority: 'high',
          rawObject: p
        });
      }
    });

    return events;
  }
};

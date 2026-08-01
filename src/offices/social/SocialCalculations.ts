import { SocialPerson, SocialInteraction, SocialCommitment, SocialOfficeData } from '../../types/store';
import { getDaysDifference, COLOMBIAN_NATIONAL_HOLIDAYS, ColombianHoliday } from '../../utils/dates';

export interface UpcomingEventItem {
  id: string;
  type: 'birthday' | 'anniversary' | 'custom_date' | 'commitment';
  title: string;
  personId?: string;
  personName?: string;
  dateStr: string; // YYYY-MM-DD of next occurrence
  daysLeft: number;
  isToday: boolean;
  description?: string;
}

export const SocialCalculations = {
  getLastInteraction(personId: string, interactions: SocialInteraction[]): { date: string; daysAgo: number } | null {
    const personInteractions = interactions.filter(i => i.personId === personId);
    if (personInteractions.length === 0) return null;

    personInteractions.sort((a, b) => b.date.localeCompare(a.date));
    const last = personInteractions[0];
    const today = new Date().toISOString().split('T')[0];
    const daysAgo = getDaysDifference(last.date, today);

    return { date: last.date, daysAgo };
  },

  getContactFrequency(personId: string, interactions: SocialInteraction[]): string {
    const personInteractions = interactions.filter(i => i.personId === personId);
    if (personInteractions.length < 2) {
      if (personInteractions.length === 1) return '1 interacción registrada';
      return 'Sin interacciones registradas';
    }
    personInteractions.sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = new Date(personInteractions[0].date);
    const lastDate = new Date(personInteractions[personInteractions.length - 1].date);
    const diffDays = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDays = Math.round(diffDays / (personInteractions.length - 1));
    if (avgDays <= 3) return 'Contacto muy frecuente (~cada 1-3 días)';
    if (avgDays <= 7) return 'Contacto semanal (~cada semana)';
    if (avgDays <= 15) return 'Contacto quincenal (~cada 15 días)';
    if (avgDays <= 30) return 'Contacto mensual (~cada mes)';
    return `Contacto ocasional (~cada ${avgDays} días)`;
  },

  getDaysUntilNextOccurrence(dateStr: string, todayStr: string): { daysLeft: number; isToday: boolean; nextDateStr: string } {
    if (!dateStr) return { daysLeft: 999, isToday: false, nextDateStr: '' };
    const today = new Date(todayStr + 'T00:00:00');
    const currentYear = today.getFullYear();

    // Extract MM-DD
    let mmdd = dateStr;
    if (dateStr.length >= 10 && dateStr.includes('-')) {
      mmdd = dateStr.substring(5); // "MM-DD"
    }

    const [m, d] = mmdd.split('-').map(Number);
    if (!m || !d) return { daysLeft: 999, isToday: false, nextDateStr: '' };

    let candidate = new Date(currentYear, m - 1, d);

    // If candidate is before today in the current year, check next year
    if (candidate < today && (candidate.getMonth() !== today.getMonth() || candidate.getDate() !== today.getDate())) {
      candidate = new Date(currentYear + 1, m - 1, d);
    }

    const diffTime = candidate.getTime() - today.getTime();
    const daysLeft = Math.round(diffTime / (1000 * 3600 * 24));
    const isToday = daysLeft === 0;

    const yyyy = candidate.getFullYear();
    const mm = String(candidate.getMonth() + 1).padStart(2, '0');
    const dd = String(candidate.getDate()).padStart(2, '0');
    const nextDateStr = `${yyyy}-${mm}-${dd}`;

    return { daysLeft, isToday, nextDateStr };
  },

  getUpcomingDatesList(data: SocialOfficeData, todayStr: string): UpcomingEventItem[] {
    const list: UpcomingEventItem[] = [];

    // 1. Birthdays & Anniversaries & Custom dates from people
    (data.people || []).forEach(p => {
      if (p.birthday) {
        const { daysLeft, isToday, nextDateStr } = this.getDaysUntilNextOccurrence(p.birthday, todayStr);
        list.push({
          id: `bday_${p.id}`,
          type: 'birthday',
          title: `Cumpleaños de ${p.name}`,
          personId: p.id,
          personName: p.name,
          dateStr: nextDateStr,
          daysLeft,
          isToday,
          description: `Categoría: ${p.category}`
        });
      }

      if (p.anniversaryDate) {
        const { daysLeft, isToday, nextDateStr } = this.getDaysUntilNextOccurrence(p.anniversaryDate, todayStr);
        list.push({
          id: `anni_${p.id}`,
          type: 'anniversary',
          title: `Aniversario con ${p.name}`,
          personId: p.id,
          personName: p.name,
          dateStr: nextDateStr,
          daysLeft,
          isToday
        });
      }

      if (p.customDates) {
        p.customDates.forEach(cd => {
          const { daysLeft, isToday, nextDateStr } = this.getDaysUntilNextOccurrence(cd.date, todayStr);
          list.push({
            id: `cdate_${cd.id}`,
            type: 'custom_date',
            title: `${cd.title} (${p.name})`,
            personId: p.id,
            personName: p.name,
            dateStr: nextDateStr,
            daysLeft,
            isToday
          });
        });
      }
    });

    // 2. Commitments
    (data.commitments || []).forEach(c => {
      if (c.date >= todayStr) {
        const daysLeft = getDaysDifference(todayStr, c.date);
        const person = c.peopleIds.length > 0 ? (data.people || []).find(p => p.id === c.peopleIds[0]) : undefined;
        list.push({
          id: `com_${c.id}`,
          type: 'commitment',
          title: c.title,
          personId: person?.id,
          personName: person?.name,
          dateStr: c.date,
          daysLeft,
          isToday: daysLeft === 0,
          description: c.location ? `Lugar: ${c.location}` : undefined
        });
      }
    });

    list.sort((a, b) => a.daysLeft - b.daysLeft);
    return list;
  },

  getSmartAlerts(data: SocialOfficeData, todayStr: string): string[] {
    const alerts: string[] = [];
    const todayMMDD = todayStr.substring(5);

    // 1. Birthdays today & tomorrow
    (data.people || []).forEach(p => {
      if (p.birthday) {
        const { daysLeft, isToday } = this.getDaysUntilNextOccurrence(p.birthday, todayStr);
        if (isToday) {
          alerts.push(`🎂 Hoy es el cumpleaños de ${p.name}. ¡Recuerda felicitarle!`);
        } else if (daysLeft === 1) {
          alerts.push(`🎂 Mañana es el cumpleaños de ${p.name}.`);
        } else if (daysLeft <= 7 && p.isFavorite) {
          alerts.push(`⭐ En ${daysLeft} días es el cumpleaños de tu contacto prioritario ${p.name}.`);
        }
      }
    });

    // 2. Uncontacted alerts
    const uncontacted = this.getUncontactedPeopleAlerts(data, 30);
    uncontacted.slice(0, 3).forEach(item => {
      alerts.push(`💬 Hace ${item.daysAgo} días que no interactúas con ${item.person.name}.`);
    });

    // 3. Today's commitments
    (data.commitments || []).forEach(c => {
      if (c.date === todayStr) {
        const peopleNames = (c.peopleIds || [])
          .map(pid => data.people.find(p => p.id === pid)?.name)
          .filter(Boolean)
          .join(', ');
        alerts.push(`📅 Hoy tienes el compromiso "${c.title}"${peopleNames ? ` con ${peopleNames}` : ''} a las ${c.startTime || '12:00'}.`);
      }
    });

    // 4. Important dates this week
    const upcoming = this.getUpcomingDatesList(data, todayStr);
    const thisWeekCount = upcoming.filter(u => u.daysLeft >= 0 && u.daysLeft <= 7).length;
    if (thisWeekCount > 0) {
      alerts.push(`🗓️ Esta semana hay ${thisWeekCount} fecha(s) e interacción(es) importante(s).`);
    }

    return alerts;
  },

  getPersonTimeline(personId: string, data: SocialOfficeData) {
    const events: Array<{
      id: string;
      date: string;
      type: 'interaction' | 'commitment' | 'custom_date' | 'birthday' | 'note';
      title: string;
      description?: string;
      badge?: string;
    }> = [];

    const person = (data.people || []).find(p => p.id === personId);
    if (!person) return [];

    // Interactions
    (data.interactions || []).filter(i => i.personId === personId).forEach(i => {
      events.push({
        id: `int_${i.id}`,
        date: i.date,
        type: 'interaction',
        title: `Interacción: ${i.type}`,
        description: i.description,
        badge: i.type
      });
    });

    // Commitments
    (data.commitments || []).filter(c => c.peopleIds.includes(personId)).forEach(c => {
      events.push({
        id: `com_${c.id}`,
        date: c.date,
        type: 'commitment',
        title: `Compromiso: ${c.title}`,
        description: c.description || (c.location ? `Lugar: ${c.location}` : undefined),
        badge: c.startTime
      });
    });

    // Birthday
    if (person.birthday) {
      events.push({
        id: `bday_${person.id}`,
        date: person.birthday,
        type: 'birthday',
        title: `🎂 Cumpleaños de ${person.name}`,
        badge: 'Fecha especial'
      });
    }

    // Custom dates
    if (person.customDates) {
      person.customDates.forEach(cd => {
        events.push({
          id: `cd_${cd.id}`,
          date: cd.date,
          type: 'custom_date',
          title: `Fecha Especial: ${cd.title}`,
          badge: 'Fecha'
        });
      });
    }

    events.sort((a, b) => b.date.localeCompare(a.date));
    return events;
  },

  getUncontactedPeopleAlerts(data: SocialOfficeData, thresholdDays: number = 30): Array<{ person: SocialPerson; daysAgo: number }> {
    const alerts: Array<{ person: SocialPerson; daysAgo: number }> = [];

    (data.people || []).forEach(p => {
      const last = this.getLastInteraction(p.id, data.interactions || []);
      if (last && last.daysAgo >= thresholdDays) {
        alerts.push({ person: p, daysAgo: last.daysAgo });
      }
    });

    alerts.sort((a, b) => b.daysAgo - a.daysAgo);
    return alerts;
  },

  getTodayBirthdays(people: SocialPerson[], todayMMDD: string): SocialPerson[] {
    return (people || []).filter(p => p.birthday && p.birthday.endsWith(todayMMDD));
  },

  getTodayColombianHoliday(todayMMDD: string): ColombianHoliday | undefined {
    return COLOMBIAN_NATIONAL_HOLIDAYS.find(h => h.monthDay === todayMMDD);
  }
};


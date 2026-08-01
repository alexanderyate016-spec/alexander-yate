import { SocialPerson, SocialInteraction, SocialOfficeData } from '../../types/store';
import { getDaysDifference, COLOMBIAN_NATIONAL_HOLIDAYS, ColombianHoliday } from '../../utils/dates';

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

  getUncontactedPeopleAlerts(data: SocialOfficeData, thresholdDays: number = 30): Array<{ person: SocialPerson; daysAgo: number }> {
    const alerts: Array<{ person: SocialPerson; daysAgo: number }> = [];

    data.people.forEach(p => {
      const last = this.getLastInteraction(p.id, data.interactions);
      if (last && last.daysAgo >= thresholdDays) {
        alerts.push({ person: p, daysAgo: last.daysAgo });
      }
    });

    alerts.sort((a, b) => b.daysAgo - a.daysAgo);
    return alerts;
  },

  getTodayBirthdays(people: SocialPerson[], todayMMDD: string): SocialPerson[] {
    return people.filter(p => p.birthday && p.birthday.endsWith(todayMMDD));
  },

  getTodayColombianHoliday(todayMMDD: string): ColombianHoliday | undefined {
    return COLOMBIAN_NATIONAL_HOLIDAYS.find(h => h.monthDay === todayMMDD);
  }
};

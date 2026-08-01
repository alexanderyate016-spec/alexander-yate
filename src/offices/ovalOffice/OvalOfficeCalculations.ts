import { MasterState, UnifiedExecutiveEvent } from '../../types/store';
import { AcademicSync } from '../academic/AcademicSync';
import { DailyLifeSync } from '../dailyLife/DailyLifeSync';
import { FinancialSync } from '../financial/FinancialSync';
import { SocialSync } from '../social/SocialSync';
import { MedicalSync } from '../medical/MedicalSync';

export const OvalOfficeCalculations = {
  getUnifiedEventsForDate(state: MasterState, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [
      ...AcademicSync.projectAcademicEvents(state.offices.academica, targetDateStr),
      ...DailyLifeSync.projectDailyLifeEvents(state.offices.vidaDiaria, targetDateStr),
      ...FinancialSync.projectFinancialEvents(state.offices.financiera, targetDateStr),
      ...SocialSync.projectSocialEvents(state.offices.vidaSocial, targetDateStr),
      ...MedicalSync.projectMedicalEvents(state.offices.medica, targetDateStr)
    ];

    // Sort chronologically by startTime
    events.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    return events;
  },

  detectScheduleConflicts(events: UnifiedExecutiveEvent[]): Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }> {
    const conflicts: Array<{ eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent }> = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i];
        const b = events[j];

        if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) continue;

        // Check time overlap: (StartA < EndB) and (EndA > StartB)
        if (a.startTime < b.endTime && a.endTime > b.startTime) {
          conflicts.push({ eventA: a, eventB: b });
        }
      }
    }

    return conflicts;
  }
};

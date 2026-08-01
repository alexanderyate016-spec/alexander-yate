import { storeInstance } from '../../store/CasaBlancaStore';
import { AcademicOfficeData, AcademicSemester, AcademicSubject, AcademicCut, AcademicEvaluationActivity, AcademicSession } from '../../types/store';

export const AcademicStore = {
  getData(): AcademicOfficeData {
    return storeInstance.getState().offices.academica;
  },

  // SEMESTERS
  addSemester(semester: Omit<AcademicSemester, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'sem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (semester.isActive) {
        draft.offices.academica.semesters.forEach(s => s.isActive = false);
      }
      draft.offices.academica.semesters.push({ ...semester, id });
    });
  },

  updateSemester(semesterId: string, updates: Partial<AcademicSemester>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.academica.semesters.findIndex(s => s.id === semesterId);
      if (idx !== -1) {
        if (updates.isActive) {
          draft.offices.academica.semesters.forEach(s => s.isActive = false);
        }
        draft.offices.academica.semesters[idx] = { ...draft.offices.academica.semesters[idx], ...updates };
      }
    });
  },

  setActiveSemester(semesterId: string) {
    storeInstance.updateState(draft => {
      draft.offices.academica.semesters.forEach(s => {
        s.isActive = (s.id === semesterId);
      });
    });
  },

  deleteSemester(semesterId: string) {
    storeInstance.updateState(draft => {
      draft.offices.academica.semesters = draft.offices.academica.semesters.filter(s => s.id !== semesterId);
      // Remove subjects belonging to deleted semester
      draft.offices.academica.subjects = draft.offices.academica.subjects.filter(s => s.semesterId !== semesterId);
    });
  },

  // SUBJECTS
  addSubject(subject: Omit<AcademicSubject, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.academica.subjects.push({ ...subject, id });
    });
  },

  updateSubject(id: string, updates: Partial<AcademicSubject>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.academica.subjects.findIndex(s => s.id === id);
      if (idx !== -1) {
        draft.offices.academica.subjects[idx] = { ...draft.offices.academica.subjects[idx], ...updates };
      }
    });
  },

  deleteSubject(subjectId: string) {
    storeInstance.updateState(draft => {
      draft.offices.academica.subjects = draft.offices.academica.subjects.filter(s => s.id !== subjectId);
    });
  },

  // SESSIONS (SCHEDULE)
  addSession(subjectId: string, session: Omit<AcademicSession, 'id'>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub) {
        const id = 'ses_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        if (!sub.scheduleSessions) sub.scheduleSessions = [];
        sub.scheduleSessions.push({ ...session, id });
      }
    });
  },

  updateSession(subjectId: string, sessionId: string, updates: Partial<AcademicSession>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.scheduleSessions) {
        const idx = sub.scheduleSessions.findIndex(s => s.id === sessionId);
        if (idx !== -1) {
          sub.scheduleSessions[idx] = { ...sub.scheduleSessions[idx], ...updates };
        }
      }
    });
  },

  deleteSession(subjectId: string, sessionId: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.scheduleSessions) {
        sub.scheduleSessions = sub.scheduleSessions.filter(s => s.id !== sessionId);
      }
    });
  },

  // EVALUATIONS & CUTS
  addCut(subjectId: string, cutName: string, cutWeightPercent: number) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub) {
        const id = 'cut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        if (!sub.cuts) sub.cuts = [];
        sub.cuts.push({ id, cutName, cutWeightPercent, activities: [] });
      }
    });
  },

  updateCut(subjectId: string, cutId: string, updates: Partial<AcademicCut>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        const idx = sub.cuts.findIndex(c => c.id === cutId);
        if (idx !== -1) {
          sub.cuts[idx] = { ...sub.cuts[idx], ...updates };
        }
      }
    });
  },

  deleteCut(subjectId: string, cutId: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        sub.cuts = sub.cuts.filter(c => c.id !== cutId);
      }
    });
  },

  addActivity(subjectId: string, cutId: string, activity: Omit<AcademicEvaluationActivity, 'id'>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        const cut = sub.cuts.find(c => c.id === cutId);
        if (cut) {
          const id = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          cut.activities.push({ ...activity, id });
        }
      }
    });
  },

  updateActivity(subjectId: string, cutId: string, activityId: string, updates: Partial<AcademicEvaluationActivity>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        const cut = sub.cuts.find(c => c.id === cutId);
        if (cut) {
          const actIdx = cut.activities.findIndex(a => a.id === activityId);
          if (actIdx !== -1) {
            const current = cut.activities[actIdx];
            const updated = { ...current, ...updates };
            if ('grade' in updates && updates.grade === undefined) {
              delete updated.grade;
            }
            cut.activities[actIdx] = updated;
          }
        }
      }
    });
  },

  deleteActivity(subjectId: string, cutId: string, activityId: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        const cut = sub.cuts.find(c => c.id === cutId);
        if (cut) {
          cut.activities = cut.activities.filter(a => a.id !== activityId);
        }
      }
    });
  }
};

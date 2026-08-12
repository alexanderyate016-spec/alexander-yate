import { storeInstance } from '../../store/CasaBlancaStore';
import { AcademicOfficeData, AcademicSemester, AcademicSubject, AcademicCut, AcademicEvaluationActivity, AcademicSession, AcademicActivity, SubjectProfessor, SubjectScheduleRule } from '../../types/store';

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
      draft.offices.academica.subjects.push({
        professors: [],
        schedules: [],
        scheduleSessions: [],
        cuts: [],
        ...subject,
        id
      });
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

  // CANCEL SPECIFIC CLASS SESSION OCCURRENCE DATE
  cancelClassOccurrence(subjectId: string, scheduleId: string | undefined, dateStr: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub) {
        if (!sub.cancelledClassDates) {
          sub.cancelledClassDates = [];
        }
        if (!sub.cancelledClassDates.includes(dateStr)) {
          sub.cancelledClassDates.push(dateStr);
        }
        if (scheduleId && sub.schedules) {
          const rule = sub.schedules.find(r => r.id === scheduleId);
          if (rule) {
            if (!rule.cancelledDates) {
              rule.cancelledDates = [];
            }
            if (!rule.cancelledDates.includes(dateStr)) {
              rule.cancelledDates.push(dateStr);
            }
          }
        }
      }
    });
  },

  // PROFESSORS FOR A SUBJECT
  addProfessor(subjectId: string, professor: Omit<SubjectProfessor, 'id'>): SubjectProfessor | undefined {
    let createdProf: SubjectProfessor | undefined;
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub) {
        if (!sub.professors) sub.professors = [];
        const id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        createdProf = { ...professor, id };
        sub.professors.push(createdProf);
        // Update professor summary string
        sub.professor = sub.professors.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(', ');
      }
    });
    return createdProf;
  },

  updateProfessor(subjectId: string, professorId: string, updates: Partial<SubjectProfessor>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.professors) {
        const idx = sub.professors.findIndex(p => p.id === professorId);
        if (idx !== -1) {
          sub.professors[idx] = { ...sub.professors[idx], ...updates };
          sub.professor = sub.professors.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(', ');
        }
      }
    });
  },

  deleteProfessor(subjectId: string, professorId: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.professors) {
        sub.professors = sub.professors.filter(p => p.id !== professorId);
        sub.professor = sub.professors.length > 0
          ? sub.professors.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(', ')
          : 'Por asignar';
      }
    });
  },

  // SCHEDULE RULES FOR A SUBJECT
  addScheduleRule(subjectId: string, rule: Omit<SubjectScheduleRule, 'id' | 'subjectId'>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub) {
        if (!sub.schedules) sub.schedules = [];
        const id = 'sched_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const newRule: SubjectScheduleRule = {
          ...rule,
          id,
          subjectId,
          createdAt: new Date().toISOString()
        };
        sub.schedules.push(newRule);
      }
    });
  },

  updateScheduleRule(subjectId: string, ruleId: string, updates: Partial<SubjectScheduleRule>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.schedules) {
        const idx = sub.schedules.findIndex(r => r.id === ruleId);
        if (idx !== -1) {
          sub.schedules[idx] = { ...sub.schedules[idx], ...updates };
        }
      }
    });
  },

  deleteScheduleRule(subjectId: string, ruleId: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.schedules) {
        sub.schedules = sub.schedules.filter(r => r.id !== ruleId);
      }
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
      if (sub) {
        if (!sub.cuts) sub.cuts = [];
        let cut = sub.cuts.find(c => c.id === cutId);
        if (!cut) {
          cut = sub.cuts.find(c => c.id === 'cut_pending' || c.cutName.toLowerCase().includes('pendiente'));
        }
        if (!cut) {
          if (sub.cuts.length > 0) {
            cut = sub.cuts[0];
          } else {
            cut = { id: 'cut_pending_' + Date.now(), cutName: 'Corte Pendiente / Sin Asignar', cutWeightPercent: 0, activities: [] };
            sub.cuts.push(cut);
          }
        }
        const id = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        cut.activities.push({ ...activity, id, cutId: cut.id });
      }
    });
  },

  updateActivity(subjectId: string, cutId: string, activityId: string, updates: Partial<AcademicEvaluationActivity>) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        // Find current activity across cuts
        let currentCut = sub.cuts.find(c => c.id === cutId);
        let actIdx = currentCut ? currentCut.activities.findIndex(a => a.id === activityId) : -1;

        if (actIdx === -1) {
          // Search all cuts for activity
          for (const c of sub.cuts) {
            const idx = c.activities.findIndex(a => a.id === activityId);
            if (idx !== -1) {
              currentCut = c;
              actIdx = idx;
              break;
            }
          }
        }

        if (currentCut && actIdx !== -1) {
          const current = currentCut.activities[actIdx];
          const updated = { ...current, ...updates };

          if ('grade' in updates && updates.grade === undefined) {
            delete updated.grade;
          }

          // Check if moving to a different cut
          if (updates.cutId && updates.cutId !== currentCut.id) {
            const newCut = sub.cuts.find(c => c.id === updates.cutId);
            if (newCut) {
              currentCut.activities.splice(actIdx, 1);
              updated.cutId = newCut.id;
              newCut.activities.push(updated);
              return;
            }
          }

          currentCut.activities[actIdx] = updated;
        }
      }
    });
  },

  deleteActivity(subjectId: string, cutId: string, activityId: string) {
    storeInstance.updateState(draft => {
      const sub = draft.offices.academica.subjects.find(s => s.id === subjectId);
      if (sub && sub.cuts) {
        sub.cuts.forEach(cut => {
          cut.activities = cut.activities.filter(a => a.id !== activityId);
        });
      }
    });
  },

  // ACADEMIC ACTIVITIES (NON-GRADED EVENTS AND TASKS)
  addAcademicActivity(activity: Omit<AcademicActivity, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'acad_act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newAct: AcademicActivity = { ...activity, id };
      
      const sub = draft.offices.academica.subjects.find(s => s.id === activity.subjectId);
      if (sub) {
        if (!sub.academicActivities) sub.academicActivities = [];
        sub.academicActivities.push(newAct);
      }
      
      if (!draft.offices.academica.academicActivities) {
        draft.offices.academica.academicActivities = [];
      }
      draft.offices.academica.academicActivities.push(newAct);
    });
  },

  updateAcademicActivity(activityId: string, updates: Partial<AcademicActivity>) {
    storeInstance.updateState(draft => {
      // If subjectId changes, move to new subject
      let currentSub = draft.offices.academica.subjects.find(s => s.academicActivities?.some(a => a.id === activityId));
      let actObj = currentSub?.academicActivities?.find(a => a.id === activityId);

      if (actObj) {
        const updatedAct = { ...actObj, ...updates };
        
        if (updates.subjectId && currentSub && updates.subjectId !== currentSub.id) {
          // Remove from current subject
          currentSub.academicActivities = currentSub.academicActivities?.filter(a => a.id !== activityId);
          // Add to new subject
          const newSub = draft.offices.academica.subjects.find(s => s.id === updates.subjectId);
          if (newSub) {
            if (!newSub.academicActivities) newSub.academicActivities = [];
            newSub.academicActivities.push(updatedAct);
          }
        } else if (currentSub?.academicActivities) {
          const idx = currentSub.academicActivities.findIndex(a => a.id === activityId);
          if (idx !== -1) {
            currentSub.academicActivities[idx] = updatedAct;
          }
        }

        // Sync global array if present
        if (draft.offices.academica.academicActivities) {
          const gIdx = draft.offices.academica.academicActivities.findIndex(a => a.id === activityId);
          if (gIdx !== -1) {
            draft.offices.academica.academicActivities[gIdx] = updatedAct;
          }
        }
      }
    });
  },

  deleteAcademicActivity(activityId: string) {
    storeInstance.updateState(draft => {
      if (draft.offices.academica.academicActivities) {
        draft.offices.academica.academicActivities = draft.offices.academica.academicActivities.filter(a => a.id !== activityId);
      }
      draft.offices.academica.subjects.forEach(sub => {
        if (sub.academicActivities) {
          sub.academicActivities = sub.academicActivities.filter(a => a.id !== activityId);
        }
      });
    });
  },

  // STUDY TIME RECORDING (INTEGRATION WITH VIDA DIARIA)
  recordStudyTime(record: { subjectId: string; subjectTopic?: string; date: string; durationMinutes: number; timePlanId?: string; notes?: string }) {
    storeInstance.updateState(draft => {
      if (!draft.offices.academica.studyLogs) {
        draft.offices.academica.studyLogs = [];
      }
      // Remove existing log for this timePlanId if present to avoid duplication
      if (record.timePlanId) {
        draft.offices.academica.studyLogs = draft.offices.academica.studyLogs.filter(l => l.timePlanId !== record.timePlanId);
      }
      const id = 'stlog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.academica.studyLogs.push({
        ...record,
        id,
        createdAt: new Date().toISOString()
      });

      // Update subject total study minutes
      const sub = draft.offices.academica.subjects.find(s => s.id === record.subjectId);
      if (sub) {
        const total = draft.offices.academica.studyLogs
          .filter(l => l.subjectId === record.subjectId)
          .reduce((sum, l) => sum + l.durationMinutes, 0);
        sub.totalStudyMinutes = total;
      }
    });
  },

  removeStudyTime(timePlanId: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.academica.studyLogs) return;
      const log = draft.offices.academica.studyLogs.find(l => l.timePlanId === timePlanId);
      if (log) {
        const subId = log.subjectId;
        draft.offices.academica.studyLogs = draft.offices.academica.studyLogs.filter(l => l.timePlanId !== timePlanId);
        const sub = draft.offices.academica.subjects.find(s => s.id === subId);
        if (sub) {
          const total = draft.offices.academica.studyLogs
            .filter(l => l.subjectId === subId)
            .reduce((sum, l) => sum + l.durationMinutes, 0);
          sub.totalStudyMinutes = total;
        }
      }
    });
  }
};

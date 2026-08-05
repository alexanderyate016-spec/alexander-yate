import { storeInstance } from '../../store/CasaBlancaStore';
import { PersonalDevOfficeData, JournalEntry, LifeLesson, MonthlyReview } from '../../types/store';
import { getTodayDateString } from '../../utils/dates';

export const PersonalDevStore = {
  getData(): PersonalDevOfficeData {
    const data = storeInstance.getState().offices.desarrolloPersonal;
    return {
      journalEntries: data.journalEntries || [],
      lifeLessons: data.lifeLessons || [],
      monthlyReviews: data.monthlyReviews || {}
    };
  },

  // Obtener la entrada para una fecha YYYY-MM-DD específica
  getEntryForDate(dateStr: string): JournalEntry | undefined {
    const entries = this.getData().journalEntries;
    return entries.find(e => e.date === dateStr);
  },

  // Guardar o actualizar la entrada diaria de un día específico
  // REGLA: Cada día tiene una ÚNICA entrada.
  saveJournalEntry(entryData: Partial<JournalEntry> & { date: string }) {
    storeInstance.updateState(draft => {
      const entries = draft.offices.desarrolloPersonal.journalEntries || [];
      const existingIndex = entries.findIndex(e => e.date === entryData.date);

      if (existingIndex >= 0) {
        entries[existingIndex] = {
          ...entries[existingIndex],
          ...entryData
        };
      } else {
        const newEntry: JournalEntry = {
          id: 'jrn_' + entryData.date + '_' + Math.random().toString(36).substring(2, 6),
          date: entryData.date,
          wordOfTheDay: entryData.wordOfTheDay || '',
          mood: entryData.mood || 'reflexivo',
          bestThingToday: entryData.bestThingToday || '',
          learnedToday: entryData.learnedToday || '',
          improveTomorrow: entryData.improveTomorrow || '',
          importantDecision: entryData.importantDecision || '',
          gratefulFor: entryData.gratefulFor || '',
          freeReflection: entryData.freeReflection || '',
          philosophicalAnswer: entryData.philosophicalAnswer || ''
        };
        entries.unshift(newEntry);
      }
      draft.offices.desarrolloPersonal.journalEntries = entries;
    });
  },

  // Eliminar entrada del diario por ID
  deleteJournalEntry(id: string) {
    storeInstance.updateState(draft => {
      const entries = draft.offices.desarrolloPersonal.journalEntries || [];
      draft.offices.desarrolloPersonal.journalEntries = entries.filter(j => j.id !== id);
    });
  },

  // --- LECCIONES DE VIDA ---
  addLifeLesson(lesson: Omit<LifeLesson, 'id'>) {
    storeInstance.updateState(draft => {
      const lessons = draft.offices.desarrolloPersonal.lifeLessons || [];
      const newLesson: LifeLesson = {
        ...lesson,
        id: 'll_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
      };
      lessons.unshift(newLesson);
      draft.offices.desarrolloPersonal.lifeLessons = lessons;
    });
  },

  updateLifeLesson(id: string, updated: Partial<LifeLesson>) {
    storeInstance.updateState(draft => {
      const lessons = draft.offices.desarrolloPersonal.lifeLessons || [];
      const idx = lessons.findIndex(l => l.id === id);
      if (idx >= 0) {
        lessons[idx] = { ...lessons[idx], ...updated };
      }
      draft.offices.desarrolloPersonal.lifeLessons = lessons;
    });
  },

  deleteLifeLesson(id: string) {
    storeInstance.updateState(draft => {
      const lessons = draft.offices.desarrolloPersonal.lifeLessons || [];
      draft.offices.desarrolloPersonal.lifeLessons = lessons.filter(l => l.id !== id);
    });
  },

  // --- REVISIÓN MENSUAL ---
  saveMonthlyReview(yearMonth: string, review: Omit<MonthlyReview, 'id' | 'yearMonth' | 'updatedAt'>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.desarrolloPersonal.monthlyReviews) {
        draft.offices.desarrolloPersonal.monthlyReviews = {};
      }
      draft.offices.desarrolloPersonal.monthlyReviews[yearMonth] = {
        id: 'rev_' + yearMonth,
        yearMonth,
        biggestLearning: review.biggestLearning || '',
        biggestChallenge: review.biggestChallenge || '',
        nextMonthGoal: review.nextMonthGoal || '',
        updatedAt: new Date().toISOString()
      };
    });
  },

  // Indicador opcional discreto para saber si hoy ya fue completada la reflexión
  // (SÓLO retorna booleano, NUNCA revela el contenido)
  getTodayStatus(): { date: string; completed: boolean } {
    const today = getTodayDateString();
    const entry = this.getEntryForDate(today);
    const completed = !!(
      entry &&
      (entry.wordOfTheDay ||
        entry.freeReflection ||
        entry.philosophicalAnswer ||
        entry.learnedToday ||
        entry.bestThingToday)
    );
    return { date: today, completed };
  }
};

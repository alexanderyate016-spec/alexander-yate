import { storeInstance } from '../../store/CasaBlancaStore';
import { PersonalDevOfficeData, JournalEntry, LifeLesson, MonthlyReview, JournalMood, GrowthObjective } from '../../types/store';
import { getTodayDateString } from '../../utils/dates';

const DEFAULT_GROWTH_OBJECTIVES: GrowthObjective[] = [
  {
    id: 'gro_disciplina',
    title: 'Ser más disciplinado con mi tiempo',
    category: 'Hábitos & Enfoque',
    description: 'Aprender a priorizar lo esencial y respetar los bloques de descanso y estudio.',
    progressNotes: [
      {
        id: 'gn_1',
        date: getTodayDateString(),
        time: '10:00',
        note: 'Inicié el día definiendo una sola meta prioritaria y cumplí el primer bloque sin distracciones.'
      }
    ],
    createdAt: getTodayDateString()
  },
  {
    id: 'gro_confianza',
    title: 'Mejorar mi confianza y comunicación',
    category: 'Desarrollo Interior',
    description: 'Expresar mis ideas con serenidad, claridad y sin dudar de mi preparación.',
    progressNotes: [],
    createdAt: getTodayDateString()
  },
  {
    id: 'gro_bienestar',
    title: 'Cuidar mejor mi salud y paz mental',
    category: 'Bienestar',
    description: 'Hacer pausas conscientes, cuidar el sueño y no postergar el descanso.',
    progressNotes: [],
    createdAt: getTodayDateString()
  }
];

export const PersonalDevStore = {
  getData(): PersonalDevOfficeData {
    const state = storeInstance.getState();
    const data = state?.offices?.desarrolloPersonal;
    return {
      journalEntries: data?.journalEntries || [],
      lifeLessons: data?.lifeLessons || [],
      growthObjectives: (data?.growthObjectives && data.growthObjectives.length > 0) ? data.growthObjectives : DEFAULT_GROWTH_OBJECTIVES,
      monthlyReviews: data?.monthlyReviews || {}
    };
  },

  ensureDefaultData() {
    const todayStr = getTodayDateString();
    storeInstance.updateState(draft => {
      if (!draft.offices) return;
      if (!draft.offices.desarrolloPersonal) {
        (draft.offices as any).desarrolloPersonal = {
          journalEntries: [],
          lifeLessons: [],
          monthlyReviews: {},
          direction: { purpose: '', vision: '', principles: [] },
          characterAreas: [],
          personalHistory: [],
          philosophicalReflections: [],
          growthObjectives: []
        };
      }
      const data = draft.offices.desarrolloPersonal;
      if (!data.journalEntries) data.journalEntries = [];
      if (!data.lifeLessons) data.lifeLessons = [];
      if (!data.growthObjectives || data.growthObjectives.length === 0) {
        data.growthObjectives = DEFAULT_GROWTH_OBJECTIVES;
      }
    });
  },

  // Obtener la entrada para una fecha YYYY-MM-DD específica
  getEntryForDate(dateStr: string): JournalEntry | undefined {
    const entries = this.getData().journalEntries;
    return entries.find(e => e.date === dateStr);
  },

  // Guardar o actualizar la entrada diaria de un día específico
  // REGLA: Cada día tiene una ÚNICA entrada.
  saveJournalEntry(entryData: Partial<JournalEntry> & { date: string }) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    storeInstance.updateState(draft => {
      const entries = draft.offices.desarrolloPersonal.journalEntries || [];
      const existingIndex = entries.findIndex(e => e.date === entryData.date);

      if (existingIndex >= 0) {
        entries[existingIndex] = {
          ...entries[existingIndex],
          ...entryData,
          time: entryData.time || entries[existingIndex].time || timeStr
        };
      } else {
        const newEntry: JournalEntry = {
          id: 'jrn_' + entryData.date + '_' + Math.random().toString(36).substring(2, 6),
          date: entryData.date,
          time: entryData.time || timeStr,
          wordOfTheDay: entryData.wordOfTheDay || '',
          mood: entryData.mood,
          moodNote: entryData.moodNote || '',
          bestThingToday: entryData.bestThingToday || '',
          learnedToday: entryData.learnedToday || '',
          improveTomorrow: entryData.improveTomorrow || '',
          importantDecision: entryData.importantDecision || '',
          gratefulFor: entryData.gratefulFor || '',
          freeReflection: entryData.freeReflection || '',
          philosophicalAnswer: entryData.philosophicalAnswer || '',
          wentWell: entryData.wentWell || '',
          overcame: entryData.overcame || '',
          enjoyed: entryData.enjoyed || '',
          contextualAnswer: entryData.contextualAnswer || '',
          createdAt: new Date().toISOString()
        };
        entries.unshift(newEntry);
      }
      draft.offices.desarrolloPersonal.journalEntries = entries;
    });
  },

  setTodayMood(mood: JournalMood, moodNote?: string, dateStr?: string) {
    const targetDate = dateStr || getTodayDateString();
    const existing = this.getEntryForDate(targetDate);
    this.saveJournalEntry({
      date: targetDate,
      mood,
      moodNote: moodNote !== undefined ? moodNote : existing?.moodNote
    });
  },

  // Eliminar entrada del diario por ID
  deleteJournalEntry(id: string) {
    storeInstance.updateState(draft => {
      const entries = draft.offices.desarrolloPersonal.journalEntries || [];
      draft.offices.desarrolloPersonal.journalEntries = entries.filter(j => j.id !== id);
    });
  },

  // --- LECCIONES DE VIDA / APRENDIZAJES ---
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

  // --- ÁREAS DE CRECIMIENTO PERSONAL ---
  addGrowthObjective(obj: { title: string; description?: string; category?: string }) {
    const todayStr = getTodayDateString();
    storeInstance.updateState(draft => {
      if (!draft.offices.desarrolloPersonal.growthObjectives) {
        draft.offices.desarrolloPersonal.growthObjectives = [];
      }
      const newObj: GrowthObjective = {
        id: 'gro_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: obj.title.trim(),
        description: obj.description?.trim() || '',
        category: obj.category?.trim() || 'Crecimiento',
        progressNotes: [],
        createdAt: todayStr
      };
      draft.offices.desarrolloPersonal.growthObjectives.unshift(newObj);
    });
  },

  addGrowthProgressNote(objectiveId: string, noteText: string) {
    const todayStr = getTodayDateString();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    storeInstance.updateState(draft => {
      const objectives = draft.offices.desarrolloPersonal.growthObjectives || [];
      const obj = objectives.find(o => o.id === objectiveId);
      if (obj) {
        if (!obj.progressNotes) obj.progressNotes = [];
        obj.progressNotes.unshift({
          id: 'gn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          date: todayStr,
          time: timeStr,
          note: noteText.trim()
        });
      }
    });
  },

  deleteGrowthObjective(objectiveId: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.desarrolloPersonal.growthObjectives) return;
      draft.offices.desarrolloPersonal.growthObjectives = draft.offices.desarrolloPersonal.growthObjectives.filter(o => o.id !== objectiveId);
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

  getTodayStatus(): { date: string; completed: boolean } {
    const today = getTodayDateString();
    const entry = this.getEntryForDate(today);
    const completed = !!(
      entry &&
      (entry.wordOfTheDay ||
        entry.freeReflection ||
        entry.philosophicalAnswer ||
        entry.learnedToday ||
        entry.bestThingToday ||
        entry.mood)
    );
    return { date: today, completed };
  }
};

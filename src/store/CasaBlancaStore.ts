import { CasaBlancaStoreData } from '../types/store';
import { createInitialEmptyStore } from './defaultState';

const LOCAL_STORAGE_KEY = 'casa_blanca_personal_v1';

type Listener = (store: CasaBlancaStoreData) => void;

class CasaBlancaStore {
  private data: CasaBlancaStoreData;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): CasaBlancaStoreData {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.metadata && parsed.offices) {
          return this.migrateAndMerge(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load CasaBlancaStore from localStorage', e);
    }
    const initial = createInitialEmptyStore();
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(data: CasaBlancaStoreData) {
    try {
      data.metadata.updatedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save CasaBlancaStore to localStorage', e);
    }
  }

  private migrateAndMerge(parsed: any): CasaBlancaStoreData {
    const initial = createInitialEmptyStore();
    const crisisData = { ...initial.crisisCenter, ...parsed?.crisis, ...parsed?.crisisCenter };
    return {
      metadata: { ...initial.metadata, ...parsed?.metadata },
      settings: { ...initial.settings, ...parsed?.settings },
      security: {
        ...initial.security,
        ...parsed?.security,
        profile: { ...initial.security.profile, ...parsed?.security?.profile },
        authentication: { ...initial.security.authentication, ...parsed?.security?.authentication },
        settings: { ...initial.security.settings, ...parsed?.security?.settings },
        accessLogs: parsed?.security?.accessLogs || initial.security.accessLogs || []
      },
      crisis: crisisData,
      crisisCenter: crisisData,
      offices: {
        academica: {
          semesters: parsed?.offices?.academica?.semesters || initial.offices.academica.semesters || [],
          subjects: parsed?.offices?.academica?.subjects || initial.offices.academica.subjects || []
        },
        vidaDiaria: {
          habits: parsed?.offices?.vidaDiaria?.habits || initial.offices.vidaDiaria.habits || [],
          tasks: parsed?.offices?.vidaDiaria?.tasks || initial.offices.vidaDiaria.tasks || [],
          routines: parsed?.offices?.vidaDiaria?.routines || initial.offices.vidaDiaria.routines || [],
          objectives: parsed?.offices?.vidaDiaria?.objectives || initial.offices.vidaDiaria.objectives || [],
          timePlans: parsed?.offices?.vidaDiaria?.timePlans || initial.offices.vidaDiaria.timePlans || [],
          lastActiveDate: parsed?.offices?.vidaDiaria?.lastActiveDate || '',
          dailyHistory: parsed?.offices?.vidaDiaria?.dailyHistory || [],
          welcomeMessage: parsed?.offices?.vidaDiaria?.welcomeMessage || null
        },
        financiera: {
          accounts: parsed?.offices?.financiera?.accounts || initial.offices.financiera.accounts || [],
          categories: parsed?.offices?.financiera?.categories || initial.offices.financiera.categories || [],
          transactions: parsed?.offices?.financiera?.transactions || initial.offices.financiera.transactions || [],
          budgets: parsed?.offices?.financiera?.budgets || initial.offices.financiera.budgets || [],
          distributionPlan: parsed?.offices?.financiera?.distributionPlan || initial.offices.financiera.distributionPlan,
          recurringExpenses: parsed?.offices?.financiera?.recurringExpenses || initial.offices.financiera.recurringExpenses || [],
          savings: parsed?.offices?.financiera?.savings || initial.offices.financiera.savings || [],
          investments: parsed?.offices?.financiera?.investments || initial.offices.financiera.investments || [],
          obligations: parsed?.offices?.financiera?.obligations || initial.offices.financiera.obligations || []
        },
        vidaSocial: {
          people: parsed?.offices?.vidaSocial?.people || initial.offices.vidaSocial.people || [],
          groups: parsed?.offices?.vidaSocial?.groups || initial.offices.vidaSocial.groups || [],
          interactions: parsed?.offices?.vidaSocial?.interactions || initial.offices.vidaSocial.interactions || [],
          commitments: parsed?.offices?.vidaSocial?.commitments || initial.offices.vidaSocial.commitments || [],
          specialDates: parsed?.offices?.vidaSocial?.specialDates || initial.offices.vidaSocial.specialDates || []
        },
        medica: {
          healthRecords: parsed?.offices?.medica?.healthRecords || initial.offices.medica.healthRecords || [],
          nutritionRecords: parsed?.offices?.medica?.nutritionRecords || initial.offices.medica.nutritionRecords || [],
          medications: parsed?.offices?.medica?.medications || initial.offices.medica.medications || [],
          appointments: parsed?.offices?.medica?.appointments || initial.offices.medica.appointments || [],
          medicalExams: parsed?.offices?.medica?.medicalExams || initial.offices.medica.medicalExams || [],
          conditions: parsed?.offices?.medica?.conditions || initial.offices.medica.conditions || [],
          immunizations: parsed?.offices?.medica?.immunizations || initial.offices.medica.immunizations || [],
          customBottles: parsed?.offices?.medica?.customBottles || initial.offices.medica.customBottles || [],
          waterLogs: parsed?.offices?.medica?.waterLogs || initial.offices.medica.waterLogs || [],
          sleepRecords: parsed?.offices?.medica?.sleepRecords || initial.offices.medica.sleepRecords || [],
          napRecords: parsed?.offices?.medica?.napRecords || initial.offices.medica.napRecords || [],
          dailyWaterTargetLiters: parsed?.offices?.medica?.dailyWaterTargetLiters ?? initial.offices.medica.dailyWaterTargetLiters ?? 2.5,
          sleepTargetHours: parsed?.offices?.medica?.sleepTargetHours ?? initial.offices.medica.sleepTargetHours ?? 8.0
        },
        desarrolloPersonal: {
          journalEntries: parsed?.offices?.desarrolloPersonal?.journalEntries || initial.offices.desarrolloPersonal.journalEntries || [],
          lifeLessons: parsed?.offices?.desarrolloPersonal?.lifeLessons || initial.offices.desarrolloPersonal.lifeLessons || [],
          monthlyReviews: parsed?.offices?.desarrolloPersonal?.monthlyReviews || initial.offices.desarrolloPersonal.monthlyReviews || {},
          direction: parsed?.offices?.desarrolloPersonal?.direction || initial.offices.desarrolloPersonal.direction,
          characterAreas: parsed?.offices?.desarrolloPersonal?.characterAreas || [],
          personalHistory: parsed?.offices?.desarrolloPersonal?.personalHistory || [],
          philosophicalReflections: parsed?.offices?.desarrolloPersonal?.philosophicalReflections || []
        }
      },
      executive: { ...initial.executive, ...parsed?.executive }
    };
  }

  public getState(): CasaBlancaStoreData {
    return this.data;
  }

  public updateState(updater: (draft: CasaBlancaStoreData) => void) {
    const nextData: CasaBlancaStoreData = typeof structuredClone === 'function'
      ? structuredClone(this.data)
      : JSON.parse(JSON.stringify(this.data));
    updater(nextData);
    this.data = nextData;
    this.saveToStorage(this.data);
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  // EXPORT JSON
  public exportJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public exportStateJSON(): string {
    return this.exportJSON();
  }

  // IMPORT JSON WITH VALIDATION
  public importJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'El archivo JSON no tiene un formato válido.' };
      }
      if (!parsed.metadata || !parsed.offices) {
        return { success: false, message: 'Estructura incompatible: Faltan las secciones metadata u offices.' };
      }
      const validated = this.migrateAndMerge(parsed);
      this.data = validated;
      this.saveToStorage(this.data);
      this.notify();
      return { success: true, message: 'Estado del sistema restaurado correctamente.' };
    } catch (e) {
      return { success: false, message: 'Error de análisis sintáctico: El archivo JSON está dañado.' };
    }
  }

  public importStateJSON(jsonStr: string): boolean {
    const res = this.importJSON(jsonStr);
    return res.success;
  }

  // RESET STORE (CLEAR EVERYTHING)
  public resetStore() {
    this.data = createInitialEmptyStore();
    this.saveToStorage(this.data);
    this.notify();
  }
}

export const storeInstance = new CasaBlancaStore();

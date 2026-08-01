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
    const crisisData = { ...initial.crisisCenter, ...parsed.crisis, ...parsed.crisisCenter };
    return {
      metadata: { ...initial.metadata, ...parsed.metadata },
      settings: { ...initial.settings, ...parsed.settings },
      security: { ...initial.security, ...parsed.security },
      crisis: crisisData,
      crisisCenter: crisisData,
      offices: {
        academica: { ...initial.offices.academica, ...parsed.offices?.academica },
        vidaDiaria: { ...initial.offices.vidaDiaria, ...parsed.offices?.vidaDiaria },
        financiera: { ...initial.offices.financiera, ...parsed.offices?.financiera },
        vidaSocial: { ...initial.offices.vidaSocial, ...parsed.offices?.vidaSocial },
        medica: { ...initial.offices.medica, ...parsed.offices?.medica },
        desarrolloPersonal: { ...initial.offices.desarrolloPersonal, ...parsed.offices?.desarrolloPersonal }
      },
      executive: { ...initial.executive, ...parsed.executive }
    };
  }

  public getState(): CasaBlancaStoreData {
    return this.data;
  }

  public updateState(updater: (draft: CasaBlancaStoreData) => void) {
    updater(this.data);
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

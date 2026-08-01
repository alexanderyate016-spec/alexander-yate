import { storeInstance } from '../../store/CasaBlancaStore';
import { PersonalDevOfficeData, PersonalPrinciple, CharacterGrowthArea, JournalEntry, HistoryMilestone, PhilosophicalReflection } from '../../types/store';

export const PersonalDevStore = {
  getData(): PersonalDevOfficeData {
    return storeInstance.getState().offices.desarrolloPersonal;
  },

  updateDirection(purpose: string, vision: string) {
    storeInstance.updateState(draft => {
      draft.offices.desarrolloPersonal.direction.purpose = purpose;
      draft.offices.desarrolloPersonal.direction.vision = vision;
    });
  },

  addPrinciple(principle: Omit<PersonalPrinciple, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'prc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.desarrolloPersonal.direction.principles.push({ ...principle, id });
    });
  },

  deletePrinciple(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.desarrolloPersonal.direction.principles = draft.offices.desarrolloPersonal.direction.principles.filter(p => p.id !== id);
    });
  },

  addJournalEntry(entry: Omit<JournalEntry, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'jrn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.desarrolloPersonal.journalEntries.unshift({ ...entry, id });
    });
  },

  deleteJournalEntry(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.desarrolloPersonal.journalEntries = draft.offices.desarrolloPersonal.journalEntries.filter(j => j.id !== id);
    });
  }
};

import { storeInstance } from '../../store/CasaBlancaStore';
import { SocialOfficeData, SocialPerson, SocialInteraction, SocialCommitment, SpecialDateItem } from '../../types/store';

export const SocialStore = {
  getData(): SocialOfficeData {
    return storeInstance.getState().offices.vidaSocial;
  },

  // PEOPLE
  addPerson(person: Omit<SocialPerson, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'prsn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaSocial.people.push({ ...person, id, tags: person.tags || [] });
    });
  },

  updatePerson(id: string, updates: Partial<SocialPerson>) {
    storeInstance.updateState(draft => {
      const pIndex = draft.offices.vidaSocial.people.findIndex(p => p.id === id);
      if (pIndex !== -1) {
        draft.offices.vidaSocial.people[pIndex] = {
          ...draft.offices.vidaSocial.people[pIndex],
          ...updates
        };
      }
    });
  },

  toggleFavorite(id: string) {
    storeInstance.updateState(draft => {
      const person = draft.offices.vidaSocial.people.find(p => p.id === id);
      if (person) {
        person.isFavorite = !person.isFavorite;
      }
    });
  },

  addCustomDate(personId: string, customDate: { title: string; date: string }) {
    storeInstance.updateState(draft => {
      const person = draft.offices.vidaSocial.people.find(p => p.id === personId);
      if (person) {
        if (!person.customDates) person.customDates = [];
        person.customDates.push({
          id: 'cdate_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          ...customDate
        });
      }
    });
  },

  deleteCustomDate(personId: string, customDateId: string) {
    storeInstance.updateState(draft => {
      const person = draft.offices.vidaSocial.people.find(p => p.id === personId);
      if (person && person.customDates) {
        person.customDates = person.customDates.filter(cd => cd.id !== customDateId);
      }
    });
  },

  deletePerson(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaSocial.people = draft.offices.vidaSocial.people.filter(p => p.id !== id);
      draft.offices.vidaSocial.interactions = draft.offices.vidaSocial.interactions.filter(i => i.personId !== id);
    });
  },

  // INTERACTIONS
  addInteraction(interaction: Omit<SocialInteraction, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'int_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaSocial.interactions.push({ ...interaction, id });
    });
  },

  deleteInteraction(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaSocial.interactions = draft.offices.vidaSocial.interactions.filter(i => i.id !== id);
    });
  },

  // COMMITMENTS
  addCommitment(commitment: Omit<SocialCommitment, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'soc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaSocial.commitments.push({ ...commitment, id });
    });
  },

  deleteCommitment(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaSocial.commitments = draft.offices.vidaSocial.commitments.filter(c => c.id !== id);
    });
  },

  updateCommitment(id: string, updates: Partial<SocialCommitment>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.vidaSocial.commitments.findIndex(c => c.id === id);
      if (idx !== -1) {
        draft.offices.vidaSocial.commitments[idx] = {
          ...draft.offices.vidaSocial.commitments[idx],
          ...updates
        };
      }
    });
  }
};

import { storeInstance } from '../../store/CasaBlancaStore';
import { SocialOfficeData, SocialPerson, SocialInteraction, SocialCommitment, SpecialDateItem } from '../../types/store';

export const SocialStore = {
  getData(): SocialOfficeData {
    return storeInstance.getState().offices.vidaSocial;
  },

  // PEOPLE
  addPerson(person: Omit<SocialPerson, 'id' | 'tags'>) {
    storeInstance.updateState(draft => {
      const id = 'prsn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaSocial.people.push({ ...person, id, tags: [] });
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
  }
};

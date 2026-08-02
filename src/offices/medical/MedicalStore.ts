import { storeInstance } from '../../store/CasaBlancaStore';
import { MedicalOfficeData, HealthRecord, NutritionRecord, MedicationItem, MedicalAppointment, ImmunizationRecord } from '../../types/store';

export const MedicalStore = {
  getData(): MedicalOfficeData {
    return storeInstance.getState().offices.medica;
  },

  // HEALTH LOGS
  addHealthRecord(record: Omit<HealthRecord, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'hlth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.healthRecords.push({ ...record, id });
    });
  },

  // MEDICATIONS
  addMedication(med: Omit<MedicationItem, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.medications.push({ ...med, id });
    });
  },

  deleteMedication(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.medications = draft.offices.medica.medications.filter(m => m.id !== id);
    });
  },

  // APPOINTMENTS
  addAppointment(app: Omit<MedicalAppointment, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.appointments.push({ ...app, id });
    });
  },

  deleteAppointment(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.appointments = draft.offices.medica.appointments.filter(a => a.id !== id);
    });
  },

  updateAppointment(id: string, updates: Partial<MedicalAppointment>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.medica.appointments.findIndex(a => a.id === id);
      if (idx !== -1) {
        draft.offices.medica.appointments[idx] = {
          ...draft.offices.medica.appointments[idx],
          ...updates
        };
      }
    });
  },

  // VACCINES
  addImmunization(vac: Omit<ImmunizationRecord, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'vac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.immunizations.push({ ...vac, id });
    });
  },

  deleteImmunization(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.immunizations = draft.offices.medica.immunizations.filter(v => v.id !== id);
    });
  }
};

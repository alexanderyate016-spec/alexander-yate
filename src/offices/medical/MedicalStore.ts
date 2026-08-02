import { storeInstance } from '../../store/CasaBlancaStore';
import {
  MedicalOfficeData,
  HealthRecord,
  NutritionRecord,
  MedicationItem,
  MedicalAppointment,
  ImmunizationRecord,
  CustomWaterBottle,
  MedicalExam,
  HealthCondition
} from '../../types/store';

export const MedicalStore = {
  getData(): MedicalOfficeData {
    return storeInstance.getState().offices.medica;
  },

  // HEALTH LOGS
  addHealthRecord(record: Omit<HealthRecord, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'hlth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.medica.healthRecords) draft.offices.medica.healthRecords = [];
      draft.offices.medica.healthRecords.push({ ...record, id });
    });
  },

  updateHealthRecord(id: string, updates: Partial<HealthRecord>) {
    storeInstance.updateState(draft => {
      const idx = (draft.offices.medica.healthRecords || []).findIndex(r => r.id === id);
      if (idx !== -1) {
        draft.offices.medica.healthRecords[idx] = {
          ...draft.offices.medica.healthRecords[idx],
          ...updates
        };
      }
    });
  },

  deleteHealthRecord(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.healthRecords = (draft.offices.medica.healthRecords || []).filter(r => r.id !== id);
    });
  },

  // WATER INTAKE QUICK ADD
  addWaterIntake(date: string, amountMl: number) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.healthRecords) draft.offices.medica.healthRecords = [];
      const existingIdx = draft.offices.medica.healthRecords.findIndex(r => r.date === date);
      const addedLiters = amountMl / 1000;
      const addedGlasses = Math.round(amountMl / 250);

      if (existingIdx !== -1) {
        const currentLiters = draft.offices.medica.healthRecords[existingIdx].hydrationLiters || 0;
        const currentGlasses = draft.offices.medica.healthRecords[existingIdx].hydrationGlasses || 0;
        draft.offices.medica.healthRecords[existingIdx].hydrationLiters = Number((currentLiters + addedLiters).toFixed(2));
        draft.offices.medica.healthRecords[existingIdx].hydrationGlasses = currentGlasses + addedGlasses;
      } else {
        const id = 'hlth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        draft.offices.medica.healthRecords.push({
          id,
          date,
          hydrationLiters: Number(addedLiters.toFixed(2)),
          hydrationGlasses: addedGlasses
        });
      }
    });
  },

  // CUSTOM BOTTLES
  addCustomBottle(bottle: Omit<CustomWaterBottle, 'id'>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.customBottles) draft.offices.medica.customBottles = [];
      const id = 'bot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.customBottles.push({ ...bottle, id });
    });
  },

  deleteCustomBottle(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.customBottles) return;
      draft.offices.medica.customBottles = draft.offices.medica.customBottles.filter(b => b.id !== id);
    });
  },

  setWaterTarget(liters: number) {
    storeInstance.updateState(draft => {
      draft.offices.medica.dailyWaterTargetLiters = liters;
    });
  },

  // NUTRITION RECORDS
  addNutritionRecord(rec: Omit<NutritionRecord, 'id'>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.nutritionRecords) draft.offices.medica.nutritionRecords = [];
      const id = 'nut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.nutritionRecords.push({ ...rec, id });
    });
  },

  deleteNutritionRecord(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.nutritionRecords = (draft.offices.medica.nutritionRecords || []).filter(n => n.id !== id);
    });
  },

  // MEDICATIONS
  addMedication(med: Omit<MedicationItem, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.medica.medications) draft.offices.medica.medications = [];
      draft.offices.medica.medications.push({ ...med, id, status: med.status || 'active' });
    });
  },

  updateMedication(id: string, updates: Partial<MedicationItem>) {
    storeInstance.updateState(draft => {
      const idx = (draft.offices.medica.medications || []).findIndex(m => m.id === id);
      if (idx !== -1) {
        draft.offices.medica.medications[idx] = {
          ...draft.offices.medica.medications[idx],
          ...updates
        };
      }
    });
  },

  deleteMedication(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.medications = (draft.offices.medica.medications || []).filter(m => m.id !== id);
    });
  },

  // APPOINTMENTS
  addAppointment(app: Omit<MedicalAppointment, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.medica.appointments) draft.offices.medica.appointments = [];
      draft.offices.medica.appointments.push({ ...app, id, status: app.status || 'Programada' });
    });
  },

  deleteAppointment(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.appointments = (draft.offices.medica.appointments || []).filter(a => a.id !== id);
    });
  },

  updateAppointment(id: string, updates: Partial<MedicalAppointment>) {
    storeInstance.updateState(draft => {
      const idx = (draft.offices.medica.appointments || []).findIndex(a => a.id === id);
      if (idx !== -1) {
        draft.offices.medica.appointments[idx] = {
          ...draft.offices.medica.appointments[idx],
          ...updates
        };
      }
    });
  },

  // VACCINES / IMMUNIZATIONS
  addImmunization(vac: Omit<ImmunizationRecord, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'vac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.medica.immunizations) draft.offices.medica.immunizations = [];
      draft.offices.medica.immunizations.push({ ...vac, id });
    });
  },

  updateImmunization(id: string, updates: Partial<ImmunizationRecord>) {
    storeInstance.updateState(draft => {
      const idx = (draft.offices.medica.immunizations || []).findIndex(v => v.id === id);
      if (idx !== -1) {
        draft.offices.medica.immunizations[idx] = {
          ...draft.offices.medica.immunizations[idx],
          ...updates
        };
      }
    });
  },

  deleteImmunization(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.immunizations = (draft.offices.medica.immunizations || []).filter(v => v.id !== id);
    });
  },

  // MEDICAL EXAMS
  addMedicalExam(exam: Omit<MedicalExam, 'id'>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.medicalExams) draft.offices.medica.medicalExams = [];
      const id = 'exam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.medicalExams.push({ ...exam, id, status: exam.status || 'Pendiente' });
    });
  },

  updateMedicalExam(id: string, updates: Partial<MedicalExam>) {
    storeInstance.updateState(draft => {
      const idx = (draft.offices.medica.medicalExams || []).findIndex(e => e.id === id);
      if (idx !== -1) {
        draft.offices.medica.medicalExams[idx] = {
          ...draft.offices.medica.medicalExams[idx],
          ...updates
        };
      }
    });
  },

  deleteMedicalExam(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.medicalExams = (draft.offices.medica.medicalExams || []).filter(e => e.id !== id);
    });
  },

  // HEALTH CONDITIONS / DISEASES
  addCondition(cond: Omit<HealthCondition, 'id'>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.conditions) draft.offices.medica.conditions = [];
      const id = 'cond_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.conditions.push({ ...cond, id, status: cond.status || 'active' });
    });
  },

  updateCondition(id: string, updates: Partial<HealthCondition>) {
    storeInstance.updateState(draft => {
      const idx = (draft.offices.medica.conditions || []).findIndex(c => c.id === id);
      if (idx !== -1) {
        draft.offices.medica.conditions[idx] = {
          ...draft.offices.medica.conditions[idx],
          ...updates
        };
      }
    });
  },

  deleteCondition(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.medica.conditions = (draft.offices.medica.conditions || []).filter(c => c.id !== id);
    });
  }
};

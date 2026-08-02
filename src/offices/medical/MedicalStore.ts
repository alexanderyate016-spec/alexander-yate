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
  HealthCondition,
  WaterIntakeLog,
  SleepRecord,
  NapRecord
} from '../../types/store';

// Helper to compute duration in minutes handling midnight crossing
function computeDurationMinutes(startStr: string, endStr: string, isNight: boolean = false): number {
  if (!startStr || !endStr) return 0;
  const [h1, m1] = startStr.split(':').map(Number);
  const [h2, m2] = endStr.split(':').map(Number);
  const startMins = (h1 || 0) * 60 + (m1 || 0);
  let endMins = (h2 || 0) * 60 + (m2 || 0);
  if (isNight) {
    if (endMins <= startMins) {
      endMins += 24 * 60;
    }
  } else {
    if (endMins < startMins) {
      endMins += 24 * 60;
    }
  }
  return Math.max(0, endMins - startMins);
}

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

  // INDIVIDUAL WATER LOGS
  addWaterLog(log: Omit<WaterIntakeLog, 'id'>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.waterLogs) draft.offices.medica.waterLogs = [];
      const id = 'wlog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.waterLogs.push({ ...log, id });
    });
  },

  updateWaterLog(id: string, updates: Partial<WaterIntakeLog>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.waterLogs) return;
      const idx = draft.offices.medica.waterLogs.findIndex(w => w.id === id);
      if (idx !== -1) {
        draft.offices.medica.waterLogs[idx] = {
          ...draft.offices.medica.waterLogs[idx],
          ...updates
        };
      }
    });
  },

  deleteWaterLog(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.waterLogs) return;
      draft.offices.medica.waterLogs = draft.offices.medica.waterLogs.filter(w => w.id !== id);
    });
  },

  // WATER INTAKE QUICK ADD (Creates an individual waterLog record!)
  addWaterIntake(date: string, amountMl: number, containerType?: string, timeStr?: string) {
    const now = new Date();
    const time = timeStr || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    let label = containerType;
    if (!label) {
      if (amountMl === 250) label = 'Vaso (250 ml)';
      else if (amountMl === 500) label = 'Botella (500 ml)';
      else if (amountMl === 600) label = 'Botella (600 ml)';
      else if (amountMl === 1000) label = 'Botella (1000 ml)';
      else label = `${amountMl} ml`;
    }

    this.addWaterLog({
      date,
      time,
      amountMl,
      containerType: label
    });
  },

  // SLEEP RECORDS (Calculates duration automatically!)
  saveSleepRecord(record: { id?: string; date: string; bedTime: string; wakeTime: string; quality?: number; notes?: string }) {
    const durationMinutes = computeDurationMinutes(record.bedTime, record.wakeTime, true);
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.sleepRecords) draft.offices.medica.sleepRecords = [];
      
      const existingIdx = record.id 
        ? draft.offices.medica.sleepRecords.findIndex(s => s.id === record.id)
        : draft.offices.medica.sleepRecords.findIndex(s => s.date === record.date);

      if (existingIdx !== -1) {
        draft.offices.medica.sleepRecords[existingIdx] = {
          ...draft.offices.medica.sleepRecords[existingIdx],
          bedTime: record.bedTime,
          wakeTime: record.wakeTime,
          durationMinutes,
          quality: record.quality !== undefined ? record.quality : draft.offices.medica.sleepRecords[existingIdx].quality,
          notes: record.notes !== undefined ? record.notes : draft.offices.medica.sleepRecords[existingIdx].notes
        };
      } else {
        const id = record.id || 'sleep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        draft.offices.medica.sleepRecords.push({
          id,
          date: record.date,
          bedTime: record.bedTime,
          wakeTime: record.wakeTime,
          durationMinutes,
          quality: record.quality || 4,
          notes: record.notes || ''
        });
      }
    });
  },

  deleteSleepRecord(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.sleepRecords) return;
      draft.offices.medica.sleepRecords = draft.offices.medica.sleepRecords.filter(s => s.id !== id);
    });
  },

  setSleepTarget(hours: number) {
    storeInstance.updateState(draft => {
      draft.offices.medica.sleepTargetHours = hours;
    });
  },

  // NAP RECORDS (Siestas)
  addNapRecord(nap: { date: string; startTime: string; endTime: string; notes?: string }) {
    const durationMinutes = computeDurationMinutes(nap.startTime, nap.endTime, false);
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.napRecords) draft.offices.medica.napRecords = [];
      const id = 'nap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.medica.napRecords.push({
        id,
        date: nap.date,
        startTime: nap.startTime,
        endTime: nap.endTime,
        durationMinutes,
        notes: nap.notes || ''
      });
    });
  },

  updateNapRecord(id: string, updates: Partial<NapRecord>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.napRecords) return;
      const idx = draft.offices.medica.napRecords.findIndex(n => n.id === id);
      if (idx !== -1) {
        const current = draft.offices.medica.napRecords[idx];
        const newStart = updates.startTime || current.startTime;
        const newEnd = updates.endTime || current.endTime;
        const durationMinutes = computeDurationMinutes(newStart, newEnd, false);

        draft.offices.medica.napRecords[idx] = {
          ...current,
          ...updates,
          durationMinutes
        };
      }
    });
  },

  deleteNapRecord(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.medica.napRecords) return;
      draft.offices.medica.napRecords = draft.offices.medica.napRecords.filter(n => n.id !== id);
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

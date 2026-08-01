import { MedicalOfficeData } from '../../types/store';

export const MedicalCalculations = {
  getLatestHealthMetrics(data: MedicalOfficeData) {
    if (data.healthRecords.length === 0) {
      return { weight: null, sleep: null, hydrationLiters: null };
    }

    const sorted = [...data.healthRecords].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];

    return {
      weight: latest.weightKg || null,
      sleep: latest.sleepHours || null,
      hydrationLiters: latest.hydrationLiters || (latest.hydrationGlasses ? latest.hydrationGlasses * 0.25 : null)
    };
  },

  getHealthAlerts(data: MedicalOfficeData): string[] {
    const alerts: string[] = [];
    const metrics = this.getLatestHealthMetrics(data);

    if (metrics.sleep !== null && metrics.sleep < 7) {
      alerts.push('😴 Tu promedio de sueño está por debajo de las 7 horas recomendadas.');
    }
    if (metrics.hydrationLiters !== null && metrics.hydrationLiters < 1.5) {
      alerts.push('💧 Has registrado poca hidratación (menos de 1.5L).');
    }

    return alerts;
  }
};

import { MedicalOfficeData } from '../../types/store';

export const MedicalCalculations = {
  // Returns today or latest metrics and stats
  getLatestHealthMetrics(data: MedicalOfficeData, targetDateStr?: string) {
    const today = targetDateStr || new Date().toISOString().split('T')[0];
    const records = data.healthRecords || [];
    
    // Sort records chronologically (newest first)
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    const todayRecord = records.find(r => r.date === today);
    const latest = sorted.length > 0 ? sorted[0] : null;

    // Weight Stats
    const weightRecords = sorted.filter(r => r.weightKg !== undefined && r.weightKg !== null && r.weightKg > 0);
    const latestWeight = todayRecord?.weightKg ?? (latest?.weightKg || null);
    const prevWeight = weightRecords.length > 1 ? weightRecords[1].weightKg : null;
    
    let weightTrend: 'up' | 'down' | 'stable' = 'stable';
    if (latestWeight !== null && prevWeight !== null) {
      if (latestWeight > prevWeight + 0.2) weightTrend = 'up';
      else if (latestWeight < prevWeight - 0.2) weightTrend = 'down';
    }

    const weightValues = weightRecords.map(r => r.weightKg as number);
    const minWeight = weightValues.length > 0 ? Math.min(...weightValues) : null;
    const maxWeight = weightValues.length > 0 ? Math.max(...weightValues) : null;
    const avgWeight = weightValues.length > 0 ? Number((weightValues.reduce((a, b) => a + b, 0) / weightValues.length).toFixed(1)) : null;

    // Hydration Stats
    const targetWater = data.dailyWaterTargetLiters || 2.0;
    const todayHydrationLiters = todayRecord?.hydrationLiters ?? (todayRecord?.hydrationGlasses ? todayRecord.hydrationGlasses * 0.25 : 0);
    const hydrationPct = Math.min(100, Math.round((todayHydrationLiters / targetWater) * 100));
    const remainingWaterMl = Math.max(0, Math.round((targetWater - todayHydrationLiters) * 1000));

    // Sleep Stats
    const todaySleep = todayRecord?.sleepHours ?? null;
    const sleepRecords = sorted.filter(r => r.sleepHours !== undefined && r.sleepHours !== null && r.sleepHours > 0);
    
    // Weekly avg sleep (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const weeklySleepRecs = sleepRecords.filter(r => r.date >= sevenDaysAgoStr);
    const weeklyAvgSleep = weeklySleepRecs.length > 0
      ? Number((weeklySleepRecs.reduce((sum, r) => sum + (r.sleepHours || 0), 0) / weeklySleepRecs.length).toFixed(1))
      : null;

    // Monthly avg sleep (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    const monthlySleepRecs = sleepRecords.filter(r => r.date >= thirtyDaysAgoStr);
    const monthlyAvgSleep = monthlySleepRecs.length > 0
      ? Number((monthlySleepRecs.reduce((sum, r) => sum + (r.sleepHours || 0), 0) / monthlySleepRecs.length).toFixed(1))
      : null;

    return {
      weight: latestWeight,
      prevWeight,
      weightTrend,
      minWeight,
      maxWeight,
      avgWeight,
      sleep: todaySleep,
      weeklyAvgSleep,
      monthlyAvgSleep,
      hydrationLiters: todayHydrationLiters,
      targetWater,
      hydrationPct,
      remainingWaterMl
    };
  },

  // Indicador de Bienestar Diario
  getDailyWellnessIndex(data: MedicalOfficeData, targetDateStr?: string) {
    const metrics = this.getLatestHealthMetrics(data, targetDateStr);
    const today = targetDateStr || new Date().toISOString().split('T')[0];

    const hydrationScore = metrics.hydrationPct; // 0 - 100%
    const sleepScore = metrics.sleep ? Math.min(100, Math.round((metrics.sleep / 8) * 100)) : 0;
    
    const activeMeds = (data.medications || []).filter(m => m.status === 'active');
    const medScore = activeMeds.length > 0 ? 100 : 100; // default 100 if no meds or active

    const hasLogToday = (data.healthRecords || []).some(r => r.date === today);
    const logScore = hasLogToday ? 100 : 50;

    const overallScore = Math.round((hydrationScore * 0.3) + (sleepScore * 0.3) + (medScore * 0.2) + (logScore * 0.2));

    return {
      hydrationPct: hydrationScore,
      sleepPct: sleepScore,
      medScore,
      isLogCompleted: hasLogToday,
      overallScore
    };
  },

  // Alertas Inteligentes de Salud (sin diagnósticos médicos)
  getHealthAlerts(data: MedicalOfficeData): string[] {
    const alerts: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    const metrics = this.getLatestHealthMetrics(data, today);

    // 1. Water alert
    if (metrics.hydrationLiters < metrics.targetWater) {
      alerts.push(`💧 Hoy has tomado ${metrics.hydrationLiters.toFixed(1)}L de agua. Te faltan ${(metrics.remainingWaterMl / 1000).toFixed(1)}L para alcanzar tu objetivo de ${metrics.targetWater}L.`);
    }

    // 2. Sleep alert
    if (metrics.sleep !== null && metrics.weeklyAvgSleep !== null && metrics.sleep < metrics.weeklyAvgSleep) {
      alerts.push(`😴 Dormiste ${metrics.sleep} hrs hoy, por debajo de tu promedio semanal de ${metrics.weeklyAvgSleep} hrs.`);
    }

    // 3. Appointments today
    const todayApts = (data.appointments || []).filter(a => a.date === today && a.status !== 'Cancelada');
    if (todayApts.length > 0) {
      todayApts.forEach(apt => {
        alerts.push(`🩺 Hoy tienes una cita médica: "${apt.title}" (${apt.specialty}) a las ${apt.startTime}.`);
      });
    }

    // 4. Medications active
    const activeMeds = (data.medications || []).filter(m => m.status === 'active');
    if (activeMeds.length > 0) {
      alerts.push(`💊 Tienes ${activeMeds.length} medicamento(s) en tratamiento activo.`);
    }

    // 5. Vaccines booster coming up
    (data.immunizations || []).forEach(vac => {
      if (vac.nextDoseDate) {
        const nextDose = new Date(vac.nextDoseDate);
        const now = new Date(today);
        const diffDays = Math.ceil((nextDose.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          alerts.push(`💉 En ${diffDays === 0 ? 'hoy' : diffDays + ' días'} corresponde el refuerzo de la vacuna ${vac.name}.`);
        }
      }
    });

    // 6. Weight change notice
    if (metrics.weight !== null && metrics.prevWeight !== null && Math.abs(metrics.weight - metrics.prevWeight) >= 1.0) {
      const diff = (metrics.weight - metrics.prevWeight).toFixed(1);
      alerts.push(`⚖ Tu peso cambió ${diff > '0' ? '+' + diff : diff} kg respecto al registro previo.`);
    }

    return alerts;
  }
};

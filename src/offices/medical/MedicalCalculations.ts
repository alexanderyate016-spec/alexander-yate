import { MedicalOfficeData } from '../../types/store';

// Helper to format minutes to "7 h 45 min" or "45 min" or "8 h"
export function formatMinutesToText(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 min';
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// Helper to calculate average time string "HH:mm" from array of "HH:mm" strings
export function calculateAverageTimeString(timeStrings: string[]): string | null {
  if (!timeStrings || timeStrings.length === 0) return null;
  
  let totalMinutesSum = 0;
  let count = 0;

  timeStrings.forEach(tStr => {
    if (!tStr || !tStr.includes(':')) return;
    const [h, m] = tStr.split(':').map(Number);
    let mins = (h || 0) * 60 + (m || 0);
    // If time is early morning (00:00 - 05:00) when calculating bedTime, treat as late night
    // For bed time, times between 18:00 and 06:00
    totalMinutesSum += mins;
    count++;
  });

  if (count === 0) return null;
  const avgMins = Math.round(totalMinutesSum / count);
  const avgH = Math.floor((avgMins % 1440) / 60);
  const avgM = Math.round(avgMins % 60);
  return `${String(avgH).padStart(2, '0')}:${String(avgM).padStart(2, '0')}`;
}

export const MedicalCalculations = {
  // Returns today or latest metrics and stats
  getLatestHealthMetrics(data: MedicalOfficeData, targetDateStr?: string) {
    const today = targetDateStr || new Date().toISOString().split('T')[0];
    const records = data.healthRecords || [];
    
    // Sort records chronologically (newest first)
    const sorted = [...records].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
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

    // Hydration Stats (Individual logs calculation)
    const targetWater = data.dailyWaterTargetLiters || 2.5;
    const todayWaterLogs = (data.waterLogs || []).filter(w => w.date === today);
    const totalMl = todayWaterLogs.reduce((sum, w) => sum + (w.amountMl || 0), 0);
    const todayHydrationLiters = Number((totalMl / 1000).toFixed(2));

    const hydrationPct = Math.min(100, Math.round((todayHydrationLiters / targetWater) * 100));
    const remainingWaterMl = Math.max(0, Math.round((targetWater - todayHydrationLiters) * 1000));

    // Sleep Stats (Automated calculation from bed/wake times & naps)
    const targetSleepHours = data.sleepTargetHours || 8.0;
    const todaySleepRecord = (data.sleepRecords || []).find(s => s.date === today);
    const todayNaps = (data.napRecords || []).filter(n => n.date === today);

    const todayNightMins = todaySleepRecord?.durationMinutes || (todayRecord?.sleepHours ? todayRecord.sleepHours * 60 : 0);
    const todayNapMins = todayNaps.reduce((sum, n) => sum + (n.durationMinutes || 0), 0);
    const totalTodaySleepMins = todayNightMins + todayNapMins;
    const todaySleep = Number((totalTodaySleepMins / 60).toFixed(1));

    // Historical sleep records analysis
    const allSleepRecords = data.sleepRecords || [];
    
    // Weekly avg sleep (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const weeklySleepRecs = allSleepRecords.filter(r => r.date >= sevenDaysAgoStr && r.durationMinutes > 0);
    const weeklyAvgSleep = weeklySleepRecs.length > 0
      ? Number((weeklySleepRecs.reduce((sum, r) => sum + r.durationMinutes, 0) / weeklySleepRecs.length / 60).toFixed(1))
      : (todaySleep > 0 ? todaySleep : null);

    // Monthly avg sleep (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const monthlySleepRecs = allSleepRecords.filter(r => r.date >= thirtyDaysAgoStr && r.durationMinutes > 0);
    const monthlyAvgSleep = monthlySleepRecs.length > 0
      ? Number((monthlySleepRecs.reduce((sum, r) => sum + r.durationMinutes, 0) / monthlySleepRecs.length / 60).toFixed(1))
      : (weeklyAvgSleep !== null ? weeklyAvgSleep : null);

    // Average bed & wake times
    const bedTimes = weeklySleepRecs.map(r => r.bedTime).filter(Boolean);
    const wakeTimes = weeklySleepRecs.map(r => r.wakeTime).filter(Boolean);
    const avgBedTime = calculateAverageTimeString(bedTimes);
    const avgWakeTime = calculateAverageTimeString(wakeTimes);

    // Days below sleep target
    const daysBelowGoal = allSleepRecords.filter(r => {
      const dayNapsMins = (data.napRecords || []).filter(n => n.date === r.date).reduce((sum, n) => sum + (n.durationMinutes || 0), 0);
      const totalDayMins = r.durationMinutes + dayNapsMins;
      return totalDayMins < (targetSleepHours * 60);
    }).length;

    return {
      weight: latestWeight,
      prevWeight,
      weightTrend,
      minWeight,
      maxWeight,
      avgWeight,
      sleep: todaySleep,
      totalTodaySleepMins,
      sleepFormatted: formatMinutesToText(totalTodaySleepMins),
      nightSleepFormatted: formatMinutesToText(todayNightMins),
      napSleepFormatted: formatMinutesToText(todayNapMins),
      weeklyAvgSleep,
      monthlyAvgSleep,
      avgBedTime,
      avgWakeTime,
      daysBelowGoal,
      todaySleepRecord,
      todayNaps,
      hydrationLiters: todayHydrationLiters,
      targetWater,
      targetSleepHours,
      hydrationPct,
      remainingWaterMl,
      todayWaterLogs
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
  },

  // Actividad diaria (ejercicio / pasos)
  getActivityMetrics(data: MedicalOfficeData, targetDateStr?: string) {
    const today = targetDateStr || new Date().toISOString().split('T')[0];
    const logs = (data.activityLogs || []).filter(a => a.date === today);

    const totalMinutes = logs.reduce((sum, a) => sum + (a.minutes || 0), 0);
    const totalSteps = logs.reduce((sum, a) => sum + (a.steps || 0), 0);

    const targetMinutes = data.activityTargetMinutes || 60;
    const targetSteps = data.stepsTarget || 8000;

    const minutesPct = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));
    const stepsPct = Math.min(100, Math.round((totalSteps / targetSteps) * 100));

    return {
      todayMinutes: totalMinutes,
      targetMinutes,
      minutesPct,
      todaySteps: totalSteps,
      targetSteps,
      stepsPct,
      logs
    };
  },

  // Frecuencia cardíaca
  getHeartRateMetrics(data: MedicalOfficeData) {
    const logs = [...(data.heartRateLogs || [])].sort((a, b) => {
      const dateTimeA = `${a.date} ${a.time}`;
      const dateTimeB = `${b.date} ${b.time}`;
      return dateTimeB.localeCompare(dateTimeA);
    });

    const latest = logs.length > 0 ? logs[0] : null;
    const previous = logs.length > 1 ? logs[1] : null;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (latest && previous) {
      if (latest.bpm > previous.bpm + 2) trend = 'up';
      else if (latest.bpm < previous.bpm - 2) trend = 'down';
    }

    return {
      latestBpm: latest ? latest.bpm : null,
      latestDate: latest ? latest.date : null,
      latestTime: latest ? latest.time : null,
      context: latest ? latest.context : null,
      trend,
      history: logs.slice(0, 10)
    };
  },

  // Historial de Salud Consolidado
  getConsolidatedTimeline(data: MedicalOfficeData) {
    const events: Array<{
      id: string;
      date: string;
      time?: string;
      icon: string;
      title: string;
      subtitle: string;
      category: 'peso' | 'agua' | 'sueño' | 'cita' | 'examen' | 'vacuna' | 'actividad' | 'corazon';
      rawDate: string;
    }> = [];

    // 1. Health Records (Weight)
    (data.healthRecords || []).forEach(r => {
      if (r.weightKg) {
        events.push({
          id: `timeline_w_${r.id}`,
          date: r.date,
          time: '08:00',
          icon: '⚖️',
          title: 'Peso registrado',
          subtitle: `${r.weightKg} kg ${r.notes ? '• ' + r.notes : ''}`,
          category: 'peso',
          rawDate: r.date
        });
      }
    });

    // 2. Water Logs
    const waterByDate: Record<string, number> = {};
    (data.waterLogs || []).forEach(w => {
      waterByDate[w.date] = (waterByDate[w.date] || 0) + (w.amountMl || 0);
    });
    Object.entries(waterByDate).forEach(([d, ml]) => {
      if (ml >= 1000) {
        events.push({
          id: `timeline_wat_${d}`,
          date: d,
          time: '18:00',
          icon: '💧',
          title: 'Registro de Hidratación',
          subtitle: `${(ml / 1000).toFixed(1)} L de agua consumidos`,
          category: 'agua',
          rawDate: d
        });
      }
    });

    // 3. Sleep Records
    (data.sleepRecords || []).forEach(s => {
      if (s.durationMinutes > 0) {
        events.push({
          id: `timeline_slp_${s.id}`,
          date: s.date,
          time: s.wakeTime || '07:00',
          icon: '😴',
          title: 'Sueño registrado',
          subtitle: `${formatMinutesToText(s.durationMinutes)} (Dormido: ${s.bedTime} → ${s.wakeTime})`,
          category: 'sueño',
          rawDate: s.date
        });
      }
    });

    // 4. Appointments
    (data.appointments || []).forEach(a => {
      events.push({
        id: `timeline_apt_${a.id}`,
        date: a.date,
        time: a.startTime,
        icon: '🩺',
        title: `Consulta Médica: ${a.title}`,
        subtitle: `${a.specialty} ${a.doctor ? '| Dr(a). ' + a.doctor : ''} (${a.status || 'Programada'})`,
        category: 'cita',
        rawDate: a.date
      });
    });

    // 5. Medical Exams
    (data.medicalExams || []).forEach(e => {
      events.push({
        id: `timeline_ex_${e.id}`,
        date: e.date,
        time: '09:00',
        icon: '🔬',
        title: `Examen: ${e.name}`,
        subtitle: `Resultado: ${e.resultSummary || e.status || 'Completado'} ${e.doctor ? '| Dr. ' + e.doctor : ''}`,
        category: 'examen',
        rawDate: e.date
      });
    });

    // 6. Immunizations
    (data.immunizations || []).forEach(v => {
      const dateToUse = v.lastApplicationDate || (v.applicationDates && v.applicationDates[0]) || '2026-08-01';
      events.push({
        id: `timeline_vac_${v.id}`,
        date: dateToUse,
        time: '10:00',
        icon: '💉',
        title: `Vacuna: ${v.name}`,
        subtitle: `Dosis ${v.dosesReceived} de ${v.dosesRequired} (${v.preventsDisease || 'Inmunización'})`,
        category: 'vacuna',
        rawDate: dateToUse
      });
    });

    // 7. Activity Logs
    (data.activityLogs || []).forEach(act => {
      events.push({
        id: `timeline_act_${act.id}`,
        date: act.date,
        time: act.time || '17:00',
        icon: '🏃',
        title: `Actividad: ${act.type}`,
        subtitle: `${act.minutes ? act.minutes + ' min' : ''} ${act.steps ? act.steps + ' pasos' : ''} ${act.notes ? '• ' + act.notes : ''}`,
        category: 'actividad',
        rawDate: act.date
      });
    });

    // 8. Heart Rate Logs
    (data.heartRateLogs || []).forEach(hr => {
      events.push({
        id: `timeline_hr_${hr.id}`,
        date: hr.date,
        time: hr.time,
        icon: '❤️',
        title: 'Frecuencia Cardíaca',
        subtitle: `${hr.bpm} BPM (${hr.context || 'Medición'})`,
        category: 'corazon',
        rawDate: hr.date
      });
    });

    // Sort descending by date
    return events.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));
  }
};

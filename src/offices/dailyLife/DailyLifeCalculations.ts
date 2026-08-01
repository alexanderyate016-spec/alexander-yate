import { DailyLifeOfficeData, HabitItem } from '../../types/store';

export interface FreeTimeGap {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  label: string;
}

export interface DayProgressSummary {
  overallPercent: number;
  habitsCompleted: number;
  habitsTotal: number;
  habitsPercent: number;
  tasksCompleted: number;
  tasksTotal: number;
  tasksPercent: number;
  objectivesCompleted: number;
  objectivesTotal: number;
  objectivesPercent: number;
  routinesCompleted: number;
  routinesTotal: number;
  routinesPercent: number;
  totalActivities: number;
  completedActivities: number;
}

export interface WorkloadMetrics {
  totalMinutesPlanned: number;
  formattedTime: string;
  pendingTasksCount: number;
  totalTasksCount: number;
  level: 'Ligera' | 'Óptima' | 'Exigente' | 'Intensa';
  badgeColor: 'emerald' | 'amber' | 'purple' | 'rose';
  description: string;
}

export const DailyLifeCalculations = {
  calculateHabitStreak(habit: HabitItem, todayStr: string): number {
    if (!habit.logs) return 0;
    let streak = 0;
    let current = new Date(todayStr + 'T12:00:00');

    while (true) {
      const dateKey = current.toISOString().split('T')[0];
      if (habit.logs[dateKey]) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        // If today is not checked yet, check yesterday to continue streak
        if (dateKey === todayStr) {
          current.setDate(current.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  },

  calculateHabitComplianceToday(data: DailyLifeOfficeData, todayStr: string): { completed: number; total: number; percent: number } {
    const habits = data?.habits || [];
    const total = habits.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    let completed = 0;
    habits.forEach(h => {
      if (h.logs && h.logs[todayStr]) completed++;
    });

    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100)
    };
  },

  calculateTimeDistributionToday(data: DailyLifeOfficeData, dateStr: string): Record<string, number> {
    const dist: Record<string, number> = {
      estudio: 0,
      desplazamiento: 0,
      alimentacion: 0,
      descanso: 0,
      gimnasio: 0,
      personal: 0
    };

    const timePlans = data?.timePlans || [];
    const todayPlans = timePlans.filter(p => p.date === dateStr);
    todayPlans.forEach(p => {
      if (p.category === 'study') dist.estudio += p.durationMinutes;
      else if (p.category === 'commute') dist.desplazamiento += p.durationMinutes;
      else if (['lunch', 'breakfast', 'dinner'].includes(p.category)) dist.alimentacion += p.durationMinutes;
      else if (p.category === 'rest' || p.category === 'free_time') dist.descanso += p.durationMinutes;
      else if (p.category === 'gym') dist.gimnasio += p.durationMinutes;
      else dist.personal += p.durationMinutes;
    });

    return dist;
  },

  calculateOverallDayProgress(data: DailyLifeOfficeData, todayStr: string): DayProgressSummary {
    const habits = data?.habits || [];
    const tasks = data?.tasks || [];
    const objectives = data?.objectives || [];
    const routines = data?.routines || [];

    // Habits
    const habitsTotal = habits.length;
    let habitsCompleted = 0;
    habits.forEach(h => {
      if (h.logs && h.logs[todayStr]) habitsCompleted++;
    });
    const habitsPercent = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 100;

    // Tasks today
    const todayTasks = tasks.filter(t => t.date === todayStr || !t.date);
    const tasksTotal = todayTasks.length;
    const tasksCompleted = todayTasks.filter(t => t.status === 'completed').length;
    const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 100;

    // Objectives today
    const todayObjs = objectives.filter(o => o.date === todayStr || !o.date);
    const objectivesTotal = todayObjs.length;
    const objectivesCompleted = todayObjs.filter(o => o.status === 'completed').length;
    const objectivesPercent = objectivesTotal > 0 ? Math.round((objectivesCompleted / objectivesTotal) * 100) : 100;

    // Routines steps today
    let routinesTotal = 0;
    let routinesCompleted = 0;
    routines.forEach(r => {
      (r.steps || []).forEach(s => {
        routinesTotal++;
        if (s.completedToday) routinesCompleted++;
      });
    });
    const routinesPercent = routinesTotal > 0 ? Math.round((routinesCompleted / routinesTotal) * 100) : 100;

    // Combined overall calculation
    const totalActivities = habitsTotal + tasksTotal + objectivesTotal + routinesTotal;
    const completedActivities = habitsCompleted + tasksCompleted + objectivesCompleted + routinesCompleted;

    let overallPercent = 0;
    if (totalActivities > 0) {
      overallPercent = Math.round((completedActivities / totalActivities) * 100);
    } else {
      overallPercent = 0;
    }

    return {
      overallPercent,
      habitsCompleted,
      habitsTotal,
      habitsPercent,
      tasksCompleted,
      tasksTotal,
      tasksPercent,
      objectivesCompleted,
      objectivesTotal,
      objectivesPercent,
      routinesCompleted,
      routinesTotal,
      routinesPercent,
      totalActivities,
      completedActivities
    };
  },

  calculateDailyWorkload(data: DailyLifeOfficeData, todayStr: string): WorkloadMetrics {
    const timePlans = data?.timePlans || [];
    const todayPlans = timePlans.filter(p => p.date === todayStr);
    const totalMinutesPlanned = todayPlans.reduce((sum, p) => sum + (p.durationMinutes || 0), 0);

    const hours = Math.floor(totalMinutesPlanned / 60);
    const mins = totalMinutesPlanned % 60;
    const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const tasks = data?.tasks || [];
    const todayTasks = tasks.filter(t => t.date === todayStr || !t.date);
    const pendingTasksCount = todayTasks.filter(t => t.status === 'pending').length;

    let level: 'Ligera' | 'Óptima' | 'Exigente' | 'Intensa' = 'Óptima';
    let badgeColor: 'emerald' | 'amber' | 'purple' | 'rose' = 'emerald';
    let description = 'Carga de trabajo balanceada y manejable para hoy.';

    if (totalMinutesPlanned < 90 && pendingTasksCount <= 2) {
      level = 'Ligera';
      badgeColor = 'emerald';
      description = 'Tienes suficiente espacio libre y bajo nivel de exigencia.';
    } else if (totalMinutesPlanned <= 240 && pendingTasksCount <= 5) {
      level = 'Óptima';
      badgeColor = 'amber';
      description = 'Ritmo productivo ideal con pausas estructuradas.';
    } else if (totalMinutesPlanned <= 420 || pendingTasksCount <= 8) {
      level = 'Exigente';
      badgeColor = 'purple';
      description = 'Jornada activa de alta productividad. Prioriza tus pausas.';
    } else {
      level = 'Intensa';
      badgeColor = 'rose';
      description = 'Carga elevada. Asegúrate de delegar o reprogramar si es necesario.';
    }

    return {
      totalMinutesPlanned,
      formattedTime,
      pendingTasksCount,
      totalTasksCount: todayTasks.length,
      level,
      badgeColor,
      description
    };
  },

  detectFreeTimeGaps(data: DailyLifeOfficeData, todayStr: string): FreeTimeGap[] {
    const timePlans = (data?.timePlans || [])
      .filter(p => p.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (timePlans.length === 0) {
      return [{
        id: 'gap_full_day',
        startTime: '08:00',
        endTime: '20:00',
        durationMinutes: 720,
        label: 'Tienes todo el día disponible para estructurar tu agenda'
      }];
    }

    const gaps: FreeTimeGap[] = [];
    const dayStartMinutes = 7 * 60 + 30; // 07:30
    const dayEndMinutes = 21 * 60; // 21:00

    const timeToMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const minsToTime = (m: number) => {
      const h = String(Math.floor(m / 60) % 24).padStart(2, '0');
      const min = String(m % 60).padStart(2, '0');
      return `${h}:${min}`;
    };

    let currentCursor = dayStartMinutes;

    timePlans.forEach((plan, idx) => {
      const pStart = timeToMins(plan.startTime);
      const pEnd = timeToMins(plan.endTime);

      if (pStart > currentCursor + 20) {
        // Found gap
        const duration = pStart - currentCursor;
        gaps.push({
          id: `gap_${idx}_${currentCursor}`,
          startTime: minsToTime(currentCursor),
          endTime: minsToTime(pStart),
          durationMinutes: duration,
          label: `${duration} min disponibles entre ${minsToTime(currentCursor)} y ${minsToTime(pStart)}`
        });
      }
      currentCursor = Math.max(currentCursor, pEnd);
    });

    if (dayEndMinutes > currentCursor + 30) {
      const duration = dayEndMinutes - currentCursor;
      gaps.push({
        id: `gap_end_${currentCursor}`,
        startTime: minsToTime(currentCursor),
        endTime: minsToTime(dayEndMinutes),
        durationMinutes: duration,
        label: `${duration} min disponibles al final de la jornada (${minsToTime(currentCursor)} - ${minsToTime(dayEndMinutes)})`
      });
    }

    return gaps;
  }
};

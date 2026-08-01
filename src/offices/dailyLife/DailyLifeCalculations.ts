import { DailyLifeOfficeData, HabitItem } from '../../types/store';

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
    const total = data.habits.length;
    if (total === 0) return { completed: 0, total: 0, percent: 0 };

    let completed = 0;
    data.habits.forEach(h => {
      if (h.logs && h.logs[todayStr]) completed++;
    });

    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100)
    };
  },

  calculateTimeDistributionToday(data: DailyLifeOfficeData, dateStr: string): Record<string, number> {
    // Returns minutes spent per category
    const dist: Record<string, number> = {
      estudio: 0,
      desplazamiento: 0,
      alimentacion: 0,
      descanso: 0,
      gimnasio: 0,
      personal: 0
    };

    const todayPlans = data.timePlans.filter(p => p.date === dateStr);
    todayPlans.forEach(p => {
      if (p.category === 'study') dist.estudio += p.durationMinutes;
      else if (p.category === 'commute') dist.desplazamiento += p.durationMinutes;
      else if (['lunch', 'breakfast', 'dinner'].includes(p.category)) dist.alimentacion += p.durationMinutes;
      else if (p.category === 'rest' || p.category === 'free_time') dist.descanso += p.durationMinutes;
      else if (p.category === 'gym') dist.gimnasio += p.durationMinutes;
      else dist.personal += p.durationMinutes;
    });

    return dist;
  }
};

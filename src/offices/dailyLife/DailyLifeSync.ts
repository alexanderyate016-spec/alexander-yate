import { DailyLifeOfficeData, UnifiedExecutiveEvent } from '../../types/store';

export const DailyLifeSync = {
  projectDailyLifeEvents(data: DailyLifeOfficeData, targetDateStr: string): UnifiedExecutiveEvent[] {
    const events: UnifiedExecutiveEvent[] = [];

    // 1. Timed Tasks
    (data?.tasks || []).forEach(task => {
      if (task.date === targetDateStr && task.startTime && task.status === 'pending') {
        events.push({
          id: `dl_task_${task.id}`,
          sourceOffice: 'vidaDiaria',
          officeLabel: 'Oficina de Vida Diaria',
          color: '#10B981',
          title: `Tarea: ${task.name}`,
          subtitle: task.description || `Prioridad: ${task.priority}`,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime || task.startTime,
          type: 'task',
          priority: task.priority,
          rawObject: task
        });
      }
    });

    // 2. Time Plans
    (data?.timePlans || []).forEach(plan => {
      if (plan.date === targetDateStr) {
        events.push({
          id: `dl_tpl_${plan.id}`,
          sourceOffice: 'vidaDiaria',
          officeLabel: 'Oficina de Vida Diaria',
          color: plan.color || '#F59E0B',
          title: `Planificación: ${plan.title}`,
          subtitle: `Categoría: ${plan.category} (${plan.durationMinutes} mins)`,
          date: plan.date,
          startTime: plan.startTime,
          endTime: plan.endTime,
          type: 'time_plan',
          rawObject: plan
        });
      }
    });

    return events;
  }
};

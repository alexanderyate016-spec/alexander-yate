import { storeInstance } from '../../store/CasaBlancaStore';
import { DailyLifeOfficeData, HabitItem, DailyTask, RoutineItem, DailyObjective, TimePlan } from '../../types/store';

export const DailyLifeStore = {
  getData(): DailyLifeOfficeData {
    return storeInstance.getState().offices.vidaDiaria;
  },

  // HABITS
  addHabit(habit: Omit<HabitItem, 'id' | 'logs'>) {
    storeInstance.updateState(draft => {
      const id = 'hab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaDiaria.habits.push({ ...habit, id, logs: {} });
    });
  },

  toggleHabitLog(habitId: string, dateStr: string) {
    storeInstance.updateState(draft => {
      const h = draft.offices.vidaDiaria.habits.find(item => item.id === habitId);
      if (h) {
        if (!h.logs) h.logs = {};
        h.logs[dateStr] = !h.logs[dateStr];
      }
    });
  },

  deleteHabit(habitId: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaDiaria.habits = draft.offices.vidaDiaria.habits.filter(h => h.id !== habitId);
    });
  },

  // TASKS
  addTask(task: Omit<DailyTask, 'id' | 'status'>) {
    storeInstance.updateState(draft => {
      const id = 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaDiaria.tasks.push({ ...task, id, status: 'pending' });
    });
  },

  toggleTaskStatus(taskId: string) {
    storeInstance.updateState(draft => {
      const t = draft.offices.vidaDiaria.tasks.find(item => item.id === taskId);
      if (t) {
        t.status = t.status === 'pending' ? 'completed' : 'pending';
      }
    });
  },

  deleteTask(taskId: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaDiaria.tasks = draft.offices.vidaDiaria.tasks.filter(t => t.id !== taskId);
    });
  },

  // ROUTINES
  addRoutine(routine: Omit<RoutineItem, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'rtn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaDiaria.routines.push({ ...routine, id });
    });
  },

  toggleRoutineStep(routineId: string, stepId: string) {
    storeInstance.updateState(draft => {
      const r = draft.offices.vidaDiaria.routines.find(item => item.id === routineId);
      if (r) {
        const step = r.steps.find(s => s.id === stepId);
        if (step) {
          step.completedToday = !step.completedToday;
        }
      }
    });
  },

  deleteRoutine(routineId: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaDiaria.routines = draft.offices.vidaDiaria.routines.filter(r => r.id !== routineId);
    });
  },

  // OBJECTIVES
  addObjective(obj: Omit<DailyObjective, 'id' | 'status'>) {
    storeInstance.updateState(draft => {
      const id = 'obj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaDiaria.objectives.push({ ...obj, id, status: 'pending' });
    });
  },

  toggleObjective(objId: string) {
    storeInstance.updateState(draft => {
      const o = draft.offices.vidaDiaria.objectives.find(item => item.id === objId);
      if (o) {
        o.status = o.status === 'completed' ? 'pending' : 'completed';
      }
    });
  },

  deleteObjective(objId: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaDiaria.objectives = draft.offices.vidaDiaria.objectives.filter(o => o.id !== objId);
    });
  },

  // TIME PLANS
  addTimePlan(plan: Omit<TimePlan, 'id' | 'endTime'>) {
    storeInstance.updateState(draft => {
      const id = 'tpl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      
      // Calculate endTime from startTime + durationMinutes
      const [h, m] = plan.startTime.split(':').map(Number);
      const totalMins = h * 60 + m + plan.durationMinutes;
      const endH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
      const endM = String(totalMins % 60).padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      draft.offices.vidaDiaria.timePlans.push({ ...plan, id, endTime });
    });
  },

  deleteTimePlan(planId: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaDiaria.timePlans = draft.offices.vidaDiaria.timePlans.filter(p => p.id !== planId);
    });
  }
};

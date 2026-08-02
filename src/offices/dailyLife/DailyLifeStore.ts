import { storeInstance } from '../../store/CasaBlancaStore';
import { DailyLifeOfficeData, HabitItem, DailyTask, RoutineItem, DailyObjective, TimePlan } from '../../types/store';
import { getTodayDateString } from '../../utils/dates';
import { DailyLifeCalculations } from './DailyLifeCalculations';

export const DailyLifeStore = {
  getData(): DailyLifeOfficeData {
    this.checkAndApplyDailyReset();
    return storeInstance.getState().offices.vidaDiaria;
  },

  checkAndApplyDailyReset() {
    const todayStr = getTodayDateString();
    const currentData = storeInstance.getState().offices.vidaDiaria;
    const lastActiveDate = currentData.lastActiveDate;

    if (!lastActiveDate) {
      storeInstance.updateState(draft => {
        draft.offices.vidaDiaria.lastActiveDate = todayStr;
      });
      return;
    }

    if (lastActiveDate !== todayStr) {
      storeInstance.updateState(draft => {
        const data = draft.offices.vidaDiaria;
        const userName = draft.security?.profile?.name || draft.settings?.profileName || 'Alex';

        // 1. Calculate and save history record for lastActiveDate
        const historyRecord = DailyLifeCalculations.getHistoryDetailForDate(data, lastActiveDate);

        if (!data.dailyHistory) data.dailyHistory = [];
        
        const existingIdx = data.dailyHistory.findIndex(r => r.date === lastActiveDate);
        if (existingIdx >= 0) {
          data.dailyHistory[existingIdx] = historyRecord;
        } else {
          data.dailyHistory.unshift(historyRecord);
        }

        // 2. Reset daily completion states
        // Routines step completions reset for today
        (data.routines || []).forEach(routine => {
          (routine.steps || []).forEach(step => {
            step.completedToday = false;
          });
        });

        // Daily objectives reset for new day
        (data.objectives || []).forEach(obj => {
          if (obj.date === lastActiveDate) {
            obj.status = 'pending';
            obj.progressPercent = 0;
            obj.date = todayStr;
          }
        });

        // Tasks for today reset pending
        (data.tasks || []).forEach(task => {
          if (!task.date || task.date === todayStr) {
            task.status = 'pending';
            if (task.checklist) {
              task.checklist.forEach(c => { c.completed = false; });
            }
          }
        });

        // 3. Update lastActiveDate
        data.lastActiveDate = todayStr;

        // 4. Welcome Message
        const yesterdayScore = historyRecord.overallCompliancePercent;
        data.welcomeMessage = {
          dateStr: todayStr,
          text: `Buenos días, ${userName}. Comienza un nuevo día. Tu progreso de ayer fue del ${yesterdayScore}%. ¡Mucho éxito hoy!`,
          yesterdayScore,
          dismissed: false
        };
      });
    }
  },

  dismissWelcomeMessage() {
    storeInstance.updateState(draft => {
      if (draft.offices.vidaDiaria.welcomeMessage) {
        draft.offices.vidaDiaria.welcomeMessage.dismissed = true;
      }
    });
  },

  // HABITS
  addHabit(habit: Omit<HabitItem, 'id' | 'logs'>) {
    storeInstance.updateState(draft => {
      const id = 'hab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.vidaDiaria.habits.push({ ...habit, id, logs: {} });
    });
  },

  updateHabit(habitId: string, habitData: Partial<HabitItem>) {
    storeInstance.updateState(draft => {
      const h = draft.offices.vidaDiaria.habits.find(item => item.id === habitId);
      if (h) {
        Object.assign(h, habitData);
      }
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

  updateTask(taskId: string, taskData: Partial<DailyTask>) {
    storeInstance.updateState(draft => {
      const t = draft.offices.vidaDiaria.tasks.find(item => item.id === taskId);
      if (t) {
        Object.assign(t, taskData);
      }
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

  updateRoutine(routineId: string, routineData: Partial<RoutineItem>) {
    storeInstance.updateState(draft => {
      const r = draft.offices.vidaDiaria.routines.find(item => item.id === routineId);
      if (r) {
        Object.assign(r, routineData);
      }
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

  updateObjective(objId: string, objData: Partial<DailyObjective>) {
    storeInstance.updateState(draft => {
      const o = draft.offices.vidaDiaria.objectives.find(item => item.id === objId);
      if (o) {
        Object.assign(o, objData);
      }
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
      
      const [h, m] = plan.startTime.split(':').map(Number);
      const totalMins = h * 60 + m + plan.durationMinutes;
      const endH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
      const endM = String(totalMins % 60).padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      draft.offices.vidaDiaria.timePlans.push({ ...plan, id, endTime });
    });
  },

  updateTimePlan(planId: string, planData: Partial<TimePlan>) {
    storeInstance.updateState(draft => {
      const p = draft.offices.vidaDiaria.timePlans.find(item => item.id === planId);
      if (p) {
        Object.assign(p, planData);
        if (p.startTime && p.durationMinutes) {
          const [h, m] = p.startTime.split(':').map(Number);
          const totalMins = h * 60 + m + p.durationMinutes;
          const endH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
          const endM = String(totalMins % 60).padStart(2, '0');
          p.endTime = `${endH}:${endM}`;
        }
      }
    });
  },

  deleteTimePlan(planId: string) {
    storeInstance.updateState(draft => {
      draft.offices.vidaDiaria.timePlans = draft.offices.vidaDiaria.timePlans.filter(p => p.id !== planId);
    });
  }
};

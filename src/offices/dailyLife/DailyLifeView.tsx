import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DailyLifeOfficeData,
  PersonalDevOfficeData,
  HabitItem,
  DailyTask,
  RoutineItem,
  DailyObjective
} from '../../types/store';
import { storeInstance } from '../../store/CasaBlancaStore';
import { DailyLifeStore } from './DailyLifeStore';
import { PersonalDevStore } from '../personalDev/PersonalDevStore';
import { DailyLifeCalculations } from './DailyLifeCalculations';
import { getTodayDateString } from '../../utils/dates';

// Subcomponents
import { DailyGreetingHeader } from './components/DailyGreetingHeader';
import { DailyGoalCard } from './components/DailyGoalCard';
import { DailyProgressFinch } from './components/DailyProgressFinch';
import { HabitsSection } from './components/HabitsSection';
import { DailyTasksSection } from './components/DailyTasksSection';
import { RoutinesTimeline } from './components/RoutinesTimeline';
import { MoodCheckin } from './components/MoodCheckin';
import { DailyJournalSection } from './components/DailyJournalSection';
import { LearningMemoriesSection } from './components/LearningMemoriesSection';
import { GrowthAreasSection } from './components/GrowthAreasSection';
import { PersonalHistoryTimeline } from './components/PersonalHistoryTimeline';

import {
  Sparkles,
  Heart,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  Feather,
  BookOpen,
  Compass
} from 'lucide-react';

interface Props {
  data?: DailyLifeOfficeData;
}

export const DailyLifeView: React.FC<Props> = ({ data }) => {
  const todayStr = getTodayDateString();

  // Reactive state from CasaBlanca Store
  const [lifeData, setLifeData] = useState<DailyLifeOfficeData>(() => data || DailyLifeStore.getData());
  const [devData, setDevData] = useState<PersonalDevOfficeData>(() => PersonalDevStore.getData());

  useEffect(() => {
    // Apply daily reset safely in effect
    try {
      DailyLifeStore.checkAndApplyDailyReset();
    } catch (e) {
      console.error('Error applying daily reset:', e);
    }

    const unsubscribe = storeInstance.subscribe(() => {
      setLifeData(DailyLifeStore.getData());
      setDevData(PersonalDevStore.getData());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (data) {
      setLifeData(data);
    }
  }, [data]);

  const userName = storeInstance.getState()?.security?.profile?.name || storeInstance.getState()?.settings?.profileName || 'Alex';

  // 1. Calculations for Today
  const habits = lifeData?.habits || [];
  const tasks = lifeData?.tasks || [];
  const routines = lifeData?.routines || [];
  const objectives = lifeData?.objectives || [];
  const todayGoal = objectives.find(o => o.date === todayStr) || null;

  // Habits count
  const completedHabitsCount = habits.filter(h => h.logs && h.logs[todayStr]).length;
  const totalHabitsCount = habits.length;

  // Tasks count
  const todayTasks = tasks.filter(t => t.date === todayStr || !t.date);
  const completedTasksCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = todayTasks.length;

  // Goal count
  const goalCount = todayGoal ? 1 : 0;
  const goalCompletedCount = todayGoal?.status === 'completed' ? 1 : 0;

  // Total daily activities
  const totalActivities = totalHabitsCount + totalTasksCount + goalCount;
  const completedActivities = completedHabitsCount + completedTasksCount + goalCompletedCount;

  // Streak Calculation
  const currentStreak = useMemo(() => {
    if (habits.length === 0) return 1;
    let maxStreak = 0;
    habits.forEach(h => {
      const s = DailyLifeCalculations.calculateHabitStreak(h, todayStr);
      if (s > maxStreak) maxStreak = s;
    });
    return maxStreak || 1;
  }, [habits, todayStr]);

  // Today's journal entry
  const todayJournalEntry = devData?.journalEntries?.find(e => e.date === todayStr);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 px-3 sm:px-6 animate-fade-in">
      {/* 1. DYNAMIC HEADER & GREETING */}
      <DailyGreetingHeader
        userName={userName}
        habitsCompletedToday={completedHabitsCount}
        totalHabits={totalHabitsCount}
        currentStreak={currentStreak}
      />

      {/* 2. MI DÍA - TOP FOCUS (Meta Principal & Progreso Finch) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-7">
          <DailyGoalCard goal={todayGoal} todayStr={todayStr} />
        </div>
        <div className="md:col-span-5">
          <DailyProgressFinch
            completedCount={completedActivities}
            totalCount={totalActivities}
            currentStreak={currentStreak}
          />
        </div>
      </div>

      {/* 3. DIMENSIÓN 1: 🟠 GESTIÓN DE MI VIDA (Hábitos, tareas, metas, rutinas, progreso) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
            🟠
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Gestión de mi vida
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hábitos · Tareas diarias · Metas del día · Rutinas · Progreso · Rachas
            </p>
          </div>
        </div>

        {/* Hábitos de hoy */}
        <HabitsSection
          habits={habits}
          todayStr={todayStr}
          userName={userName}
        />

        {/* Tareas de hoy */}
        <DailyTasksSection
          tasks={tasks}
          todayStr={todayStr}
        />

        {/* Mi rutina */}
        <RoutinesTimeline
          routines={routines}
          todayStr={todayStr}
        />
      </section>

      {/* 4. DIMENSIÓN 2: 🌱 DESARROLLO DE MI VIDA (Diario, reflexiones, estado de ánimo, aprendizajes, crecimiento, historia) */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            🌱
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Desarrollo de mi vida
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Diario personal · Reflexiones · Estado de ánimo · Aprendizajes · Crecimiento personal · Historia personal
            </p>
          </div>
        </div>

        {/* ¿Cómo estás? (Estado de Ánimo Check-in) */}
        <MoodCheckin
          todayEntry={todayJournalEntry}
          todayStr={todayStr}
        />

        {/* Mi Diario Personal */}
        <DailyJournalSection
          todayEntry={todayJournalEntry}
          todayStr={todayStr}
          userName={userName}
        />

        {/* Lo que aprendí */}
        <LearningMemoriesSection
          lessons={devData?.lifeLessons || []}
          todayStr={todayStr}
        />

        {/* En qué estoy creciendo (Áreas de Crecimiento) */}
        <GrowthAreasSection
          objectives={devData?.growthObjectives || []}
        />

        {/* Mi Historia (Memoria Personal) */}
        <PersonalHistoryTimeline
          journalEntries={devData?.journalEntries || []}
          lifeLessons={devData?.lifeLessons || []}
          dailyHistory={lifeData?.dailyHistory || []}
        />
      </section>
    </div>
  );
};

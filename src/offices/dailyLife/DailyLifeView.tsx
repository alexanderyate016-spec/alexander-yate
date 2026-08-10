import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DailyLifeOfficeData,
  HabitItem,
  DailyTask,
  RoutineItem,
  RoutineStep,
  DailyHistoryRecord,
  BaseScheduleConfig
} from '../../types/store';
import { DailyLifeStore } from './DailyLifeStore';
import { DailyLifeCalculations } from './DailyLifeCalculations';
import { getTodayDateString } from '../../utils/dates';
import {
  GlassPanel,
  ExecutiveButton,
  ExecutiveBadge,
  ExecutiveModal,
  ExecutiveInput,
  ExecutiveForm,
  showToast
} from '../../components/executive';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Calendar,
  Send,
  Check,
  RotateCcw,
  History,
  TrendingUp,
  AlertCircle,
  X,
  Smile,
  ChevronRight,
  Info
} from 'lucide-react';

interface Props {
  data: DailyLifeOfficeData;
}

// Preset Emojis for Habit Creation
const HABIT_EMOJIS = ['📖', '💧', '🏋️', '🧘', '🏃', '📚', '🥗', '🧘‍♂️', '🎨', '✍️', '🛌', '🚶', '🍏', '💻', '🧠'];

export const DailyLifeView: React.FC<Props> = ({ data }) => {
  const todayStr = getTodayDateString();

  // Selected date for viewing history detail
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  // Modal States
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  const [showBaseScheduleModal, setShowBaseScheduleModal] = useState(false);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [showAddStepModalRoutineId, setShowAddStepModalRoutineId] = useState<string | null>(null);

  // Form State - Habit
  const [habitForm, setHabitForm] = useState({
    name: '',
    emoji: '📖',
    frequency: 'daily' as 'daily' | 'weekdays' | 'custom',
    targetDays: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
    scheduledTime: '',
    description: ''
  });

  // Form State - Task
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    date: todayStr,
    sendToChiefOfStaff: false
  });
  const [quickTaskInput, setQuickTaskInput] = useState('');

  // Form State - Base Schedule
  const [baseScheduleForm, setBaseScheduleForm] = useState<BaseScheduleConfig>({
    wakeUpTime: data?.baseSchedule?.wakeUpTime || '06:30',
    breakfastTime: data?.baseSchedule?.breakfastTime || '07:00',
    lunchTime: data?.baseSchedule?.lunchTime || '12:30',
    dinnerTime: data?.baseSchedule?.dinnerTime || '19:30',
    sleepTime: data?.baseSchedule?.sleepTime || '23:00'
  });

  // Form State - Routine
  const [routineForm, setRoutineForm] = useState({
    name: '',
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening',
    emoji: '☀️',
    initialSteps: ['']
  });

  const [newStepTitle, setNewStepTitle] = useState('');

  // Ensures store defaults
  React.useEffect(() => {
    DailyLifeStore.ensureDefaultData();
  }, []);

  // Today calculations
  const progressSummary = useMemo(() => {
    return DailyLifeCalculations.calculateOverallDayProgress(data, todayStr);
  }, [data, todayStr]);

  const historyRecords = useMemo(() => {
    return DailyLifeCalculations.getUnifiedHistory(data);
  }, [data]);

  // Streak calculation
  const streakDays = useMemo(() => {
    let streak = 0;
    const habits = data?.habits || [];
    if (habits.length === 0) return 0;

    let current = new Date(todayStr + 'T12:00:00');
    while (true) {
      const dateKey = current.toISOString().split('T')[0];
      const completedAny = habits.some(h => h.logs && h.logs[dateKey]);
      if (completedAny) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        if (dateKey === todayStr) {
          current.setDate(current.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return Math.max(streak, 1);
  }, [data, todayStr]);

  // Today's Habits
  const todayHabits = useMemo(() => {
    return (data?.habits || []).map(h => {
      const isCompleted = Boolean(h.logs && h.logs[todayStr]);
      return { ...h, isCompleted };
    });
  }, [data, todayStr]);

  // All habits completed flag
  const allHabitsCompleted = useMemo(() => {
    if (todayHabits.length === 0) return false;
    return todayHabits.every(h => h.isCompleted);
  }, [todayHabits]);

  // Today's Tasks vs Overdue vs Future
  const todayTasks = useMemo(() => {
    return (data?.tasks || []).filter(t => t.date === todayStr || (!t.date && todayStr));
  }, [data, todayStr]);

  const overdueTasks = useMemo(() => {
    return (data?.tasks || []).filter(t => t.date && t.date < todayStr && t.status === 'pending');
  }, [data, todayStr]);

  const futureTasksCount = useMemo(() => {
    return (data?.tasks || []).filter(t => t.date && t.date > todayStr && t.status === 'pending').length;
  }, [data, todayStr]);

  // Motivational message generator
  const motivationalMessage = useMemo(() => {
    const percent = progressSummary.overallPercent;
    if (percent === 100) {
      return {
        title: '🎉 ¡Excelente!',
        text: 'Completaste todo lo que te propusiste hoy. Tu disciplina da frutos.',
        badge: 'Día Completo'
      };
    }
    if (percent >= 75) {
      return {
        title: '🔥 ¡Gran constancia!',
        text: 'Estás muy cerca de completar tu día. Mantén el ritmo.',
        badge: `${streakDays} días consecutivos`
      };
    }
    if (percent >= 30) {
      return {
        title: '💪 En buen camino',
        text: 'Cada pequeño paso suma. Avanza con tu siguiente hábito o tarea.',
        badge: 'Progreso en marcha'
      };
    }
    return {
      title: '🌿 Empieza por una cosa',
      text: 'Completar una pequeña tarea o hábito también cuenta. Da el primer paso hoy.',
      badge: 'Nuevo Comienzo'
    };
  }, [progressSummary.overallPercent, streakDays]);

  // Formatted date string
  const formattedTodayDate = useMemo(() => {
    const dateObj = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const str = dateObj.toLocaleDateString('es-ES', options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  // Handlers - Habit
  const handleToggleHabit = (habitId: string) => {
    DailyLifeStore.toggleHabitLog(habitId, todayStr);
  };

  const handleOpenAddHabit = () => {
    setEditingHabit(null);
    setHabitForm({
      name: '',
      emoji: '📖',
      frequency: 'daily',
      targetDays: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
      scheduledTime: '',
      description: ''
    });
    setShowAddHabitModal(true);
  };

  const handleOpenEditHabit = (h: HabitItem) => {
    setEditingHabit(h);
    setHabitForm({
      name: h.name,
      emoji: h.emoji || '📖',
      frequency: h.frequency || 'daily',
      targetDays: h.targetDays || ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
      scheduledTime: h.scheduledTime || '',
      description: h.description || ''
    });
    setShowAddHabitModal(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitForm.name.trim()) return;

    if (editingHabit) {
      DailyLifeStore.updateHabit(editingHabit.id, {
        name: habitForm.name.trim(),
        emoji: habitForm.emoji,
        frequency: habitForm.frequency,
        targetDays: habitForm.targetDays,
        scheduledTime: habitForm.scheduledTime || undefined,
        description: habitForm.description.trim() || undefined
      });
      showToast('Hábito actualizado correctamente', 'success');
    } else {
      DailyLifeStore.addHabit({
        name: habitForm.name.trim(),
        emoji: habitForm.emoji,
        color: '#3B82F6',
        frequency: habitForm.frequency,
        targetDays: habitForm.targetDays,
        scheduledTime: habitForm.scheduledTime || undefined,
        description: habitForm.description.trim() || undefined
      });
      showToast('Nuevo hábito creado', 'success');
    }
    setShowAddHabitModal(false);
  };

  const handleDeleteHabit = (id: string) => {
    DailyLifeStore.deleteHabit(id);
    showToast('Hábito eliminado', 'info');
  };

  // Handlers - Task
  const handleToggleTask = (taskId: string) => {
    DailyLifeStore.toggleTaskStatus(taskId);
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;
    DailyLifeStore.addTask({
      name: quickTaskInput.trim(),
      priority: 'medium',
      date: todayStr
    });
    setQuickTaskInput('');
    showToast('Tarea agregada para hoy', 'success');
  };

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      name: '',
      description: '',
      priority: 'medium',
      date: todayStr,
      sendToChiefOfStaff: false
    });
    setShowAddTaskModal(true);
  };

  const handleOpenEditTask = (t: DailyTask) => {
    setEditingTask(t);
    setTaskForm({
      name: t.name,
      description: t.description || '',
      priority: t.priority,
      date: t.date || todayStr,
      sendToChiefOfStaff: Boolean(t.sendToChiefOfStaff)
    });
    setShowAddTaskModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.name.trim()) return;

    if (editingTask) {
      DailyLifeStore.updateTask(editingTask.id, {
        name: taskForm.name.trim(),
        date: todayStr
      });
      showToast('Tarea actualizada', 'success');
    } else {
      DailyLifeStore.addTask({
        name: taskForm.name.trim(),
        priority: 'medium',
        date: todayStr
      });
      showToast('Tarea agregada para hoy', 'success');
    }
    setTaskForm({
      name: '',
      description: '',
      priority: 'medium',
      date: todayStr,
      sendToChiefOfStaff: false
    });
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = (id: string) => {
    DailyLifeStore.deleteTask(id);
    showToast('Tarea eliminada', 'info');
  };

  const handleSendTaskToCabinet = (task: DailyTask) => {
    DailyLifeStore.sendTaskToChiefOfStaff(task);
    showToast(`Solicitado bloque de tiempo a Jefatura para: "${task.name}"`, 'success');
  };

  // Handlers - Routine
  const handleToggleRoutineStep = (routineId: string, stepId: string) => {
    DailyLifeStore.toggleRoutineStep(routineId, stepId);
  };

  const handleSaveBaseSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    DailyLifeStore.updateBaseSchedule(baseScheduleForm);
    setShowBaseScheduleModal(false);
    showToast('Horarios base actualizados', 'success');
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineForm.name.trim()) return;

    const validSteps: RoutineStep[] = routineForm.initialSteps
      .filter(s => s.trim().length > 0)
      .map((s, idx) => ({ id: 'st_' + Date.now() + '_' + idx, title: s.trim(), completedToday: false }));

    DailyLifeStore.addRoutine({
      name: routineForm.name.trim(),
      timeOfDay: routineForm.timeOfDay,
      emoji: routineForm.emoji,
      steps: validSteps.length > 0 ? validSteps : [{ id: 'st_1', title: 'Paso 1', completedToday: false }]
    });

    setShowAddRoutineModal(false);
    showToast('Nueva rutina configurada', 'success');
  };

  const handleAddStepToRoutine = (routineId: string) => {
    if (!newStepTitle.trim()) return;
    const r = data?.routines?.find(item => item.id === routineId);
    if (r) {
      const updatedSteps = [...r.steps, { id: 'st_' + Date.now(), title: newStepTitle.trim(), completedToday: false }];
      DailyLifeStore.updateRoutine(routineId, { steps: updatedSteps });
      setNewStepTitle('');
      setShowAddStepModalRoutineId(null);
      showToast('Paso agregado a la rutina', 'success');
    }
  };

  const handleDeleteRoutine = (routineId: string) => {
    DailyLifeStore.deleteRoutine(routineId);
    showToast('Rutina eliminada', 'info');
  };

  // History detail record
  const selectedHistoryRecord = useMemo(() => {
    if (!selectedHistoryDate) return null;
    return historyRecords.find(r => r.date === selectedHistoryDate) || null;
  }, [selectedHistoryDate, historyRecords]);

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* 1. ENCABEZADO DE OFICINA & DÍA ACTUAL */}
      <GlassPanel className="p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 border-slate-800 text-slate-100 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-emerald-400">
          <Sparkles className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ExecutiveBadge accentColor="gold" variant="subtle">
                <span className="text-base mr-1">🌿</span> GESTIÓN PERSONAL
              </ExecutiveBadge>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{streakDays} {streakDays === 1 ? 'día' : 'días'} de constancia</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formattedTodayDate}
            </h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <span className="italic font-medium text-amber-300/90">"Hoy es el día que importa."</span>
              <span className="text-slate-500">•</span>
              <span>Administración personal cotidiana</span>
            </p>
          </div>

          {/* Target Progress Radial/Bar */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 min-w-[260px] space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="w-4 h-4" /> Progreso de Hoy
              </span>
              <span className="text-lg font-mono text-amber-400 font-extrabold">{progressSummary.overallPercent}%</span>
            </div>

            <div className="w-full bg-slate-700/60 h-3 rounded-full overflow-hidden p-0.5 border border-slate-600/40">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressSummary.overallPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
              <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/40">
                <span className="block text-slate-400">Hábitos</span>
                <span className="font-bold font-mono text-emerald-300">{progressSummary.habitsCompleted}/{progressSummary.habitsTotal}</span>
              </div>
              <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/40">
                <span className="block text-slate-400">Tareas</span>
                <span className="font-bold font-mono text-amber-300">{progressSummary.tasksCompleted}/{progressSummary.tasksTotal}</span>
              </div>
              <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/40">
                <span className="block text-slate-400">Rutinas</span>
                <span className="font-bold font-mono text-indigo-300">{progressSummary.routinesPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 2. MI DÍA: HORARIOS BASE & MOTIVACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Horarios Base Header Card */}
        <GlassPanel className="lg:col-span-2 p-5 bg-white border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                🌅
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Horarios Base Habituales</h3>
                <p className="text-xs text-slate-500">Bloques personales de referencia</p>
              </div>
            </div>
            <ExecutiveButton variant="secondary" onClick={() => setShowBaseScheduleModal(true)}>
              <Clock className="w-3.5 h-3.5 mr-1" /> Editar Horarios
            </ExecutiveButton>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span className="text-base block">🌅</span>
              <span className="text-[11px] text-amber-800 font-medium">Levantarse</span>
              <span className="block font-mono text-xs font-extrabold text-slate-900 mt-0.5">
                {data?.baseSchedule?.wakeUpTime || '06:30'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span className="text-base block">🍳</span>
              <span className="text-[11px] text-amber-800 font-medium">Desayuno</span>
              <span className="block font-mono text-xs font-extrabold text-slate-900 mt-0.5">
                {data?.baseSchedule?.breakfastTime || '07:00'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span className="text-base block">🍽️</span>
              <span className="text-[11px] text-amber-800 font-medium">Almuerzo</span>
              <span className="block font-mono text-xs font-extrabold text-slate-900 mt-0.5">
                {data?.baseSchedule?.lunchTime || '12:30'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span className="text-base block">🍽️</span>
              <span className="text-[11px] text-amber-800 font-medium">Cena</span>
              <span className="block font-mono text-xs font-extrabold text-slate-900 mt-0.5">
                {data?.baseSchedule?.dinnerTime || '19:30'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl sm:col-span-1 col-span-2 bg-indigo-50/60 border border-indigo-200/60">
              <span className="text-base block">🌙</span>
              <span className="text-[11px] text-indigo-800 font-medium">Dormir</span>
              <span className="block font-mono text-xs font-extrabold text-slate-900 mt-0.5">
                {data?.baseSchedule?.sleepTime || '23:00'}
              </span>
            </div>
          </div>
        </GlassPanel>

        {/* Motivational Card */}
        <GlassPanel className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-emerald-500/10 border-amber-200/70 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-600" /> Motivación Inteligente
              </span>
              <ExecutiveBadge accentColor="amber" variant="subtle">{motivationalMessage.badge}</ExecutiveBadge>
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">{motivationalMessage.title}</h4>
            <p className="text-xs text-slate-700 leading-relaxed">{motivationalMessage.text}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/50 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Filosofía del día:</span>
            <span className="font-bold text-amber-900">Pasos pequeños, constancia diaria</span>
          </div>
        </GlassPanel>
      </div>

      {/* 3. COLUMNAS PRINCIPALES: HÁBITOS Y TAREAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECCIÓN 1: 🌱 HÁBITOS DE HOY */}
        <GlassPanel className="p-6 bg-white border-slate-200/80 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Hábitos de hoy</h2>
                <p className="text-xs text-slate-500">Prácticas personales recurrentes</p>
              </div>
            </div>
            <ExecutiveButton variant="primary" onClick={handleOpenAddHabit}>
              <Plus className="w-4 h-4 mr-1" /> Agregar Hábito
            </ExecutiveButton>
          </div>

          {/* Felicitación si completó todos */}
          <AnimatePresence>
            {allHabitsCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 border border-emerald-300 text-emerald-950 flex items-center gap-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xl shadow-md">
                  🎉
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-900">¡Felicidades!</h4>
                  <p className="text-xs text-emerald-800">Completaste todos tus hábitos programados para hoy.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Habit Checklist */}
          {todayHabits.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
              <span className="text-3xl block">🌱</span>
              <p className="text-xs font-medium">No has registrado hábitos aún.</p>
              <ExecutiveButton variant="secondary" onClick={handleOpenAddHabit}>
                + Agregar tu primer hábito
              </ExecutiveButton>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayHabits.map(h => {
                return (
                  <motion.div
                    key={h.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      h.isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                        : 'bg-slate-50/80 border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(h.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                          h.isCompleted
                            ? 'bg-emerald-500 text-white shadow-sm scale-105'
                            : 'border-2 border-slate-300 text-transparent hover:border-emerald-500'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{h.emoji || '🌱'}</span>
                          <span className={`font-bold text-sm truncate ${h.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {h.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {h.scheduledTime && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" /> {h.scheduledTime}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {h.frequency === 'daily'
                              ? 'Todos los días'
                              : h.frequency === 'weekdays'
                              ? 'Lunes a Viernes'
                              : 'Días seleccionados'}
                          </span>
                        </div>
                        {h.description && <p className="text-[11px] text-slate-500 truncate mt-0.5">{h.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditHabit(h)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar hábito"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(h.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar hábito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassPanel>

        {/* SECCIÓN 2: 📋 TAREAS DE HOY */}
        <GlassPanel className="p-6 bg-white border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <div>
                <h2 className="font-bold text-slate-900 text-base uppercase tracking-tight">TAREAS DE HOY</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {progressSummary.tasksCompleted}/{progressSummary.tasksTotal} completadas ({progressSummary.tasksPercent}%)
                </p>
              </div>
            </div>
            <ExecutiveButton variant="primary" onClick={handleOpenAddTask}>
              <Plus className="w-4 h-4 mr-1" /> + Tarea
            </ExecutiveButton>
          </div>

          {/* Quick Task Creation Input */}
          <form onSubmit={handleAddQuickTask} className="flex gap-2">
            <ExecutiveInput
              value={quickTaskInput}
              onChange={e => setQuickTaskInput(e.target.value)}
              placeholder="Ej: Terminar informe de Anatomía"
              className="flex-1"
            />
            <ExecutiveButton type="submit" variant="primary">
              Agregar tarea
            </ExecutiveButton>
          </form>

          {/* Progress Bar */}
          {progressSummary.tasksTotal > 0 && (
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressSummary.tasksPercent === 100
                      ? 'bg-emerald-500'
                      : progressSummary.tasksPercent >= 50
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${progressSummary.tasksPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Celebration Message */}
          {progressSummary.tasksTotal > 0 && progressSummary.tasksCompleted === progressSummary.tasksTotal && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>🎉 ¡Felicidades! Completaste todas tus tareas de hoy.</span>
            </motion.div>
          )}

          {/* Tasks Checklist */}
          {todayTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
              <span className="text-3xl block">📋</span>
              <p className="text-xs font-medium">No hay tareas creadas para hoy.</p>
              <p className="text-[11px] text-slate-400">Escribe arriba o presiona "+ Tarea" para agregar una acción a realizar hoy.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(t => {
                const isCompleted = t.status === 'completed';
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border-2 border-slate-300 text-slate-400 hover:border-slate-700 hover:text-slate-700'
                        }`}
                      >
                        {isCompleted ? '☑' : '☐'}
                      </button>

                      <span className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {t.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassPanel>
      </div>

      {/* 4. RUTINAS PERSONALES (CHECKLIST) */}
      <GlassPanel className="p-6 bg-white border-slate-200/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Mis Rutinas</h2>
              <p className="text-xs text-slate-500">Secuencias personales para mañanas y noches</p>
            </div>
          </div>
          <ExecutiveButton variant="secondary" onClick={() => setShowAddRoutineModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Configurar Rutina
          </ExecutiveButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data?.routines || []).map(r => {
            const totalSteps = r.steps?.length || 0;
            const completedSteps = r.steps?.filter(s => s.completedToday).length || 0;
            const routinePercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            const isFullyCompleted = routinePercent === 100 && totalSteps > 0;

            return (
              <div
                key={r.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isFullyCompleted
                    ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-300'
                    : 'bg-slate-50/60 border-slate-200/90'
                }`}
              >
                <div className="flex justify-between items-center border-b pb-2 border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.emoji || '🔄'}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        {completedSteps}/{totalSteps} Pasos ({routinePercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFullyCompleted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        Completada 🎉
                      </span>
                    )}
                    <button
                      onClick={() => setShowAddStepModalRoutineId(r.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 text-xs flex items-center gap-1 font-medium"
                      title="Agregar paso"
                    >
                      <Plus className="w-3.5 h-3.5" /> Paso
                    </button>
                    <button
                      onClick={() => handleDeleteRoutine(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      title="Eliminar rutina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-1.5">
                  {(r.steps || []).map(st => (
                    <div
                      key={st.id}
                      onClick={() => handleToggleRoutineStep(r.id, st.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between border transition-all ${
                        st.completedToday
                          ? 'bg-emerald-100/60 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100/80'
                      }`}
                    >
                      <span className={st.completedToday ? 'line-through text-slate-500' : ''}>{st.title}</span>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                          st.completedToday ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {st.completedToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adding Step inline form */}
                {showAddStepModalRoutineId === r.id && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                    <ExecutiveInput
                      value={newStepTitle}
                      onChange={e => setNewStepTitle(e.target.value)}
                      placeholder="Nuevo paso de rutina..."
                      className="text-xs h-8"
                    />
                    <ExecutiveButton variant="primary" onClick={() => handleAddStepToRoutine(r.id)} className="h-8 text-xs px-2">
                      Agregar
                    </ExecutiveButton>
                    <button
                      onClick={() => setShowAddStepModalRoutineId(null)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* 5. HISTORIAL DE CUMPLIMIENTO */}
      <GlassPanel className="p-6 bg-white border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-base">Historial Reciente de Cumplimiento</h2>
              <p className="text-xs text-slate-500">El pasado se conserva. Cada día inicia limpio.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {historyRecords.slice(0, 8).map(record => {
            const isToday = record.date === todayStr;
            const percent = record.overallCompliancePercent;

            return (
              <div
                key={record.date}
                onClick={() => setSelectedHistoryDate(record.date)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  isToday
                    ? 'bg-amber-500/10 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xs text-slate-900">
                    {isToday ? 'HOY' : record.dayOfWeek.split(',')[0]}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">{record.date}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono font-extrabold text-slate-800">
                    <span>Cumplimiento</span>
                    <span>{percent}%</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-rose-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                  <span>Hábitos: {record.habitsCount?.completed}/{record.habitsCount?.total}</span>
                  <span>Tareas: {record.tasksCount?.completed}/{record.tasksCount?.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* MODAL: AGREGAR / EDITAR HÁBITO */}
      <ExecutiveModal
        isOpen={showAddHabitModal}
        onClose={() => setShowAddHabitModal(false)}
        title={editingHabit ? 'Editar Hábito' : '🌱 Crear Nuevo Hábito'}
      >
        <ExecutiveForm onSubmit={handleSaveHabit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del hábito</label>
              <ExecutiveInput
                value={habitForm.name}
                onChange={e => setHabitForm({ ...habitForm, name: e.target.value })}
                placeholder="ej. Leer 20 minutos, Tomar agua, Meditar..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emoji representativo</label>
              <div className="flex flex-wrap gap-2">
                {HABIT_EMOJIS.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setHabitForm({ ...habitForm, emoji: e })}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition-all ${
                      habitForm.emoji === e
                        ? 'bg-amber-100 border-amber-500 scale-110 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frecuencia</label>
                <select
                  value={habitForm.frequency}
                  onChange={e =>
                    setHabitForm({
                      ...habitForm,
                      frequency: e.target.value as 'daily' | 'weekdays' | 'custom'
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium"
                >
                  <option value="daily">Todos los días</option>
                  <option value="weekdays">Lunes a Viernes</option>
                  <option value="custom">Días específicos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hora sugerida (opcional)</label>
                <ExecutiveInput
                  type="time"
                  value={habitForm.scheduledTime}
                  onChange={e => setHabitForm({ ...habitForm, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descripción corta (opcional)</label>
              <ExecutiveInput
                value={habitForm.description}
                onChange={e => setHabitForm({ ...habitForm, description: e.target.value })}
                placeholder="ej. Práctica diaria de atención plena"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <ExecutiveButton type="button" variant="secondary" onClick={() => setShowAddHabitModal(false)}>
                Cancelar
              </ExecutiveButton>
              <ExecutiveButton type="submit" variant="primary">
                Guardar Hábito
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>

      {/* MODAL: AGREGAR / EDITAR TAREA */}
      <ExecutiveModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        title={editingTask ? 'Editar Tarea' : '📋 Agregar Tarea'}
      >
        <ExecutiveForm onSubmit={handleSaveTask}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">¿Qué tarea quieres realizar hoy?</label>
              <ExecutiveInput
                value={taskForm.name}
                onChange={e => setTaskForm({ ...taskForm, name: e.target.value })}
                placeholder="Ej: Terminar informe de Anatomía"
                autoFocus
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <ExecutiveButton type="button" variant="secondary" onClick={() => setShowAddTaskModal(false)}>
                Cancelar
              </ExecutiveButton>
              <ExecutiveButton type="submit" variant="primary">
                Agregar tarea
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>

      {/* MODAL: EDITAR HORARIOS BASE */}
      <ExecutiveModal
        isOpen={showBaseScheduleModal}
        onClose={() => setShowBaseScheduleModal(false)}
        title="🌅 Configurar Horarios Base Habituales"
      >
        <ExecutiveForm onSubmit={handleSaveBaseSchedule}>
          <div className="space-y-4">
            <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              Establece tus bloques habituales de descanso y alimentación. Esta información sirve como referencia para la Jefatura de Gabinete al coordinar la agenda diaria.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🌅 Hora de Levantarse</label>
                <ExecutiveInput
                  type="time"
                  value={baseScheduleForm.wakeUpTime}
                  onChange={e => setBaseScheduleForm({ ...baseScheduleForm, wakeUpTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🍳 Hora de Desayuno</label>
                <ExecutiveInput
                  type="time"
                  value={baseScheduleForm.breakfastTime}
                  onChange={e => setBaseScheduleForm({ ...baseScheduleForm, breakfastTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🍽️ Hora de Almuerzo</label>
                <ExecutiveInput
                  type="time"
                  value={baseScheduleForm.lunchTime}
                  onChange={e => setBaseScheduleForm({ ...baseScheduleForm, lunchTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">🍽️ Hora de Cena</label>
                <ExecutiveInput
                  type="time"
                  value={baseScheduleForm.dinnerTime}
                  onChange={e => setBaseScheduleForm({ ...baseScheduleForm, dinnerTime: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">🌙 Hora habitual de ir a Dormir</label>
                <ExecutiveInput
                  type="time"
                  value={baseScheduleForm.sleepTime}
                  onChange={e => setBaseScheduleForm({ ...baseScheduleForm, sleepTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <ExecutiveButton type="button" variant="secondary" onClick={() => setShowBaseScheduleModal(false)}>
                Cancelar
              </ExecutiveButton>
              <ExecutiveButton type="submit" variant="primary">
                Guardar Horarios
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>

      {/* MODAL: CONFIGURAR NUEVA RUTINA */}
      <ExecutiveModal
        isOpen={showAddRoutineModal}
        onClose={() => setShowAddRoutineModal(false)}
        title="🔄 Configurar Nueva Rutina"
      >
        <ExecutiveForm onSubmit={handleCreateRoutine}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Rutina</label>
              <ExecutiveInput
                value={routineForm.name}
                onChange={e => setRoutineForm({ ...routineForm, name: e.target.value })}
                placeholder="ej. Rutina de Mañana, Rutina de Noche..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Momento del día</label>
                <select
                  value={routineForm.timeOfDay}
                  onChange={e =>
                    setRoutineForm({
                      ...routineForm,
                      timeOfDay: e.target.value as 'morning' | 'afternoon' | 'evening'
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium"
                >
                  <option value="morning">Mañana ☀️</option>
                  <option value="afternoon">Tarde 🌤️</option>
                  <option value="evening">Noche 🌙</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emoji</label>
                <ExecutiveInput
                  value={routineForm.emoji}
                  onChange={e => setRoutineForm({ ...routineForm, emoji: e.target.value })}
                  placeholder="☀️"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pasos iniciales</label>
              <div className="space-y-2">
                {routineForm.initialSteps.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ExecutiveInput
                      value={s}
                      onChange={e => {
                        const updated = [...routineForm.initialSteps];
                        updated[idx] = e.target.value;
                        setRoutineForm({ ...routineForm, initialSteps: updated });
                      }}
                      placeholder={`Paso ${idx + 1}`}
                    />
                  </div>
                ))}
                <ExecutiveButton
                  type="button"
                  variant="secondary"
                  onClick={() => setRoutineForm({ ...routineForm, initialSteps: [...routineForm.initialSteps, ''] })}
                  className="text-xs"
                >
                  + Agregar otro paso
                </ExecutiveButton>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <ExecutiveButton type="button" variant="secondary" onClick={() => setShowAddRoutineModal(false)}>
                Cancelar
              </ExecutiveButton>
              <ExecutiveButton type="submit" variant="primary">
                Crear Rutina
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>

      {/* MODAL: DETALLE HISTÓRICO DE DÍA ANTERIOR */}
      <ExecutiveModal
        isOpen={Boolean(selectedHistoryDate)}
        onClose={() => setSelectedHistoryDate(null)}
        title={`📈 Registro Histórico — ${selectedHistoryRecord?.date || ''}`}
      >
        {selectedHistoryRecord && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-3 rounded-xl bg-slate-900 text-slate-100 flex justify-between items-center">
              <div>
                <span className="font-bold text-sm block">{selectedHistoryRecord.dayOfWeek}</span>
                <span className="text-slate-400 text-xs">Cumplimiento General</span>
              </div>
              <span className="text-2xl font-mono font-extrabold text-amber-400">
                {selectedHistoryRecord.overallCompliancePercent}%
              </span>
            </div>

            {/* Hábitos en esa fecha */}
            <div className="space-y-1.5 border-t pt-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <span>🌱</span> Hábitos del Día
              </h4>
              <div className="space-y-1">
                {(selectedHistoryRecord.habitsDetail || []).map(hd => (
                  <div
                    key={hd.id}
                    className={`p-2 rounded-lg flex items-center justify-between border ${
                      hd.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span>{hd.name}</span>
                    <span className="font-bold">{hd.completed ? '☑ Completado' : '☐ Pendiente'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tareas en esa fecha */}
            <div className="space-y-2 border-t pt-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span>📋</span> Tareas del Día ({selectedHistoryRecord.tasksCount?.completed || 0}/{selectedHistoryRecord.tasksCount?.total || 0})</span>
                <span className="text-slate-600 font-mono text-[11px] font-bold">{selectedHistoryRecord.tasksCount?.percent || 0}% cumplimiento</span>
              </h4>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 pb-1.5 border-b border-slate-200">
                  <span>Total: {selectedHistoryRecord.tasksCount?.total || 0}</span>
                  <span className="text-emerald-700">Completadas: {selectedHistoryRecord.tasksCount?.completed || 0}</span>
                  <span className="text-rose-700">No completadas: {(selectedHistoryRecord.tasksCount?.total || 0) - (selectedHistoryRecord.tasksCount?.completed || 0)}</span>
                </div>
                <div className="space-y-1">
                  {(selectedHistoryRecord.tasksDetail || []).length === 0 ? (
                    <p className="text-slate-400 text-[11px]">Sin tareas registradas en esta fecha.</p>
                  ) : (
                    (selectedHistoryRecord.tasksDetail || []).map(td => (
                      <div
                        key={td.id}
                        className={`p-2 rounded-lg flex items-center justify-between border ${
                          td.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className={`text-xs font-medium ${td.completed ? 'line-through text-slate-500' : ''}`}>
                          {td.completed ? '☑ ' : '☐ '} {td.name}
                        </span>
                        <span className={`text-[10px] font-bold ${td.completed ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {td.completed ? 'Completada' : 'No completada'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <ExecutiveButton variant="secondary" onClick={() => setSelectedHistoryDate(null)}>
                Cerrar
              </ExecutiveButton>
            </div>
          </div>
        )}
      </ExecutiveModal>
    </div>
  );
};

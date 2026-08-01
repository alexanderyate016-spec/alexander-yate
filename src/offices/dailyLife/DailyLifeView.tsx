import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyLifeOfficeData, HabitItem, DailyTask, DailyObjective, TimePlan, RoutineItem } from '../../types/store';
import { DailyLifeStore } from './DailyLifeStore';
import { DailyLifeCalculations, FreeTimeGap } from './DailyLifeCalculations';
import { getTodayDateString } from '../../utils/dates';
import {
  GlassPanel,
  ExecutiveButton,
  ExecutiveSectionHeader,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveForm,
  ExecutiveModal
} from '../../components/executive';
import {
  Flame,
  Clock,
  Plus,
  Trash2,
  Target,
  Activity,
  Check,
  Zap,
  Coffee,
  BookOpen,
  Sparkles,
  TrendingUp,
  X,
  Layers,
  CheckSquare,
  Edit2
} from 'lucide-react';

interface Props {
  data: DailyLifeOfficeData;
}

// Discrete Toast Notification
interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

// Animated Progress Bar with Liquid Glow
const AnimatedProgressBar: React.FC<{ percent: number; color?: 'amber' | 'emerald' | 'purple' | 'gold'; height?: string }> = ({
  percent,
  color = 'amber',
  height = 'h-3'
}) => {
  const safePercent = Math.min(100, Math.max(0, percent || 0));

  const gradientMap = {
    amber: 'from-amber-500 via-yellow-400 to-[#C5A059]',
    emerald: 'from-emerald-500 via-teal-400 to-emerald-300',
    purple: 'from-purple-500 via-indigo-400 to-amber-400',
    gold: 'from-[#C5A059] via-amber-400 to-yellow-300'
  };

  return (
    <div className={`w-full bg-slate-900/80 rounded-full ${height} overflow-hidden border border-white/10 relative p-0.5 shadow-inner`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]} shadow-[0_0_12px_rgba(245,158,11,0.5)]`}
        initial={{ width: 0 }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

// Streak Badge with Animated Flame
const StreakBadge: React.FC<{ streak: number; isCheckedToday: boolean }> = ({ streak, isCheckedToday }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono transition-all duration-300 ${
      isCheckedToday
        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
        : 'bg-slate-800/60 text-slate-400 border border-white/10'
    }`}>
      <Flame className={`w-3.5 h-3.5 ${isCheckedToday ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
      <span>{streak} {streak === 1 ? 'día' : 'días'}</span>
    </div>
  );
};

export const DailyLifeView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'timePlan' | 'tasks' | 'objectives' | 'routines'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const todayStr = getTodayDateString();

  // Toast Handler
  const triggerToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-2), { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#F59E0B');

  // Task Form State
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDate, setNewTaskDate] = useState(todayStr);
  const [newTaskStart, setNewTaskStart] = useState('');

  // Time Plan State
  const [tplTitle, setTplTitle] = useState('');
  const [tplCategory, setTplCategory] = useState<'commute' | 'lunch' | 'breakfast' | 'dinner' | 'study' | 'rest' | 'gym' | 'shopping' | 'free_time' | 'personal'>('study');
  const [tplStart, setTplStart] = useState('14:00');
  const [tplDuration, setTplDuration] = useState(45);
  const [tplColor, setTplColor] = useState('#F59E0B');

  // Objective State
  const [objTitle, setObjTitle] = useState('');

  // Routine Form State
  const [rtnTitle, setRtnTitle] = useState('');
  const [rtnTimeOfDay, setRtnTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [rtnStepInput, setRtnStepInput] = useState('');
  const [rtnSteps, setRtnSteps] = useState<string[]>([]);

  // Editing Modals State
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);
  const [selectedFreeGap, setSelectedFreeGap] = useState<FreeTimeGap | null>(null);

  // Calculations
  const daySummary = useMemo(() => DailyLifeCalculations.calculateOverallDayProgress(data, todayStr), [data, todayStr]);
  const workload = useMemo(() => DailyLifeCalculations.calculateDailyWorkload(data, todayStr), [data, todayStr]);
  const timeDist = useMemo(() => DailyLifeCalculations.calculateTimeDistributionToday(data, todayStr), [data, todayStr]);
  const freeGaps = useMemo(() => DailyLifeCalculations.detectFreeTimeGaps(data, todayStr), [data, todayStr]);

  // Handlers
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    DailyLifeStore.addHabit({
      name: newHabitName.trim(),
      color: newHabitColor,
      frequency: 'daily'
    });
    setNewHabitName('');
    triggerToast(`Hábito "${newHabitName}" creado con éxito ✨`);
  };

  const handleToggleHabit = (habitId: string, habitName: string) => {
    const isAlreadyChecked = Boolean(data.habits.find(h => h.id === habitId)?.logs?.[todayStr]);
    DailyLifeStore.toggleHabitLog(habitId, todayStr);
    triggerToast(
      isAlreadyChecked ? `Hábito "${habitName}" marcado como pendiente.` : `✓ ¡Hábito "${habitName}" completado! +10% en progreso diario.`,
      isAlreadyChecked ? 'info' : 'success'
    );
  };

  const handleHandleDeleteHabit = (habitId: string) => {
    DailyLifeStore.deleteHabit(habitId);
    triggerToast('Hábito eliminado', 'info');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    DailyLifeStore.addTask({
      name: newTaskName.trim(),
      priority: newTaskPriority,
      date: newTaskDate || todayStr,
      startTime: newTaskStart || undefined
    });
    setNewTaskName('');
    setNewTaskStart('');
    triggerToast(`Tarea "${newTaskName}" programada ✓`);
  };

  const handleToggleTask = (taskId: string, taskName: string) => {
    const isCompleted = data.tasks.find(t => t.id === taskId)?.status === 'completed';
    DailyLifeStore.toggleTaskStatus(taskId);
    triggerToast(
      isCompleted ? `Tarea "${taskName}" reactivada.` : `✓ Tarea "${taskName}" completada.`,
      isCompleted ? 'info' : 'success'
    );
  };

  const handleHandleDeleteTask = (taskId: string) => {
    DailyLifeStore.deleteTask(taskId);
    triggerToast('Tarea eliminada', 'info');
  };

  const handleAddTimePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplTitle.trim()) return;
    DailyLifeStore.addTimePlan({
      title: tplTitle.trim(),
      category: tplCategory,
      date: todayStr,
      startTime: tplStart,
      durationMinutes: Number(tplDuration),
      color: tplColor
    });
    setTplTitle('');
    triggerToast(`Bloque "${tplTitle}" agendado (${tplDuration}m) ⏰`);
  };

  const handleDeleteTimePlan = (id: string) => {
    DailyLifeStore.deleteTimePlan(id);
    triggerToast('Bloque de tiempo eliminado', 'info');
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objTitle.trim()) return;
    DailyLifeStore.addObjective({
      title: objTitle.trim(),
      date: todayStr
    });
    setObjTitle('');
    triggerToast(`Objetivo "${objTitle}" registrado 🎯`);
  };

  const handleToggleObjective = (id: string, title: string) => {
    const isCompleted = data.objectives.find(o => o.id === id)?.status === 'completed';
    DailyLifeStore.toggleObjective(id);
    triggerToast(
      isCompleted ? `Objetivo "${title}" marcado pendiente.` : `🎯 ¡Objetivo "${title}" alcanzado!`,
      isCompleted ? 'info' : 'success'
    );
  };

  const handleDeleteObjective = (id: string) => {
    DailyLifeStore.deleteObjective(id);
    triggerToast('Objetivo eliminado', 'info');
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtnTitle.trim() || rtnSteps.length === 0) return;
    DailyLifeStore.addRoutine({
      name: rtnTitle.trim(),
      timeOfDay: rtnTimeOfDay,
      steps: rtnSteps.map((s, idx) => ({ id: `s_${idx}`, title: s, completedToday: false }))
    });
    setRtnTitle('');
    setRtnSteps([]);
    triggerToast(`Rutina "${rtnTitle}" creada con ${rtnSteps.length} pasos ✨`);
  };

  const handleToggleRoutineStep = (routineId: string, stepId: string) => {
    DailyLifeStore.toggleRoutineStep(routineId, stepId);
    triggerToast('Paso de rutina actualizado ✓', 'success');
  };

  const handleDeleteRoutine = (routineId: string) => {
    DailyLifeStore.deleteRoutine(routineId);
    triggerToast('Rutina eliminada', 'info');
  };

  // Quick Action for Free Time Gap
  const handleConfirmFreeGapAction = (actionType: 'study' | 'rest' | 'task') => {
    if (!selectedFreeGap) return;
    if (actionType === 'study') {
      DailyLifeStore.addTimePlan({
        title: 'Estudio de Alto Rendimiento',
        category: 'study',
        date: todayStr,
        startTime: selectedFreeGap.startTime,
        durationMinutes: selectedFreeGap.durationMinutes,
        color: '#F59E0B'
      });
      triggerToast(`Bloque de estudio creado para el espacio libre (${selectedFreeGap.durationMinutes}m) 📚`);
    } else if (actionType === 'rest') {
      DailyLifeStore.addTimePlan({
        title: 'Pausa de Recuperación y Descanso',
        category: 'rest',
        date: todayStr,
        startTime: selectedFreeGap.startTime,
        durationMinutes: selectedFreeGap.durationMinutes,
        color: '#10B981'
      });
      triggerToast(`Pausa de descanso programada (${selectedFreeGap.durationMinutes}m) ☕`);
    } else if (actionType === 'task') {
      const firstPending = data.tasks.find(t => t.status === 'pending');
      if (firstPending) {
        DailyLifeStore.addTimePlan({
          title: `Tarea: ${firstPending.name}`,
          category: 'personal',
          date: todayStr,
          startTime: selectedFreeGap.startTime,
          durationMinutes: selectedFreeGap.durationMinutes,
          color: '#8B5CF6'
        });
        triggerToast(`Bloque asignado a la tarea "${firstPending.name}" ✓`);
      } else {
        triggerToast('No hay tareas pendientes en la lista para asignar.', 'info');
      }
    }
    setSelectedFreeGap(null);
  };

  // Build Chronological Timeline Items
  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      time: string;
      title: string;
      type: 'plan' | 'task' | 'habit' | 'routine';
      status: 'completed' | 'pending';
      badgeText: string;
      badgeColor: 'amber' | 'emerald' | 'purple' | 'gold';
      originalObject: any;
    }> = [];

    // Time Plans
    (data.timePlans || []).filter(p => p.date === todayStr).forEach(p => {
      items.push({
        id: `tpl_${p.id}`,
        time: p.startTime,
        title: p.title,
        type: 'plan',
        status: 'pending',
        badgeText: `${p.durationMinutes}m • ${p.category}`,
        badgeColor: 'amber',
        originalObject: p
      });
    });

    // Timed Tasks
    (data.tasks || []).filter(t => t.date === todayStr && t.startTime).forEach(t => {
      items.push({
        id: `tsk_${t.id}`,
        time: t.startTime!,
        title: t.name,
        type: 'task',
        status: t.status,
        badgeText: `Prioridad: ${t.priority}`,
        badgeColor: t.status === 'completed' ? 'emerald' : 'purple',
        originalObject: t
      });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [data, todayStr]);

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16 relative">
      {/* TOAST MESSAGES FLOATING CONTAINER */}
      <div className="fixed top-20 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-bold text-white ${
                t.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/50 shadow-emerald-500/20'
                  : t.type === 'warning'
                  ? 'bg-amber-950/80 border-amber-500/50 shadow-amber-500/20'
                  : 'bg-slate-900/80 border-blue-500/50 shadow-blue-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. SECTION HEADER INSTITUCIONAL */}
      <ExecutiveSectionHeader
        title="Oficina de Vida Diaria"
        subtitle="Agencia Superior de Organización Cotidiana, Hábitos y Planificación Personal"
        icon={<Activity className="w-6 h-6 text-amber-400" />}
        accentColor="amber"
        badgeText="Vida Viva & Activa"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar hábitos, tareas u objetivos..."
      />

      {/* 2. BARRA RESUMEN EN TIEMPO REAL ("ESTADO DEL DÍA") */}
      <GlassPanel accentColor="amber" padding="md" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <ExecutiveBadge variant="solid" accentColor="amber" className="animate-pulse">
                Estado del Día en Tiempo Real
              </ExecutiveBadge>
              <span className="text-xs font-mono text-slate-400">Jornada: {todayStr}</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
              Progreso General del Día: <span className="text-amber-400 font-mono">{daySummary.overallPercent}%</span>
            </h2>
            <AnimatedProgressBar percent={daySummary.overallPercent} color="amber" height="h-3.5" />
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Resumen reactivo: {daySummary.completedActivities} de {daySummary.totalActivities} actividades cotidianas completadas. Cada acción se refleja inmediatamente en el Panel de Control.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3 bg-[#132337]/90 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-400/40 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Hábitos</span>
              <span className="text-lg font-bold font-mono text-amber-300">{daySummary.habitsCompleted}/{daySummary.habitsTotal}</span>
              <span className="text-[10px] text-slate-400 block">{daySummary.habitsPercent}%</span>
            </div>

            <div className="p-3 bg-[#132337]/90 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-400/40 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tareas</span>
              <span className="text-lg font-bold font-mono text-emerald-300">{daySummary.tasksCompleted}/{daySummary.tasksTotal}</span>
              <span className="text-[10px] text-slate-400 block">{daySummary.tasksPercent}%</span>
            </div>

            <div className="p-3 bg-[#132337]/90 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-400/40 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Objetivos</span>
              <span className="text-lg font-bold font-mono text-purple-300">{daySummary.objectivesCompleted}/{daySummary.objectivesTotal}</span>
              <span className="text-[10px] text-slate-400 block">{daySummary.objectivesPercent}%</span>
            </div>

            <div className="p-3 bg-[#132337]/90 border border-white/10 rounded-xl text-center space-y-1 hover:border-amber-400/40 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Carga</span>
              <span className={`text-sm font-bold block mt-1 text-${workload.badgeColor}-400`}>{workload.level}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{workload.formattedTime}</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 3. TABS DE NAVEGACIÓN PRINCIPAL */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboard'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          Dashboard & Cronología del Día
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'habits'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          Hábitos Diarios ({data.habits.length})
        </button>

        <button
          onClick={() => setActiveTab('timePlan')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'timePlan'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          Bloques de Tiempo ({data.timePlans.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'tasks'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tareas Cotidianas ({data.tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('objectives')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'objectives'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4" />
          Objetivos del Día ({data.objectives.length})
        </button>

        <button
          onClick={() => setActiveTab('routines')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'routines'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          Rutinas Paso a Paso ({data.routines.length})
        </button>
      </div>

      {/* TAB 0: DASHBOARD & CRONOLOGÍA DEL DÍA */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* DETECCIÓN DE ESPACIOS DE TIEMPO LIBRE */}
          {freeGaps.length > 0 && (
            <GlassPanel accentColor="amber" padding="md" className="border-amber-500/30 bg-amber-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-400 animate-bounce" />
                  <h3 className="font-serif font-bold text-white text-base">Espacios de Tiempo Libre Detectados Hoy</h3>
                </div>
                <ExecutiveBadge variant="subtle" accentColor="amber">
                  Oportunidad Productiva
                </ExecutiveBadge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {freeGaps.slice(0, 2).map(gap => (
                  <motion.div
                    key={gap.id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="p-4 bg-[#132337]/80 rounded-xl border border-amber-400/30 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-amber-300 mb-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {gap.startTime} – {gap.endTime}</span>
                        <span className="font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                          {gap.durationMinutes} min libres
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{gap.label}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => setSelectedFreeGap(gap)}
                        className="px-3 py-1.5 text-xs font-bold bg-[#C5A059] text-slate-950 hover:bg-amber-500 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" /> Asignar Actividad
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* CRONOLOGÍA VERTICAL & DISTRIBUCIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COL 1 & 2: CRONOLOGÍA EN TIEMPO REAL */}
            <div className="lg:col-span-2 space-y-4">
              <GlassPanel accentColor="amber" padding="md">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Cronología Viva del Día
                    </h3>
                    <p className="text-xs text-slate-400">
                      Línea de tiempo continua de tus bloques de tiempo, hábitos y tareas programadas
                    </p>
                  </div>
                  <ExecutiveBadge variant="subtle" accentColor="amber">
                    {timelineItems.length} Actividades
                  </ExecutiveBadge>
                </div>

                {timelineItems.length === 0 ? (
                  <ExecutiveEmptyState
                    icon={<Clock className="w-8 h-8 text-amber-400" />}
                    title="Cronología Despejada"
                    description="No tienes bloques de tiempo o tareas con hora fija asignadas para hoy. Planifica bloques de tiempo o agrega horarios a tus tareas."
                    accentColor="amber"
                    actionLabel="Programar Primer Bloque"
                    onAction={() => setActiveTab('timePlan')}
                  />
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400/60 before:via-emerald-400/40 before:to-transparent">
                    {timelineItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group"
                      >
                        {/* Node */}
                        <div className={`absolute -left-[23px] top-3 w-3.5 h-3.5 rounded-full border-2 border-[#0B1528] ${
                          item.status === 'completed'
                            ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                            : 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                        } transition-transform group-hover:scale-125`} />

                        <div className="p-3.5 bg-[#132337]/80 hover:bg-[#132337] border border-white/10 hover:border-amber-400/40 rounded-xl transition-all shadow-md">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                                ⏰ {item.time}
                              </span>
                              <h4 className="font-serif font-bold text-white text-sm">{item.title}</h4>
                            </div>
                            <ExecutiveBadge variant="subtle" accentColor={item.badgeColor}>
                              {item.badgeText}
                            </ExecutiveBadge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlassPanel>
            </div>

            {/* COL 3: RESUMEN DE TIEMPO & PRODUCTIVIDAD */}
            <div className="space-y-4">
              <GlassPanel accentColor="amber" padding="md">
                <h4 className="font-serif font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Distribución del Tiempo de Hoy
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-[#132337] rounded-lg">
                    <span className="text-slate-300">Estudio e Investigación:</span>
                    <strong className="text-amber-300 font-mono">{timeDist.estudio}m</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#132337] rounded-lg">
                    <span className="text-slate-300">Desplazamiento:</span>
                    <strong className="text-amber-300 font-mono">{timeDist.desplazamiento}m</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#132337] rounded-lg">
                    <span className="text-slate-300">Alimentación:</span>
                    <strong className="text-amber-300 font-mono">{timeDist.alimentacion}m</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#132337] rounded-lg">
                    <span className="text-slate-300">Descanso / Tiempo Libre:</span>
                    <strong className="text-amber-300 font-mono">{timeDist.descanso}m</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#132337] rounded-lg">
                    <span className="text-slate-300">Gimnasio / Ejercicio:</span>
                    <strong className="text-amber-300 font-mono">{timeDist.gimnasio}m</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[#132337] rounded-lg">
                    <span className="text-slate-300">Actividades Personales:</span>
                    <strong className="text-amber-300 font-mono">{timeDist.personal}m</strong>
                  </div>
                </div>
              </GlassPanel>

              {/* CONSEJO DE PRODUCTIVIDAD */}
              <GlassPanel accentColor="gold" padding="sm" className="bg-amber-950/20 border-amber-500/30">
                <div className="flex items-start gap-2.5 text-xs text-amber-200">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-serif text-white mb-0.5">Enfoque de Casa Blanca Personal</strong>
                    {workload.description}
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: HÁBITOS DIARIOS */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Crear Nuevo Hábito
            </h3>

            <ExecutiveForm onSubmit={handleAddHabit}>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <ExecutiveInput
                    label="Nombre del Hábito *"
                    placeholder="Ej: Meditar 10 min / Leer 15 páginas"
                    value={newHabitName}
                    onChange={e => setNewHabitName(e.target.value)}
                    accentColor="amber"
                    required
                  />
                </div>

                <div>
                  <ExecutiveInput
                    label="Color del Hábito"
                    type="color"
                    value={newHabitColor}
                    onChange={e => setNewHabitColor(e.target.value)}
                    accentColor="amber"
                  />
                </div>

                <ExecutiveButton type="submit" variant="primary" accentColor="amber" icon={<Plus className="w-4 h-4" />}>
                  Crear Hábito
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.habits.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Flame className="w-8 h-8 text-amber-400" />}
              title="Sin Hábitos Registrados"
              description="Comienza definiendo tus hábitos personales para mantener rachas de cumplimiento diario e impulsar tu disciplina."
              accentColor="amber"
              actionLabel="Crear Hábito Sugerido"
              onAction={() => setNewHabitName('Ej: Ejercicio 20 minutos')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.habits
                .filter(h => searchQuery ? h.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
                .map(h => {
                  const isCheckedToday = Boolean(h.logs && h.logs[todayStr]);
                  const streak = DailyLifeCalculations.calculateHabitStreak(h, todayStr);

                  return (
                    <motion.div
                      key={h.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.15 }}
                      className={`p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all duration-200 group shadow-lg ${
                        isCheckedToday
                          ? 'bg-gradient-to-br from-[#132337] via-emerald-950/30 to-[#132337] border-emerald-500/40 shadow-emerald-500/10'
                          : 'bg-[#132337]/80 hover:bg-[#132337] border-white/10 hover:border-amber-400/40 hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)]'
                      }`}
                    >
                      {/* Specular Liquid Shine line */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                            {h.name}
                          </h4>
                          <StreakBadge streak={streak} isCheckedToday={isCheckedToday} />
                        </div>

                        {/* Interactive Completion Button */}
                        <button
                          onClick={() => handleToggleHabit(h.id, h.name)}
                          className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                            isCheckedToday
                              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                              : 'border-white/20 hover:border-amber-400 text-slate-400 hover:text-white bg-slate-900/50'
                          }`}
                        >
                          <Check className={`w-6 h-6 transition-transform ${isCheckedToday ? 'scale-110' : 'scale-90 opacity-40'}`} />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs pt-2 border-t border-white/10">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Cumplimiento hoy:</span>
                          <strong className={isCheckedToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {isCheckedToday ? 'Completado ✓' : 'Pendiente'}
                          </strong>
                        </div>
                      </div>

                      {/* QUICK HOVER ACTIONS OVERLAY */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingHabit(h)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button
                          onClick={() => handleHandleDeleteHabit(h.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLANIFICACIÓN DEL TIEMPO (BLOQUES) */}
      {activeTab === 'timePlan' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Programar Bloque de Tiempo Personal
            </h3>

            <ExecutiveForm onSubmit={handleAddTimePlan}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Nombre de la Actividad *"
                    placeholder="Ej: Desplazamiento o Lectura"
                    value={tplTitle}
                    onChange={e => setTplTitle(e.target.value)}
                    accentColor="amber"
                    required
                  />
                </div>

                <div>
                  <ExecutiveSelect
                    label="Categoría"
                    value={tplCategory}
                    onChange={e => setTplCategory(e.target.value as any)}
                    accentColor="amber"
                    options={[
                      { value: 'study', label: 'Estudio independiente' },
                      { value: 'commute', label: 'Desplazamiento' },
                      { value: 'lunch', label: 'Almuerzo' },
                      { value: 'breakfast', label: 'Desayuno' },
                      { value: 'dinner', label: 'Cena' },
                      { value: 'rest', label: 'Descanso' },
                      { value: 'gym', label: 'Gimnasio' },
                      { value: 'shopping', label: 'Compras' },
                      { value: 'free_time', label: 'Tiempo libre' },
                      { value: 'personal', label: 'Actividad personal' }
                    ]}
                  />
                </div>

                <ExecutiveInput
                  label="Hora de Inicio"
                  type="time"
                  value={tplStart}
                  onChange={e => setTplStart(e.target.value)}
                  accentColor="amber"
                />

                <ExecutiveSelect
                  label="Duración"
                  value={tplDuration}
                  onChange={e => setTplDuration(Number(e.target.value))}
                  accentColor="amber"
                  options={[
                    { value: '20', label: '20 minutos' },
                    { value: '30', label: '30 minutos' },
                    { value: '45', label: '45 minutos' },
                    { value: '60', label: '1 hora' },
                    { value: '90', label: '1.5 horas' }
                  ]}
                />
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="amber" icon={<Plus className="w-4 h-4" />}>
                  Agregar Bloque
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {/* MATRIZ DE DISTRIBUCIÓN DEL TIEMPO */}
          <GlassPanel accentColor="amber" padding="sm">
            <h4 className="font-serif font-bold text-amber-300 text-xs uppercase tracking-wider mb-3">
              Resumen de Distribución del Tiempo de Hoy
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Estudio</span>
                <strong className="text-amber-300 text-base font-mono">{timeDist.estudio}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Desplazamiento</span>
                <strong className="text-amber-300 text-base font-mono">{timeDist.desplazamiento}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Alimentación</span>
                <strong className="text-amber-300 text-base font-mono">{timeDist.alimentacion}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Descanso</span>
                <strong className="text-amber-300 text-base font-mono">{timeDist.descanso}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Gimnasio</span>
                <strong className="text-amber-300 text-base font-mono">{timeDist.gimnasio}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Personal</span>
                <strong className="text-amber-300 text-base font-mono">{timeDist.personal}m</strong>
              </div>
            </div>
          </GlassPanel>

          {/* LISTA DE BLOQUES */}
          <div className="space-y-3">
            {data.timePlans.filter(p => p.date === todayStr).length === 0 ? (
              <ExecutiveEmptyState
                icon={<Clock className="w-8 h-8 text-amber-400" />}
                title="Sin Bloques de Tiempo Hoy"
                description="Estructura tu día agregando bloques para estudio, pausas, desplazamientos o gimnasio."
                accentColor="amber"
              />
            ) : (
              data.timePlans.filter(p => p.date === todayStr).map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -2 }}
                  className="p-4 bg-[#132337]/80 hover:bg-[#132337] border border-white/10 hover:border-amber-400/40 rounded-2xl flex justify-between items-center text-xs transition-all shadow-md"
                >
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm">{p.title}</h4>
                    <span className="text-slate-400 font-mono text-[11px] block">Categoría: {p.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExecutiveBadge variant="subtle" accentColor="amber">
                      ⏰ {p.startTime} – {p.endTime} ({p.durationMinutes}m)
                    </ExecutiveBadge>
                    <button
                      onClick={() => handleDeleteTimePlan(p.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TAREAS COTIDIANAS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Agregar Tarea Cotidiana
            </h3>

            <ExecutiveForm onSubmit={handleAddTask}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Nombre de la Tarea *"
                    placeholder="Ej: Comprar insumos o enviar documento"
                    value={newTaskName}
                    onChange={e => setNewTaskName(e.target.value)}
                    accentColor="amber"
                    required
                  />
                </div>

                <ExecutiveSelect
                  label="Prioridad"
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  accentColor="amber"
                  options={[
                    { value: 'low', label: 'Baja Prioridad' },
                    { value: 'medium', label: 'Media Prioridad' },
                    { value: 'high', label: 'Alta Prioridad' }
                  ]}
                />

                <ExecutiveButton type="submit" variant="primary" accentColor="amber" icon={<Plus className="w-4 h-4" />}>
                  Guardar Tarea
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.tasks.length === 0 ? (
            <ExecutiveEmptyState
              icon={<CheckSquare className="w-8 h-8 text-amber-400" />}
              title="Sin Tareas Pendientes"
              description="No hay tareas registradas para la vida cotidiana."
              accentColor="amber"
            />
          ) : (
            <div className="space-y-3">
              {data.tasks
                .filter(t => searchQuery ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
                .map(t => (
                  <motion.div
                    key={t.id}
                    whileHover={{ y: -2 }}
                    className={`p-4 rounded-2xl border backdrop-blur-md flex justify-between items-center text-xs transition-all shadow-md ${
                      t.status === 'completed'
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                        : 'bg-[#132337]/80 hover:bg-[#132337] border-white/10 hover:border-amber-400/40 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(t.id, t.name)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          t.status === 'completed'
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-white/30 hover:border-amber-400'
                        }`}
                      >
                        {t.status === 'completed' && <Check className="w-4 h-4 font-bold" />}
                      </button>

                      <div className="space-y-0.5">
                        <span className={`font-serif text-sm block ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-white font-bold'}`}>
                          {t.name}
                        </span>
                        {t.startTime && <span className="text-[10px] font-mono text-amber-300">⏰ {t.startTime}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ExecutiveBadge
                        variant="subtle"
                        accentColor={t.priority === 'high' ? 'rose' : t.priority === 'medium' ? 'amber' : 'blue'}
                      >
                        {t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja'}
                      </ExecutiveBadge>

                      <button
                        onClick={() => handleHandleDeleteTask(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: OBJETIVOS DIARIOS */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Nuevo Objetivo del Día
            </h3>

            <ExecutiveForm onSubmit={handleAddObjective}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <ExecutiveInput
                    label="Objetivo de la Jornada *"
                    placeholder="Ej: Completar capítulo 4 de economía"
                    value={objTitle}
                    onChange={e => setObjTitle(e.target.value)}
                    accentColor="amber"
                    required
                  />
                </div>

                <ExecutiveButton type="submit" variant="primary" accentColor="amber" icon={<Plus className="w-4 h-4" />}>
                  Agregar Objetivo
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.objectives.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Target className="w-8 h-8 text-amber-400" />}
              title="Sin Objetivos Registrados"
              description="No hay objetivos trazados para la jornada."
              accentColor="amber"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.objectives
                .filter(o => searchQuery ? o.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
                .map(o => (
                  <motion.div
                    key={o.id}
                    whileHover={{ y: -3 }}
                    className={`p-5 rounded-2xl border backdrop-blur-md space-y-3 transition-all shadow-md ${
                      o.status === 'completed'
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                        : 'bg-[#132337]/80 hover:bg-[#132337] border-white/10 hover:border-amber-400/40 text-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleObjective(o.id, o.title)}
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                            o.status === 'completed'
                              ? 'bg-purple-500 border-purple-400 text-slate-950 font-bold'
                              : 'border-white/30 hover:border-amber-400'
                          }`}
                        >
                          {o.status === 'completed' && <Check className="w-4 h-4" />}
                        </button>

                        <div>
                          <h4 className={`font-serif font-bold text-base ${o.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                            {o.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">Fecha: {o.date || todayStr}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteObjective(o.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <AnimatedProgressBar percent={o.status === 'completed' ? 100 : 0} color="purple" height="h-2" />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RUTINAS PASO A PASO */}
      {activeTab === 'routines' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Crear Rutina Cotidiana
            </h3>

            <ExecutiveForm onSubmit={handleAddRoutine}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <ExecutiveInput
                      label="Nombre de la Rutina *"
                      placeholder="Ej: Rutina Mañanera de Productividad"
                      value={rtnTitle}
                      onChange={e => setRtnTitle(e.target.value)}
                      accentColor="amber"
                      required
                    />
                  </div>
                  <ExecutiveSelect
                    label="Momento del Día"
                    value={rtnTimeOfDay}
                    onChange={e => setRtnTimeOfDay(e.target.value as any)}
                    accentColor="amber"
                    options={[
                      { value: 'morning', label: 'Mañana' },
                      { value: 'afternoon', label: 'Tarde' },
                      { value: 'evening', label: 'Noche' }
                    ]}
                  />
                </div>

                <div className="flex gap-2 items-end">
                  <div className="grow">
                    <ExecutiveInput
                      label="Agregar Paso a la Rutina"
                      placeholder="Ej: Tomar vaso de agua / Estirar 5 minutos"
                      value={rtnStepInput}
                      onChange={e => setRtnStepInput(e.target.value)}
                      accentColor="amber"
                    />
                  </div>
                  <ExecutiveButton
                    type="button"
                    variant="outline"
                    accentColor="amber"
                    onClick={() => {
                      if (!rtnStepInput.trim()) return;
                      setRtnSteps(prev => [...prev, rtnStepInput.trim()]);
                      setRtnStepInput('');
                    }}
                  >
                    + Agregar Paso
                  </ExecutiveButton>
                </div>

                {rtnSteps.length > 0 && (
                  <div className="p-3 bg-[#132337] rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 block mb-1">Pasos incluidos ({rtnSteps.length}):</span>
                    {rtnSteps.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-white bg-slate-900/60 p-2 rounded-lg">
                        <span>{idx + 1}. {step}</span>
                        <button
                          type="button"
                          onClick={() => setRtnSteps(prev => prev.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <ExecutiveButton type="submit" variant="primary" accentColor="amber" icon={<Plus className="w-4 h-4" />}>
                    Guardar Rutina
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {/* LISTA DE RUTINAS */}
          {data.routines.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Layers className="w-8 h-8 text-amber-400" />}
              title="Sin Rutinas Paso a Paso"
              description="Crea secuencias automatizadas de tareas cotidianas para tus mañanas o noches."
              accentColor="amber"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.routines.map(r => {
                const totalSteps = r.steps?.length || 0;
                const completedSteps = r.steps?.filter(s => s.completedToday)?.length || 0;
                const percent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return (
                  <GlassPanel key={r.id} accentColor="amber" padding="md" className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-white text-base">{r.name}</h4>
                        <span className="text-xs font-mono text-amber-300">{completedSteps} de {totalSteps} pasos completados</span>
                      </div>
                      <button
                        onClick={() => handleDeleteRoutine(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <AnimatedProgressBar percent={percent} color="gold" height="h-2.5" />

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      {r.steps.map(step => (
                        <div key={step.id} className="flex items-center justify-between text-xs p-2 bg-[#132337]/60 rounded-xl">
                          <span className={step.completedToday ? 'line-through text-slate-500' : 'text-slate-200 font-semibold'}>
                            {step.title}
                          </span>
                          <button
                            onClick={() => handleToggleRoutineStep(r.id, step.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              step.completedToday ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' : 'border-white/30'
                            }`}
                          >
                            {step.completedToday && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ESPACIO DE TIEMPO LIBRE */}
      {selectedFreeGap && (
        <ExecutiveModal
          isOpen={Boolean(selectedFreeGap)}
          onClose={() => setSelectedFreeGap(null)}
          title="Aprovechar Espacio de Tiempo Libre"
          subtitle={selectedFreeGap.label}
          accentColor="amber"
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-300">
              Casa Blanca Personal ha detectado {selectedFreeGap.durationMinutes} minutos disponibles entre {selectedFreeGap.startTime} y {selectedFreeGap.endTime}. Selecciona la mejor opción para estructurar este bloque:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleConfirmFreeGapAction('study')}
                className="p-3.5 bg-[#132337] hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left text-xs text-white font-bold flex items-center gap-3 transition-all cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-sm">📚 Agendar Sesión de Estudio</span>
                  <span className="text-[11px] text-slate-400 font-normal">Crear bloque de estudio independiente de {selectedFreeGap.durationMinutes}m</span>
                </div>
              </button>

              <button
                onClick={() => handleConfirmFreeGapAction('task')}
                className="p-3.5 bg-[#132337] hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-left text-xs text-white font-bold flex items-center gap-3 transition-all cursor-pointer"
              >
                <CheckSquare className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="block text-sm">✅ Completar Tarea Pendiente</span>
                  <span className="text-[11px] text-slate-400 font-normal">Asignar este bloque a la primera tarea pendiente de tu lista</span>
                </div>
              </button>

              <button
                onClick={() => handleConfirmFreeGapAction('rest')}
                className="p-3.5 bg-[#132337] hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-left text-xs text-white font-bold flex items-center gap-3 transition-all cursor-pointer"
              >
                <Coffee className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-sm">☕ Pausa de Descanso y Recuperación</span>
                  <span className="text-[11px] text-slate-400 font-normal">Programar descanso estructurado de {selectedFreeGap.durationMinutes}m</span>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <ExecutiveButton
                variant="outline"
                accentColor="amber"
                onClick={() => setSelectedFreeGap(null)}
              >
                Ignorar por ahora
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveModal>
      )}

      {/* MODAL EDITAR HÁBITO */}
      {editingHabit && (
        <ExecutiveModal
          isOpen={Boolean(editingHabit)}
          onClose={() => setEditingHabit(null)}
          title="Editar Hábito"
          accentColor="amber"
        >
          <div className="space-y-4 py-2">
            <ExecutiveInput
              label="Nombre del Hábito"
              value={editingHabit.name}
              onChange={e => setEditingHabit({ ...editingHabit, name: e.target.value })}
              accentColor="amber"
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <ExecutiveButton variant="outline" accentColor="amber" onClick={() => setEditingHabit(null)}>
                Cancelar
              </ExecutiveButton>
              <ExecutiveButton
                variant="primary"
                accentColor="amber"
                onClick={() => {
                  DailyLifeStore.deleteHabit(editingHabit.id);
                  DailyLifeStore.addHabit({
                    name: editingHabit.name,
                    color: editingHabit.color,
                    frequency: 'daily'
                  });
                  setEditingHabit(null);
                  triggerToast('Hábito actualizado ✓');
                }}
              >
                Guardar Cambios
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveModal>
      )}
    </div>
  );
};

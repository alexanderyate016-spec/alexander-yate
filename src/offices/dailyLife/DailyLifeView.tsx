import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyLifeOfficeData, HabitItem, DailyTask, DailyObjective, TimePlan, RoutineItem, DailyHistoryRecord } from '../../types/store';
import { DailyLifeStore } from './DailyLifeStore';
import { DailyLifeCalculations, FreeTimeGap } from './DailyLifeCalculations';
import { HorarioPersonal } from './components/HorarioPersonal';
import { getTodayDateString } from '../../utils/dates';
import { useTimeService } from '../../hooks/useTimeService';
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
  Edit2,
  Calendar,
  History,
  BarChart3,
  ChevronRight,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Award
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
  const [activeTab, setActiveTab] = useState<'horarioPersonal' | 'dashboard' | 'history' | 'habits' | 'timePlan' | 'tasks' | 'objectives' | 'routines'>('horarioPersonal');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const todayStr = getTodayDateString();
  const timeService = useTimeService();
  const isAfter22 = timeService.now.getHours() >= 22 || timeService.now.getHours() < 5;

  // Automatic reset check on mount
  useEffect(() => {
    DailyLifeStore.checkAndApplyDailyReset();
  }, []);

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

  // History State
  const [historyPeriod, setHistoryPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<DailyHistoryRecord | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  // Calculations
  const daySummary = useMemo(() => DailyLifeCalculations.calculateOverallDayProgress(data, todayStr), [data, todayStr]);
  const workload = useMemo(() => DailyLifeCalculations.calculateDailyWorkload(data, todayStr), [data, todayStr]);
  const timeDist = useMemo(() => DailyLifeCalculations.calculateTimeDistributionToday(data, todayStr), [data, todayStr]);
  const freeGaps = useMemo(() => DailyLifeCalculations.detectFreeTimeGaps(data, todayStr), [data, todayStr]);

  // Unified History list
  const unifiedHistory = useMemo(() => DailyLifeCalculations.getUnifiedHistory(data), [data]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return unifiedHistory.filter(record => {
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return (
        record.date.includes(q) ||
        record.dayOfWeek.toLowerCase().includes(q) ||
        record.habitsDetail?.some(h => h.name.toLowerCase().includes(q)) ||
        record.tasksDetail?.some(t => t.name.toLowerCase().includes(q)) ||
        record.objectivesDetail?.some(o => o.name.toLowerCase().includes(q))
      );
    });
  }, [unifiedHistory, historySearch]);

  // Grouped History for week / month / year
  const periodGroupedHistory = useMemo(() => {
    if (historyPeriod === 'day') return null;

    const groups: Record<string, {
      key: string;
      title: string;
      records: DailyHistoryRecord[];
      avgCompliance: number;
      avgHabits: number;
      avgTasks: number;
      avgObjectives: number;
      totalProductiveMins: number;
    }> = {};

    filteredHistory.forEach(record => {
      const d = new Date(record.date + 'T12:00:00');
      let groupKey = '';
      let groupTitle = '';

      if (historyPeriod === 'week') {
        const day = d.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const mStr = monday.toISOString().split('T')[0];
        const sStr = sunday.toISOString().split('T')[0];
        groupKey = `week_${mStr}`;
        groupTitle = `Semana (${mStr} al ${sStr})`;
      } else if (historyPeriod === 'month') {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        groupKey = `month_${d.getFullYear()}_${d.getMonth()}`;
        groupTitle = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      } else {
        groupKey = `year_${d.getFullYear()}`;
        groupTitle = `Año ${d.getFullYear()}`;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          title: groupTitle,
          records: [],
          avgCompliance: 0,
          avgHabits: 0,
          avgTasks: 0,
          avgObjectives: 0,
          totalProductiveMins: 0
        };
      }

      groups[groupKey].records.push(record);
    });

    Object.values(groups).forEach(g => {
      const len = g.records.length;
      if (len > 0) {
        g.avgCompliance = Math.round(g.records.reduce((sum, r) => sum + r.overallCompliancePercent, 0) / len);
        g.avgHabits = Math.round(g.records.reduce((sum, r) => sum + r.habitsCount.percent, 0) / len);
        g.avgTasks = Math.round(g.records.reduce((sum, r) => sum + r.tasksCount.percent, 0) / len);
        g.avgObjectives = Math.round(g.records.reduce((sum, r) => sum + r.objectivesCount.percent, 0) / len);
        g.totalProductiveMins = g.records.reduce((sum, r) => sum + r.productiveTimeMinutes, 0);
      }
    });

    return Object.values(groups);
  }, [filteredHistory, historyPeriod]);

  // Overall History KPI Statistics
  const historyKPIs = useMemo(() => {
    const totalDays = unifiedHistory.length;
    if (totalDays === 0) {
      return { totalDays: 0, avgCompliance: 0, totalProductiveHours: 0, bestCompliance: 0 };
    }
    const avgCompliance = Math.round(unifiedHistory.reduce((s, r) => s + r.overallCompliancePercent, 0) / totalDays);
    const totalProductiveMins = unifiedHistory.reduce((s, r) => s + r.productiveTimeMinutes, 0);
    const totalProductiveHours = (totalProductiveMins / 60).toFixed(1);
    const bestCompliance = Math.max(...unifiedHistory.map(r => r.overallCompliancePercent));

    return { totalDays, avgCompliance, totalProductiveHours, bestCompliance };
  }, [unifiedHistory]);

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

  const handleDeleteHabit = (habitId: string) => {
    DailyLifeStore.deleteHabit(habitId);
    triggerToast('Hábito eliminado del sistema', 'warning');
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
    triggerToast(`Tarea "${newTaskName}" agendada correctamente.`);
  };

  const handleToggleTask = (taskId: string) => {
    DailyLifeStore.toggleTaskStatus(taskId);
    triggerToast('Estado de tarea actualizado ✓');
  };

  const handleDeleteTask = (taskId: string) => {
    DailyLifeStore.deleteTask(taskId);
    triggerToast('Tarea removida de la lista', 'warning');
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
    triggerToast(`Bloque "${tplTitle}" reservado en la agenda.`);
  };

  const handleDeleteTimePlan = (id: string) => {
    DailyLifeStore.deleteTimePlan(id);
    triggerToast('Bloque de tiempo cancelado', 'warning');
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objTitle.trim()) return;
    DailyLifeStore.addObjective({
      title: objTitle.trim(),
      date: todayStr
    });
    setObjTitle('');
    triggerToast('Nuevo objetivo fijado para el día🎯');
  };

  const handleToggleObjective = (id: string) => {
    DailyLifeStore.toggleObjective(id);
    triggerToast('Estado del objetivo actualizado ✓');
  };

  const handleDeleteObjective = (id: string) => {
    DailyLifeStore.deleteObjective(id);
    triggerToast('Objetivo archivado', 'warning');
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtnTitle.trim() || rtnSteps.length === 0) return;
    DailyLifeStore.addRoutine({
      name: rtnTitle.trim(),
      timeOfDay: rtnTimeOfDay,
      steps: rtnSteps.map((title, idx) => ({ id: `step_${idx}_${Date.now()}`, title, completedToday: false }))
    });
    setRtnTitle('');
    setRtnSteps([]);
    setRtnStepInput('');
    triggerToast(`Rutina "${rtnTitle}" guardada con éxito.`);
  };

  const handleToggleRoutineStep = (routineId: string, stepId: string) => {
    DailyLifeStore.toggleRoutineStep(routineId, stepId);
    triggerToast('Paso de rutina completado ✓');
  };

  const handleDeleteRoutine = (routineId: string) => {
    DailyLifeStore.deleteRoutine(routineId);
    triggerToast('Rutina eliminada', 'warning');
  };

  const handleConfirmFreeGapAction = (actionType: 'study' | 'task' | 'rest') => {
    if (!selectedFreeGap) return;

    if (actionType === 'study') {
      DailyLifeStore.addTimePlan({
        title: 'Bloque de Estudio Intensivo',
        category: 'study',
        date: todayStr,
        startTime: selectedFreeGap.startTime,
        durationMinutes: Math.min(selectedFreeGap.durationMinutes, 60),
        color: '#8B5CF6'
      });
      triggerToast('Aprovechaste el espacio libre para estudiar 📚');
    } else if (actionType === 'task') {
      const pendingTask = data.tasks.find(t => t.status === 'pending');
      if (pendingTask) {
        DailyLifeStore.addTimePlan({
          title: `Avance en: ${pendingTask.name}`,
          category: 'personal',
          date: todayStr,
          startTime: selectedFreeGap.startTime,
          durationMinutes: Math.min(selectedFreeGap.durationMinutes, 45),
          color: '#3B82F6'
        });
        triggerToast(`Asignado a la tarea "${pendingTask.name}" ⚡`);
      } else {
        triggerToast('No tienes tareas pendientes para asignar.', 'info');
      }
    } else if (actionType === 'rest') {
      DailyLifeStore.addTimePlan({
        title: 'Pausa de Descanso y Recuperación',
        category: 'rest',
        date: todayStr,
        startTime: selectedFreeGap.startTime,
        durationMinutes: Math.min(selectedFreeGap.durationMinutes, 30),
        color: '#10B981'
      });
      triggerToast('Pausa programada para despejar la mente ☕');
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

      {/* WELCOME DAY MESSAGE BANNER */}
      {data.welcomeMessage && !data.welcomeMessage.dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-900/40 to-slate-900/90 border border-amber-500/40 shadow-2xl flex items-start justify-between gap-4 relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-400/30 text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Aviso del Sistema</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">Nuevo Día Activo</span>
              </div>
              <p className="text-sm font-bold text-white">
                {data.welcomeMessage.text}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Tus hábitos, objetivos, tareas y rutinas diarias se han reiniciado. Tu desempeño de ayer quedó guardado en el <strong className="text-amber-300">Historial Diario</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => DailyLifeStore.dismissWelcomeMessage()}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

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

      {/* 1.5 AVISO NOCTURNO DE CIERRE DE JORNADA (>22:00) */}
      {isAfter22 && (
        <GlassPanel accentColor="amber" padding="sm" className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 border-amber-500/40">
          <div className="flex items-center gap-3 text-xs text-amber-100">
            <Coffee className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">Atmósfera Nocturna</span>
              {daySummary.overallPercent >= 100 ? (
                <span>Has completado todas tus metas del día. ¡Excelente trabajo!</span>
              ) : (
                <span>Es un buen momento para cerrar la jornada. Recuerda registrar tus hábitos o descanso.</span>
              )}
            </div>
          </div>
        </GlassPanel>
      )}

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
              Resumen reactivo: {daySummary.completedActivities} de {daySummary.totalActivities} actividades cotidianas completadas. Cambios aplicados en tiempo real.
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
          onClick={() => setActiveTab('horarioPersonal')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'horarioPersonal'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          Horario Personal
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          Dashboard del Día
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'history'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4 text-amber-400" />
          Historial Diario ({unifiedHistory.length})
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'habits'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          Hábitos ({data.habits.length})
        </button>

        <button
          onClick={() => setActiveTab('timePlan')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
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
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
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
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
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
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'routines'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          Rutinas Paso a Paso ({data.routines.length})
        </button>
      </div>

      {/* TAB 0: HORARIO PERSONAL */}
      {activeTab === 'horarioPersonal' && <HorarioPersonal />}

      {/* TAB 1: DASHBOARD & CRONOLOGÍA DEL DÍA */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* DETECCIÓN DE ESPACIOS DE TIEMPO LIBRE */}
          {freeGaps.length > 0 && (
            <GlassPanel accentColor="amber" padding="md" className="border-amber-500/30 bg-amber-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-400 animate-bounce" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Espacios de Tiempo Libre Disponibles
                  </h3>
                </div>
                <ExecutiveBadge variant="outline" accentColor="amber">
                  {freeGaps.length} {freeGaps.length === 1 ? 'bloque libre' : 'bloques libres'}
                </ExecutiveBadge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {freeGaps.slice(0, 4).map(gap => (
                  <div
                    key={gap.id}
                    className="p-3 bg-[#132337]/90 border border-amber-500/20 rounded-xl flex items-center justify-between hover:border-amber-400/50 transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-amber-300 font-mono block">
                        {gap.startTime} - {gap.endTime} ({gap.durationMinutes} min)
                      </span>
                      <span className="text-[11px] text-slate-400 block">{gap.label}</span>
                    </div>
                    <ExecutiveButton
                      variant="outline"
                      accentColor="amber"
                      size="sm"
                      onClick={() => setSelectedFreeGap(gap)}
                    >
                      Aprovechar
                    </ExecutiveButton>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* MATRIZ DASHBOARD PRINCIPAL (CRONOLOGÍA & LISTA DE CONTROL) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMNA 1 & 2: CRONOLOGÍA EN TIEMPO REAL Y DISTRIBUCIÓN DE TIEMPO */}
            <div className="lg:col-span-2 space-y-6">
              <GlassPanel accentColor="amber" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-serif font-bold text-white">Cronología Ejecutiva del Día</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{timelineItems.length} eventos programados</span>
                </div>

                {timelineItems.length === 0 ? (
                  <ExecutiveEmptyState
                    icon={<Clock className="w-8 h-8 text-amber-400" />}
                    title="No hay bloques agendados para hoy"
                    description="Crea bloques de tiempo o asigna horarios a tus tareas para poblar la cronología del día."
                  />
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-amber-500/30">
                    {timelineItems.map(item => (
                      <div
                        key={item.id}
                        className="relative pl-10 p-3.5 bg-[#132337]/80 border border-white/10 rounded-xl flex items-center justify-between hover:border-amber-400/40 transition-all group"
                      >
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#0B1528] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-amber-300">{item.time}</span>
                            <ExecutiveBadge variant="outline" accentColor={item.badgeColor}>
                              {item.badgeText}
                            </ExecutiveBadge>
                          </div>
                          <h4 className={`text-sm font-bold ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.title}
                          </h4>
                        </div>

                        {item.type === 'task' && (
                          <button
                            onClick={() => handleToggleTask(item.originalObject.id)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              item.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </GlassPanel>

              {/* DISTRIBUCIÓN DEL TIEMPO POR CATEGORÍA */}
              <GlassPanel accentColor="amber" padding="md">
                <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Distribución del Tiempo por Categoría
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Estudio / Formación</span>
                    <span className="text-lg font-mono font-bold text-purple-300">{timeDist.estudio} min</span>
                  </div>
                  <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Gimnasio / Deporte</span>
                    <span className="text-lg font-mono font-bold text-emerald-300">{timeDist.gimnasio} min</span>
                  </div>
                  <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Alimentación</span>
                    <span className="text-lg font-mono font-bold text-amber-300">{timeDist.alimentacion} min</span>
                  </div>
                  <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Desplazamientos</span>
                    <span className="text-lg font-mono font-bold text-blue-300">{timeDist.desplazamiento} min</span>
                  </div>
                  <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Descanso / Ocio</span>
                    <span className="text-lg font-mono font-bold text-teal-300">{timeDist.descanso} min</span>
                  </div>
                  <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Actividades Personales</span>
                    <span className="text-lg font-mono font-bold text-yellow-300">{timeDist.personal} min</span>
                  </div>
                </div>
              </GlassPanel>
            </div>

            {/* COLUMNA 3: ACCIONES RÁPIDAS & HÁBITOS DESTACADOS DEL DÍA */}
            <div className="space-y-6">
              <GlassPanel accentColor="amber" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    Hábitos de Hoy
                  </h3>
                  <ExecutiveBadge variant="outline" accentColor="amber">
                    {data.habits.length} registrados
                  </ExecutiveBadge>
                </div>

                {data.habits.length === 0 ? (
                  <ExecutiveEmptyState
                    icon={<Flame className="w-6 h-6 text-amber-400" />}
                    title="Sin hábitos registrados"
                    description="Crea hábitos en la pestaña correspondiente para dar seguimiento diario."
                  />
                ) : (
                  <div className="space-y-2.5">
                    {data.habits.map(h => {
                      const isCheckedToday = Boolean(h.logs && h.logs[todayStr]);
                      const streak = DailyLifeCalculations.calculateHabitStreak(h, todayStr);

                      return (
                        <div
                          key={h.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            isCheckedToday
                              ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                              : 'bg-[#132337]/90 border-white/10 hover:border-amber-400/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleHabit(h.id, h.name)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                isCheckedToday
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                                  : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-transparent'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                            <div>
                              <span className={`text-xs font-bold block ${isCheckedToday ? 'line-through text-slate-400' : 'text-white'}`}>
                                {h.name}
                              </span>
                              <span className="text-[10px] text-slate-400">Diario</span>
                            </div>
                          </div>

                          <StreakBadge streak={streak} isCheckedToday={isCheckedToday} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassPanel>

              {/* OBJETIVOS RÁPIDOS */}
              <GlassPanel accentColor="amber" padding="md">
                <h3 className="text-base font-serif font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  Objetivos Rápidos del Día
                </h3>

                <div className="space-y-2">
                  {data.objectives.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No hay objetivos definidos para hoy.</p>
                  ) : (
                    data.objectives.map(o => (
                      <div key={o.id} className="p-2.5 bg-[#132337] border border-white/10 rounded-xl flex items-center justify-between">
                        <span className={`text-xs font-bold ${o.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                          {o.title}
                        </span>
                        <button
                          onClick={() => handleToggleObjective(o.id)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            o.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: HISTORIAL DIARIO */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* HEADER DEL HISTORIAL CON FILTROS Y ESTADÍSTICAS GLOBALES */}
          <GlassPanel accentColor="amber" padding="md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ExecutiveBadge variant="solid" accentColor="amber">
                    Registro Histórico Permanente
                  </ExecutiveBadge>
                  <span className="text-xs font-mono text-slate-400">{unifiedHistory.length} días almacenados</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-amber-400" />
                  Historial Diario de Desempeño
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Consulta el desempeño histórico consolidado por día, semana, mes o año. Todos los datos diarios anteriores se conservan de forma permanente.
                </p>
              </div>

              {/* CONTROLES DE FILTRO Y PERIODO */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex bg-[#132337] border border-white/10 rounded-xl p-1 gap-1">
                  {(['day', 'week', 'month', 'year'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setHistoryPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                        historyPeriod === p
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 md:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar fecha o actividad..."
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* TARJETAS KPI RESUMEN HISTÓRICO */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
              <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Días Registrados</span>
                <span className="text-xl font-mono font-bold text-amber-300">{historyKPIs.totalDays}</span>
              </div>
              <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Promedio Cumplimiento</span>
                <span className="text-xl font-mono font-bold text-emerald-300">{historyKPIs.avgCompliance}%</span>
              </div>
              <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Tiempo Productivo Total</span>
                <span className="text-xl font-mono font-bold text-purple-300">{historyKPIs.totalProductiveHours} hrs</span>
              </div>
              <div className="p-3 bg-[#132337] border border-white/10 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Mejor Día Histórico</span>
                <span className="text-xl font-mono font-bold text-yellow-300">{historyKPIs.bestCompliance}%</span>
              </div>
            </div>
          </GlassPanel>

          {/* LISTA DE HISTORIAL POR DÍA */}
          {historyPeriod === 'day' && (
            <div className="space-y-4">
              {filteredHistory.length === 0 ? (
                <ExecutiveEmptyState
                  icon={<Calendar className="w-8 h-8 text-amber-400" />}
                  title="No se encontraron registros de historial"
                  description="Comienza a registrar actividades y hábitos para generar tarjetas de desempeño diario."
                />
              ) : (
                filteredHistory.map(record => {
                  const isTodayRecord = record.date === todayStr;
                  const prodHours = Math.floor(record.productiveTimeMinutes / 60);
                  const prodMins = record.productiveTimeMinutes % 60;
                  const formattedProdTime = prodHours > 0 ? `${prodHours} h ${prodMins} min` : `${prodMins} min`;

                  return (
                    <GlassPanel
                      key={record.date}
                      accentColor={isTodayRecord ? 'emerald' : 'amber'}
                      padding="md"
                      className="hover:border-amber-400/50 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white capitalize">{record.dayOfWeek}</span>
                            {isTodayRecord && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Hoy
                              </span>
                            )}
                            <span className="text-xs font-mono text-slate-400">({record.date})</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-300">Cumplimiento General:</span>
                            <span className="text-sm font-mono font-bold text-amber-400">{record.overallCompliancePercent}%</span>
                            <div className="w-32">
                              <AnimatedProgressBar percent={record.overallCompliancePercent} color="amber" height="h-2" />
                            </div>
                          </div>
                        </div>

                        {/* METRICAS DE LA TARJETA DEL DÍA */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">Hábitos</span>
                            <span className="text-xs font-mono font-bold text-amber-300">
                              {record.habitsCount.percent}% ({record.habitsCount.completed}/{record.habitsCount.total})
                            </span>
                          </div>

                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">Objetivos</span>
                            <span className="text-xs font-mono font-bold text-purple-300">
                              {record.objectivesCount.percent}% ({record.objectivesCount.completed}/{record.objectivesCount.total})
                            </span>
                          </div>

                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">Tareas</span>
                            <span className="text-xs font-mono font-bold text-emerald-300">
                              {record.tasksCount.percent}% ({record.tasksCount.completed}/{record.tasksCount.total})
                            </span>
                          </div>

                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">T. Productivo</span>
                            <span className="text-xs font-mono font-bold text-blue-300">{formattedProdTime}</span>
                          </div>
                        </div>

                        <ExecutiveButton
                          variant="outline"
                          accentColor="amber"
                          size="sm"
                          onClick={() => setSelectedHistoryRecord(record)}
                        >
                          Ver Detalle
                        </ExecutiveButton>
                      </div>
                    </GlassPanel>
                  );
                })
              )}
            </div>
          )}

          {/* VISTA AGRUPADA POR SEMANA / MES / AÑO */}
          {historyPeriod !== 'day' && periodGroupedHistory && (
            <div className="space-y-6">
              {periodGroupedHistory.length === 0 ? (
                <ExecutiveEmptyState
                  icon={<BarChart3 className="w-8 h-8 text-amber-400" />}
                  title="No hay registros para este periodo"
                  description="Realiza seguimiento a tus actividades para agrupar tu desempeño por semanas, meses o años."
                />
              ) : (
                periodGroupedHistory.map(group => {
                  const totalHrs = (group.totalProductiveMins / 60).toFixed(1);

                  return (
                    <GlassPanel key={group.key} accentColor="amber" padding="md" className="space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-white/10">
                        <div>
                          <h4 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-amber-400" />
                            {group.title}
                          </h4>
                          <p className="text-xs text-slate-400">{group.records.length} días registrados en este periodo</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">Prom. Cumplimiento</span>
                            <span className="text-xs font-mono font-bold text-amber-400">{group.avgCompliance}%</span>
                          </div>
                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">Prom. Hábitos</span>
                            <span className="text-xs font-mono font-bold text-emerald-300">{group.avgHabits}%</span>
                          </div>
                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">Prom. Objetivos</span>
                            <span className="text-xs font-mono font-bold text-purple-300">{group.avgObjectives}%</span>
                          </div>
                          <div className="p-2 bg-[#132337] border border-white/10 rounded-lg text-center">
                            <span className="text-[9px] uppercase text-slate-400 block font-bold">T. Productivo</span>
                            <span className="text-xs font-mono font-bold text-blue-300">{totalHrs} hrs</span>
                          </div>
                        </div>
                      </div>

                      {/* DESGLOSE DE DÍAS DENTRO DEL AGRUPAMIENTO */}
                      <div className="space-y-2">
                        {group.records.map(rec => (
                          <div
                            key={rec.date}
                            className="p-3 bg-[#132337]/70 border border-white/5 rounded-xl flex items-center justify-between hover:border-amber-400/30 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white">{rec.dayOfWeek}</span>
                              <span className="text-xs font-mono text-slate-400">({rec.date})</span>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono text-amber-300 font-bold">
                                {rec.overallCompliancePercent}% cumplimiento
                              </span>
                              <button
                                onClick={() => setSelectedHistoryRecord(rec)}
                                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                Detalle <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassPanel>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HÁBITOS DIARIOS */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Crear Nuevo Hábito
            </h3>

            <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nombre del hábito (Ej. Meditar 15m, Leer 20 págs, Beber 2L agua)..."
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                className="flex-1 p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
              <ExecutiveButton variant="primary" accentColor="amber" type="submit">
                Agregar Hábito
              </ExecutiveButton>
            </form>
          </GlassPanel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.habits.map(h => {
              const isCheckedToday = Boolean(h.logs && h.logs[todayStr]);
              const streak = DailyLifeCalculations.calculateHabitStreak(h, todayStr);

              return (
                <GlassPanel key={h.id} accentColor="amber" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleHabit(h.id, h.name)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isCheckedToday
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                            : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-transparent'
                        }`}
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold ${isCheckedToday ? 'line-through text-slate-400' : 'text-white'}`}>
                          {h.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">Frecuencia: Diaria</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StreakBadge streak={streak} isCheckedToday={isCheckedToday} />
                      <button
                        onClick={() => setEditingHabit(h)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Editar hábito"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(h.id)}
                        className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                        title="Eliminar hábito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BLOQUES DE TIEMPO / PLAN DEL DÍA */}
      {activeTab === 'timePlan' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Programar Bloque de Tiempo
            </h3>

            <form onSubmit={handleAddTimePlan} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Título del bloque (Ej. Estudio de Física, Almuerzo)..."
                value={tplTitle}
                onChange={e => setTplTitle(e.target.value)}
                className="p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 sm:col-span-2"
                required
              />

              <select
                value={tplCategory}
                onChange={e => setTplCategory(e.target.value as any)}
                className="p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="study">📚 Estudio / Formación</option>
                <option value="commute">🚗 Desplazamiento</option>
                <option value="lunch">🍽️ Almuerzo / Comida</option>
                <option value="rest">☕ Descanso / Pausa</option>
                <option value="gym">🏋️ Gimnasio / Deporte</option>
                <option value="personal">🎟️ Personal / Trámites</option>
              </select>

              <div className="flex gap-2">
                <input
                  type="time"
                  value={tplStart}
                  onChange={e => setTplStart(e.target.value)}
                  className="w-1/2 p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
                <input
                  type="number"
                  placeholder="Minutos"
                  value={tplDuration}
                  onChange={e => setTplDuration(Number(e.target.value))}
                  className="w-1/2 p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <ExecutiveButton variant="primary" accentColor="amber" type="submit">
                  Guardar Bloque de Tiempo
                </ExecutiveButton>
              </div>
            </form>
          </GlassPanel>

          <div className="space-y-3">
            {data.timePlans.filter(p => p.date === todayStr).map(p => (
              <GlassPanel key={p.id} accentColor="amber" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-400/30 text-amber-300">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.title}</h4>
                      <span className="text-xs font-mono text-amber-400">
                        {p.startTime} - {p.endTime} ({p.durationMinutes} min) • Categoría: {p.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTimePlan(p.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TAREAS COTIDIANAS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-amber-400" />
              Nueva Tarea Cotidiana
            </h3>

            <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nombre de la tarea cotidiana..."
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                className="p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 sm:col-span-2"
                required
              />

              <select
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value as any)}
                className="p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="low">Prioridad Baja</option>
                <option value="medium">Prioridad Media</option>
                <option value="high">Prioridad Alta</option>
              </select>

              <div className="sm:col-span-3 flex justify-end">
                <ExecutiveButton variant="primary" accentColor="amber" type="submit">
                  Agregar Tarea
                </ExecutiveButton>
              </div>
            </form>
          </GlassPanel>

          <div className="space-y-3">
            {data.tasks.map(t => (
              <GlassPanel key={t.id} accentColor="amber" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(t.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        t.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                          : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Prioridad: {t.priority}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: OBJETIVOS DEL DÍA */}
      {activeTab === 'objectives' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Fijar Nuevo Objetivo para Hoy
            </h3>

            <form onSubmit={handleAddObjective} className="flex gap-3">
              <input
                type="text"
                placeholder="Título del objetivo del día (Ej. Entregar reporte, Estudiar tema 4)..."
                value={objTitle}
                onChange={e => setObjTitle(e.target.value)}
                className="flex-1 p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
              <ExecutiveButton variant="primary" accentColor="amber" type="submit">
                Guardar Objetivo
              </ExecutiveButton>
            </form>
          </GlassPanel>

          <div className="space-y-3">
            {data.objectives.map(o => (
              <GlassPanel key={o.id} accentColor="amber" padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleObjective(o.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        o.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                          : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold ${o.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {o.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Estado: {o.status === 'completed' ? 'Completado' : 'Pendiente'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteObjective(o.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RUTINAS PASO A PASO */}
      {activeTab === 'routines' && (
        <div className="space-y-6">
          <GlassPanel accentColor="amber" padding="md">
            <h3 className="text-base font-serif font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Crear Nueva Rutina
            </h3>

            <form onSubmit={handleAddRoutine} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la rutina (Ej. Rutina Mañanera)..."
                  value={rtnTitle}
                  onChange={e => setRtnTitle(e.target.value)}
                  className="p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
                <select
                  value={rtnTimeOfDay}
                  onChange={e => setRtnTimeOfDay(e.target.value as any)}
                  className="p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="morning">🌅 Mañana</option>
                  <option value="afternoon">☀️ Tarde</option>
                  <option value="evening">🌙 Noche</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar un paso (Ej. Estiramiento, Ducha)..."
                  value={rtnStepInput}
                  onChange={e => setRtnStepInput(e.target.value)}
                  className="flex-1 p-2.5 bg-[#132337] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <ExecutiveButton
                  variant="outline"
                  accentColor="amber"
                  type="button"
                  onClick={() => {
                    if (rtnStepInput.trim()) {
                      setRtnSteps(prev => [...prev, rtnStepInput.trim()]);
                      setRtnStepInput('');
                    }
                  }}
                >
                  + Paso
                </ExecutiveButton>
              </div>

              {rtnSteps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {rtnSteps.map((step, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-mono border border-amber-400/30 flex items-center gap-1.5">
                      {step}
                      <button
                        type="button"
                        onClick={() => setRtnSteps(prev => prev.filter((_, i) => i !== idx))}
                        className="text-amber-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <ExecutiveButton variant="primary" accentColor="amber" type="submit">
                  Guardar Rutina
                </ExecutiveButton>
              </div>
            </form>
          </GlassPanel>

          <div className="space-y-4">
            {data.routines.map(r => (
              <GlassPanel key={r.id} accentColor="amber" padding="md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    {r.name} <span className="text-xs font-mono text-slate-400">({r.timeOfDay})</span>
                  </h4>
                  <button
                    onClick={() => handleDeleteRoutine(r.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {(r.steps || []).map(step => (
                    <div key={step.id} className="p-2 bg-[#132337] border border-white/10 rounded-xl flex items-center justify-between">
                      <span className={`text-xs ${step.completedToday ? 'line-through text-slate-400' : 'text-white'}`}>
                        {step.title}
                      </span>
                      <button
                        onClick={() => handleToggleRoutineStep(r.id, step.id)}
                        className={`p-1 rounded-lg text-xs font-bold cursor-pointer ${
                          step.completedToday ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE DÍA HISTÓRICO */}
      {selectedHistoryRecord && (
        <ExecutiveModal
          isOpen={Boolean(selectedHistoryRecord)}
          onClose={() => setSelectedHistoryRecord(null)}
          title={`Detalle Histórico: ${selectedHistoryRecord.dayOfWeek}`}
          accentColor="amber"
        >
          <div className="space-y-6 py-2 text-slate-100">
            <div className="p-4 bg-[#132337] border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Fecha del Registro:</span>
                <span className="text-xs font-mono text-amber-400 font-bold">{selectedHistoryRecord.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Cumplimiento General:</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{selectedHistoryRecord.overallCompliancePercent}%</span>
              </div>
              <AnimatedProgressBar percent={selectedHistoryRecord.overallCompliancePercent} color="emerald" height="h-3" />
            </div>

            {/* SECCIÓN HÁBITOS DEL DÍA */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Hábitos en este día ({selectedHistoryRecord.habitsCount.completed}/{selectedHistoryRecord.habitsCount.total})
              </h4>
              {!selectedHistoryRecord.habitsDetail || selectedHistoryRecord.habitsDetail.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hubo hábitos registrados.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedHistoryRecord.habitsDetail.map(h => (
                    <div key={h.id} className="p-2.5 bg-[#132337] border border-white/10 rounded-lg flex items-center justify-between">
                      <span className={`text-xs font-bold ${h.completed ? 'text-white' : 'text-slate-400 line-through'}`}>
                        {h.name}
                      </span>
                      {h.completed ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completado
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN TAREAS DEL DÍA */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tareas en este día ({selectedHistoryRecord.tasksCount.completed}/{selectedHistoryRecord.tasksCount.total})
              </h4>
              {!selectedHistoryRecord.tasksDetail || selectedHistoryRecord.tasksDetail.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hubo tareas agendadas.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedHistoryRecord.tasksDetail.map(t => (
                    <div key={t.id} className="p-2.5 bg-[#132337] border border-white/10 rounded-lg flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-bold ${t.completed ? 'text-white' : 'text-slate-400'}`}>{t.name}</span>
                        {t.category && <span className="text-[10px] text-slate-400 block font-mono">{t.category}</span>}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        t.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.completed ? 'Completada' : 'Incompleta'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECCIÓN OBJETIVOS DEL DÍA */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objetivos del día ({selectedHistoryRecord.objectivesCount.completed}/{selectedHistoryRecord.objectivesCount.total})
              </h4>
              {!selectedHistoryRecord.objectivesDetail || selectedHistoryRecord.objectivesDetail.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hubo objetivos registrados.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedHistoryRecord.objectivesDetail.map(o => (
                    <div key={o.id} className="p-2.5 bg-[#132337] border border-white/10 rounded-lg flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{o.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        o.completed ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {o.completed ? 'Cumplido' : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <ExecutiveButton variant="primary" accentColor="amber" onClick={() => setSelectedHistoryRecord(null)}>
                Cerrar Detalle
              </ExecutiveButton>
            </div>
          </div>
        </ExecutiveModal>
      )}

      {/* MODAL APROVECHAR TIEMPO LIBRE */}
      {selectedFreeGap && (
        <ExecutiveModal
          isOpen={Boolean(selectedFreeGap)}
          onClose={() => setSelectedFreeGap(null)}
          title="Aprovechar Espacio de Tiempo Libre"
          accentColor="amber"
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Detectamos un espacio de <strong className="text-amber-400">{selectedFreeGap.durationMinutes} minutos libre</strong> ({selectedFreeGap.startTime} - {selectedFreeGap.endTime}). ¿Cómo deseas optimizar este tiempo?
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleConfirmFreeGapAction('study')}
                className="w-full p-3.5 bg-[#132337] hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left text-xs text-white font-bold flex items-center gap-3 transition-all cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="block text-sm">📚 Programar Sesión de Estudio / Lectura</span>
                  <span className="text-[11px] text-slate-400 font-normal">Crear bloque de estudio intensivo de {Math.min(selectedFreeGap.durationMinutes, 60)}m</span>
                </div>
              </button>

              <button
                onClick={() => handleConfirmFreeGapAction('task')}
                className="w-full p-3.5 bg-[#132337] hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-left text-xs text-white font-bold flex items-center gap-3 transition-all cursor-pointer"
              >
                <CheckSquare className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="block text-sm">✅ Completar Tarea Pendiente</span>
                  <span className="text-[11px] text-slate-400 font-normal">Asignar este bloque a la primera tarea pendiente de tu lista</span>
                </div>
              </button>

              <button
                onClick={() => handleConfirmFreeGapAction('rest')}
                className="w-full p-3.5 bg-[#132337] hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-left text-xs text-white font-bold flex items-center gap-3 transition-all cursor-pointer"
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
                  DailyLifeStore.updateHabit(editingHabit.id, {
                    name: editingHabit.name,
                    color: editingHabit.color
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

import React, { useState } from 'react';
import { DailyLifeOfficeData } from '../../types/store';
import { DailyLifeStore } from './DailyLifeStore';
import { DailyLifeCalculations } from './DailyLifeCalculations';
import { getTodayDateString } from '../../utils/dates';
import {
  GlassPanel,
  ExecutiveCard,
  ExecutiveButton,
  ExecutiveMetricCard,
  ExecutiveSectionHeader,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveForm,
} from '../../components/executive';
import {
  CheckSquare,
  Flame,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Target,
  Activity,
  Check,
  Zap,
  ListTodo,
  Smile
} from 'lucide-react';

interface Props {
  data: DailyLifeOfficeData;
}

export const DailyLifeView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'habits' | 'timePlan' | 'tasks' | 'objectives'>('habits');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = getTodayDateString();

  // New Habit State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#F59E0B');

  // New Task State
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDate, setNewTaskDate] = useState(todayStr);
  const [newTaskStart, setNewTaskStart] = useState('');

  // New Time Plan State
  const [tplTitle, setTplTitle] = useState('');
  const [tplCategory, setTplCategory] = useState<'commute' | 'lunch' | 'breakfast' | 'dinner' | 'study' | 'rest' | 'gym' | 'shopping' | 'free_time' | 'personal'>('study');
  const [tplStart, setTplStart] = useState('14:00');
  const [tplDuration, setTplDuration] = useState(45);
  const [tplColor, setTplColor] = useState('#F59E0B');

  // New Objective State
  const [objTitle, setObjTitle] = useState('');

  const compliance = DailyLifeCalculations.calculateHabitComplianceToday(data, todayStr);
  const timeDist = DailyLifeCalculations.calculateTimeDistributionToday(data, todayStr);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName) return;
    DailyLifeStore.addHabit({
      name: newHabitName,
      color: newHabitColor,
      frequency: 'daily'
    });
    setNewHabitName('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName) return;
    DailyLifeStore.addTask({
      name: newTaskName,
      priority: newTaskPriority,
      date: newTaskDate || todayStr,
      startTime: newTaskStart || undefined
    });
    setNewTaskName('');
    setNewTaskStart('');
  };

  const handleAddTimePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplTitle) return;
    DailyLifeStore.addTimePlan({
      title: tplTitle,
      category: tplCategory,
      date: todayStr,
      startTime: tplStart,
      durationMinutes: Number(tplDuration),
      color: tplColor
    });
    setTplTitle('');
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objTitle) return;
    DailyLifeStore.addObjective({
      title: objTitle,
      date: todayStr
    });
    setObjTitle('');
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* 1. SECTION HEADER INSTITUCIONAL (AMBER ACCENT) */}
      <ExecutiveSectionHeader
        title="Oficina de Vida Diaria"
        subtitle="Agencia Superior de Organización Cotidiana, Hábitos y Planificación Personal"
        icon={<Activity className="w-6 h-6 text-amber-400" />}
        accentColor="amber"
        badgeText="Hábitos & Rutinas"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar en tareas o hábitos..."
      />

      {/* 2. DASHBOARD DE METRICAS REALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveMetricCard
          title="Efectividad de Hábitos Hoy"
          value={`${compliance.completed} / ${compliance.total}`}
          subtitle={`${compliance.percent}% completado`}
          icon={<Flame className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
        />

        <ExecutiveMetricCard
          title="Tareas Pendientes Hoy"
          value={data.tasks.filter(t => t.date === todayStr && t.status === 'pending').length}
          subtitle={`De ${data.tasks.filter(t => t.date === todayStr).length} programadas`}
          icon={<ListTodo className="w-5 h-5 text-amber-300" />}
          accentColor="amber"
        />

        <ExecutiveMetricCard
          title="Tiempo Planificado Hoy"
          value={`${Object.values(timeDist).reduce((a, b) => a + b, 0)}m`}
          subtitle="Bloques de tiempo personales"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          accentColor="amber"
        />

        <ExecutiveMetricCard
          title="Objetivos Logrados Hoy"
          value={`${data.objectives.filter(o => o.date === todayStr && o.status === 'completed').length} / ${data.objectives.filter(o => o.date === todayStr).length}`}
          subtitle="Metas de la jornada"
          icon={<Target className="w-5 h-5 text-amber-300" />}
          accentColor="amber"
        />
      </div>

      {/* 3. TABS DE NAVEGACIÓN */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('habits')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'habits'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300'
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
              ? 'border-amber-400 bg-amber-500/15 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          Planificación del Tiempo ({data.timePlans.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'tasks'
              ? 'border-amber-400 bg-amber-500/15 text-amber-300'
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
              ? 'border-amber-400 bg-amber-500/15 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4" />
          Objetivos del Día ({data.objectives.length})
        </button>
      </div>

      {/* TAB 1: HÁBITOS */}
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
                    placeholder="Ej: Meditar 10 minutos / Leer 15 páginas"
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
              description="Comienza definiendo tus hábitos personales para mantener rachas de cumplimiento diario."
              accentColor="amber"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.habits.map(h => {
                const isCheckedToday = Boolean(h.logs && h.logs[todayStr]);
                const streak = DailyLifeCalculations.calculateHabitStreak(h, todayStr);

                return (
                  <ExecutiveCard
                    key={h.id}
                    accentColor="amber"
                    accentBorderLeft
                    header={
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-white text-base">{h.name}</h4>
                          <span className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400" /> Racha: {streak} días
                          </span>
                        </div>
                        <button
                          onClick={() => DailyLifeStore.toggleHabitLog(h.id, todayStr)}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCheckedToday
                              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                              : 'border-white/20 hover:border-amber-400 text-slate-400'
                          }`}
                        >
                          {isCheckedToday && <Check className="w-5 h-5" />}
                        </button>
                      </div>
                    }
                    footer={
                      <div className="flex justify-end">
                        <button
                          onClick={() => DailyLifeStore.deleteHabit(h.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    }
                  >
                    <p className="text-xs text-slate-400">
                      Estado hoy: <strong className={isCheckedToday ? 'text-amber-300' : 'text-slate-500'}>{isCheckedToday ? 'Completado' : 'Pendiente'}</strong>
                    </p>
                  </ExecutiveCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLANIFICACIÓN DEL TIEMPO */}
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
              Distribución del Tiempo de Hoy
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Estudio</span>
                <strong className="text-amber-300 text-base">{timeDist.estudio}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Desplazamiento</span>
                <strong className="text-amber-300 text-base">{timeDist.desplazamiento}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Alimentación</span>
                <strong className="text-amber-300 text-base">{timeDist.alimentacion}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Descanso</span>
                <strong className="text-amber-300 text-base">{timeDist.descanso}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Gimnasio</span>
                <strong className="text-amber-300 text-base">{timeDist.gimnasio}m</strong>
              </div>
              <div className="p-2.5 bg-[#132337] border border-white/10 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Personal</span>
                <strong className="text-amber-300 text-base">{timeDist.personal}m</strong>
              </div>
            </div>
          </GlassPanel>

          {/* LISTA DE BLOQUES */}
          <div className="space-y-2.5">
            {data.timePlans.filter(p => p.date === todayStr).map(p => (
              <ExecutiveCard key={p.id} accentColor="amber">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-serif font-bold text-white text-sm">{p.title}</h4>
                    <span className="text-slate-400 font-mono">Categoría: {p.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExecutiveBadge variant="subtle" accentColor="amber">
                      {p.startTime} – {p.endTime} ({p.durationMinutes}m)
                    </ExecutiveBadge>
                    <button
                      onClick={() => DailyLifeStore.deleteTimePlan(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </ExecutiveCard>
            ))}
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
            <div className="space-y-2.5">
              {data.tasks.map(t => (
                <ExecutiveCard key={t.id} accentColor="amber">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.status === 'completed'}
                        onChange={() => DailyLifeStore.toggleTaskStatus(t.id)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                      />
                      <span className={`font-serif text-sm ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-white font-bold'}`}>
                        {t.name}
                      </span>
                      {t.startTime && <span className="text-[10px] font-mono text-amber-300">⏰ {t.startTime}</span>}
                    </div>

                    <button
                      onClick={() => DailyLifeStore.deleteTask(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </ExecutiveCard>
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
            <div className="space-y-2.5">
              {data.objectives.map(o => (
                <ExecutiveCard key={o.id} accentColor="amber">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={o.status === 'completed'}
                        onChange={() => DailyLifeStore.toggleObjective(o.id)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                      />
                      <span className={`font-serif text-sm ${o.status === 'completed' ? 'line-through text-slate-500' : 'text-white font-bold'}`}>
                        {o.title}
                      </span>
                    </div>

                    <button
                      onClick={() => DailyLifeStore.deleteObjective(o.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

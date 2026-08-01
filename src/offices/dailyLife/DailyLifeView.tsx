import React, { useState } from 'react';
import { DailyLifeOfficeData } from '../../types/store';
import { DailyLifeStore } from './DailyLifeStore';
import { DailyLifeCalculations } from './DailyLifeCalculations';
import { getTodayDateString } from '../../utils/dates';
import { CheckSquare, Flame, Clock, Plus, Trash2, Calendar, Target, Activity, Check } from 'lucide-react';

interface Props {
  data: DailyLifeOfficeData;
}

export const DailyLifeView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'habits' | 'tasks' | 'timePlan' | 'routines' | 'objectives'>('habits');
  const todayStr = getTodayDateString();

  // New Habit State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#10B981');

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
  const [tplColor, setTplColor] = useState('#3B82F6');

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
    <div className="space-y-6">
      {/* 1. ENCABEZADO INSTITUCIONAL DE LA OFICINA */}
      <div className="bg-presidential-navy text-white p-6 rounded-lg border-b-2 border-gold-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-900/60 rounded border border-emerald-700/50 text-emerald-300">
              <Activity className="w-6 h-6 text-gold-accent" />
            </span>
            <h2 className="text-2xl font-serif-presidential font-bold tracking-tight text-white">
              Oficina de Vida Diaria
            </h2>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Agencia Superior de Organización Cotidiana, Hábitos y Planificación Personal
          </p>
        </div>
      </div>

      {/* 2. PANEL GENERAL CON INDICADORES EJECUTIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumplimiento de Hábitos Hoy</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {compliance.completed} / {compliance.total}
          </div>
          <div className="text-xs text-emerald-600 font-bold mt-1">
            {compliance.percent}% de efectividad
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tareas Pendientes Hoy</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {data.tasks.filter(t => t.date === todayStr && t.status === 'pending').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            De {data.tasks.filter(t => t.date === todayStr).length} tareas programadas
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiempo Planificado Hoy</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {Object.values(timeDist).reduce((a, b) => a + b, 0)} <span className="text-xs font-sans text-slate-500">mins</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bloques de tiempo personales
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Objetivos del Día</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {data.objectives.filter(o => o.date === todayStr && o.status === 'completed').length} / {data.objectives.filter(o => o.date === todayStr).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Metas diarias completadas
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          onClick={() => setActiveTab('habits')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'habits' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Hábitos ({data.habits.length})
        </button>
        <button
          onClick={() => setActiveTab('timePlan')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'timePlan' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Planificación del Tiempo
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'tasks' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Tareas Cotidianas
        </button>
        <button
          onClick={() => setActiveTab('objectives')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'objectives' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Objetivos Diarios
        </button>
      </div>

      {/* TAB 1: HÁBITOS */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          <form onSubmit={handleAddHabit} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Nombre del nuevo hábito (Ej: Meditar 10 minutos)"
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              className="text-xs p-2 border rounded bg-white flex-1 min-w-[200px]"
              required
            />
            <input
              type="color"
              value={newHabitColor}
              onChange={e => setNewHabitColor(e.target.value)}
              className="w-10 h-8 p-1 border rounded cursor-pointer bg-white"
            />
            <button type="submit" className="text-xs bg-emerald-800 text-white font-bold px-4 py-2 rounded hover:bg-emerald-700">
              + Crear Hábito
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.habits.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded border border-dashed border-slate-200">
                No hay hábitos configurados. Comienza agregando hábitos diarios.
              </div>
            ) : (
              data.habits.map(h => {
                const isCheckedToday = Boolean(h.logs && h.logs[todayStr]);
                const streak = DailyLifeCalculations.calculateHabitStreak(h, todayStr);

                return (
                  <div key={h.id} className="presidential-card p-4 rounded-lg flex justify-between items-center" style={{ borderLeftWidth: '4px', borderLeftColor: h.color }}>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-1">
                        <Flame className="w-3.5 h-3.5" /> Racha: {streak} días
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => DailyLifeStore.toggleHabitLog(h.id, todayStr)}
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${isCheckedToday ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-500'}`}
                      >
                        {isCheckedToday && <Check className="w-5 h-5" />}
                      </button>
                      <button onClick={() => DailyLifeStore.deleteHabit(h.id)} className="text-slate-400 hover:text-rose-600 text-xs p-1">
                        ×
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PLANIFICACIÓN DEL TIEMPO */}
      {activeTab === 'timePlan' && (
        <div className="space-y-6">
          <div className="presidential-card p-5 rounded-lg space-y-4">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-lg">
              Programar Bloque Personal
            </h3>
            <form onSubmit={handleAddTimePlan} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la actividad</label>
                <input
                  type="text"
                  placeholder="Ej: Desplazamiento a Universidad"
                  value={tplTitle}
                  onChange={e => setTplTitle(e.target.value)}
                  className="w-full text-xs p-2 border rounded bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Categoría</label>
                <select value={tplCategory} onChange={e => setTplCategory(e.target.value as any)} className="w-full text-xs p-2 border rounded bg-white text-slate-900">
                  <option value="study">Estudio independiente</option>
                  <option value="commute">Desplazamiento</option>
                  <option value="lunch">Almuerzo</option>
                  <option value="breakfast">Desayuno</option>
                  <option value="dinner">Cena</option>
                  <option value="rest">Descanso</option>
                  <option value="gym">Gimnasio</option>
                  <option value="shopping">Compras</option>
                  <option value="free_time">Tiempo libre</option>
                  <option value="personal">Actividad personal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hora Inicio y Duración</label>
                <div className="flex gap-1">
                  <input type="time" value={tplStart} onChange={e => setTplStart(e.target.value)} className="w-1/2 text-xs p-2 border rounded bg-white" />
                  <select value={tplDuration} onChange={e => setTplDuration(Number(e.target.value))} className="w-1/2 text-xs p-2 border rounded bg-white">
                    <option value={20}>20 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="bg-blue-900 text-white font-bold text-xs p-2 rounded hover:bg-blue-800">
                + Agregar Bloque
              </button>
            </form>
          </div>

          {/* Panel de Distribución del Tiempo */}
          <div className="presidential-card p-5 rounded-lg">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-base mb-3">
              Distribución del Tiempo de Hoy
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs text-blue-800 font-bold">Estudio</div>
                <div className="text-lg font-bold text-slate-900">{timeDist.estudio}m</div>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                <div className="text-xs text-amber-800 font-bold">Desplazamiento</div>
                <div className="text-lg font-bold text-slate-900">{timeDist.desplazamiento}m</div>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                <div className="text-xs text-emerald-800 font-bold">Alimentación</div>
                <div className="text-lg font-bold text-slate-900">{timeDist.alimentacion}m</div>
              </div>
              <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                <div className="text-xs text-purple-800 font-bold">Descanso</div>
                <div className="text-lg font-bold text-slate-900">{timeDist.descanso}m</div>
              </div>
              <div className="p-2 bg-rose-50 border border-rose-200 rounded">
                <div className="text-xs text-rose-800 font-bold">Gimnasio</div>
                <div className="text-lg font-bold text-slate-900">{timeDist.gimnasio}m</div>
              </div>
              <div className="p-2 bg-slate-100 border border-slate-200 rounded">
                <div className="text-xs text-slate-800 font-bold">Personal</div>
                <div className="text-lg font-bold text-slate-900">{timeDist.personal}m</div>
              </div>
            </div>
          </div>

          {/* Bloques del día */}
          <div className="space-y-2">
            {data.timePlans.filter(p => p.date === todayStr).map(p => (
              <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center" style={{ borderLeftWidth: '4px', borderLeftColor: p.color }}>
                <div>
                  <span className="font-bold text-slate-900 text-sm">{p.title}</span>
                  <span className="text-xs text-slate-500 ml-2">[{p.category}]</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded">
                    {p.startTime} - {p.endTime} ({p.durationMinutes} min)
                  </span>
                  <button onClick={() => DailyLifeStore.deleteTimePlan(p.id)} className="text-slate-400 hover:text-rose-600">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TAREAS COTIDIANAS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTask} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Nueva tarea cotidiana..."
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              className="text-xs p-2 border rounded bg-white flex-1 min-w-[200px]"
              required
            />
            <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)} className="text-xs p-2 border rounded bg-white">
              <option value="low">Baja Prioridad</option>
              <option value="medium">Media Prioridad</option>
              <option value="high">Alta Prioridad</option>
            </select>
            <input type="time" value={newTaskStart} onChange={e => setNewTaskStart(e.target.value)} className="text-xs p-2 border rounded bg-white" placeholder="Hora (opcional)" />
            <button type="submit" className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded hover:bg-slate-800">
              + Guardar Tarea
            </button>
          </form>

          <div className="space-y-2">
            {data.tasks.map(t => (
              <div key={t.id} className={`p-3 bg-white border rounded-lg flex justify-between items-center ${t.status === 'completed' ? 'opacity-60 bg-slate-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.status === 'completed'}
                    onChange={() => DailyLifeStore.toggleTaskStatus(t.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className={`text-sm font-semibold ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {t.name}
                  </span>
                  {t.startTime && (
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      ⏰ {t.startTime}
                    </span>
                  )}
                </div>
                <button onClick={() => DailyLifeStore.deleteTask(t.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OBJETIVOS DIARIOS */}
      {activeTab === 'objectives' && (
        <div className="space-y-4">
          <form onSubmit={handleAddObjective} className="presidential-card p-4 rounded-lg flex gap-2">
            <input
              type="text"
              placeholder="Nuevo objetivo del día (Ej: Leer 30 páginas de economía)..."
              value={objTitle}
              onChange={e => setObjTitle(e.target.value)}
              className="text-xs p-2 border rounded bg-white flex-1"
              required
            />
            <button type="submit" className="text-xs bg-amber-600 text-white font-bold px-4 py-2 rounded hover:bg-amber-700">
              + Agregar Objetivo
            </button>
          </form>

          <div className="space-y-2">
            {data.objectives.map(o => (
              <div key={o.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={o.status === 'completed'}
                    onChange={() => DailyLifeStore.toggleObjective(o.id)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className={`text-sm font-semibold ${o.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {o.title}
                  </span>
                </div>
                <button onClick={() => DailyLifeStore.deleteObjective(o.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

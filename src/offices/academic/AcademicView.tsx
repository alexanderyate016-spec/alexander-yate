import React, { useState } from 'react';
import { AcademicOfficeData, AcademicSubject, AcademicSemester } from '../../types/store';
import { AcademicStore } from './AcademicStore';
import { AcademicCalculations } from './AcademicCalculations';
import { getTodayDateString, getDayOfWeekName } from '../../utils/dates';
import { formatGrade, formatPercent } from '../../utils/formatters';
import { GraduationCap, BookOpen, Plus, Trash2, Calendar, Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  data: AcademicOfficeData;
  onOpenOffice?: (officeKey: string) => void;
}

export const AcademicView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'semesters' | 'calculator'>('overview');
  
  // Modals state
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [newSemStart, setNewSemStart] = useState('');
  const [newSemEnd, setNewSemEnd] = useState('');

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjProf, setSubjProf] = useState('');
  const [subjColor, setSubjColor] = useState('#3B82F6');
  const [subjClassroom, setSubjClassroom] = useState('');

  // Selected subject for detail editing
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(data.subjects[0]?.id || null);

  // New Cut state
  const [newCutName, setNewCutName] = useState('');
  const [newCutWeight, setNewCutWeight] = useState(30);

  // New Activity state
  const [newActCutId, setNewActCutId] = useState('');
  const [newActName, setNewActName] = useState('');
  const [newActType, setNewActType] = useState<'Parcial' | 'Quiz' | 'Taller' | 'Laboratorio' | 'Exposición' | 'Proyecto' | 'Otro'>('Parcial');
  const [newActDate, setNewActDate] = useState(getTodayDateString());
  const [newActWeight, setNewActWeight] = useState(20);

  // New Session state
  const [sessionDay, setSessionDay] = useState(1);
  const [sessionStart, setSessionStart] = useState('08:00');
  const [sessionEnd, setSessionEnd] = useState('10:00');
  const [sessionRoom, setSessionRoom] = useState('');

  const activeSemester = data.semesters.find(s => s.isActive) || data.semesters[0];
  const activeSemesterSubjects = data.subjects.filter(s => activeSemester ? s.semesterId === activeSemester.id : true);
  
  const selectedSubject = data.subjects.find(s => s.id === selectedSubjectId) || activeSemesterSubjects[0];

  const todayStr = getTodayDateString();
  const gpa = activeSemester ? AcademicCalculations.calculateSemesterGPA(activeSemester.id, data.subjects) : 0;
  const todayClasses = AcademicCalculations.getTodayClasses(activeSemesterSubjects, todayStr);
  const upcomingEvals = AcademicCalculations.getUpcomingEvaluations(activeSemesterSubjects);

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemName) return;
    AcademicStore.addSemester({
      name: newSemName,
      startDate: newSemStart || todayStr,
      endDate: newSemEnd || todayStr,
      isActive: true
    });
    setNewSemName('');
    setShowSemesterModal(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName || !activeSemester) return;
    AcademicStore.addSubject({
      semesterId: activeSemester.id,
      name: subjName,
      professor: subjProf || 'Por asignar',
      color: subjColor,
      classroom: subjClassroom,
      scheduleSessions: [],
      cuts: []
    });
    setSubjName('');
    setSubjProf('');
    setShowSubjectModal(false);
  };

  const handleAddCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !newCutName) return;
    AcademicStore.addCut(selectedSubject.id, newCutName, Number(newCutWeight));
    setNewCutName('');
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !newActCutId || !newActName) return;
    AcademicStore.addActivity(selectedSubject.id, newActCutId, {
      name: newActName,
      type: newActType,
      date: newActDate,
      weightPercent: Number(newActWeight),
      status: 'pending'
    });
    setNewActName('');
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    const newSessions = [
      ...selectedSubject.scheduleSessions,
      {
        id: 'ses_' + Date.now(),
        day: Number(sessionDay),
        startTime: sessionStart,
        endTime: sessionEnd,
        classroom: sessionRoom || selectedSubject.classroom
      }
    ];
    AcademicStore.updateSubject(selectedSubject.id, { scheduleSessions: newSessions });
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!selectedSubject) return;
    const filtered = selectedSubject.scheduleSessions.filter(s => s.id !== sessionId);
    AcademicStore.updateSubject(selectedSubject.id, { scheduleSessions: filtered });
  };

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO INSTITUCIONAL DE LA OFICINA */}
      <div className="bg-presidential-navy text-white p-6 rounded-lg border-b-2 border-gold-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-900/60 rounded border border-blue-700/50 text-blue-300">
              <GraduationCap className="w-6 h-6 text-gold-accent" />
            </span>
            <h2 className="text-2xl font-serif-presidential font-bold tracking-tight text-white">
              Oficina Académica
            </h2>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Agencia Superior de Coordinación Universitaria y Rendimiento Académico
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSemesterModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-gold-accent font-semibold rounded border border-gold-accent/40 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Semestre
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            disabled={!activeSemester}
            className="px-3 py-2 bg-gold-accent hover:bg-amber-600 text-xs text-slate-950 font-bold rounded flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Agregar Materia
          </button>
        </div>
      </div>

      {/* 2. PANEL GENERAL ACADÉMICO (INDICADORES EJECUTIVOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Semestre Activo</div>
          <div className="text-lg font-bold text-slate-900 mt-1 truncate">
            {activeSemester ? activeSemester.name : 'Sin Semestre Registrar'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {activeSemesterSubjects.length} Materia(s) inscrita(s)
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promedio del Semestre (GPA)</div>
          <div className="text-2xl font-serif-presidential font-bold text-blue-900 mt-1">
            {formatGrade(gpa)} <span className="text-xs font-sans text-slate-500">/ 5.0</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Calculado dinámicamente
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clases para Hoy</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {todayClasses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {todayClasses.length > 0 ? `Primera: ${todayClasses[0].session.startTime}` : 'Sin clases programadas'}
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evaluaciones Próximas</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {upcomingEvals.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            En los próximos días
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN DE LA OFICINA */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-blue-900 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Vista General
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'subjects' ? 'border-blue-900 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Materias y Calificaciones ({activeSemesterSubjects.length})
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'calculator' ? 'border-blue-900 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Calculadora de Aprobación
        </button>
        <button
          onClick={() => setActiveTab('semesters')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'semesters' ? 'border-blue-900 text-blue-950' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Gestión de Semestres
        </button>
      </div>

      {/* TAB 1: VISTA GENERAL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clases del Día */}
          <div className="presidential-card p-5 rounded-lg">
            <h3 className="font-serif-presidential font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-900" /> Clases de Hoy
            </h3>
            {todayClasses.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
                No tienes sesiones de clase registradas para el día de hoy.
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map(({ subject, session }, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center" style={{ borderLeftWidth: '4px', borderLeftColor: subject.color }}>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{subject.name}</div>
                      <div className="text-xs text-slate-600">Prof. {subject.professor} {session.classroom ? `| Aula: ${session.classroom}` : ''}</div>
                    </div>
                    <div className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-slate-300 text-slate-800">
                      {session.startTime} - {session.endTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximas Evaluaciones */}
          <div className="presidential-card p-5 rounded-lg">
            <h3 className="font-serif-presidential font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" /> Próximas Evaluaciones
            </h3>
            {upcomingEvals.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
                No hay evaluaciones programadas en el radar.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvals.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold px-2 py-0.5 rounded text-white inline-block mb-1" style={{ backgroundColor: ev.subjectColor }}>
                        {ev.subjectName}
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{ev.activity.name}</div>
                      <div className="text-xs text-slate-500">Corte: {ev.cutName} ({ev.activity.weightPercent}%)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{ev.activity.date}</div>
                      <div className="text-xs text-slate-500">{ev.activity.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MATERIAS Y CALIFICACIONES */}
      {activeTab === 'subjects' && (
        <div>
          {activeSemesterSubjects.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-slate-200">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-serif-presidential font-bold text-slate-800">No hay materias en este semestre</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-4">
                Comienza registrando tus asignaturas universitarias para organizar tu horario y control de notas.
              </p>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="px-4 py-2 bg-blue-900 text-white font-bold text-sm rounded hover:bg-blue-800 transition-colors"
              >
                Agregar Primera Materia
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de materias */}
              <div className="space-y-2 lg:col-span-1">
                <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Materias Registradas</div>
                {activeSemesterSubjects.map(sub => {
                  const { average, hasGrades } = AcademicCalculations.calculateSubjectAverage(sub);
                  const isSelected = sub.id === selectedSubjectId;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`p-3 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-blue-50 border-blue-900 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: sub.color }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${hasGrades ? (average >= 3.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') : 'bg-slate-100 text-slate-600'}`}>
                          {hasGrades ? formatGrade(average) : 'Sin notas'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Prof. {sub.professor}</div>
                    </div>
                  );
                })}
              </div>

              {/* Detalle de la materia seleccionada */}
              {selectedSubject && (
                <div className="lg:col-span-2 space-y-6">
                  <div className="presidential-card p-5 rounded-lg">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Materia Seleccionada</span>
                        <h3 className="text-2xl font-serif-presidential font-bold text-slate-900" style={{ color: selectedSubject.color }}>
                          {selectedSubject.name}
                        </h3>
                        <p className="text-sm text-slate-600">Profesor: {selectedSubject.professor} {selectedSubject.classroom ? `| Aula: ${selectedSubject.classroom}` : ''}</p>
                      </div>
                      <button
                        onClick={() => AcademicStore.deleteSubject(selectedSubject.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 text-xs flex items-center gap-1"
                        title="Eliminar materia"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>

                    {/* Horarios de Clase */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-900" /> Horario de Sesiones
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedSubject.scheduleSessions.map((s, idx) => (
                          <div key={idx} className="bg-slate-100 text-slate-800 text-xs px-3 py-1.5 rounded border border-slate-200 flex items-center gap-2">
                            <span><strong>{getDayOfWeekName(s.day)}:</strong> {s.startTime} - {s.endTime}</span>
                            <button onClick={() => handleDeleteSession(s.id)} className="text-rose-500 hover:text-rose-700">×</button>
                          </div>
                        ))}
                      </div>

                      {/* Añadir Sesión */}
                      <form onSubmit={handleAddSession} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                        <select value={sessionDay} onChange={e => setSessionDay(Number(e.target.value))} className="text-xs p-1.5 border rounded bg-white">
                          <option value={1}>Lunes</option>
                          <option value={2}>Martes</option>
                          <option value={3}>Miércoles</option>
                          <option value={4}>Jueves</option>
                          <option value={5}>Viernes</option>
                          <option value={6}>Sábado</option>
                          <option value={7}>Domingo</option>
                        </select>
                        <input type="time" value={sessionStart} onChange={e => setSessionStart(e.target.value)} className="text-xs p-1.5 border rounded bg-white" />
                        <span className="text-xs text-slate-400">a</span>
                        <input type="time" value={sessionEnd} onChange={e => setSessionEnd(e.target.value)} className="text-xs p-1.5 border rounded bg-white" />
                        <input type="text" placeholder="Aula (opcional)" value={sessionRoom} onChange={e => setSessionRoom(e.target.value)} className="text-xs p-1.5 border rounded bg-white w-24" />
                        <button type="submit" className="text-xs bg-slate-900 text-white font-semibold px-2.5 py-1.5 rounded hover:bg-slate-800">
                          + Añadir
                        </button>
                      </form>
                    </div>

                    {/* Cortes y Evaluaciones */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-900" /> Estructura de Cortes y Evaluaciones
                        </h4>
                      </div>

                      {/* Crear Corte */}
                      <form onSubmit={handleAddCut} className="flex items-center gap-2 bg-slate-50 p-3 rounded border border-slate-200 mb-4">
                        <input
                          type="text"
                          placeholder="Nombre del Corte (Ej: Corte 1)"
                          value={newCutName}
                          onChange={e => setNewCutName(e.target.value)}
                          className="text-xs p-1.5 border rounded bg-white flex-1"
                        />
                        <div className="flex items-center gap-1 text-xs">
                          <span>Peso (%):</span>
                          <input
                            type="number"
                            value={newCutWeight}
                            onChange={e => setNewCutWeight(Number(e.target.value))}
                            className="w-16 text-xs p-1.5 border rounded bg-white"
                          />
                        </div>
                        <button type="submit" className="text-xs bg-blue-900 text-white font-semibold px-3 py-1.5 rounded hover:bg-blue-800">
                          + Agregar Corte
                        </button>
                      </form>

                      {/* Lista de Cortes */}
                      <div className="space-y-4">
                        {selectedSubject.cuts?.map(cut => (
                          <div key={cut.id} className="border border-slate-200 rounded p-4 bg-white shadow-xs">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                              <span className="font-bold text-slate-900 text-sm">{cut.cutName}</span>
                              <span className="text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                                Peso: {cut.cutWeightPercent}%
                              </span>
                            </div>

                            {/* Actividades del corte */}
                            <div className="space-y-2 mb-3">
                              {cut.activities.map(act => (
                                <div key={act.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded text-xs border border-slate-200">
                                  <div>
                                    <span className="font-bold text-slate-900">{act.name}</span>
                                    <span className="text-slate-500 ml-2">({act.type} - {act.weightPercent}% del corte)</span>
                                    <span className="text-slate-400 ml-2">[{act.date}]</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Nota:</span>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="5"
                                      value={act.grade !== undefined ? act.grade : ''}
                                      onChange={e => {
                                        const val = e.target.value === '' ? undefined : Number(e.target.value);
                                        AcademicStore.updateActivity(selectedSubject.id, cut.id, act.id, {
                                          grade: val,
                                          status: val !== undefined ? 'graded' : 'pending'
                                        });
                                      }}
                                      placeholder="0.0"
                                      className="w-14 p-1 border rounded text-center font-bold bg-white text-slate-900"
                                    />
                                    <button
                                      onClick={() => AcademicStore.deleteActivity(selectedSubject.id, cut.id, act.id)}
                                      className="text-slate-400 hover:text-rose-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Formulario rápida para añadir actividad al corte */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                              <input
                                type="text"
                                placeholder="Nueva Evaluación"
                                id={`act_name_${cut.id}`}
                                className="text-xs p-1 border rounded bg-white flex-1"
                              />
                              <select id={`act_type_${cut.id}`} className="text-xs p-1 border rounded bg-white">
                                <option value="Parcial">Parcial</option>
                                <option value="Quiz">Quiz</option>
                                <option value="Taller">Taller</option>
                                <option value="Laboratorio">Laboratorio</option>
                                <option value="Exposición">Exposición</option>
                                <option value="Proyecto">Proyecto</option>
                              </select>
                              <input type="date" id={`act_date_${cut.id}`} defaultValue={todayStr} className="text-xs p-1 border rounded bg-white" />
                              <input type="number" id={`act_weight_${cut.id}`} defaultValue={20} placeholder="%" className="w-14 text-xs p-1 border rounded bg-white" />
                              <button
                                type="button"
                                onClick={() => {
                                  const nameInput = document.getElementById(`act_name_${cut.id}`) as HTMLInputElement;
                                  const typeInput = document.getElementById(`act_type_${cut.id}`) as HTMLSelectElement;
                                  const dateInput = document.getElementById(`act_date_${cut.id}`) as HTMLInputElement;
                                  const weightInput = document.getElementById(`act_weight_${cut.id}`) as HTMLInputElement;
                                  if (nameInput?.value) {
                                    AcademicStore.addActivity(selectedSubject.id, cut.id, {
                                      name: nameInput.value,
                                      type: typeInput.value as any,
                                      date: dateInput.value || todayStr,
                                      weightPercent: Number(weightInput.value) || 20,
                                      status: 'pending'
                                    });
                                    nameInput.value = '';
                                  }
                                }}
                                className="text-xs bg-slate-800 text-white font-semibold px-2.5 py-1 rounded hover:bg-slate-700"
                              >
                                + Agregar Actividad
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CALCULADORA DE APROBACIÓN */}
      {activeTab === 'calculator' && (
        <div className="space-y-4">
          <div className="presidential-card p-6 rounded-lg">
            <h3 className="text-lg font-serif-presidential font-bold text-slate-900 mb-2">
              Análisis Predictivo de Aprobación
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              El sistema calcula dinámicamente la nota requerida en el porcentaje restante para alcanzar el mínimo aprobatorio oficial (3.0 / 5.0).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSemesterSubjects.map(sub => {
                const { average, totalGradedWeight } = AcademicCalculations.calculateSubjectAverage(sub);
                const { requiredGrade, remainingWeight, achievable } = AcademicCalculations.calculateRequiredGradeToPass(sub, 3.0);

                return (
                  <div key={sub.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-white text-slate-700 border border-slate-200">
                        {totalGradedWeight}% Calificado
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Promedio Acumulado:</span>
                      <span className="font-bold text-slate-900">{formatGrade(average)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Porcentaje Restante:</span>
                      <span className="font-bold text-slate-900">{remainingWeight}%</span>
                    </div>

                    <div className={`p-3 rounded border text-xs font-semibold ${achievable ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'}`}>
                      {remainingWeight <= 0 ? (
                        <span>Materia finalizada. Promedio final: {formatGrade(average)}</span>
                      ) : (
                        <div>
                          <div>Necesitas obtener promedio de:</div>
                          <div className="text-xl font-serif-presidential font-bold mt-1">
                            {formatGrade(requiredGrade)} <span className="text-xs font-sans font-normal">en el {remainingWeight}% restante</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GESTIÓN DE SEMESTRES */}
      {activeTab === 'semesters' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-presidential font-bold text-lg text-slate-900">
              Historial de Semestres Universitarios
            </h3>
            <button
              onClick={() => setShowSemesterModal(true)}
              className="px-3 py-1.5 bg-blue-900 text-white text-xs font-bold rounded hover:bg-blue-800"
            >
              + Nuevo Semestre
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.semesters.map(sem => (
              <div key={sem.id} className={`p-4 rounded-lg border bg-white ${sem.isActive ? 'border-blue-900 ring-2 ring-blue-900/10' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 text-base">{sem.name}</span>
                    {sem.isActive && (
                      <span className="ml-2 bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded">
                        Activo
                      </span>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {sem.startDate} - {sem.endDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!sem.isActive && (
                      <button
                        onClick={() => AcademicStore.setActiveSemester(sem.id)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded"
                      >
                        Activar
                      </button>
                    )}
                    <button
                      onClick={() => AcademicStore.deleteSemester(sem.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs p-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL SEMESTRE */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-serif-presidential font-bold text-slate-900 mb-4">Registrar Nuevo Semestre</h3>
            <form onSubmit={handleCreateSemester} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Semestre *</label>
                <input
                  type="text"
                  placeholder="Ej: 2026-II"
                  value={newSemName}
                  onChange={e => setNewSemName(e.target.value)}
                  className="w-full p-2 border rounded text-sm text-slate-900 bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={newSemStart}
                    onChange={e => setNewSemStart(e.target.value)}
                    className="w-full p-2 border rounded text-xs text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Finalización</label>
                  <input
                    type="date"
                    value={newSemEnd}
                    onChange={e => setNewSemEnd(e.target.value)}
                    className="w-full p-2 border rounded text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSemesterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded"
                >
                  Guardar Semestre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MATERIA */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-serif-presidential font-bold text-slate-900 mb-4">Registrar Nueva Materia</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Asignatura *</label>
                <input
                  type="text"
                  placeholder="Ej: Cálculo Multivariado"
                  value={subjName}
                  onChange={e => setSubjName(e.target.value)}
                  className="w-full p-2 border rounded text-sm text-slate-900 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Profesor / Docente</label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Roberto Gómez"
                  value={subjProf}
                  onChange={e => setSubjProf(e.target.value)}
                  className="w-full p-2 border rounded text-sm text-slate-900 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Color Distintivo</label>
                  <input
                    type="color"
                    value={subjColor}
                    onChange={e => setSubjColor(e.target.value)}
                    className="w-full h-9 p-1 border rounded cursor-pointer bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Aula Predeterminada</label>
                  <input
                    type="text"
                    placeholder="Ej: Salón 302-B"
                    value={subjClassroom}
                    onChange={e => setSubjClassroom(e.target.value)}
                    className="w-full p-2 border rounded text-sm text-slate-900 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded"
                >
                  Crear Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

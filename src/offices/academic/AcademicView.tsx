import React, { useState, useMemo } from 'react';
import { 
  AcademicOfficeData, 
  AcademicSubject, 
  AcademicSemester, 
  AcademicSession, 
  AcademicCut, 
  AcademicEvaluationActivity 
} from '../../types/store';
import { AcademicStore } from './AcademicStore';
import { AcademicCalculations } from './AcademicCalculations';
import { getTodayDateString, getDayOfWeekName } from '../../utils/dates';
import { formatGrade } from '../../utils/formatters';
import { 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  Sliders, 
  Target, 
  UserCheck, 
  MapPin, 
  Percent, 
  Filter
} from 'lucide-react';

interface Props {
  data: AcademicOfficeData;
  onOpenOffice?: (officeKey: string) => void;
}

export const AcademicView: React.FC<Props> = ({ data }) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'my_day' | 'subjects' | 'schedule' | 'evaluations' | 'progress' | 'semesters'>('my_day');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded Subject for Inline Card view
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [subjectSubTab, setSubjectSubTab] = useState<'info' | 'schedule' | 'evaluations' | 'grades'>('info');

  // Modals & Slideovers State
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<AcademicSemester | null>(null);
  const [semName, setSemName] = useState('');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjProf, setSubjProf] = useState('');
  const [subjColor, setSubjColor] = useState('#3B82F6');
  const [subjClassroom, setSubjClassroom] = useState('');

  // Session Edit Modal (e.g. from Horario click)
  const [editingSessionData, setEditingSessionData] = useState<{
    subjectId: string;
    subjectName: string;
    session: AcademicSession;
  } | null>(null);

  // New Session Form (inside subject or modal)
  const [sessionDay, setSessionDay] = useState(1);
  const [sessionStart, setSessionStart] = useState('08:00');
  const [sessionEnd, setSessionEnd] = useState('10:00');
  const [sessionRoom, setSessionRoom] = useState('');

  // New Cut Form
  const [newCutName, setNewCutName] = useState('');
  const [newCutWeight, setNewCutWeight] = useState(30);

  // Editing Cut Modal
  const [editingCut, setEditingCut] = useState<{ subjectId: string; cut: AcademicCut } | null>(null);
  const [editCutName, setEditCutName] = useState('');
  const [editCutWeight, setEditCutWeight] = useState(30);

  // Editing Activity Modal
  const [editingActivity, setEditingActivity] = useState<{
    subjectId: string;
    cutId: string;
    activity: AcademicEvaluationActivity;
  } | null>(null);

  const todayStr = getTodayDateString();

  // Active Semester & Subjects
  const semesters = data?.semesters || [];
  const subjects = data?.subjects || [];

  const activeSemester = semesters.find(s => s.isActive) || semesters[0] || null;
  const activeSubjects = useMemo(() => {
    if (!activeSemester) return [];
    return subjects.filter(s => s.semesterId === activeSemester.id);
  }, [subjects, activeSemester]);

  // Filtered Subjects based on search
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return activeSubjects;
    const q = searchQuery.toLowerCase();
    return activeSubjects.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.professor.toLowerCase().includes(q) ||
      (s.classroom && s.classroom.toLowerCase().includes(q))
    );
  }, [activeSubjects, searchQuery]);

  // Calculations
  const gpa = activeSemester ? AcademicCalculations.calculateSemesterGPA(activeSemester.id, subjects) : 0;
  const todayClasses = AcademicCalculations.getTodayClasses(activeSubjects, todayStr);
  const groupedEvals = AcademicCalculations.getGroupedEvaluations(activeSubjects, todayStr);
  const semesterProgress = AcademicCalculations.calculateSemesterProgress(activeSemester || undefined);
  const goalMessage = AcademicCalculations.getAcademicGoalMessage(activeSubjects, 4.0);

  // Handlers for Semester
  const handleOpenSemesterModal = (sem?: AcademicSemester) => {
    if (sem) {
      setEditingSemester(sem);
      setSemName(sem.name);
      setSemStart(sem.startDate);
      setSemEnd(sem.endDate);
    } else {
      setEditingSemester(null);
      setSemName('');
      setSemStart(todayStr);
      setSemEnd('');
    }
    setShowSemesterModal(true);
  };

  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semName.trim()) return;
    if (editingSemester) {
      AcademicStore.updateSemester(editingSemester.id, {
        name: semName,
        startDate: semStart || todayStr,
        endDate: semEnd || todayStr
      });
    } else {
      AcademicStore.addSemester({
        name: semName,
        startDate: semStart || todayStr,
        endDate: semEnd || todayStr,
        isActive: semesters.length === 0
      });
    }
    setShowSemesterModal(false);
  };

  // Handlers for Subject
  const handleOpenSubjectModal = (subj?: AcademicSubject) => {
    if (subj) {
      setEditingSubject(subj);
      setSubjName(subj.name);
      setSubjProf(subj.professor);
      setSubjColor(subj.color || '#3B82F6');
      setSubjClassroom(subj.classroom || '');
    } else {
      setEditingSubject(null);
      setSubjName('');
      setSubjProf('');
      setSubjColor('#3B82F6');
      setSubjClassroom('');
    }
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !activeSemester) return;
    if (editingSubject) {
      AcademicStore.updateSubject(editingSubject.id, {
        name: subjName,
        professor: subjProf || 'Por asignar',
        color: subjColor,
        classroom: subjClassroom
      });
    } else {
      AcademicStore.addSubject({
        semesterId: activeSemester.id,
        name: subjName,
        professor: subjProf || 'Por asignar',
        color: subjColor,
        classroom: subjClassroom,
        scheduleSessions: [],
        cuts: []
      });
    }
    setShowSubjectModal(false);
  };

  // Handlers for Sessions
  const handleAddSessionToSubject = (subjectId: string) => {
    if (!sessionStart || !sessionEnd) return;
    AcademicStore.addSession(subjectId, {
      day: Number(sessionDay),
      startTime: sessionStart,
      endTime: sessionEnd,
      classroom: sessionRoom
    });
    setSessionRoom('');
  };

  const handleSaveSessionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSessionData) return;
    AcademicStore.updateSession(
      editingSessionData.subjectId, 
      editingSessionData.session.id, 
      {
        day: editingSessionData.session.day,
        startTime: editingSessionData.session.startTime,
        endTime: editingSessionData.session.endTime,
        classroom: editingSessionData.session.classroom
      }
    );
    setEditingSessionData(null);
  };

  const handleDeleteSession = (subjectId: string, sessionId: string) => {
    AcademicStore.deleteSession(subjectId, sessionId);
    if (editingSessionData?.session.id === sessionId) {
      setEditingSessionData(null);
    }
  };

  // Handlers for Cuts & Activities
  const handleAddCut = (subjectId: string) => {
    if (!newCutName.trim()) return;
    AcademicStore.addCut(subjectId, newCutName, Number(newCutWeight));
    setNewCutName('');
  };

  const handleSaveCutEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCut || !editCutName.trim()) return;
    AcademicStore.updateCut(editingCut.subjectId, editingCut.cut.id, {
      cutName: editCutName,
      cutWeightPercent: Number(editCutWeight)
    });
    setEditingCut(null);
  };

  return (
    <div className="w-full space-y-6 font-sans min-h-screen pb-16 text-slate-100">
      
      {/* ========================================================= */}
      {/* 1. TOP LIQUID GLASS PANEL (PANEL SUPERIOR)                */}
      {/* ========================================================= */}
      <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Soft Liquid Glass Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-accent/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Active Semester Badge & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
              <GraduationCap className="w-7 h-7 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  Oficina Académica
                </h1>
                {activeSemester ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{activeSemester.name}</span>
                  </div>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-mono">
                    Sin semestre activo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Coordinación Ejecutiva Universitaria & Performance Académico
              </p>
            </div>
          </div>

          {/* Global Search & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Global Search */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar materia, profesor o aula..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#132337]/80 backdrop-blur-md border border-blue-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#C5A059] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Crear Semestre Button */}
            <button
              onClick={() => handleOpenSemesterModal()}
              className="px-3.5 py-2 bg-[#162A45]/80 hover:bg-[#1E3B61] text-xs font-semibold text-[#C5A059] border border-[#C5A059]/40 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Semestre
            </button>

            {/* Crear Materia Button */}
            <button
              onClick={() => handleOpenSubjectModal()}
              disabled={!activeSemester}
              className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-amber-600 hover:from-amber-500 hover:to-amber-700 text-xs font-bold text-slate-950 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Crear Materia
            </button>
          </div>

        </div>

        {/* INTEGRATED NAVIGATION TABS BAR */}
        <div className="mt-5 pt-4 border-t border-blue-500/20 flex flex-wrap gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my_day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'my_day'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <Clock className="w-4 h-4 text-[#C5A059]" /> Mi Día Académico
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'subjects'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#C5A059]" /> Materias ({activeSubjects.length})
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" /> Horario Semanal
          </button>

          <button
            onClick={() => setActiveTab('evaluations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'evaluations'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <Award className="w-4 h-4 text-[#C5A059]" /> Evaluaciones
            {groupedEvals.total > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                {groupedEvals.total}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'progress'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#C5A059]" /> Seguimiento
          </button>

          <button
            onClick={() => setActiveTab('semesters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'semesters'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C5A059]" /> Semestres ({semesters.length})
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. EXECUTIVE OVERVIEW STATS CARDS (PANEL GENERAL)          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Stat 1: Promedio Semestre */}
        <div className="bg-[#0B1528]/80 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Promedio GPA</span>
            <Award className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-baseline gap-1">
              {formatGrade(gpa)} <span className="text-xs font-sans text-slate-400">/ 5.0</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Promedio ponderado activo
          </div>
        </div>

        {/* Stat 2: Materias Activas */}
        <div className="bg-[#0B1528]/80 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Materias Activas</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {activeSubjects.length}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {activeSemester ? `Inscritas en ${activeSemester.name}` : 'Sin semestre seleccionado'}
          </div>
        </div>

        {/* Stat 3: Clases de Hoy */}
        <div className="bg-[#0B1528]/80 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Clases de Hoy</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {todayClasses.length}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            {todayClasses.length > 0 ? `Primera: ${todayClasses[0].session.startTime}` : 'Día sin clases'}
          </div>
        </div>

        {/* Stat 4: Próximas Evaluaciones */}
        <div className="bg-[#0B1528]/80 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Evaluaciones</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-400">
              {groupedEvals.total}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {groupedEvals.today.length > 0 ? `${groupedEvals.today.length} hoy pendientes` : 'Sin parciales hoy'}
          </div>
        </div>

        {/* Stat 5: Porcentaje Semestre Cursado */}
        <div className="bg-[#0B1528]/80 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-blue-400/40 transition-all">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Avance Semestre</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
              {semesterProgress}%
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${semesterProgress}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Calculado sobre fechas de inicio/fin
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* TAB 1: MI DÍA ACADÉMICO                                    */}
      {/* ========================================================= */}
      {activeTab === 'my_day' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: CLASES DE HOY & DYNAMIC TARGET GOAL */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD: DYNAMIC ACADEMIC GOAL */}
            <div className="bg-gradient-to-r from-[#132337]/90 via-[#182C48]/90 to-[#0B1528]/90 backdrop-blur-xl border border-[#C5A059]/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059] shrink-0 mt-0.5">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
                    OBJETIVO ACADÉMICO DINÁMICO
                  </div>
                  <p className="text-sm text-slate-200 mt-1 font-serif leading-relaxed italic">
                    "{goalMessage}"
                  </p>
                </div>
              </div>
            </div>

            {/* CARD: CLASES DE HOY */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" /> Clases de Hoy
                </h3>
                <span className="text-xs font-mono text-slate-400">{todayStr}</span>
              </div>

              {todayClasses.length === 0 ? (
                <div className="p-8 text-center bg-[#132337]/40 rounded-xl border border-dashed border-blue-500/20 text-slate-400 space-y-2">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">No tienes sesiones de clase para el día de hoy.</p>
                  <p className="text-xs text-slate-500">Aprovecha para repasar apuntes o consultar las próximas evaluaciones.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayClasses.map(({ subject, session }, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-[#132337]/70 backdrop-blur-md rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-blue-400/50 transition-all shadow-md"
                      style={{ borderLeftWidth: '5px', borderLeftColor: subject.color }}
                    >
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{subject.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            {session.classroom ? `Aula: ${session.classroom}` : 'Aula por asignar'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" /> Prof. {subject.professor}
                          </span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-400/40 rounded-xl text-xs font-mono font-bold text-blue-200 shrink-0">
                        {session.startTime} – {session.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 5 COLS: PRÓXIMAS EVALUACIONES Y TAREAS PENDIENTES */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PRÓXIMAS EVALUACIONES DE HOY Y PRÓXIMAS */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-rose-400" /> Próximas Evaluaciones
                </h3>
                <button
                  onClick={() => setActiveTab('evaluations')}
                  className="text-xs text-[#C5A059] hover:underline"
                >
                  Ver todas
                </button>
              </div>

              {groupedEvals.total === 0 ? (
                <div className="p-8 text-center bg-[#132337]/40 rounded-xl border border-dashed border-rose-500/20 text-slate-400 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500/80 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">¡Al día! No hay evaluaciones pendientes.</p>
                  <p className="text-xs text-slate-500">Todas tus actividades tienen calificación registrada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...groupedEvals.today, ...groupedEvals.tomorrow, ...groupedEvals.thisWeek].slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-[#132337]/70 rounded-xl border border-white/10 flex justify-between items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: item.subjectColor }}
                          >
                            {item.subjectName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.activityType} ({item.weightPercent}%)
                          </span>
                        </div>
                        <div className="font-bold text-white text-xs">{item.activityName}</div>
                        <div className="text-[11px] text-slate-400">Corte: {item.cutName}</div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border block ${
                          item.daysDiff === 0 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                            : item.daysDiff === 1 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {item.daysDiff === 0 ? '¡Hoy!' : item.daysDiff === 1 ? 'Mañana' : `En ${item.daysDiff} días`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.activityDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MATERIAS CON TARJETAS GRANDES E INLINE EXPANSION    */}
      {/* ========================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          
          {filteredSubjects.length === 0 ? (
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-12 text-center space-y-4">
              <BookOpen className="w-16 h-16 text-slate-500 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-white">No existen materias registradas</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {searchQuery ? `No se encontraron asignaturas para "${searchQuery}".` : 'Registra tus asignaturas universitarias para organizar tu horario, evaluar cortes y controlar tus calificaciones.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => handleOpenSubjectModal()}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C5A059] to-amber-600 font-bold text-slate-950 text-xs rounded-xl shadow-lg"
                >
                  Crear primera materia
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredSubjects.map(subject => {
                const isExpanded = expandedSubjectId === subject.id;
                const { average, hasGrades } = AcademicCalculations.calculateSubjectAverage(subject);
                const statusInfo = AcademicCalculations.getSubjectStatus(subject);
                const upcomingForSub = (subject.cuts || []).flatMap(c => c.activities).filter(a => a.status === 'pending');
                const nextEval = upcomingForSub[0] || null;

                return (
                  <div 
                    key={subject.id}
                    className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-400/40 transition-all"
                  >
                    {/* SUBJECT CARD HEADER BANNER */}
                    <div 
                      className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                      style={{ borderLeftWidth: '6px', borderLeftColor: subject.color }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold font-serif text-white">{subject.name}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            statusInfo.status === 'Aprobada'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : statusInfo.status === 'En Riesgo'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {statusInfo.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 flex items-center gap-4 flex-wrap">
                          <span>👤 Prof. {subject.professor}</span>
                          {subject.classroom && <span>🏫 Aula: {subject.classroom}</span>}
                          <span>📅 {subject.scheduleSessions?.length || 0} sesión(es) por semana</span>
                        </div>
                      </div>

                      {/* Right stats and expand chevron */}
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Promedio</div>
                          <div className={`text-xl font-serif font-bold ${hasGrades ? (average >= 3.0 ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-400'}`}>
                            {hasGrades ? formatGrade(average) : 'Sin notas'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSubjectModal(subject);
                            }}
                            className="p-2 bg-[#132337] hover:bg-blue-900/60 rounded-xl text-slate-300 hover:text-white transition-colors"
                            title="Editar materia"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Eliminar la materia "${subject.name}"?`)) {
                                AcademicStore.deleteSubject(subject.id);
                              }
                            }}
                            className="p-2 bg-[#132337] hover:bg-rose-900/60 rounded-xl text-slate-300 hover:text-rose-400 transition-colors"
                            title="Eliminar materia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-2 bg-[#132337] rounded-xl text-[#C5A059]">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED SUBJECT CONTENT INLINE */}
                    {isExpanded && (
                      <div className="p-5 border-t border-blue-500/20 bg-[#0d1b2e]/90 space-y-5 animate-in fade-in duration-200">
                        
                        {/* 4 SUB-TABS: Información, Horario, Evaluaciones, Notas */}
                        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                          <button
                            onClick={() => setSubjectSubTab('info')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              subjectSubTab === 'info'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#132337] text-slate-300 hover:text-white'
                            }`}
                          >
                            Información
                          </button>
                          <button
                            onClick={() => setSubjectSubTab('schedule')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              subjectSubTab === 'schedule'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#132337] text-slate-300 hover:text-white'
                            }`}
                          >
                            Horario ({subject.scheduleSessions?.length || 0})
                          </button>
                          <button
                            onClick={() => setSubjectSubTab('evaluations')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              subjectSubTab === 'evaluations'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#132337] text-slate-300 hover:text-white'
                            }`}
                          >
                            Evaluaciones / Cortes ({subject.cuts?.length || 0})
                          </button>
                          <button
                            onClick={() => setSubjectSubTab('grades')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              subjectSubTab === 'grades'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#132337] text-slate-300 hover:text-white'
                            }`}
                          >
                            Notas & Aprobación
                          </button>
                        </div>

                        {/* SUB-TAB 1: INFORMACIÓN */}
                        {subjectSubTab === 'info' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-[#132337]/70 rounded-xl space-y-2 border border-white/10">
                              <div className="font-bold text-[#C5A059] uppercase tracking-wider text-[11px]">Detalles Principales</div>
                              <div><span className="text-slate-400">Nombre de la asignatura:</span> <strong className="text-white">{subject.name}</strong></div>
                              <div><span className="text-slate-400">Profesor asignado:</span> <strong className="text-white">{subject.professor}</strong></div>
                              <div><span className="text-slate-400">Aula predeterminada:</span> <strong className="text-white">{subject.classroom || 'Sin aula'}</strong></div>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-slate-400">Color institucional:</span>
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: subject.color }} />
                              </div>
                            </div>

                            <div className="p-4 bg-[#132337]/70 rounded-xl space-y-2 border border-white/10">
                              <div className="font-bold text-[#C5A059] uppercase tracking-wider text-[11px]">Resumen de Rendimiento</div>
                              <div><span className="text-slate-400">Promedio actual:</span> <strong className="text-white">{hasGrades ? formatGrade(average) : 'Sin calificaciones'}</strong></div>
                              <div><span className="text-slate-400">Estado de la materia:</span> <strong className="text-white">{statusInfo.status}</strong></div>
                              <div><span className="text-slate-400">Próxima evaluación:</span> <strong className="text-white">{nextEval ? `${nextEval.name} (${nextEval.date})` : 'Ninguna agendada'}</strong></div>
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 2: HORARIO DE CLASES */}
                        {subjectSubTab === 'schedule' && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-300">Sesiones semanales configuradas</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {subject.scheduleSessions?.map((ses) => (
                                <div key={ses.id} className="p-3 bg-[#132337] border border-blue-500/30 rounded-xl text-xs flex items-center gap-3">
                                  <div>
                                    <div className="font-bold text-white">{getDayOfWeekName(ses.day)}</div>
                                    <div className="text-slate-300 font-mono text-[11px]">{ses.startTime} – {ses.endTime}</div>
                                    {ses.classroom && <div className="text-[10px] text-slate-400">Aula: {ses.classroom}</div>}
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteSession(subject.id, ses.id)}
                                    className="text-rose-400 hover:text-rose-300 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Session Form */}
                            <div className="p-3.5 bg-[#132337]/80 rounded-xl border border-white/10 flex flex-wrap items-center gap-2.5 text-xs">
                              <select 
                                value={sessionDay} 
                                onChange={e => setSessionDay(Number(e.target.value))}
                                className="p-2 bg-[#0d131a] border border-blue-500/30 rounded-lg text-white"
                              >
                                <option value={1}>Lunes</option>
                                <option value={2}>Martes</option>
                                <option value={3}>Miércoles</option>
                                <option value={4}>Jueves</option>
                                <option value={5}>Viernes</option>
                                <option value={6}>Sábado</option>
                                <option value={7}>Domingo</option>
                              </select>
                              <input 
                                type="time" 
                                value={sessionStart} 
                                onChange={e => setSessionStart(e.target.value)} 
                                className="p-2 bg-[#0d131a] border border-blue-500/30 rounded-lg text-white font-mono"
                              />
                              <span className="text-slate-400">a</span>
                              <input 
                                type="time" 
                                value={sessionEnd} 
                                onChange={e => setSessionEnd(e.target.value)} 
                                className="p-2 bg-[#0d131a] border border-blue-500/30 rounded-lg text-white font-mono"
                              />
                              <input 
                                type="text" 
                                placeholder="Aula (opcional)" 
                                value={sessionRoom} 
                                onChange={e => setSessionRoom(e.target.value)} 
                                className="p-2 bg-[#0d131a] border border-blue-500/30 rounded-lg text-white flex-1 min-w-[120px]"
                              />
                              <button
                                onClick={() => handleAddSessionToSubject(subject.id)}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1"
                              >
                                <Plus className="w-4 h-4" /> Añadir Sesión
                              </button>
                            </div>
                          </div>
                        )}

                        {/* SUB-TAB 3: EVALUACIONES Y CORTES */}
                        {subjectSubTab === 'evaluations' && (
                          <div className="space-y-4">
                            {/* Crear Corte Form */}
                            <div className="p-3.5 bg-[#132337]/80 rounded-xl border border-white/10 flex flex-wrap items-center gap-2.5 text-xs">
                              <input
                                type="text"
                                placeholder="Nombre del Corte (Ej: Corte 1, Parcial Final)"
                                value={newCutName}
                                onChange={e => setNewCutName(e.target.value)}
                                className="p-2 bg-[#0d131a] border border-blue-500/30 rounded-lg text-white flex-1 min-w-[180px]"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-slate-300">Peso (%):</span>
                                <input
                                  type="number"
                                  value={newCutWeight}
                                  onChange={e => setNewCutWeight(Number(e.target.value))}
                                  className="w-16 p-2 bg-[#0d131a] border border-blue-500/30 rounded-lg text-white font-mono"
                                />
                              </div>
                              <button
                                onClick={() => handleAddCut(subject.id)}
                                className="px-3 py-2 bg-[#C5A059] hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1"
                              >
                                <Plus className="w-4 h-4" /> Crear Corte
                              </button>
                            </div>

                            {/* List of Cuts */}
                            {subject.cuts?.map(cut => (
                              <div key={cut.id} className="p-4 bg-[#132337]/60 rounded-xl border border-white/10 space-y-3">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#C5A059] text-sm">{cut.cutName}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                                      Peso: {cut.cutWeightPercent}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingCut({ subjectId: subject.id, cut });
                                        setEditCutName(cut.cutName);
                                        setEditCutWeight(cut.cutWeightPercent);
                                      }}
                                      className="text-slate-400 hover:text-white p-1"
                                      title="Editar corte"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => AcademicStore.deleteCut(subject.id, cut.id)}
                                      className="text-rose-400 hover:text-rose-300 p-1"
                                      title="Eliminar corte"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Activities in Cut */}
                                <div className="space-y-2">
                                  {cut.activities?.map(act => (
                                    <div key={act.id} className="p-2.5 bg-[#0d131a]/80 rounded-lg border border-white/5 flex flex-wrap justify-between items-center gap-2 text-xs">
                                      <div>
                                        <span className="font-bold text-white">{act.name}</span>
                                        <span className="text-slate-400 ml-2">({act.type} - {act.weightPercent}% del corte)</span>
                                        <span className="text-slate-400 font-mono ml-2">[{act.date}]</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Nota:</span>
                                        <input
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          max="5"
                                          value={act.grade !== undefined ? act.grade : ''}
                                          onChange={e => {
                                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                                            AcademicStore.updateActivity(subject.id, cut.id, act.id, {
                                              grade: val,
                                              status: val !== undefined ? 'graded' : 'pending'
                                            });
                                          }}
                                          placeholder="0.0"
                                          className="w-16 p-1 bg-[#132337] border border-blue-500/30 rounded text-center font-bold text-white font-mono"
                                        />
                                        <button
                                          onClick={() => AcademicStore.deleteActivity(subject.id, cut.id, act.id)}
                                          className="text-rose-400 hover:text-rose-300 p-1"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Activity to Cut inline */}
                                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                                  <input
                                    type="text"
                                    placeholder="Nueva evaluación"
                                    id={`act_name_${cut.id}`}
                                    className="p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white flex-1 min-w-[140px]"
                                  />
                                  <select id={`act_type_${cut.id}`} className="p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white">
                                    <option value="Parcial">Parcial</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Taller">Taller</option>
                                    <option value="Laboratorio">Laboratorio</option>
                                    <option value="Exposición">Exposición</option>
                                    <option value="Proyecto">Proyecto</option>
                                    <option value="Otro">Otro</option>
                                  </select>
                                  <input type="date" id={`act_date_${cut.id}`} defaultValue={todayStr} className="p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white font-mono" />
                                  <input type="number" id={`act_weight_${cut.id}`} defaultValue={20} placeholder="%" className="w-14 p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white font-mono" />
                                  <button
                                    onClick={() => {
                                      const nameInput = document.getElementById(`act_name_${cut.id}`) as HTMLInputElement;
                                      const typeInput = document.getElementById(`act_type_${cut.id}`) as HTMLSelectElement;
                                      const dateInput = document.getElementById(`act_date_${cut.id}`) as HTMLInputElement;
                                      const weightInput = document.getElementById(`act_weight_${cut.id}`) as HTMLInputElement;
                                      if (nameInput?.value) {
                                        AcademicStore.addActivity(subject.id, cut.id, {
                                          name: nameInput.value,
                                          type: typeInput.value as any,
                                          date: dateInput.value || todayStr,
                                          weightPercent: Number(weightInput.value) || 20,
                                          status: 'pending'
                                        });
                                        nameInput.value = '';
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1"
                                  >
                                    + Actividad
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* SUB-TAB 4: NOTAS Y CALCULADORA REQUERIDA */}
                        {subjectSubTab === 'grades' && (
                          <div className="space-y-4 text-xs">
                            {(() => {
                              const reqInfo = AcademicCalculations.calculateRequiredGradeToPass(subject, 3.0);
                              return (
                                <div className="p-4 bg-[#132337]/80 rounded-xl border border-white/10 space-y-3">
                                  <div className="font-bold text-[#C5A059] text-sm">Cálculo de Aprobación para {subject.name}</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 bg-[#0d131a] rounded-lg border border-white/5">
                                      <div className="text-slate-400">Promedio Acumulado</div>
                                      <div className="text-lg font-bold text-white mt-0.5">{hasGrades ? formatGrade(average) : '0.0'}</div>
                                    </div>
                                    <div className="p-3 bg-[#0d131a] rounded-lg border border-white/5">
                                      <div className="text-slate-400">Peso Restante</div>
                                      <div className="text-lg font-bold text-white mt-0.5">{reqInfo.remainingWeight}%</div>
                                    </div>
                                    <div className={`p-3 rounded-lg border ${reqInfo.achievable ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                                      <div className="text-slate-300 font-semibold">Nota Requerida (mín. 3.0)</div>
                                      <div className="text-lg font-bold mt-0.5">
                                        {reqInfo.remainingWeight <= 0 ? 'Materia Finalizada' : formatGrade(reqInfo.requiredGrade)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HORARIO SEMANAL (PROFESSIONAL CALENDAR GRID)      */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C5A059]" /> Horario Semanal Continuo
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Cada clase se muestra como un único bloque continuo proporcional a su duración real.
              </p>
            </div>
          </div>

          {/* WEEKLY SCHEDULE GRID */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-7 gap-2">
              
              {/* Header Days: Hora + Lun-Sáb */}
              {['Hora', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dayName, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-xl text-center text-xs font-bold ${
                    idx === 0 
                      ? 'bg-[#132337]/40 text-slate-400 font-mono' 
                      : 'bg-[#132337]/80 text-[#C5A059] border border-blue-500/20'
                  }`}
                >
                  {dayName}
                </div>
              ))}

              {/* Time axis & Days column layout */}
              {/* Render 14 hourly slots from 06:00 to 20:00 */}
              <div className="col-span-7 grid grid-cols-7 gap-2 relative min-h-[560px] bg-[#0d1b2e]/60 rounded-xl border border-white/10 p-2">
                
                {/* Time Axis Column (Col 1) */}
                <div className="space-y-8 text-[11px] font-mono text-slate-400 pt-2 text-center border-r border-white/10">
                  {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time, idx) => (
                    <div key={idx} className="h-10 flex items-center justify-center">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day Columns (Cols 2 to 7 -> Days 1 to 6) */}
                {[1, 2, 3, 4, 5, 6].map((dayNum) => {
                  // Collect all sessions for this day across active subjects
                  const daySessions: Array<{
                    subject: AcademicSubject;
                    session: AcademicSession;
                  }> = [];

                  activeSubjects.forEach(sub => {
                    sub.scheduleSessions?.forEach(ses => {
                      if (ses.day === dayNum) {
                        daySessions.push({ subject: sub, session: ses });
                      }
                    });
                  });

                  return (
                    <div key={dayNum} className="relative border-r border-white/5 last:border-r-0 h-full min-h-[560px]">
                      {daySessions.map(({ subject, session }) => {
                        // Calculate vertical position based on 06:00 to 22:00 (16 hours total = 960 mins)
                        const [startH, startM] = session.startTime.split(':').map(Number);
                        const [endH, endM] = session.endTime.split(':').map(Number);

                        const startMins = (startH * 60 + startM) - (6 * 60); // mins relative to 06:00
                        const endMins = (endH * 60 + endM) - (6 * 60);
                        const durationMins = Math.max(30, endMins - startMins);

                        // Total span = 16 hours = 960 minutes = 100%
                        const topPct = (startMins / 960) * 100;
                        const heightPct = (durationMins / 960) * 100;

                        return (
                          <div
                            key={session.id}
                            onClick={() => setEditingSessionData({ subjectId: subject.id, subjectName: subject.name, session })}
                            className="absolute left-1 right-1 rounded-xl p-2.5 border text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-all z-10 flex flex-col justify-between overflow-hidden"
                            style={{
                              top: `${Math.max(0, topPct)}%`,
                              height: `${Math.min(100 - topPct, heightPct)}%`,
                              backgroundColor: `${subject.color}25`,
                              borderColor: subject.color
                            }}
                          >
                            <div>
                              <div className="font-bold text-xs truncate flex items-center justify-between" style={{ color: subject.color }}>
                                <span>{subject.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-200 font-mono font-semibold">
                                {session.startTime} – {session.endTime}
                              </div>
                            </div>

                            <div className="text-[9px] text-slate-300 truncate mt-1 border-t border-white/10 pt-1">
                              {session.classroom && <div className="font-bold">Aula: {session.classroom}</div>}
                              <div>Prof. {subject.professor}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PRÓXIMAS EVALUACIONES (4 GROUPED CATEGORIES)       */}
      {/* ========================================================= */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* HOY */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-rose-500/20 pb-2">
                <span className="font-bold text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  🔴 HOY ({groupedEvals.today.length})
                </span>
              </div>
              {groupedEvals.today.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">Sin evaluaciones hoy.</div>
              ) : (
                groupedEvals.today.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-rose-500/30 space-y-1 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                      {ev.subjectName}
                    </span>
                    <div className="font-bold text-white">{ev.activityName}</div>
                    <div className="text-[11px] text-slate-400">Corte: {ev.cutName} ({ev.weightPercent}%)</div>
                  </div>
                ))
              )}
            </div>

            {/* MAÑANA */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                <span className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  🟠 MAÑANA ({groupedEvals.tomorrow.length})
                </span>
              </div>
              {groupedEvals.tomorrow.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">Sin evaluaciones mañana.</div>
              ) : (
                groupedEvals.tomorrow.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-amber-500/30 space-y-1 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                      {ev.subjectName}
                    </span>
                    <div className="font-bold text-white">{ev.activityName}</div>
                    <div className="text-[11px] text-slate-400">Corte: {ev.cutName} ({ev.weightPercent}%)</div>
                  </div>
                ))
              )}
            </div>

            {/* ESTA SEMANA */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-blue-500/20 pb-2">
                <span className="font-bold text-blue-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  🟡 ESTA SEMANA ({groupedEvals.thisWeek.length})
                </span>
              </div>
              {groupedEvals.thisWeek.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">Sin evaluaciones esta semana.</div>
              ) : (
                groupedEvals.thisWeek.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-blue-500/30 space-y-1 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                      {ev.subjectName}
                    </span>
                    <div className="font-bold text-white">{ev.activityName}</div>
                    <div className="text-[11px] text-slate-400">Fecha: {ev.activityDate} (Faltan {ev.daysDiff} días)</div>
                  </div>
                ))
              )}
            </div>

            {/* MÁS ADELANTE */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 shadow-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                <span className="font-bold text-purple-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  🔵 MÁS ADELANTE ({groupedEvals.later.length})
                </span>
              </div>
              {groupedEvals.later.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">Sin evaluaciones futuras registradas.</div>
              ) : (
                groupedEvals.later.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-purple-500/30 space-y-1 text-xs">
                    <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                      {ev.subjectName}
                    </span>
                    <div className="font-bold text-white">{ev.activityName}</div>
                    <div className="text-[11px] text-slate-400">Fecha: {ev.activityDate}</div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SEGUIMIENTO ACADÉMICO                              */}
      {/* ========================================================= */}
      {activeTab === 'progress' && (
        <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C5A059]" /> Seguimiento de Rendimiento y Análisis Predictivo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeSubjects.map(sub => {
              const { average, totalGradedWeight, hasGrades } = AcademicCalculations.calculateSubjectAverage(sub);
              const reqInfo = AcademicCalculations.calculateRequiredGradeToPass(sub, 3.0);
              const statusInfo = AcademicCalculations.getSubjectStatus(sub);

              return (
                <div key={sub.id} className="p-5 bg-[#132337]/70 rounded-xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-bold text-white text-sm" style={{ color: sub.color }}>{sub.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {totalGradedWeight}% Calificado
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Promedio Acumulado:</span>
                    <span className="font-bold text-white">{hasGrades ? formatGrade(average) : '0.0'}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Estado Actual:</span>
                    <span className={`font-bold ${statusInfo.status === 'Aprobada' ? 'text-emerald-400' : statusInfo.status === 'En Riesgo' ? 'text-rose-400' : 'text-blue-300'}`}>
                      {statusInfo.status}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs font-semibold ${reqInfo.achievable ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                    {reqInfo.remainingWeight <= 0 ? (
                      <span>Materia finalizada. Promedio final: {formatGrade(average)}</span>
                    ) : (
                      <div>
                        <div>Nota promedio requerida para aprobar (3.0):</div>
                        <div className="text-xl font-serif font-bold mt-1">
                          {formatGrade(reqInfo.requiredGrade)} <span className="text-xs font-sans font-normal text-slate-300">en el {reqInfo.remainingWeight}% restante</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: GESTIÓN DE SEMESTRES                                */}
      {/* ========================================================= */}
      {activeTab === 'semesters' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-white">Historial de Semestres Universitarios</h3>
            <button
              onClick={() => handleOpenSemesterModal()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Nuevo Semestre
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {semesters.map(sem => (
              <div 
                key={sem.id} 
                className={`p-5 rounded-2xl border backdrop-blur-xl bg-[#0B1528]/80 transition-all ${
                  sem.isActive ? 'border-[#C5A059] ring-1 ring-[#C5A059]/30' : 'border-white/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{sem.name}</span>
                      {sem.isActive && (
                        <span className="bg-[#C5A059] text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Periodo: {sem.startDate || 'Sin inicio'} - {sem.endDate || 'Sin fin'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!sem.isActive && (
                      <button
                        onClick={() => AcademicStore.setActiveSemester(sem.id)}
                        className="text-xs bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-400/30 px-2.5 py-1 rounded-lg font-semibold"
                      >
                        Activar
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenSemesterModal(sem)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Editar semestre"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar semestre "${sem.name}"?`)) {
                          AcademicStore.deleteSemester(sem.id);
                        }
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Eliminar semestre"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL SEMESTRE (CREAR / EDITAR)                            */}
      {/* ========================================================= */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">
                {editingSemester ? 'Editar Semestre' : 'Registrar Nuevo Semestre'}
              </h3>
              <button onClick={() => setShowSemesterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSemester} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Semestre *</label>
                <input
                  type="text"
                  placeholder="Ej: 2026-I, Semestre 5"
                  value={semName}
                  onChange={e => setSemName(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={semStart}
                    onChange={e => setSemStart(e.target.value)}
                    className="w-full p-2 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fecha de Finalización</label>
                  <input
                    type="date"
                    value={semEnd}
                    onChange={e => setSemEnd(e.target.value)}
                    className="w-full p-2 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSemesterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-amber-600 rounded-xl"
                >
                  Guardar Semestre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL MATERIA (CREAR / EDITAR)                             */}
      {/* ========================================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">
                {editingSubject ? 'Editar Materia' : 'Registrar Nueva Materia'}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Asignatura *</label>
                <input
                  type="text"
                  placeholder="Ej: Fisiología, Cálculo Vectorial"
                  value={subjName}
                  onChange={e => setSubjName(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Profesor / Docente</label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Martínez"
                  value={subjProf}
                  onChange={e => setSubjProf(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Color Institucional</label>
                  <input
                    type="color"
                    value={subjColor}
                    onChange={e => setSubjColor(e.target.value)}
                    className="w-full h-10 p-1 bg-[#132337] border border-blue-500/30 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Aula Predeterminada</label>
                  <input
                    type="text"
                    placeholder="Ej: Aula 301"
                    value={subjClassroom}
                    onChange={e => setSubjClassroom(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-amber-600 rounded-xl"
                >
                  Guardar Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL EDITAR SESIÓN DE HORARIO                             */}
      {/* ========================================================= */}
      {editingSessionData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Editar Sesión de Clase</h3>
                <p className="text-xs text-[#C5A059]">{editingSessionData.subjectName}</p>
              </div>
              <button onClick={() => setEditingSessionData(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Día de la semana</label>
                <select
                  value={editingSessionData.session.day}
                  onChange={e => setEditingSessionData({
                    ...editingSessionData,
                    session: { ...editingSessionData.session, day: Number(e.target.value) }
                  })}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white"
                >
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                  <option value={6}>Sábado</option>
                  <option value={7}>Domingo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={editingSessionData.session.startTime}
                    onChange={e => setEditingSessionData({
                      ...editingSessionData,
                      session: { ...editingSessionData.session, startTime: e.target.value }
                    })}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={editingSessionData.session.endTime}
                    onChange={e => setEditingSessionData({
                      ...editingSessionData,
                      session: { ...editingSessionData.session, endTime: e.target.value }
                    })}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Aula / Salón</label>
                <input
                  type="text"
                  value={editingSessionData.session.classroom || ''}
                  onChange={e => setEditingSessionData({
                    ...editingSessionData,
                    session: { ...editingSessionData.session, classroom: e.target.value }
                  })}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white"
                  placeholder="Ej: Aula 301"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleDeleteSession(editingSessionData.subjectId, editingSessionData.session.id)}
                  className="px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 rounded-xl border border-rose-500/30"
                >
                  Eliminar Sesión
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSessionData(null)}
                    className="px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-amber-600 rounded-xl"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL EDITAR CORTE                                         */}
      {/* ========================================================= */}
      {editingCut && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-white">Editar Corte de Evaluación</h3>
              <button onClick={() => setEditingCut(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCutEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Corte</label>
                <input
                  type="text"
                  value={editCutName}
                  onChange={e => setEditCutName(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Peso en la asignatura (%)</label>
                <input
                  type="number"
                  value={editCutWeight}
                  onChange={e => setEditCutWeight(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCut(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-amber-600 rounded-xl"
                >
                  Guardar Corte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

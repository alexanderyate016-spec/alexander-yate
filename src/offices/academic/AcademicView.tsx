import React, { useState, useMemo } from 'react';
import { 
  AcademicOfficeData, 
  AcademicSubject, 
  AcademicSemester, 
  AcademicSession, 
  AcademicCut, 
  AcademicEvaluationActivity,
  AcademicActivity,
  AcademicActivityType,
  AcademicActivityStatus
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
  Target, 
  UserCheck, 
  Percent, 
  CheckSquare,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ListFilter,
  Compass,
  MapPin,
  User,
  FileText,
  Filter,
  RotateCcw,
  XCircle
} from 'lucide-react';

interface Props {
  data: AcademicOfficeData;
  onOpenOffice?: (officeKey: string) => void;
}

// =========================================================================
// HELPER COMPONENTS: REAL-TIME PERCENTAGE DISTRIBUTION BARS
// =========================================================================
const CutsDistributionBar: React.FC<{ 
  cuts: AcademicCut[]; 
  proposedCutWeight?: { cutId?: string; weight: number };
}> = ({ cuts, proposedCutWeight }) => {
  let adjustedCuts = (cuts || []).map(c => ({ cutWeightPercent: c.cutWeightPercent }));
  if (proposedCutWeight !== undefined) {
    if (proposedCutWeight.cutId) {
      adjustedCuts = cuts.map(c => c.id === proposedCutWeight.cutId 
        ? { cutWeightPercent: proposedCutWeight.weight } 
        : { cutWeightPercent: c.cutWeightPercent }
      );
    } else {
      adjustedCuts = [...adjustedCuts, { cutWeightPercent: proposedCutWeight.weight }];
    }
  }
  const dist = AcademicCalculations.getCutsDistribution(adjustedCuts);

  return (
    <div className={`p-3.5 rounded-xl border backdrop-blur-md space-y-2 text-xs transition-all ${
      dist.statusColor === 'emerald'
        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
        : dist.statusColor === 'rose'
        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
    }`}>
      <div className="flex flex-wrap justify-between items-center gap-2 font-bold">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 shrink-0 text-[#C5A059]" />
          <span>Distribución de Cortes de la Materia</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Total asignado: <strong className="text-white font-bold">{dist.totalAssigned}%</strong></span>
          {dist.isDeficit && (
            <span>Faltan por asignar: <strong className="text-amber-300 font-bold">{dist.remaining}%</strong></span>
          )}
          {dist.isExcess && (
            <span className="text-rose-300 font-bold">Exceso: +{dist.excess}%</span>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-white/10 relative">
        <div 
          className={`h-full transition-all duration-300 rounded-full ${
            dist.statusColor === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
            dist.statusColor === 'rose' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
            'bg-gradient-to-r from-amber-500 to-yellow-400'
          }`}
          style={{ width: `${Math.min(100, dist.totalAssigned)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] font-semibold pt-0.5">
        <span className="flex items-center gap-1.5">
          {dist.isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {dist.isDeficit && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {dist.isExcess && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {dist.statusMessage}
        </span>
        <span className="font-mono text-slate-300">{dist.totalAssigned}% / 100%</span>
      </div>
    </div>
  );
};

const ActivitiesDistributionBar: React.FC<{ 
  activities: AcademicEvaluationActivity[]; 
  proposedActivityWeight?: { actId?: string; weight: number };
}> = ({ activities, proposedActivityWeight }) => {
  let adjustedActs = (activities || []).map(a => ({ weightPercent: a.weightPercent }));
  if (proposedActivityWeight !== undefined) {
    if (proposedActivityWeight.actId) {
      adjustedActs = activities.map(a => a.id === proposedActivityWeight.actId 
        ? { weightPercent: proposedActivityWeight.weight } 
        : { weightPercent: a.weightPercent }
      );
    } else {
      adjustedActs = [...adjustedActs, { weightPercent: proposedActivityWeight.weight }];
    }
  }
  const dist = AcademicCalculations.getActivitiesDistribution(adjustedActs);

  return (
    <div className={`p-3 rounded-xl border backdrop-blur-md space-y-1.5 text-xs transition-all ${
      dist.statusColor === 'emerald'
        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        : dist.statusColor === 'rose'
        ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
        : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
    }`}>
      <div className="flex flex-wrap justify-between items-center gap-2 font-bold">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-[#C5A059]" /> Evaluaciones del Corte
        </span>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Total asignado: <strong className="text-white">{dist.totalAssigned}%</strong></span>
          {dist.isDeficit && <span>Faltan por asignar: <strong className="text-amber-300">{dist.remaining}%</strong></span>}
          {dist.isExcess && <span className="text-rose-300 font-bold">Exceso: +{dist.excess}%</span>}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-white/10">
        <div 
          className={`h-full transition-all duration-300 rounded-full ${
            dist.statusColor === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
            dist.statusColor === 'rose' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
            'bg-gradient-to-r from-amber-500 to-yellow-400'
          }`}
          style={{ width: `${Math.min(100, dist.totalAssigned)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-semibold">
        <span className="flex items-center gap-1">
          {dist.isComplete && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          {dist.isDeficit && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          {dist.isExcess && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          {dist.statusMessage}
        </span>
        <span className="font-mono text-slate-300">{dist.totalAssigned}% / 100%</span>
      </div>
    </div>
  );
};

export const AcademicView: React.FC<Props> = ({ data }) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'my_day' | 'subjects' | 'schedule' | 'evaluations' | 'activities' | 'progress' | 'semesters'>('my_day');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded Subject for Inline Card view
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [subjectSubTab, setSubjectSubTab] = useState<'info' | 'schedule' | 'evaluations' | 'cronograma' | 'grades'>('info');

  // Cronograma filter inside subject detail
  const [cronogramaFilter, setCronogramaFilter] = useState<'all' | 'classes' | 'evaluations' | 'activities'>('all');

  // Main Actividades tab filters
  const [activitiesFilterSubject, setActivitiesFilterSubject] = useState<string>('all');
  const [activitiesFilterStatus, setActivitiesFilterStatus] = useState<string>('all');
  const [activitiesFilterType, setActivitiesFilterType] = useState<string>('all');

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Custom Confirmation Modal State
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const openConfirm = (opts: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModalData(opts);
  };

  // Modals & Forms State
  // 1. Semester Modal
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<AcademicSemester | null>(null);
  const [semName, setSemName] = useState('');
  const [semStart, setSemStart] = useState('');
  const [semEnd, setSemEnd] = useState('');

  // 2. Subject Modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);
  const [subjName, setSubjName] = useState('');
  const [subjProf, setSubjProf] = useState('');
  const [subjColor, setSubjColor] = useState('#3B82F6');
  const [subjClassroom, setSubjClassroom] = useState('');
  const [subjSemesterId, setSubjSemesterId] = useState('');

  // 3. Global Session Modal (from Schedule tab)
  const [showAddSessionGlobalModal, setShowAddSessionGlobalModal] = useState(false);
  const [globalSessionSubjectId, setGlobalSessionSubjectId] = useState('');

  // 4. Session Edit Modal
  const [editingSessionData, setEditingSessionData] = useState<{
    subjectId: string;
    subjectName: string;
    session: AcademicSession;
  } | null>(null);

  // New Session Form State
  const [sessionDay, setSessionDay] = useState<number>(1);
  const [sessionStart, setSessionStart] = useState('08:00');
  const [sessionEnd, setSessionEnd] = useState('10:00');
  const [sessionRoom, setSessionRoom] = useState('');

  // 5. Cut Modal
  const [showCutModal, setShowCutModal] = useState(false);
  const [cutSubjectId, setCutSubjectId] = useState('');
  const [editingCut, setEditingCut] = useState<{ subjectId: string; cut: AcademicCut } | null>(null);
  const [cutName, setCutName] = useState('');
  const [cutWeight, setCutWeight] = useState(30);

  // 6. Activity / Evaluation Edit Modal
  const [editingActivity, setEditingActivity] = useState<{
    subjectId: string;
    cutId: string;
    activity: AcademicEvaluationActivity;
  } | null>(null);
  const [editActName, setEditActName] = useState('');
  const [editActType, setEditActType] = useState<AcademicEvaluationActivity['type']>('Parcial');
  const [editActDate, setEditActDate] = useState('');
  const [editActWeight, setEditActWeight] = useState(20);
  const [editActStatus, setEditActStatus] = useState<'pending' | 'graded' | 'cancelled'>('pending');
  const [editActGrade, setEditActGrade] = useState<string>('');

  // 7. Inline New Activity Forms dictionary (key = cutId)
  const [newActivityForms, setNewActivityForms] = useState<Record<string, {
    name: string;
    type: AcademicEvaluationActivity['type'];
    date: string;
    weight: number;
  }>>({});

  // 8. Academic Activity Modal (Non-graded Events)
  const [showAcademicActivityModal, setShowAcademicActivityModal] = useState(false);
  const [editingAcademicActivity, setEditingAcademicActivity] = useState<AcademicActivity | null>(null);
  const [acadActName, setAcadActName] = useState('');
  const [acadActType, setAcadActType] = useState<string>('Salida de campo');
  const [acadActCustomType, setAcadActCustomType] = useState('');
  const [acadActSubjectId, setAcadActSubjectId] = useState('');
  const [acadActDate, setAcadActDate] = useState(getTodayDateString());
  const [acadActStartTime, setAcadActStartTime] = useState('08:00');
  const [acadActEndTime, setAcadActEndTime] = useState('10:00');
  const [acadActLocation, setAcadActLocation] = useState('');
  const [acadActProfessor, setAcadActProfessor] = useState('');
  const [acadActDescription, setAcadActDescription] = useState('');
  const [acadActStatus, setAcadActStatus] = useState<AcademicActivityStatus>('Pendiente');

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
  const upcomingAcademicActivities = AcademicCalculations.getUpcomingAcademicActivities(activeSubjects, 10);

  // =========================================================================
  // HANDLERS: SEMESTERS
  // =========================================================================
  const handleOpenSemesterModal = (sem?: AcademicSemester) => {
    if (sem) {
      setEditingSemester(sem);
      setSemName(sem.name);
      setSemStart(sem.startDate || todayStr);
      setSemEnd(sem.endDate || todayStr);
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
    if (!semName.trim()) {
      showToast('Por favor ingresa un nombre para el semestre.', 'warning');
      return;
    }
    if (editingSemester) {
      AcademicStore.updateSemester(editingSemester.id, {
        name: semName.trim(),
        startDate: semStart || todayStr,
        endDate: semEnd || todayStr
      });
      showToast(`Semestre "${semName.trim()}" actualizado correctamente.`);
    } else {
      AcademicStore.addSemester({
        name: semName.trim(),
        startDate: semStart || todayStr,
        endDate: semEnd || todayStr,
        isActive: semesters.length === 0
      });
      showToast(`Semestre "${semName.trim()}" registrado correctamente.`);
    }
    setShowSemesterModal(false);
  };

  const handleSetActiveSemester = (semId: string, semNameText: string) => {
    AcademicStore.setActiveSemester(semId);
    showToast(`Semestre "${semNameText}" activado.`);
  };

  const handleDeleteSemester = (sem: AcademicSemester) => {
    openConfirm({
      title: '¿Eliminar semestre?',
      message: `¿Está seguro de eliminar el semestre "${sem.name}"? Esta acción eliminará también todas las materias, horarios, evaluaciones y notas asociadas a este semestre.`,
      isDanger: true,
      confirmText: 'Eliminar Semestre',
      onConfirm: () => {
        AcademicStore.deleteSemester(sem.id);
        showToast(`Semestre "${sem.name}" eliminado.`, 'warning');
      }
    });
  };

  // =========================================================================
  // HANDLERS: SUBJECTS
  // =========================================================================
  const handleOpenSubjectModal = (subj?: AcademicSubject) => {
    if (semesters.length === 0) {
      showToast('Debes crear un semestre universitario antes de registrar materias.', 'warning');
      handleOpenSemesterModal();
      return;
    }

    if (subj) {
      setEditingSubject(subj);
      setSubjName(subj.name);
      setSubjProf(subj.professor);
      setSubjColor(subj.color || '#3B82F6');
      setSubjClassroom(subj.classroom || '');
      setSubjSemesterId(subj.semesterId || activeSemester?.id || semesters[0].id);
    } else {
      setEditingSubject(null);
      setSubjName('');
      setSubjProf('');
      setSubjColor('#3B82F6');
      setSubjClassroom('');
      setSubjSemesterId(activeSemester?.id || semesters[0]?.id || '');
    }
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) {
      showToast('Ingresa el nombre de la asignatura.', 'warning');
      return;
    }
    const targetSemId = subjSemesterId || activeSemester?.id || semesters[0]?.id;
    if (!targetSemId) {
      showToast('Selecciona un semestre válido.', 'warning');
      return;
    }

    if (editingSubject) {
      AcademicStore.updateSubject(editingSubject.id, {
        name: subjName.trim(),
        professor: subjProf.trim() || 'Por asignar',
        color: subjColor,
        classroom: subjClassroom.trim(),
        semesterId: targetSemId
      });
      showToast(`Materia "${subjName.trim()}" actualizada.`);
    } else {
      AcademicStore.addSubject({
        semesterId: targetSemId,
        name: subjName.trim(),
        professor: subjProf.trim() || 'Por asignar',
        color: subjColor,
        classroom: subjClassroom.trim(),
        scheduleSessions: [],
        cuts: []
      });
      showToast(`Materia "${subjName.trim()}" creada exitosamente.`);
    }
    setShowSubjectModal(false);
  };

  const handleDeleteSubject = (subject: AcademicSubject) => {
    openConfirm({
      title: '¿Eliminar materia?',
      message: `¿Está seguro de eliminar la materia "${subject.name}"? Esta acción eliminará también sus horarios, evaluaciones y notas asociadas de forma permanente.`,
      isDanger: true,
      confirmText: 'Eliminar Materia',
      onConfirm: () => {
        AcademicStore.deleteSubject(subject.id);
        if (expandedSubjectId === subject.id) {
          setExpandedSubjectId(null);
        }
        showToast(`Materia "${subject.name}" eliminada.`, 'warning');
      }
    });
  };

  // =========================================================================
  // HANDLERS: SESSIONS (SCHEDULE)
  // =========================================================================
  const handleAddSessionToSubject = (subjectId: string) => {
    if (!sessionStart || !sessionEnd) {
      showToast('Selecciona la hora de inicio y fin de la clase.', 'warning');
      return;
    }
    if (sessionStart >= sessionEnd) {
      showToast('La hora de inicio debe ser anterior a la hora de fin.', 'warning');
      return;
    }
    AcademicStore.addSession(subjectId, {
      day: Number(sessionDay),
      startTime: sessionStart,
      endTime: sessionEnd,
      classroom: sessionRoom.trim()
    });
    setSessionRoom('');
    showToast('Sesión de clase agregada correctamente.');
  };

  const handleGlobalAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSessionSubjectId) {
      showToast('Selecciona una materia para la clase.', 'warning');
      return;
    }
    handleAddSessionToSubject(globalSessionSubjectId);
    setShowAddSessionGlobalModal(false);
  };

  const handleSaveSessionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSessionData) return;
    if (editingSessionData.session.startTime >= editingSessionData.session.endTime) {
      showToast('La hora de inicio debe ser anterior a la hora de fin.', 'warning');
      return;
    }
    AcademicStore.updateSession(
      editingSessionData.subjectId, 
      editingSessionData.session.id, 
      {
        day: Number(editingSessionData.session.day),
        startTime: editingSessionData.session.startTime,
        endTime: editingSessionData.session.endTime,
        classroom: editingSessionData.session.classroom
      }
    );
    setEditingSessionData(null);
    showToast('Sesión de clase actualizada.');
  };

  const handleDeleteSession = (subjectId: string, sessionId: string, dayName?: string) => {
    openConfirm({
      title: '¿Eliminar sesión de clase?',
      message: `¿Está seguro de eliminar esta sesión de clase${dayName ? ' (' + dayName + ')' : ''}?`,
      isDanger: true,
      confirmText: 'Eliminar Sesión',
      onConfirm: () => {
        AcademicStore.deleteSession(subjectId, sessionId);
        if (editingSessionData?.session.id === sessionId) {
          setEditingSessionData(null);
        }
        showToast('Sesión de clase eliminada.', 'warning');
      }
    });
  };

  // =========================================================================
  // HANDLERS: CUTS
  // =========================================================================
  const handleOpenCutModal = (subjectId: string, cut?: AcademicCut) => {
    setCutSubjectId(subjectId);
    if (cut) {
      setEditingCut({ subjectId, cut });
      setCutName(cut.cutName);
      setCutWeight(cut.cutWeightPercent);
    } else {
      setEditingCut(null);
      setCutName('');
      setCutWeight(30);
    }
    setShowCutModal(true);
  };

  const handleSaveCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cutName.trim()) {
      showToast('Ingresa un nombre para el corte.', 'warning');
      return;
    }
    if (cutWeight <= 0 || cutWeight > 100) {
      showToast('El peso porcentaje debe ser entre 1% y 100%.', 'warning');
      return;
    }

    const targetSubj = subjects.find(s => s.id === cutSubjectId);
    if (targetSubj) {
      const otherCutsWeight = (targetSubj.cuts || [])
        .filter(c => editingCut ? c.id !== editingCut.cut.id : true)
        .reduce((sum, c) => sum + (Number(c.cutWeightPercent) || 0), 0);
      const totalNewWeight = Math.round((otherCutsWeight + Number(cutWeight)) * 10) / 10;
      if (totalNewWeight > 100) {
        showToast(`Los cortes superan el 100% (+${Math.round((totalNewWeight - 100) * 10) / 10}%). Debes corregir la distribución.`, 'error');
        return;
      }
    }

    if (editingCut) {
      AcademicStore.updateCut(editingCut.subjectId, editingCut.cut.id, {
        cutName: cutName.trim(),
        cutWeightPercent: Number(cutWeight)
      });
      showToast(`Corte "${cutName.trim()}" actualizado.`);
    } else {
      AcademicStore.addCut(cutSubjectId, cutName.trim(), Number(cutWeight));
      showToast(`Corte "${cutName.trim()}" creado.`);
    }
    setShowCutModal(false);
  };

  const handleDeleteCut = (subjectId: string, cut: AcademicCut) => {
    openConfirm({
      title: '¿Eliminar corte de evaluación?',
      message: `¿Está seguro de eliminar el corte "${cut.cutName}"? Esta acción eliminará también todas sus actividades y calificaciones asociadas.`,
      isDanger: true,
      confirmText: 'Eliminar Corte',
      onConfirm: () => {
        AcademicStore.deleteCut(subjectId, cut.id);
        showToast(`Corte "${cut.cutName}" eliminado.`, 'warning');
      }
    });
  };

  // =========================================================================
  // HANDLERS: EVALUATION ACTIVITIES & GRADES
  // =========================================================================
  const getInlineActivityState = (cutId: string) => {
    return newActivityForms[cutId] || {
      name: '',
      type: 'Parcial',
      date: todayStr,
      weight: 20
    };
  };

  const setInlineActivityState = (cutId: string, updates: Partial<{
    name: string;
    type: AcademicEvaluationActivity['type'];
    date: string;
    weight: number;
  }>) => {
    setNewActivityForms(prev => ({
      ...prev,
      [cutId]: { ...getInlineActivityState(cutId), ...updates }
    }));
  };

  const handleAddActivityInline = (subjectId: string, cutId: string) => {
    const formState = getInlineActivityState(cutId);
    if (!formState.name.trim()) {
      showToast('Ingresa el nombre de la evaluación.', 'warning');
      return;
    }

    const targetSubj = subjects.find(s => s.id === subjectId);
    const targetCut = targetSubj?.cuts?.find(c => c.id === cutId);
    if (targetCut) {
      const currentActsTotal = (targetCut.activities || []).reduce((sum, a) => sum + (Number(a.weightPercent) || 0), 0);
      const newTotal = Math.round((currentActsTotal + (Number(formState.weight) || 0)) * 10) / 10;
      if (newTotal > 100) {
        showToast(`Las actividades del corte superan el 100% (+${Math.round((newTotal - 100) * 10) / 10}%). Debes corregir la distribución.`, 'warning');
      }
    }

    AcademicStore.addActivity(subjectId, cutId, {
      name: formState.name.trim(),
      type: formState.type,
      date: formState.date || todayStr,
      weightPercent: Number(formState.weight) || 20,
      status: 'pending'
    });
    // Reset form for cutId
    setInlineActivityState(cutId, { name: '', weight: 20, date: todayStr });
    showToast(`Evaluación "${formState.name.trim()}" creada.`);
  };

  const handleOpenEditActivityModal = (subjectId: string, cutId: string, activity: AcademicEvaluationActivity) => {
    setEditingActivity({ subjectId, cutId, activity });
    setEditActName(activity.name);
    setEditActType(activity.type);
    setEditActDate(activity.date || todayStr);
    setEditActWeight(activity.weightPercent);
    setEditActStatus(activity.status);
    setEditActGrade(activity.grade !== undefined && activity.grade !== null ? String(activity.grade) : '');
  };

  const handleSaveActivityEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    if (!editActName.trim()) {
      showToast('Ingresa el nombre de la evaluación.', 'warning');
      return;
    }

    let parsedGrade: number | undefined = undefined;
    if (editActGrade.trim() !== '') {
      parsedGrade = Number(editActGrade);
      if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 5.0) {
        showToast('La calificación debe estar entre 0.0 y 5.0', 'warning');
        return;
      }
    }

    const targetSubj = subjects.find(s => s.id === editingActivity.subjectId);
    const targetCut = targetSubj?.cuts?.find(c => c.id === editingActivity.cutId);
    if (targetCut) {
      const otherActsWeight = (targetCut.activities || [])
        .filter(a => a.id !== editingActivity.activity.id)
        .reduce((sum, a) => sum + (Number(a.weightPercent) || 0), 0);
      const totalNewWeight = Math.round((otherActsWeight + Number(editActWeight)) * 10) / 10;
      if (totalNewWeight > 100) {
        showToast(`Las actividades superan el 100% (+${Math.round((totalNewWeight - 100) * 10) / 10}%). Debes corregir la distribución.`, 'warning');
      }
    }

    const newStatus = parsedGrade !== undefined ? 'graded' : editActStatus;

    AcademicStore.updateActivity(
      editingActivity.subjectId,
      editingActivity.cutId,
      editingActivity.activity.id,
      {
        name: editActName.trim(),
        type: editActType,
        date: editActDate || todayStr,
        weightPercent: Number(editActWeight),
        status: newStatus,
        grade: parsedGrade
      }
    );

    setEditingActivity(null);
    showToast(`Evaluación "${editActName.trim()}" actualizada.`);
  };

  const handleQuickGradeChange = (subjectId: string, cutId: string, activityId: string, gradeStr: string) => {
    if (gradeStr === '') {
      AcademicStore.updateActivity(subjectId, cutId, activityId, {
        grade: undefined,
        status: 'pending'
      });
      showToast('Nota borrada (evaluación en estado pendiente).');
      return;
    }

    const val = Number(gradeStr);
    if (!isNaN(val) && val >= 0 && val <= 5.0) {
      AcademicStore.updateActivity(subjectId, cutId, activityId, {
        grade: val,
        status: 'graded'
      });
      showToast(`Nota ${formatGrade(val)} guardada.`);
    }
  };

  const handleDeleteActivity = (subjectId: string, cutId: string, activity: AcademicEvaluationActivity) => {
    openConfirm({
      title: '¿Eliminar evaluación?',
      message: `¿Está seguro de eliminar la actividad "${activity.name}"? Se perderán sus calificaciones y ponderaciones asociadas.`,
      isDanger: true,
      confirmText: 'Eliminar Evaluación',
      onConfirm: () => {
        AcademicStore.deleteActivity(subjectId, cutId, activity.id);
        if (editingActivity?.activity.id === activity.id) {
          setEditingActivity(null);
        }
        showToast(`Evaluación "${activity.name}" eliminada.`, 'warning');
      }
    });
  };

  // =========================================================================
  // HANDLERS: ACADEMIC ACTIVITIES (NON-GRADED EVENTS)
  // =========================================================================
  const handleOpenAcademicActivityModal = (subjectId?: string, act?: AcademicActivity) => {
    if (act) {
      setEditingAcademicActivity(act);
      setAcadActName(act.name);
      setAcadActType(act.type);
      setAcadActCustomType('');
      setAcadActSubjectId(act.subjectId);
      setAcadActDate(act.date || todayStr);
      setAcadActStartTime(act.startTime || '08:00');
      setAcadActEndTime(act.endTime || '');
      setAcadActLocation(act.location || '');
      setAcadActProfessor(act.professor || '');
      setAcadActDescription(act.description || '');
      setAcadActStatus(act.status || 'Pendiente');
    } else {
      setEditingAcademicActivity(null);
      setAcadActName('');
      setAcadActType('Salida de campo');
      setAcadActCustomType('');
      setAcadActSubjectId(subjectId || (activeSubjects[0]?.id || ''));
      setAcadActDate(todayStr);
      setAcadActStartTime('08:00');
      setAcadActEndTime('');
      setAcadActLocation('');
      setAcadActProfessor('');
      setAcadActDescription('');
      setAcadActStatus('Pendiente');
    }
    setShowAcademicActivityModal(true);
  };

  const handleSaveAcademicActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acadActName.trim()) {
      showToast('Ingresa un nombre para la actividad académica.', 'warning');
      return;
    }
    if (!acadActSubjectId) {
      showToast('Selecciona la materia para la actividad.', 'warning');
      return;
    }

    const finalType = acadActType === 'Otro' && acadActCustomType.trim() ? acadActCustomType.trim() : acadActType;

    if (editingAcademicActivity) {
      AcademicStore.updateAcademicActivity(editingAcademicActivity.id, {
        name: acadActName.trim(),
        type: finalType,
        subjectId: acadActSubjectId,
        date: acadActDate || todayStr,
        startTime: acadActStartTime,
        endTime: acadActEndTime,
        location: acadActLocation.trim(),
        professor: acadActProfessor.trim(),
        description: acadActDescription.trim(),
        status: acadActStatus
      });
      showToast(`Actividad "${acadActName.trim()}" actualizada.`);
    } else {
      AcademicStore.addAcademicActivity({
        name: acadActName.trim(),
        type: finalType,
        subjectId: acadActSubjectId,
        date: acadActDate || todayStr,
        startTime: acadActStartTime,
        endTime: acadActEndTime,
        location: acadActLocation.trim(),
        professor: acadActProfessor.trim(),
        description: acadActDescription.trim(),
        status: acadActStatus
      });
      showToast(`Actividad "${acadActName.trim()}" creada con éxito.`);
    }
    setShowAcademicActivityModal(false);
  };

  const handleDeleteAcademicActivity = (act: AcademicActivity) => {
    openConfirm({
      title: '¿Eliminar actividad académica?',
      message: `¿Está seguro de eliminar la actividad "${act.name}"? Esta acción no se puede deshacer.`,
      isDanger: true,
      confirmText: 'Eliminar Actividad',
      onConfirm: () => {
        AcademicStore.deleteAcademicActivity(act.id);
        showToast(`Actividad "${act.name}" eliminada.`, 'warning');
      }
    });
  };

  const handleToggleAcademicActivityStatus = (act: AcademicActivity, newStatus: AcademicActivityStatus) => {
    AcademicStore.updateAcademicActivity(act.id, { status: newStatus });
    showToast(`Estado de "${act.name}" actualizado a "${newStatus}".`);
  };

  // Preset Color Palettes for Subjects
  const colorPresets = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

  return (
    <div className="w-full space-y-6 font-sans min-h-screen pb-16 text-slate-100 relative">
      
      {/* ========================================================= */}
      {/* FLOATING TOAST NOTIFICATION                               */}
      {/* ========================================================= */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' 
            : toast.type === 'warning'
            ? 'bg-amber-950/90 text-amber-200 border-amber-500/40'
            : 'bg-rose-950/90 text-rose-200 border-rose-500/40'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP LIQUID GLASS PANEL (PANEL SUPERIOR)                */}
      {/* ========================================================= */}
      <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Active Semester Badge & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
              <GraduationCap className="w-7 h-7 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  Oficina Académica
                </h1>
                {activeSemester ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-mono font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{activeSemester.name}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenSemesterModal()}
                    className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-mono flex items-center gap-1 transition-all"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Crear semestre activo</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Coordinación Ejecutiva Universitaria & Performance Académico
              </p>
            </div>
          </div>

          {/* Global Search & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar materia, profesor o aula..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#132337]/80 backdrop-blur-md border border-blue-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#C5A059] transition-all"
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

            {/* Crear Actividad Académica Button */}
            <button
              onClick={() => handleOpenAcademicActivityModal()}
              className="px-3.5 py-2 bg-[#132337] hover:bg-[#1A2E48] text-xs font-semibold text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4 text-emerald-400" /> + Actividad
            </button>

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
              className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-amber-600 hover:from-amber-500 hover:to-amber-700 text-xs font-bold text-slate-950 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-900/20 active:scale-95"
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
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'activities'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-400/40'
                : 'bg-[#132337]/60 hover:bg-[#192E48] text-slate-300 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4 text-[#C5A059]" /> Actividades Académicas
            {activeSubjects.reduce((sum, s) => sum + (s.academicActivities?.length || 0), 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-mono">
                {activeSubjects.reduce((sum, s) => sum + (s.academicActivities?.length || 0), 0)}
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
      {/* 2. EXECUTIVE OVERVIEW STATS CARDS                         */}
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
          <div className="text-[11px] text-slate-400 font-medium truncate">
            {activeSemester ? `Inscritas en ${activeSemester.name}` : 'Sin semestre activo'}
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
            {todayClasses.length > 0 ? `Primera: ${todayClasses[0].session.startTime}` : 'Sin clases hoy'}
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
          <div className="text-[11px] text-slate-400 font-medium truncate">
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
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${semesterProgress}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate">
            Avance sobre calendario
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
                  <p className="text-xs text-slate-500">Aprovecha para repasar apuntes o revisar las próximas evaluaciones.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayClasses.map(({ subject, session }, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-[#132337]/70 backdrop-blur-md rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-blue-400/50 transition-all shadow-md cursor-pointer"
                      style={{ borderLeftWidth: '5px', borderLeftColor: subject.color }}
                      onClick={() => setEditingSessionData({ subjectId: subject.id, subjectName: subject.name, session })}
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

                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-400/40 rounded-xl text-xs font-mono font-bold text-blue-200 shrink-0">
                          {session.startTime} – {session.endTime}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionData({ subjectId: subject.id, subjectName: subject.name, session });
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Editar sesión"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 5 COLS: PRÓXIMAS EVALUACIONES Y TAREAS PENDIENTES */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PRÓXIMAS EVALUACIONES */}
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

                      <div className="text-right shrink-0 space-y-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border block ${
                          item.daysDiff === 0 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                            : item.daysDiff === 1 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {item.daysDiff === 0 ? '¡Hoy!' : item.daysDiff === 1 ? 'Mañana' : `En ${item.daysDiff} días`}
                        </span>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => {
                              const sub = activeSubjects.find(s => s.id === item.subjectId);
                              const cut = sub?.cuts?.find(c => c.id === item.cutId);
                              const act = cut?.activities.find(a => a.id === item.activityId);
                              if (sub && cut && act) {
                                handleOpenEditActivityModal(sub.id, cut.id, act);
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-white bg-white/5 rounded"
                            title="Registrar nota / Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRÓXIMAS ACTIVIDADES ACADÉMICAS */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" /> Próximas Actividades Académicas
                </h3>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="text-xs text-[#C5A059] hover:underline"
                >
                  Ver todas
                </button>
              </div>

              {upcomingAcademicActivities.length === 0 ? (
                <div className="p-6 text-center bg-[#132337]/40 rounded-xl border border-dashed border-emerald-500/20 text-slate-400 space-y-1">
                  <Compass className="w-8 h-8 text-emerald-500/50 mx-auto" />
                  <p className="text-xs text-slate-300">No hay actividades académicas agendadas.</p>
                  <p className="text-[11px] text-slate-500">Salidas de campo, laboratorios y conferencias no calificables.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAcademicActivities.slice(0, 5).map(({ activity, subject }, idx) => (
                    <div key={idx} className="p-3 bg-[#132337]/70 rounded-xl border border-white/10 flex justify-between items-center gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm">{AcademicCalculations.getActivityTypeIcon(activity.type)}</span>
                          <span className="font-bold text-white text-xs">{activity.name}</span>
                          <span 
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {activity.type} • {activity.date} {activity.startTime ? `(${activity.startTime})` : ''} {activity.location ? `• Salón: ${activity.location}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleAcademicActivityStatus(activity, activity.status === 'Realizada' ? 'Pendiente' : 'Realizada')}
                          className={`p-1.5 rounded-lg border text-xs font-bold ${activity.status === 'Realizada' ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'}`}
                          title={activity.status === 'Realizada' ? 'Marcar Pendiente' : 'Marcar Realizada'}
                        >
                          {activity.status === 'Realizada' ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenAcademicActivityModal(subject.id, activity)}
                          className="p-1.5 text-slate-300 hover:text-white bg-white/5 rounded-lg"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
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
          
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h3 className="font-serif font-bold text-lg text-white">Asignaturas de {activeSemester?.name || 'Semestre'}</h3>
            <button
              onClick={() => handleOpenSubjectModal()}
              className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-amber-600 hover:from-amber-500 hover:to-amber-700 font-bold text-slate-950 text-xs rounded-xl shadow-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Crear Materia
            </button>
          </div>

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

                      {/* Right stats and buttons */}
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
                              handleDeleteSubject(subject);
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
                        
                        {/* 5 SUB-TABS: Información, Horario, Evaluaciones, Cronograma, Notas */}
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
                            onClick={() => setSubjectSubTab('cronograma')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              subjectSubTab === 'cronograma'
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#132337] text-slate-300 hover:text-white'
                            }`}
                          >
                            📅 Cronograma ({
                              (subject.scheduleSessions?.length || 0) +
                              (subject.cuts?.reduce((s, c) => s + (c.activities?.length || 0), 0) || 0) +
                              (subject.academicActivities?.length || 0)
                            })
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
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => setEditingSessionData({ subjectId: subject.id, subjectName: subject.name, session: ses })}
                                      className="text-slate-300 hover:text-white p-1"
                                      title="Editar sesión"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSession(subject.id, ses.id, getDayOfWeekName(ses.day))}
                                      className="text-rose-400 hover:text-rose-300 p-1"
                                      title="Eliminar sesión"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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
                            {/* Cuts Distribution Indicator Bar */}
                            <CutsDistributionBar cuts={subject.cuts || []} />

                            {/* Crear Corte Button */}
                            <div className="flex justify-between items-center text-xs pt-1">
                              <span className="font-bold text-slate-300">Cortes de Evaluación ({subject.cuts?.length || 0})</span>
                              <button
                                onClick={() => handleOpenCutModal(subject.id)}
                                className="px-3 py-1.5 bg-[#C5A059] hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1 shadow-md transition-all active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" /> Nuevo Corte
                              </button>
                            </div>

                            {/* List of Cuts */}
                            {(!subject.cuts || subject.cuts.length === 0) ? (
                              <div className="p-6 text-center bg-[#132337]/40 rounded-xl border border-dashed border-white/10 text-slate-400 text-xs">
                                No hay cortes creados. Agrega cortes para organizar parciales, quices y talleres.
                              </div>
                            ) : (
                              subject.cuts.map(cut => {
                                const formState = getInlineActivityState(cut.id);

                                return (
                                  <div key={cut.id} className="p-4 bg-[#132337]/60 rounded-xl border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-[#C5A059] text-sm">{cut.cutName}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                                          Valor: {cut.cutWeightPercent}% de la materia
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleOpenCutModal(subject.id, cut)}
                                          className="text-slate-400 hover:text-white p-1"
                                          title="Editar corte"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteCut(subject.id, cut)}
                                          className="text-rose-400 hover:text-rose-300 p-1"
                                          title="Eliminar corte"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Activities Distribution Bar for this cut */}
                                    <ActivitiesDistributionBar activities={cut.activities || []} />

                                    {/* Activities in Cut */}
                                    <div className="space-y-2">
                                      {(!cut.activities || cut.activities.length === 0) ? (
                                        <div className="text-[11px] text-slate-400 italic py-1">Sin actividades agregadas en este corte.</div>
                                      ) : (
                                        cut.activities.map(act => (
                                          <div key={act.id} className="p-2.5 bg-[#0d131a]/80 rounded-lg border border-white/5 flex flex-wrap justify-between items-center gap-2 text-xs">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-white">{act.name}</span>
                                              <span className="text-slate-400 text-[11px]">({act.type} - {act.weightPercent}% del corte)</span>
                                              <span className="text-slate-400 font-mono text-[11px]">[{act.date}]</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <span className="text-slate-400 text-xs">Nota:</span>
                                              <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={act.grade !== undefined && act.grade !== null ? act.grade : ''}
                                                onChange={e => handleQuickGradeChange(subject.id, cut.id, act.id, e.target.value)}
                                                placeholder="0.0"
                                                className="w-16 p-1 bg-[#132337] border border-blue-500/30 rounded text-center font-bold text-white font-mono"
                                              />
                                              <button
                                                onClick={() => handleOpenEditActivityModal(subject.id, cut.id, act)}
                                                className="text-slate-300 hover:text-white p-1"
                                                title="Editar detalles de la evaluación"
                                              >
                                                <Edit3 className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteActivity(subject.id, cut.id, act)}
                                                className="text-rose-400 hover:text-rose-300 p-1"
                                                title="Eliminar evaluación"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    {/* Add Activity Form Controlled via React state */}
                                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
                                      <input
                                        type="text"
                                        placeholder="Nueva evaluación..."
                                        value={formState.name}
                                        onChange={e => setInlineActivityState(cut.id, { name: e.target.value })}
                                        className="p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white flex-1 min-w-[140px]"
                                      />
                                      <select 
                                        value={formState.type} 
                                        onChange={e => setInlineActivityState(cut.id, { type: e.target.value as any })} 
                                        className="p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white"
                                      >
                                        <option value="Parcial">Parcial</option>
                                        <option value="Quiz">Quiz</option>
                                        <option value="Taller">Taller</option>
                                        <option value="Laboratorio">Laboratorio</option>
                                        <option value="Exposición">Exposición</option>
                                        <option value="Proyecto">Proyecto</option>
                                        <option value="Otro">Otro</option>
                                      </select>
                                      <input 
                                        type="date" 
                                        value={formState.date} 
                                        onChange={e => setInlineActivityState(cut.id, { date: e.target.value })} 
                                        className="p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white font-mono" 
                                      />
                                      <input 
                                        type="number" 
                                        value={formState.weight} 
                                        onChange={e => setInlineActivityState(cut.id, { weight: Number(e.target.value) })} 
                                        placeholder="%" 
                                        className="w-14 p-1.5 bg-[#0d131a] border border-blue-500/30 rounded text-white font-mono" 
                                      />
                                      <button
                                        onClick={() => handleAddActivityInline(subject.id, cut.id)}
                                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1"
                                      >
                                        + Evaluación
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                        {/* SUB-TAB 4: CRONOGRAMA UNIFICADO */}
                        {subjectSubTab === 'cronograma' && (() => {
                          // Collect 3 categories
                          const classItems = (subject.scheduleSessions || []).map(ses => ({
                            id: ses.id,
                            kind: 'class' as const,
                            title: `Clase: ${getDayOfWeekName(ses.day)}`,
                            subtitle: `${ses.startTime} – ${ses.endTime}${ses.classroom || subject.classroom ? ` • Aula: ${ses.classroom || subject.classroom}` : ''}`,
                            dateStr: `Cada ${getDayOfWeekName(ses.day)}`,
                            icon: '🏫',
                            status: 'Horario Semanal',
                            sortKey: ses.day * 100
                          }));

                          const evalItems = (subject.cuts || []).flatMap(cut => 
                            (cut.activities || []).map(act => ({
                              id: act.id,
                              kind: 'evaluation' as const,
                              title: act.name,
                              subtitle: `${act.type || 'Evaluación'} (${act.weightPercent}% del ${cut.cutName})`,
                              dateStr: act.date ? act.date : 'Sin fecha',
                              icon: '📊',
                              status: act.status === 'graded' ? `Calificado: ${formatGrade(act.grade || 0)}` : 'Evaluación Calificable',
                              sortKey: act.date ? new Date(act.date).getTime() : 9999999999999
                            }))
                          );

                          const actItems = (subject.academicActivities || []).map(act => ({
                            id: act.id,
                            kind: 'activity' as const,
                            title: act.name,
                            subtitle: `${act.type} ${act.startTime ? `• ${act.startTime}` : ''} ${act.endTime ? `- ${act.endTime}` : ''} ${act.location ? `• Ubicación: ${act.location}` : ''}`,
                            dateStr: act.date || 'Sin fecha',
                            icon: AcademicCalculations.getActivityTypeIcon(act.type),
                            status: act.status || 'Pendiente',
                            professor: act.professor,
                            description: act.description,
                            rawAct: act,
                            sortKey: act.date ? new Date(act.date).getTime() : 9999999999999
                          }));

                          let items: Array<typeof classItems[0] | typeof evalItems[0] | typeof actItems[0]> = [];
                          if (cronogramaFilter === 'all') {
                            items = [...classItems, ...evalItems, ...actItems];
                          } else if (cronogramaFilter === 'classes') {
                            items = classItems;
                          } else if (cronogramaFilter === 'evaluations') {
                            items = evalItems;
                          } else if (cronogramaFilter === 'activities') {
                            items = actItems;
                          }

                          items.sort((a, b) => a.sortKey - b.sortKey);

                          return (
                            <div className="space-y-4">
                              {/* Header & Filter Controls */}
                              <div className="flex flex-wrap justify-between items-center gap-3 bg-[#132337]/80 p-3 rounded-xl border border-white/10">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-300">Filtrar por:</span>
                                  <div className="flex gap-1.5 flex-wrap">
                                    <button
                                      onClick={() => setCronogramaFilter('all')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                        cronogramaFilter === 'all'
                                          ? 'bg-blue-600 text-white shadow'
                                          : 'bg-[#0d131a] text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      Todo ({classItems.length + evalItems.length + actItems.length})
                                    </button>
                                    <button
                                      onClick={() => setCronogramaFilter('classes')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                        cronogramaFilter === 'classes'
                                          ? 'bg-blue-600 text-white shadow'
                                          : 'bg-[#0d131a] text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      🏫 Clases ({classItems.length})
                                    </button>
                                    <button
                                      onClick={() => setCronogramaFilter('evaluations')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                        cronogramaFilter === 'evaluations'
                                          ? 'bg-blue-600 text-white shadow'
                                          : 'bg-[#0d131a] text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      📊 Evaluaciones ({evalItems.length})
                                    </button>
                                    <button
                                      onClick={() => setCronogramaFilter('activities')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                        cronogramaFilter === 'activities'
                                          ? 'bg-emerald-600 text-white shadow'
                                          : 'bg-[#0d131a] text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      🧪 Actividades ({actItems.length})
                                    </button>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleOpenAcademicActivityModal(subject.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow transition-all active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Nueva Actividad Académica
                                </button>
                              </div>

                              {/* Timeline Container */}
                              {items.length === 0 ? (
                                <div className="p-8 text-center bg-[#132337]/40 rounded-xl border border-dashed border-white/10 text-slate-400 text-xs space-y-2">
                                  <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                                  <p>No hay eventos registrados en este filtro para {subject.name}.</p>
                                </div>
                              ) : (
                                <div className="relative border-l-2 border-blue-500/30 ml-3 pl-5 space-y-3 py-1">
                                  {items.map((item, idx) => {
                                    const isAct = item.kind === 'activity';
                                    const actStatus = isAct ? (item.status as AcademicActivityStatus) : undefined;

                                    return (
                                      <div key={idx} className="relative group">
                                        {/* Timeline Marker Dot */}
                                        <div className={`absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d1b2e] ${
                                          item.kind === 'class'
                                            ? 'bg-blue-500'
                                            : item.kind === 'evaluation'
                                            ? 'bg-rose-500'
                                            : 'bg-emerald-400'
                                        }`} />

                                        <div className="p-3.5 bg-[#132337]/80 hover:bg-[#132337] rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all shadow-sm">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-base">{item.icon}</span>
                                              <span className="font-bold text-white text-xs">{item.title}</span>
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                item.kind === 'class'
                                                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                                  : item.kind === 'evaluation'
                                                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                              }`}>
                                                {item.kind === 'class' ? 'Clase' : item.kind === 'evaluation' ? 'Evaluación (Calificable)' : 'Actividad Académica (No Calificable)'}
                                              </span>
                                            </div>

                                            <div className="text-xs text-slate-300">{item.subtitle}</div>

                                            {isAct && (
                                              <div className="text-[11px] text-slate-400 flex flex-wrap gap-3 pt-0.5">
                                                {item.professor && <span>👨‍🏫 Prof: {item.professor}</span>}
                                                {item.description && <span>📝 {item.description}</span>}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                            <div className="text-right">
                                              <div className="text-xs font-mono font-bold text-white">{item.dateStr}</div>
                                              <div className="text-[10px]">
                                                {isAct ? (
                                                  <span className={`font-bold px-2 py-0.5 rounded ${
                                                    actStatus === 'Realizada'
                                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                      : actStatus === 'Cancelada'
                                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                      : actStatus === 'Reprogramada'
                                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                  }`}>
                                                    {actStatus}
                                                  </span>
                                                ) : (
                                                  <span className="text-slate-400">{item.status}</span>
                                                )}
                                              </div>
                                            </div>

                                            {isAct && 'rawAct' in item && item.rawAct && (
                                              <div className="flex items-center gap-1 bg-[#0d131a] p-1 rounded-lg border border-white/10">
                                                <button
                                                  onClick={() => handleToggleAcademicActivityStatus(item.rawAct!, item.rawAct!.status === 'Realizada' ? 'Pendiente' : 'Realizada')}
                                                  className={`p-1 rounded text-xs font-bold ${item.rawAct!.status === 'Realizada' ? 'text-amber-400 hover:bg-amber-500/20' : 'text-emerald-400 hover:bg-emerald-500/20'}`}
                                                  title={item.rawAct!.status === 'Realizada' ? 'Marcar Pendiente' : 'Marcar Realizada'}
                                                >
                                                  {item.rawAct!.status === 'Realizada' ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                  onClick={() => handleOpenAcademicActivityModal(subject.id, item.rawAct!)}
                                                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10"
                                                  title="Editar actividad"
                                                >
                                                  <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteAcademicActivity(item.rawAct!)}
                                                  className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                                                  title="Eliminar actividad"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* SUB-TAB 5: NOTAS Y CALCULADORA REQUERIDA */}
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
          <div className="flex justify-between items-center border-b border-white/10 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C5A059]" /> Horario Semanal Continuo
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Haz clic en cualquier clase para modificar sus horas, aula o eliminarla.
              </p>
            </div>

            <button
              onClick={() => {
                if (activeSubjects.length === 0) {
                  showToast('Debes registrar al menos una materia antes de crear sesiones.', 'warning');
                  return;
                }
                setGlobalSessionSubjectId(activeSubjects[0].id);
                setShowAddSessionGlobalModal(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Agregar Sesión
            </button>
          </div>

          {/* WEEKLY SCHEDULE GRID */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-7 gap-2">
              
              {/* Header Days */}
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

              {/* Grid content */}
              <div className="col-span-7 grid grid-cols-7 gap-2 relative min-h-[560px] bg-[#0d1b2e]/60 rounded-xl border border-white/10 p-2">
                
                {/* Time Axis Column */}
                <div className="space-y-8 text-[11px] font-mono text-slate-400 pt-2 text-center border-r border-white/10">
                  {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time, idx) => (
                    <div key={idx} className="h-10 flex items-center justify-center">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day Columns (Days 1 to 6) */}
                {[1, 2, 3, 4, 5, 6].map((dayNum) => {
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
                        const [startH, startM] = session.startTime.split(':').map(Number);
                        const [endH, endM] = session.endTime.split(':').map(Number);

                        const startMins = (startH * 60 + startM) - (6 * 60);
                        const endMins = (endH * 60 + endM) - (6 * 60);
                        const durationMins = Math.max(30, endMins - startMins);

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
      {/* TAB 4: PRÓXIMAS EVALUACIONES                              */}
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
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-rose-500/30 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                        {ev.subjectName}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const sub = activeSubjects.find(s => s.id === ev.subjectId);
                            const cut = sub?.cuts?.find(c => c.id === ev.cutId);
                            const act = cut?.activities.find(a => a.id === ev.activityId);
                            if (sub && cut && act) handleOpenEditActivityModal(sub.id, cut.id, act);
                          }}
                          className="p-1 text-slate-300 hover:text-white"
                          title="Editar / Registrar nota"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-amber-500/30 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                        {ev.subjectName}
                      </span>
                      <button
                        onClick={() => {
                          const sub = activeSubjects.find(s => s.id === ev.subjectId);
                          const cut = sub?.cuts?.find(c => c.id === ev.cutId);
                          const act = cut?.activities.find(a => a.id === ev.activityId);
                          if (sub && cut && act) handleOpenEditActivityModal(sub.id, cut.id, act);
                        }}
                        className="p-1 text-slate-300 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-blue-500/30 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                        {ev.subjectName}
                      </span>
                      <button
                        onClick={() => {
                          const sub = activeSubjects.find(s => s.id === ev.subjectId);
                          const cut = sub?.cuts?.find(c => c.id === ev.cutId);
                          const act = cut?.activities.find(a => a.id === ev.activityId);
                          if (sub && cut && act) handleOpenEditActivityModal(sub.id, cut.id, act);
                        }}
                        className="p-1 text-slate-300 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                  <div key={idx} className="p-3 bg-[#132337] rounded-xl border border-purple-500/30 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold inline-block" style={{ backgroundColor: ev.subjectColor }}>
                        {ev.subjectName}
                      </span>
                      <button
                        onClick={() => {
                          const sub = activeSubjects.find(s => s.id === ev.subjectId);
                          const cut = sub?.cuts?.find(c => c.id === ev.cutId);
                          const act = cut?.activities.find(a => a.id === ev.activityId);
                          if (sub && cut && act) handleOpenEditActivityModal(sub.id, cut.id, act);
                        }}
                        className="p-1 text-slate-300 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
      {/* TAB 5: ACTIVIDADES ACADÉMICAS (EVENTOS NO CALIFICABLES)   */}
      {/* ========================================================= */}
      {activeTab === 'activities' && (() => {
        // Gather all activities across active subjects
        const allActList = activeSubjects.flatMap(sub => 
          (sub.academicActivities || []).map(act => ({ activity: act, subject: sub }))
        );

        // Filter by subject, status, type, and search query
        const filteredActList = allActList.filter(({ activity, subject }) => {
          if (activitiesFilterSubject !== 'all' && subject.id !== activitiesFilterSubject) return false;
          if (activitiesFilterStatus !== 'all' && activity.status !== activitiesFilterStatus) return false;
          if (activitiesFilterType !== 'all' && activity.type !== activitiesFilterType) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = activity.name.toLowerCase().includes(q);
            const matchesSubject = subject.name.toLowerCase().includes(q);
            const matchesType = activity.type.toLowerCase().includes(q);
            const matchesLoc = (activity.location || '').toLowerCase().includes(q);
            const matchesProf = (activity.professor || '').toLowerCase().includes(q);
            if (!matchesName && !matchesSubject && !matchesType && !matchesLoc && !matchesProf) return false;
          }
          return true;
        });

        // Unique activity types present for filter dropdown
        const availableTypes = Array.from(new Set(allActList.map(a => a.activity.type)));

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-emerald-400" />
                  Centro de Actividades Académicas
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Organización semestral de eventos no calificables: salidas de campo, laboratorios, talleres, conferencias, tutorías y entregas documentales.
                </p>
              </div>

              <button
                onClick={() => handleOpenAcademicActivityModal()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> Registrar Actividad Académica
              </button>
            </div>

            {/* Filter Controls Bar */}
            <div className="p-4 bg-[#0B1528]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Filter className="w-4 h-4 text-[#C5A059]" /> Filtros:
              </div>

              {/* Subject Filter */}
              <select
                value={activitiesFilterSubject}
                onChange={e => setActivitiesFilterSubject(e.target.value)}
                className="p-2 bg-[#132337] border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="all">Todas las materias ({activeSubjects.length})</option>
                {activeSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={activitiesFilterStatus}
                onChange={e => setActivitiesFilterStatus(e.target.value)}
                className="p-2 bg-[#132337] border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">⏳ Pendiente</option>
                <option value="Realizada">✅ Realizada</option>
                <option value="Cancelada">❌ Cancelada</option>
                <option value="Reprogramada">🔄 Reprogramada</option>
              </select>

              {/* Type Filter */}
              <select
                value={activitiesFilterType}
                onChange={e => setActivitiesFilterType(e.target.value)}
                className="p-2 bg-[#132337] border border-blue-500/30 rounded-xl text-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="all">Todos los tipos</option>
                {availableTypes.map((t, idx) => (
                  <option key={idx} value={t}>{AcademicCalculations.getActivityTypeIcon(t as any)} {t}</option>
                ))}
              </select>

              {(activitiesFilterSubject !== 'all' || activitiesFilterStatus !== 'all' || activitiesFilterType !== 'all') && (
                <button
                  onClick={() => {
                    setActivitiesFilterSubject('all');
                    setActivitiesFilterStatus('all');
                    setActivitiesFilterType('all');
                  }}
                  className="px-3 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl border border-rose-500/30 font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Limpiar filtros
                </button>
              )}
            </div>

            {/* Activities List / Cards Grid */}
            {filteredActList.length === 0 ? (
              <div className="bg-[#0B1528]/80 backdrop-blur-xl border border-dashed border-emerald-500/20 rounded-2xl p-12 text-center space-y-3">
                <Compass className="w-16 h-16 text-emerald-500/40 mx-auto" />
                <h4 className="text-base font-serif font-bold text-white">No hay actividades académicas registradas</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Toda información debe ser registrada por el usuario. Crea tu primera salida de campo, laboratorio, conferencia o clase especial.
                </p>
                <button
                  onClick={() => handleOpenAcademicActivityModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Crear Actividad Académica
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredActList.map(({ activity, subject }) => {
                  const typeIcon = AcademicCalculations.getActivityTypeIcon(activity.type);
                  const status = activity.status || 'Pendiente';

                  return (
                    <div
                      key={activity.id}
                      className="bg-[#0B1528]/90 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition-all hover:translate-y-[-2px] flex flex-col justify-between"
                      style={{ borderTopWidth: '4px', borderTopColor: subject.color }}
                    >
                      <div className="space-y-3">
                        {/* Header: Type icon, title, status */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl p-2 bg-[#132337] rounded-xl border border-white/10">{typeIcon}</span>
                            <div>
                              <h4 className="font-bold text-white text-sm leading-snug">{activity.name}</h4>
                              <span 
                                className="text-[10px] font-bold px-2 py-0.5 rounded text-white inline-block mt-0.5"
                                style={{ backgroundColor: subject.color }}
                              >
                                {subject.name}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                            status === 'Realizada'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : status === 'Cancelada'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : status === 'Reprogramada'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {status}
                          </span>
                        </div>

                        {/* Details list */}
                        <div className="p-3 bg-[#132337]/60 rounded-xl space-y-2 text-xs border border-white/5">
                          <div className="flex items-center gap-2 text-slate-300 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                            <span>{activity.date || 'Sin fecha'}</span>
                            {activity.startTime && (
                              <span className="text-slate-400">({activity.startTime} {activity.endTime ? `- ${activity.endTime}` : ''})</span>
                            )}
                          </div>

                          {activity.location && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-blue-400" />
                              <span>{activity.location}</span>
                            </div>
                          )}

                          {activity.professor && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <User className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Prof: {activity.professor}</span>
                            </div>
                          )}

                          {activity.description && (
                            <div className="pt-1 text-[11px] text-slate-400 italic border-t border-white/5">
                              "{activity.description}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs">
                        {/* Status Toggle Button */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleAcademicActivityStatus(activity, status === 'Realizada' ? 'Pendiente' : 'Realizada')}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${
                              status === 'Realizada'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            }`}
                          >
                            {status === 'Realizada' ? (
                              <><RotateCcw className="w-3.5 h-3.5" /> Volver Pendiente</>
                            ) : (
                              <><Check className="w-3.5 h-3.5" /> Marcar Realizada</>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenAcademicActivityModal(subject.id, activity)}
                            className="p-1.5 text-slate-300 hover:text-white bg-[#132337] hover:bg-blue-900/50 rounded-lg border border-white/10 transition-colors"
                            title="Editar actividad"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAcademicActivity(activity)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-[#132337] hover:bg-rose-900/50 rounded-lg border border-white/10 transition-colors"
                            title="Eliminar actividad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* TAB 6: SEGUIMIENTO ACADÉMICO                              */}
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
          <div className="flex justify-between items-center flex-wrap gap-2">
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
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
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

                  <div className="flex items-center gap-2 shrink-0">
                    {!sem.isActive && (
                      <button
                        onClick={() => handleSetActiveSemester(sem.id, sem.name)}
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
                      onClick={() => handleDeleteSemester(sem)}
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
      {/* MODAL: CONFIRMACIÓN DE ACCIONES CRÍTICAS                  */}
      {/* ========================================================= */}
      {confirmModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0B1528] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">{confirmModalData.title}</h3>
                <p className="text-xs text-rose-300 font-medium">Confirmación requerida</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModalData.message}
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 rounded-xl transition-all"
              >
                {confirmModalData.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmModalData.onConfirm;
                  setConfirmModalData(null);
                  action();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  confirmModalData.isDanger !== false 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {confirmModalData.confirmText || 'Confirmar'}
              </button>
            </div>
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
                <label className="text-xs font-bold text-slate-300 block mb-1">Semestre Perteneciente</label>
                <select
                  value={subjSemesterId}
                  onChange={e => setSubjSemesterId(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white"
                >
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Activo)' : ''}</option>
                  ))}
                </select>
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Color Institucional</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={subjColor}
                    onChange={e => setSubjColor(e.target.value)}
                    className="w-10 h-10 p-1 bg-[#132337] border border-blue-500/30 rounded-xl cursor-pointer shrink-0"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSubjColor(hex)}
                        className={`w-6 h-6 rounded-full border ${subjColor === hex ? 'ring-2 ring-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Aula Predeterminada</label>
                <input
                  type="text"
                  placeholder="Ej: Aula 301, Lab de Cómputo"
                  value={subjClassroom}
                  onChange={e => setSubjClassroom(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white"
                />
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
      {/* MODAL GLOBAL AGREGAR SESIÓN                                */}
      {/* ========================================================= */}
      {showAddSessionGlobalModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-serif font-bold text-white">Agregar Sesión de Clase</h3>
              <button onClick={() => setShowAddSessionGlobalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGlobalAddSession} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Asignatura *</label>
                <select
                  value={globalSessionSubjectId}
                  onChange={e => setGlobalSessionSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white"
                >
                  {activeSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Día de la Semana</label>
                <select
                  value={sessionDay}
                  onChange={e => setSessionDay(Number(e.target.value))}
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
                    value={sessionStart}
                    onChange={e => setSessionStart(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={sessionEnd}
                    onChange={e => setSessionEnd(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Aula / Salón (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Aula 301"
                  value={sessionRoom}
                  onChange={e => setSessionRoom(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddSessionGlobalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-amber-600 rounded-xl"
                >
                  Guardar Sesión
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
                  onClick={() => handleDeleteSession(editingSessionData.subjectId, editingSessionData.session.id, getDayOfWeekName(editingSessionData.session.day))}
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
      {/* MODAL CORTE (CREAR / EDITAR)                              */}
      {/* ========================================================= */}
      {showCutModal && (() => {
        const targetSubject = subjects.find(s => s.id === cutSubjectId);

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-serif font-bold text-white">
                  {editingCut ? 'Editar Corte de Evaluación' : 'Crear Corte de Evaluación'}
                </h3>
                <button onClick={() => setShowCutModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCut} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Corte *</label>
                  <input
                    type="text"
                    placeholder="Ej: Corte 1, Parcial Final"
                    value={cutName}
                    onChange={e => setCutName(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Peso en la asignatura (%) *</label>
                  <input
                    type="number"
                    value={cutWeight}
                    onChange={e => setCutWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white font-mono"
                    required
                  />
                </div>

                {/* Live Real-time Distribution Feedback */}
                <CutsDistributionBar
                  cuts={targetSubject?.cuts || []}
                  proposedCutWeight={{
                    cutId: editingCut?.cut.id,
                    weight: Number(cutWeight) || 0
                  }}
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCutModal(false)}
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
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL EVALUACIÓN / ACTIVIDAD (EDITAR DETALLES & NOTA)    */}
      {/* ========================================================= */}
      {editingActivity && (() => {
        const targetSubj = subjects.find(s => s.id === editingActivity.subjectId);
        const targetCut = targetSubj?.cuts?.find(c => c.id === editingActivity.cutId);

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-[#0B1528] border border-blue-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-serif font-bold text-white">Editar Evaluación / Actividad</h3>
                <button onClick={() => setEditingActivity(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveActivityEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Evaluación *</label>
                  <input
                    type="text"
                    value={editActName}
                    onChange={e => setEditActName(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Actividad</label>
                    <select
                      value={editActType}
                      onChange={e => setEditActType(e.target.value as any)}
                      className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white"
                    >
                      <option value="Parcial">Parcial</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Taller">Taller</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Exposición">Exposición</option>
                      <option value="Proyecto">Proyecto</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Peso en Corte (%)</label>
                    <input
                      type="number"
                      value={editActWeight}
                      onChange={e => setEditActWeight(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Fecha Programada</label>
                    <input
                      type="date"
                      value={editActDate}
                      onChange={e => setEditActDate(e.target.value)}
                      className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Calificación (0.0 - 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="Sin nota"
                      value={editActGrade}
                      onChange={e => setEditActGrade(e.target.value)}
                      className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-sm text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Live Activities Distribution Bar */}
                {targetCut && (
                  <ActivitiesDistributionBar
                    activities={targetCut.activities || []}
                    proposedActivityWeight={{
                      actId: editingActivity.activity.id,
                      weight: Number(editActWeight) || 0
                    }}
                  />
                )}

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(editingActivity.subjectId, editingActivity.cutId, editingActivity.activity)}
                    className="px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 rounded-xl border border-rose-500/30"
                  >
                    Eliminar Evaluación
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingActivity(null)}
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
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: ACTIVIDAD ACADÉMICA (EVENTO NO CALIFICABLE)        */}
      {/* ========================================================= */}
      {showAcademicActivityModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1528] border border-emerald-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#132337]/50">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                {editingAcademicActivity ? 'Editar Actividad Académica' : 'Nueva Actividad Académica'}
              </h3>
              <button
                onClick={() => setShowAcademicActivityModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcademicActivity} className="p-6 space-y-4">
              {/* Note callout: non-graded clarification */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <Compass className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <strong>Actividad Académica (No Calificable):</strong> Sirve para estructurar y organizar eventos del semestre (salidas de campo, talleres, laboratorios, etc.). No modifica promedios ni notas.
                </span>
              </div>

              {/* Subject selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Materia Asociada *</label>
                <select
                  value={acadActSubjectId}
                  onChange={e => setAcadActSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                >
                  <option value="" disabled>Selecciona una asignatura...</option>
                  {activeSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Activity Name */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Actividad *</label>
                <input
                  type="text"
                  value={acadActName}
                  onChange={e => setAcadActName(e.target.value)}
                  placeholder="Ej. Salida de Campo a la Reserva, Laboratorio #2, Conferencia de Criptografía..."
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Actividad *</label>
                  <select
                    value={acadActType}
                    onChange={e => setAcadActType(e.target.value as AcademicActivityType)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Salida de campo">🚌 Salida de campo</option>
                    <option value="Laboratorio">🧪 Laboratorio</option>
                    <option value="Práctica">🛠️ Práctica</option>
                    <option value="Clase especial">🏫 Clase especial</option>
                    <option value="Conferencia">🎤 Conferencia</option>
                    <option value="Seminario">📚 Seminario</option>
                    <option value="Tutoría">👨‍🏫 Tutoría</option>
                    <option value="Asesoría">💬 Asesoría</option>
                    <option value="Entrega de documentos">📄 Entrega de documentos</option>
                    <option value="Inscripción">📝 Inscripción</option>
                    <option value="Reunión">🤝 Reunión</option>
                    <option value="Actividad personalizada">⭐ Actividad personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Estado</label>
                  <select
                    value={acadActStatus}
                    onChange={e => setAcadActStatus(e.target.value as AcademicActivityStatus)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="Realizada">✅ Realizada</option>
                    <option value="Cancelada">❌ Cancelada</option>
                    <option value="Reprogramada">🔄 Reprogramada</option>
                  </select>
                </div>
              </div>

              {acadActType === 'Actividad personalizada' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Tipo Personalizado</label>
                  <input
                    type="text"
                    value={acadActCustomType}
                    onChange={e => setAcadActCustomType(e.target.value)}
                    placeholder="Ej. Hackathon interna, Simposio..."
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={acadActDate}
                    onChange={e => setAcadActDate(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={acadActStartTime}
                    onChange={e => setAcadActStartTime(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={acadActEndTime}
                    onChange={e => setAcadActEndTime(e.target.value)}
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Location & Professor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Ubicación / Salón</label>
                  <input
                    type="text"
                    value={acadActLocation}
                    onChange={e => setAcadActLocation(e.target.value)}
                    placeholder="Ej. Lab 302, Auditorio Principal, Zoom..."
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Profesor / Encargado</label>
                  <input
                    type="text"
                    value={acadActProfessor}
                    onChange={e => setAcadActProfessor(e.target.value)}
                    placeholder="Ej. Dr. Martínez"
                    className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descripción / Notas</label>
                <textarea
                  rows={2}
                  value={acadActDescription}
                  onChange={e => setAcadActDescription(e.target.value)}
                  placeholder="Detalles importantes, requerimientos o instrucciones para la actividad..."
                  className="w-full p-2.5 bg-[#132337] border border-blue-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAcademicActivityModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all"
                >
                  {editingAcademicActivity ? 'Guardar Cambios' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

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
  AcademicActivityStatus,
  SubjectProfessor,
  SubjectScheduleRule,
  AcademicScheduleType
} from '../../types/store';
import { AcademicStore } from './AcademicStore';
import { AcademicCalculations } from './AcademicCalculations';
import { getTodayDateString, getDayOfWeekName, getWeekDaysForDate } from '../../utils/dates';
import { UniversalSchedule, CalendarEvent } from '../../components/executive';
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
  TrendingUp, 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  Target, 
  Percent, 
  AlertCircle, 
  CheckCircle2, 
  Compass, 
  MapPin, 
  User, 
  ArrowLeft, 
  Hash, 
  Activity, 
  BookMarked,
  Layers3,
  CalendarDays,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  ShieldAlert,
  Info,
  ChevronRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone
} from 'lucide-react';

interface Props {
  data: AcademicOfficeData;
  onOpenOffice?: (officeKey: string) => void;
}

const COLOR_PRESETS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', 
  '#F59E0B', '#EF4444', '#06B6D4', '#6366F1', '#D97706'
];

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
    <div className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
      dist.statusColor === 'emerald'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : dist.statusColor === 'rose'
        ? 'bg-rose-50 border-rose-200 text-rose-900'
        : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}>
      <div className="flex flex-wrap justify-between items-center gap-2 font-bold">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 shrink-0 text-purple-700" />
          <span>Distribución de Cortes de la Materia</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Total asignado: <strong className="text-slate-900 font-bold">{dist.totalAssigned}%</strong></span>
          {dist.isDeficit && (
            <span>Faltan por asignar: <strong className="text-amber-800 font-bold">{dist.remaining}%</strong></span>
          )}
          {dist.isExcess && (
            <span className="text-rose-800 font-bold">Exceso: +{dist.excess}%</span>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300 relative">
        <div 
          className={`h-full transition-all duration-300 rounded-full ${
            dist.statusColor === 'emerald' ? 'bg-emerald-600' :
            dist.statusColor === 'rose' ? 'bg-rose-600' :
            'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, dist.totalAssigned)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] font-semibold pt-0.5">
        <span className="flex items-center gap-1.5">
          {dist.isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          {dist.isDeficit && <AlertTriangle className="w-4 h-4 text-amber-700" />}
          {dist.isExcess && <AlertCircle className="w-4 h-4 text-rose-700" />}
          {dist.statusMessage}
        </span>
        <span className="font-mono text-slate-700">{dist.totalAssigned}% / 100%</span>
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
    <div className={`p-3 rounded-xl border space-y-1.5 text-xs transition-all ${
      dist.statusColor === 'emerald'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : dist.statusColor === 'rose'
        ? 'bg-rose-50 border-rose-200 text-rose-900'
        : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}>
      <div className="flex flex-wrap justify-between items-center gap-2 font-bold">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-purple-700" /> Evaluaciones del Corte
        </span>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Total asignado: <strong className="text-slate-900">{dist.totalAssigned}%</strong></span>
          {dist.isDeficit && <span>Faltan por asignar: <strong className="text-amber-800">{dist.remaining}%</strong></span>}
          {dist.isExcess && <span className="text-rose-800 font-bold">Exceso: +{dist.excess}%</span>}
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
        <div 
          className={`h-full transition-all duration-300 rounded-full ${
            dist.statusColor === 'emerald' ? 'bg-emerald-600' :
            dist.statusColor === 'rose' ? 'bg-rose-600' :
            'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, dist.totalAssigned)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-semibold">
        <span className="flex items-center gap-1">
          {dist.isComplete && <Check className="w-3.5 h-3.5 text-emerald-700" />}
          {dist.isDeficit && <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />}
          {dist.isExcess && <AlertCircle className="w-3.5 h-3.5 text-rose-700" />}
          {dist.statusMessage}
        </span>
        <span className="font-mono text-slate-700">{dist.totalAssigned}% / 100%</span>
      </div>
    </div>
  );
};

export const AcademicView: React.FC<Props> = ({ data }) => {
  const todayStr = getTodayDateString();

  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'subjects' | 'schedule' | 'evaluations' | 'activities' | 'semesters'>('subjects');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Active Semester ID
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);

  // Expanded Subject for Dedicated Subject Space View
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [subjectSubTab, setSubjectSubTab] = useState<'info' | 'professors' | 'schedules' | 'cuts' | 'evaluations' | 'activities'>('info');

  // Professor Modal State
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<SubjectProfessor | null>(null);
  const [profSubjectId, setProfSubjectId] = useState('');
  const [profName, setProfName] = useState('');
  const [profTitle, setProfTitle] = useState('Dr.');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profDepartment, setProfDepartment] = useState('');
  const [profNotes, setProfNotes] = useState('');

  // Schedule Rule Modal State
  const [showScheduleRuleModal, setShowScheduleRuleModal] = useState(false);
  const [editingScheduleRule, setEditingScheduleRule] = useState<SubjectScheduleRule | null>(null);
  const [ruleSubjectId, setRuleSubjectId] = useState('');
  const [ruleType, setRuleType] = useState<AcademicScheduleType>('recurring');
  const [ruleProfessorId, setRuleProfessorId] = useState('');
  const [ruleDaysOfWeek, setRuleDaysOfWeek] = useState<number[]>([1]);
  const [ruleStartTime, setRuleStartTime] = useState('08:00');
  const [ruleEndTime, setRuleEndTime] = useState('10:00');
  const [ruleClassroom, setRuleClassroom] = useState('');
  const [ruleModality, setRuleModality] = useState<'presencial' | 'virtual' | 'híbrido'>('presencial');
  const [ruleStartDate, setRuleStartDate] = useState(todayStr);
  const [ruleEndDate, setRuleEndDate] = useState('');
  const [ruleDate, setRuleDate] = useState(todayStr);
  const [ruleNotes, setRuleNotes] = useState('');
  const [ruleApplyToScheduleId, setRuleApplyToScheduleId] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Universal Schedule State
  const [scheduleSelectedDate] = useState<string>(getTodayDateString());
  const [scheduleViewMode, setScheduleViewMode] = useState<'week' | 'day'>('week');

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
  const [subjGroup, setSubjGroup] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjCredits, setSubjCredits] = useState<number>(3);
  const [subjDescription, setSubjDescription] = useState('');
  const [subjIsActive, setSubjIsActive] = useState<boolean>(true);
  const [subjColor, setSubjColor] = useState('#3B82F6');
  const [subjClassroom, setSubjClassroom] = useState('');
  const [subjSemesterId, setSubjSemesterId] = useState('');

  // 3. Global Session Modal
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
  const [acadActSubjectId, setAcadActSubjectId] = useState('');
  const [acadActDate, setAcadActDate] = useState(getTodayDateString());
  const [acadActStartTime, setAcadActStartTime] = useState('08:00');
  const [acadActEndTime, setAcadActEndTime] = useState('10:00');
  const [acadActLocation, setAcadActLocation] = useState('');
  const [acadActProfessor, setAcadActProfessor] = useState('');
  const [acadActDescription, setAcadActDescription] = useState('');
  const [acadActStatus, setAcadActStatus] = useState<AcademicActivityStatus>('Pendiente');
  const [acadActClassRelation, setAcadActClassRelation] = useState<'replaces' | 'complements' | 'independent'>('replaces');

  // Semesters & Subjects Data
  const semesters = data?.semesters || [];
  const subjects = data?.subjects || [];

  // Determine Current Active Semester
  const defaultActiveSem = semesters.find(s => s.isActive) || semesters[0] || null;
  const currentSemester = useMemo(() => {
    if (selectedSemesterId) {
      return semesters.find(s => s.id === selectedSemesterId) || defaultActiveSem;
    }
    return defaultActiveSem;
  }, [semesters, selectedSemesterId, defaultActiveSem]);

  // Subjects belonging to selected semester
  const activeSubjects = useMemo(() => {
    if (!currentSemester) return subjects;
    return subjects.filter(s => s.semesterId === currentSemester.id);
  }, [subjects, currentSemester]);

  // Filtered Subjects for search
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return activeSubjects;
    const q = searchQuery.toLowerCase();
    return activeSubjects.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.professor.toLowerCase().includes(q) ||
      (s.group && s.group.toLowerCase().includes(q)) ||
      (s.code && s.code.toLowerCase().includes(q))
    );
  }, [activeSubjects, searchQuery]);

  // Expanded Subject Object
  const currentExpandedSubject = useMemo(() => {
    if (!expandedSubjectId) return null;
    return subjects.find(s => s.id === expandedSubjectId) || null;
  }, [subjects, expandedSubjectId]);

  // Calculate Semester Summary Metrics
  const gpa = useMemo(() => {
    if (!currentSemester) return 0;
    return AcademicCalculations.calculateSemesterGPA(currentSemester.id, subjects);
  }, [currentSemester, subjects]);

  const totalCredits = useMemo(() => {
    return activeSubjects.reduce((acc, s) => acc + (s.credits || 3), 0);
  }, [activeSubjects]);

  const todayClasses = useMemo(() => {
    return AcademicCalculations.getTodayClasses(activeSubjects, todayStr);
  }, [activeSubjects, todayStr]);

  const upcomingEvaluations = useMemo(() => {
    return AcademicCalculations.getUpcomingEvaluations(activeSubjects, 5);
  }, [activeSubjects]);

  const upcomingActivities = useMemo(() => {
    return AcademicCalculations.getUpcomingAcademicActivities(activeSubjects, 5);
  }, [activeSubjects]);

  // Universal Calendar Events projection
  const scheduleEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];
    const weekDays = getWeekDaysForDate(scheduleSelectedDate);
    
    weekDays.forEach(day => {
      const resolvedSessions = AcademicCalculations.getAllSessionsForDate(activeSubjects, day.dateStr);
      resolvedSessions.forEach(ses => {
        events.push({
          id: ses.id,
          title: ses.subjectName,
          subtitle: `Prof: ${ses.professorTitle ? ses.professorTitle + ' ' : ''}${ses.professorName}${ses.classroom ? ` • ${ses.classroom}` : ''}`,
          date: day.dateStr,
          startTime: ses.startTime,
          endTime: ses.endTime,
          location: ses.classroom,
          color: ses.subjectColor || '#3B82F6',
          sourceOffice: 'academica'
        });
      });
    });

    return events;
  }, [activeSubjects, scheduleSelectedDate]);

  // Professor Handlers
  const handleOpenProfessorModal = (subjectId: string, prof?: SubjectProfessor) => {
    setProfSubjectId(subjectId);
    if (prof) {
      setEditingProfessor(prof);
      setProfName(prof.name);
      setProfTitle(prof.title || 'Dr.');
      setProfEmail(prof.email || '');
      setProfPhone(prof.phone || '');
      setProfDepartment(prof.department || '');
      setProfNotes(prof.notes || '');
    } else {
      setEditingProfessor(null);
      setProfName('');
      setProfTitle('Dr.');
      setProfEmail('');
      setProfPhone('');
      setProfDepartment('');
      setProfNotes('');
    }
    setShowProfessorModal(true);
  };

  const handleSaveProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim() || !profSubjectId) {
      showToast('Por favor ingrese el nombre del profesor', 'warning');
      return;
    }

    if (editingProfessor) {
      AcademicStore.updateProfessor(profSubjectId, editingProfessor.id, {
        name: profName.trim(),
        title: profTitle.trim(),
        email: profEmail.trim(),
        phone: profPhone.trim(),
        department: profDepartment.trim(),
        notes: profNotes.trim()
      });
      showToast('Información del profesor actualizada correctamente');
    } else {
      AcademicStore.addProfessor(profSubjectId, {
        name: profName.trim(),
        title: profTitle.trim(),
        email: profEmail.trim(),
        phone: profPhone.trim(),
        department: profDepartment.trim(),
        notes: profNotes.trim()
      });
      showToast('Profesor registrado correctamente');
    }

    setShowProfessorModal(false);
  };

  const handleDeleteProfessor = (subjectId: string, profId: string) => {
    openConfirm({
      title: 'Eliminar Profesor',
      message: '¿Está seguro de eliminar este profesor de la materia? Si tiene programaciones asignadas, conserve actualizado el historial.',
      confirmText: 'Sí, eliminar',
      isDanger: true,
      onConfirm: () => {
        AcademicStore.deleteProfessor(subjectId, profId);
        showToast('Profesor eliminado de la materia', 'warning');
      }
    });
  };

  // Schedule Rule Handlers
  const handleOpenScheduleRuleModal = (subjectId: string, rule?: SubjectScheduleRule) => {
    setRuleSubjectId(subjectId);
    setConflictWarning(null);

    const sub = subjects.find(s => s.id === subjectId);
    const activeSem = currentSemester;
    const defaultStart = activeSem?.startDate || todayStr;
    const defaultEnd = activeSem?.endDate || '';

    if (rule) {
      setEditingScheduleRule(rule);
      setRuleType(rule.type);
      setRuleProfessorId(rule.professorId);
      setRuleDaysOfWeek(rule.daysOfWeek || [1]);
      setRuleStartTime(rule.startTime || '08:00');
      setRuleEndTime(rule.endTime || '10:00');
      setRuleClassroom(rule.classroom || sub?.classroom || '');
      setRuleModality(rule.modality || 'presencial');
      setRuleStartDate(rule.startDate || defaultStart);
      setRuleEndDate(rule.endDate || defaultEnd);
      setRuleDate(rule.date || rule.startDate || todayStr);
      setRuleApplyToScheduleId(rule.applyToScheduleId || '');
      setRuleNotes(rule.notes || '');
    } else {
      setEditingScheduleRule(null);
      setRuleType('recurring');
      const firstProf = sub?.professors && sub.professors.length > 0 ? sub.professors[0].id : '';
      setRuleProfessorId(firstProf);
      setRuleDaysOfWeek([1]);
      setRuleStartTime('08:00');
      setRuleEndTime('10:00');
      setRuleClassroom(sub?.classroom || '');
      setRuleModality('presencial');
      setRuleStartDate(defaultStart);
      setRuleEndDate(defaultEnd);
      setRuleDate(todayStr);
      setRuleApplyToScheduleId('');
      setRuleNotes('');
    }
    setShowScheduleRuleModal(true);
  };

  const handleSaveScheduleRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleSubjectId) return;

    const sub = subjects.find(s => s.id === ruleSubjectId);
    if (!sub) return;

    if (!ruleProfessorId) {
      showToast('Por favor seleccione el profesor asignado a este horario', 'warning');
      return;
    }

    const selectedProf = sub.professors?.find(p => p.id === ruleProfessorId);
    const profName = selectedProf ? `${selectedProf.title ? selectedProf.title + ' ' : ''}${selectedProf.name}` : sub.professor;

    const ruleData: Omit<SubjectScheduleRule, 'id' | 'subjectId'> = {
      type: ruleType,
      professorId: ruleProfessorId,
      professorName: profName,
      startTime: ruleStartTime,
      endTime: ruleEndTime,
      classroom: ruleClassroom.trim() || sub.classroom,
      modality: ruleModality,
      startDate: ruleType === 'single_date' ? ruleDate : ruleStartDate,
      endDate: ruleType === 'single_date' ? ruleDate : ruleEndDate,
      date: ruleType === 'single_date' ? ruleDate : undefined,
      daysOfWeek: ruleType === 'recurring' ? ruleDaysOfWeek : undefined,
      applyToScheduleId: ruleType === 'period_override' ? ruleApplyToScheduleId : undefined,
      notes: ruleNotes.trim()
    };

    // Conflict detection check
    const conflictResult = AcademicCalculations.checkScheduleConflicts(
      sub,
      { ...ruleData, id: editingScheduleRule?.id },
      subjects
    );

    if (conflictResult.hasConflict) {
      setConflictWarning(conflictResult.message || 'Existe un conflicto de horario o período');
      return;
    }

    if (editingScheduleRule) {
      AcademicStore.updateScheduleRule(ruleSubjectId, editingScheduleRule.id, ruleData);
      showToast('Programación de clase actualizada correctamente');
    } else {
      AcademicStore.addScheduleRule(ruleSubjectId, ruleData);
      showToast('Nueva programación de clase registrada');
    }

    setShowScheduleRuleModal(false);
  };

  const handleDeleteScheduleRule = (subjectId: string, ruleId: string) => {
    openConfirm({
      title: 'Eliminar Programación',
      message: '¿Está seguro de eliminar esta regla de programación? Las clases anteriores permanecerán intactas.',
      confirmText: 'Sí, eliminar',
      isDanger: true,
      onConfirm: () => {
        AcademicStore.deleteScheduleRule(subjectId, ruleId);
        showToast('Regla de programación eliminada', 'warning');
      }
    });
  };

  // Handlers for Modals
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
    if (!semName.trim()) {
      showToast('Ingresa un nombre para el semestre.', 'warning');
      return;
    }
    if (editingSemester) {
      AcademicStore.updateSemester(editingSemester.id, {
        name: semName.trim(),
        startDate: semStart,
        endDate: semEnd
      });
      showToast(`Semestre "${semName}" actualizado.`);
    } else {
      AcademicStore.addSemester({
        name: semName.trim(),
        startDate: semStart || todayStr,
        endDate: semEnd || '',
        isActive: semesters.length === 0
      });
      showToast(`Semestre "${semName}" creado exitosamente.`);
    }
    setShowSemesterModal(false);
  };

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
      setSubjGroup(subj.group || '');
      setSubjCode(subj.code || '');
      setSubjCredits(subj.credits || 3);
      setSubjDescription(subj.description || '');
      setSubjIsActive(subj.isActive !== false);
      setSubjColor(subj.color || '#3B82F6');
      setSubjClassroom(subj.classroom || '');
      setSubjSemesterId(subj.semesterId || currentSemester?.id || semesters[0]?.id || '');
    } else {
      setEditingSubject(null);
      setSubjName('');
      setSubjProf('');
      setSubjGroup('');
      setSubjCode('');
      setSubjCredits(3);
      setSubjDescription('');
      setSubjIsActive(true);
      setSubjColor('#3B82F6');
      setSubjClassroom('');
      setSubjSemesterId(currentSemester?.id || semesters[0]?.id || '');
    }
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) {
      showToast('Ingresa el nombre de la materia.', 'warning');
      return;
    }
    const targetSemId = subjSemesterId || currentSemester?.id || semesters[0]?.id;
    if (!targetSemId) {
      showToast('Selecciona un semestre válido.', 'warning');
      return;
    }

    if (editingSubject) {
      AcademicStore.updateSubject(editingSubject.id, {
        name: subjName.trim(),
        professor: subjProf.trim() || 'Por asignar',
        group: subjGroup.trim(),
        code: subjCode.trim(),
        credits: Number(subjCredits) || 3,
        description: subjDescription.trim(),
        isActive: subjIsActive,
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
        group: subjGroup.trim(),
        code: subjCode.trim(),
        credits: Number(subjCredits) || 3,
        description: subjDescription.trim(),
        isActive: subjIsActive,
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
      message: `¿Está seguro de eliminar la materia "${subject.name}"? Esta acción eliminará también sus horarios y evaluaciones asociadas.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      isDanger: true,
      onConfirm: () => {
        AcademicStore.deleteSubject(subject.id);
        if (expandedSubjectId === subject.id) {
          setExpandedSubjectId(null);
        }
        showToast(`Materia "${subject.name}" eliminada.`);
      }
    });
  };

  const handleToggleSubjectActive = (subject: AcademicSubject) => {
    const nextState = !subject.isActive;
    AcademicStore.updateSubject(subject.id, { isActive: nextState });
    showToast(`Materia "${subject.name}" ${nextState ? 'activada' : 'inactivada'}.`);
  };

  const handleOpenCutModal = (subjectId: string, cut?: AcademicCut) => {
    setCutSubjectId(subjectId);
    if (cut) {
      setEditingCut({ subjectId, cut });
      setCutName(cut.cutName);
      setCutWeight(cut.cutWeightPercent);
    } else {
      setEditingCut(null);
      const subj = subjects.find(s => s.id === subjectId);
      const existingCuts = subj?.cuts || [];
      const num = existingCuts.length + 1;
      setCutName(`Corte ${num}`);
      setCutWeight(30);
    }
    setShowCutModal(true);
  };

  const handleSaveCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cutName.trim()) {
      showToast('Ingresa el nombre del corte.', 'warning');
      return;
    }
    if (editingCut) {
      AcademicStore.updateCut(editingCut.subjectId, editingCut.cut.id, {
        cutName: cutName.trim(),
        cutWeightPercent: Number(cutWeight) || 0
      });
      showToast(`Corte "${cutName.trim()}" actualizado.`);
    } else {
      AcademicStore.addCut(cutSubjectId, cutName.trim(), Number(cutWeight) || 0);
      showToast(`Corte "${cutName.trim()}" agregado.`);
    }
    setShowCutModal(false);
  };

  const handleAddInlineActivity = (subjectId: string, cutId: string) => {
    const form = newActivityForms[cutId];
    if (!form || !form.name.trim()) {
      showToast('Ingresa el nombre de la evaluación.', 'warning');
      return;
    }

    AcademicStore.addActivity(subjectId, cutId, {
      name: form.name.trim(),
      type: form.type || 'Parcial',
      date: form.date || todayStr,
      weightPercent: Number(form.weight) || 10,
      status: 'pending'
    });

    setNewActivityForms(prev => ({
      ...prev,
      [cutId]: { name: '', type: 'Parcial', date: todayStr, weight: 10 }
    }));
    showToast(`Evaluación "${form.name.trim()}" agregada.`);
  };

  const handleOpenEditActivityModal = (subjectId: string, cutId: string, act: AcademicEvaluationActivity) => {
    setEditingActivity({ subjectId, cutId, activity: act });
    setEditActName(act.name);
    setEditActType(act.type);
    setEditActDate(act.date);
    setEditActWeight(act.weightPercent);
    setEditActStatus(act.status);
    setEditActGrade(act.grade !== undefined && act.grade !== null ? String(act.grade) : '');
  };

  const handleSaveActivityEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    let finalGrade: number | undefined = undefined;
    if (editActGrade.trim() !== '') {
      const parsed = parseFloat(editActGrade.replace(',', '.'));
      if (!isNaN(parsed)) {
        finalGrade = Math.min(5.0, Math.max(0.0, parsed));
      }
    }

    AcademicStore.updateActivity(editingActivity.subjectId, editingActivity.cutId, editingActivity.activity.id, {
      name: editActName.trim(),
      type: editActType,
      date: editActDate,
      weightPercent: Number(editActWeight) || 0,
      status: finalGrade !== undefined ? 'graded' : editActStatus,
      grade: finalGrade
    });

    setEditingActivity(null);
    showToast('Evaluación actualizada correctamente.');
  };

  const handleDeleteActivity = (subjectId: string, cutId: string, actId: string) => {
    AcademicStore.deleteActivity(subjectId, cutId, actId);
    if (editingActivity?.activity.id === actId) {
      setEditingActivity(null);
    }
    showToast('Evaluación eliminada.');
  };

  const handleOpenAcademicActivityModal = (act?: AcademicActivity, preselectedSubjectId?: string) => {
    if (activeSubjects.length === 0) {
      showToast('Debes tener materias registradas para agregar eventos académicos.', 'warning');
      return;
    }
    if (act) {
      setEditingAcademicActivity(act);
      setAcadActName(act.name);
      setAcadActType(act.type);
      setAcadActSubjectId(act.subjectId);
      setAcadActDate(act.date);
      setAcadActStartTime(act.startTime || '08:00');
      setAcadActEndTime(act.endTime || '10:00');
      setAcadActLocation(act.location || '');
      setAcadActProfessor(act.professor || '');
      setAcadActDescription(act.description || '');
      setAcadActStatus(act.status);
      setAcadActClassRelation(act.classRelation || 'replaces');
    } else {
      setEditingAcademicActivity(null);
      setAcadActName('');
      setAcadActType('Salida de campo');
      setAcadActSubjectId(preselectedSubjectId || activeSubjects[0].id);
      setAcadActDate(todayStr);
      setAcadActStartTime('08:00');
      setAcadActEndTime('10:00');
      setAcadActLocation('');
      setAcadActProfessor('');
      setAcadActDescription('');
      setAcadActStatus('Pendiente');
      setAcadActClassRelation('replaces');
    }
    setShowAcademicActivityModal(true);
  };

  const handleSaveAcademicActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acadActName.trim() || !acadActSubjectId) {
      showToast('Diligencia el nombre y la materia asignada.', 'warning');
      return;
    }

    if (editingAcademicActivity) {
      AcademicStore.updateAcademicActivity(editingAcademicActivity.id, {
        subjectId: acadActSubjectId,
        name: acadActName.trim(),
        type: acadActType,
        date: acadActDate,
        startTime: acadActStartTime,
        endTime: acadActEndTime,
        location: acadActLocation.trim(),
        professor: acadActProfessor.trim(),
        description: acadActDescription.trim(),
        status: acadActStatus,
        classRelation: acadActClassRelation
      });
      showToast(`Actividad "${acadActName.trim()}" actualizada.`);
    } else {
      AcademicStore.addAcademicActivity({
        subjectId: acadActSubjectId,
        name: acadActName.trim(),
        type: acadActType,
        date: acadActDate,
        startTime: acadActStartTime,
        endTime: acadActEndTime,
        location: acadActLocation.trim(),
        professor: acadActProfessor.trim(),
        description: acadActDescription.trim(),
        status: acadActStatus,
        classRelation: acadActClassRelation
      });
      showToast(`Actividad "${acadActName.trim()}" creada.`);
    }
    setShowAcademicActivityModal(false);
  };

  const handleGlobalAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSessionSubjectId) return;
    AcademicStore.addSession(globalSessionSubjectId, {
      day: sessionDay,
      startTime: sessionStart,
      endTime: sessionEnd,
      classroom: sessionRoom.trim()
    });
    setShowAddSessionGlobalModal(false);
    showToast('Sesión de clase agregada correctamente.');
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
    showToast('Horario de clase actualizado.');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'success' ? 'bg-slate-900 text-emerald-400 border-emerald-500/40' :
          toast.type === 'warning' ? 'bg-slate-900 text-amber-400 border-amber-500/40' :
          'bg-slate-900 text-rose-400 border-rose-500/40'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              {confirmModalData.isDanger ? (
                <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900">{confirmModalData.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{confirmModalData.message}</p>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {confirmModalData.cancelText || 'Cancelar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModalData.onConfirm();
                  setConfirmModalData(null);
                }}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors ${
                  confirmModalData.isDanger 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {confirmModalData.confirmText || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP EXECUTIVE SUMMARY BAR                              */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-2xl p-5 md:p-6 shadow-xl border border-slate-800 space-y-5">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-xl text-[#C5A059]">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase font-bold">
                  SISTEMA OPERATIVO PRESIDENCIAL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Fuente de Verdad Académica
                </span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
                Oficina Académica
              </h1>
            </div>
          </div>

          {/* Actions & Semester Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {semesters.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
                <CalendarDays className="w-4 h-4 text-[#C5A059]" />
                <span className="text-slate-400 font-semibold">Semestre:</span>
                <select
                  value={currentSemester?.id || ''}
                  onChange={(e) => setSelectedSemesterId(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                >
                  {semesters.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name} {s.isActive ? '(Activo)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => handleOpenSemesterModal()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo Semestre
            </button>

            <button
              onClick={() => handleOpenSubjectModal()}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-[#b08d4b] rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Nueva Materia
            </button>
          </div>
        </div>

        {/* Semester Overview Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Semestre Seleccionado</span>
            <div className="text-base font-bold text-white truncate">
              {currentSemester?.name || 'Sin semestre'}
            </div>
            <span className="text-[10px] text-slate-400">
              {currentSemester?.startDate ? `${currentSemester.startDate}` : 'Período activo'}
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Materias Registradas</span>
            <div className="text-xl font-mono font-bold text-white">
              {activeSubjects.length} <span className="text-xs text-slate-400 font-sans">materias</span>
            </div>
            <span className="text-[10px] text-emerald-400">
              {activeSubjects.filter(s => s.isActive !== false).length} activas
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Promedio General (GPA)</span>
            <div className="text-xl font-mono font-bold text-[#C5A059]">
              {formatGrade(gpa)} <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-300 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Acumulado del Semestre
            </span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Créditos Totales</span>
            <div className="text-xl font-mono font-bold text-white">
              {totalCredits} <span className="text-xs text-slate-400 font-sans">créditos</span>
            </div>
            <span className="text-[10px] text-slate-400">Carga académica</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 col-span-2 sm:col-span-1 lg:col-span-2">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Próxima Evaluación / Examen</span>
            {upcomingEvaluations.length > 0 ? (
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-amber-300 truncate">
                  {upcomingEvaluations[0].activity.name}
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {upcomingEvaluations[0].subjectName} ({upcomingEvaluations[0].activity.weightPercent}%)
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  🗓️ {upcomingEvaluations[0].activity.date}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No hay evaluaciones pendientes</div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. DEDICATED SUBJECT SPACE VIEW (IF SUBJECT OPENED)        */}
      {/* ========================================================= */}
      {expandedSubjectId && currentExpandedSubject ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Action Bar for Subject */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <button
                onClick={() => setExpandedSubjectId(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a Mis Materias
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSubjectActive(currentExpandedSubject)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentExpandedSubject.isActive !== false
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {currentExpandedSubject.isActive !== false ? '● Materia Activa' : '○ Materia Inactiva'}
                </button>

                <button
                  onClick={() => handleOpenSubjectModal(currentExpandedSubject)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>

                <button
                  onClick={() => handleDeleteSubject(currentExpandedSubject)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>

            {/* Subject Header Meta */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0"
                  style={{ backgroundColor: currentExpandedSubject.color || '#3B82F6' }}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                      {currentExpandedSubject.name}
                    </h2>
                    {currentExpandedSubject.code && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                        {currentExpandedSubject.code}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
                    <span className="flex items-center gap-1 text-slate-800 font-semibold">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {currentExpandedSubject.professor}
                    </span>
                    {currentExpandedSubject.group && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-900 font-bold rounded-md border border-purple-200">
                        Grupo {currentExpandedSubject.group}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {currentExpandedSubject.classroom || 'Aula por asignar'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 font-mono">
                      <Hash className="w-3.5 h-3.5 text-slate-400" /> {currentExpandedSubject.credits || 3} Créditos
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Sub-tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setSubjectSubTab('info')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    subjectSubTab === 'info'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  General & Horarios
                </button>
                <button
                  onClick={() => setSubjectSubTab('professors')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    subjectSubTab === 'professors'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  Profesores ({currentExpandedSubject.professors?.length || 0})
                </button>
                <button
                  onClick={() => setSubjectSubTab('schedules')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    subjectSubTab === 'schedules'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Programación ({currentExpandedSubject.schedules?.length || 0})
                </button>
                <button
                  onClick={() => setSubjectSubTab('cuts')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    subjectSubTab === 'cuts'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cortes & Notas
                </button>
                <button
                  onClick={() => setSubjectSubTab('evaluations')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    subjectSubTab === 'evaluations'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Evaluaciones
                </button>
                <button
                  onClick={() => setSubjectSubTab('activities')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    subjectSubTab === 'activities'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Actividades & Tareas
                </button>
              </div>
            </div>

          </div>

          {/* Panel de Estado de la Materia: "¿Cómo voy en esta materia?" */}
          {(() => {
            const subjectProgress = AcademicCalculations.calculateSubjectProgress(currentExpandedSubject);
            const statusInfo = AcademicCalculations.getSubjectStatus(currentExpandedSubject);
            const reqInfo = AcademicCalculations.calculateRequiredGradeToPass(currentExpandedSubject, 3.0);
            
            return (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-700" />
                    ¿Cómo voy en esta materia? — Estado Académico
                  </h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    statusInfo.status === 'Aprobada' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    statusInfo.status === 'En Riesgo' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                    'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    {statusInfo.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  
                  {/* Indicator 1: Promedio Actual */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Promedio Actual</span>
                    <div className="text-xl font-mono font-bold text-slate-900">
                      {statusInfo.hasGrades ? formatGrade(statusInfo.average) : 'S/N'}
                      <span className="text-xs text-slate-400 font-sans"> / 5.0</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {statusInfo.hasGrades ? `Acumulado: ${formatGrade(statusInfo.notaAcumulada)}` : 'Sin notas registradas'}
                    </span>
                  </div>

                  {/* Indicator 2: Porcentaje Evaluado */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">% Evaluado del Semestre</span>
                    <div className="text-xl font-mono font-bold text-purple-800">
                      {subjectProgress.porcentajeEvaluadoMateria}%
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-600 h-full" style={{ width: `${subjectProgress.porcentajeEvaluadoMateria}%` }} />
                    </div>
                  </div>

                  {/* Indicator 3: Nota Necesaria */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Nota Necesaria p/ Aprobar</span>
                    <div className="text-xl font-mono font-bold text-slate-900">
                      {reqInfo.remainingWeight > 0 ? formatGrade(reqInfo.requiredGrade) : '---'}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {reqInfo.achievable ? `En el ${reqInfo.remainingWeight}% restante` : 'Revisa tus notas'}
                    </span>
                  </div>

                  {/* Indicator 4: Próxima Evaluación */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 col-span-2 sm:col-span-1 lg:col-span-2">
                    <span className="text-[11px] font-semibold text-slate-500 block">Próxima Evaluación</span>
                    {subjectProgress.nextEvaluation ? (
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {subjectProgress.nextEvaluation.activityName} ({subjectProgress.nextEvaluation.weightPercent}%)
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          🗓️ {subjectProgress.nextEvaluation.date} • {subjectProgress.nextEvaluation.cutName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No hay próximas evaluaciones</span>
                    )}
                  </div>

                  {/* Indicator 5: Estado de Rendimiento */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Cortes Finalizados</span>
                    <div className="text-xl font-mono font-bold text-slate-900">
                      {subjectProgress.finishedCuts} / {subjectProgress.totalCuts}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {subjectProgress.inProgressCuts > 0 ? 'Corte en progreso' : 'Cortes al día'}
                    </span>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Sub Tab Content 1: Info & Schedule */}
          {subjectSubTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#C5A059]" />
                  Detalles de la Asignatura
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">Profesor Principal:</span>
                    <span className="text-slate-900 font-bold">{currentExpandedSubject.professor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Grupo:</span>
                    <span className="text-slate-900 font-bold">{currentExpandedSubject.group || 'Sin grupo'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Código de Materia:</span>
                    <span className="text-slate-900 font-bold font-mono">{currentExpandedSubject.code || 'Sin código'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Créditos Académicos:</span>
                    <span className="text-slate-900 font-bold font-mono">{currentExpandedSubject.credits || 3} créditos</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Aula Predeterminada:</span>
                    <span className="text-slate-900 font-bold">{currentExpandedSubject.classroom || 'Aula por definir'}</span>
                  </div>
                  {currentExpandedSubject.description && (
                    <div>
                      <span className="text-slate-500 font-semibold block">Descripción:</span>
                      <p className="text-slate-700 leading-relaxed mt-1">{currentExpandedSubject.description}</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sincronización Presidencial:</strong> Los horarios y eventos de esta materia alimentan automáticamente la Sala Oval y la Agenda Presidencial.
                  </span>
                </div>
              </div>

              {/* Schedule Sessions Section */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C5A059]" />
                    Horarios de Clase de la Materia
                  </h3>
                  <button
                    onClick={() => {
                      setGlobalSessionSubjectId(currentExpandedSubject.id);
                      setShowAddSessionGlobalModal(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Horario
                  </button>
                </div>

                {currentExpandedSubject.scheduleSessions && currentExpandedSubject.scheduleSessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentExpandedSubject.scheduleSessions.map((ses) => (
                      <div key={ses.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {getDayOfWeekName(ses.day)}
                          </div>
                          <div className="text-xs font-mono text-purple-800 font-bold mt-0.5">
                            ⏰ {ses.startTime} – {ses.endTime}
                          </div>
                          {ses.classroom && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {ses.classroom}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => AcademicStore.deleteSession(currentExpandedSubject.id, ses.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No has registrado horarios de clase para esta materia</p>
                    <button
                      onClick={() => {
                        setGlobalSessionSubjectId(currentExpandedSubject.id);
                        setShowAddSessionGlobalModal(true);
                      }}
                      className="mt-2 text-xs font-bold text-purple-700 hover:underline"
                    >
                      + Registrar primer horario
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Sub Tab Content: Profesores */}
          {subjectSubTab === 'professors' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-700" />
                      Profesores de la Materia ({currentExpandedSubject.professors?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registra a uno o múltiples docentes y conoce su asignación temporal o por período.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenProfessorModal(currentExpandedSubject.id)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar Profesor
                  </button>
                </div>

                {(() => {
                  const profList = AcademicCalculations.getProfessorsForSubject(currentExpandedSubject, todayStr);
                  
                  if (!profList || profList.length === 0) {
                    return (
                      <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700">No hay profesores registrados para esta materia</p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                          Una asignatura puede tener varios profesores asignados de forma simultánea o en distintos períodos.
                        </p>
                        <button
                          onClick={() => handleOpenProfessorModal(currentExpandedSubject.id)}
                          className="mt-3 px-3.5 py-1.5 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200"
                        >
                          + Registrar primer profesor
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profList.map(({ professor: prof, status, schedules: profScheds }) => {
                        return (
                          <div key={prof.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-900 font-bold flex items-center justify-center text-sm shrink-0">
                                  {prof.title ? prof.title.substring(0, 3) : 'Prof'}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                    {prof.title ? `${prof.title} ` : ''}{prof.name}
                                  </h4>
                                  {prof.department && (
                                    <span className="text-[11px] text-slate-500 font-medium block">
                                      {prof.department}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenProfessorModal(currentExpandedSubject.id, prof)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                                  title="Editar profesor"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProfessor(currentExpandedSubject.id, prof.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded-lg"
                                  title="Eliminar profesor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                              {status === 'active' && (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  Activo Actualmente
                                </span>
                              )}
                              {status === 'previous' && (
                                <span className="px-2.5 py-1 bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                                  <UserMinus className="w-3 h-3 text-slate-600" />
                                  Profesor Anterior (Historial)
                                </span>
                              )}
                              {status === 'upcoming' && (
                                <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                                  <UserPlus className="w-3 h-3 text-purple-600" />
                                  Próximo Profesor
                                </span>
                              )}
                              {status === 'unassigned' && (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                                  <Info className="w-3 h-3 text-amber-600" />
                                  Sin Fechas Definidas
                                </span>
                              )}

                              <span className="text-[11px] text-slate-500 font-medium ml-auto">
                                {profScheds.length} {profScheds.length === 1 ? 'programación' : 'programaciones'}
                              </span>
                            </div>

                            {/* Contact info & Notes */}
                            <div className="space-y-1.5 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                              {prof.email && (
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <a href={`mailto:${prof.email}`} className="text-purple-700 font-medium hover:underline truncate">
                                    {prof.email}
                                  </a>
                                </div>
                              )}
                              {prof.phone && (
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{prof.phone}</span>
                                </div>
                              )}
                              {prof.notes && (
                                <p className="text-[11px] text-slate-600 italic mt-1 leading-relaxed border-t border-slate-100 pt-1">
                                  "{prof.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Sub Tab Content: Programación de Clases */}
          {subjectSubTab === 'schedules' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-700" />
                      Programación de Clases y Profesores ({currentExpandedSubject.schedules?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Define reglas de recurrencia semanal, reemplazos temporales por período o clases especiales.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenScheduleRuleModal(currentExpandedSubject.id)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nueva Programación
                  </button>
                </div>

                {(!currentExpandedSubject.schedules || currentExpandedSubject.schedules.length === 0) ? (
                  <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No hay reglas de programación configuradas</p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Puedes separar conceptualmente a los profesores del calendario. Agrega una clase recurrente o asigna un profesor a un período específico.
                    </p>
                    <button
                      onClick={() => handleOpenScheduleRuleModal(currentExpandedSubject.id)}
                      className="mt-2 px-3.5 py-1.5 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200"
                    >
                      + Configurar primera programación
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* List Schedule Rules */}
                    <div className="grid grid-cols-1 gap-3">
                      {currentExpandedSubject.schedules.map(rule => {
                        const prof = currentExpandedSubject.professors?.find(p => p.id === rule.professorId);
                        const displayProf = prof ? `${prof.title ? prof.title + ' ' : ''}${prof.name}` : rule.professorName || currentExpandedSubject.professor;

                        return (
                          <div key={rule.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all">
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                {rule.type === 'recurring' && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md text-[11px]">
                                    Recurrente Semanal
                                  </span>
                                )}
                                {rule.type === 'period_override' && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded-md text-[11px]">
                                    Asignación por Período
                                  </span>
                                )}
                                {rule.type === 'single_date' && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[11px]">
                                    Fecha Específica
                                  </span>
                                )}

                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-purple-600" /> Profesor: {displayProf}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-slate-700 flex-wrap pt-1 font-medium">
                                {rule.type === 'recurring' && rule.daysOfWeek && (
                                  <span>
                                    <strong>Días:</strong> {rule.daysOfWeek.map(d => getDayOfWeekName(d)).join(', ')}
                                  </span>
                                )}
                                {rule.type === 'single_date' && (
                                  <span>
                                    <strong>Fecha:</strong> {rule.date || rule.startDate}
                                  </span>
                                )}
                                {(rule.type === 'recurring' || rule.type === 'single_date') && rule.startTime && (
                                  <span className="font-mono text-purple-800 font-bold">
                                    ⏰ {rule.startTime} - {rule.endTime}
                                  </span>
                                )}
                                {rule.classroom && (
                                  <span className="flex items-center gap-1 text-slate-600">
                                    <MapPin className="w-3 h-3 text-slate-400" /> {rule.classroom}
                                  </span>
                                )}
                                {rule.modality && (
                                  <span className="px-2 py-0.2 bg-slate-200 text-slate-800 rounded font-semibold text-[10px] capitalize">
                                    {rule.modality}
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 pt-0.5">
                                📅 <strong>Vigencia:</strong> {rule.startDate} al {rule.endDate}
                                {rule.notes && <span className="ml-2 text-slate-600 italic">• "{rule.notes}"</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => handleOpenScheduleRuleModal(currentExpandedSubject.id, rule)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                                title="Editar regla"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteScheduleRule(currentExpandedSubject.id, rule.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded-lg"
                                title="Eliminar regla"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolved Schedule Preview for Current Week */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  Vista Previa de Clases Proyectadas para la Semana Actual
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {getWeekDaysForDate(todayStr).slice(0, 5).map(day => {
                    const sessions = AcademicCalculations.getSessionsForSubjectAndDate(currentExpandedSubject, day.dateStr);

                    return (
                      <div key={day.dateStr} className={`p-3 rounded-xl border ${day.isToday ? 'bg-purple-50/50 border-purple-300' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                          <span>{day.dayShort}</span>
                          <span className="font-mono text-[10px] text-slate-500">{day.dateStr.split('-').slice(1).join('/')}</span>
                        </div>

                        {sessions.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic py-3 text-center">Sin clase</div>
                        ) : (
                          <div className="space-y-2">
                            {sessions.map(ses => (
                              <div key={ses.id} className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs text-xs space-y-1">
                                <div className="font-mono text-[11px] font-bold text-purple-900">
                                  ⏰ {ses.startTime} - {ses.endTime}
                                </div>
                                <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                                  <User className="w-3 h-3 text-purple-600 shrink-0" />
                                  <span className="truncate">{ses.professorTitle ? `${ses.professorTitle} ` : ''}{ses.professorName}</span>
                                </div>
                                {ses.classroom && (
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                    <span>{ses.classroom}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab Content 2: Cortes & Notas */}
          {subjectSubTab === 'cuts' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Estructura de Cortes y Evaluaciones</h3>
                  <p className="text-xs text-slate-500">Configura los cortes del semestre, porcentajes y notas de las evaluaciones</p>
                </div>
                <button
                  onClick={() => handleOpenCutModal(currentExpandedSubject.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Agregar Corte
                </button>
              </div>

              <CutsDistributionBar cuts={currentExpandedSubject.cuts || []} />

              <div className="space-y-4">
                {currentExpandedSubject.cuts && currentExpandedSubject.cuts.length > 0 ? (
                  currentExpandedSubject.cuts.map((cut, idx) => {
                    const cutProgress = AcademicCalculations.calculateCutProgress(cut);
                    return (
                      <div key={cut.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                              C{idx + 1}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-slate-900">{cut.cutName}</h4>
                              <span className="text-xs text-slate-500 font-mono font-semibold">
                                Peso en la materia: {cut.cutWeightPercent}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs text-slate-500 block">Promedio del Corte</span>
                              <span className="text-base font-mono font-bold text-purple-900">
                                {cutProgress.gradedActivitiesCount > 0 ? formatGrade(cutProgress.accumulatedCutGrade) : 'S/N'} / 5.0
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenCutModal(currentExpandedSubject.id, cut)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => AcademicStore.deleteCut(currentExpandedSubject.id, cut.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <ActivitiesDistributionBar activities={cut.activities || []} />

                        {/* Activities Table inside Cut */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <span>Evaluaciones de este Corte</span>
                              <span className="text-[10px] font-mono text-slate-500 normal-case font-normal">(Cadena: Actividad ➔ Profesor ➔ Corte ➔ Materia)</span>
                            </h5>
                            <span className="text-xs text-purple-900 font-mono font-bold bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                              Aporte acumulado del corte a la materia: {formatGrade(cutProgress.aporteSubject)} / {(5.0 * cutProgress.cutWeightPercent / 100).toFixed(2)} ({cutProgress.materiaEvaluadaPercent}% de la materia)
                            </span>
                          </div>

                          {cutProgress.professorsProgress && cutProgress.professorsProgress.length > 0 ? (
                            <div className="space-y-3">
                              {cutProgress.professorsProgress.map((profProg) => (
                                <div key={profProg.professorId} className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                                  {cutProgress.professorsProgress.length > 1 && (
                                    <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 mb-2 gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-xs">Profesor: {profProg.professorName}</span>
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-[10px] rounded-full border border-purple-200">
                                          Peso en el corte: {profProg.weightPercentInCut}%
                                        </span>
                                      </div>
                                      <div className="text-xs font-mono font-bold text-purple-900">
                                        Nota Profesor: {profProg.gradedActivitiesCount > 0 ? formatGrade(profProg.grade) : 'S/N'} / 5.0
                                        <span className="text-slate-500 font-normal ml-2">
                                          (Aporte al corte: {formatGrade(profProg.aporteToCut)})
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {profProg.activitiesProgress && profProg.activitiesProgress.length > 0 ? (
                                    <div className="space-y-3">
                                      {/* Tabla de Actividades del Corte */}
                                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                                        <table className="w-full text-left border-collapse text-xs">
                                          <thead>
                                            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                              <th className="py-2.5 px-3">Actividad</th>
                                              <th className="py-2.5 px-3">Tipo</th>
                                              <th className="py-2.5 px-3 text-center">% Peso</th>
                                              <th className="py-2.5 px-3 text-center">Nota (0.0 - 5.0)</th>
                                              <th className="py-2.5 px-3 text-right">Aporte al Corte</th>
                                              <th className="py-2.5 px-3 text-center">Acciones</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 text-slate-800">
                                            {profProg.activitiesProgress.map((actProg) => {
                                              const isGraded = actProg.isGraded;
                                              return (
                                                <tr key={actProg.activityId} className="hover:bg-purple-50/30 transition-colors">
                                                  <td className="py-2.5 px-3 font-bold text-slate-900">
                                                    <div>{actProg.activityName}</div>
                                                    <span className="text-[10px] text-slate-400 font-normal font-mono block">
                                                      🗓️ {actProg.date}
                                                    </span>
                                                  </td>
                                                  <td className="py-2.5 px-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                                      {actProg.activityType}
                                                    </span>
                                                  </td>
                                                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                                                    {actProg.weightPercentInProf}%
                                                  </td>
                                                  <td className="py-2.5 px-3 text-center">
                                                    <input
                                                      type="number"
                                                      step="0.1"
                                                      min="0"
                                                      max="5"
                                                      placeholder="—"
                                                      value={isGraded && actProg.grade !== undefined && actProg.grade !== null ? actProg.grade : ''}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        const parsed = val !== '' ? parseFloat(val) : undefined;
                                                        AcademicStore.updateActivity(currentExpandedSubject.id, cut.id, actProg.activityId, {
                                                          grade: parsed,
                                                          status: parsed !== undefined ? 'graded' : 'pending'
                                                        });
                                                      }}
                                                      className="w-16 p-1 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:bg-white"
                                                    />
                                                  </td>
                                                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                                                    {isGraded ? (
                                                      <span className="text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                                        {formatGrade(actProg.aporteToCut)}
                                                      </span>
                                                    ) : (
                                                      <span className="text-slate-400 italic font-normal">—</span>
                                                    )}
                                                  </td>
                                                  <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                      <button
                                                        onClick={() => {
                                                          const rawAct = cut.activities.find(a => a.id === actProg.activityId);
                                                          if (rawAct) handleOpenEditActivityModal(currentExpandedSubject.id, cut.id, rawAct);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                                        title="Editar evaluación"
                                                      >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                      </button>
                                                      <button
                                                        onClick={() => handleDeleteActivity(currentExpandedSubject.id, cut.id, actProg.activityId)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                                        title="Eliminar evaluación"
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                      </button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                          <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                                            <tr>
                                              <td colSpan={2} className="py-2.5 px-3">
                                                TOTAL DEL CORTE ({profProg.gradedActivitiesCount}/{profProg.totalActivitiesCount} evaluadas)
                                              </td>
                                              <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                                                {profProg.totalActivityWeightAssigned}%
                                              </td>
                                              <td className="py-2.5 px-3 text-center font-mono text-purple-900 text-[11px]">
                                                {profProg.evaluatedWeightPercentInProf}% evaluado
                                              </td>
                                              <td className="py-2.5 px-3 text-right font-mono text-purple-900 text-sm font-bold">
                                                {profProg.gradedActivitiesCount > 0 ? formatGrade(profProg.grade) : '—'}
                                              </td>
                                              <td></td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>

                                      {/* Panel de Aporte del Corte a la Materia */}
                                      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/80 pb-2">
                                          <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                                            <span>🏛️</span>
                                            <span>Resumen del Corte en la Materia</span>
                                          </span>
                                          <span className="font-mono font-bold text-purple-900 bg-white px-2 py-0.5 rounded-md border border-purple-200 text-[11px]">
                                            Peso en Materia: {cut.cutWeightPercent}%
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                                            <span className="text-[10px] text-slate-500 font-medium block">Nota del Corte</span>
                                            <span className="text-xs font-bold font-mono text-purple-950">
                                              {profProg.gradedActivitiesCount > 0 ? formatGrade(cutProgress.accumulatedCutGrade) : '—'} / 5.0
                                            </span>
                                          </div>

                                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                                            <span className="text-[10px] text-slate-500 font-medium block">Peso en Materia</span>
                                            <span className="text-xs font-bold font-mono text-slate-900">
                                              {cut.cutWeightPercent}%
                                            </span>
                                          </div>

                                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                                            <span className="text-[10px] text-slate-500 font-medium block">Aporte a Materia</span>
                                            <span className="text-xs font-bold font-mono text-emerald-700">
                                              +{formatGrade(cutProgress.aporteSubject)} pts
                                            </span>
                                          </div>

                                          <div className="bg-white p-2 rounded-lg border border-purple-100">
                                            <span className="text-[10px] text-slate-500 font-medium block">% Materia Evaluado</span>
                                            <span className="text-xs font-bold font-mono text-slate-900">
                                              {cutProgress.materiaEvaluadaPercent}%
                                            </span>
                                          </div>
                                        </div>

                                        {/* Detalle Explicativo (Regla 5 y 7) */}
                                        {cutProgress.evaluatedWeightPercent < 100 ? (
                                          <p className="text-[11px] text-purple-900 font-medium pt-0.5">
                                            ⚠️ <strong>Corte en desarrollo:</strong> Se ha evaluado el {cutProgress.evaluatedWeightPercent}% del corte (equivale al {cutProgress.materiaEvaluadaPercent}% de la materia). Aporte acumulado a la materia al momento: <strong>+{formatGrade(cutProgress.aporteSubject)} pts</strong> (Corte: {formatGrade(cutProgress.accumulatedCutGrade)} × {cut.cutWeightPercent}%).
                                          </p>
                                        ) : (
                                          <p className="text-[11px] text-emerald-800 font-medium pt-0.5">
                                            ✅ <strong>Corte 100% completado:</strong> Nota final del corte = <strong>{formatGrade(cutProgress.accumulatedCutGrade)}</strong>. Aporte final a la materia = <strong>+{formatGrade(cutProgress.aporteSubject)} pts</strong> ({formatGrade(cutProgress.accumulatedCutGrade)} × {cut.cutWeightPercent}%).
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500 italic p-3 bg-white rounded-xl border border-dashed border-slate-200">
                                      No hay evaluaciones asignadas a este profesor en este corte.
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              No hay evaluaciones registradas en este corte.
                            </div>
                          )}

                          {/* Inline Add Activity Form */}
                          <div className="pt-2 flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder="Nombre de la nueva evaluación (ej. Parcial 1)"
                              value={newActivityForms[cut.id]?.name || ''}
                              onChange={(e) => setNewActivityForms(prev => ({
                                ...prev,
                                [cut.id]: { ...(prev[cut.id] || { type: 'Parcial', date: todayStr, weight: 20 }), name: e.target.value }
                              }))}
                              className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl flex-1 focus:outline-none focus:border-purple-600"
                            />
                            <select
                              value={newActivityForms[cut.id]?.type || 'Parcial'}
                              onChange={(e) => setNewActivityForms(prev => ({
                                ...prev,
                                [cut.id]: { ...(prev[cut.id] || { name: '', date: todayStr, weight: 20 }), type: e.target.value as any }
                              }))}
                              className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                            >
                              <option value="Parcial">Parcial</option>
                              <option value="Quiz">Quiz</option>
                              <option value="Taller">Taller</option>
                              <option value="Laboratorio">Laboratorio</option>
                              <option value="Exposición">Exposición</option>
                              <option value="Proyecto">Proyecto</option>
                            </select>
                            <input
                              type="date"
                              value={newActivityForms[cut.id]?.date || todayStr}
                              onChange={(e) => setNewActivityForms(prev => ({
                                ...prev,
                                [cut.id]: { ...(prev[cut.id] || { name: '', type: 'Parcial', weight: 20 }), date: e.target.value }
                              }))}
                              className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                            />
                            <input
                              type="number"
                              placeholder="Peso %"
                              value={newActivityForms[cut.id]?.weight || 20}
                              onChange={(e) => setNewActivityForms(prev => ({
                                ...prev,
                                [cut.id]: { ...(prev[cut.id] || { name: '', type: 'Parcial', date: todayStr }), weight: Number(e.target.value) }
                              }))}
                              className="w-16 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-center"
                            />
                            <button
                              onClick={() => handleAddInlineActivity(currentExpandedSubject.id, cut.id)}
                              className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" /> Agregar
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl">
                    <Layers3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No hay cortes configurados</p>
                    <button
                      onClick={() => handleOpenCutModal(currentExpandedSubject.id)}
                      className="mt-2 text-xs font-bold text-purple-700 hover:underline"
                    >
                      + Crear primer corte de la materia
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Sub Tab Content 3 & 4: Evaluaciones y Actividades */}
          {(subjectSubTab === 'evaluations' || subjectSubTab === 'activities') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {subjectSubTab === 'evaluations' ? 'Lista Completa de Evaluaciones' : 'Actividades y Eventos Académicos'}
                </h3>
                <button
                  onClick={() => handleOpenAcademicActivityModal(undefined, currentExpandedSubject.id)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Evento
                </button>
              </div>

              {currentExpandedSubject.academicActivities && currentExpandedSubject.academicActivities.length > 0 ? (
                <div className="space-y-3">
                  {currentExpandedSubject.academicActivities.map((act) => (
                    <div key={act.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{act.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
                            {act.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          🗓️ {act.date} {act.startTime ? `• ⏰ ${act.startTime} – ${act.endTime}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAcademicActivityModal(act)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => AcademicStore.deleteAcademicActivity(act.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No hay actividades registradas en esta materia.
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* ========================================================= */
        /* 3. MAIN DASHBOARD: "MIS MATERIAS" GRID                    */
        /* ========================================================= */
        <div className="space-y-6">
          
          {/* Main Navigation Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
            
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('subjects')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'subjects'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Mis Materias
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'schedule'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" /> Horario Semanal
              </button>

              <button
                onClick={() => setActiveTab('evaluations')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'evaluations'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Target className="w-4 h-4" /> Evaluaciones
              </button>

              <button
                onClick={() => setActiveTab('activities')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'activities'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" /> Actividades
              </button>

              <button
                onClick={() => setActiveTab('semesters')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                  activeTab === 'semesters'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" /> Historial de Semestres
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar materia o profesor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>

          </div>

          {/* TAB 1: MIS MATERIAS GRID */}
          {activeTab === 'subjects' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-[#C5A059]" />
                  Materias del Semestre ({filteredSubjects.length})
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Haz clic en cualquier tarjeta para abrir el espacio de la materia
                </span>
              </div>

              {filteredSubjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSubjects.map((subject) => {
                    const statusInfo = AcademicCalculations.getSubjectStatus(subject);
                    const progress = AcademicCalculations.calculateSubjectProgress(subject);
                    
                    return (
                      <div
                        key={subject.id}
                        onClick={() => setExpandedSubjectId(subject.id)}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between group"
                      >
                        {/* Top Accent Color Bar */}
                        <div 
                          className="h-3.5 w-full transition-opacity group-hover:opacity-90"
                          style={{ backgroundColor: subject.color || '#3B82F6' }}
                        />

                        <div className="p-5 space-y-4 flex-1">
                          
                          {/* Subject Header Info */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-serif font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                                  {subject.name}
                                </h4>
                                {subject.code && (
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded border border-slate-200">
                                    {subject.code}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-medium text-slate-600 mt-0.5">
                                Prof. {subject.professor}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                              statusInfo.status === 'Aprobada' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              statusInfo.status === 'En Riesgo' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                              'bg-blue-50 text-blue-800 border-blue-300'
                            }`}>
                              {statusInfo.status}
                            </span>
                          </div>

                          {/* Room & Group Metadata */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            {subject.group && (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-900 font-bold rounded-md border border-purple-200">
                                Grupo {subject.group}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {subject.classroom || 'Aula por asignar'}
                            </span>
                          </div>

                          {/* Card Summary Metrics Box */}
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                            
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Promedio Actual:</span>
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {statusInfo.hasGrades ? formatGrade(statusInfo.average) : 'S/N'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Próxima Evaluación:</span>
                              <span className="font-mono text-slate-700 text-[11px] font-semibold truncate max-w-[140px]">
                                {progress.nextEvaluation ? `${progress.nextEvaluation.activityName} (${progress.nextEvaluation.weightPercent}%)` : 'Sin pendientes'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Próxima Clase:</span>
                              <span className="font-mono text-slate-700 text-[11px]">
                                {subject.scheduleSessions && subject.scheduleSessions.length > 0 
                                  ? `${getDayOfWeekName(subject.scheduleSessions[0].day)} ${subject.scheduleSessions[0].startTime}`
                                  : 'Sin horario'}
                              </span>
                            </div>

                          </div>

                        </div>

                        {/* Card Footer Action */}
                        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-900 group-hover:bg-purple-50/50 transition-colors">
                          <span>Entrar al espacio de la materia</span>
                          <span>→</span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">No hay materias registradas</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Comienza agregando las materias del semestre activo para organizar notas, cortes y horarios.
                  </p>
                  <button
                    onClick={() => handleOpenSubjectModal()}
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#C5A059] hover:bg-[#b08d4b] rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Crear Primera Materia
                  </button>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: HORARIO SEMANAL */}
          {activeTab === 'schedule' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  Horario Académico Semanal Unificado
                </h3>
                <button
                  onClick={() => setShowAddSessionGlobalModal(true)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Horario de Clase
                </button>
              </div>

              <UniversalSchedule
                events={scheduleEvents}
                selectedDate={scheduleSelectedDate}
                onSelectDate={() => {}}
                viewMode={scheduleViewMode}
                onChangeViewMode={setScheduleViewMode}
              />
            </div>
          )}

          {/* TAB 3: EVALUACIONES GENERALES */}
          {activeTab === 'evaluations' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-700" />
                Todas las Evaluaciones del Semestre
              </h3>

              {activeSubjects.length > 0 ? (
                <div className="space-y-4">
                  {activeSubjects.map(sub => (
                    <div key={sub.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color || '#3B82F6' }} />
                        <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                      </div>

                      {sub.cuts && sub.cuts.length > 0 ? (
                        sub.cuts.map(cut => (
                          <div key={cut.id} className="pl-3 space-y-2">
                            <span className="text-xs font-semibold text-slate-500 block">{cut.cutName} ({cut.cutWeightPercent}%)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {cut.activities && cut.activities.map(act => (
                                <div key={act.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                                  <div className="font-bold text-slate-900 flex justify-between">
                                    <span>{act.name}</span>
                                    <span className="font-mono text-purple-900">{act.weightPercent}%</span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">🗓️ {act.date}</div>
                                  <div className="text-[11px] text-slate-700 font-semibold">
                                    Nota: {act.grade !== undefined && act.grade !== null ? formatGrade(act.grade) : 'Pendiente'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">Sin evaluaciones configuradas</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">No hay materias registradas</div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVIDADES GENERALES */}
          {activeTab === 'activities' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  Eventos y Actividades Académicas No Calificables
                </h3>
                <button
                  onClick={() => handleOpenAcademicActivityModal()}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Actividad
                </button>
              </div>

              {upcomingActivities.length > 0 ? (
                <div className="space-y-3">
                  {upcomingActivities.map((item) => (
                    <div key={item.activity.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{item.activity.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                            {item.activity.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          Materia: <span className="font-bold text-slate-900">{item.subject.name}</span> • 🗓️ {item.activity.date}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenAcademicActivityModal(item.activity)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg"
                      >
                        Editar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No hay actividades académicas pendientes registradas
                </div>
              )}
            </div>
          )}

          {/* TAB 5: HISTORIAL DE SEMESTRES */}
          {activeTab === 'semesters' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A059]" />
                  Historial Académico y Gestión de Semestres
                </h3>
                <button
                  onClick={() => handleOpenSemesterModal()}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Nuevo Semestre
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesters.map((sem) => {
                  const semSubjects = subjects.filter(s => s.semesterId === sem.id);
                  const semGPA = AcademicCalculations.calculateSemesterGPA(sem.id, subjects);
                  
                  return (
                    <div key={sem.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-bold text-slate-900">{sem.name}</h4>
                        {sem.isActive && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-full border border-emerald-300">
                            Activo
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div>Materias: <strong className="text-slate-900">{semSubjects.length}</strong></div>
                        <div>Promedio Semestre: <strong className="text-purple-900 font-mono">{formatGrade(semGPA)}</strong></div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handleOpenSemesterModal(sem)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => AcademicStore.deleteSemester(sem.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-lg"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS SECTION                                            */}
      {/* ========================================================= */}

      {/* MODAL: SEMESTRE */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSemester ? 'Editar Semestre' : 'Nuevo Semestre Universitario'}
              </h3>
              <button onClick={() => setShowSemesterModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSemester} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Semestre *</label>
                <input
                  type="text"
                  placeholder="Ej: 2026-I, Semestre V"
                  value={semName}
                  onChange={e => setSemName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={semStart}
                    onChange={e => setSemStart(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={semEnd}
                    onChange={e => setSemEnd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSemesterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Semestre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MATERIA */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSubject ? 'Editar Asignatura' : 'Registrar Nueva Asignatura'}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Materia *</label>
                <input
                  type="text"
                  placeholder="Ej: Matemáticas, Biología, Historia..."
                  value={subjName}
                  onChange={e => setSubjName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semestre *</label>
                  <select
                    value={subjSemesterId}
                    onChange={e => setSubjSemesterId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Activo)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Profesor / Docente</label>
                  <input
                    type="text"
                    placeholder="Ej: Prof. Carlos Restrepo"
                    value={subjProf}
                    onChange={e => setSubjProf(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grupo</label>
                  <input
                    type="text"
                    placeholder="Ej: 01"
                    value={subjGroup}
                    onChange={e => setSubjGroup(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código</label>
                  <input
                    type="text"
                    placeholder="Ej: MAT-101"
                    value={subjCode}
                    onChange={e => setSubjCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Créditos</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={subjCredits}
                    onChange={e => setSubjCredits(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Aula / Salón Predeterminado</label>
                <input
                  type="text"
                  placeholder="Ej: Aula 302, Laboratorio Central"
                  value={subjClassroom}
                  onChange={e => setSubjClassroom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Color de Distintivo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={subjColor}
                    onChange={e => setSubjColor(e.target.value)}
                    className="w-10 h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer shrink-0"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setSubjColor(hex)}
                        className={`w-6 h-6 rounded-full border ${subjColor === hex ? 'ring-2 ring-slate-900 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CORTE */}
      {showCutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCut ? 'Editar Corte Académico' : 'Agregar Corte Académico'}
              </h3>
              <button onClick={() => setShowCutModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCut} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Corte *</label>
                <input
                  type="text"
                  placeholder="Ej: Corte 1, Primer Parcial..."
                  value={cutName}
                  onChange={e => setCutName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Porcentaje del Corte (%) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={cutWeight}
                  onChange={e => setCutWeight(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-center font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCutModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Corte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACTIVIDAD ACADÉMICA / EVENTO NO CALIFICABLE */}
      {showAcademicActivityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingAcademicActivity ? 'Editar Actividad Académica' : 'Nueva Actividad Académica'}
              </h3>
              <button onClick={() => setShowAcademicActivityModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAcademicActivity} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Materia Asociada *</label>
                <select
                  value={acadActSubjectId}
                  onChange={e => setAcadActSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  {activeSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Actividad *</label>
                <input
                  type="text"
                  placeholder="Ej: Salida de campo, Taller práctico, Exposición..."
                  value={acadActName}
                  onChange={e => setAcadActName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo</label>
                  <select
                    value={acadActType}
                    onChange={e => setAcadActType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Salida de campo">🚌 Salida de campo</option>
                    <option value="Laboratorio">🧪 Laboratorio</option>
                    <option value="Práctica">🛠️ Práctica</option>
                    <option value="Conferencia">🎤 Conferencia</option>
                    <option value="Seminario">📚 Seminario</option>
                    <option value="Tutoría">👨‍🏫 Tutoría</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={acadActDate}
                    onChange={e => setAcadActDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAcademicActivityModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL AGREGAR SESIÓN DE CLASE */}
      {showAddSessionGlobalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Agregar Horario de Clase</h3>
              <button onClick={() => setShowAddSessionGlobalModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGlobalAddSession} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Materia *</label>
                <select
                  value={globalSessionSubjectId}
                  onChange={e => setGlobalSessionSubjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  {activeSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Día de la Semana</label>
                <select
                  value={sessionDay}
                  onChange={e => setSessionDay(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
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
                  <label className="font-bold text-slate-700 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={sessionStart}
                    onChange={e => setSessionStart(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={sessionEnd}
                    onChange={e => setSessionEnd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Aula / Salón (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Aula 302, Laboratorio 1"
                  value={sessionRoom}
                  onChange={e => setSessionRoom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSessionGlobalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR / EDITAR PROFESOR */}
      {showProfessorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                {editingProfessor ? 'Editar Profesor' : 'Registrar Nuevo Profesor'}
              </h3>
              <button onClick={() => setShowProfessorModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfessor} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Título</label>
                  <select
                    value={profTitle}
                    onChange={e => setProfTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                    <option value="MSc.">MSc.</option>
                    <option value="Ing.">Ing.</option>
                    <option value="Lic.">Lic.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Pérez"
                    value={profName}
                    onChange={e => setProfName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="docente@universidad.edu"
                    value={profEmail}
                    onChange={e => setProfEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+57 300 000 0000"
                    value={profPhone}
                    onChange={e => setProfPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Departamento / Cátedra</label>
                <input
                  type="text"
                  placeholder="Ej. Departamento de Morfología"
                  value={profDepartment}
                  onChange={e => setProfDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas / Especialidad / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Especialidad, horario de atención o detalles del profesor..."
                  value={profNotes}
                  onChange={e => setProfNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfessorModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Profesor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR / EDITAR REGLA DE PROGRAMACIÓN DE CLASE */}
      {showScheduleRuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                {editingScheduleRule ? 'Editar Programación' : 'Nueva Programación de Clase'}
              </h3>
              <button onClick={() => setShowScheduleRuleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Warning Banner */}
            {conflictWarning && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Conflicto Detectado:</strong>
                  <span>{conflictWarning}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveScheduleRule} className="space-y-4 text-xs">
              {/* Rule Type Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Programación</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setRuleType('recurring'); setConflictWarning(null); }}
                    className={`py-2 px-2 text-[11px] font-bold rounded-lg text-center transition-all ${
                      ruleType === 'recurring' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Recurrente
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRuleType('period_override'); setConflictWarning(null); }}
                    className={`py-2 px-2 text-[11px] font-bold rounded-lg text-center transition-all ${
                      ruleType === 'period_override' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Por Período
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRuleType('single_date'); setConflictWarning(null); }}
                    className={`py-2 px-2 text-[11px] font-bold rounded-lg text-center transition-all ${
                      ruleType === 'single_date' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fecha Única
                  </button>
                </div>
              </div>

              {/* Professor Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Profesor Asignado a esta Clase *</label>
                <select
                  value={ruleProfessorId}
                  onChange={e => { setRuleProfessorId(e.target.value); setConflictWarning(null); }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  required
                >
                  <option value="">-- Selecciona Profesor --</option>
                  {subjects.find(s => s.id === ruleSubjectId)?.professors?.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title ? `${p.title} ` : ''}{p.name} {p.department ? `(${p.department})` : ''}
                    </option>
                  ))}
                </select>
                {(!subjects.find(s => s.id === ruleSubjectId)?.professors || subjects.find(s => s.id === ruleSubjectId)?.professors?.length === 0) && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    ⚠️ Esta materia no tiene profesores registrados. Primero registra los profesores en la pestaña "Profesores".
                  </p>
                )}
              </div>

              {/* Day of Week selection for Recurring */}
              {ruleType === 'recurring' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Días de la Semana</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { num: 1, label: 'Lun' },
                      { num: 2, label: 'Mar' },
                      { num: 3, label: 'Mié' },
                      { num: 4, label: 'Jue' },
                      { num: 5, label: 'Vie' },
                      { num: 6, label: 'Sáb' },
                      { num: 7, label: 'Dom' },
                    ].map(d => {
                      const selected = ruleDaysOfWeek.includes(d.num);
                      return (
                        <button
                          key={d.num}
                          type="button"
                          onClick={() => {
                            setConflictWarning(null);
                            if (selected) {
                              if (ruleDaysOfWeek.length > 1) {
                                setRuleDaysOfWeek(ruleDaysOfWeek.filter(x => x !== d.num));
                              }
                            } else {
                              setRuleDaysOfWeek([...ruleDaysOfWeek, d.num]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            selected
                              ? 'bg-purple-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date selection for Single Date */}
              {ruleType === 'single_date' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Específica *</label>
                  <input
                    type="date"
                    required
                    value={ruleDate}
                    onChange={e => { setRuleDate(e.target.value); setConflictWarning(null); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              )}

              {/* Start & End Date Validity Period */}
              {ruleType !== 'single_date' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha Inicio Vigencia</label>
                    <input
                      type="date"
                      value={ruleStartDate}
                      onChange={e => { setRuleStartDate(e.target.value); setConflictWarning(null); }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha Fin Vigencia</label>
                    <input
                      type="date"
                      value={ruleEndDate}
                      onChange={e => { setRuleEndDate(e.target.value); setConflictWarning(null); }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={ruleStartTime}
                    onChange={e => { setRuleStartTime(e.target.value); setConflictWarning(null); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora Fin *</label>
                  <input
                    type="time"
                    required
                    value={ruleEndTime}
                    onChange={e => { setRuleEndTime(e.target.value); setConflictWarning(null); }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Classroom & Modality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aula / Salón</label>
                  <input
                    type="text"
                    placeholder="Ej. Aula 402, Lab 3"
                    value={ruleClassroom}
                    onChange={e => setRuleClassroom(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modalidad</label>
                  <select
                    value={ruleModality}
                    onChange={e => setRuleModality(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observaciones / Motivo de Reemplazo</label>
                <input
                  type="text"
                  placeholder="Ej. Módulo de Embriología, Reemplazo por comisión médica..."
                  value={ruleNotes}
                  onChange={e => setRuleNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleRuleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md"
                >
                  Guardar Programación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import { AcademicSubject, AcademicSemester, AcademicCut, AcademicEvaluationActivity, SubjectProfessor, SubjectScheduleRule } from '../../types/store';
import { getDayOfWeekNumber } from '../../utils/dates';
import { formatGrade } from '../../utils/formatters';

export interface EvaluationItem {
  subjectId: string;
  cutId: string;
  activityId: string;
  subjectName: string;
  subjectColor: string;
  cutName: string;
  activityName: string;
  activityType: string;
  activityDate: string;
  weightPercent: number;
  grade?: number;
  status: 'pending' | 'graded' | 'cancelled';
  daysDiff: number; // 0 = today, 1 = tomorrow, etc.
}

export interface ResolvedAcademicSession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  classroom?: string;
  modality?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
  professorId: string;
  professorName: string;
  professorTitle?: string;
  scheduleId: string;
  scheduleType: 'recurring' | 'period_override' | 'single_date' | 'legacy';
  notes?: string;
}

export interface DistributionMetric {
  totalAssigned: number;
  remaining: number;
  excess: number;
  percentage: number;
  isComplete: boolean;
  isDeficit: boolean;
  isExcess: boolean;
  status: 'complete' | 'deficit' | 'excess';
  statusMessage: string;
  statusColor: 'emerald' | 'amber' | 'rose';
}

export interface CutProgressResult {
  cutId: string;
  cutName: string;
  cutWeightPercent: number; // Weight within the subject (e.g. 30%)
  
  activities: AcademicEvaluationActivity[];
  totalActivitiesCount: number;
  gradedActivitiesCount: number;
  
  totalActivityWeightAssigned: number; // Sum of activity weights (e.g. 95, 100, 110)
  evaluatedWeightPercent: number;     // Evaluated activity coverage % (e.g. 50%)
  pendingWeightPercent: number;       // Pending coverage %
  
  accumulatedCutGrade: number;        // Σ (grade * weight / 100) for graded activities (0.00 - 5.00)
  aporteSubject: number;              // accumulatedCutGrade * (cutWeightPercent / 100)
  maxAporteSubject: number;           // 5.0 * (cutWeightPercent / 100)
  
  status: 'finalizado' | 'en_progreso' | 'sin_evaluar';
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'slate';
  
  activitiesDistribution: DistributionMetric;
}

export interface SubjectProgressResult {
  subjectId: string;
  subjectName: string;
  
  totalCuts: number;
  finishedCuts: number;
  inProgressCuts: number;
  unstartedCuts: number;
  
  cutsProgress: CutProgressResult[];
  cutsDistribution: DistributionMetric;
  
  notaAcumuladaMateria: number;      // Σ (aporteSubject) - Points earned towards 5.0
  porcentajeEvaluadoMateria: number; // Total % of the subject evaluated so far
  promedioAcumuladoEvaluado: number;// Average on the evaluated portion (notaAcumulada / porcentajeEvaluado)
  
  hasGrades: boolean;
  status: 'Aprobada' | 'En Riesgo' | 'En Cursado';
  
  nextEvaluation?: {
    activityName: string;
    cutName: string;
    date: string;
    weightPercent: number;
    activityType: string;
  };
}

export const AcademicCalculations = {
  getCutsDistribution(cuts: { cutWeightPercent: number }[] | undefined): DistributionMetric {
    const safeCuts = cuts || [];
    const totalAssigned = Math.round(safeCuts.reduce((acc, c) => acc + (Number(c.cutWeightPercent) || 0), 0) * 10) / 10;
    
    const isComplete = Math.abs(totalAssigned - 100) < 0.1;
    const isExcess = totalAssigned > 100;
    const isDeficit = totalAssigned < 100;

    const remaining = isDeficit ? Math.round((100 - totalAssigned) * 10) / 10 : 0;
    const excess = isExcess ? Math.round((totalAssigned - 100) * 10) / 10 : 0;

    let status: 'complete' | 'deficit' | 'excess' = 'complete';
    let statusMessage = "Distribución de cortes completa (100%).";
    let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

    if (isExcess) {
      status = 'excess';
      statusMessage = `Los cortes superan el 100% (Exceso: +${excess}%).`;
      statusColor = 'rose';
    } else if (isDeficit) {
      status = 'deficit';
      statusMessage = `Falta distribuir cortes (Faltan: ${remaining}%).`;
      statusColor = 'amber';
    }

    return {
      totalAssigned,
      remaining,
      excess,
      percentage: Math.min(100, totalAssigned),
      isComplete,
      isDeficit,
      isExcess,
      status,
      statusMessage,
      statusColor
    };
  },

  getActivitiesDistribution(activities: { weightPercent: number }[] | undefined): DistributionMetric {
    const safeActivities = activities || [];
    const totalAssigned = Math.round(safeActivities.reduce((acc, a) => acc + (Number(a.weightPercent) || 0), 0) * 10) / 10;

    const isComplete = Math.abs(totalAssigned - 100) < 0.1;
    const isExcess = totalAssigned > 100;
    const isDeficit = totalAssigned < 100;

    const remaining = isDeficit ? Math.round((100 - totalAssigned) * 10) / 10 : 0;
    const excess = isExcess ? Math.round((totalAssigned - 100) * 10) / 10 : 0;

    let status: 'complete' | 'deficit' | 'excess' = 'complete';
    let statusMessage = "Distribución de evaluaciones completa (100%).";
    let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

    if (isExcess) {
      status = 'excess';
      statusMessage = `Las evaluaciones superan el 100% (Excede: +${excess}%).`;
      statusColor = 'rose';
    } else if (isDeficit) {
      status = 'deficit';
      statusMessage = `Falta distribuir en el corte (Faltan: ${remaining}%).`;
      statusColor = 'amber';
    }

    return {
      totalAssigned,
      remaining,
      excess,
      percentage: Math.min(100, totalAssigned),
      isComplete,
      isDeficit,
      isExcess,
      status,
      statusMessage,
      statusColor
    };
  },

  /**
   * Calculates progressive corte metrics dynamically in real-time.
   * Formula:
   *  Nota acumulada del corte = Σ (Nota de la actividad × Porcentaje de la actividad / 100) for graded activities.
   *  Aporte a la materia = Nota acumulada del corte × (Porcentaje del corte / 100).
   */
  calculateCutProgress(cut: AcademicCut): CutProgressResult {
    const activities = cut.activities || [];
    const cutWeight = Number(cut.cutWeightPercent) || 0;
    
    const totalActivityWeightAssigned = Math.round(activities.reduce((acc, a) => acc + (Number(a.weightPercent) || 0), 0) * 10) / 10;
    
    let evaluatedWeightPercent = 0;
    let accumulatedCutGrade = 0;
    let gradedActivitiesCount = 0;
    
    activities.forEach(act => {
      const isGraded = act.grade !== undefined && act.grade !== null && !isNaN(Number(act.grade)) && String(act.grade).trim() !== '';
      if (isGraded) {
        gradedActivitiesCount++;
        const w = Number(act.weightPercent) || 0;
        const g = Number(act.grade) || 0;
        evaluatedWeightPercent += w;
        accumulatedCutGrade += (g * w) / 100;
      }
    });

    evaluatedWeightPercent = Math.round(evaluatedWeightPercent * 10) / 10;
    
    const pendingWeightPercent = Math.max(0, Math.round((100 - evaluatedWeightPercent) * 10) / 10);
    const aporteSubject = accumulatedCutGrade * (cutWeight / 100);
    const maxAporteSubject = 5.0 * (cutWeight / 100);
    
    const activitiesDistribution = this.getActivitiesDistribution(activities);
    
    const isAllGraded = activities.length > 0 && gradedActivitiesCount === activities.length;
    const is100PercentAssigned = Math.abs(totalActivityWeightAssigned - 100) < 0.1;
    
    let status: 'finalizado' | 'en_progreso' | 'sin_evaluar' = 'sin_evaluar';
    let statusLabel = '⚪ Sin evaluar';
    let statusColor: 'emerald' | 'amber' | 'slate' = 'slate';
    
    if (isAllGraded && is100PercentAssigned) {
      status = 'finalizado';
      statusLabel = '🟢 Corte finalizado';
      statusColor = 'emerald';
    } else if (gradedActivitiesCount > 0) {
      status = 'en_progreso';
      statusLabel = '🟡 En progreso';
      statusColor = 'amber';
    }

    return {
      cutId: cut.id,
      cutName: cut.cutName,
      cutWeightPercent: cutWeight,
      activities,
      totalActivitiesCount: activities.length,
      gradedActivitiesCount,
      totalActivityWeightAssigned,
      evaluatedWeightPercent,
      pendingWeightPercent,
      accumulatedCutGrade,
      aporteSubject,
      maxAporteSubject,
      status,
      statusLabel,
      statusColor,
      activitiesDistribution
    };
  },

  /**
   * Calculates progressive subject metrics dynamically in real-time.
   * Formula:
   *  Nota acumulada de la materia = Σ (Aporte de cada corte).
   *  Promedio acumulado (sobre lo evaluado) = Nota acumulada / (Porcentaje total evaluado de la materia / 100).
   */
  calculateSubjectProgress(subject: AcademicSubject): SubjectProgressResult {
    const cuts = subject.cuts || [];
    const cutsDistribution = this.getCutsDistribution(cuts);
    
    const cutsProgress = cuts.map(c => this.calculateCutProgress(c));
    
    let notaAcumuladaMateria = 0;
    let porcentajeEvaluadoMateria = 0;
    let finishedCuts = 0;
    let inProgressCuts = 0;
    let unstartedCuts = 0;
    let hasGrades = false;
    
    cutsProgress.forEach(cp => {
      notaAcumuladaMateria += cp.aporteSubject;
      porcentajeEvaluadoMateria += (cp.cutWeightPercent * (cp.evaluatedWeightPercent / 100));
      
      if (cp.gradedActivitiesCount > 0) {
        hasGrades = true;
      }
      
      if (cp.status === 'finalizado') {
        finishedCuts++;
      } else if (cp.status === 'en_progreso') {
        inProgressCuts++;
      } else {
        unstartedCuts++;
      }
    });

    porcentajeEvaluadoMateria = Math.round(porcentajeEvaluadoMateria * 10) / 10;
    
    const promedioAcumuladoEvaluado = porcentajeEvaluadoMateria > 0
      ? (notaAcumuladaMateria / (porcentajeEvaluadoMateria / 100))
      : 0;

    let status: 'Aprobada' | 'En Riesgo' | 'En Cursado' = 'En Cursado';
    if (hasGrades) {
      if (notaAcumuladaMateria >= 3.0) {
        status = 'Aprobada';
      } else if (promedioAcumuladoEvaluado < 3.0 && porcentajeEvaluadoMateria > 0) {
        status = 'En Riesgo';
      } else if (promedioAcumuladoEvaluado >= 3.0) {
        status = 'Aprobada';
      }
    }

    // Find next upcoming pending evaluation
    const todayStr = new Date().toISOString().split('T')[0];
    let nextEvaluation: SubjectProgressResult['nextEvaluation'] = undefined;
    
    const pendingActivities: Array<{ act: AcademicEvaluationActivity; cutName: string }> = [];
    cuts.forEach(c => {
      (c.activities || []).forEach(a => {
        const isGraded = a.grade !== undefined && a.grade !== null && !isNaN(Number(a.grade)) && String(a.grade).trim() !== '';
        if (!isGraded && a.status === 'pending') {
          pendingActivities.push({ act: a, cutName: c.cutName });
        }
      });
    });

    pendingActivities.sort((a, b) => (a.act.date || '9999').localeCompare(b.act.date || '9999'));
    if (pendingActivities.length > 0) {
      const next = pendingActivities[0];
      nextEvaluation = {
        activityName: next.act.name,
        cutName: next.cutName,
        date: next.act.date,
        weightPercent: next.act.weightPercent,
        activityType: next.act.type
      };
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalCuts: cuts.length,
      finishedCuts,
      inProgressCuts,
      unstartedCuts,
      cutsProgress,
      cutsDistribution,
      notaAcumuladaMateria,
      porcentajeEvaluadoMateria,
      promedioAcumuladoEvaluado,
      hasGrades,
      status,
      nextEvaluation
    };
  },

  calculateSubjectAverage(subject: AcademicSubject): { average: number; notaAcumulada: number; totalGradedWeight: number; hasGrades: boolean } {
    const progress = this.calculateSubjectProgress(subject);
    return {
      average: progress.promedioAcumuladoEvaluado,
      notaAcumulada: progress.notaAcumuladaMateria,
      totalGradedWeight: progress.porcentajeEvaluadoMateria,
      hasGrades: progress.hasGrades
    };
  },

  calculateSemesterGPA(activeSemesterId: string, subjects: AcademicSubject[]): number {
    const activeSubjects = subjects.filter(s => s.semesterId === activeSemesterId);
    if (activeSubjects.length === 0) return 0;

    let totalSum = 0;
    let counted = 0;

    activeSubjects.forEach(sub => {
      const progress = this.calculateSubjectProgress(sub);
      if (progress.hasGrades) {
        totalSum += progress.promedioAcumuladoEvaluado;
        counted++;
      }
    });

    return counted > 0 ? totalSum / counted : 0;
  },

  calculateGlobalGPA(academicData: { semesters?: AcademicSemester[]; subjects: AcademicSubject[] }): number | null {
    if (!academicData || !academicData.subjects || academicData.subjects.length === 0) return null;

    let totalSum = 0;
    let counted = 0;

    academicData.subjects.forEach(sub => {
      const progress = this.calculateSubjectProgress(sub);
      if (progress.hasGrades) {
        totalSum += progress.promedioAcumuladoEvaluado;
        counted++;
      }
    });

    return counted > 0 ? totalSum / counted : null;
  },

  calculateRequiredGradeToPass(subject: AcademicSubject, targetGrade: number = 3.0): { requiredGrade: number; remainingWeight: number; achievable: boolean } {
    const progress = this.calculateSubjectProgress(subject);
    const remainingWeight = Math.round((100 - progress.porcentajeEvaluadoMateria) * 10) / 10;

    if (remainingWeight <= 0) {
      return { requiredGrade: 0, remainingWeight: 0, achievable: progress.notaAcumuladaMateria >= targetGrade };
    }

    const pointsNeeded = targetGrade - progress.notaAcumuladaMateria;
    if (pointsNeeded <= 0) {
      return { requiredGrade: 0, remainingWeight, achievable: true };
    }

    const requiredGrade = (pointsNeeded * 100) / remainingWeight;
    return {
      requiredGrade: Math.max(0, requiredGrade),
      remainingWeight,
      achievable: requiredGrade <= 5.0
    };
  },

  calculateSemesterProgress(semester?: AcademicSemester): number {
    if (!semester || !semester.startDate || !semester.endDate) return 0;
    const start = new Date(semester.startDate).getTime();
    const end = new Date(semester.endDate).getTime();
    const now = new Date().getTime();

    if (end <= start) return 0;
    if (now <= start) return 0;
    if (now >= end) return 100;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  },

  /**
   * Resolves sessions for a specific subject on a specific date (YYYY-MM-DD),
   * taking into account recurring rules, period overrides, and single-date sessions.
   */
  getSessionsForSubjectAndDate(subject: AcademicSubject, dateStr: string): ResolvedAcademicSession[] {
    const dayNum = getDayOfWeekNumber(dateStr);
    const schedules = subject.schedules || [];
    const professors = subject.professors || [];

    // Helper to get professor info
    const getProfInfo = (profId?: string, fallbackName?: string) => {
      if (profId) {
        const found = professors.find(p => p.id === profId || p.name === profId);
        if (found) {
          return {
            id: found.id,
            name: found.name,
            title: found.title || ''
          };
        }
      }
      return {
        id: profId || 'prof_default',
        name: fallbackName || subject.professor || 'Profesor por asignar',
        title: ''
      };
    };

    // 1. Find active period overrides for this subject on dateStr
    const periodOverrides = schedules.filter(
      s => s.type === 'period_override' && s.startDate <= dateStr && dateStr <= s.endDate
    );
    // Active period override if exists
    const activeOverride = periodOverrides.length > 0 ? periodOverrides[periodOverrides.length - 1] : null;

    const resolved: ResolvedAcademicSession[] = [];

    // 2. Candidate rules for dateStr
    // A) Single date rules on dateStr
    const singleDateRules = schedules.filter(
      s => s.type === 'single_date' && (s.date === dateStr || s.startDate === dateStr)
    );

    // B) Recurring rules covering dateStr and matching dayNum
    const recurringRules = schedules.filter(
      s => s.type === 'recurring' &&
           s.startDate <= dateStr &&
           dateStr <= s.endDate &&
           s.daysOfWeek?.includes(dayNum)
    );

    // Process single date rules
    singleDateRules.forEach(rule => {
      const activeProf = activeOverride
        ? getProfInfo(activeOverride.professorId, activeOverride.professorName)
        : getProfInfo(rule.professorId, rule.professorName);

      resolved.push({
        id: `ses_sd_${subject.id}_${rule.id}_${dateStr}`,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color || '#3B82F6',
        classroom: rule.classroom || subject.classroom,
        modality: rule.modality || 'presencial',
        date: dateStr,
        startTime: rule.startTime || '08:00',
        endTime: rule.endTime || '10:00',
        professorId: activeProf.id,
        professorName: activeProf.name,
        professorTitle: activeProf.title,
        scheduleId: rule.id,
        scheduleType: 'single_date',
        notes: rule.notes
      });
    });

    // Process recurring rules
    recurringRules.forEach(rule => {
      // Check if active override applies specifically to this rule or all
      const overrideForThisRule = activeOverride && (!activeOverride.applyToScheduleId || activeOverride.applyToScheduleId === rule.id)
        ? activeOverride
        : null;

      const activeProf = overrideForThisRule
        ? getProfInfo(overrideForThisRule.professorId, overrideForThisRule.professorName)
        : getProfInfo(rule.professorId, rule.professorName);

      resolved.push({
        id: `ses_rec_${subject.id}_${rule.id}_${dateStr}`,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color || '#3B82F6',
        classroom: rule.classroom || subject.classroom,
        modality: rule.modality || 'presencial',
        date: dateStr,
        startTime: rule.startTime || '08:00',
        endTime: rule.endTime || '10:00',
        professorId: activeProf.id,
        professorName: activeProf.name,
        professorTitle: activeProf.title,
        scheduleId: rule.id,
        scheduleType: activeOverride ? 'period_override' : 'recurring',
        notes: rule.notes
      });
    });

    // Fallback: If no schedules are defined in subject.schedules, check legacy scheduleSessions
    if (schedules.length === 0 && subject.scheduleSessions && subject.scheduleSessions.length > 0) {
      subject.scheduleSessions.forEach(ses => {
        if (ses.day === dayNum) {
          const profInfo = getProfInfo(ses.professorId, ses.professorName || subject.professor);
          resolved.push({
            id: `ses_leg_${subject.id}_${ses.id}_${dateStr}`,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color || '#3B82F6',
            classroom: ses.classroom || subject.classroom,
            modality: 'presencial',
            date: dateStr,
            startTime: ses.startTime,
            endTime: ses.endTime,
            professorId: profInfo.id,
            professorName: profInfo.name,
            professorTitle: profInfo.title,
            scheduleId: ses.id,
            scheduleType: 'legacy'
          });
        }
      });
    }

    return resolved;
  },

  /**
   * Resolves all sessions across all subjects for a given date.
   */
  getAllSessionsForDate(subjects: AcademicSubject[], dateStr: string): ResolvedAcademicSession[] {
    const allSessions: ResolvedAcademicSession[] = [];
    (subjects || []).forEach(sub => {
      const sessions = this.getSessionsForSubjectAndDate(sub, dateStr);
      allSessions.push(...sessions);
    });

    allSessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return allSessions;
  },

  /**
   * Categorizes professors for a subject into active, previous, and upcoming based on schedule rules and date ranges.
   */
  getProfessorsForSubject(subject: AcademicSubject, todayStr: string = new Date().toISOString().split('T')[0]) {
    const professors = subject.professors || [];
    const schedules = subject.schedules || [];

    return professors.map(prof => {
      const profSchedules = schedules.filter(s => s.professorId === prof.id || s.professorName === prof.name);

      const isActive = profSchedules.some(s => {
        if (s.type === 'single_date') return (s.date || s.startDate) === todayStr;
        return s.startDate <= todayStr && todayStr <= s.endDate;
      });

      const isPast = profSchedules.length > 0 && profSchedules.every(s => {
        if (s.type === 'single_date') return (s.date || s.startDate || '') < todayStr;
        return s.endDate < todayStr;
      });

      const isUpcoming = profSchedules.length > 0 && profSchedules.some(s => {
        if (s.type === 'single_date') return (s.date || s.startDate || '') > todayStr;
        return s.startDate > todayStr;
      });

      let status: 'active' | 'previous' | 'upcoming' | 'unassigned' = 'unassigned';
      if (isActive) status = 'active';
      else if (isPast) status = 'previous';
      else if (isUpcoming) status = 'upcoming';

      return {
        professor: prof,
        status,
        schedules: profSchedules
      };
    });
  },

  /**
   * Checks for conflicts before adding/editing a schedule rule.
   */
  checkScheduleConflicts(
    subject: AcademicSubject,
    newRule: Partial<SubjectScheduleRule>,
    allSubjects: AcademicSubject[] = []
  ): { hasConflict: boolean; message?: string } {
    const profId = newRule.professorId;
    const profName = newRule.professorName || 'El profesor';

    if (!profId) return { hasConflict: false };

    // Check 1: Overlapping period_override in same subject
    if (newRule.type === 'period_override' && newRule.startDate && newRule.endDate) {
      const existingOverrides = (subject.schedules || []).filter(
        s => s.id !== newRule.id && s.type === 'period_override'
      );
      for (const ex of existingOverrides) {
        if (newRule.startDate <= ex.endDate && newRule.endDate >= ex.startDate) {
          return {
            hasConflict: true,
            message: `Ya existe un reemplazo por período en esta materia que se superpone con las fechas seleccionadas (${ex.startDate} a ${ex.endDate}).`
          };
        }
      }
    }

    // Check 2: Time slot overlap for recurring or single_date rules for same professor
    if ((newRule.type === 'recurring' || newRule.type === 'single_date') && newRule.startTime && newRule.endTime) {
      for (const sub of allSubjects) {
        for (const s of (sub.schedules || [])) {
          if (s.id === newRule.id) continue;
          if (s.professorId !== profId) continue;
          if (s.type === 'period_override') continue;

          // Check date overlap
          const datesOverlap = newRule.type === 'single_date' && s.type === 'single_date'
            ? (newRule.date || newRule.startDate) === (s.date || s.startDate)
            : ((newRule.startDate || '') <= s.endDate && (newRule.endDate || '') >= s.startDate);

          if (!datesOverlap) continue;

          // Check day of week overlap
          let daysOverlap = false;
          if (newRule.type === 'single_date' && s.type === 'single_date') {
            daysOverlap = true;
          } else if (newRule.daysOfWeek && s.daysOfWeek) {
            daysOverlap = newRule.daysOfWeek.some(d => s.daysOfWeek!.includes(d));
          }

          if (!daysOverlap) continue;

          // Check time overlap
          if (s.startTime && s.endTime) {
            if (newRule.startTime < s.endTime && newRule.endTime > s.startTime) {
              return {
                hasConflict: true,
                message: `Conflicto de horario: ${profName} ya tiene una clase asignada en "${sub.name}" los mismos días de ${s.startTime} a ${s.endTime}.`
              };
            }
          }
        }
      }
    }

    return { hasConflict: false };
  },

  getTodayClasses(subjects: AcademicSubject[], dateStr: string) {
    const resolvedSessions = this.getAllSessionsForDate(subjects, dateStr);
    return resolvedSessions.map(ses => {
      const subject = subjects.find(s => s.id === ses.subjectId) || {
        id: ses.subjectId,
        name: ses.subjectName,
        color: ses.subjectColor,
        professor: ses.professorName,
        classroom: ses.classroom
      } as AcademicSubject;

      return {
        subject,
        session: {
          id: ses.id,
          day: getDayOfWeekNumber(dateStr),
          startTime: ses.startTime,
          endTime: ses.endTime,
          classroom: ses.classroom,
          professorId: ses.professorId,
          professorName: ses.professorName
        }
      };
    });
  },

  getUpcomingEvaluations(subjects: AcademicSubject[], limit: number = 5) {
    const today = new Date().toISOString().split('T')[0];
    const evals: Array<{ subjectName: string; subjectColor: string; activity: any; cutName: string }> = [];

    subjects.forEach(sub => {
      sub.cuts?.forEach(cut => {
        cut.activities.forEach(act => {
          const isGraded = act.grade !== undefined && act.grade !== null && !isNaN(Number(act.grade)) && String(act.grade).trim() !== '';
          if (act.date >= today && !isGraded) {
            evals.push({
              subjectName: sub.name,
              subjectColor: sub.color,
              activity: act,
              cutName: cut.cutName
            });
          }
        });
      });
    });

    evals.sort((a, b) => a.activity.date.localeCompare(b.activity.date));
    return evals.slice(0, limit);
  },

  getGroupedEvaluations(subjects: AcademicSubject[], todayStr: string) {
    const todayMs = new Date(todayStr + 'T00:00:00').getTime();
    const items: EvaluationItem[] = [];

    subjects.forEach(sub => {
      sub.cuts?.forEach(cut => {
        cut.activities.forEach(act => {
          const isGraded = act.grade !== undefined && act.grade !== null && !isNaN(Number(act.grade)) && String(act.grade).trim() !== '';
          if (!isGraded) {
            const actMs = new Date(act.date + 'T00:00:00').getTime();
            const daysDiff = Math.round((actMs - todayMs) / (1000 * 60 * 60 * 24));
            
            items.push({
              subjectId: sub.id,
              cutId: cut.id,
              activityId: act.id,
              subjectName: sub.name,
              subjectColor: sub.color,
              cutName: cut.cutName,
              activityName: act.name,
              activityType: act.type,
              activityDate: act.date,
              weightPercent: act.weightPercent,
              status: act.status,
              daysDiff
            });
          }
        });
      });
    });

    items.sort((a, b) => a.activityDate.localeCompare(b.activityDate));

    const today = items.filter(i => i.daysDiff === 0);
    const tomorrow = items.filter(i => i.daysDiff === 1);
    const thisWeek = items.filter(i => i.daysDiff >= 2 && i.daysDiff <= 7);
    const later = items.filter(i => i.daysDiff > 7 || i.daysDiff < 0);

    return { today, tomorrow, thisWeek, later, total: items.length };
  },

  getAcademicGoalMessage(subjects: AcademicSubject[], targetGrade: number = 4.0): string {
    if (!subjects || subjects.length === 0) {
      return "Registra tus materias y cortes para calcular tu objetivo académico dinámico.";
    }

    for (const sub of subjects) {
      const progress = this.calculateSubjectProgress(sub);
      const { requiredGrade, remainingWeight, achievable } = this.calculateRequiredGradeToPass(sub, targetGrade);

      if (remainingWeight > 0) {
        if (achievable && requiredGrade > 0) {
          const reqStr = formatGrade(requiredGrade);
          const targetStr = formatGrade(targetGrade);
          return `Necesitas promedio ${reqStr} en las evaluaciones restantes de "${sub.name}" para alcanzar ${targetStr}.`;
        } else if (!achievable) {
          const passReq = this.calculateRequiredGradeToPass(sub, 3.0);
          if (passReq.achievable) {
            const reqStr = formatGrade(passReq.requiredGrade);
            const passStr = formatGrade(3.0);
            return `En "${sub.name}" necesitas promedio ${reqStr} en lo restante para aprobar con ${passStr}.`;
          }
        }
      }
    }

    const avgGPA = this.calculateSemesterGPA(subjects[0]?.semesterId || '', subjects);
    if (avgGPA > 0) {
      return `Tu promedio acumulado actual del semestre es ${formatGrade(avgGPA)}. ¡Buen trabajo!`;
    }

    return "Ingresa las notas de tus actividades para calcular los promedios y metas de aprobación.";
  },

  getSubjectStatus(subject: AcademicSubject): { status: 'Aprobada' | 'En Riesgo' | 'En Cursado'; average: number; notaAcumulada: number; hasGrades: boolean } {
    const progress = this.calculateSubjectProgress(subject);
    return {
      status: progress.status,
      average: progress.promedioAcumuladoEvaluado,
      notaAcumulada: progress.notaAcumuladaMateria,
      hasGrades: progress.hasGrades
    };
  },

  getActivityTypeIcon(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('laboratorio')) return '🧪';
    if (t.includes('salida') || t.includes('campo')) return '🚌';
    if (t.includes('conferencia') || t.includes('seminario') || t.includes('exposición') || t.includes('exposicion')) return '🎤';
    if (t.includes('tutoría') || t.includes('tutoria') || t.includes('asesoría') || t.includes('asesoria')) return '👨‍🏫';
    if (t.includes('documento') || t.includes('entrega') || t.includes('informe')) return '📄';
    if (t.includes('clase') || t.includes('práctica') || t.includes('practica')) return '🏫';
    if (t.includes('inscripción') || t.includes('inscripcion') || t.includes('reunión') || t.includes('reunion')) return '📅';
    return '📅';
  },

  getUpcomingAcademicActivities(subjects: AcademicSubject[], limit: number = 10) {
    const today = new Date().toISOString().split('T')[0];
    const items: Array<{ subject: AcademicSubject; activity: any }> = [];

    subjects.forEach(sub => {
      sub.academicActivities?.forEach(act => {
        if (act.date >= today && act.status !== 'Cancelada' && act.status !== 'Realizada') {
          items.push({ subject: sub, activity: act });
        }
      });
    });

    items.sort((a, b) => {
      const dComp = a.activity.date.localeCompare(b.activity.date);
      if (dComp !== 0) return dComp;
      return (a.activity.startTime || '00:00').localeCompare(b.activity.startTime || '00:00');
    });

    return items.slice(0, limit);
  }
};

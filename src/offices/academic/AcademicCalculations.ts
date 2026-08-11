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
  professors?: Array<{ id: string; name: string; title?: string }>;
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

export interface ActivityProgressResult {
  activityId: string;
  activityName: string;
  activityType: string;
  date: string;
  grade?: number;
  isGraded: boolean;
  weightPercentInProf: number;  // e.g. 50% (peso dentro del profesor)
  aporteToProf: number;         // grade * (weightPercentInProf / 100) (e.g. 1.90)
  profWeightInCut: number;      // e.g. 60% or 100% (peso del profesor en el corte)
  aporteToCut: number;          // aporteToProf * (profWeightInCut / 100) (e.g. 1.14)
  cutWeightInSubject: number;   // e.g. 30% (peso del corte en la materia)
  aporteToSubject: number;      // aporteToCut * (cutWeightInSubject / 100) (e.g. 0.342)
  materiaEvaluadaPercent: number; // % de la materia que representa esta actividad (e.g. 15%)
  professorId?: string;
  professorName?: string;
}

export interface ProfessorProgressResult {
  professorId: string;
  professorName: string;
  weightPercentInCut: number;     // e.g. 60% or 100%
  activitiesProgress: ActivityProgressResult[];
  totalActivitiesCount: number;
  gradedActivitiesCount: number;
  totalActivityWeightAssigned: number; // Sum of activity weights in prof
  evaluatedWeightPercentInProf: number; // Sum of graded activity weights in prof
  grade: number;                  // Sum of activity.aporteToProf (e.g. 4.15)
  aporteToCut: number;            // grade * (weightPercentInCut / 100) (e.g. 2.49)
  maxAporteToCut: number;         // 5.0 * (weightPercentInCut / 100) (e.g. 3.0)
  evaluatedWeightInCut: number;   // (evaluatedWeightPercentInProf / 100) * weightPercentInCut
}

export interface CutProgressResult {
  cutId: string;
  cutName: string;
  cutWeightPercent: number; // Weight within the subject (e.g. 30%)
  
  professorsProgress: ProfessorProgressResult[];
  activities: AcademicEvaluationActivity[];
  totalActivitiesCount: number;
  gradedActivitiesCount: number;
  
  totalActivityWeightAssigned: number; // Average or overall weight assigned
  evaluatedWeightPercent: number;     // % of the cut evaluated so far (0 - 100%)
  pendingWeightPercent: number;       // % of the cut pending evaluation
  
  accumulatedCutGrade: number;        // Grade of the corte = Sum of professor.aporteToCut
  aporteSubject: number;              // accumulatedCutGrade * (cutWeightPercent / 100)
  maxAporteSubject: number;           // 5.0 * (cutWeightPercent / 100)
  materiaEvaluadaPercent: number;     // cutWeightPercent * (evaluatedWeightPercent / 100)
  
  status: 'finalizado' | 'en_progreso' | 'sin_evaluar';
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'slate';
  
  activitiesDistribution: DistributionMetric;
  professorsDistribution?: DistributionMetric;
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
   * Calculates progressive corte metrics dynamically in real-time strictly following:
   * Actividad → Profesor → Corte → Materia
   */
  calculateCutProgress(cut: AcademicCut): CutProgressResult {
    const activities = cut.activities || [];
    const cutWeight = Number(cut.cutWeightPercent) || 0;
    
    // Determine professors for this cut
    const cutProfs = (cut.professors && cut.professors.length > 0)
      ? cut.professors
      : [{ id: 'default_prof', name: 'Profesor Principal', weightPercent: 100 }];

    const professorsProgress: ProfessorProgressResult[] = cutProfs.map(prof => {
      const profWeightInCut = Number(prof.weightPercent) || 100;
      
      // Filter activities assigned to this professor
      const profActivities = (cutProfs.length === 1)
        ? activities
        : activities.filter(a => a.professorId === prof.id || a.professorId === prof.professorId || (!a.professorId && prof.id === cutProfs[0].id));

      let totalActivityWeightAssigned = 0;
      let evaluatedWeightPercentInProf = 0;
      let profGrade = 0;
      let gradedActivitiesCount = 0;

      const activitiesProgress: ActivityProgressResult[] = profActivities.map(act => {
        const wInProf = Number(act.weightPercent) || 0;
        totalActivityWeightAssigned += wInProf;

        const isGraded = act.grade !== undefined && act.grade !== null && !isNaN(Number(act.grade)) && String(act.grade).trim() !== '';
        const g = isGraded ? Number(act.grade) : 0;

        if (isGraded) {
          gradedActivitiesCount++;
          evaluatedWeightPercentInProf += wInProf;
        }

        // Aporte a la nota del profesor = nota * (peso_actividad / 100)
        const aporteToProf = isGraded ? (g * wInProf) / 100 : 0;
        profGrade += aporteToProf;

        // Aporte al corte = aporte_profesor * (peso_profesor_en_corte / 100)
        const aporteToCut = (aporteToProf * profWeightInCut) / 100;

        // Aporte a la materia = aporte_corte * (peso_corte_en_materia / 100)
        const aporteToSubject = (aporteToCut * cutWeight) / 100;

        // Porcentaje de la materia evaluado por esta actividad
        const materiaEvaluadaPercent = isGraded ? (wInProf / 100) * (profWeightInCut / 100) * cutWeight : 0;

        return {
          activityId: act.id,
          activityName: act.name,
          activityType: act.type,
          date: act.date,
          grade: isGraded ? g : undefined,
          isGraded,
          weightPercentInProf: wInProf,
          aporteToProf,
          profWeightInCut,
          aporteToCut,
          cutWeightInSubject: cutWeight,
          aporteToSubject,
          materiaEvaluadaPercent,
          professorId: prof.id,
          professorName: prof.name
        };
      });

      const aporteToCut = (profGrade * profWeightInCut) / 100;
      const maxAporteToCut = (5.0 * profWeightInCut) / 100;
      const evaluatedWeightInCut = (evaluatedWeightPercentInProf / 100) * profWeightInCut;

      return {
        professorId: prof.id,
        professorName: prof.name,
        weightPercentInCut: profWeightInCut,
        activitiesProgress,
        totalActivitiesCount: profActivities.length,
        gradedActivitiesCount,
        totalActivityWeightAssigned,
        evaluatedWeightPercentInProf,
        grade: profGrade,
        aporteToCut,
        maxAporteToCut,
        evaluatedWeightInCut
      };
    });

    // Aggregations across professors inside the cut
    const totalActivitiesCount = activities.length;
    const gradedActivitiesCount = professorsProgress.reduce((acc, p) => acc + p.gradedActivitiesCount, 0);
    const totalActivityWeightAssigned = Math.round(
      (professorsProgress.reduce((acc, p) => acc + p.totalActivityWeightAssigned, 0) / Math.max(1, professorsProgress.length)) * 10
    ) / 10;

    const evaluatedWeightPercent = Math.round(
      professorsProgress.reduce((acc, p) => acc + p.evaluatedWeightInCut, 0) * 10
    ) / 10;

    const pendingWeightPercent = Math.max(0, Math.round((100 - evaluatedWeightPercent) * 10) / 10);
    const accumulatedCutGrade = professorsProgress.reduce((acc, p) => acc + p.aporteToCut, 0);
    const aporteSubject = accumulatedCutGrade * (cutWeight / 100);
    const maxAporteSubject = 5.0 * (cutWeight / 100);
    const materiaEvaluadaPercent = Math.round((cutWeight * (evaluatedWeightPercent / 100)) * 100) / 100;

    const activitiesDistribution = this.getActivitiesDistribution(activities);

    const isAllGraded = activities.length > 0 && gradedActivitiesCount === activities.length;
    const is100PercentAssigned = Math.abs(evaluatedWeightPercent - 100) < 0.1;

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
      professorsProgress,
      activities,
      totalActivitiesCount,
      gradedActivitiesCount,
      totalActivityWeightAssigned,
      evaluatedWeightPercent,
      pendingWeightPercent,
      accumulatedCutGrade,
      aporteSubject,
      maxAporteSubject,
      materiaEvaluadaPercent,
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
   *  Porcentaje evaluado de la materia = Σ (Materia evaluada % de cada corte).
   *  Promedio acumulado (sobre lo evaluado) = Nota acumulada / (Porcentaje total evaluado / 100).
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
      porcentajeEvaluadoMateria += cp.materiaEvaluadaPercent;
      
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
    if (subject.cancelledClassDates?.includes(dateStr)) {
      return [];
    }

    const dayNum = getDayOfWeekNumber(dateStr); // 1 = Lunes, 7 = Domingo
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

    // Helper to resolve professor(s) for a given session slot on dateStr and dayNum
    const resolveProfessorsForSessionSlot = (slotDayNum: number, ruleProfId?: string, ruleProfIds?: string[]): { id: string; name: string; title: string }[] => {
      // 1. Check if there are specific day professor assignments in subject.professors covering dateStr & matching slotDayNum
      const specificDayProfs = professors.filter(p => {
        if (p.assignmentMode !== 'specific_day' && !p.assignedDayOfWeek) return false;
        const targetDay = p.assignedDayOfWeek || 1;
        if (targetDay !== slotDayNum) return false;

        // Check date validity
        if (p.startDate && p.endDate) {
          return p.startDate <= dateStr && dateStr <= p.endDate;
        }
        if (p.startDate) {
          return p.startDate <= dateStr;
        }
        if (p.endDate) {
          return dateStr <= p.endDate;
        }
        return true;
      });

      if (specificDayProfs.length > 0) {
        return specificDayProfs.map(p => ({ id: p.id, name: p.name, title: p.title || '' }));
      }

      // 1B. Check specific day schedule rules in subject.schedules
      const specificDayRules = schedules.filter(s => {
        if (!s.daysOfWeek || s.daysOfWeek.length === 0) return false;
        if (!s.daysOfWeek.includes(slotDayNum)) return false;
        const isValidDate = (!s.startDate || s.startDate <= dateStr) && (!s.endDate || dateStr <= s.endDate);
        if (!isValidDate) return false;
        return s.type === 'period_override' || (s.daysOfWeek.length === 1 && s.daysOfWeek[0] === slotDayNum);
      });

      const ruleProfsFromSpec: { id: string; name: string; title: string }[] = [];
      specificDayRules.forEach(r => {
        if (r.professorIds && r.professorIds.length > 0) {
          r.professorIds.forEach(id => ruleProfsFromSpec.push(getProfInfo(id, r.professorName)));
        } else if (r.professorId) {
          ruleProfsFromSpec.push(getProfInfo(r.professorId, r.professorName));
        }
      });
      if (ruleProfsFromSpec.length > 0) {
        return ruleProfsFromSpec;
      }

      // 2. Check "all_classes" professor assignments in subject.professors covering dateStr
      const allClassesProfs = professors.filter(p => {
        if (p.assignmentMode === 'specific_day' || p.assignedDayOfWeek) return false;
        if (p.startDate && p.endDate) {
          return p.startDate <= dateStr && dateStr <= p.endDate;
        }
        if (p.startDate) {
          return p.startDate <= dateStr;
        }
        if (p.endDate) {
          return dateStr <= p.endDate;
        }
        return true;
      });

      if (allClassesProfs.length > 0) {
        return allClassesProfs.map(p => ({ id: p.id, name: p.name, title: p.title || '' }));
      }

      // 3. Check general period overrides in schedules
      const periodOverrides = schedules.filter(
        s => s.type === 'period_override' && (!s.startDate || s.startDate <= dateStr) && (!s.endDate || dateStr <= s.endDate)
      );
      if (periodOverrides.length > 0) {
        const lastOverride = periodOverrides[periodOverrides.length - 1];
        if (lastOverride.professorIds && lastOverride.professorIds.length > 0) {
          return lastOverride.professorIds.map(id => getProfInfo(id, lastOverride.professorName));
        }
        if (lastOverride.professorId) {
          return [getProfInfo(lastOverride.professorId, lastOverride.professorName)];
        }
      }

      // 4. Rule explicitly provided profs
      if (ruleProfIds && ruleProfIds.length > 0) {
        return ruleProfIds.map(id => getProfInfo(id));
      }
      if (ruleProfId) {
        return [getProfInfo(ruleProfId)];
      }

      // 5. Default fallback to subject's first professor or summary string
      if (professors.length > 0) {
        return [{ id: professors[0].id, name: professors[0].name, title: professors[0].title || '' }];
      }

      return [{ id: 'prof_default', name: subject.professor || 'Profesor por asignar', title: '' }];
    };

    const rawSessions: ResolvedAcademicSession[] = [];

    // 2. Candidate rules for dateStr
    // A) Single date rules on dateStr
    const singleDateRules = schedules.filter(
      s => s.type === 'single_date' &&
           (s.date === dateStr || s.startDate === dateStr) &&
           !s.cancelledDates?.includes(dateStr)
    );

    // B) Recurring rules covering dateStr and matching dayNum
    const recurringRules = schedules.filter(
      s => s.type === 'recurring' &&
           s.startDate <= dateStr &&
           dateStr <= s.endDate &&
           s.daysOfWeek?.includes(dayNum) &&
           !s.cancelledDates?.includes(dateStr)
    );

    // Process single date rules
    singleDateRules.forEach(rule => {
      const ruleProfs = resolveProfessorsForSessionSlot(dayNum, rule.professorId, rule.professorIds);
      const summaryProfName = ruleProfs.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(' + ');

      rawSessions.push({
        id: `ses_sd_${subject.id}_${rule.id}_${dateStr}`,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color || '#3B82F6',
        classroom: rule.classroom || subject.classroom,
        modality: rule.modality || 'presencial',
        date: dateStr,
        startTime: rule.startTime || '08:00',
        endTime: rule.endTime || '10:00',
        professorId: ruleProfs[0]?.id || 'prof_default',
        professorName: summaryProfName,
        professorTitle: ruleProfs[0]?.title || '',
        professors: ruleProfs,
        scheduleId: rule.id,
        scheduleType: 'single_date',
        notes: rule.notes
      });
    });

    // Process recurring rules
    recurringRules.forEach(rule => {
      const ruleProfs = resolveProfessorsForSessionSlot(dayNum, rule.professorId, rule.professorIds);
      const summaryProfName = ruleProfs.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(' + ');

      rawSessions.push({
        id: `ses_rec_${subject.id}_${rule.id}_${dateStr}`,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color || '#3B82F6',
        classroom: rule.classroom || subject.classroom,
        modality: rule.modality || 'presencial',
        date: dateStr,
        startTime: rule.startTime || '08:00',
        endTime: rule.endTime || '10:00',
        professorId: ruleProfs[0]?.id || 'prof_default',
        professorName: summaryProfName,
        professorTitle: ruleProfs[0]?.title || '',
        professors: ruleProfs,
        scheduleId: rule.id,
        scheduleType: 'recurring',
        notes: rule.notes
      });
    });

    // Base timetable: Process scheduleSessions if defined on subject
    if (subject.scheduleSessions && subject.scheduleSessions.length > 0) {
      subject.scheduleSessions.forEach(ses => {
        if (ses.day === dayNum) {
          const ruleProfs = resolveProfessorsForSessionSlot(dayNum, ses.professorId);
          const summaryProfName = ruleProfs.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(' + ');

          rawSessions.push({
            id: `ses_leg_${subject.id}_${ses.id}_${dateStr}`,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color || '#3B82F6',
            classroom: ses.classroom || subject.classroom,
            modality: 'presencial',
            date: dateStr,
            startTime: ses.startTime,
            endTime: ses.endTime,
            professorId: ruleProfs[0]?.id || 'prof_default',
            professorName: summaryProfName,
            professorTitle: ruleProfs[0]?.title || '',
            professors: ruleProfs,
            scheduleId: ses.id,
            scheduleType: 'legacy'
          });
        }
      });
    }

    // GROUP & MERGE SESSIONS AT THE EXACT SAME TIME SLOT FOR A SINGLE CLASS EVENT
    const mergedMap = new Map<string, ResolvedAcademicSession>();

    rawSessions.forEach(ses => {
      const timeKey = `${ses.startTime}_${ses.endTime}`;
      if (mergedMap.has(timeKey)) {
        const existing = mergedMap.get(timeKey)!;
        const existingProfs = existing.professors || [];
        const existingProfIds = new Set(existingProfs.map(p => p.id));

        (ses.professors || []).forEach(p => {
          if (!existingProfIds.has(p.id)) {
            existingProfs.push(p);
            existingProfIds.add(p.id);
          }
        });

        existing.professors = existingProfs;
        existing.professorName = existingProfs.map(p => `${p.title ? p.title + ' ' : ''}${p.name}`).join(' + ');
        existing.professorId = existingProfs[0]?.id || '';
        existing.professorTitle = existingProfs[0]?.title || '';
        if (ses.classroom && !existing.classroom) {
          existing.classroom = ses.classroom;
        }
      } else {
        mergedMap.set(timeKey, { ...ses, professors: [...(ses.professors || [])] });
      }
    });

    return Array.from(mergedMap.values());
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

      const isActiveByProfDate = prof.startDate && prof.endDate ? (prof.startDate <= todayStr && todayStr <= prof.endDate) : false;
      const isPastByProfDate = prof.endDate ? (prof.endDate < todayStr) : false;
      const isUpcomingByProfDate = prof.startDate ? (prof.startDate > todayStr) : false;

      const isActive = isActiveByProfDate || profSchedules.some(s => {
        if (s.type === 'single_date') return (s.date || s.startDate) === todayStr;
        return s.startDate <= todayStr && todayStr <= s.endDate;
      });

      const isPast = (isPastByProfDate && profSchedules.length === 0) || (profSchedules.length > 0 && profSchedules.every(s => {
        if (s.type === 'single_date') return (s.date || s.startDate || '') < todayStr;
        return s.endDate < todayStr;
      }));

      const isUpcoming = isUpcomingByProfDate || (profSchedules.length > 0 && profSchedules.some(s => {
        if (s.type === 'single_date') return (s.date || s.startDate || '') > todayStr;
        return s.startDate > todayStr;
      }));

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
        // Skip same subject - co-teaching or multi-professor schedule rules in same subject are allowed
        if (sub.id === subject.id) continue;

        for (const s of (sub.schedules || [])) {
          if (s.id === newRule.id) continue;
          
          // Check if professor is involved in rule s
          const isSameProf = s.professorId === profId || (s.professorIds && s.professorIds.includes(profId));
          if (!isSameProf) continue;
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
      average: progress.notaAcumuladaMateria,
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

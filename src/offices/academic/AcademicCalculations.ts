import { AcademicSubject, AcademicSemester, AcademicCut, AcademicEvaluationActivity } from '../../types/store';
import { getDayOfWeekNumber } from '../../utils/dates';

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
    accumulatedCutGrade = Math.round(accumulatedCutGrade * 100) / 100;
    
    const pendingWeightPercent = Math.max(0, Math.round((100 - evaluatedWeightPercent) * 10) / 10);
    const aporteSubject = Math.round((accumulatedCutGrade * (cutWeight / 100)) * 100) / 100;
    const maxAporteSubject = Math.round((5.0 * (cutWeight / 100)) * 100) / 100;
    
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

    notaAcumuladaMateria = Math.round(notaAcumuladaMateria * 100) / 100;
    porcentajeEvaluadoMateria = Math.round(porcentajeEvaluadoMateria * 10) / 10;
    
    const promedioAcumuladoEvaluado = porcentajeEvaluadoMateria > 0
      ? Math.round((notaAcumuladaMateria / (porcentajeEvaluadoMateria / 100)) * 100) / 100
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

    return counted > 0 ? Math.round((totalSum / counted) * 100) / 100 : 0;
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

    return counted > 0 ? Math.round((totalSum / counted) * 100) / 100 : null;
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
      requiredGrade: Math.max(0, Math.round(requiredGrade * 100) / 100),
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

  getTodayClasses(subjects: AcademicSubject[], dateStr: string) {
    const dayNum = getDayOfWeekNumber(dateStr);
    const result: Array<{ subject: AcademicSubject; session: any }> = [];

    subjects.forEach(sub => {
      sub.scheduleSessions?.forEach(ses => {
        if (ses.day === dayNum) {
          result.push({ subject: sub, session: ses });
        }
      });
    });

    result.sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));
    return result;
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
          const reqStr = requiredGrade.toFixed(2);
          return `Necesitas promedio ${reqStr} en las evaluaciones restantes de "${sub.name}" para alcanzar ${targetGrade.toFixed(1)}.`;
        } else if (!achievable) {
          const passReq = this.calculateRequiredGradeToPass(sub, 3.0);
          if (passReq.achievable) {
            const reqStr = passReq.requiredGrade.toFixed(2);
            return `En "${sub.name}" necesitas promedio ${reqStr} en lo restante para aprobar con 3.0.`;
          }
        }
      }
    }

    const avgGPA = this.calculateSemesterGPA(subjects[0]?.semesterId || '', subjects);
    if (avgGPA > 0) {
      return `Tu promedio acumulado actual del semestre es ${avgGPA.toFixed(2)}. ¡Buen trabajo!`;
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

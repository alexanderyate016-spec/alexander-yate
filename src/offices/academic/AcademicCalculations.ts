import { AcademicSubject, AcademicSemester } from '../../types/store';
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
  status: 'pending' | 'graded';
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
    let statusMessage = "Distribución completa.";
    let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

    if (isExcess) {
      status = 'excess';
      statusMessage = "Los cortes superan el 100%. Debes corregir la distribución.";
      statusColor = 'rose';
    } else if (isDeficit) {
      status = 'deficit';
      statusMessage = "Falta distribuir el porcentaje restante.";
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
    let statusMessage = "Configuración completa ✓";
    let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

    if (isExcess) {
      status = 'excess';
      statusMessage = "Las actividades superan el 100%. Debes corregir la distribución.";
      statusColor = 'rose';
    } else if (isDeficit) {
      status = 'deficit';
      statusMessage = "Falta distribuir el porcentaje restante.";
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
  calculateSubjectAverage(subject: AcademicSubject): { average: number; totalGradedWeight: number; hasGrades: boolean } {
    if (!subject.cuts || subject.cuts.length === 0) {
      return { average: 0, totalGradedWeight: 0, hasGrades: false };
    }

    let weightedSum = 0;
    let totalGradedWeight = 0;

    subject.cuts.forEach(cut => {
      cut.activities.forEach(act => {
        if (act.status === 'graded' && act.grade !== undefined && act.grade !== null) {
          const effWeight = (cut.cutWeightPercent * act.weightPercent) / 100;
          weightedSum += act.grade * effWeight;
          totalGradedWeight += effWeight;
        }
      });
    });

    if (totalGradedWeight === 0) {
      return { average: 0, totalGradedWeight: 0, hasGrades: false };
    }

    const average = weightedSum / totalGradedWeight;
    return { average, totalGradedWeight, hasGrades: true };
  },

  calculateSemesterGPA(activeSemesterId: string, subjects: AcademicSubject[]): number {
    const activeSubjects = subjects.filter(s => s.semesterId === activeSemesterId);
    if (activeSubjects.length === 0) return 0;

    let totalSum = 0;
    let counted = 0;

    activeSubjects.forEach(sub => {
      const { average, hasGrades } = this.calculateSubjectAverage(sub);
      if (hasGrades) {
        totalSum += average;
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
      const { average, hasGrades } = this.calculateSubjectAverage(sub);
      if (hasGrades) {
        totalSum += average;
        counted++;
      }
    });

    return counted > 0 ? totalSum / counted : null;
  },

  calculateRequiredGradeToPass(subject: AcademicSubject, targetGrade: number = 3.0): { requiredGrade: number; remainingWeight: number; achievable: boolean } {
    const { average, totalGradedWeight } = this.calculateSubjectAverage(subject);
    const remainingWeight = 100 - totalGradedWeight;

    if (remainingWeight <= 0) {
      return { requiredGrade: 0, remainingWeight: 0, achievable: average >= targetGrade };
    }

    const neededPoints = (targetGrade * 100) - (average * totalGradedWeight);
    const requiredGrade = neededPoints / remainingWeight;

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
          if (act.date >= today && act.status === 'pending') {
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
          if (act.status === 'pending') {
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

    // Find the subject with pending evaluations closest to target
    let bestGoal = "";
    for (const sub of subjects) {
      const { average, totalGradedWeight, hasGrades } = this.calculateSubjectAverage(sub);
      const { requiredGrade, remainingWeight, achievable } = this.calculateRequiredGradeToPass(sub, targetGrade);

      if (remainingWeight > 0) {
        if (achievable && requiredGrade > 0) {
          const reqStr = (Math.round(requiredGrade * 10) / 10).toFixed(1);
          bestGoal = `Necesitas ${reqStr} en la próxima evaluación de "${sub.name}" para terminar la materia con ${targetGrade.toFixed(1)}.`;
          break;
        } else if (!achievable) {
          const passReq = this.calculateRequiredGradeToPass(sub, 3.0);
          if (passReq.achievable) {
            const reqStr = (Math.round(passReq.requiredGrade * 10) / 10).toFixed(1);
            bestGoal = `En "${sub.name}" necesitas ${reqStr} en lo restante para aprobar con 3.0.`;
            break;
          }
        }
      }
    }

    if (!bestGoal) {
      // General GPA status message
      const avgGPA = this.calculateSemesterGPA(subjects[0]?.semesterId || '', subjects);
      if (avgGPA > 0) {
        bestGoal = `Tu promedio actual del semestre es ${avgGPA.toFixed(2)}. Mantén el rendimiento para alcanzar tus metas.`;
      } else {
        bestGoal = "Ingresa las notas de tus actividades para calcular los promedios y metas de aprobación.";
      }
    }

    return bestGoal;
  },

  getSubjectStatus(subject: AcademicSubject): { status: 'Aprobada' | 'En Riesgo' | 'En Cursado'; average: number; hasGrades: boolean } {
    const { average, totalGradedWeight, hasGrades } = this.calculateSubjectAverage(subject);
    if (!hasGrades) {
      return { status: 'En Cursado', average: 0, hasGrades: false };
    }
    if (average >= 3.0) {
      return { status: 'Aprobada', average, hasGrades: true };
    }
    return { status: 'En Riesgo', average, hasGrades: true };
  }
};

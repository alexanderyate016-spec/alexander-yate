import { AcademicSubject, AcademicSemester } from '../../types/store';
import { getDayOfWeekNumber } from '../../utils/dates';

export const AcademicCalculations = {
  calculateSubjectAverage(subject: AcademicSubject): { average: number; totalGradedWeight: number; hasGrades: boolean } {
    if (!subject.cuts || subject.cuts.length === 0) {
      return { average: 0, totalGradedWeight: 0, hasGrades: false };
    }

    let weightedSum = 0;
    let totalGradedWeight = 0;

    subject.cuts.forEach(cut => {
      cut.activities.forEach(act => {
        if (act.status === 'graded' && act.grade !== undefined && act.grade !== null) {
          // Weight of this activity relative to the subject overall = (cut.cutWeightPercent / 100) * (act.weightPercent / 100)
          // Simplified: cut.cutWeightPercent * (act.weightPercent / 100)
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

    // Needed total points = targetGrade * 100
    // Current points accumulated = average * totalGradedWeight
    // Needed remaining points = (targetGrade * 100) - (average * totalGradedWeight)
    const neededPoints = (targetGrade * 100) - (average * totalGradedWeight);
    const requiredGrade = neededPoints / remainingWeight;

    return {
      requiredGrade: Math.max(0, requiredGrade),
      remainingWeight,
      achievable: requiredGrade <= 5.0
    };
  },

  getTodayClasses(subjects: AcademicSubject[], dateStr: string) {
    const dayNum = getDayOfWeekNumber(dateStr);
    const result: Array<{ subject: AcademicSubject; session: any }> = [];

    subjects.forEach(sub => {
      sub.scheduleSessions.forEach(ses => {
        if (ses.day === dayNum) {
          result.push({ subject: sub, session: ses });
        }
      });
    });

    // Sort by startTime
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
  }
};

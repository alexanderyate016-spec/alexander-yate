import { storeInstance } from '../../store/CasaBlancaStore';

export interface DetectedDayEvent {
  id: string;
  sourceOffice: 'academica' | 'vidaDiaria' | 'financiera' | 'vidaSocial' | 'medica' | 'jefatura';
  officeLabel: string;
  type: 'class' | 'practice' | 'exam' | 'task' | 'appointment' | 'medical_exam' | 'commitment' | 'habit' | 'objective' | 'time_plan' | 'financial_tx';
  title: string;
  categoryLabel?: string;
  time?: string;
  icon: string;
  details?: string;
  status?: string;
  rawObject?: any;
}

export interface DayContextSummary {
  date: string;
  hasEvents: boolean;
  classes: DetectedDayEvent[];
  practices: DetectedDayEvent[];
  exams: DetectedDayEvent[];
  tasks: DetectedDayEvent[];
  appointments: DetectedDayEvent[];
  commitments: DetectedDayEvent[];
  habits: DetectedDayEvent[];
  objectives: DetectedDayEvent[];
  timePlans: DetectedDayEvent[];
  financialTxs: DetectedDayEvent[];
  otherEvents: DetectedDayEvent[];
  totalEventsCount: number;
  highlightPrompt: string;
  highlightEmoji: string;
}

export const DayContextDetector = {
  getContextForDate(dateStr: string): DayContextSummary {
    const offices = storeInstance.getState().offices;

    const classes: DetectedDayEvent[] = [];
    const practices: DetectedDayEvent[] = [];
    const exams: DetectedDayEvent[] = [];
    const tasks: DetectedDayEvent[] = [];
    const appointments: DetectedDayEvent[] = [];
    const commitments: DetectedDayEvent[] = [];
    const habits: DetectedDayEvent[] = [];
    const objectives: DetectedDayEvent[] = [];
    const timePlans: DetectedDayEvent[] = [];
    const financialTxs: DetectedDayEvent[] = [];
    const otherEvents: DetectedDayEvent[] = [];

    // Date calculations for schedules (1 = Monday ... 7 = Sunday)
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const jsDay = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
    const dayOfWeekNumber = jsDay === 0 ? 7 : jsDay;

    // 1. ACADÉMICA
    if (offices.academica) {
      // Subjects and schedule
      (offices.academica.subjects || []).forEach(subject => {
        if (subject.isActive === false) return;

        // Schedules check if present or basic day match
        if (subject.schedules) {
          subject.schedules.forEach((sch: any) => {
            const matchesDay = sch.daysOfWeek?.includes(dayOfWeekNumber) || sch.day === dayOfWeekNumber;
            const inDateRange = (!sch.startDate || sch.startDate <= dateStr) && (!sch.endDate || sch.endDate >= dateStr);
            const notCancelled = !sch.cancelledDates?.includes(dateStr);

            if (matchesDay && inDateRange && notCancelled) {
              classes.push({
                id: `cls_${subject.id}_${sch.id || sch.day}`,
                sourceOffice: 'academica',
                officeLabel: 'Oficina Académica',
                type: 'class',
                title: subject.name,
                categoryLabel: 'Clase Regular',
                time: sch.startTime ? `${sch.startTime}${sch.endTime ? ' - ' + sch.endTime : ''}` : undefined,
                icon: '📚',
                details: subject.classroom ? `Aula: ${subject.classroom}` : (subject.professor ? `Prof: ${subject.professor}` : undefined)
              });
            }
          });
        }

        // Evaluations & Exams in Cuts
        (subject.cuts || []).forEach((cut: any) => {
          (cut.activities || []).forEach((act: any) => {
            if (act.date === dateStr) {
              const isExamType = ['Parcial', 'Quiz', 'Examen', 'Laboratorio', 'Proyecto'].includes(act.type);
              const eventItem: DetectedDayEvent = {
                id: act.id,
                sourceOffice: 'academica',
                officeLabel: 'Oficina Académica',
                type: isExamType ? 'exam' : 'task',
                title: `${act.name} (${subject.name})`,
                categoryLabel: act.type || 'Evaluación',
                time: act.time || act.startTime,
                icon: isExamType ? '📝' : '📄',
                details: act.description || (act.weightPercent ? `Valor: ${act.weightPercent}%` : undefined),
                status: act.status
              };
              if (isExamType) {
                exams.push(eventItem);
              } else {
                tasks.push(eventItem);
              }
            }
          });
        });
      });

      // Special Academic Activities (Prácticas, Salidas, etc.)
      (offices.academica.academicActivities || []).forEach((act: any) => {
        if (act.date === dateStr) {
          const isPractice = ['Práctica', 'Salida de campo', 'Laboratorio'].includes(act.type);
          const eventItem: DetectedDayEvent = {
            id: act.id,
            sourceOffice: 'academica',
            officeLabel: 'Oficina Académica',
            type: isPractice ? 'practice' : 'class',
            title: act.name,
            categoryLabel: act.type,
            time: act.startTime ? `${act.startTime}${act.endTime ? ' - ' + act.endTime : ''}` : undefined,
            icon: isPractice ? '🎓' : '🏫',
            details: act.location ? `Lugar: ${act.location}` : act.description,
            status: act.status
          };
          if (isPractice) {
            practices.push(eventItem);
          } else {
            classes.push(eventItem);
          }
        }
      });
    }

    // 2. VIDA DIARIA
    if (offices.vidaDiaria) {
      // Tasks
      (offices.vidaDiaria.tasks || []).forEach(t => {
        if (t.date === dateStr) {
          tasks.push({
            id: t.id,
            sourceOffice: 'vidaDiaria',
            officeLabel: 'Vida Diaria',
            type: 'task',
            title: t.name,
            categoryLabel: 'Tarea del Día',
            time: t.startTime,
            icon: '✅',
            details: t.description,
            status: t.status
          });
        }
      });

      // Habits logged today
      (offices.vidaDiaria.habits || []).forEach(h => {
        if (h.logs && h.logs[dateStr]) {
          habits.push({
            id: h.id,
            sourceOffice: 'vidaDiaria',
            officeLabel: 'Vida Diaria',
            type: 'habit',
            title: h.name,
            categoryLabel: 'Hábito Completado',
            time: h.scheduledTime,
            icon: h.emoji || '🌱',
            details: h.description,
            status: 'completed'
          });
        }
      });

      // Objectives
      (offices.vidaDiaria.objectives || []).forEach(o => {
        if (o.date === dateStr) {
          objectives.push({
            id: o.id,
            sourceOffice: 'vidaDiaria',
            officeLabel: 'Vida Diaria',
            type: 'objective',
            title: o.title,
            categoryLabel: 'Objetivo Diario',
            icon: '🎯',
            details: o.description,
            status: o.status
          });
        }
      });

      // Time Plans
      (offices.vidaDiaria.timePlans || []).forEach(tp => {
        if (tp.date === dateStr) {
          timePlans.push({
            id: tp.id,
            sourceOffice: 'vidaDiaria',
            officeLabel: 'Vida Diaria',
            type: 'time_plan',
            title: tp.title,
            categoryLabel: tp.category,
            time: tp.startTime,
            icon: '⏱️',
            details: tp.notes || tp.description,
            status: tp.completed ? 'completed' : 'pending'
          });
        }
      });
    }

    // 3. MÉDICA
    if (offices.medica) {
      (offices.medica.appointments || []).forEach(a => {
        if (a.date === dateStr) {
          appointments.push({
            id: a.id,
            sourceOffice: 'medica',
            officeLabel: 'Oficina Médica',
            type: 'appointment',
            title: `${a.title}${a.specialty ? ' (' + a.specialty + ')' : ''}`,
            categoryLabel: 'Cita Médica',
            time: a.startTime,
            icon: '🩺',
            details: a.doctor ? `Doctor: ${a.doctor}` : a.institution,
            status: a.status
          });
        }
      });

      (offices.medica.medicalExams || []).forEach(e => {
        if (e.date === dateStr) {
          appointments.push({
            id: e.id,
            sourceOffice: 'medica',
            officeLabel: 'Oficina Médica',
            type: 'medical_exam',
            title: e.name,
            categoryLabel: 'Examen Médico',
            icon: '🔬',
            details: e.location || e.notes,
            status: e.status
          });
        }
      });
    }

    // 4. VIDA SOCIAL
    if (offices.vidaSocial) {
      (offices.vidaSocial.commitments || []).forEach(c => {
        if (c.date === dateStr) {
          commitments.push({
            id: c.id,
            sourceOffice: 'vidaSocial',
            officeLabel: 'Vida Social',
            type: 'commitment',
            title: c.title,
            categoryLabel: c.type || 'Compromiso',
            time: c.startTime,
            icon: '🤝',
            details: c.location || c.description,
            status: c.isCompleted ? 'completed' : 'pending'
          });
        }
      });

      (offices.vidaSocial.interactions || []).forEach(i => {
        if (i.date === dateStr) {
          commitments.push({
            id: i.id,
            sourceOffice: 'vidaSocial',
            officeLabel: 'Vida Social',
            type: 'commitment',
            title: `${i.type}: ${i.description}`,
            categoryLabel: 'Interacción Social',
            time: i.time,
            icon: '💬'
          });
        }
      });
    }

    // 5. JEFATURA DE GABINETE
    if (offices.jefaturaGabinete) {
      (offices.jefaturaGabinete.events || []).forEach((ev: any) => {
        if (ev.date === dateStr) {
          otherEvents.push({
            id: ev.id || `jef_${Math.random()}`,
            sourceOffice: 'jefatura',
            officeLabel: 'Jefatura de Gabinete',
            type: 'task',
            title: ev.title || 'Evento de Agenda',
            categoryLabel: 'Evento de Agenda',
            time: ev.startTime,
            icon: '📅',
            details: ev.location || ev.description
          });
        }
      });
    }

    // 6. FINANCIERA
    if (offices.financiera) {
      (offices.financiera.transactions || []).forEach((tx: any) => {
        if (tx.date === dateStr) {
          const isExpense = tx.nature === 'external_expense' || tx.type === 'expense';
          financialTxs.push({
            id: tx.id || `tx_${Math.random()}`,
            sourceOffice: 'financiera',
            officeLabel: 'Oficina Financiera',
            type: 'financial_tx',
            title: `${isExpense ? 'Gasto' : 'Ingreso'}: $${Number(tx.amount || 0).toLocaleString('es-CO')}`,
            categoryLabel: tx.category || tx.categoryId || 'Transacción',
            icon: isExpense ? '💸' : '💰',
            details: tx.description
          });
        }
      });
    }

    const totalEventsCount =
      classes.length +
      practices.length +
      exams.length +
      tasks.length +
      appointments.length +
      commitments.length +
      habits.length +
      objectives.length +
      timePlans.length +
      financialTxs.length +
      otherEvents.length;

    const hasEvents = totalEventsCount > 0;

    let highlightPrompt = '';
    let highlightEmoji = '🍃';

    if (practices.length > 0) {
      const p = practices[0];
      highlightEmoji = '🎓';
      highlightPrompt = `Hoy tuviste una práctica: "${p.title}". ¿Cómo te fue?`;
    } else if (exams.length > 0) {
      const ex = exams[0];
      highlightEmoji = '📝';
      highlightPrompt = `Hoy tuviste un examen: "${ex.title}". ¿Cómo saliste?`;
    } else if (appointments.length > 0) {
      const ap = appointments[0];
      highlightEmoji = '🩺';
      highlightPrompt = `Hoy tuviste un compromiso médico (${ap.title}). ¿Cómo te fue?`;
    } else if (commitments.length > 0) {
      const cm = commitments[0];
      highlightEmoji = '🤝';
      highlightPrompt = `Hoy tuviste un compromiso social (${cm.title}). ¿Qué tal estuvo la experiencia?`;
    } else if (classes.length > 0) {
      const clName = classes.map(c => c.title).join(', ');
      highlightEmoji = '🏫';
      highlightPrompt = `Hoy tuviste clase de ${clName}. ¿Qué fue lo más valioso que te dejó?`;
    } else if (tasks.length > 0 || habits.length > 0) {
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      highlightEmoji = '✅';
      highlightPrompt = `Hoy avanzaste en tus actividades de vida diaria. ¿Cómo calificarías tu nivel de calma y enfoque?`;
    } else if (financialTxs.length > 0) {
      highlightEmoji = '📊';
      highlightPrompt = `Hoy registraste movimientos en tu presupuesto. ¿Cómo percibes el control de tus finanzas hoy?`;
    } else {
      highlightEmoji = '🍃';
      highlightPrompt = 'Tu día estuvo tranquilo. ¿Hay algo que quieras dejar registrado?';
    }

    return {
      date: dateStr,
      hasEvents,
      classes,
      practices,
      exams,
      tasks,
      appointments,
      commitments,
      habits,
      objectives,
      timePlans,
      financialTxs,
      otherEvents,
      totalEventsCount,
      highlightPrompt,
      highlightEmoji
    };
  }
};

import { JournalEntry } from '../../types/store';
import { DayContextSummary } from './DayContextDetector';

export interface ReflectionResult {
  contextualQuestion: string | null;
  philosophicalQuestion: string | null;
  continuityMemory: {
    pastDate: string;
    pastExcerpt: string;
    todayExcerpt: string;
    reflectionQuestion: string;
  } | null;
  isQuietDay: boolean;
}

export const PersonalReflectionEngine = {
  analyzeDay(
    dayContext: DayContextSummary,
    currentEntry: Partial<JournalEntry> | undefined,
    allEntries: JournalEntry[]
  ): ReflectionResult {
    const freeText = (currentEntry?.freeReflection || currentEntry?.reflection || '').trim();
    const overcameText = (currentEntry?.overcame || '').trim();
    const wentWellText = (currentEntry?.wentWell || currentEntry?.bestThingToday || '').trim();
    const learnedText = (currentEntry?.learnedToday || currentEntry?.learned || '').trim();
    const improveText = (currentEntry?.improveTomorrow || currentEntry?.improve || '').trim();
    const mood = currentEntry?.mood || 'reflexivo';

    const combinedUserText = `${freeText} ${overcameText} ${wentWellText} ${learnedText} ${improveText}`.toLowerCase();

    const hasSignificantEvents = dayContext.hasEvents;
    const hasWrittenContent = combinedUserText.length > 15;

    const isQuietDay = !hasSignificantEvents && !hasWrittenContent;

    // 1. REFLEXIÓN SOBRE LO QUE REALMENTE PASÓ
    let contextualQuestion: string | null = null;

    if (dayContext.practices.length > 0) {
      const p = dayContext.practices[0];
      if (combinedUserText.includes('costo') || combinedUserText.includes('difícil') || combinedUserText.includes('miedo') || combinedUserText.includes('duda') || combinedUserText.includes('insegur')) {
        contextualQuestion = `Hoy tuviste la práctica de "${p.title}" y mencionaste cierta dificultad o reserva al actuar. ¿Sientes que fue una barrera de conocimiento técnico o un asunto de autoconfianza inicial?`;
      } else if (combinedUserText.includes('bien') || combinedUserText.includes('éxito') || combinedUserText.includes('logr') || combinedUserText.includes('segur')) {
        contextualQuestion = `En la práctica de "${p.title}" de hoy lograste desenvolverte con fluidez. ¿Qué factor interno o preparación previa marcó la diferencia para ti hoy?`;
      } else {
        contextualQuestion = `Hoy tuviste la práctica de "${p.title}". ¿Hubo algún instante específico durante la jornada donde tuvieras que tomar una decisión rápida?`;
      }
    } else if (dayContext.exams.length > 0) {
      const ex = dayContext.exams[0];
      if (hasWrittenContent) {
        contextualQuestion = `Tras rendir la evaluación de "${ex.title}", al revisar tus reflexiones de hoy, ¿sientes que tu resultado reflejará el nivel de esfuerzo que invertiste previamente?`;
      } else {
        contextualQuestion = `Hoy presentaste el examen de "${ex.title}". Más allá del resultado numérico, ¿qué certeza o aprendizaje te dejó la forma en que lo enfrentaste?`;
      }
    } else if (dayContext.appointments.length > 0) {
      const ap = dayContext.appointments[0];
      contextualQuestion = `Hoy asististe a la cita médica de "${ap.title}". ¿De qué manera esta gestión de tu salud contribuye al ritmo de vida que deseas mantener?`;
    } else if (dayContext.commitments.length > 0) {
      const cm = dayContext.commitments[0];
      contextualQuestion = `Hoy tuviste el encuentro social "${cm.title}". ¿Esta interacción te recargó de energía o te exigió esfuerzo emocional?`;
    } else if (hasWrittenContent) {
      if (overcameText) {
        contextualQuestion = `Mencionaste que hoy superaste: "${overcameText}". ¿Qué recurso personal usaste para no dar un paso atrás?`;
      } else if (improveText) {
        contextualQuestion = `Anotaste que deseas mejorar: "${improveText}". ¿Qué pequeña acción concreta de mañana evitará que esta situación se repita?`;
      } else {
        contextualQuestion = `Escribiste en tu diario: "${freeText.slice(0, 80)}...". ¿Qué emoción o convicción profunda estaba presente mientras redactabas esto?`;
      }
    }

    // 2. PREGUNTA FILOSÓFICA (Únicamente cuando hay un hecho o escrito significativo)
    let philosophicalQuestion: string | null = null;

    if (!isQuietDay) {
      if (combinedUserText.includes('miedo') || combinedUserText.includes('error') || combinedUserText.includes('equivoc') || combinedUserText.includes('fall')) {
        philosophicalQuestion = `Hoy se reflejó la inquietud de equivocarse. Si fallar fuera una parte inevitable e imprescindible de tu evolución profesional, ¿seguirías interpretando el error como una amenaza o como una confirmación de que estás avanzando?`;
      } else if (combinedUserText.includes('tiempo') || combinedUserText.includes('pisa') || combinedUserText.includes('prisa') || combinedUserText.includes('ocupad') || dayContext.totalEventsCount > 4) {
        philosophicalQuestion = `Tu día estuvo cargado de compromisos y tareas. Cuando las horas se llenan por completo de acciones externas, ¿qué espacio real le estás dedicando a la persona que las ejecuta?`;
      } else if (combinedUserText.includes('decisi') || combinedUserText.includes('eleg') || combinedUserText.includes('camin')) {
        philosophicalQuestion = `Toda decisión consciente renuncia a otras posibilidades. ¿Sientes que las decisiones de hoy reflejan tus valores prioritarios o las expectativas de los demás?`;
      } else if (dayContext.practices.length > 0 || dayContext.exams.length > 0) {
        philosophicalQuestion = `Las evaluaciones y las prácticas nos confrontan con nuestra propia idoneidad. ¿Qué tanto de tu valía personal estás vinculando a los resultados externos de tus jornadas?`;
      } else if (mood === 'dificil') {
        philosophicalQuestion = `Los días difíciles revelan la textura de nuestros límites. ¿Qué verdad o necesidad personal está intentando mostrarte la incomodidad vivida hoy?`;
      } else if (hasWrittenContent) {
        philosophicalQuestion = `Pensando en las vivencias y reflexiones de hoy, ¿esta jornada te acerca a la versión de ti que quieres recordar en diez años?`;
      }
    }

    // 3. MEMORIA Y CONTINUIDAD (Busca en registros anteriores de desarrolloPersonal)
    let continuityMemory: ReflectionResult['continuityMemory'] = null;

    if (currentEntry && allEntries.length > 1) {
      const todayDate = currentEntry.date;
      // Filtrar entradas anteriores a hoy
      const pastEntries = allEntries.filter(e => e.date < todayDate && (e.freeReflection || e.learnedToday || e.overcame || e.bestThingToday || e.mood));

      if (pastEntries.length > 0) {
        // Buscar un contraste significativo (ej. un día previo difícil o con dudas)
        const pastDifficultEntry = pastEntries.find(e =>
          e.mood === 'dificil' ||
          (e.freeReflection && (e.freeReflection.toLowerCase().includes('insegur') || e.freeReflection.toLowerCase().includes('miedo') || e.freeReflection.toLowerCase().includes('costo') || e.freeReflection.toLowerCase().includes('cansad')))
        );

        if (pastDifficultEntry && (mood === 'bueno' || mood === 'excelente' || overcameText || wentWellText)) {
          const pastExcerpt = pastDifficultEntry.freeReflection || pastDifficultEntry.learnedToday || `Día ${pastDifficultEntry.mood}`;
          const todayExcerpt = overcameText || wentWellText || freeText || `Día ${mood}`;

          continuityMemory = {
            pastDate: pastDifficultEntry.date,
            pastExcerpt: pastExcerpt.length > 90 ? pastExcerpt.slice(0, 90) + '...' : pastExcerpt,
            todayExcerpt: todayExcerpt.length > 90 ? todayExcerpt.slice(0, 90) + '...' : todayExcerpt,
            reflectionQuestion: `En la fecha ${pastDifficultEntry.date} registraste incertidumbre o inquietud. Hoy, en cambio, reflejas un estado de superación o avance. ¿En qué momento preciso sentiste que tu perspectiva cambió?`
          };
        } else if (pastEntries.length >= 2) {
          const randomPast = pastEntries[0];
          const pastExcerpt = randomPast.freeReflection || randomPast.wordOfTheDay || randomPast.learnedToday;
          if (pastExcerpt) {
            continuityMemory = {
              pastDate: randomPast.date,
              pastExcerpt: pastExcerpt.length > 90 ? pastExcerpt.slice(0, 90) + '...' : pastExcerpt,
              todayExcerpt: freeText.length > 90 ? freeText.slice(0, 90) + '...' : (freeText || 'Reflexión de hoy'),
              reflectionQuestion: `El ${randomPast.date} anotaste: "${pastExcerpt.slice(0, 60)}...". Viendo tu día de hoy, ¿de qué forma esa inquietud previa sigue presente o ha sido superada?`
            };
          }
        }
      }
    }

    return {
      contextualQuestion,
      philosophicalQuestion,
      continuityMemory,
      isQuietDay
    };
  }
};

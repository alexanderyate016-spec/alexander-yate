import React, { useState, useMemo } from 'react';
import { JournalEntry, LifeLesson, MonthlyReview } from '../../../types/store';
import { PersonalDevStore } from '../PersonalDevStore';
import { showToast, ExecutiveButton, ExecutiveMetricCard } from '../../../components/executive';
import {
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  Compass,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  FileText
} from 'lucide-react';

interface MonthlyReviewModuleProps {
  entries: JournalEntry[];
  lessons: LifeLesson[];
  reviews: Record<string, MonthlyReview>;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MonthlyReviewModule: React.FC<MonthlyReviewModuleProps> = ({
  entries,
  lessons,
  reviews
}) => {
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedYM, setSelectedYM] = useState<string>(currentYM);

  // Parse YYYY-MM
  const [year, month] = useMemo(() => {
    const parts = selectedYM.split('-').map(Number);
    return [parts[0] || now.getFullYear(), parts[1] || now.getMonth() + 1];
  }, [selectedYM]);

  // Existing review or defaults
  const currentReview = reviews[selectedYM];

  const [biggestLearning, setBiggestLearning] = useState(currentReview?.biggestLearning || '');
  const [biggestChallenge, setBiggestChallenge] = useState(currentReview?.biggestChallenge || '');
  const [nextMonthGoal, setNextMonthGoal] = useState(currentReview?.nextMonthGoal || '');

  // Keep state synced when selectedYM changes
  React.useEffect(() => {
    const r = reviews[selectedYM];
    setBiggestLearning(r?.biggestLearning || '');
    setBiggestChallenge(r?.biggestChallenge || '');
    setNextMonthGoal(r?.nextMonthGoal || '');
  }, [selectedYM, reviews]);

  // Month navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      setSelectedYM(`${year - 1}-12`);
    } else {
      setSelectedYM(`${year}-${String(month - 1).padStart(2, '0')}`);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setSelectedYM(`${year + 1}-01`);
    } else {
      setSelectedYM(`${year}-${String(month + 1).padStart(2, '0')}`);
    }
  };

  // Automated compiled stats for the selected month
  const monthStats = useMemo(() => {
    const monthEntries = entries.filter(e => e.date.startsWith(selectedYM));
    const monthLessons = lessons.filter(l => l.date.startsWith(selectedYM));

    const daysWithReflection = monthEntries.filter(
      e => e.wordOfTheDay || e.freeReflection || e.philosophicalAnswer || e.learnedToday
    ).length;

    const answeredQuestions = monthEntries.filter(e => e.philosophicalAnswer?.trim()).length;

    const wordsList = monthEntries
      .map(e => e.wordOfTheDay)
      .filter(Boolean) as string[];

    return {
      totalEntries: monthEntries.length,
      daysWithReflection,
      answeredQuestions,
      lessonsAdded: monthLessons.length,
      wordsList
    };
  }, [entries, lessons, selectedYM]);

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    PersonalDevStore.saveMonthlyReview(selectedYM, {
      biggestLearning: biggestLearning.trim(),
      biggestChallenge: biggestChallenge.trim(),
      nextMonthGoal: nextMonthGoal.trim()
    });

    showToast(`✓ Revisión Mensual de ${MONTH_NAMES[month - 1]} ${year} guardada`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Month Navigation */}
      <div className="bg-[#0F1B2E]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 block">
            Módulo de Síntesis
          </span>
          <h3 className="font-sans font-semibold text-white text-lg tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400 stroke-[1.75]" />
            Revisión Mensual de Crecimiento ({MONTH_NAMES[month - 1]} {year})
          </h3>
        </div>

        {/* Month Picker Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setSelectedYM(currentYM)}
            className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs transition-all"
          >
            Mes Actual
          </button>
          <div className="flex items-center bg-[#0B1528] rounded-xl border border-white/10 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-white font-mono">
              {selectedYM}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Automated Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveMetricCard
          title="Entradas de Diario"
          value={`${monthStats.totalEntries} días`}
          subtitle={`En ${MONTH_NAMES[month - 1]}`}
          icon={<BookOpen className="w-4 h-4 text-indigo-400" />}
          accentColor="indigo"
        />

        <ExecutiveMetricCard
          title="Días Reflexionados"
          value={`${monthStats.daysWithReflection} días`}
          subtitle="Constancia en el diario"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          accentColor="emerald"
        />

        <ExecutiveMetricCard
          title="Preguntas Respondidas"
          value={`${monthStats.answeredQuestions} de 365`}
          subtitle="Autoconocimiento"
          icon={<Sparkles className="w-4 h-4 text-blue-400" />}
          accentColor="blue"
        />

        <ExecutiveMetricCard
          title="Lecciones de Vida"
          value={`${monthStats.lessonsAdded} lecciones`}
          subtitle="Sabiduría en el mes"
          icon={<Award className="w-4 h-4 text-purple-400" />}
          accentColor="purple"
        />
      </div>

      {/* Summary Words of the Month */}
      {monthStats.wordsList.length > 0 && (
        <div className="bg-[#0F1B2E]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-indigo-300 block">
            Palabras Clave del Mes ({MONTH_NAMES[month - 1]})
          </label>
          <div className="flex flex-wrap gap-2">
            {monthStats.wordsList.map((word, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Manual Monthly Reflection Form */}
      <form onSubmit={handleSaveReview} className="bg-[#0F1B2E]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        <h4 className="font-sans font-semibold text-white text-base tracking-tight flex items-center gap-2 border-b border-white/10 pb-4">
          <FileText className="w-5 h-5 text-indigo-400" />
          Síntesis & Reflexión Mensual
        </h4>

        <div className="space-y-4">
          {/* Mayor Aprendizaje */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Mayor Aprendizaje del Mes
            </label>
            <textarea
              value={biggestLearning}
              onChange={e => setBiggestLearning(e.target.value)}
              rows={3}
              placeholder={`¿Cuál fue la enseñanza más profunda que te dejó ${MONTH_NAMES[month - 1]}?`}
              className="w-full bg-[#070D18] border border-white/15 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* Mayor Reto */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              Mayor Reto Enfrentado
            </label>
            <textarea
              value={biggestChallenge}
              onChange={e => setBiggestChallenge(e.target.value)}
              rows={3}
              placeholder="¿Qué dificultad o prueba de carácter exigió mayor fortaleza este mes?"
              className="w-full bg-[#070D18] border border-white/15 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* Objetivo Próximo Mes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Objetivo Principal para el Próximo Mes
            </label>
            <textarea
              value={nextMonthGoal}
              onChange={e => setNextMonthGoal(e.target.value)}
              rows={2}
              placeholder="¿En qué hábito, virtud o meta enfocarás tu energía el mes que entra?"
              className="w-full bg-[#070D18] border border-white/15 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-sans leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <ExecutiveButton
            type="submit"
            variant="primary"
            accentColor="indigo"
            icon={<CheckCircle2 className="w-4 h-4 stroke-[2]" />}
          >
            Guardar Revisión Mensual
          </ExecutiveButton>
        </div>
      </form>
    </div>
  );
};

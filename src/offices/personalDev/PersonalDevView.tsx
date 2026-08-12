import React, { useState, useEffect } from 'react';
import { PersonalDevOfficeData } from '../../types/store';
import { PersonalDevStore } from './PersonalDevStore';
import { storeInstance } from '../../store/CasaBlancaStore';
import { getTodayDateString } from '../../utils/dates';
import { MiDiaExperience } from './components/MiDiaExperience';
import { JournalCalendar } from './components/JournalCalendar';
import { JournalHistory } from './components/JournalHistory';
import { LifeLessonsModule } from './components/LifeLessonsModule';
import { MonthlyReviewModule } from './components/MonthlyReviewModule';
import {
  Lock,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Search,
  Calendar as CalendarIcon,
  Bell,
  Feather,
  Heart,
  Compass
} from 'lucide-react';

interface Props {
  data: PersonalDevOfficeData;
}

type DevTab = 'mi_dia' | 'calendario' | 'lecciones' | 'revision' | 'historial';

export const PersonalDevView: React.FC<Props> = ({ data: initialData }) => {
  // Subscribe to live store updates
  const [data, setData] = useState<PersonalDevOfficeData>(() => PersonalDevStore.getData());
  const [activeTab, setActiveTab] = useState<DevTab>('mi_dia');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    const unsubscribe = storeInstance.subscribe(() => {
      setData(PersonalDevStore.getData());
    });
    return () => unsubscribe();
  }, []);

  const todayStr = getTodayDateString();
  const todayStatus = PersonalDevStore.getTodayStatus();

  const handleSelectToday = () => {
    setSelectedDate(todayStr);
    setActiveTab('mi_dia');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. CONFIDENTIALITY & PRIVACY BANNER */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-[#0F1B2E]/90 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Glass shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-inner">
            <Lock className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-sans font-semibold text-slate-900 tracking-tight">
                Oficina de Desarrollo Personal
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                <ShieldCheck className="w-3 h-3" /> Privado & Confidencial
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5">
              Espacio vivo de reflexión sobre tu día, tus vivencias y la persona que estás construyendo. Inviolable y privado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="text-[11px] text-indigo-300 font-mono bg-indigo-950/60 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            Entradas: {data.journalEntries.length} | Lecciones: {data.lifeLessons.length}
          </span>
        </div>
      </div>

      {/* 2. REMINDER BANNER (If today's reflection is pending) */}
      {!todayStatus.completed && activeTab !== 'mi_dia' && (
        <div className="bg-gradient-to-r from-amber-950/50 via-[#0B1528]/80 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-200">
                Reflexión Diaria Pendiente
              </h4>
              <p className="text-[11px] text-slate-700">
                Aún no has registrado tu reflexión del día ({todayStr}). Tómate unos minutos para pausar y encontrarte con lo que viviste.
              </p>
            </div>
          </div>

          <button
            onClick={handleSelectToday}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
          >
            <Feather className="w-3.5 h-3.5" />
            Reflexionar sobre Mi Día
          </button>
        </div>
      )}

      {/* 3. NAVIGATION TABS */}
      <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-1.5 shadow-xl flex items-center justify-start overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('mi_dia')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'mi_dia'
              ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 shadow-md font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Feather className="w-4 h-4 stroke-[1.75]" />
          <span>Mi Día</span>
        </button>

        <button
          onClick={() => setActiveTab('calendario')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'calendario'
              ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 shadow-md font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarIcon className="w-4 h-4 stroke-[1.75]" />
          <span>Calendario Emocional</span>
        </button>

        <button
          onClick={() => setActiveTab('lecciones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'lecciones'
              ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 shadow-md font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Lightbulb className="w-4 h-4 stroke-[1.75]" />
          <span>Lecciones de Vida</span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'revision'
              ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 shadow-md font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 stroke-[1.75]" />
          <span>Revisión Mensual</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === 'historial'
              ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-200 shadow-md font-semibold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4 stroke-[1.75]" />
          <span>Historial y Búsqueda</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="space-y-6">
        {/* TAB 1: MI DÍA (Experiencia Principal) */}
        {activeTab === 'mi_dia' && (
          <MiDiaExperience
            selectedDate={selectedDate}
            onSelectDate={dateStr => setSelectedDate(dateStr)}
            journalEntries={data.journalEntries}
            onSaveSuccess={() => {}}
          />
        )}

        {/* TAB 2: CALENDARIO EMOCIONAL */}
        {activeTab === 'calendario' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <JournalCalendar
              entries={data.journalEntries}
              selectedDate={selectedDate}
              onSelectDate={dateStr => {
                setSelectedDate(dateStr);
                setActiveTab('mi_dia');
              }}
            />
          </div>
        )}

        {/* TAB 3: LECCIONES DE VIDA */}
        {activeTab === 'lecciones' && (
          <LifeLessonsModule lessons={data.lifeLessons} />
        )}

        {/* TAB 4: REVISIÓN MENSUAL */}
        {activeTab === 'revision' && (
          <MonthlyReviewModule
            entries={data.journalEntries}
            lessons={data.lifeLessons}
            reviews={data.monthlyReviews || {}}
          />
        )}

        {/* TAB 5: HISTORIAL Y BÚSQUEDA */}
        {activeTab === 'historial' && (
          <JournalHistory
            entries={data.journalEntries}
            onSelectEntry={dateStr => {
              setSelectedDate(dateStr);
              setActiveTab('mi_dia');
            }}
          />
        )}
      </div>
    </div>
  );
};

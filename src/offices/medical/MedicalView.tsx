import React, { useState } from 'react';
import { MedicalOfficeData } from '../../types/store';
import { MedicalStore } from './MedicalStore';
import { MedicalCalculations } from './MedicalCalculations';
import { getTodayDateString } from '../../utils/dates';
import {
  GlassPanel,
  ExecutiveCard,
  ExecutiveButton,
  ExecutiveMetricCard,
  ExecutiveSectionHeader,
  ExecutiveBadge,
  ExecutiveEmptyState,
} from '../../components/executive';
import {
  Stethoscope,
  Heart,
  Activity,
  Calendar,
  ShieldCheck,
  Droplet,
  Moon,
  Scale,
  Pill,
  AlertTriangle,
  Utensils,
  FileText,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

// Import Interactive Subcomponents
import { SmartBottleWidget } from './components/SmartBottleWidget';
import { SleepMoonWidget } from './components/SleepMoonWidget';
import { WeightTrendWidget } from './components/WeightTrendWidget';
import { NutritionSection } from './components/NutritionSection';
import { VaccinePassportSection } from './components/VaccinePassportSection';
import { AppointmentsSection } from './components/AppointmentsSection';
import { MedicationsSection } from './components/MedicationsSection';
import { ExamsAndConditionsSection } from './components/ExamsAndConditionsSection';

interface Props {
  data: MedicalOfficeData;
}

export const MedicalView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'hydration' | 'sleep_weight' | 'nutrition' | 'appointments' | 'vaccines' | 'medications' | 'exams'
  >('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = getTodayDateString();

  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const wellnessIndex = MedicalCalculations.getDailyWellnessIndex(data, todayStr);
  const alerts = MedicalCalculations.getHealthAlerts(data);

  // Active items counts
  const activeMedsCount = (data.medications || []).filter(m => m.status === 'active').length;
  const pendingAppointmentsCount = (data.appointments || []).filter(a => a.date >= todayStr && a.status !== 'Cancelada').length;
  const pendingExamsCount = (data.medicalExams || []).filter(e => e.status !== 'Completado').length;

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. INSTITUTIONAL HEADER */}
      <ExecutiveSectionHeader
        title="Oficina Médica — Panel de Salud Interactivo"
        subtitle="Monitoreo ejecutivo de bienestar diario, hidratación visual, carnet digital y agenda clínica"
        icon={<Stethoscope className="w-6 h-6 text-rose-400" />}
        accentColor="rose"
        badgeText="Panel Ejecutivo de Salud"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar en historial clínico, vacunas, medicamentos..."
      />

      {/* 2. SMART HEALTH ALERTS BANNER */}
      {alerts.length > 0 && (
        <GlassPanel accentColor="rose" padding="sm" className="bg-gradient-to-r from-rose-950/50 via-slate-900/80 to-amber-950/40 border-rose-500/40 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <h4 className="font-serif font-bold text-rose-200 text-xs uppercase tracking-wider">
                Alertas Inteligentes de Salud ({alerts.length})
              </h4>
            </div>
            <span className="text-[10px] text-rose-300 font-mono">Sin diagnósticos médicos automáticos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {alerts.map((al, idx) => (
              <div key={idx} className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-100 flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>{al}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* 3. INTERACTIVE NAVIGATION TABS */}
      <div className="flex border-b border-white/10 space-x-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Panel General', icon: <Heart className="w-4 h-4" />, badge: `${wellnessIndex.overallScore}%` },
          { id: 'hydration', label: 'Hidratación', icon: <Droplet className="w-4 h-4" />, badge: `${metrics.hydrationPct}%` },
          { id: 'sleep_weight', label: 'Sueño y Peso', icon: <Moon className="w-4 h-4" /> },
          { id: 'nutrition', label: 'Alimentación', icon: <Utensils className="w-4 h-4" />, badge: (data.nutritionRecords || []).filter(r => r.date === todayStr).length },
          { id: 'appointments', label: 'Citas Médicas', icon: <Calendar className="w-4 h-4" />, badge: pendingAppointmentsCount },
          { id: 'vaccines', label: 'Carnet Vacunas', icon: <ShieldCheck className="w-4 h-4" />, badge: (data.immunizations || []).length },
          { id: 'medications', label: 'Medicamentos', icon: <Pill className="w-4 h-4" />, badge: activeMedsCount },
          { id: 'exams', label: 'Exámenes', icon: <FileText className="w-4 h-4" />, badge: pendingExamsCount }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? 'border-rose-400 bg-rose-500/20 text-rose-200 shadow-lg'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-rose-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* INDICADOR DE BIENESTAR DIARIO */}
          <GlassPanel accentColor="rose" padding="lg" className="bg-gradient-to-br from-[#1C0A15]/90 via-[#12070E]/80 to-[#2A0E1C]/80 border-rose-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-2xl text-rose-300 shadow-lg shadow-rose-950/50">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-white tracking-wide">
                    Indicador de Bienestar Diario
                  </h3>
                  <p className="text-xs text-rose-200/80 font-sans">
                    Resumen ponderado de hidratación, descanso nocturno y disciplina de tratamiento
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#17050E] border border-rose-500/30 px-4 py-2 rounded-2xl">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Score General</span>
                <span className="text-2xl font-bold font-mono text-white">{wellnessIndex.overallScore}%</span>
              </div>
            </div>

            {/* PROGRESS RINGS / BREAKDOWN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5" /> Hidratación
                  </span>
                  <span className="font-mono font-bold text-white">{metrics.hydrationPct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div style={{ width: `${metrics.hydrationPct}%` }} className="bg-cyan-400 h-full rounded-full transition-all duration-500" />
                </div>
                <p className="text-[10px] text-cyan-200/80 font-mono">
                  {metrics.hydrationLiters.toFixed(1)}L de {metrics.targetWater}L objetivo
                </p>
              </div>

              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5" /> Sueño Anoche
                  </span>
                  <span className="font-mono font-bold text-white">{wellnessIndex.sleepPct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div style={{ width: `${wellnessIndex.sleepPct}%` }} className="bg-indigo-400 h-full rounded-full transition-all duration-500" />
                </div>
                <p className="text-[10px] text-indigo-200/80 font-mono">
                  {metrics.sleep ? `${metrics.sleep} hrs dormidas` : 'Sin registro de descanso'}
                </p>
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5" /> Tratamiento
                  </span>
                  <span className="font-mono font-bold text-white">100%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div style={{ width: `100%` }} className="bg-emerald-400 h-full rounded-full" />
                </div>
                <p className="text-[10px] text-emerald-200/80 font-mono">
                  {activeMedsCount > 0 ? `${activeMedsCount} med(s) activos` : 'Sin medicamentos activos'}
                </p>
              </div>

              <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-rose-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Registro del Día
                  </span>
                  <span className="font-mono font-bold text-white">
                    {wellnessIndex.isLogCompleted ? '100%' : '50%'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div style={{ width: wellnessIndex.isLogCompleted ? '100%' : '50%' }} className="bg-rose-400 h-full rounded-full" />
                </div>
                <p className="text-[10px] text-rose-200/80 font-mono">
                  {wellnessIndex.isLogCompleted ? 'Registro diario completo' : 'Pendiente log diario'}
                </p>
              </div>
            </div>
          </GlassPanel>

          {/* DASHBOARD CARDS GRID (NO TABLES!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CARD 1: HIDRATACIÓN BOTELLA */}
            <ExecutiveCard accentColor="blue" className="space-y-3 cursor-pointer hover:border-cyan-400 transition-all" onClick={() => setActiveTab('hydration')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-300">
                  <Droplet className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="blue">{metrics.hydrationPct}%</ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Hidratación</span>
                <p className="text-xl font-bold font-mono text-white">{metrics.hydrationLiters.toFixed(1)} L / {metrics.targetWater} L</p>
              </div>
              <div className="text-xs text-cyan-300 flex items-center justify-between pt-2 border-t border-cyan-500/20">
                <span>Botella Inteligente</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 2: SUEÑO */}
            <ExecutiveCard accentColor="indigo" className="space-y-3 cursor-pointer hover:border-indigo-400 transition-all" onClick={() => setActiveTab('sleep_weight')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-300">
                  <Moon className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="indigo">
                  {metrics.weeklyAvgSleep !== null ? `${metrics.weeklyAvgSleep}h prom` : 'Sueño'}
                </ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Descanso Anoche</span>
                <p className="text-xl font-bold font-mono text-white">{metrics.sleep !== null ? `${metrics.sleep} hrs` : 'Sin registro'}</p>
              </div>
              <div className="text-xs text-indigo-300 flex items-center justify-between pt-2 border-t border-indigo-500/20">
                <span>Promedio Semanal & Mensual</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 3: PESO */}
            <ExecutiveCard accentColor="rose" className="space-y-3 cursor-pointer hover:border-rose-400 transition-all" onClick={() => setActiveTab('sleep_weight')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-300">
                  <Scale className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="rose">
                  {metrics.weightTrend === 'up' ? '↗ Sube' : metrics.weightTrend === 'down' ? '↘ Baja' : '➔ Estabilizado'}
                </ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Peso Corporal</span>
                <p className="text-xl font-bold font-mono text-white">{metrics.weight !== null ? `${metrics.weight} kg` : 'Sin registro'}</p>
              </div>
              <div className="text-xs text-rose-300 flex items-center justify-between pt-2 border-t border-rose-500/20">
                <span>Evolución & Tendencia</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 4: CARNET VACUNAS */}
            <ExecutiveCard accentColor="amber" className="space-y-3 cursor-pointer hover:border-amber-400 transition-all" onClick={() => setActiveTab('vaccines')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="amber">{(data.immunizations || []).length} Vacunas</ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Carnet Digital</span>
                <p className="text-xl font-bold text-white">Inmunización</p>
              </div>
              <div className="text-xs text-amber-300 flex items-center justify-between pt-2 border-t border-amber-500/20">
                <span>Ver Carnet & Refuerzos</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 5: BOTIQUÍN / MEDICAMENTOS */}
            <ExecutiveCard accentColor="emerald" className="space-y-3 cursor-pointer hover:border-emerald-400 transition-all" onClick={() => setActiveTab('medications')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <Pill className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="emerald">{activeMedsCount} Activos</ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Tratamientos</span>
                <p className="text-xl font-bold text-white">Botiquín Médico</p>
              </div>
              <div className="text-xs text-emerald-300 flex items-center justify-between pt-2 border-t border-emerald-500/20">
                <span>Gestionar Tomas</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 6: CITAS MÉRICA */}
            <ExecutiveCard accentColor="rose" className="space-y-3 cursor-pointer hover:border-rose-400 transition-all" onClick={() => setActiveTab('appointments')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="rose">{pendingAppointmentsCount} Pendientes</ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Agenda Clínica</span>
                <p className="text-xl font-bold text-white">Citas Médicas</p>
              </div>
              <div className="text-xs text-rose-300 flex items-center justify-between pt-2 border-t border-rose-500/20">
                <span>Agendar Citas</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 7: NUTRITION */}
            <ExecutiveCard accentColor="emerald" className="space-y-3 cursor-pointer hover:border-emerald-400 transition-all" onClick={() => setActiveTab('nutrition')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <Utensils className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="emerald">Diario</ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Nutrición</span>
                <p className="text-xl font-bold text-white">Alimentación</p>
              </div>
              <div className="text-xs text-emerald-300 flex items-center justify-between pt-2 border-t border-emerald-500/20">
                <span>Registro de Comidas</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>

            {/* CARD 8: EXÁMENES */}
            <ExecutiveCard accentColor="purple" className="space-y-3 cursor-pointer hover:border-purple-400 transition-all" onClick={() => setActiveTab('exams')}>
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-300">
                  <FileText className="w-5 h-5" />
                </div>
                <ExecutiveBadge accentColor="purple">{pendingExamsCount} En espera</ExecutiveBadge>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">Laboratorio</span>
                <p className="text-xl font-bold text-white">Exámenes e Historial</p>
              </div>
              <div className="text-xs text-purple-300 flex items-center justify-between pt-2 border-t border-purple-500/20">
                <span>Informes & Enfermedades</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </ExecutiveCard>
          </div>
        </div>
      )}

      {/* TAB 2: SMART BOTTLE HYDRATION */}
      {activeTab === 'hydration' && (
        <div className="animate-fadeIn">
          <SmartBottleWidget data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB 3: SLEEP AND WEIGHT */}
      {activeTab === 'sleep_weight' && (
        <div className="space-y-6 animate-fadeIn">
          <SleepMoonWidget data={data} todayStr={todayStr} />
          <WeightTrendWidget data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB 4: NUTRITION */}
      {activeTab === 'nutrition' && (
        <div className="animate-fadeIn">
          <NutritionSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB 5: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="animate-fadeIn">
          <AppointmentsSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB 6: VACCINE PASSPORT */}
      {activeTab === 'vaccines' && (
        <div className="animate-fadeIn">
          <VaccinePassportSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB 7: MEDICATIONS */}
      {activeTab === 'medications' && (
        <div className="animate-fadeIn">
          <MedicationsSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB 8: EXAMS & CONDITIONS */}
      {activeTab === 'exams' && (
        <div className="animate-fadeIn">
          <ExamsAndConditionsSection data={data} todayStr={todayStr} />
        </div>
      )}
    </div>
  );
};

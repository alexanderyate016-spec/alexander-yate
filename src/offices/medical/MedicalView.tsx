import React, { useState } from 'react';
import { MedicalOfficeData } from '../../types/store';
import { MedicalStore } from './MedicalStore';
import { MedicalCalculations } from './MedicalCalculations';
import { getTodayDateString } from '../../utils/dates';
import { useTimeService } from '../../hooks/useTimeService';
import {
  GlassPanel,
  ExecutiveSectionHeader,
  ExecutiveBadge
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
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

// Import Apple Health Widgets and Sections
import { SmartBottleWidget } from './components/SmartBottleWidget';
import { SleepMoonWidget } from './components/SleepMoonWidget';
import { WeightTrendWidget } from './components/WeightTrendWidget';
import { VaccinePassportSection } from './components/VaccinePassportSection';
import { AppointmentsSection } from './components/AppointmentsSection';
import { MedicationsSection } from './components/MedicationsSection';
import { ExamsAndConditionsSection } from './components/ExamsAndConditionsSection';
import { ActivityWidget } from './components/ActivityWidget';
import { HeartRateWidget } from './components/HeartRateWidget';
import { SleepAppleWidget } from './components/SleepAppleWidget';
import { WeightAppleWidget } from './components/WeightAppleWidget';
import { HydrationAppleWidget } from './components/HydrationAppleWidget';
import { MedicationsAppleWidget } from './components/MedicationsAppleWidget';
import { ConsolidatedTimelineSection } from './components/ConsolidatedTimelineSection';

interface Props {
  data: MedicalOfficeData;
}

export const MedicalView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<
    'today' | 'hydration' | 'sleep_weight' | 'activity' | 'medications' | 'vaccines' | 'exams' | 'appointments' | 'timeline'
  >('today');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = getTodayDateString();
  const timeService = useTimeService();
  const isAfter21 = timeService.now.getHours() >= 21 || timeService.now.getHours() < 5;

  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const wellnessIndex = MedicalCalculations.getDailyWellnessIndex(data, todayStr);
  const alerts = MedicalCalculations.getHealthAlerts(data);

  // Active counts
  const activeMedsCount = (data.medications || []).filter(m => m.status === 'active').length;
  const pendingAppointmentsCount = (data.appointments || []).filter(a => a.date >= todayStr && a.status !== 'Cancelada').length;
  const pendingExamsCount = (data.medicalExams || []).filter(e => e.status !== 'Completado').length;

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. INSTITUTIONAL HEADER */}
      <ExecutiveSectionHeader
        title="Oficina Médica — Centro Personal de Salud"
        subtitle="Monitor personal de salud, actividad y bienestar estilo Apple Health"
        icon={<Stethoscope className="w-6 h-6 text-rose-400" />}
        accentColor="rose"
        badgeText="Apple Health Style"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar en historial clínico, vacunas, exámenes..."
      />

      {/* 1.5 RECORDATORIO NOCTURNO (>21:00) */}
      {isAfter21 && (
        <GlassPanel accentColor="purple" padding="sm" className="bg-gradient-to-r from-purple-950/70 via-indigo-900/50 to-slate-900 border-purple-500/40">
          <div className="flex items-center gap-3 text-xs text-purple-200">
            <Moon className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">Atmósfera Nocturna</span>
              <span>Es momento de descansar. Recuerda registrar tu hora de acostarte en el módulo de Sueño.</span>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 2. SMART HEALTH ALERTS BANNER */}
      {alerts.length > 0 && (
        <GlassPanel accentColor="rose" padding="sm" className="bg-gradient-to-r from-rose-950/50 via-slate-900/80 to-amber-950/40 border-rose-500/40 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              <h4 className="font-serif font-bold text-rose-200 text-xs uppercase tracking-wider">
                Notificaciones y Alertas de Salud ({alerts.length})
              </h4>
            </div>
            <span className="text-[10px] text-rose-300 font-mono">Monitoreo Preventivo</span>
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

      {/* 3. APPLE HEALTH TABS NAVIGATION */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'today', label: 'Salud de Hoy', icon: <Heart className="w-4 h-4" />, badge: `${wellnessIndex.overallScore}%` },
          { id: 'hydration', label: 'Hidratación', icon: <Droplet className="w-4 h-4" />, badge: `${metrics.hydrationPct}%` },
          { id: 'sleep_weight', label: 'Sueño & Peso', icon: <Moon className="w-4 h-4" /> },
          { id: 'activity', label: 'Actividad & Corazón', icon: <Activity className="w-4 h-4" /> },
          { id: 'medications', label: 'Medicamentos', icon: <Pill className="w-4 h-4" />, badge: activeMedsCount },
          { id: 'vaccines', label: 'Vacunas', icon: <ShieldCheck className="w-4 h-4" />, badge: (data.immunizations || []).length },
          { id: 'exams', label: 'Exámenes', icon: <FileText className="w-4 h-4" />, badge: pendingExamsCount },
          { id: 'appointments', label: 'Consultas Médicas', icon: <Calendar className="w-4 h-4" />, badge: pendingAppointmentsCount },
          { id: 'timeline', label: 'Historial Consolidado', icon: <Clock className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-t-2xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? 'border-rose-400 bg-rose-500/20 text-rose-200 shadow-lg'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === tab.id ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MAIN DASHBOARD: "SALUD DE HOY" (6 APPLE HEALTH WIDGETS GRID) */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <div className="space-y-6 animate-fadeIn">
          {/* HEADER BANNER - SALUD DE HOY */}
          <GlassPanel accentColor="rose" padding="md" className="bg-gradient-to-r from-[#1E0B19]/90 via-[#130713]/80 to-[#2A0B22]/80 border-rose-500/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-2xl text-rose-300">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-white tracking-wide">
                    Salud de Hoy
                  </h2>
                  <p className="text-xs text-rose-200/80">
                    Tu centro personal de salud en tiempo real. Respuestas claras sobre tu día en un vistazo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/90 border border-rose-500/30 px-4 py-2 rounded-2xl">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Índice de Bienestar</span>
                <span className="text-2xl font-bold font-mono text-white">{wellnessIndex.overallScore}%</span>
              </div>
            </div>
          </GlassPanel>

          {/* GRID DE 6 MÓDULOS DE SALUD DE HOY */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. HIDRATACIÓN */}
            <HydrationAppleWidget
              data={data}
              todayStr={todayStr}
              onOpenDetails={() => setActiveTab('hydration')}
            />

            {/* 2. SUEÑO */}
            <SleepAppleWidget
              data={data}
              todayStr={todayStr}
              onOpenDetails={() => setActiveTab('sleep_weight')}
            />

            {/* 3. ACTIVIDAD */}
            <ActivityWidget
              data={data}
              todayStr={todayStr}
              onOpenDetails={() => setActiveTab('activity')}
            />

            {/* 4. FRECUENCIA CARDÍACA */}
            <HeartRateWidget
              data={data}
              todayStr={todayStr}
              onOpenDetails={() => setActiveTab('activity')}
            />

            {/* 5. PESO */}
            <WeightAppleWidget
              data={data}
              todayStr={todayStr}
              onOpenDetails={() => setActiveTab('sleep_weight')}
            />

            {/* 6. MEDICAMENTOS */}
            <MedicationsAppleWidget
              data={data}
              todayStr={todayStr}
              onOpenDetails={() => setActiveTab('medications')}
            />
          </div>

          {/* ACCESOS RÁPIDOS A MÓDULOS SECUNDARIOS (SIN ALIMENTACIÓN) */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Módulos Clínicos & Seguimiento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab('appointments')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Consultas Médicas</div>
                    <div className="text-[10px] text-slate-400">{pendingAppointmentsCount} citas programadas</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('vaccines')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Carnet de Vacunas</div>
                    <div className="text-[10px] text-slate-400">{(data.immunizations || []).length} vacunas en carnet</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('exams')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Exámenes Clínicos</div>
                    <div className="text-[10px] text-slate-400">{(data.medicalExams || []).length} exámene(s) registrados</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Historial Consolidado</div>
                    <div className="text-[10px] text-slate-400">Línea de tiempo unificada</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED TABS */}
      {/* ========================================================================= */}

      {/* TAB: HIDRATACIÓN BOTELLA INTELIGENTE */}
      {activeTab === 'hydration' && (
        <div className="animate-fadeIn">
          <SmartBottleWidget data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB: SUEÑO Y PESO */}
      {activeTab === 'sleep_weight' && (
        <div className="space-y-6 animate-fadeIn">
          <SleepMoonWidget data={data} todayStr={todayStr} />
          <WeightTrendWidget data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB: ACTIVIDAD Y CORAZÓN DETALLADO */}
      {activeTab === 'activity' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityWidget data={data} todayStr={todayStr} />
            <HeartRateWidget data={data} todayStr={todayStr} />
          </div>
        </div>
      )}

      {/* TAB: MEDICAMENTOS */}
      {activeTab === 'medications' && (
        <div className="animate-fadeIn">
          <MedicationsSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB: CARNET DIGITAL DE VACUNAS */}
      {activeTab === 'vaccines' && (
        <div className="animate-fadeIn">
          <VaccinePassportSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB: EXÁMENES Y DIAGNÓSTICOS */}
      {activeTab === 'exams' && (
        <div className="animate-fadeIn">
          <ExamsAndConditionsSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB: CITAS MÉDICAS Y AGENDA */}
      {activeTab === 'appointments' && (
        <div className="animate-fadeIn">
          <AppointmentsSection data={data} todayStr={todayStr} />
        </div>
      )}

      {/* TAB: HISTORIAL DE SALUD CONSOLIDADO */}
      {activeTab === 'timeline' && (
        <div className="animate-fadeIn">
          <ConsolidatedTimelineSection data={data} todayStr={todayStr} />
        </div>
      )}
    </div>
  );
};

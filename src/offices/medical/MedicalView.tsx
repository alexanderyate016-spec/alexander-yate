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
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveForm,
} from '../../components/executive';
import {
  Stethoscope,
  Heart,
  Activity,
  Plus,
  Trash2,
  Calendar,
  ShieldCheck,
  Droplet,
  Moon,
  Scale,
  Pill,
  AlertTriangle
} from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
}

export const MedicalView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'meds' | 'appointments' | 'vaccines'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = getTodayDateString();

  // Daily log state
  const [weight, setWeight] = useState<number | ''>('');
  const [sleep, setSleep] = useState<number | ''>('');
  const [waterGlasses, setWaterGlasses] = useState<number | ''>('');

  // Med state
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medSchedule, setMedSchedule] = useState('');

  // Apt state
  const [aptTitle, setAptTitle] = useState('');
  const [aptSpec, setAptSpec] = useState('');
  const [aptDate, setAptDate] = useState(todayStr);
  const [aptStart, setAptStart] = useState('10:00');

  // Vaccine state
  const [vacName, setVacName] = useState('');
  const [vacReq, setVacReq] = useState(1);
  const [vacRec, setVacRec] = useState(1);

  const metrics = MedicalCalculations.getLatestHealthMetrics(data);
  const alerts = MedicalCalculations.getHealthAlerts(data);

  const handleSaveHealthRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !sleep && !waterGlasses) return;
    MedicalStore.addHealthRecord({
      date: todayStr,
      weightKg: weight ? Number(weight) : undefined,
      sleepHours: sleep ? Number(sleep) : undefined,
      hydrationGlasses: waterGlasses ? Number(waterGlasses) : undefined,
      hydrationLiters: waterGlasses ? Number(waterGlasses) * 0.25 : undefined
    });
    setWeight('');
    setSleep('');
    setWaterGlasses('');
  };

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;
    MedicalStore.addMedication({
      name: medName,
      dose: medDose || '1 dosis',
      schedule: medSchedule || 'Cada 24h',
      startDate: todayStr
    });
    setMedName('');
    setMedDose('');
    setMedSchedule('');
  };

  const handleCreateApt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptTitle) return;
    MedicalStore.addAppointment({
      title: aptTitle,
      specialty: aptSpec || 'Medicina General',
      date: aptDate,
      startTime: aptStart
    });
    setAptTitle('');
    setAptSpec('');
  };

  const handleCreateVac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName) return;
    MedicalStore.addImmunization({
      name: vacName,
      dosesRequired: vacReq,
      dosesReceived: vacRec,
      applicationDates: [todayStr],
      frequency: 'single'
    });
    setVacName('');
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* 1. SECTION HEADER INSTITUCIONAL (ROSO VINO ACCENT) */}
      <ExecutiveSectionHeader
        title="Oficina Médica y Salud Personal"
        subtitle="Agencia Superior de Salud, Registro Físico, Control Farmacéutico e Inmunizaciones"
        icon={<Stethoscope className="w-6 h-6 text-rose-400" />}
        accentColor="rose"
        badgeText="Salud & Bienestar"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar en registros..."
      />

      {/* 2. DASHBOARD DE INDICADORES DE SALUD Y ALERTAS REALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ExecutiveMetricCard
          title="Último Peso Registrado"
          value={metrics.weight !== null ? `${metrics.weight} kg` : 'Sin datos'}
          subtitle="Métrica de peso corporal"
          icon={<Scale className="w-5 h-5 text-rose-300" />}
          accentColor="rose"
        />

        <ExecutiveMetricCard
          title="Horas de Sueño"
          value={metrics.sleep !== null ? `${metrics.sleep} hrs` : 'Sin datos'}
          subtitle="Descanso acumulado"
          icon={<Moon className="w-5 h-5 text-indigo-300" />}
          accentColor="rose"
        />

        <ExecutiveMetricCard
          title="Nivel de Hidratación"
          value={metrics.hydrationLiters !== null ? `${metrics.hydrationLiters.toFixed(1)} L` : 'Sin datos'}
          subtitle="Consumo diario de agua"
          icon={<Droplet className="w-5 h-5 text-cyan-300" />}
          accentColor="rose"
        />

        <ExecutiveMetricCard
          title="Citas Médicas Pendientes"
          value={data.appointments.length}
          subtitle="Programadas en agenda"
          icon={<Calendar className="w-5 h-5 text-rose-400" />}
          accentColor="rose"
        />
      </div>

      {alerts.length > 0 && (
        <GlassPanel accentColor="rose" padding="sm" className="bg-rose-950/30 border-rose-500/40">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h4 className="font-serif font-bold text-rose-300 text-xs uppercase tracking-wider">
              Alertas del Sistema Médico
            </h4>
          </div>
          <div className="space-y-1">
            {alerts.map((al, idx) => (
              <p key={idx} className="text-xs text-rose-200">{al}</p>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* 3. TABS DE NAVEGACIÓN DE LA OFICINA */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'daily'
              ? 'border-rose-400 bg-rose-500/15 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          Salud Diaria ({data.healthRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('meds')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'meds'
              ? 'border-rose-400 bg-rose-500/15 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Pill className="w-4 h-4" />
          Medicamentos ({data.medications.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'appointments'
              ? 'border-rose-400 bg-rose-500/15 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Citas Médicas ({data.appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('vaccines')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'vaccines'
              ? 'border-rose-400 bg-rose-500/15 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Inmunizaciones ({data.immunizations.length})
        </button>
      </div>

      {/* TAB 1: SALUD DIARIA */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <GlassPanel accentColor="rose" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Registrar Indicadores Físicos del Día
            </h3>

            <ExecutiveForm onSubmit={handleSaveHealthRecord}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveInput
                  label="Peso Corporal (kg)"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 72.5"
                  value={weight}
                  onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="rose"
                  icon={<Scale className="w-4 h-4" />}
                />

                <ExecutiveInput
                  label="Sueño (horas)"
                  type="number"
                  step="0.5"
                  placeholder="Ej: 7.5"
                  value={sleep}
                  onChange={e => setSleep(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="rose"
                  icon={<Moon className="w-4 h-4" />}
                />

                <ExecutiveInput
                  label="Hidratación (Vasos)"
                  type="number"
                  placeholder="Ej: 8 vasos"
                  value={waterGlasses}
                  onChange={e => setWaterGlasses(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="rose"
                  icon={<Droplet className="w-4 h-4" />}
                  helperText="1 vaso ≈ 250ml"
                />

                <div className="flex justify-end">
                  <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                    Guardar Registro
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.healthRecords.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Heart className="w-8 h-8 text-rose-400" />}
              title="Sin Registros Diarios"
              description="No hay registros físicos de peso, sueño u hidratación guardados."
              accentColor="rose"
            />
          ) : (
            <div className="space-y-2.5">
              {data.healthRecords.map(r => (
                <ExecutiveCard key={r.id} accentColor="rose">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <span className="font-serif font-bold text-white text-sm">{r.date}</span>
                    <div className="flex flex-wrap gap-3 font-mono text-slate-300">
                      <span>⚖️ Peso: <strong className="text-rose-300">{r.weightKg ? `${r.weightKg} kg` : 'N/R'}</strong></span>
                      <span>🌙 Sueño: <strong className="text-indigo-300">{r.sleepHours ? `${r.sleepHours} hrs` : 'N/R'}</strong></span>
                      <span>💧 Agua: <strong className="text-cyan-300">{r.hydrationGlasses ? `${r.hydrationGlasses} vasos (${((r.hydrationGlasses || 0) * 0.25).toFixed(1)}L)` : 'N/R'}</strong></span>
                    </div>
                  </div>
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICAMENTOS */}
      {activeTab === 'meds' && (
        <div className="space-y-6">
          <GlassPanel accentColor="rose" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Registrar Medicamento / Tratamiento
            </h3>

            <ExecutiveForm onSubmit={handleCreateMed}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveInput
                  label="Nombre del Medicamento *"
                  placeholder="Ej: Ibuprofeno / Vitamina D"
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  accentColor="rose"
                  required
                />

                <ExecutiveInput
                  label="Dosis"
                  placeholder="Ej: 500mg / 1 cápsula"
                  value={medDose}
                  onChange={e => setMedDose(e.target.value)}
                  accentColor="rose"
                />

                <ExecutiveInput
                  label="Horario / Frecuencia"
                  placeholder="Ej: Cada 8 horas"
                  value={medSchedule}
                  onChange={e => setMedSchedule(e.target.value)}
                  accentColor="rose"
                />

                <div className="flex justify-end">
                  <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                    Guardar Medicamento
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.medications.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Pill className="w-8 h-8 text-rose-400" />}
              title="Sin Medicamentos Activos"
              description="No hay tratamientos o medicamentos guardados en el botiquín oficial."
              accentColor="rose"
            />
          ) : (
            <div className="space-y-2.5">
              {data.medications.map(m => (
                <ExecutiveCard key={m.id} accentColor="rose">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{m.name}</h4>
                      <p className="text-slate-400 font-mono">Dosis: {m.dose} • Frecuencia: {m.schedule}</p>
                    </div>
                    <button
                      onClick={() => MedicalStore.deleteMedication(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CITAS MÉDICAS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <GlassPanel accentColor="rose" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Agendar Cita Médica
            </h3>

            <ExecutiveForm onSubmit={handleCreateApt}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveInput
                  label="Concepto de la Cita *"
                  placeholder="Ej: Control Odontológico"
                  value={aptTitle}
                  onChange={e => setAptTitle(e.target.value)}
                  accentColor="rose"
                  required
                />

                <ExecutiveInput
                  label="Especialidad"
                  placeholder="Ej: Odontología / Cardiología"
                  value={aptSpec}
                  onChange={e => setAptSpec(e.target.value)}
                  accentColor="rose"
                />

                <ExecutiveInput
                  label="Fecha"
                  type="date"
                  value={aptDate}
                  onChange={e => setAptDate(e.target.value)}
                  accentColor="rose"
                />

                <ExecutiveInput
                  label="Hora"
                  type="time"
                  value={aptStart}
                  onChange={e => setAptStart(e.target.value)}
                  accentColor="rose"
                />
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                  Agendar Cita
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.appointments.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Calendar className="w-8 h-8 text-rose-400" />}
              title="Sin Citas Agendadas"
              description="No hay citas o consultas médicas programadas."
              accentColor="rose"
            />
          ) : (
            <div className="space-y-2.5">
              {data.appointments.map(a => (
                <ExecutiveCard key={a.id} accentColor="rose">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{a.title}</h4>
                      <p className="text-slate-400 font-mono">Especialidad: {a.specialty} • Fecha: {a.date} a las {a.startTime}</p>
                    </div>
                    <button
                      onClick={() => MedicalStore.deleteAppointment(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VACUNAS */}
      {activeTab === 'vaccines' && (
        <div className="space-y-6">
          <GlassPanel accentColor="rose" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" />
              Registrar Vacuna / Inmunización
            </h3>

            <ExecutiveForm onSubmit={handleCreateVac}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <ExecutiveInput
                    label="Nombre de la Vacuna *"
                    placeholder="Ej: Influenza / Fiebre Amarilla"
                    value={vacName}
                    onChange={e => setVacName(e.target.value)}
                    accentColor="rose"
                    required
                  />
                </div>

                <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                  Registrar Inmunización
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.immunizations.length === 0 ? (
            <ExecutiveEmptyState
              icon={<ShieldCheck className="w-8 h-8 text-rose-400" />}
              title="Sin Registro de Vacunas"
              description="No hay vacunas o inmunizaciones registradas en la cartilla de salud."
              accentColor="rose"
            />
          ) : (
            <div className="space-y-2.5">
              {data.immunizations.map(v => (
                <ExecutiveCard key={v.id} accentColor="rose">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{v.name}</h4>
                      <p className="text-slate-400 font-mono">Doses Aplicadas: {v.dosesReceived} / {v.dosesRequired}</p>
                    </div>
                    <button
                      onClick={() => MedicalStore.deleteImmunization(v.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

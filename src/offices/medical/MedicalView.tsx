import React, { useState } from 'react';
import { MedicalOfficeData } from '../../types/store';
import { MedicalStore } from './MedicalStore';
import { MedicalCalculations } from './MedicalCalculations';
import { getTodayDateString } from '../../utils/dates';
import { Stethoscope, Heart, Activity, Plus, Trash2, Calendar, ShieldCheck, Droplet, Moon, Scale } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
}

export const MedicalView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'meds' | 'appointments' | 'vaccines'>('daily');
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
    <div className="space-y-6">
      {/* 1. ENCABEZADO INSTITUCIONAL */}
      <div className="bg-presidential-navy text-white p-6 rounded-lg border-b-2 border-gold-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-900/60 rounded border border-emerald-700/50 text-emerald-300">
              <Stethoscope className="w-6 h-6 text-gold-accent" />
            </span>
            <h2 className="text-2xl font-serif-presidential font-bold tracking-tight text-white">
              Oficina Médica y Salud Personal
            </h2>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Agencia Superior de Salud, Registro Físico, Medicamentos e Inmunizaciones
          </p>
        </div>
      </div>

      {/* 2. PANEL GENERAL CON ALERTAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Peso</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {metrics.weight !== null ? `${metrics.weight} kg` : 'N/R'}
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Horas de Sueño</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {metrics.sleep !== null ? `${metrics.sleep} hrs` : 'N/R'}
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hidratación</div>
          <div className="text-2xl font-bold text-cyan-600 mt-1">
            {metrics.hydrationLiters !== null ? `${metrics.hydrationLiters.toFixed(1)} L` : 'N/R'}
          </div>
        </div>

        <div className="presidential-card p-4 rounded-lg">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Citas Pendientes</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {data.appointments.length}
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
          <div className="font-bold text-amber-900 text-xs uppercase">Alertas de Salud Informativas</div>
          {alerts.map((al, idx) => <div key={idx} className="text-xs text-amber-950">{al}</div>)}
        </div>
      )}

      {/* PESTAÑAS */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button onClick={() => setActiveTab('daily')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'daily' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500'}`}>
          Salud Diaria ({data.healthRecords.length})
        </button>
        <button onClick={() => setActiveTab('meds')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'meds' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500'}`}>
          Medicamentos ({data.medications.length})
        </button>
        <button onClick={() => setActiveTab('appointments')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'appointments' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500'}`}>
          Citas Médicas ({data.appointments.length})
        </button>
        <button onClick={() => setActiveTab('vaccines')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'vaccines' ? 'border-emerald-800 text-emerald-950' : 'border-transparent text-slate-500'}`}>
          Inmunizaciones / Vacunas ({data.immunizations.length})
        </button>
      </div>

      {/* TAB 1: SALUD DIARIA */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveHealthRecord} className="presidential-card p-5 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Peso (kg)</label>
              <input type="number" step="0.1" placeholder="Ej: 72.5" value={weight} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full text-xs p-2 border rounded bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Sueño (horas)</label>
              <input type="number" step="0.5" placeholder="Ej: 7.5" value={sleep} onChange={e => setSleep(e.target.value === '' ? '' : Number(e.target.value))} className="w-full text-xs p-2 border rounded bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Agua (Vasos)</label>
              <input type="number" placeholder="Ej: 8 vasos" value={waterGlasses} onChange={e => setWaterGlasses(e.target.value === '' ? '' : Number(e.target.value))} className="w-full text-xs p-2 border rounded bg-white" />
            </div>
            <button type="submit" className="bg-emerald-800 text-white font-bold text-xs p-2 rounded hover:bg-emerald-700">
              + Registrar Día
            </button>
          </form>

          <div className="space-y-2">
            {data.healthRecords.map(r => (
              <div key={r.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{r.date}</span>: Peso {r.weightKg || 'N/R'}kg | Sueño {r.sleepHours || 'N/R'}hrs | Agua {r.hydrationGlasses || 'N/R'} vasos ({((r.hydrationGlasses || 0) * 0.25).toFixed(1)}L)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAMENTOS */}
      {activeTab === 'meds' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateMed} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input type="text" placeholder="Medicamento *" value={medName} onChange={e => setMedName(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1" required />
            <input type="text" placeholder="Dosis (Ej: 500mg)" value={medDose} onChange={e => setMedDose(e.target.value)} className="text-xs p-2 border rounded bg-white w-28" />
            <input type="text" placeholder="Horario (Ej: Cada 8h)" value={medSchedule} onChange={e => setMedSchedule(e.target.value)} className="text-xs p-2 border rounded bg-white w-32" />
            <button type="submit" className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded hover:bg-slate-800">
              + Registrar
            </button>
          </form>

          <div className="space-y-2">
            {data.medications.map(m => (
              <div key={m.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{m.name}</span> - {m.dose} ({m.schedule})
                </div>
                <button onClick={() => MedicalStore.deleteMedication(m.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CITAS MÉDICAS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateApt} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input type="text" placeholder="Cita Médica *" value={aptTitle} onChange={e => setAptTitle(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1" required />
            <input type="text" placeholder="Especialidad" value={aptSpec} onChange={e => setAptSpec(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <input type="date" value={aptDate} onChange={e => setAptDate(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <input type="time" value={aptStart} onChange={e => setAptStart(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <button type="submit" className="text-xs bg-emerald-800 text-white font-bold px-4 py-2 rounded hover:bg-emerald-700">
              + Agendar Cita
            </button>
          </form>

          <div className="space-y-2">
            {data.appointments.map(a => (
              <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{a.title}</span> ({a.specialty}) - {a.date} a las {a.startTime}
                </div>
                <button onClick={() => MedicalStore.deleteAppointment(a.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VACUNAS */}
      {activeTab === 'vaccines' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateVac} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input type="text" placeholder="Vacuna *" value={vacName} onChange={e => setVacName(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1" required />
            <button type="submit" className="text-xs bg-blue-900 text-white font-bold px-4 py-2 rounded hover:bg-blue-800">
              + Registrar Vacuna
            </button>
          </form>

          <div className="space-y-2">
            {data.immunizations.map(v => (
              <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{v.name}</span> - Dosis aplicadas: {v.dosesReceived} / {v.dosesRequired}
                </div>
                <button onClick={() => MedicalStore.deleteImmunization(v.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

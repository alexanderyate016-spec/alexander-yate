import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { GlassPanel, ExecutiveButton, ExecutiveInput, ExecutiveCard, ExecutiveEmptyState, ExecutiveBadge } from '../../../components/executive';
import { FileText, Plus, Trash2, Activity, Calendar, Stethoscope, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const ExamsAndConditionsSection: React.FC<Props> = ({ data, todayStr }) => {
  const [activeSubTab, setActiveSubTab] = useState<'exams' | 'conditions'>('exams');

  // Exam Form
  const [showExamForm, setShowExamForm] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(todayStr);
  const [examDoctor, setExamDoctor] = useState('');
  const [examLocation, setExamLocation] = useState('');
  const [examResult, setExamResult] = useState('');
  const [nextControlDate, setNextControlDate] = useState('');
  const [examStatus, setExamStatus] = useState<'Pendiente' | 'Completado' | 'En revisión'>('Pendiente');

  // Condition Form
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [condName, setCondName] = useState('');
  const [condDiagnosedDate, setCondDiagnosedDate] = useState(todayStr);
  const [condStatus, setCondStatus] = useState<'active' | 'managed' | 'resolved'>('active');
  const [condNotes, setCondNotes] = useState('');

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    MedicalStore.addMedicalExam({
      name: examName.trim(),
      date: examDate,
      doctor: examDoctor.trim() || undefined,
      location: examLocation.trim() || undefined,
      resultSummary: examResult.trim() || undefined,
      nextControlDate: nextControlDate || undefined,
      status: examStatus
    });

    setExamName('');
    setExamDoctor('');
    setExamLocation('');
    setExamResult('');
    setNextControlDate('');
    setShowExamForm(false);
  };

  const handleCreateCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condName.trim()) return;

    MedicalStore.addCondition({
      name: condName.trim(),
      diagnosedDate: condDiagnosedDate,
      status: condStatus,
      notes: condNotes.trim() || undefined
    });

    setCondName('');
    setCondNotes('');
    setShowConditionForm(false);
  };

  const exams = data.medicalExams || [];
  const conditions = data.conditions || [];

  return (
    <div className="space-y-6">
      {/* SUB-TAB NAV */}
      <div className="flex border-b border-purple-500/20 space-x-2">
        <button
          onClick={() => setActiveSubTab('exams')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'exams'
              ? 'border-purple-400 bg-purple-500/15 text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Exámenes Médicos ({exams.length})
        </button>

        <button
          onClick={() => setActiveSubTab('conditions')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === 'conditions'
              ? 'border-purple-400 bg-purple-500/15 text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Historial de Enfermedades ({conditions.length})
        </button>
      </div>

      {/* SUB-TAB 1: EXÁMENES MÉDICOS */}
      {activeSubTab === 'exams' && (
        <div className="space-y-6">
          <GlassPanel accentColor="purple" padding="md" className="space-y-4 bg-gradient-to-br from-[#1B0B2B]/90 to-[#2A0E45]/80 border-purple-500/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Registro de Exámenes y Laboratorios</h3>
                <p className="text-xs text-purple-200/80">
                  Control de resultados de laboratorio, ecografías y próximos controles
                </p>
              </div>

              <button
                onClick={() => setShowExamForm(!showExamForm)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Registrar Examen Médico
              </button>
            </div>

            {showExamForm && (
              <form onSubmit={handleCreateExam} className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ExecutiveInput
                    label="Tipo / Nombre del Examen *"
                    placeholder="Ej: Perfil Lipídico / Hemograma completo"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    accentColor="rose"
                    required
                  />

                  <ExecutiveInput
                    label="Fecha de Realización"
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    accentColor="rose"
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Estado del Examen</label>
                    <select
                      value={examStatus}
                      onChange={e => setExamStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-[#170826] border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200 focus:outline-none"
                    >
                      <option value="Pendiente">⏳ Pendiente</option>
                      <option value="En revisión">🔍 En revisión</option>
                      <option value="Completado">✅ Completado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ExecutiveInput
                    label="Doctor / Especialista"
                    placeholder="Ej: Dr. Fernando Ruiz"
                    value={examDoctor}
                    onChange={e => setExamDoctor(e.target.value)}
                    accentColor="rose"
                  />

                  <ExecutiveInput
                    label="Laboratorio / Centro Médico"
                    placeholder="Ej: Laboratorio Synlab / Colcan"
                    value={examLocation}
                    onChange={e => setExamLocation(e.target.value)}
                    accentColor="rose"
                  />

                  <ExecutiveInput
                    label="Fecha del Próximo Control (Opcional)"
                    type="date"
                    value={nextControlDate}
                    onChange={e => setNextControlDate(e.target.value)}
                    accentColor="rose"
                  />
                </div>

                <ExecutiveInput
                  label="Resultado / Resumen del Informe (Texto libre)"
                  placeholder="Ej: Colecerol HDL normal, Glucosa en ayunas 85 mg/dL"
                  value={examResult}
                  onChange={e => setExamResult(e.target.value)}
                  accentColor="rose"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExamForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                    Guardar Examen
                  </ExecutiveButton>
                </div>
              </form>
            )}
          </GlassPanel>

          {exams.length === 0 ? (
            <ExecutiveEmptyState
              icon={<FileText className="w-8 h-8 text-purple-400" />}
              title="Sin Exámenes Registrados"
              description="No hay órdenes o resultados de exámenes médicos guardados."
              accentColor="rose"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(ex => (
                <ExecutiveCard key={ex.id} accentColor="rose" className="space-y-3 bg-gradient-to-br from-[#150721] to-[#0A0312] border-purple-500/30">
                  <div className="flex justify-between items-start gap-2 border-b border-purple-500/20 pb-2">
                    <div>
                      <h4 className="font-serif font-bold text-white text-base">{ex.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Fecha: {ex.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ExecutiveBadge accentColor={ex.status === 'Completado' ? 'emerald' : 'purple'}>
                        {ex.status || 'Pendiente'}
                      </ExecutiveBadge>

                      <button
                        onClick={() => MedicalStore.deleteMedicalExam(ex.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {ex.resultSummary && (
                    <div className="p-2.5 bg-[#0D0417] rounded-xl border border-purple-500/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-300 block">Resultado:</span>
                      <p className="text-xs text-slate-800">{ex.resultSummary}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 font-mono flex flex-wrap justify-between gap-2 pt-1">
                    {ex.doctor && <span>Dr: {ex.doctor}</span>}
                    {ex.location && <span>Centro: {ex.location}</span>}
                    {ex.nextControlDate && <span className="text-amber-300 font-bold">Control: {ex.nextControlDate}</span>}
                  </div>
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: HISTORIAL DE ENFERMEDADES */}
      {activeSubTab === 'conditions' && (
        <div className="space-y-6">
          <GlassPanel accentColor="purple" padding="md" className="space-y-4 bg-gradient-to-br from-[#1B0B2B]/90 to-[#2A0E45]/80 border-purple-500/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Historial de Condiciones y Enfermedades</h3>
                <p className="text-xs text-purple-200/80">
                  Registro de diagnóstico y evolución personal (sin autodiagnósticos automatizados)
                </p>
              </div>

              <button
                onClick={() => setShowConditionForm(!showConditionForm)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Registrar Condición
              </button>
            </div>

            {showConditionForm && (
              <form onSubmit={handleCreateCondition} className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ExecutiveInput
                    label="Nombre de la Condición / Enfermedad *"
                    placeholder="Ej: Hipertensión arterial / Asma / Gastritis"
                    value={condName}
                    onChange={e => setCondName(e.target.value)}
                    accentColor="rose"
                    required
                  />

                  <ExecutiveInput
                    label="Fecha de Diagnóstico"
                    type="date"
                    value={condDiagnosedDate}
                    onChange={e => setCondDiagnosedDate(e.target.value)}
                    accentColor="rose"
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Estado de la Condición</label>
                    <select
                      value={condStatus}
                      onChange={e => setCondStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-[#170826] border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200 focus:outline-none"
                    >
                      <option value="active">🔴 Activa / En tratamiento</option>
                      <option value="managed">🟡 Controlada</option>
                      <option value="resolved">🟢 Resuelta</option>
                    </select>
                  </div>
                </div>

                <ExecutiveInput
                  label="Observaciones y Seguimiento"
                  placeholder="Ej: Requiere bajo consumo de sodio y chequeo trimestral"
                  value={condNotes}
                  onChange={e => setCondNotes(e.target.value)}
                  accentColor="rose"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConditionForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                    Guardar Registro
                  </ExecutiveButton>
                </div>
              </form>
            )}
          </GlassPanel>

          {conditions.length === 0 ? (
            <ExecutiveEmptyState
              icon={<ShieldAlert className="w-8 h-8 text-purple-400" />}
              title="Sin Condiciones Registradas"
              description="No hay condiciones o historial de patologías guardadas."
              accentColor="rose"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conditions.map(c => (
                <ExecutiveCard key={c.id} accentColor="rose" className="space-y-2 bg-gradient-to-br from-[#150721] to-[#0A0312] border-purple-500/30">
                  <div className="flex justify-between items-center gap-2 border-b border-purple-500/20 pb-2">
                    <h4 className="font-serif font-bold text-white text-base">{c.name}</h4>

                    <div className="flex items-center gap-2">
                      <ExecutiveBadge accentColor={c.status === 'resolved' ? 'emerald' : c.status === 'managed' ? 'amber' : 'rose'}>
                        {c.status === 'resolved' ? 'Resuelta' : c.status === 'managed' ? 'Controlada' : 'Activa'}
                      </ExecutiveBadge>

                      <button
                        onClick={() => MedicalStore.deleteCondition(c.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {c.diagnosedDate && (
                    <p className="text-xs text-slate-500 font-mono">
                      Diagnóstico: <strong className="text-purple-300">{c.diagnosedDate}</strong>
                    </p>
                  )}

                  {c.notes && (
                    <p className="text-xs text-slate-800 bg-[#0D0417] p-2.5 rounded-xl border border-purple-500/20">
                      {c.notes}
                    </p>
                  )}
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

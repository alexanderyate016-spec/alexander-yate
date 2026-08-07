import React, { useState } from 'react';
import { MedicalOfficeData, MedicationItem } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { GlassPanel, ExecutiveButton, ExecutiveInput, ExecutiveCard, ExecutiveEmptyState, ExecutiveBadge } from '../../../components/executive';
import { Pill, Plus, Trash2, Clock, Calendar, CheckCircle2, PauseCircle, Play, FileText } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const MedicationsSection: React.FC<Props> = ({ data, todayStr }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [schedule, setSchedule] = useState('Cada 24 horas');
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'paused'>('active');

  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      MedicalStore.updateMedication(editingId, {
        name: name.trim(),
        dose: dose.trim() || '1 dosis',
        schedule: schedule.trim() || 'Cada 24h',
        timeOfDay,
        startDate,
        endDate: endDate || undefined,
        instructions: instructions.trim() || undefined,
        status
      });
      setEditingId(null);
    } else {
      MedicalStore.addMedication({
        name: name.trim(),
        dose: dose.trim() || '1 dosis',
        schedule: schedule.trim() || 'Cada 24h',
        timeOfDay,
        startDate,
        endDate: endDate || undefined,
        instructions: instructions.trim() || undefined,
        status
      });
    }

    // Reset
    setName('');
    setDose('');
    setSchedule('Cada 24 horas');
    setInstructions('');
    setEndDate('');
    setShowForm(false);
  };

  const handleEdit = (m: MedicationItem) => {
    setEditingId(m.id);
    setName(m.name);
    setDose(m.dose);
    setSchedule(m.schedule);
    setTimeOfDay(m.timeOfDay || '08:00');
    setStartDate(m.startDate);
    setEndDate(m.endDate || '');
    setInstructions(m.instructions || '');
    setStatus(m.status || 'active');
    setShowForm(true);
  };

  const medications = data.medications || [];

  return (
    <div className="space-y-6">
      {/* HEADER & NEW MED BUTTON */}
      <GlassPanel accentColor="blue" padding="md" className="space-y-4 bg-gradient-to-br from-[#061F2B]/90 to-[#0A3347]/80 border-cyan-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl text-cyan-300">
              <Pill className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Botiquín y Tratamiento Farmacéutico</h3>
              <p className="text-xs text-cyan-200/80">
                Sincronización de tomas diarias a horas fijas en la Agenda Ejecutiva
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Registrar Medicamento
          </button>
        </div>

        {/* EXPANDABLE FORM */}
        {showForm && (
          <form onSubmit={handleSaveMedication} className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              {editingId ? 'Editar Medicamento' : 'Nuevo Medicamento en Botiquín'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ExecutiveInput
                label="Nombre del Medicamento *"
                placeholder="Ej: Amoxicilina / Paracetamol / Omeprazol"
                value={name}
                onChange={e => setName(e.target.value)}
                accentColor="rose"
                required
              />

              <ExecutiveInput
                label="Dosis"
                placeholder="Ej: 500mg / 1 Cápsula / 5ml"
                value={dose}
                onChange={e => setDose(e.target.value)}
                accentColor="rose"
              />

              <ExecutiveInput
                label="Frecuencia de Toma"
                placeholder="Ej: Cada 8 horas / Cada 12 horas"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                accentColor="rose"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <ExecutiveInput
                label="Hora Programada de Toma"
                type="time"
                value={timeOfDay}
                onChange={e => setTimeOfDay(e.target.value)}
                accentColor="rose"
                icon={<Clock className="w-3.5 h-3.5" />}
              />

              <ExecutiveInput
                label="Fecha de Inicio"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                accentColor="rose"
              />

              <ExecutiveInput
                label="Fecha de Finalización (Opcional)"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                accentColor="rose"
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estado del Tratamiento</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-[#051A25] border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-200 focus:outline-none"
                >
                  <option value="active">🟢 Activo</option>
                  <option value="paused">⏸️ Pausado</option>
                  <option value="completed">🏁 Completado</option>
                </select>
              </div>
            </div>

            <ExecutiveInput
              label="Indicaciones o Instrucciones Especiales"
              placeholder="Ej: Tomar con abundantes líquidos junto con las comidas"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              accentColor="rose"
              icon={<FileText className="w-3.5 h-3.5" />}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
              >
                Cancelar
              </button>
              <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                {editingId ? 'Actualizar' : 'Guardar Tratamiento'}
              </ExecutiveButton>
            </div>
          </form>
        )}
      </GlassPanel>

      {/* MEDICATIONS LIST */}
      {medications.length === 0 ? (
        <ExecutiveEmptyState
          icon={<Pill className="w-8 h-8 text-cyan-400" />}
          title="Botiquín Sin Medicamentos"
          description="No hay medicamentos ni tratamientos activos guardados."
          accentColor="rose"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map(m => (
            <ExecutiveCard key={m.id} accentColor="rose" className="space-y-3 bg-gradient-to-br from-[#061824] to-[#030F17] border-cyan-500/30">
              <div className="flex justify-between items-start gap-2 border-b border-cyan-500/20 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-300">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-white text-base">{m.name}</h4>
                    <p className="text-xs text-cyan-300 font-mono">Dosis: {m.dose}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ExecutiveBadge accentColor={m.status === 'active' ? 'emerald' : m.status === 'paused' ? 'amber' : 'blue'}>
                    {m.status === 'active' ? 'Activo' : m.status === 'paused' ? 'Pausado' : 'Completado'}
                  </ExecutiveBadge>

                  <button
                    onClick={() => handleEdit(m)}
                    className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => MedicalStore.deleteMedication(m.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="p-2 bg-[#04121B] rounded-lg border border-cyan-500/15">
                  <span className="text-[10px] text-slate-500 block font-mono">Hora Programada</span>
                  <span className="font-bold text-white font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {m.timeOfDay || '08:00'} AM/PM
                  </span>
                </div>

                <div className="p-2 bg-[#04121B] rounded-lg border border-cyan-500/15">
                  <span className="text-[10px] text-slate-500 block font-mono">Frecuencia</span>
                  <span className="font-bold text-cyan-200">{m.schedule}</span>
                </div>
              </div>

              {m.instructions && (
                <p className="text-xs text-slate-700 bg-[#04121B] p-2 rounded-lg border border-cyan-500/15">
                  <strong>Indicaciones:</strong> {m.instructions}
                </p>
              )}

              <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center pt-1 border-t border-cyan-500/10">
                <span>Inicio: {m.startDate}</span>
                {m.endDate && <span>Fin: {m.endDate}</span>}
              </div>
            </ExecutiveCard>
          ))}
        </div>
      )}
    </div>
  );
};

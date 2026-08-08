import React, { useState } from 'react';
import { MedicalOfficeData, MedicalAppointment } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { GlassPanel, ExecutiveButton, ExecutiveInput, ExecutiveCard, ExecutiveEmptyState, ExecutiveBadge } from '../../../components/executive';
import { Calendar, Plus, Trash2, Clock, MapPin, Stethoscope, User, Building, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const AppointmentsSection: React.FC<Props> = ({ data, todayStr }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState('Medicina General');
  const [doctor, setDoctor] = useState('');
  const [institution, setInstitution] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(20); // Default 20 mins
  const [endTime, setEndTime] = useState('10:20');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Programada' | 'Realizada' | 'Cancelada' | 'Reprogramada'>('Programada');

  // Compute end time when startTime or duration changes
  const handleStartTimeChange = (newStart: string, dur = durationMinutes) => {
    setStartTime(newStart);
    if (!newStart) return;
    const [h, m] = newStart.split(':').map(Number);
    const totalMinutes = h * 60 + m + dur;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleDurationChange = (dur: number) => {
    setDurationMinutes(dur);
    handleStartTimeChange(startTime, dur);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      MedicalStore.updateAppointment(editingId, {
        title: title.trim(),
        specialty: specialty.trim(),
        doctor: doctor.trim() || undefined,
        institution: institution.trim() || undefined,
        date,
        startTime,
        endTime,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        status
      });
      setEditingId(null);
    } else {
      MedicalStore.addAppointment({
        title: title.trim(),
        specialty: specialty.trim(),
        doctor: doctor.trim() || undefined,
        institution: institution.trim() || undefined,
        date,
        startTime,
        endTime,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        status
      });
    }

    // Reset
    setTitle('');
    setDoctor('');
    setInstitution('');
    setReason('');
    setNotes('');
    setShowForm(false);
  };

  const handleEdit = (apt: MedicalAppointment) => {
    setEditingId(apt.id);
    setTitle(apt.title);
    setSpecialty(apt.specialty);
    setDoctor(apt.doctor || '');
    setInstitution(apt.institution || '');
    setDate(apt.date);
    setStartTime(apt.startTime);
    setEndTime(apt.endTime || '10:20');
    setReason(apt.reason || '');
    setNotes(apt.notes || '');
    setStatus(apt.status || 'Programada');
    setShowForm(true);
  };

  const appointments = data.appointments || [];

  const getStatusBadgeVariant = (st?: string): 'emerald' | 'rose' | 'amber' | 'blue' => {
    switch (st) {
      case 'Realizada': return 'emerald';
      case 'Cancelada': return 'rose';
      case 'Reprogramada': return 'amber';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & NEW APPOINTMENT BUTTON */}
      <GlassPanel accentColor="rose" padding="md" className="space-y-4 bg-gradient-to-br from-[#1C0A15]/90 to-[#2A0E1C]/80 border-rose-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-2xl text-rose-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Gestión de Citas Médicas</h3>
              <p className="text-xs text-rose-200/80">
                Sincronización directa con la Agenda Ejecutiva, duración editable e instituciones
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Agendar Cita Médica
          </button>
        </div>

        {/* EXPANDABLE FORM */}
        {showForm && (
          <form onSubmit={handleSaveAppointment} className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-3 animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">
              {editingId ? 'Editar Cita Médica' : 'Nueva Cita Médica'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ExecutiveInput
                label="Concepto / Título de la Cita *"
                placeholder="Ej: Control de Cardiología / Consulta Odontológica"
                value={title}
                onChange={e => setTitle(e.target.value)}
                accentColor="rose"
                required
              />

              <ExecutiveInput
                label="Especialidad Médica"
                placeholder="Ej: Odontología / Oftalmología"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                accentColor="rose"
              />

              <ExecutiveInput
                label="Profesional / Doctor(a)"
                placeholder="Ej: Dr. Carlos Mendoza"
                value={doctor}
                onChange={e => setDoctor(e.target.value)}
                accentColor="rose"
                icon={<User className="w-3.5 h-3.5" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <ExecutiveInput
                label="Institución / Clínica"
                placeholder="Ej: Clínica Marly / IPS Colsanitas"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                accentColor="rose"
                icon={<Building className="w-3.5 h-3.5" />}
              />

              <ExecutiveInput
                label="Fecha de la Cita"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                accentColor="rose"
              />

              <ExecutiveInput
                label="Hora de Inicio"
                type="time"
                value={startTime}
                onChange={e => handleStartTimeChange(e.target.value)}
                accentColor="rose"
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Duración (Por defecto 20m)</label>
                <select
                  value={durationMinutes}
                  onChange={e => handleDurationChange(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#17050E] border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200 focus:outline-none"
                >
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos (estándar)</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ExecutiveInput
                label="Hora de Finalización"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                accentColor="rose"
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Estado de la Cita</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-[#17050E] border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200 focus:outline-none"
                >
                  <option value="Programada">📅 Programada</option>
                  <option value="Realizada">✅ Realizada</option>
                  <option value="Reprogramada">🔄 Reprogramada</option>
                  <option value="Cancelada">❌ Cancelada</option>
                </select>
              </div>

              <ExecutiveInput
                label="Motivo de la Consulta"
                placeholder="Ej: Chequeo anual de rutina"
                value={reason}
                onChange={e => setReason(e.target.value)}
                accentColor="rose"
              />
            </div>

            <ExecutiveInput
              label="Observaciones o Indicaciones Previas"
              placeholder="Ej: Asistir en ayunas de 8 horas"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              accentColor="rose"
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
                {editingId ? 'Actualizar Cita' : 'Guardar y Sincronizar'}
              </ExecutiveButton>
            </div>
          </form>
        )}
      </GlassPanel>

      {/* APPOINTMENTS CARDS LIST */}
      {appointments.length === 0 ? (
        <ExecutiveEmptyState
          icon={<Calendar className="w-8 h-8 text-rose-400" />}
          title="Sin Citas Médicas Agendadas"
          description="No hay citas o consultas médicas programadas en el sistema."
          accentColor="rose"
        />
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <ExecutiveCard key={apt.id} accentColor="rose" className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">{apt.title}</h4>
                    <p className="text-xs text-rose-700 font-medium">Especialidad: {apt.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ExecutiveBadge accentColor={getStatusBadgeVariant(apt.status)}>
                    {apt.status || 'Programada'}
                  </ExecutiveBadge>

                  <button
                    onClick={() => handleEdit(apt)}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors font-medium"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => MedicalStore.deleteAppointment(apt.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DETAILS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-rose-500/10 font-sans">
                <div className="flex items-center gap-1.5 text-slate-700 font-mono">
                  <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{apt.date} de {apt.startTime} a {apt.endTime || '10:20'}</span>
                </div>

                {apt.doctor && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <User className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Dr(a). {apt.doctor}</span>
                  </div>
                )}

                {apt.institution && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{apt.institution}</span>
                  </div>
                )}
              </div>

              {apt.reason && (
                <p className="text-xs text-slate-700 bg-[#14060E] p-2 rounded-lg border border-rose-500/20">
                  <strong>Motivo:</strong> {apt.reason}
                </p>
              )}

              {apt.notes && (
                <p className="text-[11px] text-slate-500 italic">
                  Observaciones: {apt.notes}
                </p>
              )}
            </ExecutiveCard>
          ))}
        </div>
      )}
    </div>
  );
};

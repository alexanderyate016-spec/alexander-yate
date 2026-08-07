import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { GlassPanel, ExecutiveButton, ExecutiveInput, ExecutiveCard, ExecutiveEmptyState, ExecutiveBadge } from '../../../components/executive';
import { ShieldCheck, Plus, Trash2, Calendar, MapPin, Building, User, Tag, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const VaccinePassportSection: React.FC<Props> = ({ data, todayStr }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [vacName, setVacName] = useState('');
  const [preventsDisease, setPreventsDisease] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [dosesRequired, setDosesRequired] = useState(1);
  const [dosesReceived, setDosesReceived] = useState(1);
  const [applicationDate, setApplicationDate] = useState(todayStr);
  const [locationApplied, setLocationApplied] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [frequency, setFrequency] = useState<'single' | 'multiple' | 'booster' | 'annual' | 'custom'>('single');
  const [frequencyYears, setFrequencyYears] = useState<number | ''>(5);
  const [notes, setNotes] = useState('');

  const calculateNextDoseDate = (appDateStr: string, freq: string, years?: number): string | undefined => {
    if (freq === 'single') return undefined;
    const date = new Date(appDateStr);
    if (isNaN(date.getTime())) return undefined;

    if (freq === 'annual') {
      date.setFullYear(date.getFullYear() + 1);
      return date.toISOString().split('T')[0];
    }
    if (freq === 'custom' && years && years > 0) {
      date.setFullYear(date.getFullYear() + Number(years));
      return date.toISOString().split('T')[0];
    }
    if (freq === 'booster' || freq === 'multiple') {
      // Default next booster in 6 months or 1 year
      date.setMonth(date.getMonth() + 6);
      return date.toISOString().split('T')[0];
    }
    return undefined;
  };

  const handleCreateVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName.trim()) return;

    const nextDoseDate = calculateNextDoseDate(applicationDate, frequency, typeof frequencyYears === 'number' ? frequencyYears : undefined);

    MedicalStore.addImmunization({
      name: vacName.trim(),
      preventsDisease: preventsDisease.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      dosesRequired: Number(dosesRequired),
      dosesReceived: Number(dosesReceived),
      applicationDates: [applicationDate],
      lastApplicationDate: applicationDate,
      locationApplied: locationApplied.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      administeredBy: administeredBy.trim() || undefined,
      frequency,
      frequencyYears: typeof frequencyYears === 'number' ? frequencyYears : undefined,
      nextDoseDate,
      notes: notes.trim() || undefined
    });

    // Reset Form
    setVacName('');
    setPreventsDisease('');
    setManufacturer('');
    setDosesRequired(1);
    setDosesReceived(1);
    setLocationApplied('');
    setBatchNumber('');
    setAdministeredBy('');
    setFrequency('single');
    setNotes('');
    setShowAddForm(false);
  };

  const immunizations = data.immunizations || [];

  return (
    <div className="space-y-6">
      {/* HEADER & NEW VACCINE BUTTON */}
      <GlassPanel accentColor="amber" padding="md" className="space-y-4 bg-gradient-to-br from-[#241305]/90 to-[#3D1E08]/80 border-amber-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white tracking-wide">
                Carnet Digital de Vacunación e Inmunización
              </h3>
              <p className="text-xs text-amber-200/80">
                Registro de esquema inmunológico, fabricantes, lotes y cálculo automático de refuerzos
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Registrar Nueva Vacuna
          </button>
        </div>

        {/* EXPANDABLE CARNET CREATION FORM */}
        {showAddForm && (
          <form onSubmit={handleCreateVaccine} className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ExecutiveInput
                label="Nombre de la Vacuna *"
                placeholder="Ej: Fiebre Amarilla / Influenza / Hepatitis B"
                value={vacName}
                onChange={e => setVacName(e.target.value)}
                accentColor="amber"
                required
              />

              <ExecutiveInput
                label="Enfermedad que Previene"
                placeholder="Ej: Infección viral por Fiebre Amarilla"
                value={preventsDisease}
                onChange={e => setPreventsDisease(e.target.value)}
                accentColor="amber"
              />

              <ExecutiveInput
                label="Fabricante / Laboratorio (Opcional)"
                placeholder="Ej: Sanofi Pasteur / Pfizer"
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                accentColor="amber"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dosis del Esquema *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={dosesReceived}
                    onChange={e => setDosesReceived(Number(e.target.value))}
                    className="w-1/2 p-2 bg-[#1A0E04] border border-amber-500/40 rounded-xl text-xs text-amber-200 font-bold"
                  />
                  <span className="text-xs text-slate-500">de</span>
                  <input
                    type="number"
                    min="1"
                    value={dosesRequired}
                    onChange={e => setDosesRequired(Number(e.target.value))}
                    className="w-1/2 p-2 bg-[#1A0E04] border border-amber-500/40 rounded-xl text-xs text-amber-200 font-bold"
                  />
                </div>
              </div>

              <ExecutiveInput
                label="Fecha de Aplicación"
                type="date"
                value={applicationDate}
                onChange={e => setApplicationDate(e.target.value)}
                accentColor="amber"
              />

              <ExecutiveInput
                label="Lugar donde fue Aplicada"
                placeholder="Ej: Centro de Salud / IPS Sanitas"
                value={locationApplied}
                onChange={e => setLocationApplied(e.target.value)}
                accentColor="amber"
                icon={<MapPin className="w-3.5 h-3.5" />}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Frecuencia / Refuerzos</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full p-2.5 bg-[#1A0E04] border border-amber-500/40 rounded-xl text-xs font-bold text-amber-200 focus:outline-none"
                >
                  <option value="single">Dosis única (sin refuerzo)</option>
                  <option value="annual">Refuerzo Anual (cada 1 año)</option>
                  <option value="booster">Múltiples Dosis (en 6 meses)</option>
                  <option value="custom">Refuerzo Periódico (cada X años)</option>
                </select>
              </div>
            </div>

            {frequency === 'custom' && (
              <div className="w-48">
                <ExecutiveInput
                  label="Años entre Refuerzos"
                  type="number"
                  min="1"
                  value={frequencyYears}
                  onChange={e => setFrequencyYears(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="amber"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ExecutiveInput
                label="Número de Lote (Opcional)"
                placeholder="Ej: LT-994812"
                value={batchNumber}
                onChange={e => setBatchNumber(e.target.value)}
                accentColor="amber"
              />

              <ExecutiveInput
                label="Profesional que Aplicó (Opcional)"
                placeholder="Ej: Dr. Fernando Ruiz / Enfr. María"
                value={administeredBy}
                onChange={e => setAdministeredBy(e.target.value)}
                accentColor="amber"
              />

              <ExecutiveInput
                label="Observaciones"
                placeholder="Ej: Sin efectos secundarios graves"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                accentColor="amber"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
              >
                Cancelar
              </button>
              <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
                Guardar en Carnet Digital
              </ExecutiveButton>
            </div>
          </form>
        )}
      </GlassPanel>

      {/* CARNET DIGITAL CARDS GRID */}
      {immunizations.length === 0 ? (
        <ExecutiveEmptyState
          icon={<ShieldCheck className="w-8 h-8 text-amber-400" />}
          title="Carnet Digital Vacío"
          description="No has registrado vacunas en tu carnet digital de salud."
          accentColor="rose"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {immunizations.map(vac => {
            const isComplete = vac.dosesReceived >= vac.dosesRequired;

            return (
              <ExecutiveCard key={vac.id} accentColor="rose" className="space-y-3 bg-gradient-to-br from-[#1C120A] to-[#120B05] border-amber-500/30">
                {/* CARNET TOP BAR */}
                <div className="flex justify-between items-start gap-2 border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-base">{vac.name}</h4>
                      {vac.preventsDisease && (
                        <p className="text-xs text-amber-300/90 font-medium">Previene: {vac.preventsDisease}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ExecutiveBadge accentColor={isComplete ? 'emerald' : 'amber'}>
                      Dosis {vac.dosesReceived} / {vac.dosesRequired}
                    </ExecutiveBadge>

                    <button
                      onClick={() => MedicalStore.deleteImmunization(vac.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {vac.lastApplicationDate && (
                    <div className="flex items-center gap-1.5 text-slate-700 bg-[#0F0803] p-2 rounded-lg border border-amber-500/15">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">Última Aplicación</span>
                        <span className="font-bold text-white">{vac.lastApplicationDate}</span>
                      </div>
                    </div>
                  )}

                  {vac.locationApplied && (
                    <div className="flex items-center gap-1.5 text-slate-700 bg-[#0F0803] p-2 rounded-lg border border-amber-500/15">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">Lugar</span>
                        <span className="font-bold text-white truncate max-w-[120px] block">{vac.locationApplied}</span>
                      </div>
                    </div>
                  )}

                  {vac.manufacturer && (
                    <div className="flex items-center gap-1.5 text-slate-700 bg-[#0F0803] p-2 rounded-lg border border-amber-500/15">
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">Fabricante</span>
                        <span className="font-bold text-white">{vac.manufacturer}</span>
                      </div>
                    </div>
                  )}

                  {vac.batchNumber && (
                    <div className="flex items-center gap-1.5 text-slate-700 bg-[#0F0803] p-2 rounded-lg border border-amber-500/15">
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">Lote</span>
                        <span className="font-bold text-white font-mono">{vac.batchNumber}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* NEXT DOSE BOOSTER BANNER */}
                {vac.nextDoseDate && (
                  <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-200 font-bold">Próximo Refuerzo Programado:</span>
                    </div>
                    <span className="font-mono font-bold text-white bg-amber-500/30 px-2.5 py-0.5 rounded-lg">
                      {vac.nextDoseDate}
                    </span>
                  </div>
                )}

                {vac.notes && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-amber-500/10">
                    Notas: {vac.notes}
                  </p>
                )}
              </ExecutiveCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

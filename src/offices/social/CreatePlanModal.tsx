import React, { useState } from 'react';
import { SocialOfficeData, SocialPerson, SocialEventType } from '../../types/store';
import { SocialStore } from './SocialStore';
import { getTodayDateString } from '../../utils/dates';
import {
  X,
  Plus,
  Check,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  UserPlus
} from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onPersonCreated?: (personId: string) => void;
}

export const EVENT_TYPE_OPTIONS: Array<{
  id: SocialEventType;
  label: string;
  emoji: string;
  color: string;
}> = [
  { id: 'Café', label: 'Café', emoji: '☕', color: 'from-amber-600/30 to-amber-700/20 border-amber-500/40 text-amber-200' },
  { id: 'Comer', label: 'Comer', emoji: '🍕', color: 'from-orange-600/30 to-orange-700/20 border-orange-500/40 text-orange-200' },
  { id: 'Cine', label: 'Cine', emoji: '🎬', color: 'from-purple-600/30 to-purple-700/20 border-purple-500/40 text-purple-200' },
  { id: 'Caminar', label: 'Caminar', emoji: '🚶', color: 'from-emerald-600/30 to-emerald-700/20 border-emerald-500/40 text-emerald-200' },
  { id: 'Deporte', label: 'Deporte', emoji: '🏀', color: 'from-blue-600/30 to-blue-700/20 border-blue-500/40 text-blue-200' },
  { id: 'Fiesta', label: 'Fiesta', emoji: '🎉', color: 'from-pink-600/30 to-pink-700/20 border-pink-500/40 text-pink-200' },
  { id: 'Concierto', label: 'Concierto', emoji: '🎵', color: 'from-indigo-600/30 to-indigo-700/20 border-indigo-500/40 text-indigo-200' },
  { id: 'Viaje', label: 'Viaje', emoji: '🏖️', color: 'from-cyan-600/30 to-cyan-700/20 border-cyan-500/40 text-cyan-200' },
  { id: 'Reunión familiar', label: 'Reunión familiar', emoji: '👨‍👩‍👧', color: 'from-rose-600/30 to-rose-700/20 border-rose-500/40 text-rose-200' },
  { id: 'Estudio en grupo', label: 'Estudio en grupo', emoji: '📚', color: 'from-yellow-600/30 to-yellow-700/20 border-yellow-500/40 text-yellow-200' },
  { id: 'Salida nocturna', label: 'Salida nocturna', emoji: '🍻', color: 'from-violet-600/30 to-violet-700/20 border-violet-500/40 text-violet-200' },
  { id: 'Cena', label: 'Cena', emoji: '🍽️', color: 'from-red-600/30 to-red-700/20 border-red-500/40 text-red-200' },
  { id: 'Almuerzo', label: 'Almuerzo', emoji: '🥗', color: 'from-teal-600/30 to-teal-700/20 border-teal-500/40 text-teal-200' },
  { id: 'Partido', label: 'Partido', emoji: '⚽', color: 'from-lime-600/30 to-lime-700/20 border-lime-500/40 text-lime-200' },
  { id: 'Celebración', label: 'Celebración', emoji: '🎊', color: 'from-fuchsia-600/30 to-fuchsia-700/20 border-fuchsia-500/40 text-fuchsia-200' },
  { id: 'Otro', label: 'Otro Plan', emoji: '📌', color: 'from-slate-600/30 to-slate-700/20 border-slate-500/40 text-slate-800' }
];

export const CreatePlanModal: React.FC<Props> = ({
  data,
  isOpen,
  onClose,
  defaultDate
}) => {
  if (!isOpen) return null;

  const todayStr = defaultDate || getTodayDateString();

  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Event Type & Custom Title
  const [selectedType, setSelectedType] = useState<SocialEventType>('Café');
  const [customTitle, setCustomTitle] = useState('');

  // Step 2: Participants
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [isCreatingPersonInline, setIsCreatingPersonInline] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRelation, setNewPersonRelation] = useState('');

  // Step 3: Date, Time & Details
  const [planDate, setPlanDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [isSaved, setIsSaved] = useState(false);

  const people = data.people || [];

  const handleTogglePerson = (id: string) => {
    if (selectedPersonIds.includes(id)) {
      setSelectedPersonIds(selectedPersonIds.filter(pId => pId !== id));
    } else {
      setSelectedPersonIds([...selectedPersonIds, id]);
    }
  };

  const handleCreatePersonInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newId = 'prsn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    SocialStore.addPerson({
      name: newPersonName.trim(),
      relationship: newPersonRelation.trim() || 'Amigo',
      category: 'Amigos',
      importanceLevel: 'Importante',
      tags: []
    });

    setSelectedPersonIds(prev => [...prev, newId]);
    setNewPersonName('');
    setNewPersonRelation('');
    setIsCreatingPersonInline(false);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTypeObj = EVENT_TYPE_OPTIONS.find(o => o.id === selectedType);
    const participantNames = selectedPersonIds
      .map(id => people.find(p => p.id === id)?.name)
      .filter(Boolean);

    let title = customTitle.trim();
    if (!title) {
      if (participantNames.length === 1) {
        title = `${selectedType} con ${participantNames[0]}`;
      } else if (participantNames.length > 1) {
        title = `${selectedType} con ${participantNames[0]} y ${participantNames.length - 1} más`;
      } else {
        title = `${selectedType} Social`;
      }
    }

    SocialStore.addCommitment({
      title,
      eventType: selectedType,
      date: planDate,
      startTime,
      endTime,
      location: location.trim() || undefined,
      description: notes.trim() || undefined,
      peopleIds: selectedPersonIds,
      priority: 'medium'
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#080d19] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 text-slate-900 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP HEADER & PROGRESS */}
        <div>
          <div className="flex items-center justify-between mb-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/40 text-purple-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900">Planificar Nuevo Momento Social</h3>
                <p className="text-xs text-slate-500">Paso {step} de 3 — {step === 1 ? '¿Qué vas a hacer?' : step === 2 ? '¿Con quién?' : 'Fecha, Hora y Detalle'}</p>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: EVENT TYPE */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
              1. Selecciona la Experiencia o Actividad
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {EVENT_TYPE_OPTIONS.map(opt => {
                const isSelected = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedType(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                      isSelected
                        ? `bg-gradient-to-br ${opt.color} border-2 shadow-lg scale-[1.02]`
                        : 'bg-slate-50 border-slate-200 hover:border-purple-400/40 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-xs font-bold text-center leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título Personalizado (Opcional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder={`Ej. ${selectedType} de celebración de proyecto`}
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <span>Siguiente: ¿Con quién?</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PARTICIPANTS */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                2. ¿Con quién vas a compartir esta experiencia?
              </label>

              <button
                type="button"
                onClick={() => setIsCreatingPersonInline(!isCreatingPersonInline)}
                className="text-xs text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Crear Persona Nueva</span>
              </button>
            </div>

            {/* INLINE NEW PERSON FORM */}
            {isCreatingPersonInline && (
              <form onSubmit={handleCreatePersonInline} className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-purple-200">Añadir Nueva Persona Rápidamente:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={e => setNewPersonName(e.target.value)}
                    placeholder="Nombre Completo *"
                    required
                    className="bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newPersonRelation}
                    onChange={e => setNewPersonRelation(e.target.value)}
                    placeholder="Relación (ej. Amigo, Prima)"
                    className="bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPersonInline(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Añadir y Seleccionar
                  </button>
                </div>
              </form>
            )}

            {/* PEOPLE SELECTION GRID */}
            {people.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Users className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-700 font-medium">Aún no tienes personas registradas en tu red de contactos.</p>
                <button
                  type="button"
                  onClick={() => setIsCreatingPersonInline(true)}
                  className="px-4 py-1.5 bg-purple-600 text-slate-900 font-bold text-xs rounded-xl"
                >
                  Crear Primera Persona
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {people.map(p => {
                  const isSelected = selectedPersonIds.includes(p.id);
                  const initials = p.name ? p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P';

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTogglePerson(p.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                        isSelected
                          ? 'bg-purple-900/50 border-purple-400 text-slate-900 shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:border-purple-400/30 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover border border-purple-400/40 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-400/40 flex items-center justify-center text-slate-900 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.relationship || p.category}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-purple-500 border-purple-400 text-slate-950'
                          : 'border-slate-200 bg-slate-50'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <span>Siguiente: Fecha y Horario</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE, TIME & DETAILS */}
        {step === 3 && (
          <form onSubmit={handleSavePlan} className="space-y-4">
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
              3. Fecha, Horario y Lugar del Plan
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={planDate}
                  onChange={e => setPlanDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lugar / Ubicación (Opcional)
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej. Café Pergamino, Parque 93, Casa de Juan"
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas / Detalles del Plan (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observaciones, recordatorios o qué llevar..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:from-purple-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-xl transition-all flex items-center gap-2"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" /> Guardado y Sincronizado
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Guardar Plan Social
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

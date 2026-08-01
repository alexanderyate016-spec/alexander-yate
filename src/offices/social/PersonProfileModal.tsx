import React, { useState } from 'react';
import { SocialPerson, SocialOfficeData } from '../../types/store';
import { SocialStore } from './SocialStore';
import { SocialCalculations } from './SocialCalculations';
import { getTodayDateString } from '../../utils/dates';
import {
  GlassPanel,
  ExecutiveButton,
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveBadge,
  ExecutiveForm
} from '../../components/executive';
import {
  X,
  Star,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  Heart,
  Sparkles,
  Award,
  Tag,
  CheckCircle2,
  Cake,
  AlertCircle
} from 'lucide-react';

interface Props {
  person: SocialPerson;
  data: SocialOfficeData;
  onClose: () => void;
}

export const PersonProfileModal: React.FC<Props> = ({ person, data, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'dates' | 'interactions' | 'commitments' | 'timeline'>('info');
  const todayStr = getTodayDateString();

  // General Info Edit State
  const [name, setName] = useState(person.name || '');
  const [photoUrl, setPhotoUrl] = useState(person.photoUrl || '');
  const [relationship, setRelationship] = useState(person.relationship || '');
  const [category, setCategory] = useState(person.category || 'Amigos');
  const [importanceLevel, setImportanceLevel] = useState(person.importanceLevel || 'Importante');
  const [phone, setPhone] = useState(person.phone || '');
  const [email, setEmail] = useState(person.email || '');
  const [address, setAddress] = useState(person.address || '');
  const [birthday, setBirthday] = useState(person.birthday || '');
  const [anniversaryDate, setAnniversaryDate] = useState(person.anniversaryDate || '');
  const [profession, setProfession] = useState(person.profession || '');
  const [organization, setOrganization] = useState(person.organization || '');
  const [interests, setInterests] = useState(person.interests || '');
  const [notes, setNotes] = useState(person.notes || '');

  // Custom Date Form State
  const [cDateTitle, setCDateTitle] = useState('');
  const [cDateVal, setCDateVal] = useState(todayStr);

  // Interaction Form State
  const [intDate, setIntDate] = useState(todayStr);
  const [intType, setIntType] = useState<'Conversación' | 'Llamada' | 'Reunión' | 'Mensaje' | 'Salida' | 'Clase' | 'Otro'>('Llamada');
  const [intDesc, setIntDesc] = useState('');

  // Commitment Form State
  const [comTitle, setComTitle] = useState('');
  const [comDate, setComDate] = useState(todayStr);
  const [comStart, setComStart] = useState('14:00');
  const [comLocation, setComLocation] = useState('');

  const lastInteraction = SocialCalculations.getLastInteraction(person.id, data.interactions || []);
  const contactFreq = SocialCalculations.getContactFrequency(person.id, data.interactions || []);
  const timeline = SocialCalculations.getPersonTimeline(person.id, data);

  const handleSaveGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    SocialStore.updatePerson(person.id, {
      name,
      photoUrl: photoUrl.trim() || undefined,
      relationship,
      category,
      importanceLevel,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      birthday: birthday || undefined,
      anniversaryDate: anniversaryDate || undefined,
      profession: profession.trim() || undefined,
      organization: organization.trim() || undefined,
      interests: interests.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  const handleAddCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cDateTitle.trim() || !cDateVal) return;
    SocialStore.addCustomDate(person.id, { title: cDateTitle.trim(), date: cDateVal });
    setCDateTitle('');
  };

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intDesc.trim()) return;
    SocialStore.addInteraction({
      personId: person.id,
      date: intDate,
      type: intType,
      description: intDesc.trim()
    });
    setIntDesc('');
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comTitle.trim()) return;
    SocialStore.addCommitment({
      title: comTitle.trim(),
      date: comDate,
      startTime: comStart,
      location: comLocation.trim() || undefined,
      peopleIds: [person.id],
      priority: 'medium'
    });
    setComTitle('');
    setComLocation('');
  };

  // Initials generator
  const initials = person.name
    ? person.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'P';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0c1929] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER EXPEDIENTE */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-950/60 via-[#132337] to-[#0c1929] border-b border-white/10 flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {person.photoUrl ? (
                <img
                  src={person.photoUrl}
                  alt={person.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 border-2 border-purple-400 flex items-center justify-center text-white font-serif font-bold text-2xl shadow-lg">
                  {initials}
                </div>
              )}
              {person.isFavorite && (
                <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-slate-950 rounded-full shadow">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">{person.name}</h2>
                <button
                  onClick={() => SocialStore.toggleFavorite(person.id)}
                  title={person.isFavorite ? 'Quitar de Favoritos' : 'Marcar como Favorito Prioritario'}
                  className={`p-1.5 rounded-lg border transition-all ${
                    person.isFavorite
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${person.isFavorite ? 'fill-amber-300' : ''}`} />
                </button>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="text-purple-300 font-semibold">{person.relationship || person.category}</span>
                <span>•</span>
                <span className="text-slate-400">{person.category}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <ExecutiveBadge variant="subtle" accentColor={person.importanceLevel === 'Muy importante' ? 'rose' : 'purple'}>
                  {person.importanceLevel}
                </ExecutiveBadge>
                {lastInteraction && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Última interacción: {lastInteraction.daysAgo === 0 ? 'Hoy' : `hace ${lastInteraction.daysAgo} días`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar el expediente de ${person.name}?`)) {
                  SocialStore.deletePerson(person.id);
                  onClose();
                }
              }}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS DE EXPEDIENTE */}
        <div className="flex border-b border-white/10 bg-[#0a1523] px-4 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Información General
          </button>

          <button
            onClick={() => setActiveTab('dates')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'dates'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Fechas Importantes
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'interactions'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Interacciones
          </button>

          <button
            onClick={() => setActiveTab('commitments')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'commitments'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Compromisos
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Línea de Tiempo
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. INFORMACIÓN GENERAL */}
          {activeTab === 'info' && (
            <ExecutiveForm onSubmit={handleSaveGeneralInfo}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExecutiveInput
                  label="Nombre Completo *"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  accentColor="purple"
                  required
                />

                <ExecutiveInput
                  label="Relación Conmigo (ej. Mamá, Mentor, Tutor, Amigo de infancia)"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  accentColor="purple"
                  placeholder="Ej: Hermano, Profesor de Cálculo, Socio"
                />

                <ExecutiveSelect
                  label="Categoría"
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Familia', label: 'Familia' },
                    { value: 'Amigos', label: 'Amigos' },
                    { value: 'Compañeros de universidad', label: 'Compañeros de universidad' },
                    { value: 'Profesores', label: 'Profesores' },
                    { value: 'Trabajo', label: 'Trabajo' },
                    { value: 'Otros', label: 'Otros' }
                  ]}
                />

                <ExecutiveSelect
                  label="Nivel de Importancia"
                  value={importanceLevel}
                  onChange={e => setImportanceLevel(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Muy importante', label: '⭐ Muy Importante (Prioridad)' },
                    { value: 'Importante', label: '🔹 Importante' },
                    { value: 'Frecuente', label: '💬 Frecuente' },
                    { value: 'Ocasional', label: '🌱 Ocasional' }
                  ]}
                />

                <ExecutiveInput
                  label="Fotografía (URL)"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  accentColor="purple"
                  placeholder="https://ejemplo.com/foto.jpg"
                />

                <ExecutiveInput
                  label="Teléfono"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  accentColor="purple"
                  placeholder="+57 300 123 4567"
                />

                <ExecutiveInput
                  label="Correo Electrónico"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  accentColor="purple"
                  placeholder="correo@ejemplo.com"
                />

                <ExecutiveInput
                  label="Dirección (Opcional)"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  accentColor="purple"
                  placeholder="Calle 100 #15-20, Bogotá"
                />

                <ExecutiveInput
                  label="Fecha de Cumpleaños"
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  accentColor="purple"
                />

                <ExecutiveInput
                  label="Fecha de Aniversario (Opcional)"
                  type="date"
                  value={anniversaryDate}
                  onChange={e => setAnniversaryDate(e.target.value)}
                  accentColor="purple"
                />

                <ExecutiveInput
                  label="Profesión o Cargo (Opcional)"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                  accentColor="purple"
                  placeholder="Ej: Ingeniero de Software, Directora"
                />

                <ExecutiveInput
                  label="Organización o Institución (Opcional)"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  accentColor="purple"
                  placeholder="Ej: Universidad Nacional, Google"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                    Intereses y Gustos Personales
                  </label>
                  <textarea
                    value={interests}
                    onChange={e => setInterests(e.target.value)}
                    placeholder="Ej: Le gusta el café de especialidad, la música jazz, el fútbol, ciclismo..."
                    className="w-full bg-[#132337] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400 min-h-[70px]"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                    Notas Personales & Contexto
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notas importantes, temas pendientes por hablar o datos de memoria..."
                    className="w-full bg-[#132337] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <ExecutiveButton type="submit" variant="primary" accentColor="purple" icon={<CheckCircle2 className="w-4 h-4" />}>
                  Guardar Cambios del Expediente
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          )}

          {/* 2. FECHAS IMPORTANTES */}
          {activeTab === 'dates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cumpleaños */}
                <div className="p-4 bg-[#132337] border border-purple-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Cake className="w-4 h-4" /> Cumpleaños
                  </div>
                  {person.birthday ? (() => {
                    const { daysLeft, isToday, nextDateStr } = SocialCalculations.getDaysUntilNextOccurrence(person.birthday, todayStr);
                    return (
                      <div>
                        <p className="text-white font-serif font-bold text-base">{person.birthday}</p>
                        <p className="text-xs text-slate-300 mt-1">
                          {isToday ? (
                            <strong className="text-amber-300 font-bold">🎉 ¡Es hoy! 🎉</strong>
                          ) : (
                            <span>Faltan <strong className="text-purple-300 font-bold">{daysLeft} días</strong> (Próximo: {nextDateStr})</span>
                          )}
                        </p>
                      </div>
                    );
                  })() : (
                    <p className="text-xs text-slate-400">Sin fecha de cumpleaños registrada.</p>
                  )}
                </div>

                {/* Aniversario */}
                <div className="p-4 bg-[#132337] border border-purple-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <Heart className="w-4 h-4" /> Aniversario
                  </div>
                  {person.anniversaryDate ? (() => {
                    const { daysLeft, isToday, nextDateStr } = SocialCalculations.getDaysUntilNextOccurrence(person.anniversaryDate, todayStr);
                    return (
                      <div>
                        <p className="text-white font-serif font-bold text-base">{person.anniversaryDate}</p>
                        <p className="text-xs text-slate-300 mt-1">
                          {isToday ? (
                            <strong className="text-rose-300 font-bold">❤️ ¡Es hoy el aniversario! ❤️</strong>
                          ) : (
                            <span>Faltan <strong className="text-purple-300 font-bold">{daysLeft} días</strong> (Próximo: {nextDateStr})</span>
                          )}
                        </p>
                      </div>
                    );
                  })() : (
                    <p className="text-xs text-slate-400">Sin fecha de aniversario registrada.</p>
                  )}
                </div>
              </div>

              {/* OTRAS FECHAS PERSONALIZADAS */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-white text-base">Fechas Personalizadas</h4>

                <ExecutiveForm onSubmit={handleAddCustomDate}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <ExecutiveInput
                      label="Título de la Fecha *"
                      placeholder="Ej: Graduación, Grado, Conmutación"
                      value={cDateTitle}
                      onChange={e => setCDateTitle(e.target.value)}
                      accentColor="purple"
                      required
                    />

                    <ExecutiveInput
                      label="Fecha *"
                      type="date"
                      value={cDateVal}
                      onChange={e => setCDateVal(e.target.value)}
                      accentColor="purple"
                      required
                    />

                    <ExecutiveButton type="submit" variant="secondary" accentColor="purple" icon={<Plus className="w-4 h-4" />}>
                      Agregar Fecha
                    </ExecutiveButton>
                  </div>
                </ExecutiveForm>

                {person.customDates && person.customDates.length > 0 ? (
                  <div className="space-y-2">
                    {person.customDates.map(cd => {
                      const { daysLeft, isToday, nextDateStr } = SocialCalculations.getDaysUntilNextOccurrence(cd.date, todayStr);
                      return (
                        <div key={cd.id} className="p-3 bg-[#132337]/80 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white block text-sm">{cd.title}</span>
                            <span className="text-slate-400 font-mono">{cd.date} • </span>
                            <span className="text-purple-300 font-semibold">
                              {isToday ? '¡Es hoy!' : `Faltan ${daysLeft} días (${nextDateStr})`}
                            </span>
                          </div>
                          <button
                            onClick={() => SocialStore.deleteCustomDate(person.id, cd.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No hay fechas personalizadas adicionales para esta persona.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. HISTORIAL DE INTERACCIONES */}
          {activeTab === 'interactions' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Frecuencia Estimada de Contacto:</span>
                  <strong className="text-purple-300 font-serif text-sm">{contactFreq}</strong>
                </div>
                {lastInteraction && (
                  <div>
                    <span className="text-slate-400 block">Última Interacción:</span>
                    <strong className="text-white font-mono">{lastInteraction.date} ({lastInteraction.daysAgo} días)</strong>
                  </div>
                )}
              </div>

              {/* Add Interaction Form */}
              <div className="p-4 bg-[#132337] border border-white/10 rounded-xl space-y-3">
                <h4 className="font-serif font-bold text-white text-sm">Registrar Nueva Interacción</h4>
                <ExecutiveForm onSubmit={handleAddInteraction}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <ExecutiveInput
                      label="Fecha *"
                      type="date"
                      value={intDate}
                      onChange={e => setIntDate(e.target.value)}
                      accentColor="purple"
                      required
                    />

                    <ExecutiveSelect
                      label="Tipo de Interacción *"
                      value={intType}
                      onChange={e => setIntType(e.target.value as any)}
                      accentColor="purple"
                      options={[
                        { value: 'Llamada', label: '📞 Llamada' },
                        { value: 'Reunión', label: '🤝 Reunión Presencial' },
                        { value: 'Mensaje', label: '💬 Mensaje / Chat' },
                        { value: 'Salida', label: '☕ Salida / Almuerzo' },
                        { value: 'Clase', label: '🎓 Clase / Tutoría' },
                        { value: 'Conversación', label: '🗣️ Conversación' },
                        { value: 'Otro', label: '📌 Otro' }
                      ]}
                    />

                    <div className="sm:col-span-1">
                      <ExecutiveInput
                        label="Descripción *"
                        placeholder="Ej: Hablamos sobre el viaje o temas de trabajo"
                        value={intDesc}
                        onChange={e => setIntDesc(e.target.value)}
                        accentColor="purple"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <ExecutiveButton type="submit" variant="primary" accentColor="purple" icon={<Plus className="w-4 h-4" />}>
                      Guardar Interacción
                    </ExecutiveButton>
                  </div>
                </ExecutiveForm>
              </div>

              {/* Interactions List */}
              <div className="space-y-2.5">
                {(data.interactions || []).filter(i => i.personId === person.id).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Sin interacciones registradas para {person.name}.</p>
                ) : (
                  (data.interactions || [])
                    .filter(i => i.personId === person.id)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(i => (
                      <div key={i.id} className="p-3.5 bg-[#132337]/80 border border-white/10 rounded-xl flex justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{i.type}</span>
                            <span className="text-[10px] text-purple-300 font-mono">{i.date}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{i.description}</p>
                        </div>
                        <button
                          onClick={() => SocialStore.deleteInteraction(i.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* 4. COMPROMISOS */}
          {activeTab === 'commitments' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#132337] border border-white/10 rounded-xl space-y-3">
                <h4 className="font-serif font-bold text-white text-sm">Crear Compromiso con {person.name}</h4>
                <ExecutiveForm onSubmit={handleAddCommitment}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <ExecutiveInput
                      label="Título *"
                      placeholder="Ej: Almuerzo de trabajo, Reunión"
                      value={comTitle}
                      onChange={e => setComTitle(e.target.value)}
                      accentColor="purple"
                      required
                    />

                    <ExecutiveInput
                      label="Fecha *"
                      type="date"
                      value={comDate}
                      onChange={e => setComDate(e.target.value)}
                      accentColor="purple"
                      required
                    />

                    <ExecutiveInput
                      label="Hora"
                      type="time"
                      value={comStart}
                      onChange={e => setComStart(e.target.value)}
                      accentColor="purple"
                    />

                    <ExecutiveInput
                      label="Lugar (Opcional)"
                      placeholder="Ej: Café Central / Zoom"
                      value={comLocation}
                      onChange={e => setComLocation(e.target.value)}
                      accentColor="purple"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <ExecutiveButton type="submit" variant="primary" accentColor="purple" icon={<Plus className="w-4 h-4" />}>
                      Agendar Compromiso (Sincroniza con Oval Office)
                    </ExecutiveButton>
                  </div>
                </ExecutiveForm>
              </div>

              {/* Commitments List */}
              <div className="space-y-2.5">
                {(data.commitments || []).filter(c => c.peopleIds.includes(person.id)).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Sin compromisos agendados con esta persona.</p>
                ) : (
                  (data.commitments || [])
                    .filter(c => c.peopleIds.includes(person.id))
                    .map(c => (
                      <div key={c.id} className="p-3.5 bg-[#132337]/80 border border-white/10 rounded-xl flex justify-between items-start gap-3">
                        <div>
                          <h5 className="font-serif font-bold text-white text-sm">{c.title}</h5>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Fecha: {c.date} a las {c.startTime || '12:00'} {c.location ? `• Lugar: ${c.location}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => SocialStore.deleteCommitment(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* 5. LÍNEA DE TIEMPO / CRONOLOGÍA */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-white text-base">Cronología del Expediente</h4>
              {timeline.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Sin actividad reciente registrada en la cronología.</p>
              ) : (
                <div className="relative border-l-2 border-purple-500/30 pl-4 space-y-4 ml-2">
                  {timeline.map(ev => (
                    <div key={ev.id} className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-slate-950" />
                      <div className="bg-[#132337]/80 border border-white/10 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-serif font-bold text-white text-xs">{ev.title}</span>
                          <span className="text-[10px] text-purple-300 font-mono">{ev.date}</span>
                        </div>
                        {ev.description && <p className="text-xs text-slate-300">{ev.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

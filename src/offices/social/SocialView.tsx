import React, { useState } from 'react';
import { SocialOfficeData } from '../../types/store';
import { SocialStore } from './SocialStore';
import { SocialCalculations } from './SocialCalculations';
import { getTodayDateString, getGreetingByTime } from '../../utils/dates';
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
  Users,
  Heart,
  Calendar,
  Plus,
  Trash2,
  MessageSquare,
  AlertCircle,
  Flag,
  UserPlus,
  Cake
} from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  profileName?: string;
}

export const SocialView: React.FC<Props> = ({ data, profileName = 'Alex' }) => {
  const [activeTab, setActiveTab] = useState<'people' | 'interactions' | 'commitments'>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const todayStr = getTodayDateString();
  const todayMMDD = todayStr.substring(5);

  // New Person state
  const [pName, setPName] = useState('');
  const [pBday, setPBday] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pCat, setPCat] = useState<'Familia' | 'Amigos' | 'Compañeros de universidad' | 'Profesores' | 'Otros'>('Amigos');
  const [pImp, setPImp] = useState<'Muy importante' | 'Importante' | 'Frecuente' | 'Ocasional'>('Importante');
  const [pNotes, setPNotes] = useState('');

  // New Interaction state
  const [intPersonId, setIntPersonId] = useState('');
  const [intDesc, setIntDesc] = useState('');
  const [intType, setIntType] = useState<'Conversación' | 'Llamada' | 'Reunión' | 'Mensaje' | 'Otro'>('Llamada');

  // New Commitment state
  const [comTitle, setComTitle] = useState('');
  const [comDate, setComDate] = useState(todayStr);
  const [comStart, setComStart] = useState('16:00');

  const greeting = getGreetingByTime(profileName);
  const todayBdays = SocialCalculations.getTodayBirthdays(data.people, todayMMDD);
  const uncontacted = SocialCalculations.getUncontactedPeopleAlerts(data, 30);
  const todayHoliday = SocialCalculations.getTodayColombianHoliday(todayMMDD);

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName) return;
    SocialStore.addPerson({
      name: pName,
      birthday: pBday || undefined,
      phone: pPhone || undefined,
      relationship: pCat,
      category: pCat,
      importanceLevel: pImp,
      notes: pNotes || undefined
    });
    setPName('');
    setPBday('');
    setPPhone('');
    setPNotes('');
  };

  const handleCreateInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intPersonId || !intDesc) return;
    SocialStore.addInteraction({
      personId: intPersonId,
      date: todayStr,
      type: intType,
      description: intDesc
    });
    setIntDesc('');
  };

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comTitle) return;
    SocialStore.addCommitment({
      title: comTitle,
      date: comDate,
      startTime: comStart,
      peopleIds: [],
      priority: 'medium'
    });
    setComTitle('');
  };

  const filteredPeople = data.people.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* 1. SECTION HEADER INSTITUCIONAL (PURPLE ACCENT) */}
      <ExecutiveSectionHeader
        title="Oficina de Vida Social y Relaciones"
        subtitle="Agencia Superior de Coordinación de Relaciones Humanas, Fechas Patrias y Compromisos Social-Institucionales"
        icon={<Users className="w-6 h-6 text-purple-400" />}
        accentColor="purple"
        badgeText="Relaciones & Agenda"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar contactos..."
      />

      {/* 2. CENTRO DE RELACIONES EJECUTIVO */}
      <GlassPanel accentColor="purple" padding="md">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <h3 className="font-serif font-bold text-white text-base sm:text-lg">
            Centro de Relaciones Ejecutivo
          </h3>
          <ExecutiveBadge variant="solid" accentColor="purple">
            {greeting}
          </ExecutiveBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Cumpleaños */}
          <div className="p-3.5 bg-[#132337]/90 border border-purple-500/30 rounded-xl space-y-1">
            <div className="font-bold text-purple-300 uppercase text-[11px] flex items-center gap-1">
              <Cake className="w-3.5 h-3.5 text-purple-400" /> Cumpleaños Hoy
            </div>
            {todayBdays.length === 0 ? (
              <p className="text-slate-400">Sin cumpleaños registrados para hoy.</p>
            ) : (
              todayBdays.map(p => (
                <div key={p.id} className="font-bold text-amber-300">
                  🎂 {p.name} ({p.category})
                </div>
              ))
            )}
          </div>

          {/* Alertas de Seguimiento */}
          <div className="p-3.5 bg-[#132337]/90 border border-purple-500/30 rounded-xl space-y-1">
            <div className="font-bold text-purple-300 uppercase text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-purple-400" /> Alertas de Seguimiento
            </div>
            {uncontacted.length === 0 ? (
              <p className="text-slate-400">Relaciones al día. No hay alertas.</p>
            ) : (
              <p className="text-slate-300">
                Hace <strong className="text-purple-300">{uncontacted[0].daysAgo} días</strong> no registras contacto con <strong>{uncontacted[0].person.name}</strong>.
              </p>
            )}
          </div>

          {/* Fecha Especial / Patria */}
          <div className="p-3.5 bg-[#132337]/90 border border-purple-500/30 rounded-xl space-y-1">
            <div className="font-bold text-purple-300 uppercase text-[11px] flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-blue-400" /> Fecha Especial / Patria
            </div>
            {todayHoliday ? (
              <p className="text-blue-300 font-bold">
                🇨🇴 {todayHoliday.title}: {todayHoliday.message}
              </p>
            ) : (
              <p className="text-slate-400">Hoy es una jornada ordinaria en el calendario patriótico.</p>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* 3. TABS DE NAVEGACIÓN */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('people')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'people'
              ? 'border-purple-400 bg-purple-500/15 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Directorio de Contactos ({data.people.length})
        </button>

        <button
          onClick={() => setActiveTab('interactions')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'interactions'
              ? 'border-purple-400 bg-purple-500/15 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Historial de Interacciones ({data.interactions.length})
        </button>

        <button
          onClick={() => setActiveTab('commitments')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'commitments'
              ? 'border-purple-400 bg-purple-500/15 text-purple-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Compromisos Sociales ({data.commitments.length})
        </button>
      </div>

      {/* TAB 1: DIRECTORIO DE CONTACTOS */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <GlassPanel accentColor="purple" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" />
              Registrar Nuevo Contacto
            </h3>

            <ExecutiveForm onSubmit={handleCreatePerson}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveInput
                  label="Nombre Completo *"
                  placeholder="Ej: Laura Gómez"
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  accentColor="purple"
                  required
                />

                <ExecutiveSelect
                  label="Categoría"
                  value={pCat}
                  onChange={e => setPCat(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Familia', label: 'Familia' },
                    { value: 'Amigos', label: 'Amigos' },
                    { value: 'Compañeros de universidad', label: 'Compañeros de universidad' },
                    { value: 'Profesores', label: 'Profesores' },
                    { value: 'Otros', label: 'Otros' }
                  ]}
                />

                <ExecutiveSelect
                  label="Importancia / Frecuencia"
                  value={pImp}
                  onChange={e => setPImp(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Muy importante', label: 'Muy Importante' },
                    { value: 'Importante', label: 'Importante' },
                    { value: 'Frecuente', label: 'Frecuente' },
                    { value: 'Ocasional', label: 'Ocasional' }
                  ]}
                />

                <ExecutiveInput
                  label="Fecha de Cumpleaños"
                  type="date"
                  value={pBday}
                  onChange={e => setPBday(e.target.value)}
                  accentColor="purple"
                />
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="purple" icon={<Plus className="w-4 h-4" />}>
                  Registrar Persona
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {filteredPeople.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Users className="w-8 h-8 text-purple-400" />}
              title="Sin Contactos Guardados"
              description="No hay personas o contactos guardados en el directorio de relaciones."
              accentColor="purple"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeople.map(p => (
                <ExecutiveCard
                  key={p.id}
                  accentColor="purple"
                  accentBorderLeft
                  header={
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-white text-base">{p.name}</h4>
                        <p className="text-xs text-slate-400">{p.category} • {p.importanceLevel}</p>
                      </div>
                      <button
                        onClick={() => SocialStore.deletePerson(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                >
                  {p.birthday && (
                    <div className="text-xs text-amber-300 font-bold mt-1">
                      🎂 Cumpleaños: {p.birthday}
                    </div>
                  )}
                </ExecutiveCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORIAL DE INTERACCIONES */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          <GlassPanel accentColor="purple" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Registrar Interacción o Conversación
            </h3>

            <ExecutiveForm onSubmit={handleCreateInteraction}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveSelect
                  label="Persona *"
                  value={intPersonId}
                  onChange={e => setIntPersonId(e.target.value)}
                  accentColor="purple"
                  required
                  options={[
                    { value: '', label: '-- Seleccionar Persona --' },
                    ...data.people.map(p => ({ value: p.id, label: p.name }))
                  ]}
                />

                <ExecutiveSelect
                  label="Tipo de Interacción"
                  value={intType}
                  onChange={e => setIntType(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Llamada', label: 'Llamada' },
                    { value: 'Conversación', label: 'Conversación presencial' },
                    { value: 'Reunión', label: 'Reunión' },
                    { value: 'Mensaje', label: 'Mensaje' },
                    { value: 'Otro', label: 'Otro' }
                  ]}
                />

                <div className="sm:col-span-1 lg:col-span-2">
                  <ExecutiveInput
                    label="Descripción de la Interacción *"
                    placeholder="Ej: Conversación sobre proyectos o almuerzo"
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
          </GlassPanel>

          {data.interactions.length === 0 ? (
            <ExecutiveEmptyState
              icon={<MessageSquare className="w-8 h-8 text-purple-400" />}
              title="Sin Interacciones Registradas"
              description="No hay un historial de llamadas, mensajes o conversaciones registradas."
              accentColor="purple"
            />
          ) : (
            <div className="space-y-2.5">
              {data.interactions.map(i => {
                const person = data.people.find(p => p.id === i.personId);

                return (
                  <ExecutiveCard key={i.id} accentColor="purple">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-serif font-bold text-white text-sm">
                          {person?.name || 'Contacto'} <span className="text-xs text-purple-300 font-sans font-normal">[{i.type}]</span>
                        </h4>
                        <p className="text-slate-300">{i.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px]">{i.date}</span>
                        <button
                          onClick={() => SocialStore.deleteInteraction(i.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </ExecutiveCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPROMISOS SOCIALES */}
      {activeTab === 'commitments' && (
        <div className="space-y-6">
          <GlassPanel accentColor="purple" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Crear Compromiso Social
            </h3>

            <ExecutiveForm onSubmit={handleCreateCommitment}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Título del Compromiso *"
                    placeholder="Ej: Cena de graduación o reunión de grupo"
                    value={comTitle}
                    onChange={e => setComTitle(e.target.value)}
                    accentColor="purple"
                    required
                  />
                </div>

                <ExecutiveInput
                  label="Fecha"
                  type="date"
                  value={comDate}
                  onChange={e => setComDate(e.target.value)}
                  accentColor="purple"
                />

                <ExecutiveInput
                  label="Hora"
                  type="time"
                  value={comStart}
                  onChange={e => setComStart(e.target.value)}
                  accentColor="purple"
                />
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="purple" icon={<Plus className="w-4 h-4" />}>
                  Guardar Compromiso
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.commitments.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Calendar className="w-8 h-8 text-purple-400" />}
              title="Sin Compromisos Agendados"
              description="No hay compromisos o eventos sociales agendados."
              accentColor="purple"
            />
          ) : (
            <div className="space-y-2.5">
              {data.commitments.map(c => (
                <ExecutiveCard key={c.id} accentColor="purple">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{c.title}</h4>
                      <p className="text-slate-400 font-mono">Fecha: {c.date} a las {c.startTime}</p>
                    </div>

                    <button
                      onClick={() => SocialStore.deleteCommitment(c.id)}
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

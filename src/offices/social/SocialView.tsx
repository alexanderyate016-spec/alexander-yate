import React, { useState } from 'react';
import { SocialOfficeData, SocialPerson } from '../../types/store';
import { SocialStore } from './SocialStore';
import { SocialCalculations } from './SocialCalculations';
import { PersonProfileModal } from './PersonProfileModal';
import { RelationshipMapView } from './RelationshipMapView';
import { SocialCalendarView } from './SocialCalendarView';
import { getTodayDateString, getGreetingByTime } from '../../utils/dates';
import {
  GlassPanel,
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
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  MessageSquare,
  AlertCircle,
  Flag,
  UserPlus,
  Cake,
  Star,
  Sparkles,
  Network,
  Clock,
  Filter
} from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  profileName?: string;
}

export const SocialView: React.FC<Props> = ({ data, profileName = 'Alex' }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'map' | 'calendar' | 'interactions' | 'commitments'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<SocialPerson | null>(null);

  const todayStr = getTodayDateString();
  const todayMMDD = todayStr.substring(5);

  // New Person Form State
  const [pName, setPName] = useState('');
  const [pRelation, setPRelation] = useState('');
  const [pCat, setPCat] = useState<'Familia' | 'Amigos' | 'Compañeros de universidad' | 'Profesores' | 'Trabajo' | 'Otros'>('Amigos');
  const [pImp, setPImp] = useState<'Muy importante' | 'Importante' | 'Frecuente' | 'Ocasional'>('Importante');
  const [pBday, setPBday] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pPhoto, setPPhoto] = useState('');

  // New Interaction State
  const [intPersonId, setIntPersonId] = useState('');
  const [intDesc, setIntDesc] = useState('');
  const [intType, setIntType] = useState<'Conversación' | 'Llamada' | 'Reunión' | 'Mensaje' | 'Salida' | 'Clase' | 'Otro'>('Llamada');

  // New Commitment State
  const [comTitle, setComTitle] = useState('');
  const [comDate, setComDate] = useState(todayStr);
  const [comStart, setComStart] = useState('16:00');
  const [comPersonId, setComPersonId] = useState('');

  const greeting = getGreetingByTime(profileName);
  const people = data.people || [];
  const interactions = data.interactions || [];
  const commitments = data.commitments || [];

  const uncontacted = SocialCalculations.getUncontactedPeopleAlerts(data, 30);
  const upcomingDates = SocialCalculations.getUpcomingDatesList(data, todayStr);
  const smartAlerts = SocialCalculations.getSmartAlerts(data, todayStr);

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    SocialStore.addPerson({
      name: pName.trim(),
      relationship: pRelation.trim() || pCat,
      category: pCat,
      importanceLevel: pImp,
      birthday: pBday || undefined,
      phone: pPhone.trim() || undefined,
      photoUrl: pPhoto.trim() || undefined,
      tags: []
    });
    setPName('');
    setPRelation('');
    setPBday('');
    setPPhone('');
    setPPhoto('');
  };

  const handleCreateInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intPersonId || !intDesc.trim()) return;
    SocialStore.addInteraction({
      personId: intPersonId,
      date: todayStr,
      type: intType,
      description: intDesc.trim()
    });
    setIntDesc('');
  };

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comTitle.trim()) return;
    SocialStore.addCommitment({
      title: comTitle.trim(),
      date: comDate,
      startTime: comStart,
      peopleIds: comPersonId ? [comPersonId] : [],
      priority: 'medium'
    });
    setComTitle('');
  };

  // Filtered People
  const filteredPeople = people.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.relationship && p.relationship.toLowerCase().includes(query)) ||
      (p.organization && p.organization.toLowerCase().includes(query)) ||
      (p.interests && p.interests.toLowerCase().includes(query)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)));

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const favoritePeople = filteredPeople.filter(p => p.isFavorite);
  const regularPeople = filteredPeople.filter(p => !p.isFavorite);

  // Category counts
  const familyCount = people.filter(p => p.category === 'Familia').length;
  const friendsCount = people.filter(p => p.category === 'Amigos').length;
  const professorCount = people.filter(p => p.category === 'Profesores').length;
  const colleaguesCount = people.filter(p => p.category === 'Compañeros de universidad').length;
  const workCount = people.filter(p => p.category === 'Trabajo').length;

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* 1. HEADER INSTITUCIONAL */}
      <ExecutiveSectionHeader
        title="Centro de Relaciones Personales"
        subtitle="Gestión Inteligente de Expedientes Personales, Redes Humanas, Fechas Patrias y Compromisos Sociales"
        icon={<Users className="w-6 h-6 text-purple-400" />}
        accentColor="purple"
        badgeText="Redes Humanas"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, relación, organización, intereses o etiquetas..."
      />

      {/* 2. CENTRO DE METRICAS Y ALERTAS EJECUTIVAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <ExecutiveMetricCard
          title="Total Personas"
          value={people.length}
          accentColor="purple"
          subtitle="Expedientes registrados"
        />
        <ExecutiveMetricCard
          title="Familia"
          value={familyCount}
          accentColor="purple"
          subtitle="Núcleo familiar"
        />
        <ExecutiveMetricCard
          title="Amigos"
          value={friendsCount}
          accentColor="purple"
          subtitle="Círculo personal"
        />
        <ExecutiveMetricCard
          title="Universidad / Trabajo"
          value={colleaguesCount + workCount + professorCount}
          accentColor="purple"
          subtitle="Ámbito académico/profesional"
        />
        <ExecutiveMetricCard
          title="Sin Contacto (>30d)"
          value={uncontacted.length}
          accentColor={uncontacted.length > 0 ? "rose" : "emerald"}
          subtitle="Alertas de seguimiento"
        />
        <ExecutiveMetricCard
          title="Próximas Fechas"
          value={upcomingDates.filter(u => u.daysLeft <= 30).length}
          accentColor="amber"
          subtitle="Próximos 30 días"
        />
      </div>

      {/* SMART ALERTS BANNER */}
      {smartAlerts.length > 0 && (
        <GlassPanel accentColor="purple" padding="sm">
          <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-amber-300 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" /> Alertas Inteligentes de Seguimiento
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {smartAlerts.slice(0, 6).map((alert, idx) => (
                <div key={idx} className="p-2 bg-[#132337]/90 border border-white/10 rounded-lg text-xs text-slate-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 3. MAIN GRID: PRÓXIMAS FECHAS + REGISTRO RÁPIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TARJETA PRÓXIMAS FECHAS (CRONOLÓGICO) */}
        <div className="lg:col-span-1">
          <GlassPanel accentColor="purple" padding="md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-400" />
                Próximas Fechas
              </h3>
              <ExecutiveBadge variant="subtle" accentColor="amber">
                Orden Cronológico
              </ExecutiveBadge>
            </div>

            {upcomingDates.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Sin fechas o compromisos agendados.</p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {upcomingDates.slice(0, 10).map(item => {
                  const person = item.personId ? people.find(p => p.id === item.personId) : undefined;

                  return (
                    <div
                      key={item.id}
                      onClick={() => person && setSelectedPerson(person)}
                      className={`p-3 rounded-xl border flex justify-between items-center gap-3 transition-all ${
                        person ? 'cursor-pointer hover:border-purple-400 hover:scale-[1.01]' : ''
                      } ${
                        item.isToday
                          ? 'bg-amber-500/20 border-amber-500/50 text-white'
                          : 'bg-[#132337]/80 border-white/10 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-serif font-bold text-xs text-white flex items-center gap-1.5">
                          {item.type === 'birthday' && <span>🎂</span>}
                          {item.type === 'anniversary' && <span>❤️</span>}
                          {item.type === 'commitment' && <span>📅</span>}
                          {item.type === 'custom_date' && <span>✨</span>}
                          <span>{item.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {item.dateStr} {item.description ? `• ${item.description}` : ''}
                        </span>
                      </div>

                      <div className="shrink-0 text-right">
                        {item.isToday ? (
                          <span className="text-xs font-bold text-amber-300">¡Es hoy!</span>
                        ) : (
                          <span className="text-xs font-semibold text-purple-300">
                            En {item.daysLeft} días
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* REGISTRO RÁPIDO DE PERSONA */}
        <div className="lg:col-span-2">
          <GlassPanel accentColor="purple" padding="md">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                Registrar Nuevo Expediente Personal
              </h3>
              <ExecutiveBadge variant="solid" accentColor="purple">
                {greeting}
              </ExecutiveBadge>
            </div>

            <ExecutiveForm onSubmit={handleCreatePerson}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                <ExecutiveInput
                  label="Nombre Completo *"
                  placeholder="Ej: Laura Gómez, Prof. Rodríguez"
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  accentColor="purple"
                  required
                />

                <ExecutiveInput
                  label="Relación Conmigo"
                  placeholder="Ej: Mamá, Tutor, Mejor Amigo"
                  value={pRelation}
                  onChange={e => setPRelation(e.target.value)}
                  accentColor="purple"
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
                    { value: 'Trabajo', label: 'Trabajo' },
                    { value: 'Otros', label: 'Otros' }
                  ]}
                />

                <ExecutiveSelect
                  label="Nivel de Importancia"
                  value={pImp}
                  onChange={e => setPImp(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Muy importante', label: '⭐ Muy Importante (Prioritario)' },
                    { value: 'Importante', label: '🔹 Importante' },
                    { value: 'Frecuente', label: '💬 Frecuente' },
                    { value: 'Ocasional', label: '🌱 Ocasional' }
                  ]}
                />

                <ExecutiveInput
                  label="Cumpleaños"
                  type="date"
                  value={pBday}
                  onChange={e => setPBday(e.target.value)}
                  accentColor="purple"
                />

                <ExecutiveInput
                  label="Teléfono (Opcional)"
                  value={pPhone}
                  onChange={e => setPPhone(e.target.value)}
                  accentColor="purple"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div className="flex justify-end pt-3">
                <ExecutiveButton type="submit" variant="primary" accentColor="purple" icon={<Plus className="w-4 h-4" />}>
                  Crear Expediente Personal
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>
        </div>
      </div>

      {/* 4. VISTA PRINCIPAL TABS & CATEGORIES */}
      <div className="flex flex-wrap border-b border-white/10 gap-2 items-center justify-between">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'cards'
                ? 'border-purple-400 bg-purple-500/15 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Tarjetas Expedientes ({filteredPeople.length})
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'map'
                ? 'border-purple-400 bg-purple-500/15 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Network className="w-4 h-4" />
            Mapa de Relaciones
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'calendar'
                ? 'border-purple-400 bg-purple-500/15 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendario Social
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
            Historial ({interactions.length})
          </button>

          <button
            onClick={() => setActiveTab('commitments')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'commitments'
                ? 'border-purple-400 bg-purple-500/15 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            Compromisos ({commitments.length})
          </button>
        </div>

        {/* CATEGORY FILTER */}
        {activeTab === 'cards' && (
          <div className="flex items-center gap-2 pb-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#132337] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-purple-400"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Familia">Familia</option>
              <option value="Amigos">Amigos</option>
              <option value="Compañeros de universidad">Compañeros de Universidad</option>
              <option value="Profesores">Profesores</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        )}
      </div>

      {/* VISTA 1: TARJETAS LIQUID GLASS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          {filteredPeople.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Users className="w-8 h-8 text-purple-400" />}
              title="Sin Expedientes Personales"
              description="No hay personas o contactos registrados que coincidan con tu búsqueda."
              accentColor="purple"
            />
          ) : (
            <div className="space-y-6">
              {/* FAVORITOS PRIORITARIOS */}
              {favoritePeople.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-amber-300 text-sm">
                    <Star className="w-4 h-4 fill-amber-300" />
                    Personas Prioritarias & Favoritos ({favoritePeople.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoritePeople.map(p => (
                      <PersonLiquidGlassCard
                        key={p.id}
                        person={p}
                        data={data}
                        todayStr={todayStr}
                        onClick={() => setSelectedPerson(p)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* REGULARES */}
              <div className="space-y-3">
                {favoritePeople.length > 0 && (
                  <div className="font-serif font-bold text-slate-300 text-sm pt-2">
                    Todos los Contactos ({regularPeople.length})
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularPeople.map(p => (
                    <PersonLiquidGlassCard
                      key={p.id}
                      person={p}
                      data={data}
                      todayStr={todayStr}
                      onClick={() => setSelectedPerson(p)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: MAPA DE RELACIONES */}
      {activeTab === 'map' && (
        <RelationshipMapView
          data={data}
          onSelectPerson={p => setSelectedPerson(p)}
        />
      )}

      {/* VISTA 3: CALENDARIO SOCIAL */}
      {activeTab === 'calendar' && (
        <SocialCalendarView
          data={data}
          onSelectPerson={p => setSelectedPerson(p)}
        />
      )}

      {/* VISTA 4: HISTORIAL DE INTERACCIONES */}
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
                    ...people.map(p => ({ value: p.id, label: p.name }))
                  ]}
                />

                <ExecutiveSelect
                  label="Tipo de Interacción"
                  value={intType}
                  onChange={e => setIntType(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'Llamada', label: '📞 Llamada' },
                    { value: 'Conversación', label: '🗣️ Conversación presencial' },
                    { value: 'Reunión', label: '🤝 Reunión' },
                    { value: 'Mensaje', label: '💬 Mensaje / Chat' },
                    { value: 'Salida', label: '☕ Salida / Almuerzo' },
                    { value: 'Clase', label: '🎓 Clase / Tutoría' },
                    { value: 'Otro', label: '📌 Otro' }
                  ]}
                />

                <div className="sm:col-span-1 lg:col-span-2">
                  <ExecutiveInput
                    label="Descripción *"
                    placeholder="Ej: Conversación sobre proyectos, consejo o actualización"
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

          {interactions.length === 0 ? (
            <ExecutiveEmptyState
              icon={<MessageSquare className="w-8 h-8 text-purple-400" />}
              title="Sin Interacciones Registradas"
              description="No hay un historial de llamadas, mensajes o conversaciones registradas."
              accentColor="purple"
            />
          ) : (
            <div className="space-y-2.5">
              {interactions
                .slice()
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(i => {
                  const person = people.find(p => p.id === i.personId);

                  return (
                    <div
                      key={i.id}
                      className="p-4 bg-[#132337]/80 backdrop-blur-md border border-white/10 rounded-xl flex justify-between items-center text-xs hover:border-purple-400/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-white text-sm">{person?.name || 'Contacto'}</h4>
                          <ExecutiveBadge variant="subtle" accentColor="purple">
                            {i.type}
                          </ExecutiveBadge>
                        </div>
                        <p className="text-slate-300 mt-1">{i.description}</p>
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
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 5: COMPROMISOS */}
      {activeTab === 'commitments' && (
        <div className="space-y-6">
          <GlassPanel accentColor="purple" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Crear Compromiso Social
            </h3>

            <ExecutiveForm onSubmit={handleCreateCommitment}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveInput
                  label="Título del Compromiso *"
                  placeholder="Ej: Cena de graduación, Reunión con tutor"
                  value={comTitle}
                  onChange={e => setComTitle(e.target.value)}
                  accentColor="purple"
                  required
                />

                <ExecutiveSelect
                  label="Persona Relacionada"
                  value={comPersonId}
                  onChange={e => setComPersonId(e.target.value)}
                  accentColor="purple"
                  options={[
                    { value: '', label: '-- General / Sin persona --' },
                    ...people.map(p => ({ value: p.id, label: p.name }))
                  ]}
                />

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
                  Guardar Compromiso (Sincroniza con Oval Office)
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {commitments.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Clock className="w-8 h-8 text-purple-400" />}
              title="Sin Compromisos Agendados"
              description="No hay compromisos o eventos sociales agendados."
              accentColor="purple"
            />
          ) : (
            <div className="space-y-2.5">
              {commitments.map(c => {
                const person = c.peopleIds.length > 0 ? people.find(p => p.id === c.peopleIds[0]) : undefined;

                return (
                  <div
                    key={c.id}
                    className="p-4 bg-[#132337]/80 backdrop-blur-md border border-white/10 rounded-xl flex justify-between items-center text-xs hover:border-purple-400/40 transition-all"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{c.title}</h4>
                      <p className="text-slate-400 font-mono mt-0.5">
                        Fecha: {c.date} a las {c.startTime || '12:00'} {person ? `• Con: ${person.name}` : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => SocialStore.deleteCommitment(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PERSON PROFILE MODAL / EXPEDIENTE */}
      {selectedPerson && (
        <PersonProfileModal
          person={selectedPerson}
          data={data}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

// LIQUID GLASS PERSON CARD COMPONENT
const PersonLiquidGlassCard: React.FC<{
  person: SocialPerson;
  data: SocialOfficeData;
  todayStr: string;
  onClick: () => void;
}> = ({ person, data, todayStr, onClick }) => {
  const lastInt = SocialCalculations.getLastInteraction(person.id, data.interactions || []);
  const pendingCommitment = (data.commitments || []).find(c => c.peopleIds.includes(person.id) && c.date >= todayStr);

  // Next Birthday countdown
  let bdayInfo: { daysLeft: number; isToday: boolean } | null = null;
  if (person.birthday) {
    bdayInfo = SocialCalculations.getDaysUntilNextOccurrence(person.birthday, todayStr);
  }

  // Visual status indicators
  const isHighImportance = person.importanceLevel === 'Muy importante';
  const isUncontacted = lastInt && lastInt.daysAgo >= 30;

  // Initials
  const initials = person.name
    ? person.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'P';

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-xl backdrop-blur-xl bg-gradient-to-br from-[#132337]/90 via-[#0c1929]/80 to-[#132337]/90 ${
        person.isFavorite
          ? 'border-amber-500/50 hover:border-amber-400'
          : 'border-white/15 hover:border-purple-400/60'
      }`}
    >
      {/* GLASS REFLECTION SHIMMER */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-3">
        {/* CARD HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {person.photoUrl ? (
              <img
                src={person.photoUrl}
                alt={person.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-purple-400 shadow"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 border-2 border-purple-400 flex items-center justify-center font-serif font-bold text-lg text-white shadow">
                {initials}
              </div>
            )}

            <div>
              <h4 className="font-serif font-bold text-white text-base group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                {person.name}
                {person.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />}
              </h4>
              <p className="text-xs text-purple-300 font-semibold">{person.relationship || person.category}</p>
            </div>
          </div>

          <ExecutiveBadge variant="subtle" accentColor={isHighImportance ? 'rose' : 'purple'}>
            {person.importanceLevel}
          </ExecutiveBadge>
        </div>

        {/* METRICS & INDICATORS */}
        <div className="pt-1 border-t border-white/10 text-xs space-y-1.5">
          {/* Last Interaction */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-[11px] text-slate-400">Último contacto:</span>
            <span className={`font-mono text-[11px] font-bold ${isUncontacted ? 'text-rose-400' : 'text-slate-200'}`}>
              {lastInt ? (lastInt.daysAgo === 0 ? 'Hoy' : `hace ${lastInt.daysAgo} días`) : 'Sin registro'}
            </span>
          </div>

          {/* Birthday countdown if exists */}
          {bdayInfo && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Cake className="w-3 h-3 text-amber-400" /> Cumpleaños:
              </span>
              <span className="text-amber-300 font-bold font-mono text-[11px]">
                {bdayInfo.isToday ? '¡Hoy! 🎉' : `En ${bdayInfo.daysLeft} días`}
              </span>
            </div>
          )}

          {/* Next Commitment if exists */}
          {pendingCommitment && (
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" /> Compromiso:
              </span>
              <span className="text-blue-300 font-bold text-[11px] truncate max-w-[130px]">
                {pendingCommitment.title} ({pendingCommitment.date})
              </span>
            </div>
          )}
        </div>

        {/* VISUAL STATUS BADGES */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {bdayInfo && bdayInfo.daysLeft <= 14 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
              🎂 Cumpleaños Próximo
            </span>
          )}
          {pendingCommitment && (
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">
              📅 Compromiso Pendiente
            </span>
          )}
          {isUncontacted && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
              💬 Sin contacto reciente
            </span>
          )}
          {isHighImportance && (
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
              ⭐ Alta Importancia
            </span>
          )}
        </div>

        {/* CLICK TO VIEW EXPEDIENTE CTA */}
        <div className="pt-2 text-right">
          <span className="text-[11px] text-purple-300 font-semibold group-hover:underline">
            Abrir Expediente Personal →
          </span>
        </div>
      </div>
    </div>
  );
};

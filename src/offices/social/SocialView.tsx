import React, { useState } from 'react';
import { SocialOfficeData, SocialPerson } from '../../types/store';
import { SocialStore } from './SocialStore';
import { SocialCalculations } from './SocialCalculations';
import { SocialAgendaGrid } from './SocialAgendaGrid';
import { RecentMemoriesSection } from './RecentMemoriesSection';
import { SocialCalendarView } from './SocialCalendarView';
import { PersonProfileModal } from './PersonProfileModal';
import { CreatePlanModal } from './CreatePlanModal';
import { CreatePersonModal } from './CreatePersonModal';
import { getTodayDateString, getDaysDifference } from '../../utils/dates';
import {
  Users,
  Heart,
  Calendar as CalendarIcon,
  Plus,
  Star,
  Sparkles,
  Clock,
  Cake,
  MessageSquare,
  Search,
  UserPlus,
  ChevronRight,
  Smile,
  ShieldCheck
} from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  profileName?: string;
}

export const SocialView: React.FC<Props> = ({ data, profileName = 'Alex' }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'calendar' | 'people'>('agenda');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedPerson, setSelectedPerson] = useState<SocialPerson | null>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [createPlanDefaultDate, setCreatePlanDefaultDate] = useState<string | undefined>(undefined);
  const [isCreatePersonOpen, setIsCreatePersonOpen] = useState(false);

  const todayStr = getTodayDateString();
  const people = data.people || [];
  const commitments = data.commitments || [];
  const interactions = data.interactions || [];

  // ==========================================
  // REAL INDICATORS CALCULATIONS (NO HARDCODED DATA)
  // ==========================================
  
  // 1. Events this week
  const today = new Date(todayStr + 'T12:00:00');
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

  const eventsThisWeekCount = commitments.filter(
    c => c.date >= todayStr && c.date <= endOfWeekStr
  ).length;

  // 2. Next Birthday
  const upcomingList = SocialCalculations.getUpcomingDatesList(data, todayStr);
  const nextBirthday = upcomingList.find(u => u.type === 'birthday');

  // 3. People with upcoming plans
  const upcomingCommitments = commitments.filter(c => c.date >= todayStr);
  const peopleWithPlansIds = new Set<string>();
  upcomingCommitments.forEach(c => (c.peopleIds || []).forEach(id => peopleWithPlansIds.add(id)));
  const peopleWithPlansCount = peopleWithPlansIds.size;

  // 4. Contact with longest uncontacted time
  const uncontactedAlerts = SocialCalculations.getUncontactedPeopleAlerts(data, 1);
  const longestUncontacted = uncontactedAlerts.length > 0 ? uncontactedAlerts[0] : null;

  // Favorites & People filtering
  const favoritePeople = people.filter(p => p.isFavorite);
  const displayFavorites = favoritePeople.length > 0 ? favoritePeople : people.slice(0, 6);

  const filteredPeople = people.filter(p => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.nickname && p.nickname.toLowerCase().includes(q)) ||
      (p.relationship && p.relationship.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const handleOpenCreatePlan = (dateStr?: string) => {
    setCreatePlanDefaultDate(dateStr);
    setIsCreatePlanOpen(true);
  };

  return (
    <div className="space-y-7 text-slate-100 font-sans pb-16">
      
      {/* 1. HEADER & PHILOSOPHY BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#101c30] to-[#0a1220] border border-slate-700 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Heart className="w-5 h-5 fill-purple-400/20" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Oficina de Relaciones • Centro de Vida Social
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-purple-200/90 italic font-medium leading-relaxed">
              "No administrar contactos. Administrar relaciones. No administrar fechas. Administrar experiencias. No administrar formularios. Administrar momentos."
            </p>

            <p className="text-xs font-serif font-bold text-amber-200/90 pt-1">
              ¿Cómo está mi vida social y qué planes comparto con las personas importantes para mí?
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenCreatePlan()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Crear Plan Social</span>
            </button>

            <button
              onClick={() => setIsCreatePersonOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Agregar Persona</span>
            </button>
          </div>
        </div>

        {/* TOP COMPACT SUMMARY BAR (RESUMEN SOCIAL) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Eventos esta semana</span>
              <strong className="text-base font-serif font-bold text-slate-900">{eventsThisWeekCount} planes</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
              <Cake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Próximo Cumpleaños</span>
              <strong className="text-xs font-serif font-bold text-amber-800 truncate block max-w-[130px]">
                {nextBirthday ? `${nextBirthday.personName} (${nextBirthday.daysLeft === 0 ? '¡Hoy!' : `en ${nextBirthday.daysLeft}d`})` : 'Ninguno próximo'}
              </strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Personas con Planes</span>
              <strong className="text-base font-serif font-bold text-slate-900">{peopleWithPlansCount} personas</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Contacto Pendiente</span>
              <strong className="text-xs font-serif font-bold text-rose-800 truncate block max-w-[130px]">
                {longestUncontacted ? `${longestUncontacted.person.name} (${longestUncontacted.daysAgo}d)` : 'Al día'}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* 2. PERSONAS FAVORITAS (QUICK ACCESS CAROUSEL/GRID) */}
      <div className="bg-white border border-slate-200 backdrop-blur-2xl rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="font-serif font-bold text-sm text-slate-900 uppercase tracking-wider">
              Personas Favoritas y Cercanas
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('people')}
            className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos ({people.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {people.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-500">
              Aún no tienes personas registradas. Añade a tus amigos, familiares y contactos principales para comenzar.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto pb-2 pr-2">
            {displayFavorites.map(p => {
              const initials = p.name ? p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P';
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPerson(p)}
                  className="flex flex-col items-center gap-2 group shrink-0 transition-transform active:scale-95 cursor-pointer"
                >
                  <div className="relative">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-purple-400/60 group-hover:border-purple-600 shadow-xl group-hover:scale-105 transition-all"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 border-2 border-purple-400/60 group-hover:border-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-xl group-hover:scale-105 transition-all">
                        {initials}
                      </div>
                    )}
                    {p.isFavorite && (
                      <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full shadow">
                        <Star className="w-3 h-3 text-slate-950 fill-slate-950" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-900 max-w-[80px] sm:max-w-[90px] truncate group-hover:text-purple-700 transition-colors">
                      {p.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-[80px] truncate">
                      {p.relationship || p.category}
                    </p>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setIsCreatePersonOpen(true)}
              className="flex flex-col items-center justify-center gap-2 shrink-0 group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-purple-400/60 hover:border-purple-600 bg-purple-50 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 group-hover:text-purple-900">Añadir</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. TABS SWITCHER */}
      <div className="flex border-b border-slate-200 bg-slate-100 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'agenda'
              ? 'bg-purple-700 text-white shadow-lg'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Agenda Social & Recuerdos</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-purple-700 text-white shadow-lg'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Calendario Social Mensual</span>
        </button>

        <button
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'people'
              ? 'bg-purple-700 text-white shadow-lg'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Relaciones ({people.length})</span>
        </button>
      </div>

      {/* TAB 1: MAIN LAYOUT (AGENDA SOCIAL + PRÓXIMOS EVENTOS SIDE PANEL + RECUERDOS RECIENTES) */}
      {activeTab === 'agenda' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* MAIN STAGE (2 COLS): AGENDA SOCIAL */}
            <div className="lg:col-span-2 space-y-6">
              <SocialAgendaGrid
                data={data}
                onOpenCreatePlan={handleOpenCreatePlan}
                onSelectPerson={setSelectedPerson}
              />
            </div>

            {/* SIDE PANEL (1 COL): PRÓXIMOS EVENTOS */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 backdrop-blur-2xl rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="font-serif font-bold text-base text-slate-900">Próximos Eventos</h3>
                  </div>
                  <span className="text-[10px] text-purple-700 font-mono font-bold">Compromisos Reales</span>
                </div>

                {upcomingCommitments.length === 0 && upcomingList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Sin eventos o fechas próximas programadas.</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {/* UPCOMING COMMITMENTS */}
                    {upcomingCommitments.slice(0, 5).map(c => {
                      const participant = c.peopleIds.length > 0 ? people.find(p => p.id === c.peopleIds[0]) : undefined;
                      const daysLeft = getDaysDifference(todayStr, c.date);

                      return (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#101b2d] to-[#0d1625] border border-slate-700 space-y-1.5"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-serif font-bold text-white text-xs">{c.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 shrink-0">
                              {daysLeft === 0 ? '¡Hoy!' : daysLeft === 1 ? 'Mañana' : `En ${daysLeft} días`}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 font-mono">
                            {c.date} • {c.startTime || '12:00'} {c.location ? `• ${c.location}` : ''}
                          </p>

                          {participant && (
                            <button
                              onClick={() => setSelectedPerson(participant)}
                              className="text-[11px] text-purple-300 hover:text-white font-medium flex items-center gap-1 pt-1 cursor-pointer"
                            >
                              <span>Con {participant.name}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* UPCOMING SPECIAL DATES (BIRTHDAYS, ETC.) */}
                    {upcomingList.filter(u => u.type === 'birthday' || u.type === 'anniversary').slice(0, 4).map(u => (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 to-purple-950/80 border border-amber-500/30 space-y-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-serif font-bold text-amber-200 text-xs">{u.title}</span>
                          <span className="text-[10px] font-bold text-amber-400">
                            {u.isToday ? '¡Hoy!' : `En ${u.daysLeft} días`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-mono">{u.dateStr}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 4. RECUERDOS RECIENTES */}
          <RecentMemoriesSection
            data={data}
            onSelectPerson={setSelectedPerson}
          />
        </div>
      )}

      {/* TAB 2: CALENDARIO SOCIAL EXCLUSIVO */}
      {activeTab === 'calendar' && (
        <SocialCalendarView
          data={data}
          onSelectPerson={setSelectedPerson}
        />
      )}

      {/* TAB 3: DIRECTORIO DE PERSONAS */}
      {activeTab === 'people' && (
        <div className="space-y-5">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar persona por nombre, ciudad, relación..."
                className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsCreatePersonOpen(true)}
              className="px-4 py-2 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Persona</span>
            </button>
          </div>

          {filteredPeople.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded-3xl space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-700">No se encontraron expedientes de personas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPeople.map(p => {
                const initials = p.name ? p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P';
                const lastInt = SocialCalculations.getLastInteraction(p.id, interactions);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPerson(p)}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 backdrop-blur-2xl shadow-xl transition-all duration-300 cursor-pointer space-y-4 hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3.5">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400/50 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 border-2 border-purple-400/50 flex items-center justify-center text-white font-serif font-bold text-xl shrink-0">
                          {initials}
                        </div>
                      )}

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-bold text-slate-900 text-base truncate">{p.name}</h4>
                          {p.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-purple-700 font-medium truncate">{p.relationship || p.category}</p>
                        {p.city && <p className="text-[10px] text-slate-500 truncate">{p.city}</p>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-700">
                      <span>Nivel: <strong className="text-slate-900">{p.importanceLevel}</strong></span>
                      <span className="font-mono text-slate-500">
                        {lastInt ? `Últ. contacto: ${lastInt.daysAgo === 0 ? 'Hoy' : `${lastInt.daysAgo}d`}` : 'Sin interacciones'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {selectedPerson && (
        <PersonProfileModal
          person={selectedPerson}
          data={data}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      <CreatePlanModal
        data={data}
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        defaultDate={createPlanDefaultDate}
      />

      <CreatePersonModal
        isOpen={isCreatePersonOpen}
        onClose={() => setIsCreatePersonOpen(false)}
      />

    </div>
  );
};

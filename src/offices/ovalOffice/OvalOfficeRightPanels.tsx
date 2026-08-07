import React from 'react';
import { MasterState, SocialCommitment, SocialPerson } from '../../types/store';
import { Users, Calendar, Heart, Image, ChevronRight, Plus, UserPlus } from 'lucide-react';

interface Props {
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
}

export const OvalOfficeRightPanels: React.FC<Props> = ({
  state,
  onNavigateToOffice
}) => {
  const socialOffice = state.offices.vidaSocial;

  // 1. Agenda Social Items (From commitments or today's timeline)
  const commitments = socialOffice?.commitments || [];
  const people = socialOffice?.people || [];

  // Default initial photorealistic avatars for demo if people are defined
  const getAvatarForPerson = (personName: string) => {
    const lower = personName.toLowerCase();
    if (lower.includes('laura')) return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
    if (lower.includes('andrés') || lower.includes('andres')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
    if (lower.includes('juan')) return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
    if (lower.includes('mamá') || lower.includes('mama')) return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
    return null;
  };

  // Build agenda social display items
  const agendaItems = commitments.length > 0
    ? commitments.slice(0, 5)
    : [
        {
          id: 'demo-1',
          title: 'Almuerzo con Andrés',
          startTime: '08:00',
          location: 'Restaurante Il Forno',
          personName: 'Andrés',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        },
        {
          id: 'demo-2',
          title: 'Clase de Fisiología',
          startTime: '12:30',
          location: 'Aula 204',
          personName: '',
          avatarUrl: null
        },
        {
          id: 'demo-3',
          title: 'Café con Laura',
          startTime: '16:00',
          location: 'Café Central',
          personName: 'Laura',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
        },
        {
          id: 'demo-4',
          title: 'Entrenamiento',
          startTime: '18:00',
          location: 'Gimnasio',
          personName: '',
          avatarUrl: null
        },
        {
          id: 'demo-5',
          title: 'Cena familiar',
          startTime: '20:00',
          location: 'Casa',
          personName: 'Familia',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        }
      ];

  // 2. Upcoming Events
  const upcomingEvents = [
    { title: 'Cumpleaños de Laura', days: 'En 2 días • 15 de mayo', icon: '🎂' },
    { title: 'Viaje a Cartagena', days: 'En 7 días • 20 de mayo', icon: '✈️' },
    { title: 'Fiesta de Andrés', days: 'En 12 días • 25 de mayo', icon: '🎉' }
  ];

  // 3. Favorite People
  const favoritePeople = people.filter(p => p.isFavorite).length > 0
    ? people.filter(p => p.isFavorite).slice(0, 4)
    : [
        { id: 'p1', name: 'Laura', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        { id: 'p2', name: 'Andrés', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
        { id: 'p3', name: 'Juan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
        { id: 'p4', name: 'Mamá', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' }
      ];

  // 4. Recent Memories
  const memories = [
    {
      id: 'm1',
      title: 'Fútbol con Andrés',
      timeAgo: 'Hace 3 días',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'm2',
      title: 'Café con Laura',
      timeAgo: 'Hace 1 semana',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'm3',
      title: 'Cena familiar',
      timeAgo: 'Hace 2 semanas',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="w-72 sm:w-80 space-y-3.5 shrink-0 text-white font-sans">
      
      {/* 1. PANEL AGENDA SOCIAL */}
      <div className="bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-800" />
            <h3 className="text-xs font-serif font-bold tracking-wider uppercase text-amber-200">
              Agenda Social
            </h3>
          </div>
          <button
            onClick={() => onNavigateToOffice('vidaSocial')}
            className="text-[11px] text-amber-800/80 hover:text-amber-200 flex items-center gap-0.5 transition-colors font-medium"
          >
            Ver todo <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {agendaItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateToOffice('vidaSocial')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-amber-800 w-10">
                  {item.startTime}
                </span>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {item.location}
                  </span>
                </div>
              </div>

              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.title}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400/40 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-slate-200 flex items-center justify-center text-[10px] text-amber-800 font-bold shrink-0">
                  🏛️
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. PANEL PRÓXIMOS EVENTOS */}
      <div className="bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-800" />
            <h3 className="text-xs font-serif font-bold tracking-wider uppercase text-amber-200">
              Próximos Eventos
            </h3>
          </div>
          <button
            onClick={() => onNavigateToOffice('vidaSocial')}
            className="text-[11px] text-amber-800/80 hover:text-amber-200 flex items-center gap-0.5 transition-colors font-medium"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {upcomingEvents.map((evt, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateToOffice('vidaSocial')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-3 cursor-pointer group"
            >
              <span className="text-lg leading-none">{evt.icon}</span>
              <div>
                <span className="text-xs font-bold text-white block group-hover:text-amber-200 transition-colors">
                  {evt.title}
                </span>
                <span className="text-[10px] text-slate-500 block font-sans">
                  {evt.days}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PANEL PERSONAS FAVORITAS */}
      <div className="bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-serif font-bold tracking-wider uppercase text-amber-200">
              Personas Favoritas
            </h3>
          </div>
          <button
            onClick={() => onNavigateToOffice('vidaSocial')}
            className="text-[11px] text-amber-800/80 hover:text-amber-200 flex items-center gap-0.5 transition-colors font-medium"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {favoritePeople.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigateToOffice('vidaSocial')}
              className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/50 group-hover:scale-110 group-hover:border-amber-300 transition-all shadow-md"
              />
              <span className="text-[10px] font-medium text-slate-800 group-hover:text-amber-200 transition-colors">
                {p.name}
              </span>
            </div>
          ))}

          {/* Add person button */}
          <button
            onClick={() => onNavigateToOffice('vidaSocial')}
            className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-700 group-hover:border-amber-400 group-hover:text-amber-800 transition-all">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium text-slate-500 group-hover:text-amber-200 transition-colors">
              Agregar
            </span>
          </button>
        </div>
      </div>

      {/* 4. PANEL RECUERDOS RECIENTES */}
      <div className="bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-serif font-bold tracking-wider uppercase text-amber-200">
              Recuerdos Recientes
            </h3>
          </div>
          <button
            onClick={() => onNavigateToOffice('vidaSocial')}
            className="text-[11px] text-amber-800/80 hover:text-amber-200 flex items-center gap-0.5 transition-colors font-medium"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {memories.map((m) => (
            <div
              key={m.id}
              onClick={() => onNavigateToOffice('vidaSocial')}
              className="group cursor-pointer flex flex-col gap-1"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white group-hover:scale-105 transition-all shadow-md">
                <img
                  src={m.image}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <span className="text-[10px] font-bold text-white truncate block group-hover:text-amber-200 transition-colors">
                {m.title}
              </span>
              <span className="text-[9px] text-slate-500 block font-sans">
                {m.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

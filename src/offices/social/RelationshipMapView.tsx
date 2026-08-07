import React, { useState } from 'react';
import { SocialPerson, SocialOfficeData } from '../../types/store';
import { GlassPanel, ExecutiveBadge } from '../../components/executive';
import { Users, Heart, GraduationCap, Briefcase, UserCheck, Star, Sparkles, Network } from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  onSelectPerson: (person: SocialPerson) => void;
}

export const RelationshipMapView: React.FC<Props> = ({ data, onSelectPerson }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Familia', icon: <Heart className="w-4 h-4 text-rose-400" />, color: 'rose' },
    { name: 'Amigos', icon: <Users className="w-4 h-4 text-emerald-400" />, color: 'emerald' },
    { name: 'Compañeros de universidad', icon: <GraduationCap className="w-4 h-4 text-blue-400" />, color: 'blue' },
    { name: 'Profesores', icon: <Sparkles className="w-4 h-4 text-amber-400" />, color: 'amber' },
    { name: 'Trabajo', icon: <Briefcase className="w-4 h-4 text-indigo-400" />, color: 'indigo' },
    { name: 'Otros', icon: <UserCheck className="w-4 h-4 text-purple-400" />, color: 'purple' }
  ];

  const people = data.people || [];

  return (
    <div className="space-y-6">
      <GlassPanel accentColor="purple" padding="md">
        <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Mapa Visual de Redes Personales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organización por clústeres relacionales y nodos de vinculación personal.
            </p>
          </div>
          <span className="text-xs text-purple-300 font-mono font-bold">{people.length} Contactos</span>
        </div>

        {/* CATEGORY FILTER CLUSTERS */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === null
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900'
            }`}
          >
            Todos los Clústeres ({people.length})
          </button>
          {categories.map(cat => {
            const count = people.filter(p => p.category === cat.name).length;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  selectedCategory === cat.name
                    ? 'bg-purple-500/25 text-purple-300 border-purple-400'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:border-purple-500/40'
                }`}
              >
                {cat.icon}
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* VISUAL MAP GROUPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories
            .filter(cat => selectedCategory === null || selectedCategory === cat.name)
            .map(cat => {
              const catPeople = people.filter(p => p.category === cat.name);
              if (catPeople.length === 0 && selectedCategory !== null) return null;

              return (
                <div
                  key={cat.name}
                  className="p-4 bg-white/90 border border-purple-500/30 rounded-2xl space-y-3 relative overflow-hidden backdrop-blur-md shadow-lg"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2 font-serif font-bold text-slate-900 text-sm">
                      {cat.icon}
                      <span>{cat.name}</span>
                    </div>
                    <ExecutiveBadge variant="subtle" accentColor="purple">
                      {catPeople.length} miembros
                    </ExecutiveBadge>
                  </div>

                  {catPeople.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Sin contactos en este grupo.</p>
                  ) : (
                    <div className="space-y-2">
                      {catPeople.map(p => {
                        const initials = p.name
                          ? p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                          : 'P';

                        return (
                          <div
                            key={p.id}
                            onClick={() => onSelectPerson(p)}
                            className="p-2.5 bg-slate-50 border border-slate-200 hover:border-purple-400 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:translate-x-0.5 group"
                          >
                            <div className="flex items-center gap-2.5">
                              {p.photoUrl ? (
                                <img
                                  src={p.photoUrl}
                                  alt={p.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-purple-400"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-200">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <h5 className="font-serif font-bold text-slate-900 text-xs group-hover:text-purple-300 transition-colors flex items-center gap-1">
                                  {p.name}
                                  {p.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />}
                                </h5>
                                <span className="text-[10px] text-slate-500 block">{p.relationship || p.importanceLevel}</span>
                              </div>
                            </div>

                            <span className="text-[10px] text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                              Ver expediente →
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </GlassPanel>
    </div>
  );
};

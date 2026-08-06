import React from 'react';
import { SocialOfficeData, SocialCommitment, SocialPerson } from '../../types/store';
import { EVENT_TYPE_OPTIONS } from './CreatePlanModal';
import { Star, Heart, Calendar, Sparkles, User, MapPin } from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  onSelectPerson: (person: SocialPerson) => void;
}

export const RecentMemoriesSection: React.FC<Props> = ({ data, onSelectPerson }) => {
  const commitments = data.commitments || [];
  const people = data.people || [];

  // Filter commitments that have a rating or memoryNote or memoryPhotoUrl, or completed commitments
  const reviewedCommitments = commitments.filter(c => c.rating || c.memoryNote || c.memoryPhotoUrl || c.isCompleted);

  // Sort by date descending
  reviewedCommitments.sort((a, b) => b.date.localeCompare(a.date));

  // Also extract interactions that have rich notes
  const interactions = (data.interactions || [])
    .filter(i => i.type === 'Salida' || i.type === 'Reunión' || i.type === 'Conversación')
    .sort((a, b) => b.date.localeCompare(a.date));

  if (reviewedCommitments.length === 0 && interactions.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-white/10 backdrop-blur-2xl text-center space-y-2">
        <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
        <h4 className="font-serif font-bold text-white text-base">Recuerdos Recientes</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Aún no has registrado momentos guardados. Cuando termine un café, salida o celebración, podrás calificar la experiencia y guardar fotografías y notas que se transformarán en tus recuerdos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400/20" />
          <h3 className="font-serif font-bold text-lg text-white">Recuerdos Recientes</h3>
        </div>
        <span className="text-xs text-purple-300 font-mono">
          {reviewedCommitments.length} momentos conservados
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviewedCommitments.slice(0, 6).map(c => {
          const participant = c.peopleIds.length > 0 ? people.find(p => p.id === c.peopleIds[0]) : undefined;
          const meta = EVENT_TYPE_OPTIONS.find(o => o.id === c.eventType) || EVENT_TYPE_OPTIONS.find(o => o.id === 'Café')!;

          return (
            <div
              key={c.id}
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#0e1828] to-[#121f35] border border-white/10 hover:border-purple-400/50 backdrop-blur-2xl shadow-xl transition-all duration-300 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* PHOTO IF AVAILABLE */}
                {c.memoryPhotoUrl && (
                  <div className="overflow-hidden rounded-2xl h-36 w-full border border-white/10">
                    <img
                      src={c.memoryPhotoUrl}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm line-clamp-1">{c.title}</h4>
                      <p className="text-[11px] text-purple-300 font-mono">{c.date}</p>
                    </div>
                  </div>

                  {c.rating && (
                    <div className="flex items-center text-amber-400 text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="ml-1 font-bold">{c.rating}.0</span>
                    </div>
                  )}
                </div>

                {c.memoryNote && (
                  <p className="text-xs text-slate-300 italic bg-black/30 p-2.5 rounded-xl border border-white/5 line-clamp-3">
                    "{c.memoryNote}"
                  </p>
                )}
              </div>

              {/* FOOTER PARTICIPANT */}
              {participant && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectPerson(participant)}
                    className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                  >
                    {participant.photoUrl ? (
                      <img
                        src={participant.photoUrl}
                        alt={participant.name}
                        className="w-6 h-6 rounded-full object-cover border border-purple-400/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {participant.name.substring(0, 1)}
                      </div>
                    )}
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
                      {participant.name}
                    </span>
                  </button>

                  <span className="text-[10px] text-slate-400">
                    {c.location || participant.relationship}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

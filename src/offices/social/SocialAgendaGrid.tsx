import React, { useState } from 'react';
import { SocialOfficeData, SocialCommitment, SocialPerson, SocialEventType } from '../../types/store';
import { SocialStore } from './SocialStore';
import { EVENT_TYPE_OPTIONS } from './CreatePlanModal';
import { getTodayDateString } from '../../utils/dates';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Heart
} from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  onOpenCreatePlan: (dateStr?: string) => void;
  onSelectPerson: (person: SocialPerson) => void;
}

export const SocialAgendaGrid: React.FC<Props> = ({
  data,
  onOpenCreatePlan,
  onSelectPerson
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeMemoryCommitment, setActiveMemoryCommitment] = useState<SocialCommitment | null>(null);

  // Memory Prompt Form State
  const [memoryRating, setMemoryRating] = useState<number>(5);
  const [memoryPhoto, setMemoryPhoto] = useState<string>('');
  const [memoryNote, setMemoryNote] = useState<string>('');
  const [isMemorySaved, setIsMemorySaved] = useState<boolean>(false);

  const todayStr = getTodayDateString();
  const people = data.people || [];
  const commitments = data.commitments || [];

  // Filter commitments for selected date
  const dayCommitments = commitments.filter(c => c.date === selectedDate);

  // Sort by startTime
  dayCommitments.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // Calculate day navigation
  const handleShiftDate = (days: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isSelectedDateToday = selectedDate === todayStr;

  // Find recent finished events without memory review to show prompt card
  const pastUnreviewedCommitment = commitments.find(c => {
    if (c.date < todayStr) return !c.rating && !c.memoryNote;
    if (c.date === todayStr) {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (c.endTime && c.endTime <= currentHHMM) {
        return !c.rating && !c.memoryNote;
      }
    }
    return false;
  });

  const getEventTypeMeta = (typeStr?: string, titleStr?: string) => {
    if (typeStr) {
      const found = EVENT_TYPE_OPTIONS.find(o => o.id === typeStr || o.label === typeStr);
      if (found) return found;
    }
    const tLower = (titleStr || '').toLowerCase();
    if (tLower.includes('café') || tLower.includes('cafe')) return EVENT_TYPE_OPTIONS.find(o => o.id === 'Café')!;
    if (tLower.includes('cine') || tLower.includes('película')) return EVENT_TYPE_OPTIONS.find(o => o.id === 'Cine')!;
    if (tLower.includes('comer') || tLower.includes('almuerzo') || tLower.includes('cena')) return EVENT_TYPE_OPTIONS.find(o => o.id === 'Comer')!;
    if (tLower.includes('fiesta') || tLower.includes('cumple')) return EVENT_TYPE_OPTIONS.find(o => o.id === 'Fiesta')!;
    if (tLower.includes('caminar') || tLower.includes('paseo')) return EVENT_TYPE_OPTIONS.find(o => o.id === 'Caminar')!;
    if (tLower.includes('deporte') || tLower.includes('partido')) return EVENT_TYPE_OPTIONS.find(o => o.id === 'Deporte')!;
    return EVENT_TYPE_OPTIONS.find(o => o.id === 'Otro')!;
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMemoryCommitment) return;

    SocialStore.updateCommitment(activeMemoryCommitment.id, {
      rating: memoryRating,
      memoryPhotoUrl: memoryPhoto.trim() || undefined,
      memoryNote: memoryNote.trim() || undefined,
      isCompleted: true
    });

    // Also register as an interaction for participants if note is present
    if (activeMemoryCommitment.peopleIds && activeMemoryCommitment.peopleIds.length > 0) {
      activeMemoryCommitment.peopleIds.forEach(pId => {
        SocialStore.addInteraction({
          personId: pId,
          date: activeMemoryCommitment.date,
          type: 'Salida',
          description: `Recuerdo de "${activeMemoryCommitment.title}": ${memoryNote.trim() || 'Momento compartido registrado'}`
        });
      });
    }

    setIsMemorySaved(true);
    setTimeout(() => {
      setIsMemorySaved(false);
      setActiveMemoryCommitment(null);
      setMemoryNote('');
      setMemoryPhoto('');
    }, 600);
  };

  // Helper to convert HH:MM to minutes from 06:00
  const timeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return Math.max(0, (h - 6) * 60 + m);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* DISCREET POST-EVENT PROMPT CARD ("¿Cómo estuvo el café con Laura?") */}
      {(pastUnreviewedCommitment || activeMemoryCommitment) && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-900/60 via-pink-950/40 to-slate-900/80 border border-purple-400/40 backdrop-blur-xl shadow-xl space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Experiencia Reciente • Guardar Recuerdo</span>
            </div>
            <button
              onClick={() => setActiveMemoryCommitment(null)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Cerrar
            </button>
          </div>

          {(() => {
            const targetCommitment = activeMemoryCommitment || pastUnreviewedCommitment!;
            const meta = getEventTypeMeta(targetCommitment.eventType, targetCommitment.title);
            const participantNames = targetCommitment.peopleIds
              .map(id => people.find(p => p.id === id)?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                      ¿Cómo estuvo {targetCommitment.title}{participantNames ? ` con ${participantNames}` : ''}?
                    </h4>
                    <p className="text-xs text-slate-700">
                      {targetCommitment.date} • {targetCommitment.startTime || '12:00'} - {targetCommitment.endTime || '13:00'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveMemory} className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-700 font-semibold mr-1">Calificación:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setMemoryRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= memoryRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <input
                      type="url"
                      value={memoryPhoto}
                      onChange={e => setMemoryPhoto(e.target.value)}
                      placeholder="Fotografía URL (Opcional)"
                      className="bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3 py-1 text-xs text-slate-900 focus:outline-none w-full sm:w-64"
                    />
                  </div>

                  <input
                    type="text"
                    value={memoryNote}
                    onChange={e => setMemoryNote(e.target.value)}
                    placeholder="Escribe un recuerdo o nota de esta experiencia (ej. Un café delicioso, quedamos en repetir la próxima semana)..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-purple-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveMemoryCommitment(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-900"
                    >
                      Saltar por ahora
                    </button>

                    <button
                      type="submit"
                      onClick={() => setActiveMemoryCommitment(targetCommitment)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      {isMemorySaved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> ¡Recuerdo Guardado!
                        </>
                      ) : (
                        <>
                          <Heart className="w-3.5 h-3.5 fill-white" /> Guardar en Recuerdos
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </div>
      )}

      {/* AGENDA HEADER & DATE CONTROLS */}
      <div className="bg-white dark:bg-white border border-slate-200 dark:border-slate-200 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-400/40 text-purple-300">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                Agenda Social
              </h3>
              <p className="text-xs text-slate-700 capitalize">
                {formatDisplayDate(selectedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1">
              <button
                onClick={() => handleShiftDate(-1)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-700 hover:text-slate-900 transition-colors"
                title="Día Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSelectedDateToday
                    ? 'bg-purple-500 text-slate-950 shadow'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Hoy
              </button>

              <button
                onClick={() => handleShiftDate(1)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-700 hover:text-slate-900 transition-colors"
                title="Día Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
            />

            <button
              onClick={() => onOpenCreatePlan(selectedDate)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Plan Social</span>
            </button>
          </div>
        </div>

        {/* VISUAL TIMELINE / BLOCKS */}
        {dayCommitments.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
            <Clock className="w-10 h-10 text-purple-400/50 mx-auto" />
            <h4 className="font-serif font-bold text-slate-900 text-base">No hay planes sociales para este día</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Planifica un café, cena, caminata o salida con las personas importantes de tu vida.
            </p>
            <button
              onClick={() => onOpenCreatePlan(selectedDate)}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Plan para este día</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {dayCommitments.map(commitment => {
              const meta = getEventTypeMeta(commitment.eventType, commitment.title);
              const participants = (commitment.peopleIds || [])
                .map(id => people.find(p => p.id === id))
                .filter((p): p is SocialPerson => p !== undefined);

              // Calculate start and end duration minutes
              const startMin = timeToMinutes(commitment.startTime || '12:00');
              const endMin = timeToMinutes(commitment.endTime || '13:00');
              const durationMinutes = Math.max(30, endMin - startMin);
              const durationHoursStr =
                durationMinutes >= 60
                  ? `${(durationMinutes / 60).toFixed(1).replace('.0', '')} hrs`
                  : `${durationMinutes} mins`;

              return (
                <div
                  key={commitment.id}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-lg transition-all duration-200"
                  style={{
                    // height proportional to duration, minimum 110px
                    minHeight: `${Math.max(110, Math.min(220, durationMinutes * 1.3))}px`
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 h-full">
                    
                    {/* LEFT CONTENT */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl">{meta.emoji}</span>
                        <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                          {commitment.title}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-gradient-to-r ${meta.color}`}>
                          {commitment.eventType || 'Plan Social'}
                        </span>
                      </div>

                      {/* TIME & LOCATION */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-mono">
                        <span className="flex items-center gap-1 text-purple-300 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {commitment.startTime || '12:00'} - {commitment.endTime || '13:00'} ({durationHoursStr})
                        </span>

                        {commitment.location && (
                          <span className="flex items-center gap-1 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            {commitment.location}
                          </span>
                        )}
                      </div>

                      {commitment.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {commitment.description}
                        </p>
                      )}

                      {/* MEMORY REVIEW / RATING DISPLAY IF COMPLETED */}
                      {commitment.rating && (
                        <div className="pt-2 flex items-center gap-2 text-xs bg-purple-950/40 p-2 rounded-xl border border-purple-500/30">
                          <span className="text-amber-400 flex items-center gap-0.5">
                            {Array.from({ length: commitment.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </span>
                          {commitment.memoryNote && (
                            <span className="text-slate-700 italic">"{commitment.memoryNote}"</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* RIGHT PARTICIPANTS & ACTIONS */}
                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0">
                      
                      {/* PARTICIPANTS AVATARS */}
                      {participants.length > 0 && (
                        <div className="flex items-center -space-x-2">
                          {participants.map(p => (
                            <button
                              key={p.id}
                              onClick={() => onSelectPerson(p)}
                              title={`${p.name} (${p.relationship})`}
                              className="relative group/avatar"
                            >
                              {p.photoUrl ? (
                                <img
                                  src={p.photoUrl}
                                  alt={p.name}
                                  className="w-9 h-9 rounded-full object-cover border-2 border-slate-900 shadow-md group-hover/avatar:scale-110 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-slate-900 flex items-center justify-center text-slate-900 font-bold text-xs shadow-md group-hover/avatar:scale-110 transition-transform">
                                  {p.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!commitment.rating && (
                          <button
                            onClick={() => setActiveMemoryCommitment(commitment)}
                            className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                            title="Calificar y guardar recuerdo"
                          >
                            <Heart className="w-3 h-3" />
                            <span>Recuerdo</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`¿Deseas eliminar el plan "${commitment.title}"?`)) {
                              SocialStore.deleteCommitment(commitment.id);
                            }
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl transition-colors"
                          title="Eliminar Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

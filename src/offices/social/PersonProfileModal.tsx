import React, { useState } from 'react';
import { SocialPerson, SocialOfficeData, PersonIdeas } from '../../types/store';
import { SocialStore } from './SocialStore';
import { SocialCalculations } from './SocialCalculations';
import { getTodayDateString } from '../../utils/dates';
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
  Gift,
  Smile,
  Utensils,
  BookOpen,
  CheckCircle2,
  Cake
} from 'lucide-react';

interface Props {
  person: SocialPerson;
  data: SocialOfficeData;
  onClose: () => void;
}

export const PersonProfileModal: React.FC<Props> = ({ person, data, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'dates' | 'timeline' | 'ideas'>('info');
  const todayStr = getTodayDateString();

  // General Info State
  const [name, setName] = useState(person.name || '');
  const [nickname, setNickname] = useState(person.nickname || '');
  const [photoUrl, setPhotoUrl] = useState(person.photoUrl || '');
  const [relationship, setRelationship] = useState(person.relationship || '');
  const [category, setCategory] = useState(person.category || 'Amigos');
  const [importanceLevel, setImportanceLevel] = useState(person.importanceLevel || 'Importante');
  const [phone, setPhone] = useState(person.phone || '');
  const [email, setEmail] = useState(person.email || '');
  const [city, setCity] = useState(person.city || '');
  const [profession, setProfession] = useState(person.profession || '');
  const [howWeMet, setHowWeMet] = useState(person.howWeMet || '');
  const [notes, setNotes] = useState(person.notes || '');

  // Ideas State
  const [likes, setLikes] = useState(person.ideas?.likes || '');
  const [hobbies, setHobbies] = useState(person.ideas?.hobbies || '');
  const [favoriteFood, setFavoriteFood] = useState(person.ideas?.favoriteFood || '');
  const [giftIdeas, setGiftIdeas] = useState(person.ideas?.giftIdeas || '');
  const [usefulInfo, setUsefulInfo] = useState(person.ideas?.usefulInfo || '');

  // Custom Date Form State
  const [cDateTitle, setCDateTitle] = useState('');
  const [cDateVal, setCDateVal] = useState(todayStr);

  // Interaction Form State
  const [intDate, setIntDate] = useState(todayStr);
  const [intType, setIntType] = useState<'Conversación' | 'Llamada' | 'Reunión' | 'Mensaje' | 'Salida' | 'Clase' | 'Otro'>('Salida');
  const [intDesc, setIntDesc] = useState('');

  const lastInteraction = SocialCalculations.getLastInteraction(person.id, data.interactions || []);
  const timeline = SocialCalculations.getPersonTimeline(person.id, data);

  const handleSaveGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    SocialStore.updatePerson(person.id, {
      name,
      nickname: nickname.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      relationship,
      category,
      importanceLevel,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      profession: profession.trim() || undefined,
      howWeMet: howWeMet.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  const handleSaveIdeas = (e: React.FormEvent) => {
    e.preventDefault();
    SocialStore.updatePerson(person.id, {
      ideas: {
        likes: likes.trim() || undefined,
        hobbies: hobbies.trim() || undefined,
        favoriteFood: favoriteFood.trim() || undefined,
        giftIdeas: giftIdeas.trim() || undefined,
        usefulInfo: usefulInfo.trim() || undefined
      }
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

  const initials = person.name
    ? person.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'P';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#09111e] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* DOSSIER HEADER */}
        <div className="p-5 sm:p-7 bg-gradient-to-r from-purple-950/80 via-[#101d30] to-[#09111e] border-b border-white/10 flex flex-wrap sm:flex-nowrap justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {person.photoUrl ? (
                <img
                  src={person.photoUrl}
                  alt={person.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400 shadow-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-800 border-2 border-purple-400 flex items-center justify-center text-white font-serif font-bold text-3xl shadow-xl">
                  {initials}
                </div>
              )}
              {person.isFavorite && (
                <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-400 text-slate-950 rounded-full shadow">
                  <Star className="w-4 h-4 fill-slate-950" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">{person.name}</h2>
                {person.nickname && (
                  <span className="text-sm font-semibold text-purple-300 italic">"{person.nickname}"</span>
                )}
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
                <span className="text-slate-400">{person.city || person.category}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                  {person.importanceLevel}
                </span>
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
              <span className="hidden sm:inline">Eliminar Expediente</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 bg-[#060c16] px-4 overflow-x-auto shrink-0">
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
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Historial de Experiencias
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ideas'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            Ideas y Gustos
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-white">
          
          {/* TAB 1: INFORMACIÓN GENERAL */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveGeneralInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Apodo (Opcional)</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="Ej: Lau, Juancho"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Relación Conmigo</label>
                  <input
                    type="text"
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    placeholder="Ej: Mamá, Amigo de universidad"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-[#101d30] border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Familia">Familia</option>
                    <option value="Amigos">Amigos</option>
                    <option value="Compañeros de universidad">Compañeros de universidad</option>
                    <option value="Profesores">Profesores</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Fotografía (URL)</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Ej. Bogotá, Medellín"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Profesión</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={e => setProfession(e.target.value)}
                    placeholder="Ej. Diseñadora, Médico"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">¿Cómo nos conocimos?</label>
                <input
                  type="text"
                  value={howWeMet}
                  onChange={e => setHowWeMet(e.target.value)}
                  placeholder="Ej. En la universidad durante el primer semestre de ingeniería..."
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notas Generales</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Información</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: FECHAS IMPORTANTES */}
          {activeTab === 'dates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl space-y-2">
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
                    <p className="text-xs text-slate-400">Sin fecha registrada.</p>
                  )}
                </div>

                <div className="p-4 bg-white/5 border border-purple-500/30 rounded-2xl space-y-2">
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

              {/* CUSTOM DATES */}
              <div className="space-y-4 pt-2">
                <h4 className="font-serif font-bold text-white text-sm">Otras Fechas Importantes (Graduación, Boda, etc.)</h4>

                <form onSubmit={handleAddCustomDate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <input
                    type="text"
                    value={cDateTitle}
                    onChange={e => setCDateTitle(e.target.value)}
                    placeholder="Título (ej. Grado, Boda)"
                    required
                    className="bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={cDateVal}
                    onChange={e => setCDateVal(e.target.value)}
                    required
                    className="bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Fecha</span>
                  </button>
                </form>

                {person.customDates && person.customDates.length > 0 ? (
                  <div className="space-y-2">
                    {person.customDates.map(cd => {
                      const { daysLeft, isToday, nextDateStr } = SocialCalculations.getDaysUntilNextOccurrence(cd.date, todayStr);
                      return (
                        <div key={cd.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white block">{cd.title}</span>
                            <span className="text-purple-300 font-mono">
                              {cd.date} • {isToday ? '¡Es hoy!' : `Faltan ${daysLeft} días (${nextDateStr})`}
                            </span>
                          </div>
                          <button
                            onClick={() => SocialStore.deleteCustomDate(person.id, cd.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No hay fechas personalizadas guardadas.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HISTORIAL CRONOLÓGICO */}
          {activeTab === 'timeline' && (
            <div className="space-y-5">
              
              {/* ADD INTERACTION QUICK FORM */}
              <form onSubmit={handleAddInteraction} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <h4 className="font-serif font-bold text-white text-xs uppercase tracking-wider">Registrar Nueva Experiencia o Encuentro</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={intDate}
                    onChange={e => setIntDate(e.target.value)}
                    required
                    className="bg-black/40 border border-white/10 focus:border-purple-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                  <select
                    value={intType}
                    onChange={e => setIntType(e.target.value as any)}
                    className="bg-[#0e1828] border border-white/10 focus:border-purple-400 rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="Salida">☕ Salida / Café</option>
                    <option value="Reunión">🤝 Reunión / Visita</option>
                    <option value="Llamada">📞 Llamada</option>
                    <option value="Conversación">🗣️ Conversación</option>
                    <option value="Mensaje">💬 Mensaje</option>
                    <option value="Otro">📌 Otro</option>
                  </select>
                  <input
                    type="text"
                    value={intDesc}
                    onChange={e => setIntDesc(e.target.value)}
                    placeholder="Descripción / ¿Qué compartieron? *"
                    required
                    className="bg-black/40 border border-white/10 focus:border-purple-400 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Guardar en Historial</span>
                  </button>
                </div>
              </form>

              {/* TIMELINE ITEMS */}
              <div className="space-y-3">
                {timeline.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Sin interacciones ni eventos registrados en el historial.</p>
                ) : (
                  <div className="relative border-l-2 border-purple-500/30 pl-4 space-y-3.5 ml-2">
                    {timeline.map(ev => (
                      <div key={ev.id} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-slate-950" />
                        <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-1">
                          <div className="flex justify-between items-center">
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
            </div>
          )}

          {/* TAB 4: IDEAS & GUSTOS */}
          {activeTab === 'ideas' && (
            <form onSubmit={handleSaveIdeas} className="space-y-4">
              <p className="text-xs text-slate-300">
                Registra la información clave que te ayude a cultivar la relación: gustos, comida preferida, hobbies e ideas de regalo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                    <Smile className="w-4 h-4" /> Gustos e Intereses
                  </label>
                  <textarea
                    rows={2}
                    value={likes}
                    onChange={e => setLikes(e.target.value)}
                    placeholder="Ej. Le encanta el café de especialidad, la música en vinilo..."
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-4 h-4" /> Hobbies & Pasatiempos
                  </label>
                  <textarea
                    rows={2}
                    value={hobbies}
                    onChange={e => setHobbies(e.target.value)}
                    placeholder="Ej. Ciclismo de montaña, lectura de novela histórica..."
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5 mb-1">
                    <Utensils className="w-4 h-4" /> Comida / Restaurantes Favoritos
                  </label>
                  <textarea
                    rows={2}
                    value={favoriteFood}
                    onChange={e => setFavoriteFood(e.target.value)}
                    placeholder="Ej. Comida italiana, sushi, café sin azúcar..."
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Gift className="w-4 h-4" /> Ideas de Regalo
                  </label>
                  <textarea
                    rows={2}
                    value={giftIdeas}
                    onChange={e => setGiftIdeas(e.target.value)}
                    placeholder="Ej. Libro específico, café en grano, boletas para concierto..."
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" /> Información Útil & Detalles Especiales
                </label>
                <textarea
                  rows={2}
                  value={usefulInfo}
                  onChange={e => setUsefulInfo(e.target.value)}
                  placeholder="Detalles útiles a recordar antes de encontrarse..."
                  className="w-full bg-white/5 border border-white/10 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Ideas y Gustos</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

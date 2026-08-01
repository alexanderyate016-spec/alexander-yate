import React, { useState } from 'react';
import { SocialOfficeData } from '../../types/store';
import { SocialStore } from './SocialStore';
import { SocialCalculations } from './SocialCalculations';
import { getTodayDateString, getGreetingByTime } from '../../utils/dates';
import { Users, Heart, Calendar, Plus, Trash2, MessageSquare, AlertCircle, Flag } from 'lucide-react';

interface Props {
  data: SocialOfficeData;
  profileName?: string;
}

export const SocialView: React.FC<Props> = ({ data, profileName = 'Alex' }) => {
  const [activeTab, setActiveTab] = useState<'people' | 'interactions' | 'commitments' | 'holidays'>('people');
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

  return (
    <div className="space-y-6">
      {/* 1. ENCABEZADO INSTITUCIONAL */}
      <div className="bg-presidential-navy text-white p-6 rounded-lg border-b-2 border-gold-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-900/60 rounded border border-rose-700/50 text-rose-300">
              <Users className="w-6 h-6 text-gold-accent" />
            </span>
            <h2 className="text-2xl font-serif-presidential font-bold tracking-tight text-white">
              Oficina de Vida Social y Relaciones
            </h2>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Agencia Superior de Coordinación de Relaciones Humanas, Fechas Patrias y Compromisos
          </p>
        </div>
      </div>

      {/* 2. CENTRO DE RELACIONES (EJECUTIVO) */}
      <div className="presidential-card-gold p-5 rounded-lg space-y-3">
        <div className="flex justify-between items-center border-b border-gold-accent/30 pb-2">
          <h3 className="font-serif-presidential font-bold text-lg text-amber-950">
            Centro de Relaciones Ejecutivo
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded gold-badge">
            {greeting}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* Cumpleaños */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded">
            <div className="font-bold text-amber-900 text-xs uppercase mb-1">🎂 Cumpleaños Hoy</div>
            {todayBdays.length === 0 ? (
              <div className="text-xs text-slate-500">Sin cumpleaños registrados para hoy.</div>
            ) : (
              todayBdays.map(p => (
                <div key={p.id} className="font-bold text-amber-950 text-xs">
                  • {p.name} ({p.category})
                </div>
              ))
            )}
          </div>

          {/* Seguimiento */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="font-bold text-slate-800 text-xs uppercase mb-1">🤝 Alertas de Seguimiento</div>
            {uncontacted.length === 0 ? (
              <div className="text-xs text-slate-500">Relaciones al día.</div>
            ) : (
              <div className="text-xs text-slate-700">
                Hace {uncontacted[0].daysAgo} días no registras contacto con <strong>{uncontacted[0].person.name}</strong>.
              </div>
            )}
          </div>

          {/* Fecha Patria */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded">
            <div className="font-bold text-blue-900 text-xs uppercase mb-1 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-blue-700" /> Fecha Especial / Patria
            </div>
            {todayHoliday ? (
              <div className="text-xs text-blue-950 font-bold">
                🇨🇴 {todayHoliday.title}: {todayHoliday.message}
              </div>
            ) : (
              <div className="text-xs text-slate-500">Hoy es una jornada ordinaria.</div>
            )}
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button onClick={() => setActiveTab('people')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'people' ? 'border-rose-800 text-rose-950' : 'border-transparent text-slate-500'}`}>
          Directorio de Contactos ({data.people.length})
        </button>
        <button onClick={() => setActiveTab('interactions')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'interactions' ? 'border-rose-800 text-rose-950' : 'border-transparent text-slate-500'}`}>
          Historial de Interacciones ({data.interactions.length})
        </button>
        <button onClick={() => setActiveTab('commitments')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'commitments' ? 'border-rose-800 text-rose-950' : 'border-transparent text-slate-500'}`}>
          Compromisos Sociales ({data.commitments.length})
        </button>
      </div>

      {/* TAB 1: PERSONAS */}
      {activeTab === 'people' && (
        <div className="space-y-6">
          <form onSubmit={handleCreatePerson} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input type="text" placeholder="Nombre completo *" value={pName} onChange={e => setPName(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1 min-w-[180px]" required />
            <select value={pCat} onChange={e => setPCat(e.target.value as any)} className="text-xs p-2 border rounded bg-white">
              <option value="Familia">Familia</option>
              <option value="Amigos">Amigos</option>
              <option value="Compañeros de universidad">Compañeros de universidad</option>
              <option value="Profesores">Profesores</option>
              <option value="Otros">Otros</option>
            </select>
            <input type="date" placeholder="Cumpleaños" value={pBday} onChange={e => setPBday(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <button type="submit" className="text-xs bg-rose-800 text-white font-bold px-4 py-2 rounded hover:bg-rose-700">
              + Registrar Persona
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.people.map(p => (
              <div key={p.id} className="presidential-card p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 text-base">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.category} | {p.importanceLevel}</div>
                  </div>
                  <button onClick={() => SocialStore.deletePerson(p.id)} className="text-slate-400 hover:text-rose-600 text-xs">×</button>
                </div>
                {p.birthday && <div className="text-xs text-rose-700 font-semibold">🎂 Cumpleaños: {p.birthday}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACCIONES */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateInteraction} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <select value={intPersonId} onChange={e => setIntPersonId(e.target.value)} className="text-xs p-2 border rounded bg-white" required>
              <option value="">Seleccionar Persona...</option>
              {data.people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="text" placeholder="Descripción de la interacción..." value={intDesc} onChange={e => setIntDesc(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1 min-w-[200px]" required />
            <button type="submit" className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded hover:bg-slate-800">
              + Registrar Interacción
            </button>
          </form>

          <div className="space-y-2">
            {data.interactions.map(i => {
              const person = data.people.find(p => p.id === i.personId);
              return (
                <div key={i.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{person?.name || 'Contacto'}</span>: {i.description}
                    <span className="text-slate-400 ml-2">[{i.date}]</span>
                  </div>
                  <button onClick={() => SocialStore.deleteInteraction(i.id)} className="text-slate-400 hover:text-rose-600">×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMPROMISOS */}
      {activeTab === 'commitments' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateCommitment} className="presidential-card p-4 rounded-lg flex flex-wrap gap-2 items-center">
            <input type="text" placeholder="Compromiso (Ej: Reunión con compañeros)" value={comTitle} onChange={e => setComTitle(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1 min-w-[180px]" required />
            <input type="date" value={comDate} onChange={e => setComDate(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <input type="time" value={comStart} onChange={e => setComStart(e.target.value)} className="text-xs p-2 border rounded bg-white" />
            <button type="submit" className="text-xs bg-blue-900 text-white font-bold px-4 py-2 rounded hover:bg-blue-800">
              + Crear Compromiso
            </button>
          </form>

          <div className="space-y-2">
            {data.commitments.map(c => (
              <div key={c.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900">{c.title}</span> - {c.date} a las {c.startTime}
                </div>
                <button onClick={() => SocialStore.deleteCommitment(c.id)} className="text-slate-400 hover:text-rose-600">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

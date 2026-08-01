import React, { useState } from 'react';
import { PersonalDevOfficeData } from '../../types/store';
import { PersonalDevStore } from './PersonalDevStore';
import { getTodayDateString } from '../../utils/dates';
import { Compass, BookOpen, Shield, Lock, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: PersonalDevOfficeData;
}

export const PersonalDevView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'direction' | 'journal' | 'history'>('direction');
  const todayStr = getTodayDateString();

  // Direction state
  const [purpose, setPurpose] = useState(data.direction?.purpose || '');
  const [vision, setVision] = useState(data.direction?.vision || '');
  const [principleTitle, setPrincipleTitle] = useState('');
  const [principleDesc, setPrincipleDesc] = useState('');

  // Journal state
  const [jLearned, setJLearned] = useState('');
  const [jReflection, setJReflection] = useState('');

  const handleSaveDirection = () => {
    PersonalDevStore.updateDirection(purpose, vision);
  };

  const handleAddPrinciple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!principleTitle) return;
    PersonalDevStore.addPrinciple({
      title: principleTitle,
      description: principleDesc
    });
    setPrincipleTitle('');
    setPrincipleDesc('');
  };

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jReflection && !jLearned) return;
    PersonalDevStore.addJournalEntry({
      date: todayStr,
      learned: jLearned,
      improve: '',
      mistakes: '',
      decisions: '',
      ideas: '',
      reflection: jReflection
    });
    setJLearned('');
    setJReflection('');
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO INSTITUCIONAL PRIVADO */}
      <div className="bg-slate-900 text-white p-6 rounded-lg border-b-2 border-gold-accent flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-800 rounded border border-slate-700 text-gold-accent">
              <Compass className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-serif-presidential font-bold tracking-tight text-white">
              Oficina de Desarrollo Personal
            </h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Privada
            </span>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Espacio confidencial para la dirección de vida, formación del carácter y reflexiones
          </p>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="border-b border-slate-200 flex space-x-4">
        <button onClick={() => setActiveTab('direction')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'direction' ? 'border-slate-900 text-slate-950' : 'border-transparent text-slate-500'}`}>
          Mi Dirección & Principios
        </button>
        <button onClick={() => setActiveTab('journal')} className={`pb-3 text-sm font-semibold border-b-2 ${activeTab === 'journal' ? 'border-slate-900 text-slate-950' : 'border-transparent text-slate-500'}`}>
          Diario de Crecimiento ({data.journalEntries.length})
        </button>
      </div>

      {/* TAB 1: DIRECCIÓN */}
      {activeTab === 'direction' && (
        <div className="space-y-6">
          <div className="presidential-card p-5 rounded-lg space-y-4">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-base">
              Propósito y Visión Personal
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Propósito Personal (¿Qué quiero construir y aportar?)</label>
                <textarea
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 border rounded bg-white text-slate-900"
                  placeholder="Escribe tu propósito personal aquí..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Visión de Futuro</label>
                <textarea
                  value={vision}
                  onChange={e => setVision(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 border rounded bg-white text-slate-900"
                  placeholder="Escribe tu visión a largo plazo..."
                />
              </div>

              <button onClick={handleSaveDirection} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800">
                Guardar Dirección
              </button>
            </div>
          </div>

          <div className="presidential-card p-5 rounded-lg space-y-4">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-base">
              Principios Personales
            </h3>
            <form onSubmit={handleAddPrinciple} className="flex flex-wrap gap-2">
              <input type="text" placeholder="Título del principio (Ej: Responsabilidad total)" value={principleTitle} onChange={e => setPrincipleTitle(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1" required />
              <input type="text" placeholder="Descripción breve..." value={principleDesc} onChange={e => setPrincipleDesc(e.target.value)} className="text-xs p-2 border rounded bg-white flex-1" />
              <button type="submit" className="text-xs bg-amber-700 text-white font-bold px-4 py-2 rounded hover:bg-amber-800">
                + Agregar Principio
              </button>
            </form>

            <div className="space-y-2">
              {data.direction.principles.map(p => (
                <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.title}</span>: {p.description}
                  </div>
                  <button onClick={() => PersonalDevStore.deletePrinciple(p.id)} className="text-slate-400 hover:text-rose-600">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIARIO */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <form onSubmit={handleAddJournal} className="presidential-card p-5 rounded-lg space-y-3">
            <h3 className="font-serif-presidential font-bold text-slate-900 text-base">
              Nueva Entrada en el Diario de Crecimiento
            </h3>
            <textarea
              placeholder="¿Qué aprendí hoy?"
              value={jLearned}
              onChange={e => setJLearned(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 border rounded bg-white text-slate-900"
            />
            <textarea
              placeholder="Reflexión general del día..."
              value={jReflection}
              onChange={e => setJReflection(e.target.value)}
              rows={3}
              className="w-full text-xs p-2 border rounded bg-white text-slate-900"
            />
            <button type="submit" className="text-xs bg-slate-900 text-white font-bold px-4 py-2 rounded hover:bg-slate-800">
              + Registrar Entrada de Hoy
            </button>
          </form>

          <div className="space-y-3">
            {data.journalEntries.map(j => (
              <div key={j.id} className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <span className="font-bold text-slate-900">{j.date}</span>
                  <button onClick={() => PersonalDevStore.deleteJournalEntry(j.id)} className="text-slate-400 hover:text-rose-600">× Eliminar</button>
                </div>
                {j.learned && <div><strong>Aprendizaje:</strong> {j.learned}</div>}
                {j.reflection && <div><strong>Reflexión:</strong> {j.reflection}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

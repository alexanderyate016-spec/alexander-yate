import React, { useState } from 'react';
import { PersonalDevOfficeData } from '../../types/store';
import { PersonalDevStore } from './PersonalDevStore';
import { getTodayDateString } from '../../utils/dates';
import {
  GlassPanel,
  ExecutiveCard,
  ExecutiveButton,
  ExecutiveMetricCard,
  ExecutiveSectionHeader,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveInput,
  ExecutiveForm,
} from '../../components/executive';
import { Compass, BookOpen, Shield, Lock, Plus, Trash2, Target, Award, Feather } from 'lucide-react';

interface Props {
  data: PersonalDevOfficeData;
}

export const PersonalDevView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'direction' | 'journal'>('direction');
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* 1. SECTION HEADER INSTITUCIONAL (INDIGO ACCENT) */}
      <ExecutiveSectionHeader
        title="Oficina de Desarrollo Personal"
        subtitle="Espacio Confidencial para la Dirección de Vida, Formación del Carácter y Reflexiones Ejecutivas"
        icon={<Compass className="w-6 h-6 text-indigo-400" />}
        accentColor="indigo"
        badgeText="Dirección & Filosofía"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar reflexiones..."
      />

      {/* 2. METRICAS / INDICADORES PRIVADOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ExecutiveMetricCard
          title="Principios Fundamentales"
          value={data.direction?.principles?.length || 0}
          subtitle="Reglas de conducta guardadas"
          icon={<Shield className="w-5 h-5 text-indigo-400" />}
          accentColor="indigo"
        />

        <ExecutiveMetricCard
          title="Entradas en Diario"
          value={data.journalEntries?.length || 0}
          subtitle="Reflexiones acumuladas"
          icon={<BookOpen className="w-5 h-5 text-indigo-300" />}
          accentColor="indigo"
        />

        <ExecutiveMetricCard
          title="Nivel de Privacidad"
          value="Máximo (Restringido)"
          subtitle="Solo lectura por el Comandante"
          icon={<Lock className="w-5 h-5 text-amber-400" />}
          accentColor="indigo"
        />
      </div>

      {/* 3. TABS DE NAVEGACIÓN */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('direction')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'direction'
              ? 'border-indigo-400 bg-indigo-500/15 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          Mi Dirección & Principios
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'journal'
              ? 'border-indigo-400 bg-indigo-500/15 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Feather className="w-4 h-4" />
          Diario de Crecimiento ({data.journalEntries?.length || 0})
        </button>
      </div>

      {/* TAB 1: DIRECCIÓN Y PRINCIPIOS */}
      {activeTab === 'direction' && (
        <div className="space-y-6">
          <GlassPanel accentColor="indigo" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Propósito y Visión Personal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Propósito Personal (¿Qué quiero construir y aportar?)
                </label>
                <textarea
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-[#091120]/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                  placeholder="Escribe tu propósito personal aquí..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Visión de Futuro (Meta a largo plazo)
                </label>
                <textarea
                  value={vision}
                  onChange={e => setVision(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-[#091120]/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                  placeholder="Escribe tu visión a largo plazo..."
                />
              </div>

              <div className="flex justify-end">
                <ExecutiveButton onClick={handleSaveDirection} variant="primary" accentColor="indigo">
                  Guardar Dirección
                </ExecutiveButton>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel accentColor="indigo" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Principios Personales
            </h3>

            <ExecutiveForm onSubmit={handleAddPrinciple}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <ExecutiveInput
                  label="Título del Principio *"
                  placeholder="Ej: Responsabilidad total / Integridad"
                  value={principleTitle}
                  onChange={e => setPrincipleTitle(e.target.value)}
                  accentColor="indigo"
                  required
                />

                <ExecutiveInput
                  label="Descripción o Regla"
                  placeholder="Ej: Actuar según mis valores sin buscar excusas"
                  value={principleDesc}
                  onChange={e => setPrincipleDesc(e.target.value)}
                  accentColor="indigo"
                />

                <ExecutiveButton type="submit" variant="primary" accentColor="indigo" icon={<Plus className="w-4 h-4" />}>
                  Agregar Principio
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.direction.principles.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Shield className="w-8 h-8 text-indigo-400" />}
              title="Sin Principios Declarados"
              description="Define tus principios y reglas éticas personales."
              accentColor="indigo"
            />
          ) : (
            <div className="space-y-2.5">
              {data.direction.principles.map(p => (
                <ExecutiveCard key={p.id} accentColor="indigo">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-serif font-bold text-white text-sm">{p.title}</h4>
                      <p className="text-slate-300">{p.description}</p>
                    </div>

                    <button
                      onClick={() => PersonalDevStore.deletePrinciple(p.id)}
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

      {/* TAB 2: DIARIO DE CRECIMIENTO */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <GlassPanel accentColor="indigo" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Nueva Entrada en el Diario de Crecimiento
            </h3>

            <ExecutiveForm onSubmit={handleAddJournal}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    ¿Qué aprendí hoy?
                  </label>
                  <textarea
                    value={jLearned}
                    onChange={e => setJLearned(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl bg-[#091120]/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                    placeholder="Lecciones o aprendizajes clave..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Reflexión general de la jornada
                  </label>
                  <textarea
                    value={jReflection}
                    onChange={e => setJReflection(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl bg-[#091120]/80 border border-indigo-500/30 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                    placeholder="Reflexiones sobre decisiones, errores o aciertos..."
                  />
                </div>

                <div className="flex justify-end">
                  <ExecutiveButton type="submit" variant="primary" accentColor="indigo" icon={<Plus className="w-4 h-4" />}>
                    Registrar Entrada de Hoy
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {data.journalEntries.length === 0 ? (
            <ExecutiveEmptyState
              icon={<BookOpen className="w-8 h-8 text-indigo-400" />}
              title="Diario Sin Entradas"
              description="No hay reflexiones o aprendizajes registrados en el diario de crecimiento."
              accentColor="indigo"
            />
          ) : (
            <div className="space-y-3">
              {data.journalEntries.map(j => (
                <ExecutiveCard key={j.id} accentColor="indigo">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="font-serif font-bold text-white text-sm">{j.date}</span>
                      <button
                        onClick={() => PersonalDevStore.deleteJournalEntry(j.id)}
                        className="text-slate-400 hover:text-rose-400 text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Eliminar
                      </button>
                    </div>
                    {j.learned && (
                      <p className="text-slate-300">
                        <strong className="text-indigo-300">Aprendizaje:</strong> {j.learned}
                      </p>
                    )}
                    {j.reflection && (
                      <p className="text-slate-300">
                        <strong className="text-indigo-300">Reflexión:</strong> {j.reflection}
                      </p>
                    )}
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

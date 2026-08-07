import React, { useState } from 'react';
import { MedicalOfficeData, WaterIntakeLog } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { MedicalCalculations } from '../MedicalCalculations';
import { GlassPanel } from '../../../components/executive';
import { Droplet, Plus, Trash2, Edit2, CheckCircle2, Sparkles, Settings, Clock, Check, X } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const SmartBottleWidget: React.FC<Props> = ({ data, todayStr }) => {
  const metrics = MedicalCalculations.getLatestHealthMetrics(data, todayStr);
  const targetWater = metrics.targetWater;
  const currentLiters = metrics.hydrationLiters;
  const fillPct = metrics.hydrationPct;
  const remainingMl = metrics.remainingWaterMl;
  const todayWaterLogs = metrics.todayWaterLogs || [];

  // Custom bottle creator form state
  const [showAddBottle, setShowAddBottle] = useState(false);
  const [newBottleName, setNewBottleName] = useState('');
  const [newBottleCapacity, setNewBottleCapacity] = useState<number | ''>(500);

  // Target water edit state
  const [showTargetEdit, setShowTargetEdit] = useState(false);
  const [customTarget, setCustomTarget] = useState<number>(targetWater);

  // Manual input state with custom time
  const [manualMl, setManualMl] = useState<number | ''>('');
  const [manualContainer, setManualContainer] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Edit individual log state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editAmountMl, setEditAmountMl] = useState<number>(0);
  const [editTime, setEditTime] = useState<string>('');
  const [editContainer, setEditContainer] = useState<string>('');

  const handleQuickAddWater = (amountMl: number, label?: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    MedicalStore.addWaterIntake(todayStr, amountMl, label, time);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMl || Number(manualMl) <= 0) return;
    MedicalStore.addWaterIntake(
      todayStr,
      Number(manualMl),
      manualContainer.trim() || undefined,
      manualTime || undefined
    );
    setManualMl('');
    setManualContainer('');
  };

  const handleStartEdit = (log: WaterIntakeLog) => {
    setEditingLogId(log.id);
    setEditAmountMl(log.amountMl);
    setEditTime(log.time);
    setEditContainer(log.containerType || '');
  };

  const handleSaveEdit = (id: string) => {
    if (editAmountMl <= 0) return;
    MedicalStore.updateWaterLog(id, {
      amountMl: editAmountMl,
      time: editTime,
      containerType: editContainer.trim() || `${editAmountMl} ml`
    });
    setEditingLogId(null);
  };

  const handleDeleteLog = (id: string) => {
    MedicalStore.deleteWaterLog(id);
  };

  const handleCreateBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBottleName || !newBottleCapacity) return;
    MedicalStore.addCustomBottle({
      name: newBottleName.trim(),
      capacityMl: Number(newBottleCapacity)
    });
    setNewBottleName('');
    setNewBottleCapacity(500);
    setShowAddBottle(false);
  };

  const handleSaveTarget = () => {
    if (customTarget > 0) {
      MedicalStore.setWaterTarget(customTarget);
      setShowTargetEdit(false);
    }
  };

  const customBottles = data.customBottles || [
    { id: 'def_1', name: 'Vaso', capacityMl: 250 },
    { id: 'def_2', name: 'Botella Gym', capacityMl: 500 },
    { id: 'def_3', name: 'Botella Mediana', capacityMl: 600 },
    { id: 'def_4', name: 'Botella 1L', capacityMl: 1000 }
  ];

  return (
    <GlassPanel accentColor="blue" padding="lg" className="space-y-6 bg-gradient-to-br from-[#061B2E]/90 to-[#0B2A4A]/80 border-cyan-500/30">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl text-cyan-300 shadow-lg shadow-cyan-950/50">
            <Droplet className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-white tracking-wide flex items-center gap-2">
              Botella Inteligente de Hidratación
              {fillPct >= 100 && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Meta alcanzada
                </span>
              )}
            </h3>
            <p className="text-xs text-cyan-200/80 font-sans">
              Seguimiento detallado por consumos con llenado de botella interactivo
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTargetEdit(!showTargetEdit)}
          className="text-xs text-cyan-300 hover:text-cyan-100 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" /> Meta: {targetWater} L/día
        </button>
      </div>

      {/* EDIT TARGET INLINE BAR */}
      {showTargetEdit && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-500/40 rounded-xl flex items-center gap-3 animate-fadeIn">
          <label className="text-xs text-cyan-200 font-bold whitespace-nowrap">Ajustar Meta Diaria (L):</label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="10"
            value={customTarget}
            onChange={e => setCustomTarget(Number(e.target.value))}
            className="w-24 p-1.5 bg-[#08182B] border border-cyan-500/50 rounded-lg text-xs font-bold text-cyan-200 focus:outline-none"
          />
          <button
            onClick={handleSaveTarget}
            className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Guardar
          </button>
        </div>
      )}

      {/* MAIN BOTTLE & PROGRESS DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* INTERACTIVE VISUAL SVG BOTTLE */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl relative overflow-hidden group">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />

          {/* SVG BOTTLE GRAPHIC */}
          <div className="relative w-36 h-64 flex items-center justify-center">
            <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <defs>
                {/* Bottle Glass Gradient */}
                <linearGradient id="bottleGlass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                </linearGradient>

                {/* Liquid Water Gradient */}
                <linearGradient id="waterLiquid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>

                {/* Mask for Bottle Shape */}
                <mask id="bottleMask">
                  {/* Cap & Neck */}
                  <rect x="38" y="10" width="24" height="12" rx="3" fill="#ffffff" />
                  <rect x="42" y="22" width="16" height="18" fill="#ffffff" />
                  {/* Main Body */}
                  <path
                    d="M 25 50 C 25 40, 35 40, 42 40 L 58 40 C 65 40, 75 40, 75 50 L 75 175 C 75 188, 65 192, 50 192 C 35 192, 25 188, 25 175 Z"
                    fill="#ffffff"
                  />
                </mask>
              </defs>

              {/* BOTTLE OUTLINE & GLASS BACKGROUND */}
              <g mask="url(#bottleMask)">
                <rect x="0" y="0" width="100" height="200" fill="url(#bottleGlass)" />

                {/* DYNAMIC LIQUID FILL LEVEL */}
                {/* Y goes from 192 (0%) to 40 (100%) */}
                {(() => {
                  const minY = 192;
                  const maxY = 40;
                  const fillHeight = (fillPct / 100) * (minY - maxY);
                  const currentY = Math.max(maxY, minY - fillHeight);

                  return (
                    <g>
                      <rect
                        x="0"
                        y={currentY}
                        width="100"
                        height={200 - currentY}
                        fill="url(#waterLiquid)"
                        className="transition-all duration-700 ease-out"
                      />
                      {/* Animated Water Surface Wave Accent */}
                      {fillPct > 0 && fillPct < 100 && (
                        <ellipse
                          cx="50"
                          cy={currentY}
                          rx="25"
                          ry="3"
                          fill="#7dd3fc"
                          opacity="0.8"
                          className="animate-pulse"
                        />
                      )}
                    </g>
                  );
                })()}

                {/* Glass Measurement Tick Marks */}
                <line x1="28" y1="75" x2="35" y2="75" stroke="#7dd3fc" strokeWidth="1" opacity="0.6" />
                <line x1="28" y1="110" x2="38" y2="110" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.8" />
                <line x1="28" y1="145" x2="35" y2="145" stroke="#7dd3fc" strokeWidth="1" opacity="0.6" />
              </g>

              {/* BOTTLE SHINE & BORDER OVERLAY */}
              <path
                d="M 25 50 C 25 40, 35 40, 42 40 L 58 40 C 65 40, 75 40, 75 50 L 75 175 C 75 188, 65 192, 50 192 C 35 192, 25 188, 25 175 Z"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0.7"
              />
              <rect x="38" y="10" width="24" height="12" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
            </svg>

            {/* OVERLAY PERCENTAGE BADGE */}
            <div className="absolute bottom-6 bg-[#031527]/90 border border-cyan-400/50 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
              <span className="font-mono font-bold text-sm text-cyan-300">{fillPct}%</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-700 font-medium">Progreso de hoy ({todayStr})</p>
            <p className="text-base font-bold text-cyan-200 font-mono">
              {currentLiters.toFixed(2)} L <span className="text-slate-500 font-normal">/ {targetWater} L</span>
            </p>
          </div>
        </div>

        {/* METRICS & QUICK ACTION BOTTLES */}
        <div className="md:col-span-7 space-y-5">
          {/* STATS SUMMARY BOXES */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-cyan-300 font-bold block">Has tomado hoy</span>
              <p className="text-2xl font-bold font-mono text-white tracking-tight">
                {currentLiters.toFixed(2)} <span className="text-xs text-cyan-300 font-sans font-normal">Litros</span>
              </p>
              <p className="text-[11px] text-cyan-300/80 font-mono font-medium">{fillPct}% de la meta</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">Faltan</span>
              <p className="text-2xl font-bold font-mono text-white tracking-tight">
                {remainingMl} <span className="text-xs text-amber-300 font-sans font-normal">ml</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {remainingMl > 0 ? `~${Math.ceil(remainingMl / 250)} vasos restantes` : '¡Objetivo diario cumplido! 🎉'}
              </p>
            </div>
          </div>

          {/* ONE-CLICK BOTTLES REGISTER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Añadir al instante (+250ml, +500ml, +600ml, +1L)
              </label>
              <button
                onClick={() => setShowAddBottle(!showAddBottle)}
                className="text-[11px] font-bold text-cyan-300 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Configurar Botellas
              </button>
            </div>

            {/* CREATE BOTTLE FORM */}
            {showAddBottle && (
              <form onSubmit={handleCreateBottle} className="p-3 bg-[#081C30] border border-cyan-500/40 rounded-xl space-y-2 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Termo Gym"
                    value={newBottleName}
                    onChange={e => setNewBottleName(e.target.value)}
                    className="p-2 bg-[#05111E] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="ml (Ej: 750)"
                    value={newBottleCapacity}
                    onChange={e => setNewBottleCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-2 bg-[#05111E] border border-cyan-500/30 rounded-lg text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBottle(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Guardar Botella
                  </button>
                </div>
              </form>
            )}

            {/* SAVED BOTTLE BUTTONS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {customBottles.map(bot => (
                <button
                  key={bot.id}
                  onClick={() => handleQuickAddWater(bot.capacityMl, bot.name)}
                  className="p-2.5 bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-500/30 hover:border-cyan-400 rounded-xl transition-all flex flex-col items-center justify-center text-center group active:scale-95 shadow-sm"
                >
                  <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-300 group-hover:scale-110 transition-transform mb-1">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1">{bot.name}</span>
                  <span className="text-[10px] font-mono text-cyan-300 font-semibold">+{bot.capacityMl} ml</span>
                </button>
              ))}
            </div>
          </div>

          {/* MANUAL AGUA INPUT FORM */}
          <form onSubmit={handleManualAdd} className="pt-2 border-t border-cyan-500/20 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200 block">
              Registro Personalizado
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <input
                type="number"
                placeholder="Cantidad (ml)..."
                value={manualMl}
                onChange={e => setManualMl(e.target.value === '' ? '' : Number(e.target.value))}
                className="sm:col-span-4 p-2 bg-[#081C30] border border-cyan-500/30 rounded-xl text-xs text-cyan-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                required
              />
              <input
                type="text"
                placeholder="Ej: Vaso café, Termo..."
                value={manualContainer}
                onChange={e => setManualContainer(e.target.value)}
                className="sm:col-span-4 p-2 bg-[#081C30] border border-cyan-500/30 rounded-xl text-xs text-cyan-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="time"
                value={manualTime}
                onChange={e => setManualTime(e.target.value)}
                className="sm:col-span-2 p-2 bg-[#081C30] border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-100 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="sm:col-span-2 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* HISTORIAL DEL DÍA (REGISTROS INDIVIDUALES EDICIÓN Y ELIMINACIÓN) */}
      <div className="pt-4 border-t border-cyan-500/20 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Historial de Consumo de Agua Hoy ({todayWaterLogs.length} registros)
          </h4>
          <span className="text-[10px] text-cyan-300 font-mono font-medium">
            Total: {(todayWaterLogs.reduce((s, w) => s + w.amountMl, 0) / 1000).toFixed(2)} L
          </span>
        </div>

        {todayWaterLogs.length === 0 ? (
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 rounded-xl text-center text-xs text-slate-500 italic">
            No se han registrado tomas de agua individuales para el día de hoy. Usa los botones rápidos o el formulario superior para añadir consumos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {todayWaterLogs.map(log => {
              const isEditing = editingLogId === log.id;

              if (isEditing) {
                return (
                  <div key={log.id} className="p-2.5 bg-[#0A223B] border border-cyan-400/60 rounded-xl space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-cyan-300 block">Hora</label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={e => setEditTime(e.target.value)}
                          className="w-full p-1 bg-[#05111E] border border-cyan-500/40 rounded text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-cyan-300 block">Cantidad (ml)</label>
                        <input
                          type="number"
                          value={editAmountMl}
                          onChange={e => setEditAmountMl(Number(e.target.value))}
                          className="w-full p-1 bg-[#05111E] border border-cyan-500/40 rounded text-xs text-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Contenedor / Nombre"
                        value={editContainer}
                        onChange={e => setEditContainer(e.target.value)}
                        className="w-full p-1 bg-[#05111E] border border-cyan-500/40 rounded text-xs text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingLogId(null)}
                        className="p-1 bg-slate-100 text-slate-700 hover:text-slate-900 rounded"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(log.id)}
                        className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={log.id}
                  className="p-2.5 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 rounded-xl flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <span>{log.time}</span>
                        <span className="text-cyan-300/60">•</span>
                        <span className="text-cyan-200">{log.containerType || 'Consumo agua'}</span>
                      </div>
                      <span className="text-[11px] font-bold text-cyan-400 font-mono">
                        {log.amountMl} ml
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(log)}
                      className="p-1.5 text-cyan-300 hover:text-slate-900 hover:bg-cyan-800/50 rounded-lg transition-colors"
                      title="Editar hora o cantidad"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassPanel>
  );
};

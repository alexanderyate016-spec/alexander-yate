import React, { useState } from 'react';
import { MedicalOfficeData } from '../../../types/store';
import { MedicalStore } from '../MedicalStore';
import { GlassPanel, ExecutiveButton, ExecutiveInput, ExecutiveCard, ExecutiveEmptyState } from '../../../components/executive';
import { Utensils, Plus, Trash2, Flame, Clock, Coffee, Sun, Moon, Cookie } from 'lucide-react';

interface Props {
  data: MedicalOfficeData;
  todayStr: string;
}

export const NutritionSection: React.FC<Props> = ({ data, todayStr }) => {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [mealType, setMealType] = useState<'Desayuno' | 'Almuerzo' | 'Cena' | 'Refrigerio'>('Desayuno');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [calories, setCalories] = useState<number | ''>('');

  const records = (data.nutritionRecords || []).filter(r => r.date === selectedDate);
  const totalCalories = records.reduce((sum, r) => sum + (r.estimatedCalories || 0), 0);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    MedicalStore.addNutritionRecord({
      date: selectedDate,
      mealType,
      description: description.trim(),
      notes: notes.trim() || undefined,
      estimatedCalories: calories !== '' ? Number(calories) : undefined
    });

    setDescription('');
    setNotes('');
    setCalories('');
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'Desayuno': return <Coffee className="w-4 h-4 text-amber-300" />;
      case 'Almuerzo': return <Sun className="w-4 h-4 text-orange-400" />;
      case 'Cena': return <Moon className="w-4 h-4 text-indigo-300" />;
      default: return <Cookie className="w-4 h-4 text-emerald-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & DATE SELECTOR */}
      <GlassPanel accentColor="emerald" padding="md" className="space-y-4 bg-gradient-to-br from-[#062016]/90 to-[#0C3323]/80 border-emerald-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Registro Diario de Alimentación</h3>
              <p className="text-xs text-emerald-200/80">
                Control de comidasy contenido nutricional por tiempo de comida
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-emerald-200">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-1.5 bg-[#071F15] border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200 focus:outline-none"
            />
          </div>
        </div>

        {/* FORM TO ADD MEAL */}
        <form onSubmit={handleAddMeal} className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Tiempo de Comida *</label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as any)}
                className="w-full p-2.5 bg-[#051810] border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200 focus:outline-none"
              >
                <option value="Desayuno">☕ Desayuno</option>
                <option value="Almuerzo">☀️ Almuerzo</option>
                <option value="Cena">🌙 Cena</option>
                <option value="Refrigerio">🍪 Refrigerio / Snack</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <ExecutiveInput
                label="Alimentos Consumidos *"
                placeholder="Ej: Huevos revueltos con fruta y café"
                value={description}
                onChange={e => setDescription(e.target.value)}
                accentColor="rose"
                required
              />
            </div>

            <div>
              <ExecutiveInput
                label="Calorías (Opcional)"
                type="number"
                placeholder="Ej: 450"
                value={calories}
                onChange={e => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                accentColor="rose"
                icon={<Flame className="w-3.5 h-3.5" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-3">
              <ExecutiveInput
                label="Observaciones o Notas"
                placeholder="Ej: Comida baja en sal, buena digestión"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                accentColor="rose"
              />
            </div>

            <ExecutiveButton type="submit" variant="primary" accentColor="rose" icon={<Plus className="w-4 h-4" />}>
              Registrar Comida
            </ExecutiveButton>
          </div>
        </form>
      </GlassPanel>

      {/* SUMMARY BAR & MEAL LIST */}
      <div className="flex justify-between items-center text-xs px-1">
        <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wider">
          Comidas de {selectedDate === todayStr ? 'Hoy' : selectedDate} ({records.length})
        </h4>
        {totalCalories > 0 && (
          <span className="font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Total estimadas: {totalCalories} kcal
          </span>
        )}
      </div>

      {records.length === 0 ? (
        <ExecutiveEmptyState
          icon={<Utensils className="w-8 h-8 text-emerald-400" />}
          title="Sin Comidas Registradas"
          description={`No hay alimentos guardados para la fecha ${selectedDate}.`}
          accentColor="rose"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {records.map(rec => (
            <ExecutiveCard key={rec.id} accentColor="rose" className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    {getMealIcon(rec.mealType)}
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-white text-sm">{rec.mealType}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{rec.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => MedicalStore.deleteNutritionRecord(rec.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 font-medium bg-[#081C13] p-2.5 rounded-xl border border-emerald-500/20">
                {rec.description}
              </p>

              {rec.notes && (
                <p className="text-[11px] text-slate-400 italic">
                  Obs: {rec.notes}
                </p>
              )}

              {rec.estimatedCalories && (
                <div className="flex justify-end">
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> {rec.estimatedCalories} kcal
                  </span>
                </div>
              )}
            </ExecutiveCard>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AgendaItem } from './OvalOfficeCalculations';
import { CheckSquare, Square, Clock, Plus, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react';
import { DailyLifeStore } from '../dailyLife/DailyLifeStore';
import { AcademicStore } from '../academic/AcademicStore';

interface Props {
  items: AgendaItem[];
  selectedDate: string;
  onOpenAssignTimeModal: (item: AgendaItem) => void;
  onOpenQuickAddTaskModal: () => void;
  onNavigateToOffice: (officeKey: string) => void;
}

export const AgendaChecklist: React.FC<Props> = ({
  items,
  selectedDate,
  onOpenAssignTimeModal,
  onOpenQuickAddTaskModal,
  onNavigateToOffice
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  const filteredItems = items.filter(item => {
    if (activeTab === 'pending') return item.status === 'pending';
    if (activeTab === 'in_progress') return item.status === 'in_progress';
    return item.status === 'completed';
  });

  const handleToggleStatus = (item: AgendaItem) => {
    if (item.sourceOffice === 'vidaDiaria') {
      if (item.type === 'task') {
        DailyLifeStore.toggleTaskStatus(item.rawObject.id);
      } else if (item.type === 'habit') {
        DailyLifeStore.toggleHabitLog(item.rawObject.id, selectedDate);
      } else if (item.type === 'objective') {
        DailyLifeStore.toggleObjective(item.rawObject.id);
      }
    } else if (item.sourceOffice === 'academica') {
      if (item.type === 'academic_activity' && item.rawObject?.academicActivity?.id) {
        const newStatus = item.status === 'completed' ? 'Pendiente' : 'Realizada';
        AcademicStore.updateAcademicActivity(item.rawObject.academicActivity.id, { status: newStatus });
      }
    }
  };

  const handleDeleteItem = (item: AgendaItem) => {
    if (item.sourceOffice === 'vidaDiaria') {
      if (item.type === 'task') {
        DailyLifeStore.deleteTask(item.rawObject.id);
      } else if (item.type === 'habit') {
        DailyLifeStore.deleteHabit(item.rawObject.id);
      } else if (item.type === 'objective') {
        DailyLifeStore.deleteObjective(item.rawObject.id);
      }
    } else if (item.sourceOffice === 'academica') {
      if (item.type === 'academic_activity' && item.rawObject?.academicActivity?.id) {
        AcademicStore.deleteAcademicActivity(item.rawObject.academicActivity.id);
      }
    }
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'text-rose-400';
    if (p === 'medium') return 'text-amber-400';
    return 'text-emerald-400';
  };

  const priorityLabel = (p: string) => {
    if (p === 'high') return 'Alta';
    if (p === 'medium') return 'Media';
    return 'Baja';
  };

  const officeTextColor = (office: string) => {
    switch (office) {
      case 'academica': return 'text-blue-400';
      case 'financiera': return 'text-emerald-400';
      case 'vidaSocial': return 'text-purple-400';
      case 'vidaDiaria': return 'text-amber-400';
      case 'medica': return 'text-rose-400';
      default: return 'text-teal-400';
    }
  };

  return (
    <div className="bg-[#0D1B2A] border border-[#1E3A5F] rounded-lg shadow-lg p-4 sm:p-5 space-y-4 text-white flex flex-col justify-between h-full font-sans">
      <div className="space-y-4">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#1E3A5F] pb-3 gap-2">
          <h3 className="font-serif font-bold text-[#C5A059] text-sm uppercase tracking-wider flex items-center gap-2">
            AGENDA / CHECKLIST
          </h3>

          <div className="flex gap-4 text-xs font-sans">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-1 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'border-b-2 border-amber-400 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`pb-1 font-semibold transition-colors ${
                activeTab === 'in_progress'
                  ? 'border-b-2 border-amber-400 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              En progreso
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-1 font-semibold transition-colors ${
                activeTab === 'completed'
                  ? 'border-b-2 border-amber-400 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completadas
            </button>
          </div>
        </div>

        {/* ITEMS LIST */}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-[#132337]/50 border border-dashed border-[#1E3A5F] text-xs rounded">
            No hay tareas en este estado.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="p-2.5 bg-[#132337] hover:bg-[#1C324E] border border-slate-800 rounded transition-colors flex items-center justify-between gap-3 group text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                  >
                    {item.status === 'completed' ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span className={`font-sans truncate ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-[10px] text-slate-400 font-sans truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className={officeTextColor(item.sourceOffice)}>
                    {item.officeLabel}
                  </span>

                  <span className={`font-bold ${priorityColor(item.priority)}`}>
                    {priorityLabel(item.priority)}
                  </span>

                  <button
                    onClick={() => onOpenAssignTimeModal(item)}
                    className="p-1 text-slate-400 hover:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Asignar hora fija"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-[#1E3A5F] flex justify-between items-center text-xs">
        <span className="text-slate-400 font-mono text-[11px]">
          {items.filter(i => i.status === 'pending').length} tareas pendientes
        </span>

        <button
          onClick={onOpenQuickAddTaskModal}
          className="px-3 py-1.5 bg-[#1C324E] hover:bg-[#254267] border border-[#C5A059]/50 text-amber-300 font-bold text-xs rounded transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> Nueva tarea
        </button>
      </div>

    </div>
  );
};

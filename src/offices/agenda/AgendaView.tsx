import React, { useState } from 'react';
import { MasterState, ChiefOfStaffEvent, UnifiedExecutiveEvent } from '../../types/store';
import { ChiefOfStaffStore } from '../chiefOfStaff/ChiefOfStaffStore';
import { ChiefOfStaffSync } from '../chiefOfStaff/ChiefOfStaffSync';
import { showToast } from '../../components/executive';
import { ExecutiveCalendar, CalendarEvent } from '../../components/executive/ExecutiveCalendar';
import {
  getTodayDateString,
  addDaysToDateStr,
  getWeekDaysForDate,
  formatFriendlyDate,
  getDayOfWeekName,
  getDayOfWeekNumber
} from '../../utils/dates';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Bell,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  List,
  CalendarDays,
  Sparkles,
  Tag,
  AlignLeft,
  FileText,
  X
} from 'lucide-react';

interface Props {
  state: MasterState;
  onNavigateToOffice?: (officeKey: string) => void;
}

const CATEGORIES = [
  { id: 'academic', label: '🎓 Académico', color: '#3B82F6', badgeBg: 'bg-blue-50 text-blue-800 border-blue-200', defaultEmoji: '🎓' },
  { id: 'medical', label: '🩺 Médico', color: '#F43F5E', badgeBg: 'bg-rose-50 text-rose-800 border-rose-200', defaultEmoji: '🩺' },
  { id: 'social', label: '👥 Social', color: '#EC4899', badgeBg: 'bg-pink-50 text-pink-800 border-pink-200', defaultEmoji: '👥' },
  { id: 'personal', label: '💼 Personal', color: '#8B5CF6', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200', defaultEmoji: '💼' },
  { id: 'work', label: '🏢 Trabajo', color: '#0284C7', badgeBg: 'bg-sky-50 text-sky-800 border-sky-200', defaultEmoji: '🏢' },
  { id: 'commute', label: '🚗 Desplazamiento', color: '#64748B', badgeBg: 'bg-slate-100 text-slate-800 border-slate-200', defaultEmoji: '🚗' },
  { id: 'dining', label: '🍽️ Alimentación', color: '#F59E0B', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200', defaultEmoji: '🍽️' },
  { id: 'rest', label: '😴 Descanso', color: '#10B981', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200', defaultEmoji: '😴' },
  { id: 'other', label: '📋 Otro', color: '#0EA5E9', badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200', defaultEmoji: '📋' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'Sin recordatorio' },
  { value: 5, label: '5 minutos antes' },
  { value: 10, label: '10 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 día antes' },
];

export const AgendaView: React.FC<Props> = ({ state, onNavigateToOffice }) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'upcoming'>('daily');

  // Filter for upcoming list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChiefOfStaffEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<{ id: string; title: string } | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('personal');
  const [formDate, setFormDate] = useState<string>(todayStr);
  const [formStartTime, setFormStartTime] = useState<string>('09:00');
  const [formEndTime, setFormEndTime] = useState<string>('10:00');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReminderMinutes, setFormReminderMinutes] = useState<number>(30);
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Bulk Cancellation Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Raw Agenda Events
  const rawEvents = state.offices.jefaturaGabinete?.events || [];
  const activeRawEvents = rawEvents.filter(e => e.status !== 'cancelled');

  // Unified events for selected date
  const unifiedEventsForSelectedDate = ChiefOfStaffSync.getUnifiedEventsForDate(state, selectedDate);

  // Week Days
  const weekDays = getWeekDaysForDate(selectedDate);

  // Handlers
  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('personal');
    setFormDate(defaultDate || selectedDate || todayStr);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormLocation('');
    setFormDescription('');
    setFormReminderMinutes(30);
    setFormPriority('medium');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (evt: ChiefOfStaffEvent) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category || 'personal');
    setFormDate(evt.date);
    setFormStartTime(evt.startTime);
    setFormEndTime(evt.endTime);
    setFormLocation(evt.location || '');
    setFormDescription(evt.description || '');
    setFormReminderMinutes(evt.reminderMinutes ?? 30);
    setFormPriority(evt.priority || 'medium');
    setIsFormModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Por favor ingrese el título del evento', 'warning');
      return;
    }

    if (formStartTime >= formEndTime) {
      showToast('La hora de inicio debe ser anterior a la hora de finalización', 'warning');
      return;
    }

    const catObj = CATEGORIES.find(c => c.id === formCategory);
    const emoji = catObj?.defaultEmoji || '🗓️';

    const eventPayload: Omit<ChiefOfStaffEvent, 'id' | 'createdAt' | 'status'> = {
      title: formTitle.trim(),
      emoji,
      category: formCategory as any,
      description: formDescription.trim(),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      sourceOffice: 'jefatura',
      location: formLocation.trim(),
      reminderMinutes: formReminderMinutes,
      priority: formPriority
    };

    if (editingEvent) {
      ChiefOfStaffStore.updateEvent(editingEvent.id, eventPayload);
      showToast('Evento actualizado correctamente en la agenda', 'success');
    } else {
      ChiefOfStaffStore.addEvent(eventPayload);
      showToast('Nuevo evento registrado en la agenda', 'success');
    }

    setIsFormModalOpen(false);
  };

  const ConfirmDeleteModal = () => {
    if (!deletingEvent) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-3 text-rose-600">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Eliminar Evento</h3>
              <p className="text-xs text-slate-500">Oficina de Agenda Executiva</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar el evento{' '}
            <strong className="text-slate-900 font-bold">"{deletingEvent.title}"</strong>?
            Esta acción quitará el evento de la agenda de forma permanente.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeletingEvent(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                ChiefOfStaffStore.deleteEvent(deletingEvent.id);
                showToast('Evento eliminado de la agenda', 'info');
                setDeletingEvent(null);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
            >
              Sí, Eliminar Evento
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BulkCancelModal = () => {
    if (!isCancelModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <X className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancelar Actividades del Día</h3>
                <p className="text-xs text-slate-500 font-medium">Fecha: {formatFriendlyDate(selectedDate)}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Regla Ejecutiva de Cancelación:
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Las actividades no serán borradas de la base de datos. Cambiarán su estado a <strong>CANCELADA</strong> (atenuadas y tachadas) manteniendo su fecha, horario e historial intacto. No generarán alertas ni contarán como compromisos activos.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                ChiefOfStaffStore.cancelAllEventsForDate(selectedDate, 'classes');
                showToast(`Se registraron como CANCELADAS las clases para ${formatFriendlyDate(selectedDate)}`, 'info');
                setIsCancelModalOpen(false);
              }}
              className="w-full p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl text-left transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-900">
                  📚 Cancelar únicamente las Clases de este Día
                </h4>
                <p className="text-[11px] text-slate-500 group-hover:text-rose-700 mt-0.5">
                  Marca las clases académicas como canceladas sin alterar los compromisos personales o citas.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 shrink-0" />
            </button>

            <button
              onClick={() => {
                ChiefOfStaffStore.cancelAllEventsForDate(selectedDate, 'all');
                showToast(`Se registraron como CANCELADAS TODAS las actividades para ${formatFriendlyDate(selectedDate)}`, 'info');
                setIsCancelModalOpen(false);
              }}
              className="w-full p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-2xl text-left transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-900">
                  🚨 Cancelar TODAS las Actividades de este Día
                </h4>
                <p className="text-[11px] text-slate-500 group-hover:text-rose-700 mt-0.5">
                  Marca todas las clases, compromisos, citas y planes de este día como cancelados.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 shrink-0" />
            </button>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Build upcoming list of all active raw agenda events + projected unified events
  const getUpcomingEvents = () => {
    const allEvents: Array<{
      id: string;
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      category?: string;
      description?: string;
      location?: string;
      reminderMinutes?: number;
      isManualAgenda: boolean;
      raw?: ChiefOfStaffEvent;
      sourceOffice?: string;
    }> = [];

    // Add manual active events
    activeRawEvents.forEach(e => {
      allEvents.push({
        id: e.id,
        title: e.title,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        category: e.category,
        description: e.description,
        location: e.location,
        reminderMinutes: e.reminderMinutes,
        isManualAgenda: true,
        raw: e,
        sourceOffice: e.sourceOffice
      });
    });

    // Add projected events from next 30 days that are not duplicates
    for (let i = 0; i < 30; i++) {
      const curDate = addDaysToDateStr(todayStr, i);
      const unified = ChiefOfStaffSync.getUnifiedEventsForDate(state, curDate);
      unified.forEach(u => {
        if (!allEvents.some(ae => ae.id === u.id)) {
          allEvents.push({
            id: u.id,
            title: u.title,
            date: curDate,
            startTime: u.startTime,
            endTime: u.endTime,
            category: u.type,
            description: u.subtitle,
            location: u.location,
            isManualAgenda: u.sourceOffice === 'jefatura',
            sourceOffice: u.sourceOffice
          });
        }
      });
    }

    // Filter by date >= todayStr
    let filtered = allEvents.filter(e => e.date >= todayStr);

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        e => e.title.toLowerCase().includes(q) ||
             (e.description && e.description.toLowerCase().includes(q)) ||
             (e.location && e.location.toLowerCase().includes(q))
      );
    }

    // Filter by Category
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategoryFilter);
    }

    // Sort chronologically (date ascending, startTime ascending)
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    return filtered;
  };

  const upcomingList = getUpcomingEvents();

  return (
    <div className="space-y-6">
      {/* 1. Header & Resumen Ejecutivo de la Agenda */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oficina de Agenda Executiva</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestión Integral de Eventos y Compromisos
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Planifica, visualiza y administra todos tus eventos. Crea compromisos individuales o consulta la sincronización unificada con las demás oficinas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-3 text-xs font-bold text-rose-950 bg-rose-200 hover:bg-rose-300 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 border border-rose-300/60"
              title="Cancelar actividades del día manteniendo registro e historial"
            >
              <X className="w-4 h-4 text-rose-800 stroke-[3]" />
              <span>❌ Cancelar Actividades</span>
            </button>

            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-2xl shadow-lg hover:shadow-amber-400/20 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Crear Evento</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Eventos Programados Hoy</span>
            <span className="text-lg font-black text-amber-400">{unifiedEventsForSelectedDate.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Eventos Propios Registrados</span>
            <span className="text-lg font-black text-indigo-300">{activeRawEvents.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Próximos Compromisos</span>
            <span className="text-lg font-black text-emerald-400">{upcomingList.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Navegación por Pestañas principales */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Vista Diaria
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Vista Semanal
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <List className="w-4 h-4" />
            Próximos Eventos
          </button>
        </div>

        {/* Date Selector for Daily / Weekly */}
        {activeTab !== 'upcoming' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setSelectedDate(addDaysToDateStr(selectedDate, -1))}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Día Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-all"
            >
              Hoy
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
            />

            <button
              onClick={() => setSelectedDate(addDaysToDateStr(selectedDate, 1))}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Día Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. VISTA DIARIA */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 capitalize">
                {formatFriendlyDate(selectedDate)}
              </h2>
              <p className="text-xs text-slate-500">
                {unifiedEventsForSelectedDate.length} eventos y clases agendados para esta fecha
              </p>
            </div>
            <button
              onClick={() => handleOpenAddModal(selectedDate)}
              className="px-3.5 py-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              + Agregar Evento a este Día
            </button>
          </div>

          {unifiedEventsForSelectedDate.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3 shadow-xs">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No hay eventos agendados para este día</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tu agenda se encuentra completamente libre para esta fecha. Puedes registrar un nuevo evento o compromiso ejecutivo.
              </p>
              <button
                onClick={() => handleOpenAddModal(selectedDate)}
                className="mt-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
              >
                + Registrar Primer Evento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {unifiedEventsForSelectedDate.map(evt => {
                const rawMatch = activeRawEvents.find(r => r.id === evt.id);
                const isEditableAgenda = !!rawMatch;
                const catObj = CATEGORIES.find(c => c.id === evt.type || c.id === rawMatch?.category);
                const isCancelled = evt.status === 'cancelled' || evt.status === 'Cancelada' || evt.rawObject?.status === 'cancelled';

                return (
                  <div
                    key={evt.id}
                    className={`p-5 rounded-2xl shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
                      isCancelled
                        ? 'bg-rose-50/60 border-rose-200/80 opacity-75'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Time badge */}
                      <div className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold shrink-0 text-center space-y-0.5 ${
                        isCancelled ? 'bg-rose-900/80 text-rose-100' : 'bg-slate-900 text-white'
                      }`}>
                        <div className="text-[11px] text-amber-300 font-semibold">{evt.startTime}</div>
                        <div className="text-[10px] text-slate-400">a {evt.endTime}</div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${
                              catObj ? catObj.badgeBg : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {catObj ? catObj.label : (evt.officeLabel || 'Evento')}
                          </span>

                          {isCancelled && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-200 text-rose-900 border border-rose-300 rounded-md">
                              ❌ CANCELADA
                            </span>
                          )}

                          {isEditableAgenda && !isCancelled && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-900 rounded-md">
                              Agenda Directa
                            </span>
                          )}
                        </div>

                        <h3 className={`text-sm font-bold leading-snug ${isCancelled ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {evt.title}
                        </h3>

                        {evt.subtitle && evt.subtitle !== evt.title && (
                          <p className={`text-xs line-clamp-2 ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                            {evt.subtitle}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {evt.location}
                            </span>
                          )}

                          {rawMatch?.reminderMinutes !== undefined && rawMatch.reminderMinutes > 0 && !isCancelled && (
                            <span className="flex items-center gap-1 text-amber-700 font-medium">
                              <Bell className="w-3.5 h-3.5 shrink-0" />
                              Recordatorio {REMINDER_OPTIONS.find(r => r.value === rawMatch.reminderMinutes)?.label || `${rawMatch.reminderMinutes} min antes`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {isCancelled ? (
                        <button
                          onClick={() => {
                            ChiefOfStaffStore.uncancelEvent(evt.id, selectedDate);
                            showToast('Actividad reactivada en la agenda', 'success');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1 transition-all"
                          title="Reactivar esta actividad"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Reactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            ChiefOfStaffStore.cancelEvent(evt.id, selectedDate);
                            showToast('Actividad registrada como CANCELADA', 'info');
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl flex items-center gap-1 transition-all"
                          title="Cancelar esta actividad manteniendo su registro"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          Cancelar
                        </button>
                      )}

                      {isEditableAgenda && rawMatch && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(rawMatch)}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition-all"
                            title="Editar evento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => setDeletingEvent({ id: rawMatch.id, title: rawMatch.title })}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1 transition-all"
                            title="Eliminar permanentemente de la agenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. VISTA SEMANAL */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Horario Semanal Unificado
              </h2>
              <p className="text-xs text-slate-500">
                Estructura visual exacta de la agenda para la semana del {formatFriendlyDate(weekDays[0].dateStr)} al {formatFriendlyDate(weekDays[6].dateStr)}
              </p>
            </div>
          </div>

          <ExecutiveCalendar
            events={weekDays.flatMap(day => {
              const unified = ChiefOfStaffSync.getUnifiedEventsForDate(state, day.dateStr);
              return unified.map(u => ({
                id: u.id,
                title: u.title,
                date: day.dateStr,
                startTime: u.startTime || '09:00',
                endTime: u.endTime || '10:00',
                classroom: u.rawObject?.location || u.rawObject?.classroom,
                subtitle: u.subtitle,
                officeLabel: u.officeLabel,
                color: u.color,
                status: u.status,
                completed: Boolean(u.rawObject?.completed || u.rawObject?.isCompleted),
                sourceOffice: u.sourceOffice,
                raw: u.rawObject
              }));
            })}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddActivity={(dateStr) => handleOpenAddModal(dateStr)}
            onDeleteActivity={(evtId) => {
              const found = activeRawEvents.find(r => r.id === evtId);
              if (found) setDeletingEvent({ id: found.id, title: found.title });
            }}
            onCancelActivity={(evt) => {
              if (evt.status === 'cancelled' || evt.status === 'Cancelada') {
                ChiefOfStaffStore.uncancelEvent(evt.id, evt.date || selectedDate);
                showToast('Actividad reactivada en la agenda', 'success');
              } else {
                ChiefOfStaffStore.cancelEvent(evt.id, evt.date || selectedDate);
                showToast('Actividad registrada como CANCELADA', 'info');
              }
            }}
            onEditActivity={(evt) => {
              const rawMatch = activeRawEvents.find(r => r.id === evt.id);
              if (rawMatch) handleOpenEditModal(rawMatch);
            }}
            onNavigateToOffice={onNavigateToOffice}
          />
        </div>
      )}

      {/* 5. LISTA DE PRÓXIMOS EVENTOS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Próximos Eventos y Compromisos
              </h2>
              <p className="text-xs text-slate-500">
                Lista cronológica ordenada desde hoy en adelante
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar evento..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 w-48"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">Todas las Categorías</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {upcomingList.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl space-y-3">
              <List className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron eventos próximos</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hay compromisos agendados que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {upcomingList.map(item => {
                const catObj = CATEGORIES.find(c => c.id === item.category);

                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date & Time badge */}
                      <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-center shrink-0 space-y-1 min-w-28">
                        <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                          {formatFriendlyDate(item.date).split(',')[0]}
                        </div>
                        <div className="text-xs font-mono font-black text-white">
                          {item.date}
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono font-semibold">
                          {item.startTime} – {item.endTime}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                              catObj ? catObj.badgeBg : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {catObj ? catObj.label : (item.sourceOffice || 'Evento')}
                          </span>

                          {item.isManualAgenda && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-900 rounded-md">
                              Agenda
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>

                        {item.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {item.location}
                            </span>
                          )}

                          {item.reminderMinutes !== undefined && item.reminderMinutes > 0 && (
                            <span className="flex items-center gap-1 text-amber-700 font-medium">
                              <Bell className="w-3.5 h-3.5 shrink-0" />
                              Recordatorio {REMINDER_OPTIONS.find(r => r.value === item.reminderMinutes)?.label || `${item.reminderMinutes} min antes`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {item.isManualAgenda && item.raw ? (
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <button
                          onClick={() => handleOpenEditModal(item.raw!)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition-all"
                          title="Editar evento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeletingEvent({ id: item.raw!.id, title: item.raw!.title })}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1 transition-all"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic self-end md:self-center shrink-0">
                        Sincronizado
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR / EDITAR EVENTO */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center text-base shrink-0">
                  🗓️
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingEvent ? 'Editar Evento en Agenda' : 'Crear Nuevo Evento'}
                  </h3>
                  <p className="text-xs text-slate-500">Oficina de Agenda Executiva</p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reunión con Rectoría, Cita Médica, Examen Final..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Evento / Categoría</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora Fin *</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {/* Location & Reminder */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ubicación</label>
                  <input
                    type="text"
                    placeholder="Ej: Sala 102, Edificio B, Google Meet..."
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recordatorio</label>
                  <select
                    value={formReminderMinutes}
                    onChange={e => setFormReminderMinutes(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium"
                  >
                    {REMINDER_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción / Notas</label>
                <textarea
                  rows={3}
                  placeholder="Detalles, orden del día, temas a tratar o notas adicionales..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
                >
                  {editingEvent ? 'Guardar Cambios' : 'Guardar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal />

      {/* Bulk Cancel Modal */}
      <BulkCancelModal />
    </div>
  );
};

export default AgendaView;

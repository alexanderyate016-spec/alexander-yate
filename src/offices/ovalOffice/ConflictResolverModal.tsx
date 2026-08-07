import React, { useState } from 'react';
import { UnifiedExecutiveEvent } from '../../types/store';
import { ExecutiveStore } from './ExecutiveStore';
import { AlertTriangle, CheckCircle, Clock, X, Calendar, FileText, Ban, EyeOff, ArrowRight } from 'lucide-react';

interface Props {
  conflict: { eventA: UnifiedExecutiveEvent; eventB: UnifiedExecutiveEvent } | null;
  onClose: () => void;
  onResolved: () => void;
}

type ResolutionMode = 
  | 'none'
  | 'permitted_absence'
  | 'reschedule_event'
  | 'cancel_event'
  | 'ignore';

export const ConflictResolverModal: React.FC<Props> = ({
  conflict,
  onClose,
  onResolved
}) => {
  if (!conflict) return null;

  const { eventA, eventB } = conflict;

  const [mode, setMode] = useState<ResolutionMode>('none');
  const [targetEventId, setTargetEventId] = useState<string>(eventA.id);
  
  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState<string>(eventA.date);
  const [rescheduleStart, setRescheduleStart] = useState<string>(eventA.startTime || '14:00');
  const [rescheduleEnd, setRescheduleEnd] = useState<string>(eventA.endTime || '16:00');

  // Justification / Reason Notes
  const [noteText, setNoteText] = useState<string>('');

  const selectedTargetEvent = targetEventId === eventA.id ? eventA : eventB;
  const otherEvent = targetEventId === eventA.id ? eventB : eventA;

  const handleApplyResolution = () => {
    if (mode === 'permitted_absence') {
      ExecutiveStore.recordPermittedAbsence(
        selectedTargetEvent,
        otherEvent,
        noteText || 'Pedí permiso para ausentarme'
      );
    } else if (mode === 'reschedule_event') {
      if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) return;
      ExecutiveStore.rescheduleEvent(
        selectedTargetEvent,
        otherEvent,
        rescheduleDate,
        rescheduleStart,
        rescheduleEnd
      );
    } else if (mode === 'cancel_event') {
      ExecutiveStore.cancelEvent(
        selectedTargetEvent,
        otherEvent,
        noteText || 'Conflicto de horario'
      );
    } else if (mode === 'ignore') {
      ExecutiveStore.ignoreConflict(eventA, eventB);
    }

    onResolved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1726] border border-amber-500/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-white my-8">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-b border-amber-500/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Resolución de Conflicto de Asistencia
              </h3>
              <p className="text-xs text-slate-700">
                Selecciona la vía de solución oficial para registrar en el historial ejecutivo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Conflicting Events Comparison Box */}
          <div className="bg-white border border-amber-500/30 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>Eventos en Traslape ({eventA.date})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Event A */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[10px] font-bold">
                  {eventA.officeLabel}
                </span>
                <div className="font-bold text-white text-sm">{eventA.title}</div>
                <div className="text-slate-700 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {eventA.startTime} – {eventA.endTime}
                </div>
                {eventA.subtitle && (
                  <div className="text-[11px] text-slate-500">{eventA.subtitle}</div>
                )}
              </div>

              {/* Event B */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold">
                  {eventB.officeLabel}
                </span>
                <div className="font-bold text-white text-sm">{eventB.title}</div>
                <div className="text-slate-700 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {eventB.startTime} – {eventB.endTime}
                </div>
                {eventB.subtitle && (
                  <div className="text-[11px] text-slate-500">{eventB.subtitle}</div>
                )}
              </div>
            </div>
          </div>

          {/* Select Resolution Path */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Selecciona la Solución Aplicada:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Pedí Permiso */}
              <button
                type="button"
                onClick={() => setMode('permitted_absence')}
                className={`p-3 text-left rounded-xl border transition-all flex items-start gap-2.5 ${
                  mode === 'permitted_absence'
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-500'
                }`}
              >
                <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">1. Pedí permiso para ausentarme</div>
                  <div className="text-[11px] text-slate-500">Registra permiso solicitado / ausencia justificada</div>
                </div>
              </button>

              {/* Option 2: Reprogramar Evento */}
              <button
                type="button"
                onClick={() => setMode('reschedule_event')}
                className={`p-3 text-left rounded-xl border transition-all flex items-start gap-2.5 ${
                  mode === 'reschedule_event'
                    ? 'bg-blue-950/50 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-500'
                }`}
              >
                <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">2. Evento fue reprogramado</div>
                  <div className="text-[11px] text-slate-500">Cambia fecha o rango de horas del evento</div>
                </div>
              </button>

              {/* Option 3: Cancelar Evento */}
              <button
                type="button"
                onClick={() => setMode('cancel_event')}
                className={`p-3 text-left rounded-xl border transition-all flex items-start gap-2.5 ${
                  mode === 'cancel_event'
                    ? 'bg-rose-950/50 border-rose-500 text-rose-200 ring-2 ring-rose-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-500'
                }`}
              >
                <Ban className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">3. Cancelar uno de los eventos</div>
                  <div className="text-[11px] text-slate-500">Marca como cancelado sin borrar el historial</div>
                </div>
              </button>

              {/* Option 4: Ignorar Conflicto */}
              <button
                type="button"
                onClick={() => setMode('ignore')}
                className={`p-3 text-left rounded-xl border transition-all flex items-start gap-2.5 ${
                  mode === 'ignore'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-500'
                }`}
              >
                <EyeOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-white">4. Ignorar el conflicto</div>
                  <div className="text-[11px] text-slate-500">Mantiene ambos eventos y limpia la alerta</div>
                </div>
              </button>

            </div>
          </div>

          {/* DYNAMIC ACTION FORM */}
          {mode !== 'none' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              
              {/* Target Event Selector if needed */}
              {(mode === 'permitted_absence' || mode === 'reschedule_event' || mode === 'cancel_event') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    ¿Sobre qué evento aplica esta acción?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetEventId(eventA.id);
                        setRescheduleDate(eventA.date);
                        setRescheduleStart(eventA.startTime || '14:00');
                        setRescheduleEnd(eventA.endTime || '16:00');
                      }}
                      className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                        targetEventId === eventA.id
                          ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      A. {eventA.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetEventId(eventB.id);
                        setRescheduleDate(eventB.date);
                        setRescheduleStart(eventB.startTime || '14:00');
                        setRescheduleEnd(eventB.endTime || '16:00');
                      }}
                      className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                        targetEventId === eventB.id
                          ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      B. {eventB.title}
                    </button>
                  </div>
                </div>
              )}

              {/* Form fields for Reschedule */}
              {mode === 'reschedule_event' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Nuevo Horario para "{selectedTargetEvent.title}"
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Nueva Fecha</label>
                      <input 
                        type="date"
                        value={rescheduleDate}
                        onChange={e => setRescheduleDate(e.target.value)}
                        className="w-full p-2 bg-white border border-blue-500/40 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Hora Inicio</label>
                      <input 
                        type="time"
                        value={rescheduleStart}
                        onChange={e => setRescheduleStart(e.target.value)}
                        className="w-full p-2 bg-white border border-blue-500/40 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-700 block mb-1">Hora Fin</label>
                      <input 
                        type="time"
                        value={rescheduleEnd}
                        onChange={e => setRescheduleEnd(e.target.value)}
                        className="w-full p-2 bg-white border border-blue-500/40 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form fields for Permitted Absence / Notes */}
              {(mode === 'permitted_absence' || mode === 'cancel_event') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {mode === 'permitted_absence' ? 'Detalle de la autorización / permiso:' : 'Motivo de la cancelación:'}
                  </label>
                  <input
                    type="text"
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder={mode === 'permitted_absence' ? 'Ej. Permiso concedido por el docente...' : 'Ej. Se canceló por traslape con cita médica...'}
                    className="w-full p-2.5 bg-white border border-slate-600 rounded-lg text-xs text-white"
                  />
                </div>
              )}

              {mode === 'ignore' && (
                <div className="text-xs text-amber-200/90 bg-amber-950/40 border border-amber-500/30 p-3 rounded-lg">
                  💡 <strong>Ignorar Conflicto:</strong> Ambos eventos permanecerán programados en la agenda. La alerta de conflicto será descartada y registrada en el historial.
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-700 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          
          <button
            disabled={mode === 'none'}
            onClick={handleApplyResolution}
            className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              mode !== 'none'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Aplicar Resolución e Inscribir en Historial
          </button>
        </div>

      </div>
    </div>
  );
};

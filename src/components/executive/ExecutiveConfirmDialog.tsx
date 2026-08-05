import React from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { ExecutiveButton } from './ExecutiveButton';

export interface ExecutiveConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ExecutiveConfirmDialog: React.FC<ExecutiveConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0B1528]/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isDanger ? <Trash2 className="w-5 h-5 stroke-[1.75]" /> : <AlertTriangle className="w-5 h-5 stroke-[1.75]" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <ExecutiveButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-medium"
          >
            {cancelLabel}
          </ExecutiveButton>
          <ExecutiveButton
            variant={isDanger ? 'danger' : 'primary'}
            accentColor={isDanger ? 'rose' : 'gold'}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </ExecutiveButton>
        </div>
      </div>
    </div>
  );
};

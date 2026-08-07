import React from 'react';
import { ExecutiveNotice } from './OvalOfficeCalculations';
import { X, Bell, AlertTriangle, Info, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notices: ExecutiveNotice[];
  onNavigateToOffice: (officeKey: string) => void;
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  notices,
  onNavigateToOffice
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0A192F] text-white border-2 border-[#C5A059] max-w-lg w-full p-6 shadow-2xl space-y-4 rounded-sm">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#C5A059]/40 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#C5A059]" />
            <h3 className="font-serif font-bold text-lg text-white">
              Centro de Notificaciones del Sistema
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTICES LIST */}
        {notices.length === 0 ? (
          <div className="p-8 text-center text-white/50 text-xs bg-[#162A45] border border-dashed border-[#D1C7B7]/30">
            Sin notificaciones urgentes o alertas activas en el sistema.
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 divide-y divide-[#D1C7B7]/20">
            {notices.map(n => (
              <div key={n.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#162A45] text-[#C5A059] border border-[#C5A059]/30">
                    {n.officeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-white/60">{n.date}</span>
                </div>

                <div className="flex items-start gap-2">
                  {n.type === 'urgent' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-serif font-bold text-sm text-white">{n.title}</div>
                    <div className="text-xs text-white/80 font-sans">{n.message}</div>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToOffice(n.sourceOffice);
                    }}
                    className="text-[10px] uppercase font-bold text-[#C5A059] hover:underline flex items-center gap-1"
                  >
                    Ir a la oficina <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="pt-2 border-t border-[#C5A059]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#162A45] hover:bg-[#1E3A5F] border border-[#C5A059] text-xs font-bold uppercase tracking-wider text-[#C5A059]"
          >
            Cerrar Notificaciones
          </button>
        </div>
      </div>
    </div>
  );
};

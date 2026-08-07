import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AccentColor } from './GlassPanel';

export interface ExecutiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: AccentColor;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  footer?: React.ReactNode;
}

const headerIconBg: Record<AccentColor, string> = {
  gold: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const widthClasses: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const ExecutiveModal: React.FC<ExecutiveModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = 'purple',
  children,
  maxWidth = 'lg',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div 
        className={`w-full ${widthClasses[maxWidth]} bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-150 text-slate-900`}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${headerIconBg[accentColor] || headerIconBg.purple}`}>
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-sans font-bold text-slate-900 tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-xs leading-relaxed">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

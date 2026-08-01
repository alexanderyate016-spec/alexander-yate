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
  gold: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40',
  blue: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
  emerald: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
  rose: 'bg-rose-600/20 text-rose-300 border-rose-500/40',
  amber: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
  purple: 'bg-purple-600/20 text-purple-300 border-purple-500/40',
  indigo: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40',
};

const modalBorder: Record<AccentColor, string> = {
  gold: 'border-[#C5A059]/40',
  blue: 'border-blue-500/40',
  emerald: 'border-emerald-500/40',
  rose: 'border-rose-500/40',
  amber: 'border-amber-500/40',
  purple: 'border-purple-500/40',
  indigo: 'border-indigo-500/40',
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
  accentColor = 'gold',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full ${widthClasses[maxWidth]} bg-[#0B1528] border ${modalBorder[accentColor]} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-[#132337]/50">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${headerIconBg[accentColor]}`}>
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">{title}</h2>
              {subtitle && <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-xs">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="p-4 border-t border-white/10 bg-[#132337]/50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

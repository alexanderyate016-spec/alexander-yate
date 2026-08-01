import React from 'react';
import { AccentColor } from './GlassPanel';
import { ExecutiveButton } from './ExecutiveButton';
import { Inbox } from 'lucide-react';

export interface ExecutiveEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: AccentColor;
  className?: string;
}

const iconColors: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
  indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
};

export const ExecutiveEmptyState: React.FC<ExecutiveEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = 'gold',
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-[#132337]/40 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-inner ${iconColors[accentColor]}`}>
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      
      <div className="max-w-md space-y-1">
        <h4 className="font-serif font-bold text-white text-base sm:text-lg">{title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <ExecutiveButton
            variant="primary"
            accentColor={accentColor}
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </ExecutiveButton>
        </div>
      )}
    </div>
  );
};

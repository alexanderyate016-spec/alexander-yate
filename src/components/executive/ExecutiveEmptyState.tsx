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
  gold: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const ExecutiveEmptyState: React.FC<ExecutiveEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = 'purple',
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3.5 shadow-xs relative overflow-hidden ${className}`}
    >
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${iconColors[accentColor] || iconColors.purple}`}>
        {icon || <Inbox className="w-7 h-7 stroke-[1.5]" />}
      </div>
      
      <div className="max-w-md space-y-1">
        <h4 className="font-sans font-bold text-slate-900 text-base sm:text-lg tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
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

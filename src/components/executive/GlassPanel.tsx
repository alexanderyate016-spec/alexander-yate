import React from 'react';

export type AccentColor = 'gold' | 'blue' | 'emerald' | 'rose' | 'amber' | 'purple' | 'indigo';

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: AccentColor;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const borderColors: Record<AccentColor, string> = {
  gold: 'border-slate-200 hover:border-purple-300',
  blue: 'border-slate-200 hover:border-purple-300',
  emerald: 'border-emerald-200 hover:border-emerald-300',
  rose: 'border-rose-200 hover:border-rose-300',
  amber: 'border-amber-200 hover:border-amber-300',
  purple: 'border-purple-200 hover:border-purple-300',
  indigo: 'border-indigo-200 hover:border-indigo-300',
};

const paddings: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  accentColor = 'purple',
  padding = 'md',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border ${borderColors[accentColor] || 'border-slate-200 hover:border-purple-300'} rounded-2xl shadow-xs transition-all duration-200 ease-out text-slate-900 ${paddings[padding]} ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="relative z-10 text-slate-900">{children}</div>
    </div>
  );
};

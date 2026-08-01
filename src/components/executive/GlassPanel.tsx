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
  gold: 'border-[#C5A059]/30 hover:border-[#C5A059]/50',
  blue: 'border-blue-500/25 hover:border-blue-400/45',
  emerald: 'border-emerald-500/25 hover:border-emerald-400/45',
  rose: 'border-rose-500/25 hover:border-rose-400/45',
  amber: 'border-amber-500/25 hover:border-amber-400/45',
  purple: 'border-purple-500/25 hover:border-purple-400/45',
  indigo: 'border-indigo-500/25 hover:border-indigo-400/45',
};

const glowBg: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]/10',
  blue: 'bg-blue-600/10',
  emerald: 'bg-emerald-600/10',
  rose: 'bg-rose-600/10',
  amber: 'bg-amber-600/10',
  purple: 'bg-purple-600/10',
  indigo: 'bg-indigo-600/10',
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
  accentColor = 'gold',
  glow = false,
  padding = 'md',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0B1528]/85 backdrop-blur-xl border ${borderColors[accentColor]} rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-200 ${paddings[padding]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Liquid Glass Highlight Reflection */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      
      {/* Optional Glow Effect */}
      {glow && (
        <div className={`absolute -top-20 -right-20 w-64 h-64 ${glowBg[accentColor]} rounded-full blur-3xl pointer-events-none`} />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};

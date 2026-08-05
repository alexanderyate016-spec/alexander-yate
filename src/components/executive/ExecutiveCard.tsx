import React from 'react';
import { AccentColor } from './GlassPanel';

export interface ExecutiveCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: AccentColor;
  accentBorderLeft?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const borderHover: Record<AccentColor, string> = {
  gold: 'hover:border-[#C5A059]/40 hover:shadow-[#C5A059]/5',
  blue: 'hover:border-blue-400/40 hover:shadow-blue-500/5',
  emerald: 'hover:border-emerald-400/40 hover:shadow-emerald-500/5',
  rose: 'hover:border-rose-400/40 hover:shadow-rose-500/5',
  amber: 'hover:border-amber-400/40 hover:shadow-amber-500/5',
  purple: 'hover:border-purple-400/40 hover:shadow-purple-500/5',
  indigo: 'hover:border-indigo-400/40 hover:shadow-indigo-500/5',
};

const topAccentBg: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]',
  blue: 'bg-blue-400',
  emerald: 'bg-emerald-400',
  rose: 'bg-rose-400',
  amber: 'bg-amber-400',
  purple: 'bg-purple-400',
  indigo: 'bg-indigo-400',
};

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  children,
  className = '',
  accentColor = 'gold',
  accentBorderLeft = false,
  hoverable = true,
  onClick,
  header,
  footer,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0F1B2E]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300 ease-out ${
        hoverable ? `${borderHover[accentColor]} hover:shadow-2xl hover:-translate-y-0.5` : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Top Glass Highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Subtle Top Accent Pill Indicator if requested */}
      {accentBorderLeft && (
        <div className={`absolute top-0 left-6 w-12 h-0.5 ${topAccentBg[accentColor]} rounded-full pointer-events-none opacity-80`} />
      )}

      {header && <div className="border-b border-white/10 pb-3 mb-4">{header}</div>}
      <div className="text-slate-200">{children}</div>
      {footer && <div className="border-t border-white/10 pt-3 mt-4">{footer}</div>}
    </div>
  );
};

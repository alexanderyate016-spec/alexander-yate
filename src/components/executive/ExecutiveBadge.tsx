import React from 'react';
import { AccentColor } from './GlassPanel';

export interface ExecutiveBadgeProps {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'subtle';
  accentColor?: AccentColor;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const colorsSubtle: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
  indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
};

const colorsSolid: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059] text-slate-950 font-bold border-transparent',
  blue: 'bg-blue-600 text-white font-bold border-transparent',
  emerald: 'bg-emerald-600 text-white font-bold border-transparent',
  rose: 'bg-rose-600 text-white font-bold border-transparent',
  amber: 'bg-amber-500 text-slate-950 font-bold border-transparent',
  purple: 'bg-purple-600 text-white font-bold border-transparent',
  indigo: 'bg-indigo-600 text-white font-bold border-transparent',
};

export const ExecutiveBadge: React.FC<ExecutiveBadgeProps> = ({
  children,
  variant = 'subtle',
  accentColor = 'gold',
  size = 'sm',
  icon,
  className = '',
}) => {
  const baseStyle = variant === 'solid' ? colorsSolid[accentColor] : colorsSubtle[accentColor];
  const sizeStyle = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tracking-wide rounded-full border whitespace-nowrap ${baseStyle} ${sizeStyle} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

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
  gold: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const colorsSolid: Record<AccentColor, string> = {
  gold: 'bg-purple-600 text-white font-bold border-transparent',
  blue: 'bg-purple-600 text-white font-bold border-transparent',
  emerald: 'bg-emerald-600 text-white font-bold border-transparent',
  rose: 'bg-rose-600 text-white font-bold border-transparent',
  amber: 'bg-amber-600 text-white font-bold border-transparent',
  purple: 'bg-purple-600 text-white font-bold border-transparent',
  indigo: 'bg-indigo-600 text-white font-bold border-transparent',
};

export const ExecutiveBadge: React.FC<ExecutiveBadgeProps> = ({
  children,
  variant = 'subtle',
  accentColor = 'purple',
  size = 'sm',
  icon,
  className = '',
}) => {
  const baseStyle = variant === 'solid' ? (colorsSolid[accentColor] || colorsSolid.purple) : (colorsSubtle[accentColor] || colorsSubtle.purple);
  const sizeStyle = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-semibold tracking-wide rounded-full border whitespace-nowrap ${baseStyle} ${sizeStyle} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

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
  gold: 'hover:border-purple-300',
  blue: 'hover:border-purple-300',
  emerald: 'hover:border-emerald-300',
  rose: 'hover:border-rose-300',
  amber: 'hover:border-amber-300',
  purple: 'hover:border-purple-300',
  indigo: 'hover:border-indigo-300',
};

const topAccentBg: Record<AccentColor, string> = {
  gold: 'bg-purple-600',
  blue: 'bg-purple-600',
  emerald: 'bg-emerald-600',
  rose: 'bg-rose-600',
  amber: 'bg-amber-600',
  purple: 'bg-purple-600',
  indigo: 'bg-indigo-600',
};

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  children,
  className = '',
  accentColor = 'purple',
  accentBorderLeft = false,
  hoverable = true,
  onClick,
  header,
  footer,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all duration-200 ease-out text-slate-900 ${
        hoverable ? `${borderHover[accentColor] || 'hover:border-purple-300'} hover:shadow-sm` : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {accentBorderLeft && (
        <div className={`absolute top-0 left-6 w-12 h-1 ${topAccentBg[accentColor] || 'bg-purple-600'} rounded-full pointer-events-none`} />
      )}

      {header && <div className="border-b border-slate-100 pb-3 mb-4">{header}</div>}
      <div className="text-slate-800">{children}</div>
      {footer && <div className="border-t border-slate-100 pt-3 mt-4">{footer}</div>}
    </div>
  );
};

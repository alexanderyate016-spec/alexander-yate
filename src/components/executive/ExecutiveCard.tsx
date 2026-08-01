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

const leftBorders: Record<AccentColor, string> = {
  gold: 'border-l-4 border-l-[#C5A059]',
  blue: 'border-l-4 border-l-blue-500',
  emerald: 'border-l-4 border-l-emerald-500',
  rose: 'border-l-4 border-l-rose-500',
  amber: 'border-l-4 border-l-amber-500',
  purple: 'border-l-4 border-l-purple-500',
  indigo: 'border-l-4 border-l-indigo-500',
};

const borderHover: Record<AccentColor, string> = {
  gold: 'hover:border-[#C5A059]/50',
  blue: 'hover:border-blue-400/50',
  emerald: 'hover:border-emerald-400/50',
  rose: 'hover:border-rose-400/50',
  amber: 'hover:border-amber-400/50',
  purple: 'hover:border-purple-400/50',
  indigo: 'hover:border-indigo-400/50',
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
      className={`bg-[#132337]/70 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg transition-all duration-200 ${
        accentBorderLeft ? leftBorders[accentColor] : ''
      } ${hoverable ? `${borderHover[accentColor]} hover:shadow-xl hover:-translate-y-0.5` : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {header && <div className="border-b border-white/10 pb-3 mb-3">{header}</div>}
      <div className="text-slate-200">{children}</div>
      {footer && <div className="border-t border-white/10 pt-3 mt-3">{footer}</div>}
    </div>
  );
};

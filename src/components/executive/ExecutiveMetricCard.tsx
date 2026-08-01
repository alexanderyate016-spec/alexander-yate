import React from 'react';
import { AccentColor } from './GlassPanel';

export interface ExecutiveMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon?: React.ReactNode;
  accentColor?: AccentColor;
  onClick?: () => void;
  className?: string;
}

const iconBg: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40',
  blue: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
  emerald: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
  rose: 'bg-rose-600/20 text-rose-300 border-rose-500/40',
  amber: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
  purple: 'bg-purple-600/20 text-purple-300 border-purple-500/40',
  indigo: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40',
};

const topAccentBar: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
};

export const ExecutiveMetricCard: React.FC<ExecutiveMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'gold',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#132337]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-white/30 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${topAccentBar[accentColor]}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
          <p className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg[accentColor]}`}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-slate-400 font-sans">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono font-bold ${
                trend.positive !== false ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

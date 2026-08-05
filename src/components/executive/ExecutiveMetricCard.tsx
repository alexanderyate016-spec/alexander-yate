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
  gold: 'bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
  indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
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
      className={`bg-[#0F1B2E]/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 ease-out hover:border-white/20 hover:shadow-2xl ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {/* Liquid Glass Top Reflection */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-wide text-slate-400">{title}</p>
          <p className="text-xl sm:text-2xl font-sans font-semibold text-white tracking-tight">{value}</p>
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
              className={`font-mono font-medium ${
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

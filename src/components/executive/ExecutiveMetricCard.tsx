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
  gold: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const ExecutiveMetricCard: React.FC<ExecutiveMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'purple',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all duration-200 ease-out hover:border-purple-300 ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg[accentColor] || iconBg.purple}`}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-slate-500 font-sans">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono font-semibold ${
                trend.positive !== false ? 'text-emerald-700' : 'text-rose-600'
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

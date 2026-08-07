import React from 'react';
import { AccentColor } from './GlassPanel';
import { Search } from 'lucide-react';

export interface ExecutiveSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: AccentColor;
  badgeText?: string;
  actions?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
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

const badgeColors: Record<AccentColor, string> = {
  gold: 'bg-purple-50 text-purple-700 border-purple-200',
  blue: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const ExecutiveSectionHeader: React.FC<ExecutiveSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  accentColor = 'purple',
  badgeText,
  actions,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconBg[accentColor] || iconBg.purple}`}>
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-sans font-bold text-slate-900 tracking-tight">{title}</h2>
            {badgeText && (
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColors[accentColor] || badgeColors.purple}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-sans">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative min-w-[200px] flex-1 md:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>
        )}

        {actions}
      </div>
    </div>
  );
};

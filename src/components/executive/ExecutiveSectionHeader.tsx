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
  gold: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/40',
  blue: 'bg-blue-600/20 text-blue-300 border-blue-500/40',
  emerald: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
  rose: 'bg-rose-600/20 text-rose-300 border-rose-500/40',
  amber: 'bg-amber-600/20 text-amber-300 border-amber-500/40',
  purple: 'bg-purple-600/20 text-purple-300 border-purple-500/40',
  indigo: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40',
};

const badgeColors: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059]/20 text-[#C5A059] border-[#C5A059]/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
};

export const ExecutiveSectionHeader: React.FC<ExecutiveSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  accentColor = 'gold',
  badgeText,
  actions,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B1528]/90 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${iconBg[accentColor]}`}>
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">{title}</h2>
            {badgeText && (
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColors[accentColor]}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-300 font-sans">{subtitle}</p>}
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
              className="w-full bg-[#132337] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        )}

        {actions}
      </div>
    </div>
  );
};

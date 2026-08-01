import React from 'react';
import { AccentColor } from './GlassPanel';

export interface TimelineItem {
  id: string;
  title: string;
  timestamp: string;
  category?: string;
  description?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeColor?: AccentColor;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export interface ExecutiveTimelineProps {
  items: TimelineItem[];
  accentColor?: AccentColor;
  className?: string;
}

const dotColors: Record<AccentColor, string> = {
  gold: 'bg-[#C5A059] shadow-[#C5A059]/50',
  blue: 'bg-blue-500 shadow-blue-500/50',
  emerald: 'bg-emerald-500 shadow-emerald-500/50',
  rose: 'bg-rose-500 shadow-rose-500/50',
  amber: 'bg-amber-500 shadow-amber-500/50',
  purple: 'bg-purple-500 shadow-purple-500/50',
  indigo: 'bg-indigo-500 shadow-indigo-500/50',
};

export const ExecutiveTimeline: React.FC<ExecutiveTimelineProps> = ({
  items,
  accentColor = 'gold',
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/40 before:via-[#C5A059]/40 before:to-transparent ${className}`}>
      {items.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Glowing dot on timeline */}
          <div
            className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0B1528] ${
              dotColors[item.badgeColor || accentColor]
            } shadow-lg transition-transform group-hover:scale-125`}
          />

          <div
            onClick={item.onClick}
            className={`bg-[#132337]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 transition-all ${
              item.onClick ? 'cursor-pointer hover:border-white/30 hover:-translate-y-0.5' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-2">
                {item.icon && <span className="text-slate-300">{item.icon}</span>}
                <h4 className="font-serif font-bold text-white text-sm">{item.title}</h4>
                {item.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wider font-mono">
                    {item.category}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#C5A059] tracking-wider shrink-0">
                {item.timestamp}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.description}</p>
            )}

            {item.actions && <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end gap-2">{item.actions}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { AccentColor } from './GlassPanel';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ExecutiveSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  accentColor?: AccentColor;
}

const focusRing: Record<AccentColor, string> = {
  gold: 'focus:border-[#C5A059]/80 focus:ring-1 focus:ring-[#C5A059]/30',
  blue: 'focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30',
  emerald: 'focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30',
  rose: 'focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30',
  amber: 'focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30',
  purple: 'focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30',
  indigo: 'focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30',
};

export const ExecutiveSelect: React.FC<ExecutiveSelectProps> = ({
  label,
  options,
  error,
  helperText,
  icon,
  accentColor = 'gold',
  className = '',
  disabled,
  id,
  children,
  ...props
}) => {
  const selectId = id || (label ? `exec-select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-medium tracking-wide text-slate-300">
          {label} {props.required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          disabled={disabled}
          className={`w-full bg-[#0B1528]/80 backdrop-blur-md border ${
            error ? 'border-rose-500/80' : 'border-white/15 hover:border-white/25'
          } rounded-xl ${
            icon ? 'pl-9' : 'px-3.5'
          } py-2.5 text-xs text-white font-sans transition-all focus:outline-none ${
            focusRing[accentColor]
          } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0B1528] text-white">
              {opt.label}
            </option>
          ))}
          {children}
        </select>
      </div>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
};

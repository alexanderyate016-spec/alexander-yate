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
  gold: 'focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20',
  blue: 'focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20',
  emerald: 'focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20',
  rose: 'focus:border-rose-600 focus:ring-1 focus:ring-rose-600/20',
  amber: 'focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20',
  purple: 'focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20',
  indigo: 'focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20',
};

export const ExecutiveSelect: React.FC<ExecutiveSelectProps> = ({
  label,
  options,
  error,
  helperText,
  icon,
  accentColor = 'purple',
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
        <label htmlFor={selectId} className="block text-[11px] font-semibold tracking-wide text-slate-700">
          {label} {props.required && <span className="text-rose-500">*</span>}
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
          className={`w-full bg-slate-50 focus:bg-white border ${
            error ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'
          } rounded-xl ${
            icon ? 'pl-9' : 'px-3.5'
          } py-2 text-xs text-slate-900 font-sans transition-all focus:outline-none ${
            focusRing[accentColor] || focusRing.purple
          } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.label}
            </option>
          ))}
          {children}
        </select>
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};

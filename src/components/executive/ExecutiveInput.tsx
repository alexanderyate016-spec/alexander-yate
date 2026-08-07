import React from 'react';
import { AccentColor } from './GlassPanel';

export interface ExecutiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
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

export const ExecutiveInput: React.FC<ExecutiveInputProps> = ({
  label,
  error,
  helperText,
  icon,
  accentColor = 'purple',
  className = '',
  disabled,
  id,
  ...props
}) => {
  const inputId = id || (label ? `exec-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-semibold tracking-wide text-slate-700">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={`w-full bg-slate-50 focus:bg-white border ${
            error ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'
          } rounded-xl ${
            icon ? 'pl-9' : 'px-3.5'
          } py-2 text-xs text-slate-900 placeholder-slate-400 font-sans transition-all focus:outline-none ${
            focusRing[accentColor] || focusRing.purple
          } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
};

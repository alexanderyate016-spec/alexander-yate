import React from 'react';
import { AccentColor } from './GlassPanel';

export interface ExecutiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline';
  accentColor?: AccentColor;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const primaryBg: Record<AccentColor, string> = {
  gold: 'bg-gradient-to-r from-[#C5A059] to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-700 shadow-amber-900/20',
  blue: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20',
  rose: 'bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold hover:from-rose-500 hover:to-red-600 shadow-rose-900/20',
  amber: 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold hover:from-amber-400 hover:to-orange-500 shadow-amber-900/20',
  purple: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold hover:from-purple-500 hover:to-indigo-600 shadow-purple-900/20',
  indigo: 'bg-gradient-to-r from-indigo-600 to-slate-800 text-white font-bold hover:from-indigo-500 hover:to-slate-700 shadow-indigo-900/20',
};

const secondaryBorder: Record<AccentColor, string> = {
  gold: 'border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059]/10',
  blue: 'border-blue-400/40 text-blue-300 hover:bg-blue-500/10',
  emerald: 'border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10',
  rose: 'border-rose-400/40 text-rose-300 hover:bg-rose-500/10',
  amber: 'border-amber-400/40 text-amber-300 hover:bg-amber-500/10',
  purple: 'border-purple-400/40 text-purple-300 hover:bg-purple-500/10',
  indigo: 'border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/10',
};

const sizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-bold rounded-xl gap-2.5',
};

export const ExecutiveButton: React.FC<ExecutiveButtonProps> = ({
  children,
  variant = 'primary',
  accentColor = 'gold',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  let styleClasses = '';

  if (variant === 'primary' || variant === 'accent') {
    styleClasses = primaryBg[accentColor];
  } else if (variant === 'secondary' || variant === 'outline') {
    styleClasses = `bg-[#162A45]/80 backdrop-blur-md border ${secondaryBorder[accentColor]}`;
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold';
  } else if (variant === 'ghost') {
    styleClasses = 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-150 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizes[size]} ${styleClasses} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

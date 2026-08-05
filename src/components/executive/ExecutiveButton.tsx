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
  gold: 'bg-gradient-to-r from-[#C5A059] to-[#a8823b] text-slate-950 font-semibold hover:brightness-110 shadow-lg shadow-[#C5A059]/10',
  blue: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:brightness-110 shadow-lg shadow-blue-500/10',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:brightness-110 shadow-lg shadow-emerald-500/10',
  rose: 'bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold hover:brightness-110 shadow-lg shadow-rose-500/10',
  amber: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold hover:brightness-110 shadow-lg shadow-amber-500/10',
  purple: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:brightness-110 shadow-lg shadow-purple-500/10',
  indigo: 'bg-gradient-to-r from-indigo-600 to-slate-800 text-white font-semibold hover:brightness-110 shadow-lg shadow-indigo-500/10',
};

const secondaryBorder: Record<AccentColor, string> = {
  gold: 'border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/15',
  blue: 'border-blue-400/30 text-blue-300 hover:bg-blue-500/15',
  emerald: 'border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/15',
  rose: 'border-rose-400/30 text-rose-300 hover:bg-rose-500/15',
  amber: 'border-amber-400/30 text-amber-300 hover:bg-amber-500/15',
  purple: 'border-purple-400/30 text-purple-300 hover:bg-purple-500/15',
  indigo: 'border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/15',
};

const sizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs font-medium rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
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
    styleClasses = `bg-[#0B1528]/80 backdrop-blur-xl border ${secondaryBorder[accentColor]}`;
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 font-semibold shadow-lg shadow-rose-950/20';
  } else if (variant === 'ghost') {
    styleClasses = 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-200 ease-out shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizes[size]} ${styleClasses} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="tracking-tight">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

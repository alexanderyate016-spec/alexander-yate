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
  gold: 'bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs',
  blue: 'bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs',
  rose: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs',
  amber: 'bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs',
  purple: 'bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs',
};

const secondaryBorder: Record<AccentColor, string> = {
  gold: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 font-semibold',
  blue: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 font-semibold',
  emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-semibold',
  rose: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 font-semibold',
  amber: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 font-semibold',
  purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 font-semibold',
  indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 font-semibold',
};

const sizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
};

export const ExecutiveButton: React.FC<ExecutiveButtonProps> = ({
  children,
  variant = 'primary',
  accentColor = 'purple',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  let styleClasses = '';

  if (variant === 'primary' || variant === 'accent') {
    styleClasses = primaryBg[accentColor] || primaryBg.purple;
  } else if (variant === 'secondary' || variant === 'outline') {
    styleClasses = `border ${secondaryBorder[accentColor] || secondaryBorder.purple}`;
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold';
  } else if (variant === 'ghost') {
    styleClasses = 'bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent';
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizes[size]} ${styleClasses} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="tracking-tight">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

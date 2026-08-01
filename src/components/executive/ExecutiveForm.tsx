import React from 'react';

export interface ExecutiveFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ExecutiveForm: React.FC<ExecutiveFormProps> = ({
  onSubmit,
  children,
  actions,
  className = '',
  ...props
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`} {...props}>
      {children}
      {actions && (
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
          {actions}
        </div>
      )}
    </form>
  );
};

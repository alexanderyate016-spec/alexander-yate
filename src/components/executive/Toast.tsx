import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  public subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  public show(message: string, type: ToastType = 'success') {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastMessage = { id, message, type };
    this.toasts = [...this.toasts, newToast];
    this.notify();

    setTimeout(() => {
      this.dismiss(id);
    }, 3500);
  }

  public dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }
}

export const toastManager = new ToastManager();

export const showToast = (message: string, type: ToastType = 'success') => {
  toastManager.show(message, type);
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-purple-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-200 bg-white text-slate-900 shadow-md',
          error: 'border-rose-200 bg-white text-slate-900 shadow-md',
          info: 'border-purple-200 bg-white text-slate-900 shadow-md',
          warning: 'border-amber-200 bg-white text-slate-900 shadow-md',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full border shadow-md text-xs font-semibold transition-all duration-200 transform animate-in fade-in slide-in-from-top-4 ${borderStyles[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="tracking-wide">{toast.message}</span>
            <button
              onClick={() => toastManager.dismiss(toast.id)}
              className="ml-2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

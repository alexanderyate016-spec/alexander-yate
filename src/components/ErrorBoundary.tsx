import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Casa Blanca Personal:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetLocalStore = () => {
    if (confirm('¿Está seguro de que desea reiniciar los datos locales? Esto restaurará la estructura vacía inicial.')) {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Error clearing localStorage', e);
      }
      window.location.reload();
    }
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const affectedModule = this.state.errorInfo?.componentStack
        ? this.state.errorInfo.componentStack.trim().split('\n')[0]
        : 'Módulo Principal / Interfaz';

      return (
        <div className="min-h-screen bg-[#0A192F] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-[#F9F7F2] text-[#1A1A1A] border border-[#D1C7B7] p-8 shadow-2xl relative space-y-6">
            {/* Header */}
            <div className="border-b border-[#D1C7B7] pb-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-900/10 border border-rose-600/30 flex items-center justify-center text-rose-700">
                <span className="text-2xl font-bold">⚠️</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-[#0A192F]">
                  Casa Blanca Personal encontró un problema de carga
                </h1>
                <p className="text-xs text-[#8B8378] font-mono uppercase tracking-widest mt-0.5">
                  Diagnóstico del Sistema Presidencial
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="space-y-4 text-xs font-sans">
              <div className="p-3 bg-[#F4F1EA] border border-[#D1C7B7]">
                <span className="font-bold text-[#0A192F] block text-[10px] uppercase tracking-wider mb-1">
                  Módulo o Componente Afectado:
                </span>
                <span className="font-mono text-rose-800 font-semibold">{affectedModule}</span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                <span className="font-bold block text-[10px] uppercase tracking-wider text-rose-900">
                  Mensaje del Error:
                </span>
                <p className="font-mono text-xs break-words">
                  {this.state.error?.message || 'Error desconocido durante la ejecución.'}
                </p>
              </div>

              {this.state.error?.stack && (
                <details className="text-[11px] text-[#8B8378]">
                  <summary className="cursor-pointer font-semibold hover:text-[#0A192F]">
                    Ver traza completa de la pila (Stack Trace)
                  </summary>
                  <pre className="mt-2 p-3 bg-[#1A1A1A] text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-48 border border-[#D1C7B7]">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#D1C7B7] flex flex-col sm:flex-row justify-end gap-3 text-xs">
              <button
                onClick={this.handleReloadPage}
                className="px-4 py-2.5 bg-[#F4F1EA] hover:bg-[#E8E4D8] text-[#0A192F] font-bold uppercase tracking-wider border border-[#D1C7B7] transition-colors cursor-pointer"
              >
                Reintentar Carga
              </button>
              <button
                onClick={this.handleResetLocalStore}
                className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#162A45] text-white font-bold uppercase tracking-wider border border-[#C5A059] transition-colors cursor-pointer"
              >
                Reiniciar Datos Locales
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

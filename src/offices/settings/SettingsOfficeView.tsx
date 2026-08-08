import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { storeInstance } from '../../store/CasaBlancaStore';
import { SecurityStore } from '../security/SecurityStore';
import {
  Settings,
  Eye,
  Sliders,
  Check,
  Shield,
  Download,
  Upload,
  Lock,
  Sun,
  Moon,
  Sparkles,
  Info,
  Type,
  Maximize2,
  CheckCircle2,
  User,
  Clock
} from 'lucide-react';

interface Props {
  state: MasterState;
  showToast?: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const SettingsOfficeView: React.FC<Props> = ({ state, showToast }) => {
  const settings = state.settings || {
    theme: 'light',
    profileName: 'Presidente Alexander Yate',
    executiveHours: { start: '07:00', end: '22:00' },
    highContrast: false,
    fontSizeMultiplier: 'normal'
  };

  const isHighContrast = !!settings.highContrast;
  const [profileNameInput, setProfileNameInput] = useState(settings.profileName || '');
  const [startHour, setStartHour] = useState(settings.executiveHours?.start || '07:00');
  const [endHour, setEndHour] = useState(settings.executiveHours?.end || '22:00');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(settings.fontSizeMultiplier || 'normal');

  const notify = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    if (showToast) showToast(msg, type);
  };

  // Toggle High Contrast Mode
  const handleToggleHighContrast = () => {
    const nextVal = !isHighContrast;
    storeInstance.updateState(draft => {
      if (!draft.settings) {
        draft.settings = {
          theme: 'light',
          profileName: 'Presidente Alexander Yate',
          executiveHours: { start: '07:00', end: '22:00' },
          highContrast: nextVal
        };
      } else {
        draft.settings.highContrast = nextVal;
      }
    });
    notify(
      nextVal
        ? '✓ Modo de Contraste Alto Activado (WCAG AAA)'
        : '✓ Modo de Tema Automático Restaurado',
      'success'
    );
  };

  // Save FontSize preference
  const handleSetFontSize = (scale: 'normal' | 'large' | 'xlarge') => {
    setFontSize(scale);
    storeInstance.updateState(draft => {
      if (draft.settings) {
        draft.settings.fontSizeMultiplier = scale;
      }
    });
    notify('✓ Escala de legibilidad actualizada', 'success');
  };

  // Save Executive Profile Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storeInstance.updateState(draft => {
      if (draft.settings) {
        draft.settings.profileName = profileNameInput;
        draft.settings.executiveHours = { start: startHour, end: endHour };
      }
    });
    notify('✓ Perfil Ejecutivo y Horario guardados correctamente', 'success');
  };

  // Export Backup
  const handleExport = () => {
    const jsonStr = storeInstance.exportStateJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CasaBlancaPersonal_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    notify('✓ Copia de seguridad exportada correctamente', 'success');
  };

  // Import Backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const success = storeInstance.importStateJSON(content);
        if (success) {
          notify('✓ Estado de Casa Blanca Personal restaurado correctamente', 'success');
        } else {
          notify('Error: El archivo JSON no es válido', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. HEADER PRINCIPAL DE LA OFICINA DE CONFIGURACIÓN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Settings className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
                Oficina de Configuración y Accesibilidad
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Sistema & Interfaz
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Personalización del contraste global, accesibilidad visual, preferencias de perfil y seguridad.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleHighContrast}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
              isHighContrast
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <Eye className="w-4 h-4 stroke-[2]" />
            {isHighContrast ? 'Contraste Alto: ACTIVADO' : 'Activar Contraste Alto'}
          </button>
        </div>
      </div>

      {/* 2. PANEL DE ACCESIBILIDAD Y CONTRASTE (CORE REQUIREMENT) */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Eye className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Panel de Accesibilidad y Contraste Global
              </h2>
              <p className="text-xs text-slate-600">
                Alterna entre el modo de Contraste Alto (colores oscuros legibles) y el Tema Automático.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isHighContrast
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              {isHighContrast ? 'WCAG AAA • Contraste Alto' : 'Tema Automático Activo'}
            </span>
          </div>
        </div>

        {/* TOGGLE MODO CONTRASTE ALTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  Modo de Contraste Alto
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Forza el uso de texto oscuro de máxima intensidad (#000000 / #0f172a) sobre fondos claros,
                  eliminando textos blancos o grises tenue en todas las oficinas y formularios.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleHighContrast}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-xs ${
                  isHighContrast
                    ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isHighContrast && <CheckCircle2 className="w-4 h-4 text-white" />}
                {isHighContrast ? 'Contraste Alto Activado' : 'Cambiar a Contraste Alto'}
              </button>

              <button
                type="button"
                onClick={handleToggleHighContrast}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 shadow-xs ${
                  !isHighContrast
                    ? 'bg-purple-700 text-white border-purple-800 hover:bg-purple-800'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {!isHighContrast && <CheckCircle2 className="w-4 h-4 text-white" />}
                {!isHighContrast ? 'Tema Automático Activo' : 'Usar Tema Automático'}
              </button>
            </div>
          </div>

          {/* VISTA PREVIA EN TIEMPO REAL */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Vista Previa de Legibilidad</span>
              <span className="text-[10px] font-mono font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                {isHighContrast ? 'Modo: Contraste Alto' : 'Modo: Estándar'}
              </span>
            </h3>

            <div className="bg-white border-2 border-slate-300 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 font-serif">
                  Asignatura: Cálculo Multivariado
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 rounded-md">
                  En Curso
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Profesor: Dr. Roberto Gómez • Salón 302-B
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Nota Proyectada: 4.8 / 5.0
                </span>
                <button className="px-3 py-1 text-[11px] font-bold bg-purple-600 text-white rounded-lg shadow-xs">
                  Ver Detalles
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * Garantiza legibilidad perfecta en pantallas de alto o bajo brillo y condiciones solares.
            </p>
          </div>
        </div>

        {/* ESCALA DE LEGIBILIDAD / ESCALA DE FUENTE */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Type className="w-4 h-4 text-purple-600" />
            Escala de Legibilidad e Intensidad de Texto
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSetFontSize('normal')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                fontSize === 'normal'
                  ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Estándar (100%)</span>
              <span className="text-[10px] font-medium text-slate-500">Diseño predeterminado</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetFontSize('large')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                fontSize === 'large'
                  ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Grande (110%)</span>
              <span className="text-[10px] font-medium text-slate-500">Mayor confort de lectura</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetFontSize('xlarge')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                fontSize === 'xlarge'
                  ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Extra Grande (120%)</span>
              <span className="text-[10px] font-medium text-slate-500">Máximo tamaño y contraste</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONFIGURACIÓN DEL PERFIL EJECUTIVO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center">
            <User className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Perfil Ejecutivo & Horario de Gestión
            </h2>
            <p className="text-xs text-slate-600">
              Personaliza el nombre oficial del titular del despacho y el rango de horario activo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre Ejecutivo Oficial
              </label>
              <input
                type="text"
                value={profileNameInput}
                onChange={e => setProfileNameInput(e.target.value)}
                placeholder="Ej: Presidente Alexander Yate"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Inicio de Jornada Ejecutiva
              </label>
              <input
                type="time"
                value={startHour}
                onChange={e => setStartHour(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cierre de Jornada Ejecutiva
              </label>
              <input
                type="time"
                value={endHour}
                onChange={e => setEndHour(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2]" /> Guardar Preferencias de Perfil
            </button>
          </div>
        </form>
      </div>

      {/* 4. RESPALDO DE DATOS Y COPIA DE SEGURIDAD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Download className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Copias de Seguridad & Portabilidad Local
            </h2>
            <p className="text-xs text-slate-600">
              Exporta tu base de datos integral en formato JSON o restaura un respaldo en cualquier momento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" /> Exportar Base de Datos
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Genera un archivo JSON cifrado localmente con todas las asignaturas, finanzas, citas y metas.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2]" /> Descargar Copia JSON
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-purple-600" /> Restaurar Copia de Seguridad
              </h3>
              <p className="text-[11px] text-slate-600 mt-1">
                Carga un archivo JSON previamente exportado para recuperar toda la información en el sistema.
              </p>
            </div>
            <label className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 stroke-[2]" /> Seleccionar Archivo JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 5. SEGURIDAD Y PROTECCIÓN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Bloqueo Inmediato del Despacho
            </h3>
            <p className="text-xs text-slate-600">
              Protege el entorno inmediatamente cerrando la interfaz activa con tu código PIN de seguridad.
            </p>
          </div>
        </div>

        <button
          onClick={() => SecurityStore.lockApp('manual')}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-2"
        >
          <Lock className="w-4 h-4 stroke-[2]" /> Bloquear Ahora
        </button>
      </div>
    </div>
  );
};

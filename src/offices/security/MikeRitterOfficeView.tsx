import React, { useState } from 'react';
import { MasterState } from '../../types/store';
import { storeInstance } from '../../store/CasaBlancaStore';
import { SecurityStore } from '../security/SecurityStore';
import { hashString } from '../../store/cryptoUtils';
import {
  Shield,
  Lock,
  KeyRound,
  Download,
  Upload,
  Eye,
  Sliders,
  Check,
  AlertTriangle,
  FileText,
  UserCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  Database,
  Key,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Props {
  state: MasterState;
  showToast?: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

export const MikeRitterOfficeView: React.FC<Props> = ({ state, showToast }) => {
  const security = state.security;
  const settings = state.settings || {
    theme: 'light',
    profileName: 'Presidente Alexander Yate',
    executiveHours: { start: '07:00', end: '22:00' },
    highContrast: false,
    fontSizeMultiplier: 'normal'
  };

  const isHighContrast = !!settings.highContrast;
  const notify = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    if (showToast) showToast(msg, type);
  };

  // State for PIN change
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');

  // State for security question update
  const [newQuestion, setNewQuestion] = useState(security.credentials?.securityQuestion || '¿Nombre de tu primera mascota o ciudad natal?');
  const [newAnswer, setNewAnswer] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState('');

  // State for auto-lock timeout
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(security.settings?.lockTimeMinutes || 15);
  const [autoLockActive, setAutoLockActive] = useState<boolean>(security.settings?.autoLock !== false);

  // Profile preferences
  const [profileNameInput, setProfileNameInput] = useState(settings.profileName || 'Presidente Alexander Yate');
  const [startHour, setStartHour] = useState(settings.executiveHours?.start || '07:00');
  const [endHour, setEndHour] = useState(settings.executiveHours?.end || '22:00');

  // Change PIN handler
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');

    if (!/^\d{4}$/.test(currentPin)) {
      setPinChangeError('El PIN actual debe ser de 4 dígitos.');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setPinChangeError('El nuevo PIN debe tener exactamente 4 dígitos numéricos.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinChangeError('La confirmación del nuevo PIN no coincide.');
      return;
    }

    const currentHash = await hashString(currentPin);
    if (currentHash !== security.credentials?.pinHash) {
      setPinChangeError('El PIN actual introducido es incorrecto.');
      return;
    }

    const newHash = await hashString(newPin);
    const now = new Date().toISOString();

    storeInstance.updateState(draft => {
      if (draft.security.credentials) {
        draft.security.credentials.pinHash = newHash;
      }
      if (draft.security.authentication) {
        draft.security.authentication.passwordHash = newHash;
        draft.security.authentication.updatedAt = now;
      }
      if (!draft.security.accessLogs) draft.security.accessLogs = [];
      draft.security.accessLogs.unshift({
        id: 'log_' + Date.now(),
        date: now,
        type: 'password_changed',
        description: 'Mike Ritter: Código de seguridad PIN de 4 dígitos actualizado exitosamente.'
      });
    });

    setCurrentPin('');
    setNewPin('');
    setConfirmNewPin('');
    setPinChangeSuccess('Código de seguridad PIN actualizado correctamente.');
    notify('✓ Código de seguridad PIN actualizado correctamente', 'success');
  };

  // Change security question handler
  const handleUpdateSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError('');
    setQuestionSuccess('');

    if (!newQuestion.trim()) {
      setQuestionError('Por favor ingrese la pregunta de recuperación.');
      return;
    }
    if (!newAnswer.trim()) {
      setQuestionError('Por favor ingrese la respuesta secreta.');
      return;
    }

    const answerHash = await hashString(newAnswer.trim().toLowerCase());
    const now = new Date().toISOString();

    storeInstance.updateState(draft => {
      if (draft.security.credentials) {
        draft.security.credentials.securityQuestion = newQuestion.trim();
        draft.security.credentials.securityAnswerHash = answerHash;
      }
      if (draft.security.authentication) {
        draft.security.authentication.recoveryQuestion = newQuestion.trim();
        draft.security.authentication.recoveryAnswerHash = answerHash;
        draft.security.authentication.updatedAt = now;
      }
      if (!draft.security.accessLogs) draft.security.accessLogs = [];
      draft.security.accessLogs.unshift({
        id: 'log_' + Date.now(),
        date: now,
        type: 'password_changed',
        description: 'Mike Ritter: Pregunta y respuesta secreta de recuperación actualizadas.'
      });
    });

    setNewAnswer('');
    setQuestionSuccess('Pregunta secreta y respuesta actualizadas exitosamente.');
    notify('✓ Pregunta de seguridad actualizada', 'success');
  };

  // Save Auto-Lock settings
  const handleSaveAutoLockSettings = () => {
    storeInstance.updateState(draft => {
      if (!draft.security.settings) {
        draft.security.settings = {
          autoLock: autoLockActive,
          lockTimeMinutes: autoLockMinutes
        };
      } else {
        draft.security.settings.autoLock = autoLockActive;
        draft.security.settings.lockTimeMinutes = autoLockMinutes;
      }
    });
    notify('✓ Parámetros de bloqueo automático guardados', 'success');
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
        : '✓ Modo de Tema Estándar Restaurado',
      'success'
    );
  };

  // Save Executive Profile Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storeInstance.updateState(draft => {
      if (draft.settings) {
        draft.settings.profileName = profileNameInput;
        draft.settings.executiveHours = { start: startHour, end: endHour };
      }
      if (draft.security.userProfile) {
        draft.security.userProfile.fullName = profileNameInput;
      }
      if (draft.security.profile) {
        draft.security.profile.name = profileNameInput;
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

  const logs = security.accessLogs || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. HEADER PRESIDENCIAL: MIKE RITTER - JEFE DE SEGURIDAD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow de ambientación */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg shrink-0">
              <Shield className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
                  Mike Ritter
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  Jefe de Seguridad • Casa Blanca Personal
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Protocolo Activo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1.5 max-w-2xl leading-relaxed">
                Centro de Seguridad, Protección de Datos y Cifrado. Gestión de códigos de seguridad, control de acceso presidencial, copias de respaldo y configuraciones críticas del sistema.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => SecurityStore.lockApp('manual')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/50 transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Bloquear Sistema
            </button>
            <button
              onClick={handleToggleHighContrast}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-lg active:scale-95 cursor-pointer ${
                isHighContrast
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <Eye className="w-4 h-4" />
              {isHighContrast ? 'Contraste Alto: ON' : 'Contraste Alto'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRID PRINCIPAL DE SEGURIDAD & DATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A. GESTIÓN DEL CÓDIGO DE SEGURIDAD (PIN 4 DÍGITOS) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Código de Seguridad de 4 Dígitos
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Actualización y salvaguarda de tu clave presidencial de acceso.
              </p>
            </div>
          </div>

          {pinChangeError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {pinChangeError}
            </div>
          )}

          {pinChangeSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {pinChangeSuccess}
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                PIN Actual (4 dígitos) *
              </label>
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                placeholder="****"
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono text-center text-sm focus:bg-white focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nuevo PIN (4 dígitos) *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="****"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono text-center text-sm focus:bg-white focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Confirmar Nuevo PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="****"
                  value={confirmNewPin}
                  onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono text-center text-sm focus:bg-white focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Key className="w-4 h-4" /> Actualizar Código de Seguridad
            </button>
          </form>

          {/* PREGUNTA DE SEGURIDAD SECUNDARIA */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              Pregunta de Recuperación Presidencial
            </h3>

            {questionError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {questionError}
              </div>
            )}
            {questionSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                {questionSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateSecurityQuestion} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-600 block mb-1">Pregunta:</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-slate-600 block mb-1">Nueva Respuesta Secreta:</label>
                <input
                  type="password"
                  placeholder="Tu respuesta de seguridad..."
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Guardar Pregunta de Seguridad
              </button>
            </form>
          </div>
        </div>

        {/* B. COPIAS DE SEGURIDAD & GESTIÓN DE DATOS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Copias de Seguridad & Exportación/Importación
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Salvagarda completa y restauración segura de la base de datos local.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* EXPORTACIÓN */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-600" /> Exportar Datos
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Descarga un respaldo JSON con todas tus materias, finanzas, eventos, registros médicos y metas.
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" /> Exportar Backup JSON
                </button>
              </div>

              {/* IMPORTACIÓN */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-purple-600" /> Importar Datos
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Restaura una copia de seguridad previa de Casa Blanca Personal para recuperar toda tu información.
                  </p>
                </div>
                <label className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                  <Upload className="w-4 h-4" /> Seleccionar Archivo JSON
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* PARÁMETROS DE BLOQUEO Y PROTECCIÓN */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Bloqueo y Protección del Sistema
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block">Bloqueo automático por inactividad</span>
                  <span className="text-[11px] text-slate-600">Cierra el sistema cuando no detecta actividad</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoLockActive}
                  onChange={e => setAutoLockActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-md cursor-pointer accent-purple-600"
                />
              </div>

              {autoLockActive && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-medium">Tiempo de espera antes del bloqueo:</span>
                  <select
                    value={autoLockMinutes}
                    onChange={e => setAutoLockMinutes(Number(e.target.value))}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAutoLockSettings}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl border border-slate-300 transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Guardar Parámetros de Bloqueo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: CONFIGURACIONES SENSIBLES Y PERFIL EJECUTIVO */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuraciones Sensibles & Parámetros Ejecutivos
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Identidad del mandatario, horario oficial y preferencias de visualización.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nombre del Mandatario
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2]" /> Guardar Parámetros Ejecutivos
            </button>
          </div>
        </form>
      </div>

      {/* 4. BITÁCORA DE SEGURIDAD (AUDIT TRAIL DE MIKE RITTER) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bitácora de Acceso y Eventos de Seguridad
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Registro criptográfico y cronológico de autenticaciones y protecciones del sistema.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {logs.length} Registros
          </span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              No hay registros de eventos de seguridad recientes.
            </div>
          ) : (
            logs.slice(0, 10).map(log => {
              const isSuccess = log.type === 'login_success';
              const isFailed = log.type === 'failed_attempt' || log.type === 'locked';
              const isLock = log.type === 'auto_locked' || log.type === 'logout_locked' || log.type === 'locked';

              return (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-purple-500'
                    }`} />
                    <span className="font-semibold text-slate-800 truncate">
                      {log.description}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-600 shrink-0">
                    {new Date(log.date).toLocaleString('es-CO', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

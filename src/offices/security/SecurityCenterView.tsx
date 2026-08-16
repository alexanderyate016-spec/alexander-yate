import React, { useState, useEffect, useRef } from 'react';
import { SecurityData } from '../../types/store';
import { SecurityStore } from './SecurityStore';
import { Shield, Lock, Unlock, AlertTriangle, KeyRound, CheckCircle2, Delete, ArrowLeft, RotateCcw } from 'lucide-react';

interface Props {
  securityData: SecurityData;
  onUnlockSuccess: () => void;
}

export const SecurityCenterView: React.FC<Props> = ({ securityData, onUnlockSuccess }) => {
  const [mode, setMode] = useState<'pin' | 'question'>('pin');

  // Login / Unlock state
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlockedSuccess, setIsUnlockedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Security Question Recovery state
  const [inputAnswer, setInputAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  // Initial Setup state (if first time ever run)
  const [fullName, setFullName] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [confirmSetupPin, setConfirmSetupPin] = useState('');
  const [setupQuestion, setSetupQuestion] = useState('¿Nombre de tu primera mascota o ciudad natal?');
  const [setupAnswer, setSetupAnswer] = useState('');

  const lockoutInfo = SecurityStore.isCurrentlyLockedOut();

  // Listen to physical keyboard for PIN inputs
  useEffect(() => {
    if (!securityData.isSetupComplete || securityData.isLocked === false) return;
    if (mode !== 'pin' || lockoutInfo.locked || isUnlockedSuccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers 0-9
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinDigits, mode, lockoutInfo.locked, isUnlockedSuccess, securityData.isSetupComplete]);

  // Handle digit click or keypress
  const handleDigitPress = (digit: string) => {
    if (pinDigits.length >= 4 || isVerifying || lockoutInfo.locked || isUnlockedSuccess) return;

    const updated = [...pinDigits, digit];
    setPinDigits(updated);
    setErrorMsg('');

    if (updated.length === 4) {
      submitPin(updated.join(''));
    }
  };

  // Handle Backspace / Delete
  const handleBackspace = () => {
    if (pinDigits.length === 0 || isVerifying || isUnlockedSuccess) return;
    setPinDigits(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  // Handle Clear
  const handleClear = () => {
    if (isVerifying || isUnlockedSuccess) return;
    setPinDigits([]);
    setErrorMsg('');
  };

  // Submit 4-digit PIN for verification
  const submitPin = async (fullPin: string) => {
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await SecurityStore.verifyPin(fullPin);
      if (res.success) {
        setIsUnlockedSuccess(true);
        // Small delay for the unlocking transition and audio-visual confirmation
        setTimeout(() => {
          onUnlockSuccess();
        }, 750);
      } else {
        setIsShaking(true);
        setErrorMsg('Código incorrecto');
        setTimeout(() => {
          setIsShaking(false);
          setPinDigits([]);
        }, 500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de verificación');
      setPinDigits([]);
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit security question recovery
  const handleUnlockWithQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    const res = await SecurityStore.verifySecurityAnswer(inputAnswer);
    if (res.success) {
      setIsUnlockedSuccess(true);
      setTimeout(() => {
        onUnlockSuccess();
      }, 750);
    } else {
      setRecoveryError(res.message || 'Respuesta de seguridad incorrecta.');
      setInputAnswer('');
    }
  };

  // Initial setup submission
  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!/^\d{4}$/.test(setupPin)) {
      setErrorMsg('El PIN presidencial debe tener exactamente 4 dígitos numéricos.');
      return;
    }
    if (setupPin !== confirmSetupPin) {
      setErrorMsg('Los PIN ingresados no coinciden.');
      return;
    }
    if (!setupQuestion.trim()) {
      setErrorMsg('Ingresa una pregunta de seguridad.');
      return;
    }
    if (!setupAnswer.trim()) {
      setErrorMsg('Ingresa una respuesta a la pregunta de seguridad.');
      return;
    }

    try {
      await SecurityStore.setupSecurity(fullName, setupPin, setupQuestion, setupAnswer);
      setIsUnlockedSuccess(true);
      setTimeout(() => {
        onUnlockSuccess();
      }, 600);
    } catch (err) {
      console.error('Error al activar seguridad:', err);
      setErrorMsg('Error al activar seguridad.');
    }
  };

  // 1. FIRST TIME SETUP SCREEN (IF FRESH INSTALL)
  if (!securityData.isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 p-8 space-y-6 rounded-3xl shadow-2xl backdrop-blur-xl relative text-slate-100">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/15 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-lg">
              <Shield className="w-7 h-7 stroke-[2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              CASA BLANCA PERSONAL
            </h1>
            <p className="text-xs text-amber-300 font-semibold tracking-wider uppercase">
              Mike Ritter • Jefe de Seguridad
            </p>
            <p className="text-[11px] text-slate-400">
              Configuración inicial del protocolo de acceso y protección presidencial.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleInitialSetup} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nombre Completo del Mandatario *</label>
              <input
                type="text"
                placeholder="Ej: Alexander Yate"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-3 border border-slate-700 bg-slate-800/80 text-white rounded-xl focus:bg-slate-800 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">PIN Presidencial (4 dígitos) *</label>
                <input
                  type="password"
                  placeholder="****"
                  maxLength={4}
                  inputMode="numeric"
                  value={setupPin}
                  onChange={e => setSetupPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 border border-slate-700 bg-slate-800/80 text-white rounded-xl font-mono text-center text-base tracking-widest focus:bg-slate-800 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Confirmar PIN *</label>
                <input
                  type="password"
                  placeholder="****"
                  maxLength={4}
                  inputMode="numeric"
                  value={confirmSetupPin}
                  onChange={e => setConfirmSetupPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 border border-slate-700 bg-slate-800/80 text-white rounded-xl font-mono text-center text-base tracking-widest focus:bg-slate-800 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Pregunta de Seguridad *</label>
              <input
                type="text"
                value={setupQuestion}
                onChange={e => setSetupQuestion(e.target.value)}
                className="w-full p-3 border border-slate-700 bg-slate-800/80 text-white rounded-xl focus:bg-slate-800 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Respuesta Secreta *</label>
              <input
                type="text"
                placeholder="Tu respuesta de recuperación..."
                value={setupAnswer}
                onChange={e => setSetupAnswer(e.target.value)}
                className="w-full p-3 border border-slate-700 bg-slate-800/80 text-white rounded-xl focus:bg-slate-800 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold tracking-wide text-xs transition-all rounded-xl shadow-lg flex justify-center items-center gap-2 cursor-pointer active:scale-95 mt-2"
            >
              <Shield className="w-4 h-4 stroke-[2.5]" /> Activar Protocolo de Seguridad
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. REDISEÑADA PANTALLA DE CONTRASEÑA: MIKE RITTER - JEFE DE SEGURIDAD
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-[#040711] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden select-none">
      
      {/* ATMOSPHERIC PRESIDENTIAL LIGHTING & GLOW */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* SUBTLE PRESIDENTIAL PATTERN BORDER */}
      <div className="absolute inset-4 sm:inset-8 border border-white/[0.04] rounded-3xl pointer-events-none" />

      {/* MAIN CONTAINER */}
      <div className={`w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center space-y-6 sm:space-y-7 z-10 transition-all duration-500 ${
        isUnlockedSuccess ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        
        {/* ENCABEZADO PRESIDENCIAL */}
        <div className="text-center space-y-1 sm:space-y-1.5">
          <h1 className="text-sm sm:text-base font-bold tracking-[0.25em] text-slate-300 uppercase">
            CASA BLANCA PERSONAL
          </h1>
          <div className="text-xs font-semibold tracking-wider text-amber-400/90 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Acceso protegido
          </div>
          <p className="text-[11px] font-medium text-slate-500 tracking-wide">
            Sistema Ejecutivo Personal
          </p>
        </div>

        {/* ELEMENTO CENTRAL: MIKE RITTER - JEFE DE SEGURIDAD */}
        <div className="flex flex-col items-center space-y-2.5">
          <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl border ${
            isUnlockedSuccess
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-emerald-500/20 scale-105'
              : errorMsg
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/20'
              : 'bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-amber-400/30 text-amber-300 shadow-amber-900/10'
          }`}>
            {isUnlockedSuccess ? (
              <Unlock className="w-8 h-8 stroke-[2] animate-in zoom-in-50 duration-300" />
            ) : (
              <Shield className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.75]" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Mike Ritter
            </h2>
            <p className="text-xs font-medium text-slate-400 tracking-wide">
              Jefe de Seguridad
            </p>
          </div>
        </div>

        {/* LOCKOUT ALERT (IF TOO MANY FAILED ATTEMPTS) */}
        {lockoutInfo.locked && (
          <div className="w-full p-3.5 bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs rounded-2xl space-y-1.5 backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>SISTEMA BLOQUEADO POR SEGURIDAD</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              3 intentos fallidos consecutivos. Bloqueo temporal por {lockoutInfo.remainingMinutes} min (hasta las {lockoutInfo.unlockTime}).
            </p>
          </div>
        )}

        {/* MODO PIN (PRINCIPAL) */}
        {mode === 'pin' ? (
          <div className="w-full flex flex-col items-center space-y-6">
            
            {/* SOLICITUD DE CÓDIGO & ESPACIOS DE PIN (● ○ ○ ○) */}
            <div className="text-center space-y-3">
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                Introduzca su código de seguridad
              </p>

              {/* 4 CÍRCULOS DE PIN CON ANIMACIÓN */}
              <div className={`flex items-center justify-center gap-4 sm:gap-5 py-1 ${
                isShaking ? 'animate-shake' : ''
              }`}>
                {[0, 1, 2, 3].map(index => {
                  const isFilled = pinDigits.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 ${
                        isUnlockedSuccess
                          ? 'bg-emerald-400 shadow-md shadow-emerald-400/50 scale-110'
                          : isFilled
                          ? 'bg-white shadow-md shadow-white/40 scale-110'
                          : 'border-2 border-slate-600/80 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* FEEDBACK STATUS TEXT */}
              <div className="h-5 flex items-center justify-center">
                {isUnlockedSuccess ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acceso autorizado
                  </span>
                ) : errorMsg ? (
                  <span className="text-xs font-semibold text-rose-400 animate-in fade-in">
                    {errorMsg}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Sistema protegido
                  </span>
                )}
              </div>
            </div>

            {/* TECLADO NUMÉRICO VISUAL APPLE / LIQUID GLASS */}
            <div className="w-full max-w-[280px] sm:max-w-[300px] grid grid-cols-3 gap-3 sm:gap-3.5">
              {[
                { val: '1', sub: '' },
                { val: '2', sub: 'ABC' },
                { val: '3', sub: 'DEF' },
                { val: '4', sub: 'GHI' },
                { val: '5', sub: 'JKL' },
                { val: '6', sub: 'MNO' },
                { val: '7', sub: 'PQRS' },
                { val: '8', sub: 'TUV' },
                { val: '9', sub: 'WXYZ' },
              ].map(btn => (
                <button
                  key={btn.val}
                  type="button"
                  disabled={lockoutInfo.locked || isVerifying || isUnlockedSuccess}
                  onClick={() => handleDigitPress(btn.val)}
                  className="h-14 sm:h-16 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] active:bg-white/[0.22] border border-white/[0.08] text-white flex flex-col items-center justify-center transition-all duration-150 shadow-lg backdrop-blur-md cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <span className="text-xl sm:text-2xl font-bold font-mono group-hover:scale-105 transition-transform">
                    {btn.val}
                  </span>
                  {btn.sub && (
                    <span className="text-[9px] font-semibold text-slate-400 tracking-widest leading-none mt-0.5">
                      {btn.sub}
                    </span>
                  )}
                </button>
              ))}

              {/* BOTTOM ROW: CLEAR, 0, BACKSPACE */}
              <button
                type="button"
                disabled={pinDigits.length === 0 || isVerifying || isUnlockedSuccess}
                onClick={handleClear}
                className="h-14 sm:h-16 rounded-2xl bg-transparent hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all text-xs font-semibold cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                title="Borrar todo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={lockoutInfo.locked || isVerifying || isUnlockedSuccess}
                onClick={() => handleDigitPress('0')}
                className="h-14 sm:h-16 rounded-2xl bg-white/[0.06] hover:bg-white/[0.14] active:bg-white/[0.22] border border-white/[0.08] text-white flex flex-col items-center justify-center transition-all duration-150 shadow-lg backdrop-blur-md cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <span className="text-xl sm:text-2xl font-bold font-mono group-hover:scale-105 transition-transform">
                  0
                </span>
              </button>

              <button
                type="button"
                disabled={pinDigits.length === 0 || isVerifying || isUnlockedSuccess}
                onClick={handleBackspace}
                className="h-14 sm:h-16 rounded-2xl bg-transparent hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                title="Retroceder"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* PREGUNTA DE SEGURIDAD RECOVERY LINK */}
            <button
              type="button"
              onClick={() => setMode('question')}
              className="text-xs font-medium text-slate-400 hover:text-amber-300 transition-colors pt-1 cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              ¿Olvidó su código? Pregunta de Seguridad
            </button>
          </div>
        ) : (
          /* MODO PREGUNTA DE SEGURIDAD */
          <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-xl">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Recuperación Presidencial
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {securityData.credentials?.securityQuestion || 'Pregunta de seguridad configurada'}
              </p>
            </div>

            {recoveryError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-xl text-center">
                {recoveryError}
              </div>
            )}

            <form onSubmit={handleUnlockWithQuestion} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Introduzca su respuesta secreta..."
                value={inputAnswer}
                onChange={e => setInputAnswer(e.target.value)}
                className="w-full p-3 border border-slate-700 bg-slate-800/90 text-white rounded-xl focus:outline-none focus:border-amber-400 font-medium"
                autoFocus
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" /> Desbloquear Acceso
              </button>

              <button
                type="button"
                onClick={() => setMode('pin')}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors block pt-2 cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Volver al Código PIN
              </button>
            </form>
          </div>
        )}
      </div>

      {/* FOOTER DISCRETO */}
      <div className="absolute bottom-4 text-center text-[10px] text-slate-600 font-mono tracking-wider">
        PROTOCOLO RITTER-SECDAT // CASA BLANCA PERSONAL
      </div>
    </div>
  );
};

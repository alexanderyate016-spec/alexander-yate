import React, { useState } from 'react';
import { SecurityData } from '../../types/store';
import { SecurityStore } from './SecurityStore';
import { Shield, Lock, Key, UserCheck, AlertTriangle, Crown, CheckCircle2 } from 'lucide-react';

interface Props {
  securityData: SecurityData;
  onUnlockSuccess: () => void;
}

export const SecurityCenterView: React.FC<Props> = ({ securityData, onUnlockSuccess }) => {
  const [mode, setMode] = useState<'pin' | 'question'>('pin');

  // Setup state
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [question, setQuestion] = useState('¿Nombre de tu primera mascota o ciudad natal?');
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Login / Unlock state
  const [inputPin, setInputPin] = useState('');
  const [inputAnswer, setInputAnswer] = useState('');

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setErrorMsg('El PIN presidencial debe tener exactamente 4 dígitos numéricos.');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('Los PIN ingresados no coinciden.');
      return;
    }
    if (!question.trim()) {
      setErrorMsg('Ingresa una pregunta de seguridad.');
      return;
    }
    if (!answer.trim()) {
      setErrorMsg('Ingresa una respuesta a la pregunta de seguridad.');
      return;
    }

    try {
      await SecurityStore.setupSecurity(fullName, pin, question, answer);
      onUnlockSuccess();
    } catch (err) {
      console.error('Error al activar seguridad:', err);
      setErrorMsg('Error al activar seguridad. Revise los datos ingresados.');
    }
  };

  const handleUnlockWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await SecurityStore.verifyPin(inputPin);
    if (res.success) {
      onUnlockSuccess();
    } else {
      setErrorMsg(res.message || 'PIN presidencial incorrecto.');
      setInputPin('');
    }
  };

  const handleUnlockWithQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await SecurityStore.verifySecurityAnswer(inputAnswer);
    if (res.success) {
      onUnlockSuccess();
    } else {
      setErrorMsg(res.message || 'Respuesta de seguridad incorrecta.');
      setInputAnswer('');
    }
  };

  const lockoutInfo = SecurityStore.isCurrentlyLockedOut();

  // FIRST TIME SETUP SCREEN
  if (!securityData.isSetupComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 p-6 sm:p-8 space-y-6 rounded-2xl shadow-lg relative text-slate-900">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto text-purple-700 shadow-xs">
              <Crown className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Casa Blanca Personal
            </h1>
            <p className="text-xs text-purple-600 uppercase tracking-wider font-semibold">
              Configuración Inicial del Despacho Ejecutivo
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleInitialSetup} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre Completo del Mandatario *</label>
              <input
                type="text"
                placeholder="Ej: Alexander Hamilton"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">PIN Presidencial *</label>
                <input
                  type="password"
                  placeholder="****"
                  maxLength={4}
                  inputMode="numeric"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono text-center text-sm focus:bg-white focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirmar PIN *</label>
                <input
                  type="password"
                  placeholder="****"
                  maxLength={4}
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono text-center text-sm focus:bg-white focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pregunta de Seguridad *</label>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Respuesta de Seguridad *</label>
              <input
                type="text"
                placeholder="Tu respuesta secreta..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold tracking-wide text-xs transition-all rounded-xl shadow-xs flex justify-center items-center gap-2 active:scale-95"
            >
              <Shield className="w-4 h-4 stroke-[2]" /> Activar Seguridad & Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // UNLOCK SCREEN WHEN APP IS LOCKED
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 p-6 sm:p-8 space-y-6 rounded-2xl shadow-lg relative text-slate-900">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto text-purple-700 shadow-xs">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Acceso Protegido
          </h1>
          <p className="text-xs text-slate-500">
            {securityData.userProfile?.fullName ? `Mandatario: ${securityData.userProfile.fullName}` : 'Despacho Ejecutivo'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {lockoutInfo.locked && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>SISTEMA BLOQUEADO POR SEGURIDAD</span>
            </div>
            <p className="text-[11px]">
              Se han superado los 3 intentos fallidos de PIN. El acceso por PIN está bloqueado durante {lockoutInfo.remainingMinutes} minuto(s) (hasta las {lockoutInfo.unlockTime}).
            </p>
            <p className="text-[11px] font-semibold text-slate-900">
              Puede desbloquear inmediatamente utilizando su Pregunta de Seguridad a continuación.
            </p>
          </div>
        )}

        {mode === 'pin' ? (
          <form onSubmit={handleUnlockWithPin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2 text-center">
                Ingresa tu PIN Presidencial
              </label>
              <input
                type="password"
                placeholder="****"
                maxLength={4}
                inputMode="numeric"
                disabled={lockoutInfo.locked}
                value={inputPin}
                onChange={e => setInputPin(e.target.value)}
                className={`w-full p-3 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono text-center text-lg tracking-widest focus:bg-white focus:outline-none focus:border-purple-600 ${lockoutInfo.locked ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={lockoutInfo.locked}
              className={`w-full py-3 bg-purple-600 text-white font-semibold tracking-wide text-xs rounded-xl shadow-xs transition-all ${lockoutInfo.locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700 active:scale-95'}`}
            >
              Desbloquear Sistema
            </button>

            <button
              type="button"
              onClick={() => setMode('question')}
              className="w-full text-center text-xs text-purple-700 hover:text-purple-800 font-semibold block pt-2"
            >
              ¿Olvidaste tu PIN? Usar Pregunta de Seguridad
            </button>
          </form>
        ) : (
          <form onSubmit={handleUnlockWithQuestion} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-semibold text-slate-800 block mb-2 text-xs">
                Pregunta: {securityData.credentials?.securityQuestion}
              </label>
              <input
                type="text"
                placeholder="Ingresa tu respuesta..."
                value={inputAnswer}
                onChange={e => setInputAnswer(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold tracking-wide text-xs rounded-xl shadow-xs transition-all active:scale-95"
            >
              Verificar Respuesta
            </button>

            <button
              type="button"
              onClick={() => setMode('pin')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 block pt-2"
            >
              Volver al PIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

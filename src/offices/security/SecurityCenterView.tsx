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
    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (pin.length < 4) {
      setErrorMsg('El PIN presidencial debe tener al menos 4 dígitos.');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('Los PIN ingresados no coinciden.');
      return;
    }
    if (!answer.trim()) {
      setErrorMsg('Ingresa una respuesta a la pregunta de seguridad.');
      return;
    }

    await SecurityStore.setupSecurity(fullName, pin, question, answer);
    onUnlockSuccess();
  };

  const handleUnlockWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = await SecurityStore.verifyPin(inputPin);
    if (success) {
      onUnlockSuccess();
    } else {
      setErrorMsg('PIN presidencial incorrecto.');
      setInputPin('');
    }
  };

  const handleUnlockWithQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = await SecurityStore.verifySecurityAnswer(inputAnswer);
    if (success) {
      onUnlockSuccess();
    } else {
      setErrorMsg('Respuesta de seguridad incorrecta.');
      setInputAnswer('');
    }
  };

  // FIRST TIME SETUP SCREEN
  if (!securityData.isSetupComplete) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#F9F7F2] border border-[#D1C7B7] p-6 md:p-8 space-y-6 shadow-xl relative">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-[#0A192F] border border-[#C5A059] rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
              <Crown className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0A192F]">
              Casa Blanca Personal
            </h1>
            <p className="text-[10px] text-[#8B8378] uppercase tracking-[0.2em] font-sans font-bold">
              Configuración Inicial del Despacho Ejecutivo
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleInitialSetup} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-bold uppercase tracking-wider text-[10px] text-[#0A192F] block mb-1">Nombre Completo del Mandatario *</label>
              <input
                type="text"
                placeholder="Ej: Alexander Hamilton"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 border border-[#D1C7B7] bg-white text-[#0A192F] focus:outline-none focus:border-[#C5A059]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase tracking-wider text-[10px] text-[#0A192F] block mb-1">PIN Presidencial *</label>
                <input
                  type="password"
                  placeholder="****"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full p-2.5 border border-[#D1C7B7] bg-white text-[#0A192F] font-mono text-center text-sm focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[10px] text-[#0A192F] block mb-1">Confirmar PIN *</label>
                <input
                  type="password"
                  placeholder="****"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  className="w-full p-2.5 border border-[#D1C7B7] bg-white text-[#0A192F] font-mono text-center text-sm focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-[10px] text-[#0A192F] block mb-1">Pregunta de Seguridad *</label>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="w-full p-2.5 border border-[#D1C7B7] bg-white text-[#0A192F] focus:outline-none focus:border-[#C5A059]"
                required
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-[10px] text-[#0A192F] block mb-1">Respuesta de Seguridad *</label>
              <input
                type="text"
                placeholder="Tu respuesta secreta..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full p-2.5 border border-[#D1C7B7] bg-white text-[#0A192F] focus:outline-none focus:border-[#C5A059]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0A192F] hover:bg-[#162A45] text-white font-bold uppercase tracking-widest text-[10px] transition-colors flex justify-center items-center gap-2 border border-[#C5A059]"
            >
              <Shield className="w-4 h-4 text-[#C5A059]" /> Activar Seguridad & Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // UNLOCK SCREEN WHEN APP IS LOCKED
  return (
    <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#F9F7F2] border border-[#D1C7B7] p-6 md:p-8 space-y-6 shadow-xl relative">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-[#0A192F] border border-[#C5A059] rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0A192F]">
            Acceso Protegido
          </h1>
          <p className="text-xs text-[#8B8378] font-serif italic">
            {securityData.userProfile?.fullName ? `Mandatario: ${securityData.userProfile.fullName}` : 'Despacho Ejecutivo'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans text-center">
            {errorMsg}
          </div>
        )}

        {mode === 'pin' ? (
          <form onSubmit={handleUnlockWithPin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B8378] block mb-2 text-center">
                Ingresa tu PIN Presidencial
              </label>
              <input
                type="password"
                placeholder="****"
                value={inputPin}
                onChange={e => setInputPin(e.target.value)}
                className="w-full p-3 border border-[#D1C7B7] bg-white text-[#0A192F] font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#C5A059]"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0A192F] hover:bg-[#162A45] text-white font-bold uppercase tracking-widest text-[10px] border border-[#C5A059] transition-colors"
            >
              Desbloquear Sistema
            </button>

            <button
              type="button"
              onClick={() => setMode('question')}
              className="w-full text-center text-[11px] text-[#C5A059] hover:underline font-semibold block pt-2 uppercase tracking-wider"
            >
              ¿Olvidaste tu PIN? Usar Pregunta de Seguridad
            </button>
          </form>
        ) : (
          <form onSubmit={handleUnlockWithQuestion} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-bold text-[#0A192F] block mb-2 text-[11px]">
                Pregunta: {securityData.credentials?.securityQuestion}
              </label>
              <input
                type="text"
                placeholder="Ingresa tu respuesta..."
                value={inputAnswer}
                onChange={e => setInputAnswer(e.target.value)}
                className="w-full p-2.5 border border-[#D1C7B7] bg-white text-[#0A192F] focus:outline-none focus:border-[#C5A059]"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0A192F] hover:bg-[#162A45] text-white font-bold uppercase tracking-widest text-[10px] border border-[#C5A059] transition-colors"
            >
              Verificar Respuesta
            </button>

            <button
              type="button"
              onClick={() => setMode('pin')}
              className="w-full text-center text-xs text-[#8B8378] hover:underline block pt-2"
            >
              Volver al PIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

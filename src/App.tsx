import React, { useState, useEffect } from 'react';
import { storeInstance } from './store/CasaBlancaStore';
import { MasterState } from './types/store';
import { SecurityCenterView } from './offices/security/SecurityCenterView';
import { SecurityStore } from './offices/security/SecurityStore';
import { CrisisCenterView } from './offices/security/CrisisCenterView';
import { AcademicView } from './offices/academic/AcademicView';
import { DailyLifeView } from './offices/dailyLife/DailyLifeView';
import { FinancialView } from './offices/financial/FinancialView';
import { SocialView } from './offices/social/SocialView';
import { MedicalView } from './offices/medical/MedicalView';
import { PersonalDevView } from './offices/personalDev/PersonalDevView';
import { SettingsOfficeView } from './offices/settings/SettingsOfficeView';
import { OvalOfficeView } from './offices/ovalOffice/OvalOfficeView';
import { ToastContainer, showToast } from './components/executive';
import {
  Download,
  Upload,
  Lock,
  LogOut,
  Menu,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useTimeService } from './hooks/useTimeService';

export function App() {
  const [state, setState] = useState<MasterState>(storeInstance.getState());
  const [activeOffice, setActiveOffice] = useState<string>('ovalOffice');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';
  const timeService = useTimeService(userName);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = storeInstance.subscribe(newState => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Automatic Inactivity Auto-Lock Timer
  useEffect(() => {
    if (!state.security.isSetupComplete || state.security.isLocked) return;

    const autoLockEnabled = state.security.settings?.autoLock !== false;
    if (!autoLockEnabled) return;

    const lockTimeMinutes = state.security.settings?.lockTimeMinutes || 15;
    const timeoutMs = lockTimeMinutes * 60 * 1000;

    let timer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        SecurityStore.lockApp('auto_inactivity');
      }, timeoutMs);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [state.security.isSetupComplete, state.security.isLocked, state.security.settings?.autoLock, state.security.settings?.lockTimeMinutes]);

  // Security Lock Enforcement (MUST validate BEFORE loading protected workspace)
  if (!state.security.isSetupComplete || state.security.isLocked) {
    return (
      <SecurityCenterView
        securityData={state.security}
        onUnlockSuccess={() => {
          // SecurityStore already mutated draft.security.isLocked = false in store
        }}
      />
    );
  }

  // Crisis Mode Enforcement
  if (state.crisis.isCrisisActive) {
    return <CrisisCenterView crisisData={state.crisis} />;
  }

  // Backup JSON Export
  const handleExportData = () => {
    const jsonStr = storeInstance.exportStateJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Casa_Blanca_Personal_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Copia de seguridad exportada correctamente', 'success');
  };

  // Backup JSON Import
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = storeInstance.importStateJSON(content);
        if (success) {
          showToast('✓ Estado de Casa Blanca Personal restaurado exitosamente', 'success');
        } else {
          showToast('Error: El archivo JSON proporcionado no es válido', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const navItems = [
    { key: 'ovalOffice', label: 'Despacho Oval', emoji: '🏛️' },
    { key: 'academica', label: 'Académica', emoji: '🎓' },
    { key: 'vidaDiaria', label: 'Vida Diaria', emoji: '📅' },
    { key: 'financiera', label: 'Financiera', emoji: '💰' },
    { key: 'vidaSocial', label: 'Vida Social', emoji: '💖' },
    { key: 'medica', label: 'Médica', emoji: '🩺' },
    { key: 'desarrolloPersonal', label: 'Desarrollo Personal', emoji: '🧭' },
    { key: 'configuracion', label: 'Configuración', emoji: '⚙️' },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 flex flex-col font-sans relative antialiased"
      data-high-contrast={state.settings?.highContrast ? 'true' : 'false'}
    >
      <ToastContainer />

      {/* 1. BARRA SUPERIOR ESTRUCTURADA Y LIMPIA */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand Header */}
            <div
              onClick={() => setActiveOffice('ovalOffice')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold tracking-tight shadow-sm group-hover:bg-purple-700 transition-all">
                CBP
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Casa Blanca Personal
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Despacho Ejecutivo
                  </span>
                </h1>
              </div>
            </div>

            {/* RELOJ Y SINCRONIZACIÓN DINÁMICA DE HORA */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans">
              <div className="relative flex items-center">
                <select
                  value={timeService.forcedPeriod}
                  onChange={e => timeService.setForcedPeriod(e.target.value as any)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none transition-all appearance-none"
                  title="Sincronización de hora del día (Auto en tiempo real o Vista Previa)"
                >
                  <option value="auto">⏱️ Auto ({timeService.periodInfo.label})</option>
                  <option value="dawn">🌅 Amanecer (05:00 - 08:00)</option>
                  <option value="morning">☀️ Mañana (08:00 - 12:00)</option>
                  <option value="midday">🌤️ Mediodía (12:00 - 17:00)</option>
                  <option value="sunset">🌇 Atardecer (17:00 - 19:30)</option>
                  <option value="dusk">🌆 Crepúsculo (19:30 - 21:00)</option>
                  <option value="night">🌙 Noche (21:00 - 05:00)</option>
                </select>
                <div className="pointer-events-none absolute right-2 flex items-center text-purple-700 text-[9px]">
                  ▼
                </div>
              </div>

              <div className="flex items-center gap-2 pl-0.5">
                <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600 stroke-[2]" />
                  {timeService.clockStr}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">
                  {timeService.fullDateStr}
                </span>
              </div>
              {timeService.periodInfo.colombianHoliday.isHoliday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                  🇨🇴 Festivo
                </span>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
                <span className="text-[11px]">Seguridad Activa</span>
              </div>

              <div className="h-4 w-[1px] bg-slate-200"></div>

              <button
                onClick={handleExportData}
                title="Exportar copia de seguridad en JSON"
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all text-xs font-medium flex items-center gap-1.5 active:scale-95 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-purple-600 stroke-[2]" /> Exportar
              </button>

              <label
                title="Restaurar estado desde copia JSON"
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all text-xs font-medium cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-purple-600 stroke-[2]" /> Importar
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>

              <button
                onClick={() => SecurityStore.lockApp('manual')}
                title="Bloquear sistema de inmediato"
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold transition-all text-xs flex items-center gap-1.5 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 stroke-[2]" /> Bloquear
              </button>

              <button
                onClick={() => SecurityStore.logoutAndLock()}
                title="Cerrar sesión y bloquear sistema"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all text-xs flex items-center gap-1.5 active:scale-95 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2]" /> Salir
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[2]" /> : <Menu className="w-5 h-5 stroke-[2]" />}
              </button>
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION BAR (OFFICES) */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center space-x-2 py-2 overflow-x-auto">
              {navItems.map(item => {
                const isActive = activeOffice === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveOffice(item.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all duration-150 ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="text-sm leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-1.5">
            {navItems.map(item => {
              const isActive = activeOffice === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveOffice(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all ${
                    isActive ? 'bg-purple-600 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.label}
                </button>
              );
            })}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 bg-slate-100 rounded-xl text-xs text-slate-700 py-2 flex justify-center items-center gap-1.5 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" /> Exportar
              </button>
              <label className="flex-1 bg-slate-100 rounded-xl text-xs text-slate-700 py-2 flex justify-center items-center gap-1.5 cursor-pointer font-medium">
                <Upload className="w-3.5 h-3.5 text-purple-600" /> Importar
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
              <button
                onClick={() => SecurityStore.lockApp('manual')}
                className="w-full bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-700 py-2 flex justify-center items-center gap-1.5 font-semibold"
              >
                <Lock className="w-3.5 h-3.5" /> Bloquear
              </button>
              <button
                onClick={() => SecurityStore.logoutAndLock()}
                className="w-full bg-purple-600 rounded-xl text-xs text-white py-2 flex justify-center items-center gap-1.5 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. ÁREA PRINCIPAL DEL CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div key={activeOffice} className="animate-in fade-in duration-200">
          {activeOffice === 'ovalOffice' && (
            <OvalOfficeView
              state={state}
              onNavigateToOffice={officeKey => setActiveOffice(officeKey)}
              onActivateEmergencyLock={() => SecurityStore.lockApp('manual')}
            />
          )}
          {activeOffice === 'academica' && <AcademicView data={state.offices.academica} />}
          {activeOffice === 'vidaDiaria' && <DailyLifeView data={state.offices.vidaDiaria} />}
          {activeOffice === 'financiera' && <FinancialView data={state.offices.financiera} />}
          {activeOffice === 'vidaSocial' && (
            <SocialView
              data={state.offices.vidaSocial}
              profileName={state.security.userProfile?.fullName}
            />
          )}
          {activeOffice === 'medica' && <MedicalView data={state.offices.medica} />}
          {activeOffice === 'desarrolloPersonal' && <PersonalDevView data={state.offices.desarrolloPersonal} />}
          {(activeOffice === 'configuracion' || activeOffice === 'seguridad') && (
            <SettingsOfficeView state={state} showToast={showToast} />
          )}
        </div>
      </main>

      {/* 3. PIE DE PÁGINA MINIMALISTA */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-sans text-xs">
          <span className="font-medium text-slate-700">
            <strong>Casa Blanca Personal</strong> • Despacho Ejecutivo
          </span>
          <span className="text-slate-400">
            Información Confidencial y Cifrada Localmente
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

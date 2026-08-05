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
import { OvalOfficeView } from './offices/ovalOffice/OvalOfficeView';
import { ToastContainer, showToast } from './components/executive';
import {
  Crown,
  BookOpen,
  Activity,
  Landmark,
  Users,
  Stethoscope,
  Compass,
  Download,
  Upload,
  Lock,
  LogOut,
  Menu,
  X,
  Clock
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
    { key: 'ovalOffice', label: 'Despacho Oval', icon: Crown },
    { key: 'academica', label: 'Académica', icon: BookOpen },
    { key: 'vidaDiaria', label: 'Vida Diaria', icon: Activity },
    { key: 'financiera', label: 'Financiera', icon: Landmark },
    { key: 'vidaSocial', label: 'Vida Social', icon: Users },
    { key: 'medica', label: 'Médica', icon: Stethoscope },
    { key: 'desarrolloPersonal', label: 'Desarrollo Personal', icon: Compass },
  ];

  return (
    <div className={`min-h-screen ${timeService.periodInfo.atmosphere.appBgClass} transition-colors duration-1000 flex flex-col font-sans relative`}>
      <ToastContainer />

      {/* 1. BARRA SUPERIOR EXECUTIVE SHELL */}
      <header className="bg-[#0A172A]/90 backdrop-blur-2xl text-white border-b border-white/10 sticky top-0 z-40 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo / Executive Emblem */}
            <div
              onClick={() => setActiveOffice('ovalOffice')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl border border-[#C5A059]/40 bg-[#0B1528] flex items-center justify-center text-[10px] font-sans tracking-tight text-[#C5A059] font-semibold group-hover:scale-105 transition-all shadow-md">
                CBP
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-white flex items-center gap-2">
                  Casa Blanca Personal <span className="opacity-30 font-light">|</span> <span className="text-[#C5A059]">Despacho Ejecutivo</span>
                </h1>
              </div>
            </div>

            {/* PERMANENT LIVE CLOCK & MOMENT ICON */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0F1B2E]/80 border border-white/10 text-xs font-mono backdrop-blur-md">
              <span className="text-base leading-none filter drop-shadow">{timeService.icon}</span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-amber-300 font-semibold tracking-wider text-xs flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400 stroke-[1.75]" />
                  {timeService.clockStr}
                </span>
                <span className="text-[10px] font-sans text-slate-300 font-normal hidden sm:inline">
                  {timeService.fullDateStr}
                </span>
              </div>
              {timeService.periodInfo.colombianHoliday.isHoliday && (
                <span className="hidden lg:inline-block px-2 py-0.5 rounded-full text-[9px] font-sans font-medium bg-rose-600/80 border border-rose-500/30 text-white">
                  🇨🇴 Festivo
                </span>
              )}
            </div>

            {/* Header Right Status & Actions */}
            <div className="hidden md:flex items-center gap-5 text-[10px] font-sans tracking-wider uppercase">
              <div className="flex flex-col items-end">
                <span className="opacity-40 text-[9px]">Seguridad</span>
                <span className="text-emerald-400 font-medium tracking-normal flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> PROTECCIÓN ACTIVA
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportData}
                  title="Exportar copia de seguridad en JSON"
                  className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 transition-all text-[10px] tracking-wider flex items-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3 h-3 text-[#C5A059] stroke-[1.75]" /> Exportar
                </button>

                <label
                  title="Restaurar estado desde copia JSON"
                  className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/90 transition-all text-[10px] tracking-wider cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Upload className="w-3 h-3 text-[#C5A059] stroke-[1.75]" /> Importar
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>

                <button
                  onClick={() => SecurityStore.lockApp('manual')}
                  title="Bloquear sistema de inmediato"
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-medium transition-all text-[10px] tracking-wider flex items-center gap-1.5 active:scale-95"
                >
                  <Lock className="w-3 h-3 stroke-[1.75]" /> Bloquear
                </button>

                <button
                  onClick={() => SecurityStore.logoutAndLock()}
                  title="Cerrar sesión y bloquear sistema"
                  className="px-3 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#b08d4b] text-slate-950 font-semibold transition-all text-[10px] tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <LogOut className="w-3 h-3 stroke-[2]" /> Salir
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/80 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.75]" /> : <Menu className="w-5 h-5 stroke-[1.75]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Executive Sub-Navigation Bar */}
        <div className="bg-[#0B1528]/80 backdrop-blur-xl border-t border-white/10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center space-x-1.5 py-2 overflow-x-auto">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium pr-3 border-r border-white/10">
                Oficinas:
              </span>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeOffice === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveOffice(item.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs tracking-wide flex items-center gap-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15 text-white font-medium border border-white/20 shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 stroke-[1.75] ${isActive ? 'text-[#C5A059]' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0B1528] border-b border-white/10 px-4 pt-3 pb-5 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeOffice === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveOffice(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                    isActive ? 'bg-[#C5A059] text-slate-950 font-semibold' : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.75]" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 bg-white/10 rounded-xl text-xs text-white py-2 flex justify-center items-center gap-1.5 uppercase tracking-wider text-[10px]"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" /> Exportar
              </button>
              <label className="flex-1 bg-white/10 rounded-xl text-xs text-white py-2 flex justify-center items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[10px]">
                <Upload className="w-3.5 h-3.5 text-[#C5A059]" /> Importar
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
              <button
                onClick={() => SecurityStore.lockApp('manual')}
                className="w-full bg-amber-500/20 rounded-xl text-xs text-amber-200 py-2 flex justify-center items-center gap-1.5 uppercase tracking-wider text-[10px] font-medium"
              >
                <Lock className="w-3.5 h-3.5" /> Bloquear
              </button>
              <button
                onClick={() => SecurityStore.logoutAndLock()}
                className="w-full bg-[#C5A059] rounded-xl text-xs text-slate-950 py-2 flex justify-center items-center gap-1.5 uppercase tracking-wider text-[10px] font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. ÁREA PRINCIPAL DEL CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div key={activeOffice} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        </div>
      </main>

      {/* 3. PIE DE PÁGINA EXECUTIVE PRESTIGE */}
      <footer className="bg-[#0B1528]/90 backdrop-blur-xl border-t border-white/10 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-sans text-[11px]">
          <span className="tracking-wide">
            <strong className="text-white font-medium">Casa Blanca Personal</strong> • Despacho Ejecutivo Native Glass OS
          </span>
          <span className="opacity-70 font-normal">
            Confidencial • Cifrado Local
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

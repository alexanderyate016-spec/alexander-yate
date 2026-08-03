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
import {
  Crown,
  BookOpen,
  Activity,
  Landmark,
  Users,
  Stethoscope,
  Compass,
  Shield,
  Download,
  Upload,
  Lock,
  LogOut,
  RefreshCw,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';

export function App() {
  const [state, setState] = useState<MasterState>(storeInstance.getState());
  const [activeOffice, setActiveOffice] = useState<string>('ovalOffice');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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
          alert('Estado de Casa Blanca Personal restaurado exitosamente.');
        } else {
          alert('Error: El archivo JSON proporcionado no es válido.');
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
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col font-sans">
      {/* 1. BARRA SUPERIOR EXECUTIVE SHELL */}
      <header className="bg-[#0A192F] text-white border-b border-[#D1C7B7] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo / Executive Emblem */}
            <div
              onClick={() => setActiveOffice('ovalOffice')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full border border-[#C5A059] bg-[#0A192F] flex items-center justify-center text-[10px] font-sans tracking-tighter text-[#C5A059] font-bold group-hover:scale-105 transition-transform">
                CBP
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs uppercase tracking-[0.25em] font-sans font-bold text-white flex items-center gap-2">
                  Casa Blanca Personal <span className="opacity-40 font-light">|</span> <span className="text-[#C5A059]">Despacho Ejecutivo</span>
                </h1>
              </div>
            </div>

            {/* Header Right Status & Actions */}
            <div className="hidden md:flex items-center gap-6 text-[10px] font-sans tracking-widest uppercase">
              <div className="flex flex-col items-end">
                <span className="opacity-50">Estado de Seguridad</span>
                <span className="text-emerald-400 font-bold tracking-normal flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> PROTECCIÓN ACTIVA
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  title="Exportar copia de seguridad en JSON"
                  className="px-3 py-1 border border-white/20 hover:bg-white/10 text-white/90 transition-colors uppercase text-[10px] tracking-wider flex items-center gap-1"
                >
                  <Download className="w-3 h-3 text-[#C5A059]" /> Exportar
                </button>

                <label
                  title="Restaurar estado desde copia JSON"
                  className="px-3 py-1 border border-white/20 hover:bg-white/10 text-white/90 transition-colors uppercase text-[10px] tracking-wider cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3 text-[#C5A059]" /> Importar
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>

                <button
                  onClick={() => SecurityStore.lockApp('manual')}
                  title="Bloquear sistema de inmediato"
                  className="px-3 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 font-bold transition-colors uppercase text-[10px] tracking-wider flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Bloquear
                </button>

                <button
                  onClick={() => SecurityStore.logoutAndLock()}
                  title="Cerrar sesión y bloquear sistema"
                  className="px-3 py-1 bg-[#C5A059] hover:bg-[#b08d4b] text-[#0A192F] font-bold transition-colors uppercase text-[10px] tracking-wider flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white/80 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Executive West Wing Sub-Navigation Bar */}
        <div className="bg-[#F4F1EA] border-t border-[#D1C7B7] text-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center space-x-1 py-1.5 overflow-x-auto">
              <span className="text-[10px] uppercase tracking-widest text-[#8B8378] font-bold pr-3 border-r border-[#D1C7B7]">
                Oficinas:
              </span>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeOffice === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveOffice(item.key)}
                    className={`px-3 py-1.5 text-xs font-serif tracking-wide flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-[#0A192F] text-white shadow-sm font-semibold'
                        : 'text-[#1A1A1A] hover:bg-[#E8E4D8]'
                    }`}
                  >
                    {isActive && <span className="w-1 h-3 bg-[#C5A059] inline-block"></span>}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-[#8B8378]'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0A192F] border-b border-[#D1C7B7] px-4 pt-2 pb-4 space-y-1">
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
                  className={`w-full text-left px-3 py-2 rounded-none text-xs font-serif flex items-center gap-2 ${
                    isActive ? 'bg-[#C5A059] text-[#0A192F] font-bold' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 bg-white/10 text-xs text-white py-2 flex justify-center items-center gap-1 uppercase tracking-wider text-[10px]"
              >
                <Download className="w-3.5 h-3.5 text-[#C5A059]" /> Exportar
              </button>
              <label className="flex-1 bg-white/10 text-xs text-white py-2 flex justify-center items-center gap-1 cursor-pointer uppercase tracking-wider text-[10px]">
                <Upload className="w-3.5 h-3.5 text-[#C5A059]" /> Importar
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
              <button
                onClick={() => SecurityStore.lockApp('manual')}
                className="w-full bg-amber-600/40 text-xs text-amber-200 py-2 flex justify-center items-center gap-1 uppercase tracking-wider text-[10px] font-bold"
              >
                <Lock className="w-3.5 h-3.5" /> Bloquear
              </button>
              <button
                onClick={() => SecurityStore.logoutAndLock()}
                className="w-full bg-[#C5A059] text-xs text-[#0A192F] py-2 flex justify-center items-center gap-1 uppercase tracking-wider text-[10px] font-bold"
              >
                <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. ÁREA PRINCIPAL DEL CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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
      </main>

      {/* 3. PIE DE PÁGINA EXECUTIVE PRESTIGE */}
      <footer className="bg-[#F4F1EA] border-t border-[#D1C7B7] py-4 text-center text-xs text-[#8B8378]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-sans text-[11px]">
          <span className="tracking-wider uppercase">
            <strong className="text-[#0A192F]">Casa Blanca Personal</strong> • Despacho Ejecutivo offline
          </span>
          <span className="opacity-70 italic font-serif">
            Confidencial • Almacenamiento Local Cifrado
          </span>
        </div>
      </footer>
      <div className="h-1 bg-[#C5A059]"></div>
    </div>
  );
}

export default App;

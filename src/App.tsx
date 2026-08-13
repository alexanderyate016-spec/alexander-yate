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
import { ChiefOfStaffView } from './offices/chiefOfStaff/ChiefOfStaffView';
import { AgendaView } from './offices/agenda/AgendaView';
import { ToastContainer, showToast } from './components/executive';

export function App() {
  const [state, setState] = useState<MasterState>(storeInstance.getState());
  const [activeOffice, setActiveOffice] = useState<string>('ovalOffice');

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
    { key: 'jefaturaGabinete', label: 'Oficina de Agenda', emoji: '🗓️' },
    { key: 'academica', label: 'Académica', emoji: '🎓' },
    { key: 'vidaDiaria', label: 'Gestión Personal', emoji: '🌿' },
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

      {/* 1. NAVEGACIÓN DE OFICINAS */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 py-2.5 overflow-x-auto">
            {navItems.map(item => {
              const isActive = activeOffice === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveOffice(item.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-150 ${
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
          {activeOffice === 'jefaturaGabinete' && (
            <ChiefOfStaffView
              state={state}
              onNavigateToOffice={officeKey => setActiveOffice(officeKey)}
            />
          )}
          {activeOffice === 'agenda' && (
            <AgendaView
              state={state}
              onNavigateToOffice={officeKey => setActiveOffice(officeKey)}
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

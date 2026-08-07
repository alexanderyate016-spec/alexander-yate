import React from 'react';
import { MasterState } from '../../types/store';
import {
  BookOpen,
  Landmark,
  Stethoscope,
  BrainCircuit,
  Settings,
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: MasterState;
  onNavigateToOffice: (officeKey: string) => void;
}

export const MacBookModal: React.FC<Props> = ({
  isOpen,
  onClose,
  state,
  onNavigateToOffice
}) => {
  if (!isOpen) return null;

  const userName = state.security.userProfile?.fullName || state.security.profile?.name || 'Alex';

  // Extract REAL metrics from store (NEVER fake data)
  const academicSubjects = state.offices.academica?.subjects || [];
  const academicSummary = academicSubjects.length > 0
    ? `${academicSubjects.length} asignaturas activas`
    : 'Sin información registrada.';

  const financialAccounts = state.offices.financiera?.accounts || [];
  const totalBalance = financialAccounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
  const financialSummary = financialAccounts.length > 0
    ? `${financialAccounts.length} cuentas registradas ($${totalBalance.toLocaleString()} COP)`
    : 'Sin información registrada.';

  const medicalAppointments = state.offices.medica?.appointments || [];
  const medicalSummary = medicalAppointments.length > 0
    ? `${medicalAppointments.length} citas / controles registrados`
    : 'Sin información registrada.';

  const habits = state.offices.vidaDiaria?.habits || [];
  const tasks = state.offices.vidaDiaria?.tasks || [];
  const intelligenceSummary = (habits.length > 0 || tasks.length > 0)
    ? `${habits.length} hábitos y ${tasks.length} tareas monitoreadas`
    : 'Sin información registrada.';

  const securityStatus = state.security.isLocked ? 'Bloqueado' : 'Protección Activa';

  const macOfficeCards = [
    {
      key: 'academica',
      title: 'Oficina Académica',
      subtitle: academicSummary,
      icon: BookOpen,
      color: 'from-blue-600/30 to-indigo-600/20 border-blue-500/30 text-blue-300'
    },
    {
      key: 'financiera',
      title: 'Oficina Financiera',
      subtitle: financialSummary,
      icon: Landmark,
      color: 'from-[#C5A059]/30 to-amber-700/20 border-[#C5A059]/40 text-[#C5A059]'
    },
    {
      key: 'medica',
      title: 'Oficina Médica',
      subtitle: medicalSummary,
      icon: Stethoscope,
      color: 'from-emerald-600/30 to-teal-600/20 border-emerald-500/30 text-emerald-300'
    },
    {
      key: 'inteligencia',
      title: 'Centro de Inteligencia',
      subtitle: intelligenceSummary,
      icon: BrainCircuit,
      color: 'from-purple-600/30 to-pink-600/20 border-purple-500/30 text-purple-300'
    },
    {
      key: 'seguridad',
      title: 'Configuración',
      subtitle: `Seguridad y Ajustes • ${securityStatus}`,
      icon: Settings,
      color: 'from-slate-600/30 to-zinc-600/20 border-slate-500/30 text-slate-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      {/* MACBOOK DISPLAY CASING FRAME */}
      <div className="relative w-full max-w-4xl bg-[#1e1e1e] border-4 border-[#333] rounded-[24px] shadow-2xl overflow-hidden text-white flex flex-col min-h-[520px] max-h-[90vh]">
        
        {/* MACBOOK TOP BEZEL & NOTCH */}
        <div className="bg-slate-100 h-7 w-full flex items-center justify-between px-4 text-[11px] text-slate-500 font-sans border-b border-slate-200 select-none">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors" title="Cerrar MacBook" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="ml-3 font-semibold text-slate-800"> CasaBlanca OS • Executive Desktop</span>
          </div>

          {/* Notch center */}
          <div className="w-16 h-3 bg-black rounded-b-md mx-auto hidden sm:block border-x border-b border-slate-200"></div>

          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>100% 🔋</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* MACBOOK SCREEN WALLPAPER & DASHBOARD CONTENT */}
        <div className="flex-1 bg-gradient-to-br from-[#0a1128] via-[#001f3f] to-[#0a0f1d] p-6 sm:p-8 overflow-y-auto relative">
          
          {/* Subtle macOS wallpaper mesh glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* HEADER SECTION INSIDE MACBOOK */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-mono font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Dashboard General
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight">
                Bienvenido, <span className="text-[#C5A059]">{userName}</span>
              </h2>
              <p className="text-xs text-slate-700 mt-1 font-sans">
                Resumen Ejecutivo • Monitoreo central de sistemas de Casa Blanca
              </p>
            </div>

            <button
              onClick={onClose}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-white text-xs font-medium transition-all border border-slate-200 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cerrar Pantalla
            </button>
          </div>

          {/* CARDS GRID FOR OFFICES */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {macOfficeCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  onClick={() => {
                    onClose();
                    onNavigateToOffice(card.key);
                  }}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-xl border hover:scale-[1.02] transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 group-hover:bg-slate-50 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-serif mb-1 group-hover:text-amber-200 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-700 font-sans leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-[11px] text-slate-500 font-mono italic">
            * Toda la información proviene directamente del CasaBlancaStore sincronizado.
          </div>
        </div>

        {/* MACBOOK BOTTOM CHIN */}
        <div className="bg-slate-50 py-1.5 text-center text-[10px] font-mono text-slate-700 border-t border-slate-100">
          MacBook Pro • Casa Blanca Personal Executive Hardware
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FinancialOfficeData,
  CurrencyCode,
  QuincenalBudgetItem,
  QuincenalPeriodRecord
} from '../../types/store';
import { FinancialStore } from './FinancialStore';
import { FinancialCalculations } from './FinancialCalculations';
import { formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Wallet,
  TrendingDown,
  TrendingUp,
  Percent,
  Sliders,
  History,
  Lock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Zap,
  ArrowLeftRight,
  Info,
  Clock
} from 'lucide-react';

interface Props {
  data: FinancialOfficeData;
  todayStr: string;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'danger' | 'error') => void;
}

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; bar: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500', badge: 'bg-purple-950/60 text-purple-300 border-purple-500/30' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500', badge: 'bg-blue-950/60 text-blue-300 border-blue-500/30' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', bar: 'bg-rose-500', badge: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', bar: 'bg-indigo-500', badge: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', bar: 'bg-teal-500', badge: 'bg-teal-950/60 text-teal-300 border-teal-500/30' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', bar: 'bg-cyan-500', badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' }
};

const PALETTE_COLORS = ['emerald', 'purple', 'blue', 'amber', 'rose', 'teal', 'indigo', 'cyan'];

export function FinancialDistributionView({ data, todayStr, triggerToast }: Props) {
  const currency: CurrencyCode = 'COP';

  // 1. Sincronización automática de periodos quincenales (1-15 y 16-30/31)
  useEffect(() => {
    FinancialStore.syncQuincenalPeriod(todayStr);
  }, [todayStr, data.transactions]);

  // Tab activo dentro de la vista de presupuestos
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'history'>('current');

  // Información del ciclo quincenal actual
  const currentPeriodInfo = useMemo(() => {
    return FinancialCalculations.getQuincenalPeriodInfo(todayStr);
  }, [todayStr]);

  const qbState = data.quincenalBudgets;
  const periodHistory = qbState?.periodHistory || [];

  // Periodo quincenal activo
  const currentPeriod = useMemo(() => {
    const found = periodHistory.find(p => p.id === currentPeriodInfo.id);
    if (found) return found;

    // Fallback reactivo si aún se está inicializando
    const prevInfo = FinancialCalculations.getPreviousQuincenalPeriodInfo(todayStr);
    const prevIncome = FinancialCalculations.calculateQuincenalIncome(data.transactions || [], currency, prevInfo.startDate, prevInfo.endDate);
    const prevExpenses = FinancialCalculations.calculateQuincenalExpenses(data.transactions || [], currency, prevInfo.startDate, prevInfo.endDate);
    const leftoverPrev = Math.max(0, prevIncome - prevExpenses);
    const curIncome = FinancialCalculations.calculateQuincenalIncome(data.transactions || [], currency, currentPeriodInfo.startDate, currentPeriodInfo.endDate);

    return {
      id: currentPeriodInfo.id,
      year: currentPeriodInfo.year,
      month: currentPeriodInfo.month,
      quincena: currentPeriodInfo.quincena,
      startDate: currentPeriodInfo.startDate,
      endDate: currentPeriodInfo.endDate,
      periodLabel: currentPeriodInfo.periodLabel,
      isClosed: false,
      newIncome: curIncome,
      leftoverFromPrevious: leftoverPrev,
      totalAvailable: curIncome,
      budgets: [
        { id: 'bdg_necesarios', name: 'Gastos Necesarios', allocatedAmount: 0, emoji: '🏠', color: 'emerald' },
        { id: 'bdg_personales', name: 'Gastos Personales', allocatedAmount: 0, emoji: '💳', color: 'purple' },
        { id: 'bdg_ahorro', name: 'Ahorro', allocatedAmount: 0, emoji: '🏦', color: 'blue' }
      ],
      totalAllocated: 0,
      freeUnallocated: curIncome,
      totalSpent: 0,
      leftover: curIncome
    } as QuincenalPeriodRecord;
  }, [periodHistory, currentPeriodInfo, data.transactions, todayStr]);

  // Cálculos en tiempo real para la quincena actual
  const actualPeriodSpent = useMemo(() => {
    return FinancialCalculations.calculateQuincenalExpenses(
      data.transactions || [],
      currency,
      currentPeriod.startDate,
      currentPeriod.endDate
    );
  }, [data.transactions, currency, currentPeriod.startDate, currentPeriod.endDate]);

  const budgetsWithSpent = useMemo(() => {
    return (currentPeriod.budgets || []).map(b => {
      const spent = FinancialCalculations.calculateQuincenalBudgetItemSpent(
        b,
        data.transactions || [],
        currency,
        currentPeriod.startDate,
        currentPeriod.endDate
      );
      const allocated = b.allocatedAmount || 0;
      const remaining = allocated - spent;
      const percentUsed = allocated > 0 ? (spent / allocated) * 100 : (spent > 0 ? 100 : 0);
      return {
        ...b,
        spentAmount: spent,
        remaining,
        percentUsed
      };
    });
  }, [currentPeriod.budgets, data.transactions, currency, currentPeriod.startDate, currentPeriod.endDate]);

  const totalAllocated = useMemo(() => {
    return budgetsWithSpent.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  }, [budgetsWithSpent]);

  const freeUnallocated = Math.max(0, currentPeriod.totalAvailable - totalAllocated);
  const totalLeftoverProjected = Math.max(0, currentPeriod.totalAvailable - actualPeriodSpent);

  // Cálculo de progreso de días en la quincena
  const dayProgress = useMemo(() => {
    const parts = todayStr.split('-');
    const day = parseInt(parts[2], 10) || 1;
    if (currentPeriod.quincena === 1) {
      const clamped = Math.min(15, Math.max(1, day));
      return { currentDay: clamped, totalDays: 15, pct: (clamped / 15) * 100 };
    } else {
      const daysInMonth = currentPeriodInfo.daysInMonth;
      const totalDays = daysInMonth - 15;
      const currentDay = Math.min(daysInMonth, Math.max(16, day)) - 15;
      return { currentDay, totalDays, pct: (currentDay / totalDays) * 100 };
    }
  }, [todayStr, currentPeriod.quincena, currentPeriodInfo.daysInMonth]);

  // Modales
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
  const [isQuickExpenseModalOpen, setIsQuickExpenseModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [isEditLeftoverModalOpen, setIsEditLeftoverModalOpen] = useState(false);
  const [isTransferSaldoLibreModalOpen, setIsTransferSaldoLibreModalOpen] = useState(false);

  // Estados de formularios
  const [editingBudget, setEditingBudget] = useState<QuincenalBudgetItem | null>(null);
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState<number | ''>('');
  const [budgetEmoji, setBudgetEmoji] = useState('💼');
  const [budgetColor, setBudgetColor] = useState('emerald');

  // Estado del modal de distribución masiva
  const [distributeAllocations, setDistributeAllocations] = useState<Record<string, number>>({});

  // Estado de gasto rápido
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseBudgetId, setExpenseBudgetId] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAccountId, setExpenseAccountId] = useState(data.accounts?.[0]?.id || '');

  // Estado de edición y registro de ingresos
  const [incomeMode, setIncomeMode] = useState<'register' | 'manual'>('register');
  const [incomeTxDate, setIncomeTxDate] = useState(todayStr);
  const [incomeTxAmount, setIncomeTxAmount] = useState<number | ''>('');
  const [incomeTxSourceName, setIncomeTxSourceName] = useState('Sueldo / Honorarios');
  const [incomeTxAccountId, setIncomeTxAccountId] = useState(data.accounts?.[0]?.id || '');
  const [incomeTxDesc, setIncomeTxDesc] = useState('');
  const [customIncomeInput, setCustomIncomeInput] = useState<number | ''>('');
  const [customLeftoverInput, setCustomLeftoverInput] = useState<number | ''>('');

  // Estado de transferencia explícita de Saldo Libre
  const [transferAmountInput, setTransferAmountInput] = useState<number | ''>('');
  const [transferTargetBudgetId, setTransferTargetBudgetId] = useState<string>('pool');

  // Acordeón de periodos históricos expandidos
  const [expandedHistoryPeriods, setExpandedHistoryPeriods] = useState<Record<string, boolean>>({});

  // Abrir modal de transferencia de saldo libre
  const handleOpenTransferSaldoLibre = () => {
    setTransferAmountInput(currentPeriod.leftoverFromPrevious > 0 ? currentPeriod.leftoverFromPrevious : '');
    setTransferTargetBudgetId(currentPeriod.budgets?.[0]?.id || 'pool');
    setIsTransferSaldoLibreModalOpen(true);
  };

  const handleSaveTransferSaldoLibre = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(transferAmountInput);
    if (isNaN(amount) || amount <= 0) {
      triggerToast('Ingresa un monto válido mayor a 0', 'warning');
      return;
    }
    if (amount > currentPeriod.leftoverFromPrevious) {
      triggerToast(`El monto no puede superar el saldo libre disponible (${formatCurrency(currentPeriod.leftoverFromPrevious, currency)})`, 'warning');
      return;
    }

    if (transferTargetBudgetId === 'pool') {
      FinancialStore.transferSaldoLibreToPool(currentPeriod.id, amount);
      triggerToast(`Se transfirieron ${formatCurrency(amount, currency)} del Saldo Libre al presupuesto disponible de la quincena`, 'success');
    } else {
      const targetBudget = currentPeriod.budgets.find(b => b.id === transferTargetBudgetId);
      FinancialStore.transferSaldoLibreToBudget(currentPeriod.id, transferTargetBudgetId, amount);
      triggerToast(`Se transfirieron ${formatCurrency(amount, currency)} del Saldo Libre a "${targetBudget?.name || 'Presupuesto'}"`, 'success');
    }
    setIsTransferSaldoLibreModalOpen(false);
  };

  // Abrir modal de distribución masiva
  const handleOpenDistributeModal = () => {
    const initial: Record<string, number> = {};
    (currentPeriod.budgets || []).forEach(b => {
      initial[b.id] = b.allocatedAmount || 0;
    });
    setDistributeAllocations(initial);
    setIsDistributeModalOpen(true);
  };

  const handleSaveDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBudgets = (currentPeriod.budgets || []).map(b => ({
      ...b,
      allocatedAmount: Math.max(0, distributeAllocations[b.id] || 0)
    }));

    FinancialStore.updateQuincenalBudgets(currentPeriod.id, updatedBudgets);
    triggerToast('Distribución de presupuestos guardada correctamente', 'success');
    setIsDistributeModalOpen(false);
  };

  // Abrir modal para crear presupuesto
  const handleOpenAddBudget = () => {
    setEditingBudget(null);
    setBudgetName('');
    setBudgetAmount('');
    setBudgetEmoji('🏷️');
    setBudgetColor(PALETTE_COLORS[(currentPeriod.budgets?.length || 0) % PALETTE_COLORS.length]);
    setIsAddBudgetModalOpen(true);
  };

  const handleOpenEditBudget = (item: QuincenalBudgetItem) => {
    setEditingBudget(item);
    setBudgetName(item.name);
    setBudgetAmount(item.allocatedAmount || 0);
    setBudgetEmoji(item.emoji || '🏷️');
    setBudgetColor(item.color || 'emerald');
    setIsEditBudgetModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName.trim()) return;

    const amountNum = Number(budgetAmount) || 0;

    if (editingBudget) {
      const updated = (currentPeriod.budgets || []).map(b =>
        b.id === editingBudget.id
          ? { ...b, name: budgetName.trim(), allocatedAmount: amountNum, emoji: budgetEmoji, color: budgetColor }
          : b
      );
      FinancialStore.updateQuincenalBudgets(currentPeriod.id, updated);
      triggerToast(`Presupuesto "${budgetName}" actualizado`, 'success');
      setIsEditBudgetModalOpen(false);
    } else {
      FinancialStore.addQuincenalBudgetItem(currentPeriod.id, {
        name: budgetName.trim(),
        allocatedAmount: amountNum,
        emoji: budgetEmoji,
        color: budgetColor,
        categoryName: budgetName.trim()
      });
      triggerToast(`Presupuesto "${budgetName}" creado exitosamente`, 'success');
      setIsAddBudgetModalOpen(false);
    }
  };

  const handleDeleteBudget = (id: string, name: string) => {
    FinancialStore.deleteQuincenalBudgetItem(currentPeriod.id, id);
    triggerToast(`Presupuesto "${name}" eliminado`, 'info');
  };

  // Guardar gasto rápido en quincena
  const handleOpenQuickExpense = (budgetId?: string) => {
    setExpenseBudgetId(budgetId || currentPeriod.budgets?.[0]?.id || '');
    setExpenseAmount('');
    setExpenseDesc('');
    setExpenseAccountId(data.accounts?.[0]?.id || '');
    setIsQuickExpenseModalOpen(true);
  };

  const handleSaveQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expenseBudgetId) {
      triggerToast('Ingresa un monto y selecciona presupuesto', 'warning');
      return;
    }

    const targetBudget = currentPeriod.budgets.find(b => b.id === expenseBudgetId);
    const selectedAccId = expenseAccountId || data.accounts?.[0]?.id || '';

    FinancialStore.addTransaction({
      date: todayStr,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }),
      description: expenseDesc.trim() || `${targetBudget?.emoji || '💸'} Gasto en ${targetBudget?.name || 'Presupuesto'}`,
      amount: Number(expenseAmount),
      nature: 'external_expense',
      accountId: selectedAccId,
      sourceAccountId: selectedAccId,
      currency: currency,
      budgetId: expenseBudgetId,
      categoryId: targetBudget?.name || 'Presupuesto',
      beneficiaryName: targetBudget?.name || 'Gasto Quincenal'
    });

    triggerToast(`Gasto de ${formatCurrency(Number(expenseAmount), currency)} registrado`, 'success');
    setIsQuickExpenseModalOpen(false);
  };

  // Abrir modal para registrar ingreso con fecha recibida
  const handleOpenRegisterIncome = () => {
    setIncomeMode('register');
    setIncomeTxDate(todayStr);
    setIncomeTxAmount('');
    setIncomeTxSourceName('Sueldo / Honorarios');
    setIncomeTxAccountId(data.accounts?.[0]?.id || '');
    setIncomeTxDesc('');
    setIsEditIncomeModalOpen(true);
  };

  // Guardar registro de transacción de ingreso con asignación automática por fecha
  const handleRegisterIncomeTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(incomeTxAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast('Ingresa un monto válido para el ingreso', 'warning');
      return;
    }

    const targetDate = incomeTxDate || todayStr;
    const detectedPeriod = FinancialCalculations.getQuincenalPeriodInfo(targetDate);
    const destAccId = incomeTxAccountId || data.accounts?.[0]?.id || '';

    FinancialStore.addTransaction({
      date: targetDate,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }),
      nature: 'external_income',
      amount,
      currency,
      accountId: destAccId,
      destinationAccountId: destAccId,
      sourceName: incomeTxSourceName.trim() || 'Ingreso',
      description: incomeTxDesc.trim() || `Ingreso de ${incomeTxSourceName.trim() || 'Quincena'}`,
      quincenaPeriodId: detectedPeriod.id
    });

    triggerToast(`Ingreso de ${formatCurrency(amount, currency)} registrado en ${detectedPeriod.periodLabel}`, 'success');
    setIsEditIncomeModalOpen(false);
  };

  // Guardar nuevo ingreso manual de referencia
  const handleSaveCustomIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customIncomeInput);
    if (isNaN(val) || val < 0) return;
    FinancialStore.setQuincenalIncome(currentPeriod.id, val);
    triggerToast(`Nuevo ingreso de la quincena actualizado a ${formatCurrency(val, currency)}`, 'success');
    setIsEditIncomeModalOpen(false);
  };

  // Guardar ajuste de sobrante anterior
  const handleSaveCustomLeftover = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customLeftoverInput);
    if (isNaN(val) || val < 0) return;
    FinancialStore.setQuincenalLeftover(currentPeriod.id, val);
    triggerToast(`Dinero sobrante anterior actualizado a ${formatCurrency(val, currency)}`, 'success');
    setIsEditLeftoverModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. CABECERA EJECUTIVA Y NAVEGADOR DE QUINCENAS */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        {/* Specular Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ciclos Quincenales Automáticos (1–15 y 16–30/31)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white flex items-center gap-2.5">
              <span>{currentPeriod.periodLabel}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                🟢 Quincena Activa
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              Periodo del <strong>{currentPeriod.startDate}</strong> al <strong>{currentPeriod.endDate}</strong> • Día <strong>{dayProgress.currentDay}</strong> de {dayProgress.totalDays} transcurrido ({Math.round(dayProgress.pct)}%)
            </p>
          </div>

          {/* Sub-tab Switcher (Quincena Actual vs Historial) */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('current')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'current'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Quincena Actual</span>
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial ({periodHistory.length})</span>
            </button>
          </div>
        </div>

        {/* 2. REGLA FUNDAMENTAL & FLUJO DE DINERO QUINCENAL */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* A. NUEVO INGRESO DE LA QUINCENA */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Nuevo Ingreso
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleOpenRegisterIncome}
                  className="text-[10px] text-emerald-200 hover:text-white px-2 py-0.5 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 transition-colors font-bold flex items-center gap-1 border border-emerald-500/40"
                  title="Registrar ingreso recibido con fecha"
                >
                  <Plus className="w-3 h-3" /> Registrar
                </button>
                <button
                  onClick={() => {
                    setIncomeMode('manual');
                    setCustomIncomeInput(currentPeriod.newIncome);
                    setIsEditIncomeModalOpen(true);
                  }}
                  className="text-[10px] text-emerald-300 hover:text-white px-1.5 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors font-medium flex items-center gap-1"
                  title="Ajustar monto de referencia"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-emerald-400 tracking-tight">
                {formatCurrency(currentPeriod.newIncome, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recibido exclusivamente en este periodo ({currentPeriod.startDate.substring(5)} al {currentPeriod.endDate.substring(5)})
              </p>
            </div>
          </div>

          {/* B. PRESUPUESTO PARA ASIGNAR */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-400" />
                Presupuesto para Asignar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                Base Independiente
              </span>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-white tracking-tight">
                {formatCurrency(currentPeriod.totalAvailable, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Presupuesto disponible de esta quincena (= Nuevo ingreso)
              </p>
            </div>
          </div>

          {/* C. SALDO LIBRE ACUMULADO (CONSERVADO POR SEPARADO) */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Saldo Libre Acumulado
              </span>
              <div className="flex items-center gap-1">
                {currentPeriod.leftoverFromPrevious > 0 && (
                  <button
                    onClick={handleOpenTransferSaldoLibre}
                    className="text-[10px] text-amber-200 hover:text-white px-2 py-0.5 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 transition-colors font-bold flex items-center gap-1 border border-amber-500/40"
                    title="Transferir explícitamente a un presupuesto o al disponible"
                  >
                    <ArrowLeftRight className="w-3 h-3" /> Usar
                  </button>
                )}
                <button
                  onClick={() => {
                    setCustomLeftoverInput(currentPeriod.leftoverFromPrevious);
                    setIsEditLeftoverModalOpen(true);
                  }}
                  className="text-[10px] text-amber-300 hover:text-white px-1.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 transition-colors font-medium flex items-center gap-1"
                  title="Ajustar dinero sobrante acumulado"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-amber-400 tracking-tight">
                {formatCurrency(currentPeriod.leftoverFromPrevious, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sobrante separado de quincenas anteriores (no se suma automáticamente)
              </p>
            </div>
          </div>

          {/* D. DISPONIBLE SIN ASIGNAR */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Disponible sin Asignar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                {currentPeriod.totalAvailable > 0 ? Math.round((freeUnallocated / currentPeriod.totalAvailable) * 100) : 0}%
              </span>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-cyan-300 tracking-tight">
                {formatCurrency(freeUnallocated, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {freeUnallocated > 0 ? 'Disponible para distribuir en presupuestos' : 'Todo el presupuesto fue asignado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISTA PRINCIPAL: QUINCENA ACTUAL */}
      {activeSubTab === 'current' && (
        <div className="space-y-6">
          {/* BARRA DE ACCIÓN Y CONTROL DE PRESUPUESTOS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Mis Presupuestos del Periodo</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {budgetsWithSpent.length} Categorías
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Asignado: <strong>{formatCurrency(totalAllocated, currency)}</strong> • Gastado en esta quincena: <strong>{formatCurrency(actualPeriodSpent, currency)}</strong> • Sobrante proyectado: <strong>{formatCurrency(totalLeftoverProjected, currency)}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleOpenDistributeModal}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>Distribuir Dinero</span>
              </button>

              <button
                onClick={handleOpenAddBudget}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all border border-slate-200 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Presupuesto</span>
              </button>

              <button
                onClick={() => handleOpenQuickExpense()}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-all border border-emerald-200 flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>+ Registrar Gasto</span>
              </button>
            </div>
          </div>

          {/* LISTA DE PRESUPUESTOS DE LA QUINCENA */}
          {budgetsWithSpent.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No hay presupuestos creados para esta quincena</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Crea tus presupuestos (ej. Gastos necesarios, Gastos personales, Ahorro) y distribuye tus ingresos para mantener un control financiero estricto.
              </p>
              <button
                onClick={handleOpenAddBudget}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Crear Primer Presupuesto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetsWithSpent.map((budget, idx) => {
                const colorTheme = COLOR_CLASSES[budget.color || 'emerald'] || COLOR_CLASSES.emerald;
                const isOverBudget = budget.spentAmount > budget.allocatedAmount && budget.allocatedAmount > 0;
                const isUnassigned = budget.allocatedAmount === 0;

                return (
                  <div
                    key={budget.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* TOP INFO & BADGE */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs ${colorTheme.bg} border ${colorTheme.border}`}>
                          {budget.emoji || '💼'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {budget.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {budget.allocatedAmount > 0
                              ? `${Math.round(budget.percentUsed)}% del presupuesto consumido`
                              : 'Sin asignar ($0)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditBudget(budget)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Editar presupuesto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id, budget.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar presupuesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Asignado</span>
                        <strong className="text-xs font-bold text-slate-900">
                          {formatCurrency(budget.allocatedAmount, currency)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Gastado</span>
                        <strong className={`text-xs font-bold ${budget.spentAmount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatCurrency(budget.spentAmount, currency)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Disponible</span>
                        <strong className={`text-xs font-bold ${budget.remaining < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {formatCurrency(budget.remaining, currency)}
                        </strong>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span>Consumo de la quincena</span>
                        <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {Math.round(budget.percentUsed)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget ? 'bg-rose-500' : colorTheme.bar
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, budget.percentUsed))}%` }}
                        />
                      </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenQuickExpense(budget.id)}
                        className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar Gasto
                      </button>

                      {isOverBudget && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Sobrepasado
                        </span>
                      )}
                      {isUnassigned && (
                        <span className="text-[10px] font-medium text-slate-400 italic">
                          Pendiente distribuir
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. VISTA DE HISTORIAL: PERIODOS QUINCENALES CERRADOS */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <span>Historial de Quincenas Cerradas</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro histórico de todos tus ciclos de pago, ingresos, presupuestos asignados, gastos y sobrantes acumulados.
              </p>
            </div>
          </div>

          {periodHistory.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No hay periodos históricos archivados todavía</h3>
              <p className="text-xs text-slate-500">
                Cada vez que termine una quincena (día 15 y día 30/31), se archivará automáticamente aquí con su balance final.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {periodHistory.map((period) => {
                const isExpanded = expandedHistoryPeriods[period.id] || false;
                const isCurrent = period.id === currentPeriodInfo.id;

                return (
                  <div
                    key={period.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* PERIOD HEADER */}
                    <div
                      onClick={() => setExpandedHistoryPeriods(prev => ({ ...prev, [period.id]: !prev[period.id] }))}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCurrent ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isCurrent ? '🟢' : '🔒'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 uppercase">
                              {period.periodLabel}
                            </h3>
                            {isCurrent ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                En Curso
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Cerrada
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Del {period.startDate} al {period.endDate}
                          </p>
                        </div>
                      </div>

                      {/* SUMMARY PILLS */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Ingreso + Sobrante</span>
                          <strong>{formatCurrency(period.totalAvailable, currency)}</strong>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Presupuestado</span>
                          <strong>{formatCurrency(period.totalAllocated, currency)}</strong>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                          <span className="text-[10px] text-rose-500 font-semibold uppercase block">Gastado</span>
                          <strong>{formatCurrency(period.totalSpent, currency)}</strong>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                          <span className="text-[10px] text-emerald-600 font-semibold uppercase block">Sobrante Final</span>
                          <strong>{formatCurrency(period.leftover, currency)}</strong>
                        </div>

                        <div className="text-slate-400 p-1">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED BREAKDOWN */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Nuevo Ingreso Recibido</span>
                              <strong className="text-sm font-bold text-emerald-600">
                                {formatCurrency(period.newIncome, currency)}
                              </strong>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sobrante Heredado Anterior</span>
                              <strong className="text-sm font-bold text-amber-600">
                                {formatCurrency(period.leftoverFromPrevious, currency)}
                              </strong>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Dinero Libre No Asignado</span>
                              <strong className="text-sm font-bold text-cyan-600">
                                {formatCurrency(period.freeUnallocated, currency)}
                              </strong>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Presupuestos Asignados en este Periodo
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {(period.budgets || []).map(b => (
                                <div key={b.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span>{b.emoji || '💼'}</span>
                                    <span className="text-xs font-bold text-slate-800">{b.name}</span>
                                  </div>
                                  <span className="text-xs font-bold text-slate-900">
                                    {formatCurrency(b.allocatedAmount, currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: DISTRIBUCIÓN MASIVA DE PRESUPUESTOS              */}
      {/* ========================================================= */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Distribuir Dinero de la Quincena</h3>
                <p className="text-xs text-slate-500">
                  Total disponible para distribuir: <strong>{formatCurrency(currentPeriod.totalAvailable, currency)}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsDistributeModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDistribution} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1 text-xs text-purple-900">
                <div className="font-bold flex items-center gap-1.5 text-purple-950">
                  <Info className="w-4 h-4 text-purple-600" />
                  <span>Resumen de Distribución en Tiempo Real</span>
                </div>
                {(() => {
                  const currentSum = Object.values(distributeAllocations).reduce((acc, val) => acc + (val || 0), 0);
                  const remainingFree = currentPeriod.totalAvailable - currentSum;
                  return (
                    <div className="flex justify-between font-semibold pt-1">
                      <span>Total Asignado: <strong>{formatCurrency(currentSum, currency)}</strong></span>
                      <span className={remainingFree < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                        Libre Restante: <strong>{formatCurrency(remainingFree, currency)}</strong>
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-3">
                {(currentPeriod.budgets || []).map(b => (
                  <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{b.emoji || '💼'}</span>
                      <span className="text-xs font-bold text-slate-800">{b.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={distributeAllocations[b.id] !== undefined ? distributeAllocations[b.id] : ''}
                        onChange={e => {
                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                          setDistributeAllocations(prev => ({ ...prev, [b.id]: val }));
                        }}
                        className="w-36 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDistributeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all"
                >
                  Guardar Distribución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CREAR / EDITAR PRESUPUESTO                       */}
      {/* ========================================================= */}
      {(isAddBudgetModalOpen || isEditBudgetModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h3>
              <button
                onClick={() => {
                  setIsAddBudgetModalOpen(false);
                  setIsEditBudgetModalOpen(false);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  value={budgetName}
                  onChange={e => setBudgetName(e.target.value)}
                  placeholder="Ej. Gastos Necesarios, Ahorro, etc."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Emoji / Ícono</label>
                  <input
                    type="text"
                    value={budgetEmoji}
                    onChange={e => setBudgetEmoji(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Monto Asignado ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={budgetAmount}
                    onChange={e => setBudgetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Color Distintivo</label>
                <div className="flex gap-2">
                  {PALETTE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBudgetColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        budgetColor === c ? 'scale-110 border-slate-900 ring-2 ring-purple-400' : 'border-transparent'
                      } ${COLOR_CLASSES[c].bar}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBudgetModalOpen(false);
                    setIsEditBudgetModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all"
                >
                  {editingBudget ? 'Guardar Cambios' : 'Crear Presupuesto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: REGISTRO RÁPIDO DE GASTO EN QUINCENA             */}
      {/* ========================================================= */}
      {isQuickExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-600" />
                <span>Registrar Gasto en Quincena</span>
              </h3>
              <button
                onClick={() => setIsQuickExpenseModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickExpense} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Presupuesto Destino</label>
                <select
                  required
                  value={expenseBudgetId}
                  onChange={e => setExpenseBudgetId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {(currentPeriod.budgets || []).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.emoji} {b.name} (Disponible: {formatCurrency(b.allocatedAmount - (b.spentAmount || 0), currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Monto del Gasto ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  placeholder="Ej. Mercado quincenal, combustible, etc."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cuenta de Origen</label>
                <select
                  value={expenseAccountId}
                  onChange={e => setExpenseAccountId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  {(data.accounts || []).map(acc => (
                    <option key={acc.id} value={acc.id}>
                      💳 {acc.name} ({acc.institution})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
                >
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: REGISTRAR O AJUSTAR INGRESO DE LA QUINCENA       */}
      {/* ========================================================= */}
      {isEditIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ingreso Quincenal</h3>
                  <p className="text-xs text-slate-500">Asignación automática según la fecha recibida</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditIncomeModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setIncomeMode('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  incomeMode === 'register'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Ingreso Real</span>
              </button>
              <button
                type="button"
                onClick={() => setIncomeMode('manual')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  incomeMode === 'manual'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ajuste Manual</span>
              </button>
            </div>

            {incomeMode === 'register' ? (
              <form onSubmit={handleRegisterIncomeTx} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Fecha recibida *</label>
                    <input
                      type="date"
                      required
                      value={incomeTxDate}
                      onChange={e => setIncomeTxDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Monto del Ingreso ($) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1000"
                      value={incomeTxAmount}
                      onChange={e => setIncomeTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Quincena Detection Preview */}
                {(() => {
                  const targetDate = incomeTxDate || todayStr;
                  const detected = FinancialCalculations.getQuincenalPeriodInfo(targetDate);
                  const dayNum = parseInt(targetDate.split('-')[2], 10) || 1;
                  return (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Quincena asignada automáticamente:</span>
                      </div>
                      <p className="font-semibold">
                        🗓️ {detected.periodLabel} (Días {dayNum <= 15 ? '1 al 15' : '16 al fin de mes'})
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Este ingreso se asignará exclusivamente a este periodo y no se acumulará con quincenas anteriores.
                      </p>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Origen / Pagador</label>
                    <input
                      type="text"
                      value={incomeTxSourceName}
                      onChange={e => setIncomeTxSourceName(e.target.value)}
                      placeholder="Ej. Nómina empresa, Honorarios cliente"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Cuenta Destino</label>
                    <select
                      value={incomeTxAccountId}
                      onChange={e => setIncomeTxAccountId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {(data.accounts || []).map(acc => (
                        <option key={acc.id} value={acc.id}>
                          💳 {acc.name} ({acc.institution})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Concepto / Descripción (Opcional)</label>
                  <input
                    type="text"
                    value={incomeTxDesc}
                    onChange={e => setIncomeTxDesc(e.target.value)}
                    placeholder="Ej. Pago de primera quincena"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditIncomeModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Registrar Ingreso en Quincena</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveCustomIncome} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ajusta directamente el nuevo ingreso presupuestario asignado a la quincena activa (<strong>{currentPeriod.periodLabel}</strong>).
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Monto del Ingreso ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={customIncomeInput}
                    onChange={e => setCustomIncomeInput(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditIncomeModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
                  >
                    Guardar Ajuste
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: AJUSTAR SALDO LIBRE ACUMULADO                    */}
      {/* ========================================================= */}
      {isEditLeftoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Saldo Libre Acumulado</h3>
              <button
                onClick={() => setIsEditLeftoverModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomLeftover} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Este es el saldo libre acumulado de quincenas anteriores. Se conserva de manera independiente y no se suma automáticamente al presupuesto de la quincena actual.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Monto del Saldo Libre ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={customLeftoverInput}
                  onChange={e => setCustomLeftoverInput(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-amber-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditLeftoverModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all"
                >
                  Guardar Saldo Libre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: TRANSFERIR SALDO LIBRE A PRESUPUESTO             */}
      {/* ========================================================= */}
      {isTransferSaldoLibreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Transferir Saldo Libre</h3>
                  <span className="text-[11px] text-slate-500">Disponible: <strong>{formatCurrency(currentPeriod.leftoverFromPrevious, currency)}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setIsTransferSaldoLibreModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransferSaldoLibre} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Asigna explícitamente una porción de tu saldo libre acumulado a un presupuesto específico de esta quincena o al presupuesto disponible.
              </p>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Monto a Transferir ($)</label>
                  <div className="flex gap-1">
                    {[0.25, 0.5, 1].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTransferAmountInput(Math.round(currentPeriod.leftoverFromPrevious * pct))}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold transition-colors"
                      >
                        {pct === 1 ? 'Máx 100%' : `${pct * 100}%`}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={currentPeriod.leftoverFromPrevious}
                  step="1000"
                  value={transferAmountInput}
                  onChange={e => setTransferAmountInput(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-amber-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Destino de la Transferencia</label>
                <select
                  value={transferTargetBudgetId}
                  onChange={e => setTransferTargetBudgetId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pool">📥 Presupuesto Disponible General de la Quincena</option>
                  <optgroup label="Presupuestos Específicos">
                    {(currentPeriod.budgets || []).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.emoji} {b.name} (Asignado actual: {formatCurrency(b.allocatedAmount || 0, currency)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferSaldoLibreModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Transferir Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

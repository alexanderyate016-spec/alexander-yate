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
  Clock,
  Receipt,
  PieChart
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

const formatBudgetPercentage = (pct: number): string => {
  if (isNaN(pct) || pct <= 0) return '0%';
  const rounded = Number(pct.toFixed(1));
  return rounded % 1 === 0 ? `${rounded}%` : `${rounded.toFixed(1)}%`;
};

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

  // Periodo quincenal activo con fallback seguro basado en plantillas
  const currentPeriod = useMemo(() => {
    const found = periodHistory.find(p => p.id === currentPeriodInfo.id);
    if (found) return found;

    // Fallback reactivo si aún se está inicializando
    const prevInfo = FinancialCalculations.getPreviousQuincenalPeriodInfo(todayStr);
    const prevIncome = FinancialCalculations.calculateQuincenalIncome(data.transactions || [], currency, prevInfo.startDate, prevInfo.endDate, prevInfo.id);
    const prevExpenses = FinancialCalculations.calculateQuincenalExpenses(data.transactions || [], currency, prevInfo.startDate, prevInfo.endDate, prevInfo.id);
    const leftoverPrev = Math.max(0, prevIncome - prevExpenses);
    const curIncome = FinancialCalculations.calculateQuincenalIncome(data.transactions || [], currency, currentPeriodInfo.startDate, currentPeriodInfo.endDate, currentPeriodInfo.id);
    const curSpent = FinancialCalculations.calculateQuincenalExpenses(data.transactions || [], currency, currentPeriodInfo.startDate, currentPeriodInfo.endDate, currentPeriodInfo.id);
    const realAvail = Math.max(0, curIncome - curSpent);

    const templates = qbState?.budgetTemplates || [
      { id: 'necesarios', name: 'Gastos Necesarios', emoji: '🏠', color: 'emerald', defaultAmount: 42000 },
      { id: 'personales', name: 'Gastos Personales', emoji: '💳', color: 'purple', defaultAmount: 20000 },
      { id: 'ahorro', name: 'Ahorro', emoji: '🏦', color: 'blue', defaultAmount: 10000 }
    ];

    const fallbackBudgets = templates.map((t, idx) => ({
      id: 'bdg_' + (t.id || `item_${idx}`),
      name: t.name,
      allocatedAmount: Math.max(0, Math.floor(t.defaultAmount ?? 0)),
      spentAmount: 0,
      emoji: t.emoji || '💼',
      color: t.color || 'emerald',
      categoryName: t.name
    }));

    const totalAlloc = fallbackBudgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);

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
      totalAvailable: realAvail,
      budgets: fallbackBudgets,
      totalAllocated: totalAlloc,
      freeUnallocated: Math.max(0, realAvail - totalAlloc),
      totalSpent: curSpent,
      leftover: realAvail
    } as QuincenalPeriodRecord;
  }, [periodHistory, currentPeriodInfo, data.transactions, todayStr, currency, qbState?.budgetTemplates]);

  // 1. Ingreso de la quincena (Recibido en este periodo)
  const actualPeriodIncome = useMemo(() => {
    return FinancialCalculations.calculateQuincenalIncome(
      data.transactions || [],
      currency,
      currentPeriod.startDate,
      currentPeriod.endDate,
      currentPeriod.id
    );
  }, [data.transactions, currency, currentPeriod.startDate, currentPeriod.endDate, currentPeriod.id]);

  // 2. Gastos realizados de la quincena (Salidas registradas)
  const actualPeriodSpent = useMemo(() => {
    return FinancialCalculations.calculateQuincenalExpenses(
      data.transactions || [],
      currency,
      currentPeriod.startDate,
      currentPeriod.endDate,
      currentPeriod.id
    );
  }, [data.transactions, currency, currentPeriod.startDate, currentPeriod.endDate, currentPeriod.id]);

  // 3. Dinero disponible real = Ingresos de la quincena - Gastos de la quincena
  const realAvailable = Math.max(0, actualPeriodIncome - actualPeriodSpent);

  // 4. Base para el cálculo automático de porcentajes: (monto asignado / dinero disponible) * 100
  const rawTotalAllocated = useMemo(() => {
    return (currentPeriod.budgets || []).reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  }, [currentPeriod.budgets]);

  const baseForPercentages = useMemo(() => {
    if (realAvailable > 0) return realAvailable;
    if (rawTotalAllocated > 0) return rawTotalAllocated;
    if (actualPeriodIncome > 0) return actualPeriodIncome;
    return 0;
  }, [realAvailable, rawTotalAllocated, actualPeriodIncome]);

  // 5. Presupuestos con gasto individual y porcentaje calculado con la fórmula: (asignado / disponible) * 100
  const budgetsWithSpent = useMemo(() => {
    return (currentPeriod.budgets || []).map(b => {
      const spent = FinancialCalculations.calculateQuincenalBudgetItemSpent(
        b,
        data.transactions || [],
        currency,
        currentPeriod.startDate,
        currentPeriod.endDate,
        currentPeriod.id
      );
      const allocated = Math.max(0, Math.floor(b.allocatedAmount || 0));
      const remaining = allocated - spent;
      const percentUsed = allocated > 0 ? (spent / allocated) * 100 : (spent > 0 ? 100 : 0);
      const percentOfTotal = baseForPercentages > 0 ? (allocated / baseForPercentages) * 100 : 0;

      return {
        ...b,
        allocatedAmount: allocated,
        spentAmount: spent,
        remaining,
        percentUsed,
        percentOfTotal
      };
    });
  }, [currentPeriod.budgets, data.transactions, currency, currentPeriod.startDate, currentPeriod.endDate, currentPeriod.id, baseForPercentages]);

  // Total asignado consolidado
  const totalAllocated = useMemo(() => {
    return budgetsWithSpent.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  }, [budgetsWithSpent]);

  // Dinero disponible sin asignar
  const freeUnallocated = Math.max(0, realAvailable - totalAllocated);
  const totalLeftoverProjected = realAvailable;

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
    if (realAvailable <= 0) {
      triggerToast('No tienes dinero disponible para asignar en esta quincena ($0 disponible).', 'warning');
      return;
    }
    const initial: Record<string, number> = {};
    (currentPeriod.budgets || []).forEach(b => {
      initial[b.id] = b.allocatedAmount || 0;
    });
    setDistributeAllocations(initial);
    setIsDistributeModalOpen(true);
  };

  const handleSaveDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSum = Object.values(distributeAllocations).reduce((acc, val) => acc + (val || 0), 0);
    if (currentSum > realAvailable) {
      triggerToast(`No puedes asignar más de los ${formatCurrency(realAvailable, currency)} disponibles reales. El dinero gastado no puede volver a asignarse.`, 'error');
      return;
    }

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
                    setCustomIncomeInput(actualPeriodIncome);
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
                {formatCurrency(actualPeriodIncome, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recibido en esta quincena ({currentPeriod.startDate.substring(5)} al {currentPeriod.endDate.substring(5)})
              </p>
            </div>
          </div>

          {/* B. GASTOS REALIZADOS */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                Gastos Realizados
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {actualPeriodIncome > 0 ? Math.round((actualPeriodSpent / actualPeriodIncome) * 100) : 0}% consumido
              </span>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-rose-400 tracking-tight">
                {formatCurrency(actualPeriodSpent, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Salidas y compras registradas en este periodo
              </p>
            </div>
          </div>

          {/* C. DINERO DISPONIBLE REAL */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                Dinero Disponible Real
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                Saldo Real
              </span>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-amber-300 tracking-tight">
                {formatCurrency(realAvailable, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ingreso ({formatCurrency(actualPeriodIncome, currency)}) − Gastos ({formatCurrency(actualPeriodSpent, currency)})
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
                {realAvailable > 0 ? Math.round((freeUnallocated / realAvailable) * 100) : 0}% libre
              </span>
            </div>
            <div>
              <strong className="text-2xl font-black font-serif text-cyan-300 tracking-tight">
                {formatCurrency(freeUnallocated, currency)}
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {freeUnallocated > 0
                  ? `Disponible real − Asignado (${formatCurrency(totalAllocated, currency)})`
                  : 'Todo el dinero real fue asignado o gastado'}
              </p>
            </div>
          </div>
        </div>

        {/* BARRA INFORMATIVA DE SALDO LIBRE ACUMULADO (HISTORIAL SEPARADO) */}
        <div className="relative z-10 mt-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">
                  Saldo Libre Acumulado (Quincenas Anteriores):
                </span>
                <strong className="text-xs font-bold text-purple-400 font-serif">
                  {formatCurrency(currentPeriod.leftoverFromPrevious, currency)}
                </strong>
              </div>
              <p className="text-[10px] text-slate-400">
                Sobrante conservado independientemente de periodos cerrados (no contamina el cálculo del periodo actual).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentPeriod.leftoverFromPrevious > 0 && (
              <button
                onClick={handleOpenTransferSaldoLibre}
                className="text-[10px] text-purple-200 hover:text-white px-2.5 py-1 rounded-lg bg-purple-500/30 hover:bg-purple-500/50 transition-colors font-bold flex items-center gap-1 border border-purple-500/40"
                title="Transferir explícitamente a un presupuesto o al disponible"
              >
                <ArrowLeftRight className="w-3 h-3" /> Usar / Transferir
              </button>
            )}
            <button
              onClick={() => {
                setCustomLeftoverInput(currentPeriod.leftoverFromPrevious);
                setIsEditLeftoverModalOpen(true);
              }}
              className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors font-medium flex items-center gap-1 border border-slate-700"
              title="Ajustar saldo libre acumulado"
            >
              <Edit2 className="w-3 h-3" /> Ajustar
            </button>
          </div>
        </div>
      </div>

      {/* 3. VISTA PRINCIPAL: QUINCENA ACTUAL */}
      {activeSubTab === 'current' && (
        <div className="space-y-6">
          {/* BARRA DE ACCIÓN Y CONTROL DE PRESUPUESTOS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Mis Presupuestos del Periodo</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {budgetsWithSpent.length} Categorías
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Dinero Disponible: <strong className="text-slate-900 font-bold">{formatCurrency(realAvailable, currency)}</strong> • Asignado: <strong className="text-purple-700 font-bold">{formatCurrency(totalAllocated, currency)}</strong> ({formatBudgetPercentage(baseForPercentages > 0 ? (totalAllocated / baseForPercentages) * 100 : 0)}) • Gastado: <strong className="text-rose-600 font-bold">{formatCurrency(actualPeriodSpent, currency)}</strong>
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
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-200 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Presupuesto</span>
                </button>

                <button
                  onClick={() => handleOpenQuickExpense()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all border border-emerald-200 flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>+ Registrar Gasto</span>
                </button>
              </div>
            </div>

            {/* BARRA VISUAL DE DISTRIBUCIÓN GENERAL DE LA QUINCENA */}
            {budgetsWithSpent.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-purple-600" />
                    Distribución Visual del Dinero Disponible ({formatCurrency(baseForPercentages, currency)})
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Asignado: {formatBudgetPercentage(baseForPercentages > 0 ? (totalAllocated / baseForPercentages) * 100 : 0)}
                    {freeUnallocated > 0 && ` • Libre: ${formatCurrency(freeUnallocated, currency)}`}
                  </span>
                </div>

                {/* Stacked segmented visual bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                  {budgetsWithSpent.map(b => {
                    const colorTheme = COLOR_CLASSES[b.color || 'emerald'] || COLOR_CLASSES.emerald;
                    const pct = Math.min(100, Math.max(0, b.percentOfTotal));
                    if (pct <= 0) return null;
                    return (
                      <div
                        key={b.id}
                        className={`h-full transition-all duration-500 ${colorTheme.bar}`}
                        style={{ width: `${pct}%` }}
                        title={`${b.name}: ${formatCurrency(b.allocatedAmount, currency)} (${formatBudgetPercentage(pct)})`}
                      />
                    );
                  })}
                  {freeUnallocated > 0 && (
                    <div
                      className="h-full bg-slate-200 transition-all duration-500"
                      style={{ width: `${Math.min(100, (freeUnallocated / (baseForPercentages || 1)) * 100)}%` }}
                      title={`Sin asignar: ${formatCurrency(freeUnallocated, currency)}`}
                    />
                  )}
                </div>

                {/* Categories badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {budgetsWithSpent.map(b => {
                    const colorTheme = COLOR_CLASSES[b.color || 'emerald'] || COLOR_CLASSES.emerald;
                    return (
                      <div key={b.id} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorTheme.bar}`} />
                        <span>{b.emoji} {b.name}: <strong>{formatCurrency(b.allocatedAmount, currency)}</strong> ({formatBudgetPercentage(b.percentOfTotal)})</span>
                      </div>
                    );
                  })}
                  {freeUnallocated > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span>Sin Asignar: {formatCurrency(freeUnallocated, currency)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgetsWithSpent.map((budget) => {
                const colorTheme = COLOR_CLASSES[budget.color || 'emerald'] || COLOR_CLASSES.emerald;
                const isOverBudget = budget.spentAmount > budget.allocatedAmount && budget.allocatedAmount > 0;
                const isUnassigned = budget.allocatedAmount === 0;

                return (
                  <div
                    key={budget.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* TOP INFO & PORCENTAJE DEL TOTAL */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${colorTheme.bg} border ${colorTheme.border}`}>
                          {budget.emoji || '💼'}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                            {budget.name}
                          </h3>
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 inline-block mt-0.5">
                            {formatBudgetPercentage(budget.percentOfTotal)} del total
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

                    {/* HERO ASIGNACIÓN MONETARIA */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Presupuesto Asignado (Reservado)
                        </span>
                        <button
                          onClick={() => handleOpenEditBudget(budget)}
                          className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          Modificar
                        </button>
                      </div>
                      <div className="text-xl font-black text-slate-900 font-serif">
                        {formatCurrency(budget.allocatedAmount, currency)}
                      </div>
                    </div>

                    {/* DISTINCIÓN CLARA: PRESUPUESTO ASIGNADO vs GASTO REALIZADO vs RESTANTE */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 text-white shadow-xs text-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Asignado</span>
                        <strong className="text-xs font-black text-white font-serif">
                          {formatCurrency(budget.allocatedAmount, currency)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-rose-300 uppercase block">Gastado</span>
                        <strong className={`text-xs font-black font-serif ${budget.spentAmount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {formatCurrency(budget.spentAmount, currency)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-emerald-300 uppercase block">Restante</span>
                        <strong className={`text-xs font-black font-serif ${budget.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatCurrency(budget.remaining, currency)}
                        </strong>
                      </div>
                    </div>

                    {/* DUAL BARS: 1) % DEL TOTAL DISPONIBLE, 2) % CONSUMO DEL GASTO */}
                    <div className="space-y-3 pt-1">
                      {/* BARRA 1: PARTICIPACIÓN EN LA QUINCENA */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <PieChart className="w-3 h-3 text-slate-400" />
                            Peso en la Quincena
                          </span>
                          <span className="font-bold text-purple-700">
                            {formatBudgetPercentage(budget.percentOfTotal)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colorTheme.bar}`}
                            style={{ width: `${Math.min(100, Math.max(0, budget.percentOfTotal))}%` }}
                          />
                        </div>
                      </div>

                      {/* BARRA 2: CONSUMO DEL GASTO REALIZADO */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-slate-400" />
                            Gasto Ejecutado
                          </span>
                          <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-700 font-bold'}>
                            {Math.round(budget.percentUsed)}% ({formatCurrency(budget.spentAmount, currency)})
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
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenQuickExpense(budget.id)}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-purple-50"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Gasto
                      </button>

                      {isOverBudget && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Sobrepasado
                        </span>
                      )}
                      {isUnassigned && (
                        <span className="text-[10px] font-medium text-slate-400 italic">
                          $0 asignado
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
                  Dinero disponible real: <strong className="text-emerald-700">{formatCurrency(realAvailable, currency)}</strong>
                  <span className="text-[11px] text-slate-400 ml-1">
                    (Ingreso: {formatCurrency(actualPeriodIncome, currency)} − Gastos: {formatCurrency(actualPeriodSpent, currency)})
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsDistributeModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const currentSum = Object.values(distributeAllocations).reduce((acc, val) => acc + (val || 0), 0);
              const remainingFree = realAvailable - currentSum;
              const isOverAllocated = currentSum > realAvailable;

              return (
                <form onSubmit={handleSaveDistribution} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5 text-xs text-purple-900">
                    <div className="font-bold flex items-center justify-between text-purple-950">
                      <span className="flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-purple-600" />
                        Resumen de Distribución
                      </span>
                      <span className="text-[11px] font-semibold text-purple-700">
                        Tope Real: {formatCurrency(realAvailable, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between font-semibold pt-1">
                      <span>Total Asignado: <strong>{formatCurrency(currentSum, currency)}</strong></span>
                      <span className={remainingFree < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                        {remainingFree < 0 ? 'Excedido por: ' : 'Libre Restante: '}
                        <strong>{formatCurrency(Math.abs(remainingFree), currency)}</strong>
                      </span>
                    </div>

                    {isOverAllocated && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          No puedes asignar más de los {formatCurrency(realAvailable, currency)} disponibles reales. El dinero gastado ({formatCurrency(actualPeriodSpent, currency)}) ya no existe físicamente y no puede distribuirse.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(currentPeriod.budgets || []).map(b => {
                      const val = distributeAllocations[b.id] !== undefined ? distributeAllocations[b.id] : (b.allocatedAmount || 0);
                      return (
                        <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{b.emoji || '💼'}</span>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">{b.name}</span>
                              {b.spentAmount > 0 ? (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Gastado en este periodo: {formatCurrency(b.spentAmount, currency)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  Sin gastos registrados
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">$</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={val === 0 ? '' : val}
                                onChange={e => {
                                  const raw = e.target.value === '' ? 0 : Math.max(0, Math.floor(Number(e.target.value) || 0));
                                  setDistributeAllocations(prev => ({ ...prev, [b.id]: raw }));
                                }}
                                className="w-36 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-right text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                                placeholder="0"
                              />
                            </div>
                            <span className="text-[10px] text-purple-700 font-semibold">
                              {formatCurrency(val, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
                      disabled={isOverAllocated}
                      className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all ${
                        isOverAllocated
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      Guardar Distribución
                    </button>
                  </div>
                </form>
              );
            })()}
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
                  placeholder="Ej. Gastos necesarios, Gastos personales, Ahorro"
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
                    step="1"
                    value={budgetAmount}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value) || 0));
                      setBudgetAmount(val);
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  {budgetAmount !== '' && Number(budgetAmount) > 0 && (
                    <span className="text-[10px] font-bold text-purple-700 block">
                      {formatCurrency(Number(budgetAmount), currency)}
                    </span>
                  )}
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
                  step="1"
                  value={expenseAmount}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value) || 0));
                    setExpenseAmount(val);
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                {expenseAmount !== '' && Number(expenseAmount) > 0 && (
                  <span className="text-[10px] font-bold text-rose-600 block">
                    {formatCurrency(Number(expenseAmount), currency)}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Descripción (Opcional)</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  placeholder="Ej. Mercado quincenal, combustible, servicios, etc."
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
                      step="1"
                      value={incomeTxAmount}
                      onChange={e => {
                        const val = e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value) || 0));
                        setIncomeTxAmount(val);
                      }}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    {incomeTxAmount !== '' && Number(incomeTxAmount) > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        {formatCurrency(Number(incomeTxAmount), currency)}
                      </span>
                    )}
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
                    step="1"
                    value={customIncomeInput}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value) || 0));
                      setCustomIncomeInput(val);
                    }}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  {customIncomeInput !== '' && Number(customIncomeInput) > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 block">
                      {formatCurrency(Number(customIncomeInput), currency)}
                    </span>
                  )}
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
                  step="1"
                  value={customLeftoverInput}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value) || 0));
                    setCustomLeftoverInput(val);
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-amber-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {customLeftoverInput !== '' && Number(customLeftoverInput) > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 block">
                    {formatCurrency(Number(customLeftoverInput), currency)}
                  </span>
                )}
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
                  step="1"
                  value={transferAmountInput}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : Math.max(0, Math.floor(Number(e.target.value) || 0));
                    setTransferAmountInput(val);
                  }}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-base font-bold text-amber-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                {transferAmountInput !== '' && Number(transferAmountInput) > 0 && (
                  <span className="text-[10px] font-bold text-amber-700 block">
                    {formatCurrency(Number(transferAmountInput), currency)}
                  </span>
                )}
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

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FinancialOfficeData,
  FinancialFundPlan,
  FinancialCategoryPlan,
  FinancialSubcategoryPlan,
  CurrencyCode
} from '../../types/store';
import { FinancialStore } from './FinancialStore';
import { FinancialCalculations } from './FinancialCalculations';
import { formatCurrency } from '../../utils/formatters';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  DollarSign,
  Info,
  ArrowRightLeft,
  Zap,
  ShieldAlert,
  X,
  Wallet,
  TrendingDown,
  Percent,
  Sliders,
  Check
} from 'lucide-react';

interface Props {
  data: FinancialOfficeData;
  todayStr: string;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'danger' | 'error') => void;
}

// Visual color maps for categories
const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; fill: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', fill: '#10b981', ring: 'ring-emerald-500/40' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', fill: '#a855f7', ring: 'ring-purple-500/40' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', fill: '#f59e0b', ring: 'ring-amber-500/40' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', fill: '#3b82f6', ring: 'ring-blue-500/40' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', fill: '#f43f5e', ring: 'ring-rose-500/40' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', fill: '#6366f1', ring: 'ring-indigo-500/40' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', fill: '#14b8a6', ring: 'ring-teal-500/40' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', fill: '#06b6d4', ring: 'ring-cyan-500/40' }
};

const PALETTE_COLORS = ['emerald', 'purple', 'amber', 'blue', 'rose', 'indigo', 'teal', 'cyan'];

function getCategoryTheme(colorName?: string, index: number = 0) {
  const name = colorName && COLOR_CLASSES[colorName] ? colorName : PALETTE_COLORS[index % PALETTE_COLORS.length];
  return { name, ...COLOR_CLASSES[name] };
}

// Progress bar component
function AnimatedProgressBar({ percent, colorName = 'emerald', height = 'h-2.5' }: { percent: number; colorName?: string; height?: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  let barColorClass = 'bg-emerald-500';

  if (percent > 100) {
    barColorClass = 'bg-rose-500';
  } else if (percent >= 80) {
    barColorClass = 'bg-amber-500';
  } else if (colorName === 'purple') {
    barColorClass = 'bg-purple-500';
  } else if (colorName === 'blue') {
    barColorClass = 'bg-blue-500';
  } else if (colorName === 'indigo') {
    barColorClass = 'bg-indigo-500';
  } else if (colorName === 'rose') {
    barColorClass = 'bg-rose-500';
  }

  return (
    <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${height} p-0.5 border border-slate-700/80 relative shadow-inner`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full rounded-full ${barColorClass} shadow-md`}
      />
    </div>
  );
}

export function FinancialDistributionView({ data, todayStr, triggerToast }: Props) {
  const plan = data.distributionPlan || {
    incomeBaseMode: 'calculated',
    monthlyBaseIncome: undefined,
    currency: 'COP',
    funds: []
  };

  const currency: CurrencyCode = plan.currency || 'COP';
  const mode = plan.incomeBaseMode || 'calculated';

  // Calculate actual current month income
  const actualIncome = useMemo(() => {
    return FinancialCalculations.calculateActualMonthlyIncome(data.transactions || [], currency, todayStr);
  }, [data.transactions, currency, todayStr]);

  // Base income used for budget calculations
  const baseIncome = mode === 'manual'
    ? (plan.monthlyBaseIncome !== undefined ? plan.monthlyBaseIncome : 0)
    : actualIncome;

  // Current month expenses filter
  const currentMonthExpenses = useMemo(() => {
    const currentMonthPrefix = todayStr.substring(0, 7);
    return (data.transactions || []).filter(
      t => (t.nature === 'external_expense' || t.nature === 'investment_buy') &&
           t.currency === currency &&
           t.date.startsWith(currentMonthPrefix)
    );
  }, [data.transactions, currency, todayStr]);

  // Calculate spent amount for a specific category / fund or subcategory
  const calculateSpentForCategoryOrSub = (fundId: string, catId?: string, catName?: string, subName?: string) => {
    const cNameLower = catName ? catName.toLowerCase() : null;
    const sNameLower = subName ? subName.toLowerCase() : null;

    return currentMonthExpenses.reduce((sum, t) => {
      // Splits check
      if (t.splits && t.splits.length > 0) {
        const splitSum = t.splits.reduce((sAcc, s) => {
          if (s.budgetId !== fundId) return sAcc;
          let match = false;
          if (sNameLower) {
            if ((s.description || '').toLowerCase().includes(sNameLower) || (s.categoryName || '').toLowerCase().includes(sNameLower)) match = true;
          } else if (catId && cNameLower) {
            if (s.budgetCategoryId === catId || (s.categoryName || '').toLowerCase() === cNameLower) match = true;
          } else {
            match = true;
          }
          return match ? sAcc + s.amount : sAcc;
        }, 0);
        return sum + splitSum;
      }

      // Single assignment check
      let isMatch = false;
      if (sNameLower) {
        if (
          (t.budgetId === fundId || !t.budgetId) &&
          ((t.description || '').toLowerCase().includes(sNameLower) || (t.tags || []).some(tg => tg.toLowerCase().includes(sNameLower)))
        ) {
          isMatch = true;
        }
      } else if (catId && cNameLower) {
        if (t.budgetId) {
          if (t.budgetId === fundId && (t.budgetCategoryId === catId || t.categoryId === catId || (t.description || '').toLowerCase().includes(cNameLower))) {
            isMatch = true;
          }
        } else {
          if (t.categoryId === catId || (t.description || '').toLowerCase().includes(cNameLower)) {
            isMatch = true;
          }
        }
      } else {
        if (t.budgetId === fundId || (t.description || '').toLowerCase().includes((fundId || '').toLowerCase())) {
          isMatch = true;
        }
      }

      return isMatch ? sum + t.amount : sum;
    }, 0);
  };

  // Category Total Percentage
  const totalFundsPct = useMemo(() => {
    return (plan.funds || []).reduce((acc, f) => acc + (f.percentage || 0), 0);
  }, [plan.funds]);

  // Overall Financial Stats for Budget
  const totalAllocatedMoney = baseIncome * (totalFundsPct / 100);

  const totalSpentAllCategories = useMemo(() => {
    return (plan.funds || []).reduce((acc, fund) => {
      return acc + calculateSpentForCategoryOrSub(fund.id);
    }, 0);
  }, [plan.funds, currentMonthExpenses]);

  const totalAvailableMoney = totalAllocatedMoney - totalSpentAllCategories;

  // Day of month pace metric
  const dayOfMonth = useMemo(() => {
    const d = new Date(todayStr + 'T12:00:00');
    return isNaN(d.getDate()) ? 15 : d.getDate();
  }, [todayStr]);

  const daysInMonth = useMemo(() => {
    const parts = todayStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      return new Date(year, month, 0).getDate();
    }
    return 30;
  }, [todayStr]);

  const monthElapsedPct = (dayOfMonth / daysInMonth) * 100;

  // State for expands
  const [expandedFunds, setExpandedFunds] = useState<Record<string, boolean>>({});
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<FinancialFundPlan | null>(null);
  const [fundName, setFundName] = useState('');
  const [fundPct, setFundPct] = useState<number | ''>(15);
  const [fundColor, setFundColor] = useState('emerald');
  const [fundEmoji, setFundEmoji] = useState('🎓');

  // Subcategory modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [targetFundForSub, setTargetFundForSub] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<{ fundId: string; sub: FinancialCategoryPlan } | null>(null);
  const [subName, setSubName] = useState('');
  const [subEmoji, setSubEmoji] = useState('📚');
  const [subPct, setSubPct] = useState<number | ''>(0);
  const [useSubPct, setUseSubPct] = useState(false);

  // Quick Expense Registration Modal
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseFundId, setExpenseFundId] = useState<string>('');
  const [expenseSubId, setExpenseSubId] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [expenseAccountId, setExpenseAccountId] = useState<string>(data.accounts?.[0]?.id || '');

  // Rebalance / Redistribution Modal
  const [isRedistributeModalOpen, setIsRedistributeModalOpen] = useState(false);
  const [redistributeIncreaseId, setRedistributeIncreaseId] = useState<string>('');
  const [redistributeDecreaseId, setRedistributeDecreaseId] = useState<string>('');
  const [redistributeAmountPct, setRedistributeAmountPct] = useState<number | ''>(5);

  // Handlers for Category (Fund) Modal
  const handleOpenAddCategory = () => {
    setEditingFund(null);
    setFundName('');
    const rem = Math.max(0, 100 - totalFundsPct);
    setFundPct(rem > 0 ? rem : 10);
    setFundColor(PALETTE_COLORS[(plan.funds.length) % PALETTE_COLORS.length]);
    setFundEmoji('🏷️');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (fund: FinancialFundPlan) => {
    setEditingFund(fund);
    setFundName(fund.name);
    setFundPct(fund.percentage);
    setFundColor(fund.color || 'emerald');
    setFundEmoji(fund.emoji || '🏠');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName.trim() || fundPct === '') return;

    if (editingFund) {
      FinancialStore.updateFund(editingFund.id, {
        name: fundName.trim(),
        percentage: Number(fundPct),
        color: fundColor,
        emoji: fundEmoji
      });
      triggerToast('Categoría actualizada', 'success');
    } else {
      FinancialStore.addFund({
        name: fundName.trim(),
        percentage: Number(fundPct),
        color: fundColor,
        emoji: fundEmoji
      });
      triggerToast('Categoría creada exitosamente', 'success');
    }
    setIsCategoryModalOpen(false);
  };

  // Handlers for Subcategory Modal
  const handleOpenAddSub = (fundId: string) => {
    setTargetFundForSub(fundId);
    setEditingSub(null);
    setSubName('');
    setSubEmoji('🔖');
    setSubPct(0);
    setUseSubPct(false);
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (fundId: string, sub: FinancialCategoryPlan) => {
    setTargetFundForSub(fundId);
    setEditingSub({ fundId, sub });
    setSubName(sub.name);
    setSubEmoji(sub.emoji || '🔖');
    setSubPct(sub.percentage || 0);
    setUseSubPct(Boolean(sub.percentage && sub.percentage > 0));
    setIsSubModalOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !targetFundForSub) return;

    const finalPct = useSubPct && subPct !== '' ? Number(subPct) : 0;

    if (editingSub) {
      FinancialStore.updateCategoryInFund(editingSub.fundId, editingSub.sub.id, {
        name: subName.trim(),
        percentage: finalPct,
        emoji: subEmoji
      });
      triggerToast('Subcategoría actualizada', 'success');
    } else {
      FinancialStore.addCategoryToFund(targetFundForSub, {
        name: subName.trim(),
        percentage: finalPct,
        emoji: subEmoji
      });
      triggerToast('Subcategoría agregada', 'success');
    }
    setIsSubModalOpen(false);
  };

  // Quick Expense Handler
  const handleOpenQuickExpense = (initialFundId?: string) => {
    const selected = initialFundId || plan.funds?.[0]?.id || '';
    setExpenseFundId(selected);
    setExpenseSubId('');
    setExpenseAmount('');
    setExpenseDescription('');
    setExpenseAccountId(data.accounts?.[0]?.id || '');
    setIsQuickExpenseOpen(true);
  };

  const handleSaveQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expenseFundId) {
      triggerToast('Por favor ingresa un monto válido y selecciona categoría', 'warning');
      return;
    }

    const fund = plan.funds.find(f => f.id === expenseFundId);
    const sub = fund?.categories.find(c => c.id === expenseSubId);

    const txDesc = expenseDescription.trim() || `${fund?.emoji || '💰'} ${fund?.name || 'Gasto'}${sub ? ' - ' + sub.name : ''}`;

    FinancialStore.addTransaction({
      date: todayStr,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }),
      description: txDesc,
      amount: Number(expenseAmount),
      nature: 'external_expense',
      accountId: expenseAccountId || data.accounts?.[0]?.id || 'acc_default',
      currency: currency,
      budgetId: expenseFundId,
      budgetCategoryId: expenseSubId || undefined,
      categoryId: expenseFundId
    });

    triggerToast(`Gasto de ${formatCurrency(Number(expenseAmount), currency)} registrado en ${fund?.name || 'Presupuesto'}`, 'success');
    setIsQuickExpenseOpen(false);
  };

  // Redistribution / Rebalance Handler
  const handleOpenRedistribute = () => {
    if (plan.funds.length < 2) {
      triggerToast('Debes tener al menos 2 categorías para redistribuir', 'warning');
      return;
    }
    setRedistributeIncreaseId(plan.funds[0].id);
    setRedistributeDecreaseId(plan.funds[1].id);
    setRedistributeAmountPct(5);
    setIsRedistributeModalOpen(true);
  };

  const handleApplyRedistribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redistributeIncreaseId || !redistributeDecreaseId || !redistributeAmountPct) return;
    if (redistributeIncreaseId === redistributeDecreaseId) {
      triggerToast('Selecciona dos categorías distintas', 'warning');
      return;
    }

    const decFund = plan.funds.find(f => f.id === redistributeDecreaseId);
    const incFund = plan.funds.find(f => f.id === redistributeIncreaseId);
    if (!decFund || !incFund) return;

    const amount = Number(redistributeAmountPct);
    if (amount <= 0 || amount > decFund.percentage) {
      triggerToast(`El porcentaje a reducir no puede exceder el ${decFund.percentage}% de ${decFund.name}`, 'warning');
      return;
    }

    FinancialStore.rebalanceFunds(redistributeDecreaseId, redistributeIncreaseId, amount);
    triggerToast(`Redistribuido ${amount}% de ${decFund.name} a ${incFund.name}`, 'success');
    setIsRedistributeModalOpen(false);
  };

  // Toggle category expand
  const toggleFundExpand = (fundId: string) => {
    setExpandedFunds(prev => ({ ...prev, [fundId]: !prev[fundId] }));
  };

  // Donut chart arc generation
  const donutArcs = useMemo(() => {
    if (!plan.funds || plan.funds.length === 0) return [];
    let currentAngle = 0;
    const total = totalFundsPct > 0 ? totalFundsPct : 100;

    return plan.funds.map((fund, idx) => {
      const fundPct = fund.percentage || 0;
      const angle = (fundPct / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const spent = calculateSpentForCategoryOrSub(fund.id);
      const budget = baseIncome * (fundPct / 100);
      const theme = getCategoryTheme(fund.color, idx);

      return {
        fund,
        startAngle,
        endAngle,
        angle,
        spent,
        budget,
        theme
      };
    });
  }, [plan.funds, totalFundsPct, baseIncome, currentMonthExpenses]);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. HEADER & HERO RESUMEN DE PRESUPUESTO */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <PieChart className="w-3.5 h-3.5" />
              <span>Control de Presupuesto Mensual</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Gestión Dinámica de Dinero
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Organiza tus ingresos en categorías personalizadas, visualiza gastos en tiempo real y redistribuye tu presupuesto al instante.
            </p>
          </div>

          {/* TOP QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenQuickExpense()}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>＋ Registrar gasto</span>
            </button>

            <button
              onClick={handleOpenRedistribute}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Redistribuir porcentajes entre categorías"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Redistribuir</span>
            </button>

            <button
              onClick={handleOpenAddCategory}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Nueva Categoría</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW (5 INDICADORES CLAVE) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Ingresos del Periodo */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 relative group">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Ingresos</span>
              <button
                onClick={() => {
                  const newMode = mode === 'manual' ? 'calculated' : 'manual';
                  FinancialStore.setDistributionIncomeBaseMode(newMode);
                  triggerToast(`Modo cambiado a: ${newMode === 'manual' ? 'Manual' : 'Calculado desde ingresos'}`, 'info');
                }}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all"
                title="Cambiar origen de ingresos (Manual / Calculado)"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {mode === 'manual' ? (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-amber-400 font-bold">$</span>
                <input
                  type="number"
                  value={plan.monthlyBaseIncome !== undefined ? plan.monthlyBaseIncome : ''}
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    FinancialStore.setDistributionBaseIncome(val);
                  }}
                  className="w-full bg-transparent text-lg font-black text-white focus:outline-none border-b border-amber-400/50 focus:border-amber-400 font-mono"
                  placeholder="0"
                />
              </div>
            ) : (
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5 truncate">
                {formatCurrency(baseIncome, currency)}
              </div>
            )}

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${mode === 'manual' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{mode === 'manual' ? 'Base Manual' : 'Calculado de Ingresos'}</span>
            </div>
          </div>

          {/* % Total Distribuido */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Distribuido</span>
            <div className="text-lg font-black font-mono mt-0.5 flex items-baseline gap-1">
              <span className={totalFundsPct === 100 ? 'text-emerald-400' : totalFundsPct < 100 ? 'text-amber-400' : 'text-rose-400'}>
                {totalFundsPct}%
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 100%</span>
            </div>
            <div className="text-[10px] font-medium truncate">
              {totalFundsPct === 100 ? (
                <span className="text-emerald-400 font-semibold">✓ 100% Completo</span>
              ) : totalFundsPct < 100 ? (
                <span className="text-amber-400 font-semibold">⚠️ Falta {100 - totalFundsPct}%</span>
              ) : (
                <span className="text-rose-400 font-semibold">🚨 Excede {totalFundsPct - 100}%</span>
              )}
            </div>
          </div>

          {/* Dinero Total Asignado */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Asignado</span>
            <div className="text-lg font-black text-indigo-300 font-mono mt-0.5 truncate">
              {formatCurrency(totalAllocatedMoney, currency)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              Monto distribuido
            </div>
          </div>

          {/* Dinero Gastado */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gastado (Mes)</span>
            <div className={`text-lg font-black font-mono mt-0.5 truncate ${totalSpentAllCategories > totalAllocatedMoney ? 'text-rose-400' : 'text-amber-300'}`}>
              {formatCurrency(totalSpentAllCategories, currency)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {totalAllocatedMoney > 0 ? `${Math.round((totalSpentAllCategories / totalAllocatedMoney) * 100)}% consumido` : '0%'}
            </div>
          </div>

          {/* Dinero Disponible */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Disponible</span>
            <div className={`text-lg font-black font-mono mt-0.5 truncate ${totalAvailableMoney < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatCurrency(totalAvailableMoney, currency)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {totalAvailableMoney >= 0 ? 'Saldo para gastar' : 'Presupuesto superado'}
            </div>
          </div>
        </div>

        {/* VALIDATION WARNING BANNER IF % != 100 */}
        {totalFundsPct !== 100 && (
          <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium ${
            totalFundsPct < 100
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`w-5 h-5 shrink-0 ${totalFundsPct < 100 ? 'text-amber-400' : 'text-rose-400'}`} />
              <div>
                <strong className="text-white block font-bold">
                  {totalFundsPct < 100
                    ? `Tienes un ${100 - totalFundsPct}% sin asignar (${formatCurrency(baseIncome * ((100 - totalFundsPct) / 100), currency)})`
                    : `Has asignado un ${totalFundsPct - 100}% más de lo disponible (${formatCurrency(baseIncome * ((totalFundsPct - 100) / 100), currency)})`}
                </strong>
                <span className="text-slate-300 text-[11px]">
                  Asegúrate de que la suma total de las categorías sea exactamente 100% para un balance adecuado.
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenRedistribute}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shrink-0 transition-all border border-white/20"
            >
              Ajustar Categorías
            </button>
          </div>
        )}
      </div>

      {/* 2. GRÁFICO CIRCULAR DE DISTRIBUCIÓN & RESUMEN VISUAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Distribución Visual del Presupuesto
            </h2>
            <p className="text-xs text-slate-500">
              Proporción de dinero asignada a cada categoría según tus ingresos ({formatCurrency(baseIncome, currency)})
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {plan.funds.length} Categorías Activas
          </span>
        </div>

        {plan.funds.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <PieChart className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No tienes categorías en tu presupuesto</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Crea tu primera categoría (ej: Universidad 15%, Casa 30%, Alimentación 15%, Ahorro 20%) para ver tu gráfico interactivo.
            </p>
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Crear Primera Categoría
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* DONUT CHART SVG (COL 5) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {donutArcs.map((arc, i) => {
                    if (arc.angle <= 0) return null;
                    const isHovered = hoveredCategory === arc.fund.id;

                    // SVG arc calculations
                    const r = 38;
                    const cx = 50;
                    const cy = 50;

                    const startRad = (arc.startAngle * Math.PI) / 180;
                    const endRad = (arc.endAngle * Math.PI) / 180;

                    const x1 = cx + r * Math.cos(startRad);
                    const y1 = cy + r * Math.sin(startRad);
                    const x2 = cx + r * Math.cos(endRad);
                    const y2 = cy + r * Math.sin(endRad);

                    const largeArcFlag = arc.angle > 180 ? 1 : 0;

                    const pathData = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

                    return (
                      <path
                        key={arc.fund.id}
                        d={pathData}
                        fill="none"
                        stroke={arc.theme.fill}
                        strokeWidth={isHovered ? '16' : '12'}
                        className="transition-all duration-300 cursor-pointer hover:opacity-90"
                        onMouseEnter={() => setHoveredCategory(arc.fund.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* CENTER TEXT INSIDE DONUT */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 rounded-full pointer-events-none">
                  {hoveredCategory ? (
                    (() => {
                      const hFund = plan.funds.find(f => f.id === hoveredCategory);
                      if (!hFund) return null;
                      const hBudget = baseIncome * ((hFund.percentage || 0) / 100);
                      const hSpent = calculateSpentForCategoryOrSub(hFund.id);
                      return (
                        <div className="animate-fade-in space-y-0.5">
                          <span className="text-xl">{hFund.emoji || '🏷️'}</span>
                          <span className="text-xs font-black text-slate-900 block truncate max-w-[120px]">
                            {hFund.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-indigo-600 block">
                            {hFund.percentage}% · {formatCurrency(hBudget, currency)}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            Gastado: {formatCurrency(hSpent, currency)}
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Presupuesto Total
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 font-mono block">
                        {formatCurrency(totalAllocatedMoney, currency)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 block font-mono">
                        {formatCurrency(totalSpentAllCategories, currency)} gastados
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LEGEND & CATEGORY PILLS (COL 7) */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Desglose por Categorías
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {plan.funds.map((fund, idx) => {
                  const budget = baseIncome * ((fund.percentage || 0) / 100);
                  const spent = calculateSpentForCategoryOrSub(fund.id);
                  const remaining = budget - spent;
                  const theme = getCategoryTheme(fund.color, idx);
                  const isHovered = hoveredCategory === fund.id;

                  return (
                    <div
                      key={fund.id}
                      onMouseEnter={() => setHoveredCategory(fund.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isHovered ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.fill }}
                        />
                        <span className="text-base shrink-0">{fund.emoji || '🏷️'}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{fund.name}</h4>
                          <span className="text-[11px] text-slate-500 font-mono block truncate">
                            {fund.percentage}% · {formatCurrency(budget, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className={`text-xs font-bold block ${remaining < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatCurrency(remaining, currency)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">disponible</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. LISTADO DE TARJETAS DE CATEGORÍAS (MONEFY STYLE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Categorías del Presupuesto ({plan.funds.length})
          </h2>

          <button
            onClick={handleOpenAddCategory}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar Categoría
          </button>
        </div>

        {plan.funds.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            Sin categorías definidas. Haz clic en "Agregar Categoría" arriba.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.funds.map((fund, idx) => {
              const theme = getCategoryTheme(fund.color, idx);
              const budget = baseIncome * ((fund.percentage || 0) / 100);
              const spent = calculateSpentForCategoryOrSub(fund.id);
              const available = budget - spent;
              const consumedPct = budget > 0 ? (spent / budget) * 100 : 0;

              // Budget status: Green <= 80%, Yellow 80-100%, Red > 100%
              let statusLabel = '🟢 Dentro del presupuesto';
              let statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (consumedPct > 100) {
                statusLabel = '🔴 Excedido';
                statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
              } else if (consumedPct >= 80) {
                statusLabel = '🟡 Cerca del límite';
                statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
              }

              // Rhythm insight: compare consumed % with month elapsed %
              const isPaceFast = consumedPct > monthElapsedPct + 10 && consumedPct <= 100;
              const isPaceExceeded = consumedPct > 100;

              const subcategories = fund.categories || [];
              const isExpanded = Boolean(expandedFunds[fund.id]);

              return (
                <motion.div
                  key={fund.id}
                  layout
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* CATEGORY CARD HEADER */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-xs shrink-0"
                          style={{ backgroundColor: `${theme.fill}15`, borderColor: `${theme.fill}40` }}
                        >
                          {fund.emoji || '🏷️'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                            {fund.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {fund.percentage}% · {formatCurrency(budget, currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* STATUS BADGE & ACTIONS */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenQuickExpense(fund.id)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Registrar gasto en esta categoría"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>

                        <button
                          onClick={() => handleOpenEditCategory(fund)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            FinancialStore.deleteFund(fund.id);
                            triggerToast('Categoría eliminada', 'info');
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* STATUS BADGE ROW */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-600">
                        {Math.round(consumedPct)}% Usado
                      </span>
                    </div>

                    {/* METRICS & PROGRESS BAR */}
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">
                          Gastado: <strong className={spent > budget ? 'text-rose-600 font-bold' : 'text-slate-800'}>{formatCurrency(spent, currency)}</strong>
                        </span>
                        <span className="text-slate-500">
                          Disponible: <strong className={available < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>{formatCurrency(available, currency)}</strong>
                        </span>
                      </div>

                      <AnimatedProgressBar
                        percent={consumedPct}
                        colorName={fund.color}
                        height="h-3"
                      />
                    </div>

                    {/* SMART RHYTHM NOTE */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                      <span>Has utilizado el <strong>{Math.round(consumedPct)}%</strong> de este presupuesto. </span>
                      {isPaceExceeded ? (
                        <span className="text-rose-600 font-bold block mt-0.5">
                          🚨 Has superado el presupuesto por {formatCurrency(Math.abs(available), currency)}.
                        </span>
                      ) : isPaceFast ? (
                        <span className="text-amber-700 font-medium block mt-0.5">
                          ⚡ Llevas un ritmo acelerado para el día {dayOfMonth} del mes ({Math.round(consumedPct)}% gastado vs {Math.round(monthElapsedPct)}% del tiempo transcurrido).
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium block mt-0.5">
                          ✅ Ritmo de gasto adecuado para la fecha actual (día {dayOfMonth} de {daysInMonth}).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SUBCATEGORIES SECTION HEADER / TOGGLE */}
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span>Subcategorías ({subcategories.length})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddSub(fund.id)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-indigo-600 font-bold text-xs border border-slate-200 flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Subcategoría
                      </button>

                      {subcategories.length > 0 && (
                        <button
                          onClick={() => toggleFundExpand(fund.id)}
                          className="p-1 text-slate-500 hover:text-slate-800 transition-all"
                          title={isExpanded ? 'Ocultar subcategorías' : 'Ver subcategorías'}
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SUBCATEGORIES LIST (EXPANDABLE) */}
                  <AnimatePresence>
                    {isExpanded && subcategories.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 bg-slate-100/60 border-t border-slate-200 space-y-2.5"
                      >
                        {subcategories.map(sub => {
                          const subSpent = calculateSpentForCategoryOrSub(fund.id, sub.id, fund.name, sub.name);
                          const hasSubPct = sub.percentage && sub.percentage > 0;
                          const subBudget = hasSubPct ? budget * (sub.percentage! / 100) : budget;
                          const subAvailable = subBudget - subSpent;

                          return (
                            <div
                              key={sub.id}
                              className="p-3 bg-white rounded-2xl border border-slate-200/80 space-y-1.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                  <span>{sub.emoji || '🔖'}</span>
                                  <span>{sub.name}</span>
                                  {hasSubPct && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                                      {sub.percentage}% ({formatCurrency(subBudget, currency)})
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditSub(fund.id, sub)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      FinancialStore.deleteCategoryFromFund(fund.id, sub.id);
                                      triggerToast('Subcategoría eliminada', 'info');
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                                <span>Gastado: <strong className="text-slate-800">{formatCurrency(subSpent, currency)}</strong></span>
                                <span>Disponible: <strong className={subAvailable < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700'}>{formatCurrency(subAvailable, currency)}</strong></span>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: CREAR / EDITAR CATEGORÍA */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  {editingFund ? 'Editar Categoría' : 'Nueva Categoría de Presupuesto'}
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={fundEmoji}
                      onChange={e => setFundEmoji(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Nombre de Categoría *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Universidad, Arriendo, Social, Alimentación"
                      value={fundName}
                      onChange={e => setFundName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Porcentaje (%) *
                    </label>
                    <input
                      type="number"
                      placeholder="15"
                      value={fundPct}
                      onChange={e => setFundPct(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Color Visual
                    </label>
                    <select
                      value={fundColor}
                      onChange={e => setFundColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="emerald">Verde Esmeralda</option>
                      <option value="purple">Púrpura</option>
                      <option value="amber">Ámbar</option>
                      <option value="blue">Azul</option>
                      <option value="rose">Rosa</option>
                      <option value="indigo">Índigo</option>
                      <option value="teal">Menta Teal</option>
                      <option value="cyan">Cian</option>
                    </select>
                  </div>
                </div>

                {fundPct !== '' && (
                  <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs font-mono text-indigo-900 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Monto mensual calculado:</span>
                      <span className="text-indigo-700">{formatCurrency(baseIncome * (Number(fundPct) / 100), currency)}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 block">
                      Equivale al {fundPct}% de {formatCurrency(baseIncome, currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
                  >
                    {editingFund ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CREAR / EDITAR SUBCATEGORÍA */}
      <AnimatePresence>
        {isSubModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  {editingSub ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
                </h3>
                <button
                  onClick={() => setIsSubModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSub} className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={subEmoji}
                      onChange={e => setSubEmoji(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Nombre Subcategoría *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Matrícula, Transporte, Materiales"
                      value={subName}
                      onChange={e => setSubName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Option for internal percentage distribution */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSubPct}
                      onChange={e => setUseSubPct(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span>Asignar porcentaje interno dentro de la categoría</span>
                  </label>

                  {useSubPct && (
                    <div className="pt-2">
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Porcentaje Interno (%)
                      </label>
                      <input
                        type="number"
                        placeholder="25"
                        value={subPct}
                        onChange={e => setSubPct(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {!useSubPct && (
                    <span className="text-[10px] text-slate-500 block">
                      Por defecto esta subcategoría consume el presupuesto general de su categoría sin límite individual.
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
                  >
                    {editingSub ? 'Guardar' : 'Agregar Subcategoría'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: REGISTRO RÁPIDO DE GASTO (`＋ Registrar gasto`) */}
      <AnimatePresence>
        {isQuickExpenseOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Registrar Gasto Rápido
                </h3>
                <button
                  onClick={() => setIsQuickExpenseOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickExpense} className="space-y-4">
                {/* Monto */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    Monto ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={expenseAmount}
                      onChange={e => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-xl font-mono font-black text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    Categoría del Presupuesto *
                  </label>
                  <select
                    value={expenseFundId}
                    onChange={e => {
                      setExpenseFundId(e.target.value);
                      setExpenseSubId('');
                    }}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Selecciona Categoría --</option>
                    {plan.funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.emoji || '🏷️'} {f.name} ({f.percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategoría (Opcional) */}
                {expenseFundId && (() => {
                  const fund = plan.funds.find(f => f.id === expenseFundId);
                  if (!fund || !fund.categories || fund.categories.length === 0) return null;
                  return (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Subcategoría (Opcional)
                      </label>
                      <select
                        value={expenseSubId}
                        onChange={e => setExpenseSubId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">-- Sin subcategoría --</option>
                        {fund.categories.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.emoji || '🔖'} {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                {/* Descripción Nota */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    Descripción / Nota (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pago de almuerzo, fotocopias, pasaje"
                    value={expenseDescription}
                    onChange={e => setExpenseDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Cuenta de origen */}
                {data.accounts && data.accounts.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                      Cuenta de Origen
                    </label>
                    <select
                      value={expenseAccountId}
                      onChange={e => setExpenseAccountId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    >
                      {data.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance ?? acc.initialBalance, acc.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickExpenseOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Guardar Gasto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: REDISTRIBUIR PRESUPUESTO (`🔀 Redistribuir Presupuesto`) */}
      <AnimatePresence>
        {isRedistributeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                  Redistribuir Presupuesto
                </h3>
                <button
                  onClick={() => setIsRedistributeModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyRedistribution} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aumenta el presupuesto de una categoría restando el porcentaje exacto de otra categoría para mantener el total en 100%.
                </p>

                {/* Categoría a aumentar */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    1. Categoría a AUMENTAR
                  </label>
                  <select
                    value={redistributeIncreaseId}
                    onChange={e => setRedistributeIncreaseId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    {plan.funds.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.emoji || '🏷️'} {f.name} (Actual: {f.percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Porcentaje a transferir */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    2. Porcentaje a Transferir (%)
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={redistributeAmountPct}
                    onChange={e => setRedistributeAmountPct(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-mono font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Categoría a reducir */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    3. ¿De qué categoría restar el porcentaje?
                  </label>
                  <select
                    value={redistributeDecreaseId}
                    onChange={e => setRedistributeDecreaseId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    {plan.funds
                      .filter(f => f.id !== redistributeIncreaseId)
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          {f.emoji || '🏷️'} {f.name} (Actual: {f.percentage}%)
                        </option>
                      ))}
                  </select>
                </div>

                {/* PREVIEW RESULT */}
                {redistributeIncreaseId && redistributeDecreaseId && redistributeAmountPct !== '' && (
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-mono text-indigo-900 space-y-1">
                    {(() => {
                      const inc = plan.funds.find(f => f.id === redistributeIncreaseId);
                      const dec = plan.funds.find(f => f.id === redistributeDecreaseId);
                      const amt = Number(redistributeAmountPct);
                      if (!inc || !dec) return null;
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>{inc.name}:</span>
                            <strong className="text-emerald-600">{inc.percentage}% → {inc.percentage + amt}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>{dec.name}:</span>
                            <strong className="text-rose-600">{dec.percentage}% → {Math.max(0, dec.percentage - amt)}%</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRedistributeModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Aplicar Redistribución
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

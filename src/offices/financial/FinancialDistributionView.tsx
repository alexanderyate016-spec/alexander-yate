import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FinancialOfficeData,
  FinancialFundPlan,
  FinancialCategoryPlan,
  FinancialSubcategoryPlan,
  CurrencyCode,
  FinancialTransaction
} from '../../types/store';
import { FinancialStore } from './FinancialStore';
import { FinancialCalculations } from './FinancialCalculations';
import { getTodayDateString } from '../../utils/dates';
import { formatCurrency } from '../../utils/formatters';
import {
  GlassPanel,
  ExecutiveCard,
  ExecutiveButton,
  ExecutiveMetricCard,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveForm,
  ExecutiveModal
} from '../../components/executive';
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
  RefreshCw,
  Layers,
  DollarSign,
  Info,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  X
} from 'lucide-react';

interface Props {
  data: FinancialOfficeData;
  todayStr: string;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'danger' | 'error') => void;
}

// Utility component for progress bar
function AnimatedProgressBar({ percent, color = 'emerald', height = 'h-2' }: { percent: number; color?: string; height?: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const colorClasses: Record<string, string> = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    rose: 'bg-gradient-to-r from-rose-500 to-red-400',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-400',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-400'
  };

  return (
    <div className={`w-full bg-slate-900/80 rounded-full overflow-hidden ${height} p-0.5 border border-white/10 relative`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${colorClasses[color] || colorClasses.emerald} shadow-sm`}
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

  // Calculate actual current month income (external_income)
  const actualIncome = useMemo(() => {
    return FinancialCalculations.calculateActualMonthlyIncome(data.transactions || [], currency, todayStr);
  }, [data.transactions, currency, todayStr]);

  // Determine base income used for plan calculations (NO HARDCODED DEFAULTS)
  const baseIncome = mode === 'manual'
    ? (plan.monthlyBaseIncome !== undefined ? plan.monthlyBaseIncome : 0)
    : actualIncome;

  // Expanded states
  const [expandedFunds, setExpandedFunds] = useState<Record<string, boolean>>({
    fund_necesarios: true,
    fund_personales: true,
    fund_ahorro: true
  });
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Modals state
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<FinancialFundPlan | null>(null);
  const [fundName, setFundName] = useState('');
  const [fundPct, setFundPct] = useState<number | ''>(50);
  const [fundColor, setFundColor] = useState('emerald');
  const [fundEmoji, setFundEmoji] = useState('🏠');

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [targetFundForCat, setTargetFundForCat] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<{ fundId: string; cat: FinancialCategoryPlan } | null>(null);
  const [catName, setCatName] = useState('');
  const [catPct, setCatPct] = useState<number | ''>(50);
  const [catEmoji, setCatEmoji] = useState('🚗');

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [targetCatForSub, setTargetCatForSub] = useState<{ fundId: string; catId: string } | null>(null);
  const [editingSub, setEditingSub] = useState<{ fundId: string; catId: string; sub: FinancialSubcategoryPlan } | null>(null);
  const [subName, setSubName] = useState('');
  const [subPct, setSubPct] = useState<number | ''>(50);
  const [subEmoji, setSubEmoji] = useState('⛽');

  // Filter current month expense transactions
  const currentMonthExpenses = useMemo(() => {
    const currentMonthPrefix = todayStr.substring(0, 7);
    return (data.transactions || []).filter(
      t => (t.nature === 'external_expense' || t.nature === 'investment_buy') &&
           t.currency === currency &&
           t.date.startsWith(currentMonthPrefix)
    );
  }, [data.transactions, currency, todayStr]);

  // Compute spent amount for a specific category or subcategory
  const calculateSpentForCategoryOrSub = (fundId: string, catId: string, catName: string, subName?: string) => {
    const cNameLower = catName.toLowerCase();
    const sNameLower = subName ? subName.toLowerCase() : null;

    return currentMonthExpenses.reduce((sum, t) => {
      // Splits check
      if (t.splits && t.splits.length > 0) {
        const splitSum = t.splits.reduce((sAcc, s) => {
          if (s.budgetId !== fundId) return sAcc;
          let match = false;
          if (sNameLower) {
            if ((s.description || '').toLowerCase().includes(sNameLower) || (s.categoryName || '').toLowerCase().includes(sNameLower)) match = true;
          } else {
            if (s.budgetCategoryId === catId || (s.categoryName || '').toLowerCase() === cNameLower || !s.budgetCategoryId) match = true;
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
      } else {
        if (t.budgetId) {
          if (t.budgetId === fundId && (t.budgetCategoryId === catId || t.categoryId === catId || (t.description || '').toLowerCase().includes(cNameLower))) {
            isMatch = true;
          }
        } else {
          if (t.categoryId === catId || (t.description || '').toLowerCase().includes(cNameLower)) {
            isMatch = true;
          }
        }
      }

      return isMatch ? sum + t.amount : sum;
    }, 0);
  };

  // Fund validation sum
  const totalFundsPct = useMemo(() => {
    return (plan.funds || []).reduce((acc, f) => acc + (f.percentage || 0), 0);
  }, [plan.funds]);

  // Toggle helpers
  const toggleFundExpand = (fundId: string) => {
    setExpandedFunds(prev => ({ ...prev, [fundId]: !prev[fundId] }));
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Fund Modal Handlers
  const handleOpenAddFund = () => {
    setEditingFund(null);
    setFundName('');
    const remaining = Math.max(0, 100 - totalFundsPct);
    setFundPct(remaining > 0 ? remaining : 10);
    setFundColor('emerald');
    setFundEmoji('💰');
    setIsFundModalOpen(true);
  };

  const handleOpenEditFund = (fund: FinancialFundPlan) => {
    setEditingFund(fund);
    setFundName(fund.name);
    setFundPct(fund.percentage);
    setFundColor(fund.color || 'emerald');
    setFundEmoji(fund.emoji || '🏠');
    setIsFundModalOpen(true);
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName.trim() || fundPct === '') return;

    if (editingFund) {
      FinancialStore.updateFund(editingFund.id, {
        name: fundName.trim(),
        percentage: Number(fundPct),
        color: fundColor,
        emoji: fundEmoji
      });
      triggerToast('Fondo principal actualizado', 'success');
    } else {
      FinancialStore.addFund({
        name: fundName.trim(),
        percentage: Number(fundPct),
        color: fundColor,
        emoji: fundEmoji
      });
      triggerToast('Fondo principal creado', 'success');
    }
    setIsFundModalOpen(false);
  };

  // Category Modal Handlers
  const handleOpenAddCat = (fundId: string) => {
    const fund = plan.funds.find(f => f.id === fundId);
    if (!fund) return;
    setTargetFundForCat(fundId);
    setEditingCat(null);
    setCatName('');
    const sumCatPct = (fund.categories || []).reduce((sum, c) => sum + (c.percentage || 0), 0);
    const remCat = Math.max(0, 100 - sumCatPct);
    setCatPct(remCat > 0 ? remCat : 25);
    setCatEmoji('📁');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (fundId: string, cat: FinancialCategoryPlan) => {
    setTargetFundForCat(fundId);
    setEditingCat({ fundId, cat });
    setCatName(cat.name);
    setCatPct(cat.percentage);
    setCatEmoji(cat.emoji || '📁');
    setIsCatModalOpen(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || catPct === '' || !targetFundForCat) return;

    if (editingCat) {
      FinancialStore.updateCategoryInFund(editingCat.fundId, editingCat.cat.id, {
        name: catName.trim(),
        percentage: Number(catPct),
        emoji: catEmoji
      });
      triggerToast('Categoría actualizada', 'success');
    } else {
      FinancialStore.addCategoryToFund(targetFundForCat, {
        name: catName.trim(),
        percentage: Number(catPct),
        emoji: catEmoji
      });
      triggerToast('Categoría agregada al fondo', 'success');
    }
    setIsCatModalOpen(false);
  };

  // Subcategory Modal Handlers
  const handleOpenAddSub = (fundId: string, catId: string) => {
    const fund = plan.funds.find(f => f.id === fundId);
    const cat = fund?.categories.find(c => c.id === catId);
    if (!cat) return;

    setTargetCatForSub({ fundId, catId });
    setEditingSub(null);
    setSubName('');
    const sumSubPct = (cat.subcategories || []).reduce((sum, s) => sum + (s.percentage || 0), 0);
    const remSub = Math.max(0, 100 - sumSubPct);
    setSubPct(remSub > 0 ? remSub : 50);
    setSubEmoji('🔖');
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (fundId: string, catId: string, sub: FinancialSubcategoryPlan) => {
    setTargetCatForSub({ fundId, catId });
    setEditingSub({ fundId, catId, sub });
    setSubName(sub.name);
    setSubPct(sub.percentage);
    setSubEmoji(sub.emoji || '🔖');
    setIsSubModalOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || subPct === '' || !targetCatForSub) return;

    if (editingSub) {
      FinancialStore.updateSubcategoryInCategory(editingSub.fundId, editingSub.catId, editingSub.sub.id, {
        name: subName.trim(),
        percentage: Number(subPct),
        emoji: subEmoji
      });
      triggerToast('Subcategoría actualizada', 'success');
    } else {
      FinancialStore.addSubcategoryToCategory(targetCatForSub.fundId, targetCatForSub.catId, {
        name: subName.trim(),
        percentage: Number(subPct),
        emoji: subEmoji
      });
      triggerToast('Subcategoría agregada', 'success');
    }
    setIsSubModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & LIVE VALIDATION PANEL */}
      <GlassPanel accentColor="emerald" padding="md" className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <PieChart className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-serif font-bold text-white">
                Plan de Distribución Financiera
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Sistema jerárquico de planificación de ingresos a 3 niveles (Fondos Principales → Categorías → Subcategorías)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExecutiveButton
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5 text-slate-300" />}
              onClick={() => {
                FinancialStore.resetDistributionPlanToDefault();
                triggerToast('Plan restablecido al estándar 50/30/20', 'info');
              }}
            >
              Restablecer (50/30/20)
            </ExecutiveButton>

            <ExecutiveButton
              variant="primary"
              accentColor="emerald"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddFund}
            >
              Nuevo Fondo Principal
            </ExecutiveButton>
          </div>
        </div>

        {/* BASE INCOME CONFIG & VALIDATION STATUS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-center">
          {/* BASE INCOME SELECTOR */}
          <div className="p-3.5 bg-slate-900/80 border border-white/10 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-slate-300 block">
                Origen de la Base de Ingresos
              </label>
              <ExecutiveBadge variant="subtle" accentColor={mode === 'manual' ? 'amber' : 'emerald'}>
                {mode === 'manual' ? 'Modo Manual' : 'Modo Automático'}
              </ExecutiveBadge>
            </div>

            <select
              value={mode}
              onChange={e => {
                const newMode = e.target.value as 'manual' | 'calculated';
                FinancialStore.setDistributionIncomeBaseMode(newMode);
                triggerToast(`Origen de base cambiado a: ${newMode === 'manual' ? 'Manual' : 'Calculado desde movimientos'}`, 'info');
              }}
              className="w-full bg-[#132337] text-xs font-semibold text-white p-2 rounded-lg border border-white/15 focus:border-emerald-400 focus:outline-none"
            >
              <option value="calculated">Calculada automáticamente desde movimientos</option>
              <option value="manual">Manual (Ingresar o modificar cifra)</option>
            </select>

            {mode === 'manual' ? (
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-400">$</span>
                  <input
                    type="number"
                    value={plan.monthlyBaseIncome !== undefined ? plan.monthlyBaseIncome : ''}
                    onChange={e => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      FinancialStore.setDistributionBaseIncome(val);
                    }}
                    className="w-full bg-transparent text-white font-serif font-bold text-base focus:outline-none border-b border-amber-500/50 focus:border-amber-400"
                    placeholder="Ingresa tu base de ingresos..."
                  />
                  {plan.monthlyBaseIncome !== undefined && (
                    <button
                      title="Eliminar cifra manual"
                      onClick={() => {
                        FinancialStore.setDistributionBaseIncome(undefined);
                        triggerToast('Cifra manual eliminada', 'info');
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Ingresado libremente. Puedes editarlo o eliminarlo cuando desees.
                </span>
              </div>
            ) : (
              <div className="pt-1 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block">Base del Plan (Movimientos):</span>
                  <strong className="text-base font-serif font-bold text-emerald-400">
                    {formatCurrency(actualIncome, currency)}
                  </strong>
                </div>
                <span className="text-[10px] text-slate-400 max-w-[130px] text-right">
                  Suma de todos los ingresos externos en el período.
                </span>
              </div>
            )}
          </div>

          {/* FUND TOTAL VALIDATION BAR */}
          <div className="md:col-span-2 p-3 bg-slate-900/80 border border-white/10 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Suma de Fondos Principales (Nivel 1):
              </span>
              <div className="flex items-center gap-2">
                {totalFundsPct === 100 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Asignado (Perfecto)
                  </span>
                ) : totalFundsPct < 100 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {totalFundsPct}% Asignado (Falta {100 - totalFundsPct}%)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {totalFundsPct}% Asignado (Exceso {totalFundsPct - 100}%)
                  </span>
                )}
              </div>
            </div>

            <AnimatedProgressBar
              percent={totalFundsPct}
              color={totalFundsPct === 100 ? 'emerald' : totalFundsPct < 100 ? 'amber' : 'rose'}
              height="h-3"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Total Planificado: <strong className="text-white">{formatCurrency(baseIncome * (totalFundsPct / 100), currency)}</strong></span>
              <span>
                {totalFundsPct < 100 ? `Disponible por asignar: ${formatCurrency(baseIncome * ((100 - totalFundsPct) / 100), currency)}` :
                 totalFundsPct > 100 ? `Sobre-asignado por: ${formatCurrency(baseIncome * ((totalFundsPct - 100) / 100), currency)}` :
                 'Distribución Completa 100%'}
              </span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* LIST OF MAIN FUNDS (LEVEL 1) */}
      {(!plan.funds || plan.funds.length === 0) ? (
        <ExecutiveEmptyState
          icon={<PieChart className="w-8 h-8 text-emerald-400" />}
          title="Sin Fondos Principales Definidos"
          description="Crea tu primer fondo principal (Ej: Gastos Necesarios 50%, Gastos Personales 30%, Ahorro 20%) para comenzar la planificación."
          accentColor="emerald"
          actionLabel="Crear Primer Fondo"
          onAction={handleOpenAddFund}
        />
      ) : (
        <div className="space-y-6">
          {plan.funds.map(fund => {
            const fundTargetBudget = baseIncome * ((fund.percentage || 0) / 100);

            // Compute categories for this fund
            const categories = fund.categories || [];
            const catPctSum = categories.reduce((s, c) => s + (c.percentage || 0), 0);

            // Compute total spent across categories in this fund
            let fundSpent = 0;
            categories.forEach(cat => {
              const catSpent = calculateSpentForCategoryOrSub(fund.id, cat.id, cat.name);
              fundSpent += catSpent;
            });

            const fundRemaining = fundTargetBudget - fundSpent;
            const fundConsumedPct = fundTargetBudget > 0 ? (fundSpent / fundTargetBudget) * 100 : 0;
            const isExpanded = Boolean(expandedFunds[fund.id]);

            const colorTheme = fund.color || 'emerald';

            return (
              <motion.div
                key={fund.id}
                layout
                className="rounded-2xl border border-white/10 bg-[#132337]/90 backdrop-blur-md overflow-hidden shadow-xl"
              >
                {/* FUND CARD HEADER */}
                <div className="p-5 border-b border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-900/80 border border-white/10">
                        {fund.emoji || '🏠'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-white text-lg">{fund.name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {fund.percentage}% del Ingreso
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          Presupuesto Asignado: <strong className="text-slate-200">{formatCurrency(fundTargetBudget, currency)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {catPctSum === 100 ? (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Categorías 100%
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-[11px] font-bold border border-amber-500/20 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Categorías {catPctSum}%
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenAddCat(fund.id)}
                        className="px-2.5 py-1.5 text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Categoría
                      </button>

                      <button
                        onClick={() => handleOpenEditFund(fund)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Editar fondo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          FinancialStore.deleteFund(fund.id);
                          triggerToast('Fondo principal eliminado', 'info');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Eliminar fondo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleFundExpand(fund.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Colapsar categorías' : 'Expandir categorías'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-emerald-400" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* METRICS ROW */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase text-slate-400 block">Asignado (Nivel 1)</span>
                      <strong className="text-sm text-white">{formatCurrency(fundTargetBudget, currency)}</strong>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase text-slate-400 block">Ejecutado (Gastado)</span>
                      <strong className={`text-sm ${fundSpent > fundTargetBudget ? 'text-rose-400' : 'text-amber-300'}`}>
                        {formatCurrency(fundSpent, currency)}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5">
                      <span className="text-[10px] uppercase text-slate-400 block">Disponible</span>
                      <strong className={`text-sm ${fundRemaining < 0 ? 'text-rose-400 font-bold' : 'text-emerald-300'}`}>
                        {formatCurrency(fundRemaining, currency)}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex flex-col justify-center">
                      <div className="flex justify-between items-center text-[10px] uppercase text-slate-400">
                        <span>Consumido</span>
                        <strong className="text-emerald-300">{Math.round(fundConsumedPct)}%</strong>
                      </div>
                      <AnimatedProgressBar
                        percent={fundConsumedPct}
                        color={fundConsumedPct > 100 ? 'rose' : fundConsumedPct > 80 ? 'amber' : 'emerald'}
                        height="h-2"
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORIES LIST (LEVEL 2) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-5 bg-slate-950/40 space-y-4"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          Categorías Internas ({categories.length}) — Pertenecen únicamente al {fund.percentage}% de {fund.name}
                        </h5>

                        <button
                          onClick={() => handleOpenAddCat(fund.id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar Categoría
                        </button>
                      </div>

                      {categories.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          No hay categorías internas creadas en este fondo. Presiona "+ Categoría" para añadir una.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {categories.map(cat => {
                            // Category budget = Fund Target Budget * (cat.percentage / 100)
                            const catBudget = fundTargetBudget * ((cat.percentage || 0) / 100);
                            const effectivePctOfTotal = (fund.percentage * (cat.percentage || 0)) / 100;
                            const catSpent = calculateSpentForCategoryOrSub(fund.id, cat.id, cat.name);
                            const catRemaining = catBudget - catSpent;
                            const catConsumedPct = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
                            const alertStatus = FinancialCalculations.getCategoryAlertStatus(catConsumedPct);

                            const subcategories = cat.subcategories || [];
                            const subPctSum = subcategories.reduce((s, sub) => s + (sub.percentage || 0), 0);
                            const isCatExpanded = Boolean(expandedCategories[cat.id]);

                            return (
                              <div
                                key={cat.id}
                                className="p-4 bg-[#132337]/70 border border-white/10 rounded-xl space-y-3 transition-all hover:border-emerald-500/30"
                              >
                                {/* ALERT BANNER IF APPLICABLE */}
                                {alertStatus.level !== 'ok' && (
                                  <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-medium ${alertStatus.alertClass}`}>
                                    <span className="flex items-center gap-2 font-serif font-bold">
                                      <span className="text-base">{alertStatus.emoji}</span>
                                      {alertStatus.message}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold opacity-90">
                                      {Math.round(catConsumedPct)}% Consumido
                                    </span>
                                  </div>
                                )}

                                {/* CATEGORY HEADER ROW */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{cat.emoji || '📁'}</span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-serif font-bold text-white text-base">{cat.name}</span>
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                                          {cat.percentage}% del fondo
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-mono">
                                          ({effectivePctOfTotal.toFixed(1)}% del ingreso total)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs">
                                    {subcategories.length > 0 && (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        subPctSum === 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                      }`}>
                                        Subcats: {subPctSum}%
                                      </span>
                                    )}

                                    <button
                                      onClick={() => handleOpenAddSub(fund.id, cat.id)}
                                      className="px-2 py-1 text-[11px] font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded border border-purple-500/30 flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" /> Subcategoría
                                    </button>

                                    <button
                                      onClick={() => handleOpenEditCat(fund.id, cat)}
                                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        FinancialStore.deleteCategoryFromFund(fund.id, cat.id);
                                        triggerToast('Categoría eliminada', 'info');
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    {subcategories.length > 0 && (
                                      <button
                                        onClick={() => toggleCategoryExpand(cat.id)}
                                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                                      >
                                        {isCatExpanded ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* CATEGORY PROGRESS & NUMBERS */}
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs font-mono">
                                    <span className="text-slate-300">
                                      Asignado: <strong className="text-white">{formatCurrency(catBudget, currency)}</strong>
                                    </span>
                                    <span className="text-slate-300">
                                      Utilizado: <strong className="text-amber-300">{formatCurrency(catSpent, currency)}</strong>
                                    </span>
                                    <span className="text-slate-300">
                                      Disponible: <strong className={catRemaining < 0 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>{formatCurrency(catRemaining, currency)}</strong>
                                    </span>
                                    <span className="text-slate-400">
                                      Consumo: <strong className="text-white">{Math.round(catConsumedPct)}%</strong>
                                    </span>
                                  </div>

                                  <AnimatedProgressBar
                                    percent={catConsumedPct}
                                    color={catConsumedPct > 100 ? 'rose' : catConsumedPct > 80 ? 'amber' : 'emerald'}
                                    height="h-2"
                                  />
                                </div>

                                {/* LEVEL 3: SUBCATEGORIES LIST */}
                                {subcategories.length > 0 && isCatExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 pt-3 border-t border-white/10 space-y-2 pl-4 border-l-2 border-purple-500/40"
                                  >
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                                      Subcategorías (Nivel 3)
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {subcategories.map(sub => {
                                        // Subcategory budget = Category budget * (sub.percentage / 100)
                                        const subBudget = catBudget * ((sub.percentage || 0) / 100);
                                        const effSubPct = (effectivePctOfTotal * (sub.percentage || 0)) / 100;
                                        const subSpent = calculateSpentForCategoryOrSub(fund.id, cat.id, cat.name, sub.name);
                                        const subRemaining = subBudget - subSpent;
                                        const subConsumed = subBudget > 0 ? (subSpent / subBudget) * 100 : 0;

                                        return (
                                          <div
                                            key={sub.id}
                                            className="p-2.5 bg-slate-900/90 border border-white/10 rounded-lg space-y-1"
                                          >
                                            <div className="flex justify-between items-center text-xs">
                                              <span className="font-serif font-bold text-white flex items-center gap-1">
                                                <span>{sub.emoji || '🔖'}</span> {sub.name}
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                                                  {sub.percentage}%
                                                </span>
                                                <button
                                                  onClick={() => handleOpenEditSub(fund.id, cat.id, sub)}
                                                  className="p-0.5 text-slate-400 hover:text-white"
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    FinancialStore.deleteSubcategoryFromCategory(fund.id, cat.id, sub.id);
                                                    triggerToast('Subcategoría eliminada', 'info');
                                                  }}
                                                  className="p-0.5 text-slate-400 hover:text-rose-400"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>

                                            <div className="text-[11px] font-mono text-slate-300 flex justify-between">
                                              <span>Base: {formatCurrency(subBudget, currency)}</span>
                                              <span className={subRemaining < 0 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
                                                Disp: {formatCurrency(subRemaining, currency)}
                                              </span>
                                            </div>

                                            <AnimatedProgressBar
                                              percent={subConsumed}
                                              color={subConsumed > 100 ? 'rose' : subConsumed > 80 ? 'amber' : 'purple'}
                                              height="h-1.5"
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT FUND MODAL */}
      <ExecutiveModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        title={editingFund ? 'Editar Fondo Principal (Nivel 1)' : 'Nuevo Fondo Principal (Nivel 1)'}
        accentColor="emerald"
      >
        <ExecutiveForm onSubmit={handleSaveFund}>
          <div className="grid grid-cols-4 gap-2 items-center">
            <ExecutiveInput
              label="Emoji"
              value={fundEmoji}
              onChange={e => setFundEmoji(e.target.value)}
              accentColor="emerald"
            />
            <div className="col-span-3">
              <ExecutiveInput
                label="Nombre del Fondo *"
                placeholder="Ej: Gastos Necesarios / Gastos Personales"
                value={fundName}
                onChange={e => setFundName(e.target.value)}
                accentColor="emerald"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ExecutiveInput
              label="Porcentaje Asignado del Ingreso Total (%) *"
              type="number"
              placeholder="50"
              value={fundPct}
              onChange={e => setFundPct(e.target.value === '' ? '' : Number(e.target.value))}
              accentColor="emerald"
              required
            />

            <ExecutiveSelect
              label="Tema de Color"
              value={fundColor}
              onChange={e => setFundColor(e.target.value)}
              accentColor="emerald"
              options={[
                { value: 'emerald', label: 'Verde Esmeralda' },
                { value: 'amber', label: 'Ámbar Ejecutivo' },
                { value: 'purple', label: 'Púrpura / Inversión' },
                { value: 'blue', label: 'Azul Institucional' },
                { value: 'rose', label: 'Rosa / Reserva' }
              ]}
            />
          </div>

          {/* REAL-TIME PREVIEW OF CALCULATED MONETARY VALUE */}
          {fundPct !== '' && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 text-xs font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Monto mensual calculado:</span>
                <strong className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(baseIncome * (Number(fundPct) / 100), currency)}
                </strong>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Basado en base de ingresos de {formatCurrency(baseIncome, currency)}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <ExecutiveButton variant="ghost" type="button" onClick={() => setIsFundModalOpen(false)}>
              Cancelar
            </ExecutiveButton>
            <ExecutiveButton variant="primary" type="submit" accentColor="emerald">
              {editingFund ? 'Guardar Cambios' : 'Crear Fondo'}
            </ExecutiveButton>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>

      {/* CREATE / EDIT CATEGORY MODAL */}
      <ExecutiveModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? 'Editar Categoría' : 'Nueva Categoría (Nivel 2)'}
        accentColor="blue"
      >
        <ExecutiveForm onSubmit={handleSaveCat}>
          <div className="grid grid-cols-4 gap-2 items-center">
            <ExecutiveInput
              label="Emoji"
              value={catEmoji}
              onChange={e => setCatEmoji(e.target.value)}
              accentColor="blue"
            />
            <div className="col-span-3">
              <ExecutiveInput
                label="Nombre de la Categoría *"
                placeholder="Ej: Gasolina, Alimentación, Arriendo"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                accentColor="blue"
                required
              />
            </div>
          </div>

          <ExecutiveInput
            label="Porcentaje Asignado dentro de su Fondo (%) *"
            type="number"
            placeholder="50"
            value={catPct}
            onChange={e => setCatPct(e.target.value === '' ? '' : Number(e.target.value))}
            accentColor="blue"
            required
          />

          {catPct !== '' && targetFundForCat && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 text-xs font-mono space-y-1 text-slate-300">
              {(() => {
                const targetFund = plan.funds.find(f => f.id === targetFundForCat);
                if (!targetFund) return null;
                const fBudget = baseIncome * ((targetFund.percentage || 0) / 100);
                const cBudget = fBudget * (Number(catPct) / 100);
                const effPct = (targetFund.percentage * Number(catPct)) / 100;

                return (
                  <>
                    <div className="flex justify-between">
                      <span>Monto mensual para esta categoría:</span>
                      <strong className="text-blue-300 font-bold text-sm">{formatCurrency(cBudget, currency)}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Representa el {catPct}% de {targetFund.name} ({effPct.toFixed(1)}% del ingreso total)
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <ExecutiveButton variant="ghost" type="button" onClick={() => setIsCatModalOpen(false)}>
              Cancelar
            </ExecutiveButton>
            <ExecutiveButton variant="primary" type="submit" accentColor="blue">
              {editingCat ? 'Guardar Cambios' : 'Crear Categoría'}
            </ExecutiveButton>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>

      {/* CREATE / EDIT SUBCATEGORY MODAL */}
      <ExecutiveModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={editingSub ? 'Editar Subcategoría' : 'Nueva Subcategoría (Nivel 3)'}
        accentColor="purple"
      >
        <ExecutiveForm onSubmit={handleSaveSub}>
          <div className="grid grid-cols-4 gap-2 items-center">
            <ExecutiveInput
              label="Emoji"
              value={subEmoji}
              onChange={e => setSubEmoji(e.target.value)}
              accentColor="purple"
            />
            <div className="col-span-3">
              <ExecutiveInput
                label="Nombre de Subcategoría *"
                placeholder="Ej: Gasolina, Peajes, Parqueaderos"
                value={subName}
                onChange={e => setSubName(e.target.value)}
                accentColor="purple"
                required
              />
            </div>
          </div>

          <ExecutiveInput
            label="Porcentaje dentro de la Categoría (%) *"
            type="number"
            placeholder="50"
            value={subPct}
            onChange={e => setSubPct(e.target.value === '' ? '' : Number(e.target.value))}
            accentColor="purple"
            required
          />

          {subPct !== '' && targetCatForSub && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 text-xs font-mono space-y-1 text-slate-300">
              {(() => {
                const targetFund = plan.funds.find(f => f.id === targetCatForSub.fundId);
                const targetCat = targetFund?.categories.find(c => c.id === targetCatForSub.catId);
                if (!targetFund || !targetCat) return null;

                const fBudget = baseIncome * ((targetFund.percentage || 0) / 100);
                const cBudget = fBudget * ((targetCat.percentage || 0) / 100);
                const sBudget = cBudget * (Number(subPct) / 100);

                return (
                  <>
                    <div className="flex justify-between">
                      <span>Monto mensual para subcategoría:</span>
                      <strong className="text-purple-300 font-bold text-sm">{formatCurrency(sBudget, currency)}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {subPct}% de {targetCat.name}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <ExecutiveButton variant="ghost" type="button" onClick={() => setIsSubModalOpen(false)}>
              Cancelar
            </ExecutiveButton>
            <ExecutiveButton variant="primary" type="submit" accentColor="purple">
              {editingSub ? 'Guardar Cambios' : 'Crear Subcategoría'}
            </ExecutiveButton>
          </div>
        </ExecutiveForm>
      </ExecutiveModal>
    </div>
  );
}

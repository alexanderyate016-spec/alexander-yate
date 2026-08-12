import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FinancialOfficeData,
  FinancialAccount,
  FinancialTransaction,
  FinancialObligation,
  InvestmentPosition,
  CurrencyCode,
  TransactionNature
} from '../../types/store';
import { FinancialStore } from './FinancialStore';
import { FinancialCalculations } from './FinancialCalculations';
import { FinancialDistributionView } from './FinancialDistributionView';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dates';
import { formatCurrency } from '../../utils/formatters';
import {
  GlassPanel,
  ExecutiveCard,
  ExecutiveButton,
  ExecutiveMetricCard,
  ExecutiveSectionHeader,
  ExecutiveBadge,
  ExecutiveEmptyState,
  ExecutiveInput,
  ExecutiveSelect,
  ExecutiveForm,
  ExecutiveModal
} from '../../components/executive';
import {
  Landmark,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PieChart,
  BarChart3,
  Target,
  PiggyBank,
  Sparkles,
  Layers,
  Edit2,
  ChevronRight,
  ArrowRight,
  Filter,
  Check,
  Activity,
  X,
  Clock,
  ShieldAlert,
  Repeat,
  RefreshCw,
  Archive,
  RotateCcw,
  LineChart,
  FileText,
  Send,
  ArrowLeftRight,
  Settings,
  Info,
  Briefcase,
  Eye,
  EyeOff,
  Minus
} from 'lucide-react';

interface Props {
  data: FinancialOfficeData;
}

// Discrete Toast Notification
interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'danger';
}

// Animated Progress Bar with Specular Liquid Glow
const AnimatedProgressBar: React.FC<{ percent: number; color?: 'emerald' | 'amber' | 'rose' | 'purple' | 'gold'; height?: string }> = ({
  percent,
  color = 'emerald',
  height = 'h-3'
}) => {
  const safePercent = Math.min(100, Math.max(0, percent || 0));

  const gradientMap = {
    emerald: 'from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    amber: 'from-amber-500 via-yellow-400 to-[#C5A059] shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    rose: 'from-rose-500 via-pink-400 to-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    purple: 'from-purple-500 via-indigo-400 to-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    gold: 'from-[#C5A059] via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(197,160,89,0.5)]'
  };

  return (
    <div className={`w-full bg-slate-50 rounded-full ${height} overflow-hidden border border-slate-200 relative p-0.5 shadow-inner`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradientMap[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
};

// Visual Segmented Gauge Bar
const VisualGaugeBar: React.FC<{ label: string; percent: number; color: 'emerald' | 'amber' | 'rose' | 'purple'; valueText: string }> = ({
  label,
  percent,
  color,
  valueText
}) => {
  const barsCount = 10;
  const filledBars = Math.min(10, Math.max(0, Math.round((percent / 100) * barsCount)));

  return (
    <div className="space-y-1.5 p-3 bg-white/90 border border-slate-200 rounded-xl hover:border-emerald-400/40 transition-all">
      <div className="flex justify-between items-center text-xs">
        <span className="font-serif font-bold text-slate-700">{label}</span>
        <span className="font-mono font-bold text-white">{valueText}</span>
      </div>
      <div className="flex items-center gap-1 font-mono text-xs">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: barsCount }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm transition-all duration-300 ${
                i < filledBars
                  ? color === 'emerald'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : color === 'amber'
                    ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : color === 'rose'
                    ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                  : 'bg-slate-100 border border-slate-100'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-slate-500 ml-1 font-bold">{Math.round(percent)}%</span>
      </div>
    </div>
  );
};

// SVG Balance Evolution Chart for Account Panel
const BalanceEvolutionChart: React.FC<{ history: Array<{ date: string; balance: number; delta: number; description: string }>; currency: CurrencyCode }> = ({
  history,
  currency
}) => {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-500 italic p-4 text-center">Sin datos suficientes para construir el gráfico de evolución.</p>;
  }

  const points = history.slice(-25);
  const minBal = Math.min(...points.map(p => p.balance));
  const maxBal = Math.max(...points.map(p => p.balance));
  const range = maxBal - minBal === 0 ? 1 : maxBal - minBal;

  const width = 600;
  const height = 180;
  const padding = 35;

  const coords = points.map((p, i) => {
    const x = padding + (i / Math.max(points.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - ((p.balance - minBal) / range) * (height - 2 * padding);
    return { x, y, point: p };
  });

  const pathD = coords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-mono text-slate-500">
        <span>Min: {formatCurrency(minBal, currency)}</span>
        <span className="text-emerald-400 font-bold">Máx: {formatCurrency(maxBal, currency)}</span>
      </div>

      <div className="w-full overflow-x-auto bg-[#081220]/90 p-3 rounded-2xl border border-slate-200 shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.12)" />

          {/* Area */}
          <path d={areaD} fill="url(#balanceGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {coords.map((c, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={c.x} cy={c.y} r="4.5" fill="#10B981" stroke="#060D17" strokeWidth="2" />
              <circle cx={c.x} cy={c.y} r="8" fill="none" stroke="#34D399" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 transition-opacity" />
              <title>{`${c.point.date}: ${formatCurrency(c.point.balance, currency)} (${c.point.description})`}</title>
            </g>
          ))}
        </svg>
      </div>
      <p className="text-[10px] text-slate-500 text-center italic">Pasa el cursor sobre los puntos para ver fecha, concepto y saldo acumulado.</p>
    </div>
  );
};

export const FinancialView: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'accounts' | 'budgets' | 'expenses' | 'income' | 'savings' | 'obligations' | 'investments' | 'transactions'
  >('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const todayStr = getTodayDateString();
  const timeStr = getCurrentTimeString();

  // Digital Wallet Visibility & Quick Action State
  const [showBalance, setShowBalance] = useState(true);
  const [quickActionModal, setQuickActionModal] = useState<'income' | 'expense' | 'transfer' | null>(null);

  // Toast Notification Trigger
  const triggerToast = (text: string, type: 'success' | 'info' | 'warning' | 'danger' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev.slice(-2), { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Recent Transactions & Category Emojis for Digital Wallet
  const getCategoryEmoji = (tx: FinancialTransaction) => {
    if (tx.nature === 'external_income' || tx.nature === 'financial_yield') return '💰';
    if (tx.nature === 'internal_transfer') return '↔️';
    if (tx.nature === 'investment_buy') return '📈';
    if (tx.nature === 'investment_sell') return '📉';
    const cat = (tx.categoryId || tx.description || '').toLowerCase();
    if (cat.includes('aliment') || cat.includes('comida') || cat.includes('restaurante') || cat.includes('mercado') || cat.includes('super')) return '🛒';
    if (cat.includes('educa') || cat.includes('universid') || cat.includes('curso') || cat.includes('libro')) return '📚';
    if (cat.includes('salud') || cat.includes('médic') || cat.includes('farmacia') || cat.includes('droguería')) return '💊';
    if (cat.includes('vivienda') || cat.includes('arriendo') || cat.includes('alquiler') || cat.includes('casa')) return '🏠';
    if (cat.includes('transporte') || cat.includes('gasolina') || cat.includes('uber') || cat.includes('taxi')) return '🚗';
    if (cat.includes('servicio') || cat.includes('luz') || cat.includes('agua') || cat.includes('internet')) return '⚡';
    if (cat.includes('entretenimiento') || cat.includes('cine') || cat.includes('salida') || cat.includes('ocio')) return '🎟️';
    return '💸';
  };

  const formatRelativeTxDate = (dateStr?: string) => {
    if (!dateStr) return 'Reciente';
    if (dateStr === todayStr) return 'Hoy';
    const yesterday = new Date(new Date(todayStr).getTime() - 86400000).toISOString().split('T')[0];
    if (dateStr === yesterday) return 'Ayer';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]} ${months[mIdx] || ''}`;
    }
    return dateStr;
  };

  const recentTransactions = useMemo(() => {
    const list = [...(data.transactions || [])];
    list.sort((a, b) => {
      const dateComp = (b.date || '').localeCompare(a.date || '');
      if (dateComp !== 0) return dateComp;
      return (b.time || '').localeCompare(a.time || '');
    });
    return list.slice(0, 6);
  }, [data.transactions]);

  // AUTOMATIC DAILY YIELDS PROCESSOR ON MOUNT
  useEffect(() => {
    FinancialStore.processDailyYields(todayStr);
  }, [todayStr]);

  // Account Operations & Panel State
  const [accountViewFilter, setAccountViewFilter] = useState<'active' | 'archived'>('active');
  const [selectedAccountForPanel, setSelectedAccountForPanel] = useState<FinancialAccount | null>(null);
  const [accountPanelTab, setAccountPanelTab] = useState<'stats' | 'chart' | 'obligations' | 'movements'>('stats');
  const [quickActionType, setQuickActionType] = useState<'transfer' | 'income' | 'expense' | 'yield' | 'edit' | null>(null);

  // Manual Yield Form State
  const [manualYieldAmount, setManualYieldAmount] = useState<number | ''>('');
  const [manualYieldDesc, setManualYieldDesc] = useState('');

  // Edit Account Form State
  const [editAccName, setEditAccName] = useState('');
  const [editAccInst, setEditAccInst] = useState('');
  const [editAccType, setEditAccType] = useState<'cash' | 'checking' | 'savings' | 'high_yield' | 'digital_wallet' | 'investment' | 'other'>('savings');
  const [editAccCurrency, setEditAccCurrency] = useState<CurrencyCode>('COP');
  const [editAccInitial, setEditAccInitial] = useState<number | ''>('');
  const [editAccInterest, setEditAccInterest] = useState<number | ''>('');

  // Investment Assets Modal State
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [selectedInvestmentAcc, setSelectedInvestmentAcc] = useState<FinancialAccount | null>(null);
  const [investmentAssetTab, setInvestmentAssetTab] = useState<'stocks' | 'etfs' | 'bonds' | 'crypto' | 'funds'>('stocks');

  // Sync edit state when account selected
  useEffect(() => {
    if (selectedAccountForPanel) {
      setEditAccName(selectedAccountForPanel.name);
      setEditAccInst(selectedAccountForPanel.institution || '');
      setEditAccType(selectedAccountForPanel.type);
      setEditAccCurrency(selectedAccountForPanel.currency);
      setEditAccInitial(selectedAccountForPanel.initialBalance || 0);
      setEditAccInterest(selectedAccountForPanel.annualInterestRate || '');
    }
  }, [selectedAccountForPanel]);

  // Active / Archived Accounts Memo
  const activeAccounts = useMemo(() => (data.accounts || []).filter(a => !a.archived), [data.accounts]);
  const archivedAccounts = useMemo(() => (data.accounts || []).filter(a => a.archived), [data.accounts]);
  const displayedAccounts = accountViewFilter === 'active' ? activeAccounts : archivedAccounts;

  // Yields Summary Memo
  const yieldsSummary = useMemo(() => {
    return FinancialCalculations.calculateYieldsSummary(data.transactions || [], todayStr, 'COP');
  }, [data.transactions, todayStr]);

  const hasHighYieldAccounts = useMemo(() => {
    return (data.accounts || []).some(a => a.type === 'high_yield');
  }, [data.accounts]);

  // Budget & Category Options Memo
  const budgetOptions = useMemo(() => {
    const funds = data.distributionPlan?.funds || [];
    if (funds.length === 0) {
      return [
        { id: 'fund_necesarios', name: 'Presupuesto de Gastos Necesarios', rawName: 'Gastos Necesarios', emoji: '🏠', categories: [] },
        { id: 'fund_personales', name: 'Presupuesto de Gastos Personales', rawName: 'Gastos Personales', emoji: '🎟️', categories: [] },
        { id: 'fund_ahorro', name: 'Presupuesto de Ahorro e Inversión', rawName: 'Ahorro e Inversión', emoji: '🏦', categories: [] }
      ];
    }
    return funds.map(f => ({
      id: f.id,
      name: f.name.startsWith('Presupuesto') ? f.name : `Presupuesto de ${f.name}`,
      rawName: f.name,
      emoji: f.emoji || '💼',
      categories: f.categories || []
    }));
  }, [data.distributionPlan]);

  const getCategoryOptionsForBudget = (budgetIdStr: string) => {
    if (!budgetIdStr) return [];
    const fund = (data.distributionPlan?.funds || []).find(f => f.id === budgetIdStr);
    if (!fund || !fund.categories || fund.categories.length === 0) return [];

    const baseIncome = (data.distributionPlan?.monthlyBaseIncome) || 0;
    const fundTargetBudget = baseIncome * ((fund.percentage || 0) / 100);

    return fund.categories.map(cat => {
      const catBudget = fundTargetBudget * ((cat.percentage || 0) / 100);
      const catUsed = FinancialCalculations.calculateCategoryUsedAmount(fund.id, cat.id, cat.name, data.transactions, todayStr.substring(0, 7)).amount;
      const catRemaining = catBudget - catUsed;
      return {
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji || '📁',
        budget: catBudget,
        used: catUsed,
        remaining: catRemaining,
        label: `${cat.emoji || '📁'} ${cat.name} (Disponible: ${formatCurrency(catRemaining, txCurr)})`
      };
    });
  };

  // Modals & Sub-states
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [payingObligationModal, setPayingObligationModal] = useState<FinancialObligation | null>(null);
  const [savingContributionModal, setSavingContributionModal] = useState<any | null>(null);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<{ name: string; type: 'expense' | 'income'; categoryId?: string } | null>(null);

  // New Account State
  const [accName, setAccName] = useState('');
  const [accInst, setAccInst] = useState('');
  const [accType, setAccType] = useState<'cash' | 'checking' | 'savings' | 'high_yield' | 'digital_wallet' | 'investment' | 'other'>('savings');
  const [accCurrency, setAccCurrency] = useState<CurrencyCode>('COP');
  const [accInitial, setAccInitial] = useState<number | ''>('');
  const [accInterest, setAccInterest] = useState<number | ''>('');

  // New Transaction State
  const [txNature, setTxNature] = useState<TransactionNature>('external_expense');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txCurr, setTxCurr] = useState<CurrencyCode>('COP');
  const [txSourceAcc, setTxSourceAcc] = useState('');
  const [txDestAcc, setTxDestAcc] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txBudgetId, setTxBudgetId] = useState('');
  const [txBudgetCategoryId, setTxBudgetCategoryId] = useState('');
  const [isSplitExpense, setIsSplitExpense] = useState(false);
  const [txSplits, setTxSplits] = useState<Array<{ id: string; budgetId: string; budgetCategoryId: string; categoryName: string; amount: number; description: string }>>([]);
  const [txSourceName, setTxSourceName] = useState('');
  const [txBeneficiaryName, setTxBeneficiaryName] = useState('');
  const [txAssetName, setTxAssetName] = useState('');
  const [txAssetQuantity, setTxAssetQuantity] = useState<number | ''>('');
  const [txUnitPrice, setTxUnitPrice] = useState<number | ''>('');
  const [txReconciliationReason, setTxReconciliationReason] = useState('');
  const [txReconciliationUser, setTxReconciliationUser] = useState('');

  // Transaction Editing State
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState<number | ''>('');
  const [editSourceAcc, setEditSourceAcc] = useState('');
  const [editDestAcc, setEditDestAcc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editBudgetId, setEditBudgetId] = useState('');
  const [editBudgetCategoryId, setEditBudgetCategoryId] = useState('');
  const [editIsSplitExpense, setEditIsSplitExpense] = useState(false);
  const [editSplits, setEditSplits] = useState<Array<{ id: string; budgetId?: string; budgetCategoryId?: string; categoryName?: string; amount: number; description?: string }>>([]);

  // New Obligation State
  const [obTitle, setObTitle] = useState('');
  const [obAmount, setObAmount] = useState<number | ''>('');
  const [obCurr, setObCurr] = useState<CurrencyCode>('COP');
  const [obDueDate, setObDueDate] = useState(todayStr);
  const [obFrequency, setObFrequency] = useState<'one_time' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly');
  const [obCategory, setObCategory] = useState('Servicios / Suscripciones');

  // Obligation Payment Form State
  const [paymentSourceAccount, setPaymentSourceAccount] = useState('');

  // New Budget State
  const [bdgName, setBdgName] = useState('');
  const [bdgCategory, setBdgCategory] = useState('all');
  const [bdgLimit, setBdgLimit] = useState<number | ''>('');
  const [bdgCurr, setBdgCurr] = useState<CurrencyCode>('COP');
  const [bdgPeriod, setBdgPeriod] = useState<'monthly' | 'weekly' | 'annual' | 'custom'>('monthly');
  const [bdgStartDate, setBdgStartDate] = useState('');
  const [bdgEndDate, setBdgEndDate] = useState('');

  // New Saving Goal State
  const [svgName, setSvgName] = useState('');
  const [svgTarget, setSvgTarget] = useState<number | ''>('');
  const [svgCurrent, setSvgCurrent] = useState<number | ''>(0);
  const [svgCurr, setSvgCurr] = useState<CurrencyCode>('COP');
  const [svgTargetDate, setSvgTargetDate] = useState('');
  const [svgLinkedAcc, setSvgLinkedAcc] = useState('');

  // Saving Contribution State
  const [contributionAmount, setContributionAmount] = useState<number | ''>('');
  const [contributionSourceAcc, setContributionSourceAcc] = useState('');

  // New Investment State
  const [invAsset, setInvAsset] = useState('');
  const [invType, setInvType] = useState('Acción / ETF');
  const [invQuantity, setInvQuantity] = useState<number | ''>('');
  const [invBuyPrice, setInvBuyPrice] = useState<number | ''>('');
  const [invCurrPrice, setInvCurrPrice] = useState<number | ''>('');
  const [invCurrency, setInvCurrency] = useState<CurrencyCode>('COP');

  // Master Calculations
  const liquidNW = useMemo(() => FinancialCalculations.calculateLiquidNetWorth(data), [data]);
  const investedNW = useMemo(() => FinancialCalculations.calculateInvestedNetWorth(data), [data]);
  const totalNW = useMemo(() => FinancialCalculations.calculateTotalNetWorth(data), [data]);
  const smartAlerts = useMemo(() => FinancialCalculations.generateSmartAlerts(data, todayStr), [data, todayStr]);

  // Expenses Analytics Breakdown
  const expenseAnalytics = useMemo(() => {
    const txs = (data.transactions || []).filter(t => t.nature === 'external_expense' || t.nature === 'investment_buy');
    
    // Time filters
    const currentYear = todayStr.substring(0, 4);
    const currentMonth = todayStr.substring(0, 7);

    // Calculate last 7 days
    const todayD = new Date(todayStr);
    const sevenAgo = new Date(todayD);
    sevenAgo.setDate(todayD.getDate() - 7);
    const sevenAgoStr = sevenAgo.toISOString().split('T')[0];

    const todayTotal = txs.filter(t => t.date === todayStr).reduce((s, t) => s + t.amount, 0);
    const weekTotal = txs.filter(t => t.date >= sevenAgoStr && t.date <= todayStr).reduce((s, t) => s + t.amount, 0);
    const monthTotal = txs.filter(t => t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0);
    const yearTotal = txs.filter(t => t.date.startsWith(currentYear)).reduce((s, t) => s + t.amount, 0);

    // Grouping by Category
    const categoryMap: Record<string, { name: string; amount: number; count: number }> = {};
    txs.forEach(t => {
      const catName = t.categoryId || 'General / Otros';
      if (!categoryMap[catName]) categoryMap[catName] = { name: catName, amount: 0, count: 0 };
      categoryMap[catName].amount += t.amount;
      categoryMap[catName].count += 1;
    });

    // Grouping by Account
    const accountMap: Record<string, { name: string; amount: number }> = {};
    txs.forEach(t => {
      const acc = data.accounts.find(a => a.id === t.sourceAccountId);
      const accName = acc ? acc.name : 'Cuenta Externa / Efectivo';
      if (!accountMap[accName]) accountMap[accName] = { name: accName, amount: 0 };
      accountMap[accName].amount += t.amount;
    });

    // Grouping by Currency
    const currencyMap: Record<string, number> = {};
    txs.forEach(t => {
      currencyMap[t.currency] = (currencyMap[t.currency] || 0) + t.amount;
    });

    const categoryList = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
    const accountList = Object.values(accountMap).sort((a, b) => b.amount - a.amount);

    return { todayTotal, weekTotal, monthTotal, yearTotal, categoryList, accountList, currencyMap, totalExpenses: txs.reduce((s, t) => s + t.amount, 0) };
  }, [data.transactions, data.accounts, todayStr]);

  // Income Analytics Breakdown
  const incomeAnalytics = useMemo(() => {
    const txs = (data.transactions || []).filter(t => t.nature === 'external_income' || t.nature === 'financial_yield' || t.nature === 'investment_sell');

    const currentYear = todayStr.substring(0, 4);
    const currentMonth = todayStr.substring(0, 7);

    const todayD = new Date(todayStr);
    const sevenAgo = new Date(todayD);
    sevenAgo.setDate(todayD.getDate() - 7);
    const sevenAgoStr = sevenAgo.toISOString().split('T')[0];

    const todayTotal = txs.filter(t => t.date === todayStr).reduce((s, t) => s + t.amount, 0);
    const weekTotal = txs.filter(t => t.date >= sevenAgoStr && t.date <= todayStr).reduce((s, t) => s + t.amount, 0);
    const monthTotal = txs.filter(t => t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0);
    const yearTotal = txs.filter(t => t.date.startsWith(currentYear)).reduce((s, t) => s + t.amount, 0);

    const categoryMap: Record<string, { name: string; amount: number; count: number }> = {};
    txs.forEach(t => {
      const catName = t.nature === 'financial_yield' ? 'Rendimientos Financieros' : (t.categoryId || 'Ingreso Principal');
      if (!categoryMap[catName]) categoryMap[catName] = { name: catName, amount: 0, count: 0 };
      categoryMap[catName].amount += t.amount;
      categoryMap[catName].count += 1;
    });

    const accountMap: Record<string, { name: string; amount: number }> = {};
    txs.forEach(t => {
      const acc = data.accounts.find(a => a.id === t.destinationAccountId);
      const accName = acc ? acc.name : 'Cuenta Destino';
      if (!accountMap[accName]) accountMap[accName] = { name: accName, amount: 0 };
      accountMap[accName].amount += t.amount;
    });

    const categoryList = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
    const accountList = Object.values(accountMap).sort((a, b) => b.amount - a.amount);

    return { todayTotal, weekTotal, monthTotal, yearTotal, categoryList, accountList, totalIncome: txs.reduce((s, t) => s + t.amount, 0) };
  }, [data.transactions, data.accounts, todayStr]);

  // Overall Budget & Savings Totals
  const budgetSummary = useMemo(() => {
    const budgets = data.budgets || [];
    let totalAssigned = 0;
    let totalSpent = 0;

    budgets.forEach((b: any) => {
      totalAssigned += b.monthlyLimit || 0;
      totalSpent += FinancialCalculations.calculateBudgetSpent(b, data.transactions || [], todayStr);
    });

    const overallPct = totalAssigned > 0 ? (totalSpent / totalAssigned) * 100 : 0;
    return { totalAssigned, totalSpent, overallPct, count: budgets.length };
  }, [data.budgets, data.transactions, todayStr]);

  const savingsSummary = useMemo(() => {
    const goals = data.savings || [];
    let totalTarget = 0;
    let totalCurrent = 0;

    goals.forEach((g: any) => {
      totalTarget += g.targetAmount || 0;
      totalCurrent += g.currentAmount || 0;
    });

    const overallPct = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    return { totalTarget, totalCurrent, overallPct, count: goals.length };
  }, [data.savings]);

  // Sorted Obligations by Urgency
  const sortedObligations = useMemo(() => {
    return [...(data.obligations || [])].sort((a, b) => {
      const stA = FinancialCalculations.getObligationStatus(a.dueDate, a.isPaid, todayStr);
      const stB = FinancialCalculations.getObligationStatus(b.dueDate, b.isPaid, todayStr);

      const orderMap = { overdue: 1, due_soon: 2, pending: 3, paid: 4 };
      if (orderMap[stA.status] !== orderMap[stB.status]) {
        return orderMap[stA.status] - orderMap[stB.status];
      }
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [data.obligations, todayStr]);

  // Handlers
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    FinancialStore.addAccount({
      name: accName.trim(),
      institution: accInst.trim() || 'Entidad Financiera',
      type: accType,
      currency: accCurrency,
      initialBalance: Number(accInitial || 0),
      annualInterestRate: accType === 'high_yield' && accInterest ? Number(accInterest) : undefined
    });
    setAccName('');
    setAccInst('');
    setAccInitial('');
    setAccInterest('');
    triggerToast(`Cuenta "${accName}" registrada con éxito 🏦`);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim()) return;

    // Calculate final amount depending on nature
    let finalAmount = Number(txAmount) || 0;
    if (isSplitExpense && txSplits.length > 0) {
      finalAmount = txSplits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    } else if ((txNature === 'investment_buy' || txNature === 'investment_sell') && txAssetQuantity && txUnitPrice) {
      finalAmount = Number(txAssetQuantity) * Number(txUnitPrice);
    }

    if (finalAmount <= 0) return;

    FinancialStore.addTransaction({
      date: todayStr,
      time: timeStr,
      nature: txNature,
      description: txDesc.trim(),
      amount: finalAmount,
      currency: txCurr,
      sourceAccountId: txSourceAcc || undefined,
      destinationAccountId: txDestAcc || undefined,
      sourceName: txSourceName.trim() || undefined,
      beneficiaryName: txBeneficiaryName.trim() || undefined,
      assetName: txAssetName.trim() || undefined,
      assetQuantity: txAssetQuantity ? Number(txAssetQuantity) : undefined,
      unitPrice: txUnitPrice ? Number(txUnitPrice) : undefined,
      reconciliationReason: txReconciliationReason.trim() || undefined,
      reconciliationUser: txReconciliationUser.trim() || undefined,
      categoryId: txCategory || undefined,
      budgetId: isSplitExpense ? undefined : (txBudgetId || undefined),
      budgetCategoryId: isSplitExpense ? undefined : (txBudgetCategoryId || undefined),
      splits: isSplitExpense ? txSplits.filter(s => Number(s.amount) > 0) : undefined,
      tags: []
    });

    setTxDesc('');
    setTxAmount('');
    setTxBudgetId('');
    setTxBudgetCategoryId('');
    setIsSplitExpense(false);
    setTxSplits([]);
    setTxSourceName('');
    setTxBeneficiaryName('');
    setTxAssetName('');
    setTxAssetQuantity('');
    setTxUnitPrice('');
    setTxReconciliationReason('');
    setTxReconciliationUser('');
    triggerToast(`Movimiento "${txDesc}" registrado correctamente 💳`);
  };

  const handleOpenEditTransaction = (tx: FinancialTransaction) => {
    setEditingTx(tx);
    setEditDate(tx.date || todayStr);
    setEditDesc(tx.description || '');
    setEditAmount(tx.amount || '');
    setEditSourceAcc(tx.sourceAccountId || '');
    setEditDestAcc(tx.destinationAccountId || '');
    setEditCategory(tx.categoryId || '');
    setEditBudgetId(tx.budgetId || '');
    setEditBudgetCategoryId(tx.budgetCategoryId || '');
    setEditIsSplitExpense(Boolean(tx.splits && tx.splits.length > 0));
    setEditSplits(tx.splits ? tx.splits.map(s => ({ ...s })) : []);
  };

  const handleSaveEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editDesc.trim()) return;

    let finalAmount = Number(editAmount) || 0;
    if (editIsSplitExpense && editSplits.length > 0) {
      finalAmount = editSplits.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    }

    if (finalAmount <= 0) return;

    FinancialStore.updateTransaction(editingTx.id, {
      date: editDate,
      description: editDesc.trim(),
      amount: finalAmount,
      sourceAccountId: editSourceAcc || undefined,
      destinationAccountId: editDestAcc || undefined,
      categoryId: editCategory || undefined,
      budgetId: editIsSplitExpense ? undefined : (editBudgetId || undefined),
      budgetCategoryId: editIsSplitExpense ? undefined : (editBudgetCategoryId || undefined),
      splits: editIsSplitExpense ? editSplits.filter(s => Number(s.amount) > 0) : undefined
    });

    setEditingTx(null);
    triggerToast(`Movimiento actualizado y presupuestos recalculados 🔄`, 'success');
  };

  const handleCreateObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obTitle.trim() || !obAmount || Number(obAmount) <= 0) return;
    FinancialStore.addObligation({
      title: obTitle.trim(),
      amount: Number(obAmount),
      currency: obCurr,
      dueDate: obDueDate,
      frequency: obFrequency,
      category: obCategory
    });
    setObTitle('');
    setObAmount('');
    triggerToast(`Obligación "${obTitle}" programada 🗓️`);
  };

  const handlePayObligationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingObligationModal) return;
    FinancialStore.payObligationWithAccount(payingObligationModal.id, paymentSourceAccount || undefined, todayStr, timeStr);
    triggerToast(`✓ Obligación "${payingObligationModal.title}" pagada con éxito`, 'success');
    setPayingObligationModal(null);
    setPaymentSourceAccount('');
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bdgName.trim() || !bdgLimit || Number(bdgLimit) <= 0) return;
    FinancialStore.addBudget({
      name: bdgName.trim(),
      categoryId: bdgCategory,
      monthlyLimit: Number(bdgLimit),
      currency: bdgCurr,
      period: bdgPeriod,
      startDate: bdgStartDate || undefined,
      endDate: bdgEndDate || undefined
    });
    setBdgName('');
    setBdgLimit('');
    setIsCreatingBudget(false);
    triggerToast(`Presupuesto "${bdgName}" activado 📊`);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!svgName.trim() || !svgTarget || Number(svgTarget) <= 0) return;
    FinancialStore.addSavingGoal({
      goalName: svgName.trim(),
      targetAmount: Number(svgTarget),
      currentAmount: Number(svgCurrent || 0),
      currency: svgCurr,
      targetDate: svgTargetDate || undefined,
      accountId: svgLinkedAcc || undefined
    });
    setSvgName('');
    setSvgTarget('');
    setSvgCurrent(0);
    setIsCreatingGoal(false);
    triggerToast(`Objetivo de ahorro "${svgName}" establecido 🎯`);
  };

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingContributionModal || !contributionAmount || Number(contributionAmount) <= 0) return;
    FinancialStore.addContributionToSaving(savingContributionModal.id, Number(contributionAmount), contributionSourceAcc || undefined);
    triggerToast(`+${formatCurrency(Number(contributionAmount), savingContributionModal.currency)} sumados a "${savingContributionModal.goalName}" ✨`);
    setSavingContributionModal(null);
    setContributionAmount('');
    setContributionSourceAcc('');
  };

  const handleCreateInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAsset.trim() || !invQuantity || !invBuyPrice) return;
    FinancialStore.addInvestment({
      assetName: invAsset.trim(),
      type: invType,
      quantity: Number(invQuantity),
      avgPurchasePrice: Number(invBuyPrice),
      currentPrice: Number(invCurrPrice || invBuyPrice),
      currency: invCurrency,
      purchaseDate: todayStr
    });
    setInvAsset('');
    setInvQuantity('');
    setInvBuyPrice('');
    setInvCurrPrice('');
    triggerToast(`Posición de inversión "${invAsset}" registrada 📈`);
  };

  // Filtered Transactions
  const filteredTransactions = (data.transactions || []).filter(t =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nature.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.categoryId && t.categoryId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16 relative">
      {/* TOAST MESSAGES FLOATING CONTAINER */}
      <div className="fixed top-20 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs font-bold text-white ${
                t.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-500/20'
                  : t.type === 'warning'
                  ? 'bg-amber-950/90 border-amber-200 shadow-amber-500/20'
                  : t.type === 'danger'
                  ? 'bg-rose-950/90 border-rose-500/50 shadow-rose-500/20'
                  : 'bg-slate-50 border-blue-500/50 shadow-blue-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. SECTION HEADER INSTITUCIONAL */}
      <ExecutiveSectionHeader
        title="Oficina Financiera"
        subtitle="Centro Ejecutivo de Control Patrimonial, Tesorería, Presupuestos y Estrategia Financiera"
        icon={<Landmark className="w-6 h-6 text-emerald-400" />}
        accentColor="emerald"
        badgeText="Control Patrimonial"
        searchQuery={activeTab === 'transactions' ? searchQuery : undefined}
        onSearchChange={activeTab === 'transactions' ? setSearchQuery : undefined}
        searchPlaceholder="Buscar movimientos..."
      />

      {/* 2. BARRA DE NAVEGACIÓN Y PESTAÑAS DE LA OFICINA */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'dashboard'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Billetera
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'accounts'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Cuentas ({data.accounts.length})
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'budgets'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Presupuestos ({data.budgets?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'expenses'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-rose-400" />
          Gastos
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'income'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          Ingresos
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'savings'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <PiggyBank className="w-4 h-4 text-purple-400" />
          Ahorros ({data.savings?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('obligations')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'obligations'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          Obligaciones ({data.obligations?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('investments')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'investments'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Inversiones ({data.investments?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === 'transactions'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Movimientos ({data.transactions?.length || 0})
        </button>
      </div>

      {/* TAB 0: BILLETERA DIGITAL (DASHBOARD PRINCIPAL) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 1. HERO DIGITAL WALLET CARD: MI DINERO */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/30 text-white shadow-2xl">
            {/* Decorative Specular Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Row: Title & Hide/Show Balance Toggle */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <Wallet className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-purple-300/80 block">
                      Billetera Digital
                    </span>
                    <h2 className="text-base font-bold text-white">Mi dinero</h2>
                  </div>
                </div>

                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-200 transition-all border border-white/10 shadow-sm"
                >
                  {showBalance ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-purple-300" />
                      <span>Ocultar saldo</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-purple-300" />
                      <span>Mostrar saldo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Prominent Balance Display */}
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-purple-200/70 font-semibold">
                  Disponible
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                  {showBalance ? formatCurrency(liquidNW.COP || 0, 'COP') : '$ • • • • • •'}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {showBalance ? `Patrimonio Total: ${formatCurrency(totalNW.COP || 0, 'COP')}` : 'Saldo disponible protegido'}
                  </span>
                  {hasHighYieldAccounts && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      +{formatCurrency(yieldsSummary.month, 'COP')} rendimientos
                    </span>
                  )}
                </div>
              </div>

              {/* 2. ACCIONES PRINCIPALES (Grandes, visuales y fáciles de tocar) */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setTxNature('external_income');
                    setTxDesc('');
                    setTxAmount('');
                    setQuickActionModal('income');
                  }}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 backdrop-blur-md transition-all active:scale-95 group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-lg mb-1.5 shadow-md group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-xs font-extrabold tracking-wide">＋ Ingresar</span>
                </button>

                <button
                  onClick={() => {
                    setTxNature('external_expense');
                    setTxDesc('');
                    setTxAmount('');
                    setQuickActionModal('expense');
                  }}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 backdrop-blur-md transition-all active:scale-95 group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-lg mb-1.5 shadow-md group-hover:scale-110 transition-transform">
                    <Minus className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-xs font-extrabold tracking-wide">− Gastar</span>
                </button>

                <button
                  onClick={() => {
                    setTxNature('internal_transfer');
                    setTxDesc('');
                    setTxAmount('');
                    setQuickActionModal('transfer');
                  }}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 backdrop-blur-md transition-all active:scale-95 group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg mb-1.5 shadow-md group-hover:scale-110 transition-transform">
                    <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold tracking-wide">↔ Transferir</span>
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 backdrop-blur-md transition-all active:scale-95 group shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black text-lg mb-1.5 shadow-md group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold tracking-wide">📊 Ver movimientos</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. RESUMEN FINANCIERO (TARJETAS DE UN VISTAZO SEGUIMIENTO JERÁRQUICO) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Resumen Financiero Rápido
              </h3>
              <span className="text-xs text-slate-500 font-medium">Situación de un vistazo</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 💰 Dinero Disponible */}
              <div onClick={() => setActiveTab('accounts')} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Disponible</span>
                  <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-800">💰</span>
                </div>
                <div className="text-sm font-black font-mono text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                  {showBalance ? formatCurrency(liquidNW.COP || 0, 'COP') : '$ •••'}
                </div>
                <span className="text-[10px] text-slate-500">Cuentas y liquidez</span>
              </div>

              {/* 📈 Ingresos */}
              <div onClick={() => setActiveTab('income')} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Ingresos</span>
                  <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-800">📈</span>
                </div>
                <div className="text-sm font-black font-mono text-emerald-800 truncate">
                  {showBalance ? `+${formatCurrency(incomeAnalytics.monthTotal, 'COP')}` : '$ •••'}
                </div>
                <span className="text-[10px] text-slate-500">Ingresos este mes</span>
              </div>

              {/* 📉 Gastos */}
              <div onClick={() => setActiveTab('expenses')} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 cursor-pointer transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Gastos</span>
                  <span className="p-1 rounded-lg bg-rose-500/10 text-rose-800">📉</span>
                </div>
                <div className="text-sm font-black font-mono text-rose-800 truncate">
                  {showBalance ? `-${formatCurrency(expenseAnalytics.monthTotal, 'COP')}` : '$ •••'}
                </div>
                <span className="text-[10px] text-slate-500">Gastos este mes</span>
              </div>

              {/* 🎯 Presupuesto */}
              <div onClick={() => setActiveTab('budgets')} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 cursor-pointer transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Presupuesto</span>
                  <span className="p-1 rounded-lg bg-purple-500/10 text-purple-800">🎯</span>
                </div>
                <div className="text-sm font-black font-mono text-slate-900 group-hover:text-purple-800 transition-colors truncate">
                  {Math.round(budgetSummary.overallPct)}%
                </div>
                <span className="text-[10px] text-slate-500">Ejecutado</span>
              </div>

              {/* 💳 Compromisos */}
              <div onClick={() => setActiveTab('obligations')} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 cursor-pointer transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Compromisos</span>
                  <span className="p-1 rounded-lg bg-amber-500/10 text-amber-800">💳</span>
                </div>
                <div className="text-sm font-black font-mono text-amber-800 truncate">
                  {(data.obligations || []).filter(o => !o.isPaid).length} pendientes
                </div>
                <span className="text-[10px] text-slate-500">Por pagar</span>
              </div>

              {/* 📊 Balance Neto */}
              <div onClick={() => setActiveTab('accounts')} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all shadow-sm group">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Balance</span>
                  <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-800">📊</span>
                </div>
                <div className="text-sm font-black font-mono text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                  {showBalance ? formatCurrency(totalNW.COP || 0, 'COP') : '$ •••'}
                </div>
                <span className="text-[10px] text-slate-500">Patrimonio total</span>
              </div>
            </div>
          </div>

          {/* 4. MOVIMIENTOS RECIENTES */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Movimientos Recientes
              </h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors"
              >
                <span>Ver todos ({data.transactions?.length || 0})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No hay movimientos registrados. ¡Toca "＋ Ingresar" o "− Gastar" para añadir uno!
                </div>
              ) : (
                recentTransactions.map(tx => {
                  const isIncome = tx.nature === 'external_income' || tx.nature === 'financial_yield';
                  const isExpense = tx.nature === 'external_expense' || tx.nature === 'investment_buy';
                  const isTransfer = tx.nature === 'internal_transfer';

                  const sourceAcc = data.accounts.find(a => a.id === tx.sourceAccountId);
                  const destAcc = data.accounts.find(a => a.id === tx.destinationAccountId);

                  return (
                    <div
                      key={tx.id}
                      onClick={() => handleOpenEditTransaction(tx)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer border border-slate-100 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${
                          isIncome ? 'bg-emerald-500/15 text-emerald-800' : isExpense ? 'bg-rose-500/15 text-rose-800' : 'bg-indigo-500/15 text-indigo-800'
                        }`}>
                          {getCategoryEmoji(tx)}
                        </div>

                        <div>
                          <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {tx.description}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="font-bold text-slate-600">{formatRelativeTxDate(tx.date)}</span>
                            <span>·</span>
                            <span>{tx.categoryId || (isTransfer ? 'Transferencia' : 'General')}</span>
                            {(sourceAcc || destAcc) && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-slate-700">
                                  {isTransfer ? `${sourceAcc?.name || 'Origen'} ➔ ${destAcc?.name || 'Destino'}` : (sourceAcc?.name || destAcc?.name || 'Cuenta')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-black text-xs ${
                          isIncome ? 'text-emerald-800' : isExpense ? 'text-rose-800' : 'text-slate-800'
                        }`}>
                          {showBalance ? (
                            isIncome ? `+ ${formatCurrency(tx.amount, tx.currency)}` : isExpense ? `- ${formatCurrency(tx.amount, tx.currency)}` : formatCurrency(tx.amount, tx.currency)
                          ) : '$ •••'}
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          {tx.nature === 'financial_yield' ? 'Rendimiento' : tx.nature === 'external_income' ? 'Ingreso' : tx.nature === 'internal_transfer' ? 'Transferencia' : 'Gasto'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 5. RESUMEN VISUAL DE GASTOS Y PRESUPUESTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GASTOS: DESGLOSE POR CATEGORÍA */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Resumen de Gastos</span>
                  <h4 className="font-black text-sm text-slate-900">Principales Categorías</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total gastado este mes</span>
                  <span className="font-mono font-black text-sm text-rose-800">
                    {showBalance ? formatCurrency(expenseAnalytics.monthTotal, 'COP') : '$ •••'}
                  </span>
                </div>
              </div>

              {expenseAnalytics.categoryList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No hay gastos registrados en el periodo.</p>
              ) : (
                <div className="space-y-3">
                  {expenseAnalytics.categoryList.slice(0, 4).map(cat => {
                    const pct = expenseAnalytics.totalExpenses > 0 ? (cat.amount / expenseAnalytics.totalExpenses) * 100 : 0;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{cat.name.includes('Aliment') ? '🛒' : cat.name.includes('Educa') ? '📚' : cat.name.includes('Salud') ? '💊' : '💸'}</span>
                            {cat.name}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {showBalance ? formatCurrency(cat.amount, 'COP') : '$ •••'} ({Math.round(pct)}%)
                          </span>
                        </div>
                        <AnimatedProgressBar percent={pct} color="rose" height="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setActiveTab('expenses')}
                className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Ver análisis completo de gastos →
              </button>
            </div>

            {/* PRESUPUESTOS VISUALES */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Control de Gastos</span>
                  <h4 className="font-black text-sm text-slate-900">Mis Presupuestos</h4>
                </div>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className="text-xs font-bold text-purple-800 hover:text-purple-900 transition-colors"
                >
                  Ver todos →
                </button>
              </div>

              <div className="space-y-3">
                {budgetOptions.slice(0, 3).map(f => {
                  const fundTargetBudget = ((data.distributionPlan?.monthlyBaseIncome) || 0) * ((((data.distributionPlan?.funds || []).find(x => x.id === f.id)?.percentage) || 30) / 100);
                  const fundUsed = FinancialCalculations.calculateBudgetUsedAmount(f.id, data.transactions || [], todayStr.substring(0, 7)).amount;
                  const remaining = fundTargetBudget - fundUsed;
                  const pct = fundTargetBudget > 0 ? (fundUsed / fundTargetBudget) * 100 : 0;

                  return (
                    <div key={f.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{f.emoji}</span>
                          {f.rawName}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-600">
                          {showBalance ? `${formatCurrency(fundUsed, 'COP')} / ${formatCurrency(fundTargetBudget, 'COP')}` : '$ ••• / $ •••'}
                        </span>
                      </div>

                      <AnimatedProgressBar percent={pct} color={pct > 90 ? 'rose' : pct > 70 ? 'amber' : 'emerald'} height="h-2.5" />

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-0.5">
                        <span className={remaining >= 0 ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                          {remaining >= 0
                            ? `${showBalance ? formatCurrency(remaining, 'COP') : '$ •••'} disponibles`
                            : `${showBalance ? formatCurrency(Math.abs(remaining), 'COP') : '$ •••'} excedido`}
                        </span>
                        <span>{Math.round(pct)}% consumido</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: CUENTAS BANCARIAS Y BILLETERAS */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Apertura y Registro de Nueva Cuenta Financiera
            </h3>

            <ExecutiveForm onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Nombre de la Cuenta *"
                    placeholder="Ej: Ahorros Principal Bancolombia"
                    value={accName}
                    onChange={e => setAccName(e.target.value)}
                    accentColor="emerald"
                    required
                  />
                </div>

                <div>
                  <ExecutiveInput
                    label="Entidad / Banco"
                    placeholder="Ej: Bancolombia / Lulo Bank"
                    value={accInst}
                    onChange={e => setAccInst(e.target.value)}
                    accentColor="emerald"
                  />
                </div>

                <div>
                  <ExecutiveSelect
                    label="Tipo de Cuenta"
                    value={accType}
                    onChange={e => setAccType(e.target.value as any)}
                    accentColor="emerald"
                    options={[
                      { value: 'savings', label: 'Ahorros' },
                      { value: 'checking', label: 'Corriente' },
                      { value: 'cash', label: 'Efectivo' },
                      { value: 'high_yield', label: 'Alto Rendimiento (Nu/Lulo)' },
                      { value: 'digital_wallet', label: 'Billetera Digital (Nequi/Daviplata)' },
                      { value: 'investment', label: 'Inversión' }
                    ]}
                  />
                </div>

                <div>
                  <ExecutiveSelect
                    label="Moneda Principal"
                    value={accCurrency}
                    onChange={e => setAccCurrency(e.target.value as any)}
                    accentColor="emerald"
                    options={[
                      { value: 'COP', label: 'COP ($)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                      { value: 'BTC', label: 'BTC (₿)' },
                      { value: 'ETH', label: 'ETH (Ξ)' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                <ExecutiveInput
                  label="Saldo Inicial / Actual"
                  type="number"
                  placeholder="0.00"
                  value={accInitial}
                  onChange={e => setAccInitial(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                />

                {accType === 'high_yield' && (
                  <ExecutiveInput
                    label="Tasa de Interés Anual (E.A. %)"
                    type="number"
                    step="0.1"
                    placeholder="Ej: 13.0"
                    value={accInterest}
                    onChange={e => setAccInterest(e.target.value === '' ? '' : Number(e.target.value))}
                    accentColor="emerald"
                    helperText="Calcula rendimiento diario automático"
                  />
                )}

                <div className="sm:col-span-1 flex justify-end">
                  <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                    Crear Cuenta
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {/* FILTER & ACTIVE / ARCHIVED ACCOUNT TOGGLE BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAccountViewFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  accountViewFilter === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cuentas Activas ({activeAccounts.length})
              </button>

              <button
                onClick={() => setAccountViewFilter('archived')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  accountViewFilter === 'archived'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/5'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                Cuentas Archivadas ({archivedAccounts.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-500 italic">
              * Ningún saldo se modifica manualmente; todo cambio se origina por movimientos.
            </span>
          </div>

          {/* LISTA DE CUENTAS */}
          {displayedAccounts.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Landmark className="w-8 h-8 text-emerald-400" />}
              title={accountViewFilter === 'active' ? "Sin Cuentas Activas" : "Sin Cuentas Archivadas"}
              description={
                accountViewFilter === 'active'
                  ? "No hay cuentas activas registradas. Registra tu primera cuenta bancaria arriba."
                  : "No hay cuentas archivadas en el historial."
              }
              accentColor="emerald"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAccounts.map(acc => {
                const calculatedBalance = FinancialCalculations.calculateAccountBalance(acc, data.transactions || []);
                const dailyYieldEst = FinancialCalculations.calculateDailyYieldEstimated(acc, data.transactions || []);

                return (
                  <ExecutiveCard
                    key={acc.id}
                    accentColor={acc.archived ? 'amber' : 'emerald'}
                    accentBorderLeft
                    header={
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-white text-base">{acc.name}</h4>
                            {acc.archived && <ExecutiveBadge variant="subtle" accentColor="amber">Archivada</ExecutiveBadge>}
                          </div>
                          <p className="text-xs text-slate-500">{acc.institution || 'Entidad no esp.'} • {acc.type.replace('_', ' ')}</p>
                        </div>
                        <ExecutiveBadge variant="subtle" accentColor="emerald">
                          {acc.currency}
                        </ExecutiveBadge>
                      </div>
                    }
                    footer={
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                        <button
                          onClick={() => {
                            setSelectedAccountForPanel(acc);
                            setQuickActionType(null);
                            setAccountPanelTab('stats');
                          }}
                          className="text-emerald-400 hover:text-emerald-800 font-bold flex items-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5" /> Abrir Panel
                        </button>

                        <div className="flex items-center gap-2">
                          {acc.archived ? (
                            <button
                              onClick={() => {
                                FinancialStore.unarchiveAccount(acc.id);
                                triggerToast(`Cuenta "${acc.name}" restaurada`, 'success');
                              }}
                              className="text-amber-400 hover:text-amber-800 font-bold flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                FinancialStore.archiveAccount(acc.id);
                                triggerToast(`Cuenta "${acc.name}" archivada`, 'info');
                              }}
                              className="text-slate-500 hover:text-amber-800 font-bold flex items-center gap-1"
                            >
                              <Archive className="w-3.5 h-3.5" /> Archivar
                            </button>
                          )}
                        </div>
                      </div>
                    }
                  >
                    <div className="space-y-3 py-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Saldo Calculado</span>
                        <div className="text-2xl font-serif font-bold text-emerald-400 mt-0.5">
                          {formatCurrency(calculatedBalance, acc.currency)}
                        </div>
                      </div>

                      {acc.type === 'high_yield' && acc.annualInterestRate && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-200 space-y-0.5">
                          <div className="font-bold flex justify-between">
                            <span>TEA: {acc.annualInterestRate}%</span>
                            <span className="text-[10px] text-emerald-400 font-mono">Automático</span>
                          </div>
                          <div className="text-[11px] text-emerald-800">
                            Rendimiento diario est.: <strong>{formatCurrency(dailyYieldEst, acc.currency)}/día</strong>
                          </div>
                        </div>
                      )}

                      {/* QUICK OPERATIONS BAR ON CARD */}
                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Operaciones Rápidas:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAccountForPanel(acc);
                              setQuickActionType('transfer');
                              setTxSourceAcc(acc.id);
                              setTxNature('internal_transfer');
                            }}
                            className="px-2 py-1.5 rounded-lg bg-blue-500/15 border border-slate-200 text-blue-300 text-[11px] font-bold hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1"
                          >
                            <ArrowLeftRight className="w-3 h-3" /> Transferir
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAccountForPanel(acc);
                              setQuickActionType('income');
                              setTxDestAcc(acc.id);
                              setTxNature('external_income');
                            }}
                            className="px-2 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1"
                          >
                            <ArrowUpRight className="w-3 h-3" /> Ingreso
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAccountForPanel(acc);
                              setQuickActionType('expense');
                              setTxSourceAcc(acc.id);
                              setTxNature('external_expense');
                            }}
                            className="px-2 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold hover:bg-rose-500/30 transition-all flex items-center justify-center gap-1"
                          >
                            <ArrowDownRight className="w-3 h-3" /> Gasto
                          </button>

                          {acc.type === 'high_yield' ? (
                            <button
                              onClick={() => {
                                setSelectedAccountForPanel(acc);
                                setQuickActionType('yield');
                              }}
                              className="px-2 py-1.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-bold hover:bg-teal-500/30 transition-all flex items-center justify-center gap-1"
                            >
                              <TrendingUp className="w-3 h-3" /> Rendimiento
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAccountForPanel(acc);
                                setQuickActionType('edit');
                              }}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Editar
                            </button>
                          )}
                        </div>

                        {acc.type === 'investment' && (
                          <button
                            onClick={() => {
                              setSelectedInvestmentAcc(acc);
                              setIsInvestmentModalOpen(true);
                            }}
                            className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-200 text-purple-300 font-serif font-bold text-xs hover:bg-purple-500/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-purple-300" />
                            Administrar activos
                          </button>
                        )}
                      </div>
                    </div>
                  </ExecutiveCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLAN DE DISTRIBUCIÓN FINANCIERA */}
      {activeTab === 'budgets' && (
        <FinancialDistributionView data={data} todayStr={todayStr} triggerToast={triggerToast} />
      )}

      {/* TAB 3: ANÁLISIS DE GASTOS */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* SUMMARY CARDS BY TIMEFRAME */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Gastos de Hoy</span>
              <strong className="text-xl font-serif font-bold text-rose-400">
                {formatCurrency(expenseAnalytics.todayTotal, 'COP')}
              </strong>
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Últimos 7 Días</span>
              <strong className="text-xl font-serif font-bold text-amber-800">
                {formatCurrency(expenseAnalytics.weekTotal, 'COP')}
              </strong>
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Este Mes</span>
              <strong className="text-xl font-serif font-bold text-rose-400">
                {formatCurrency(expenseAnalytics.monthTotal, 'COP')}
              </strong>
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Este Año</span>
              <strong className="text-xl font-serif font-bold text-slate-200">
                {formatCurrency(expenseAnalytics.yearTotal, 'COP')}
              </strong>
            </GlassPanel>
          </div>

          {/* DESGLOSE POR CATEGORÍA Y POR CUENTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GASTOS POR CATEGORÍA */}
            <GlassPanel accentColor="emerald" padding="md">
              <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-rose-400" />
                  Gastos por Categoría
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Total: {formatCurrency(expenseAnalytics.totalExpenses, 'COP')}
                </span>
              </h3>

              {expenseAnalytics.categoryList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No hay registros de gastos suficientes para categorizar.</p>
              ) : (
                <div className="space-y-3">
                  {expenseAnalytics.categoryList.map(cat => {
                    const pct = expenseAnalytics.totalExpenses > 0 ? (cat.amount / expenseAnalytics.totalExpenses) * 100 : 0;
                    const emoji = FinancialCalculations.suggestEmojiForCategory(cat.name);

                    return (
                      <div
                        key={cat.name}
                        onClick={() => setSelectedCategoryDetail({ name: cat.name, type: 'expense' })}
                        className="p-3 bg-white/80 hover:bg-white border border-slate-200 hover:border-rose-400/50 rounded-xl cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-serif font-bold text-white flex items-center gap-1.5">
                            <span>{emoji}</span> {cat.name} ({cat.count})
                          </span>
                          <strong className="font-serif font-bold text-rose-400">
                            {formatCurrency(cat.amount, 'COP')}
                          </strong>
                        </div>
                        <AnimatedProgressBar percent={pct} color="rose" height="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassPanel>

            {/* GASTOS POR CUENTA */}
            <GlassPanel accentColor="emerald" padding="md">
              <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Gastos por Cuenta de Origen
              </h3>

              {expenseAnalytics.accountList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Sin movimientos de cuentas de origen registrados.</p>
              ) : (
                <div className="space-y-3">
                  {expenseAnalytics.accountList.map(acc => {
                    const pct = expenseAnalytics.totalExpenses > 0 ? (acc.amount / expenseAnalytics.totalExpenses) * 100 : 0;

                    return (
                      <div
                        key={acc.name}
                        className="p-3 bg-white/80 border border-slate-200 rounded-xl space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-serif font-bold text-white">{acc.name}</span>
                          <strong className="font-serif font-bold text-amber-800">
                            {formatCurrency(acc.amount, 'COP')}
                          </strong>
                        </div>
                        <AnimatedProgressBar percent={pct} color="amber" height="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      )}

      {/* TAB 4: ANÁLISIS DE INGRESOS */}
      {activeTab === 'income' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Ingresos de Hoy</span>
              <strong className="text-xl font-serif font-bold text-emerald-400">
                {formatCurrency(incomeAnalytics.todayTotal, 'COP')}
              </strong>
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Últimos 7 Días</span>
              <strong className="text-xl font-serif font-bold text-emerald-800">
                {formatCurrency(incomeAnalytics.weekTotal, 'COP')}
              </strong>
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Este Mes</span>
              <strong className="text-xl font-serif font-bold text-emerald-400">
                {formatCurrency(incomeAnalytics.monthTotal, 'COP')}
              </strong>
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="sm" className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Este Año</span>
              <strong className="text-xl font-serif font-bold text-slate-200">
                {formatCurrency(incomeAnalytics.yearTotal, 'COP')}
              </strong>
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassPanel accentColor="emerald" padding="md">
              <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  Fuentes e Ingresos por Categoría
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Total: {formatCurrency(incomeAnalytics.totalIncome, 'COP')}
                </span>
              </h3>

              {incomeAnalytics.categoryList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No hay registros de ingresos para analizar.</p>
              ) : (
                <div className="space-y-3">
                  {incomeAnalytics.categoryList.map(cat => {
                    const pct = incomeAnalytics.totalIncome > 0 ? (cat.amount / incomeAnalytics.totalIncome) * 100 : 0;

                    return (
                      <div
                        key={cat.name}
                        onClick={() => setSelectedCategoryDetail({ name: cat.name, type: 'income' })}
                        className="p-3 bg-white/80 hover:bg-white border border-slate-200 hover:border-emerald-400/50 rounded-xl cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-serif font-bold text-white flex items-center gap-1.5">
                            💰 {cat.name} ({cat.count})
                          </span>
                          <strong className="font-serif font-bold text-emerald-400">
                            {formatCurrency(cat.amount, 'COP')}
                          </strong>
                        </div>
                        <AnimatedProgressBar percent={pct} color="emerald" height="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassPanel>

            <GlassPanel accentColor="emerald" padding="md">
              <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-800" />
                Ingresos por Cuenta de Destino
              </h3>

              {incomeAnalytics.accountList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Sin cuentas destino registradas.</p>
              ) : (
                <div className="space-y-3">
                  {incomeAnalytics.accountList.map(acc => {
                    const pct = incomeAnalytics.totalIncome > 0 ? (acc.amount / incomeAnalytics.totalIncome) * 100 : 0;

                    return (
                      <div
                        key={acc.name}
                        className="p-3 bg-white/80 border border-slate-200 rounded-xl space-y-1.5"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-serif font-bold text-white">{acc.name}</span>
                          <strong className="font-serif font-bold text-emerald-800">
                            {formatCurrency(acc.amount, 'COP')}
                          </strong>
                        </div>
                        <AnimatedProgressBar percent={pct} color="emerald" height="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      )}

      {/* TAB 5: OBJETIVOS DE AHORRO */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Objetivos de Ahorro Patrimonial</h3>
              <p className="text-xs text-slate-500">
                Establece metas de acumulación de capital y realiza aportes con impacto directo en tus cuentas
              </p>
            </div>
            <ExecutiveButton
              variant="primary"
              accentColor="emerald"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreatingGoal(true)}
            >
              Nuevo Objetivo de Ahorro
            </ExecutiveButton>
          </div>

          {(!data.savings || data.savings.length === 0) ? (
            <ExecutiveEmptyState
              icon={<PiggyBank className="w-8 h-8 text-purple-400" />}
              title="Sin Objetivos de Ahorro"
              description="Define tu fondo de emergencia, cuota inicial o metas de viaje para monitorear el capital acumulado y tiempo restante."
              accentColor="purple"
              actionLabel="Crear Primer Objetivo"
              onAction={() => setIsCreatingGoal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.savings.map((s: any) => {
                const target = s.targetAmount || 1;
                const current = s.currentAmount || 0;
                const remaining = Math.max(0, target - current);
                const percent = (current / target) * 100;

                // Calculate time remaining
                let timeText = 'Sin fecha fija';
                if (s.targetDate) {
                  const targetD = new Date(s.targetDate);
                  const todayD = new Date(todayStr);
                  const diffDays = Math.ceil((targetD.getTime() - todayD.getTime()) / (1000 * 60 * 60 * 24));
                  timeText = diffDays > 0 ? `${diffDays} días restantes` : 'Fecha cumplida';
                }

                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ y: -3 }}
                    className="p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all shadow-lg bg-white/90 border-slate-200 hover:border-purple-400/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-serif font-bold text-white text-base">{s.goalName}</h4>
                        <span className="text-xs text-purple-300 font-mono">
                          {timeText}
                        </span>
                      </div>
                      <ExecutiveBadge variant="subtle" accentColor="purple">
                        {Math.round(percent)}%
                      </ExecutiveBadge>
                    </div>

                    <div className="space-y-3 my-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Acumulado:</span>
                          <strong className="text-purple-300 font-serif font-bold">
                            {formatCurrency(current, s.currency || 'COP')}
                          </strong>
                        </div>
                        <AnimatedProgressBar percent={percent} color="purple" height="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2 bg-slate-50 rounded-xl">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Meta Final</span>
                          <strong className="text-white">{formatCurrency(target, s.currency || 'COP')}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px]">Faltante</span>
                          <strong className="text-purple-300">{formatCurrency(remaining, s.currency || 'COP')}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <button
                        onClick={() => setSavingContributionModal(s)}
                        className="px-3 py-1.5 text-xs font-bold bg-purple-500 text-white hover:bg-purple-400 rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar Aporte
                      </button>

                      <button
                        onClick={() => {
                          FinancialStore.deleteSavingGoal(s.id);
                          triggerToast('Objetivo de ahorro eliminado', 'info');
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CREATE SAVING GOAL MODAL */}
          <ExecutiveModal
            isOpen={isCreatingGoal}
            onClose={() => setIsCreatingGoal(false)}
            title="Nuevo Objetivo de Ahorro"
            accentColor="purple"
          >
            <ExecutiveForm onSubmit={handleCreateGoal}>
              <ExecutiveInput
                label="Nombre del Objetivo *"
                placeholder="Ej: Fondo de Emergencia de 6 Meses"
                value={svgName}
                onChange={e => setSvgName(e.target.value)}
                accentColor="purple"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <ExecutiveInput
                  label="Monto Meta Objetivo *"
                  type="number"
                  placeholder="0.00"
                  value={svgTarget}
                  onChange={e => setSvgTarget(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="purple"
                  required
                />

                <ExecutiveInput
                  label="Monto Inicial Acumulado"
                  type="number"
                  placeholder="0.00"
                  value={svgCurrent}
                  onChange={e => setSvgCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="purple"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ExecutiveSelect
                  label="Moneda"
                  value={svgCurr}
                  onChange={e => setSvgCurr(e.target.value as any)}
                  accentColor="purple"
                  options={[
                    { value: 'COP', label: 'COP ($)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' }
                  ]}
                />

                <ExecutiveInput
                  label="Fecha Límite Objetivo"
                  type="date"
                  value={svgTargetDate}
                  onChange={e => setSvgTargetDate(e.target.value)}
                  accentColor="purple"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <ExecutiveButton variant="ghost" type="button" onClick={() => setIsCreatingGoal(false)}>
                  Cancelar
                </ExecutiveButton>
                <ExecutiveButton variant="primary" type="submit" accentColor="purple">
                  Guardar Objetivo
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </ExecutiveModal>

          {/* REGISTRAR APORTE AHORRO MODAL */}
          <ExecutiveModal
            isOpen={Boolean(savingContributionModal)}
            onClose={() => setSavingContributionModal(null)}
            title={`Aporte a "${savingContributionModal?.goalName}"`}
            accentColor="purple"
          >
            <ExecutiveForm onSubmit={handleContributionSubmit}>
              <ExecutiveInput
                label="Monto del Aporte *"
                type="number"
                placeholder="0.00"
                value={contributionAmount}
                onChange={e => setContributionAmount(e.target.value === '' ? '' : Number(e.target.value))}
                accentColor="purple"
                required
              />

              <ExecutiveSelect
                label="Descontar de Cuenta de Origen (Opcional)"
                value={contributionSourceAcc}
                onChange={e => setContributionSourceAcc(e.target.value)}
                accentColor="purple"
                options={[
                  { value: '', label: '-- Solo actualizar acumulado --' },
                  ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                ]}
              />

              <div className="flex justify-end gap-2 pt-3">
                <ExecutiveButton variant="ghost" type="button" onClick={() => setSavingContributionModal(null)}>
                  Cancelar
                </ExecutiveButton>
                <ExecutiveButton variant="primary" type="submit" accentColor="purple">
                  Confirmar Aporte
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </ExecutiveModal>
        </div>
      )}

      {/* TAB 6: OBLIGACIONES Y COMPROMISOS (REDISEÑO COMPLETO) */}
      {activeTab === 'obligations' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Programar Nueva Obligación / Pago Recurrente
            </h3>

            <ExecutiveForm onSubmit={handleCreateObligation}>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
                <div className="lg:col-span-2">
                  <ExecutiveInput
                    label="Concepto de la Obligación *"
                    placeholder="Ej: Arriendo Residencia / Cuota Crédito"
                    value={obTitle}
                    onChange={e => setObTitle(e.target.value)}
                    accentColor="emerald"
                    required
                  />
                </div>

                <ExecutiveInput
                  label="Monto *"
                  type="number"
                  placeholder="0.00"
                  value={obAmount}
                  onChange={e => setObAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                  required
                />

                <ExecutiveInput
                  label="Fecha Límite Vencimiento"
                  type="date"
                  value={obDueDate}
                  onChange={e => setObDueDate(e.target.value)}
                  accentColor="emerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end mt-2">
                <ExecutiveSelect
                  label="Frecuencia"
                  value={obFrequency}
                  onChange={e => setObFrequency(e.target.value as any)}
                  accentColor="emerald"
                  options={[
                    { value: 'monthly', label: 'Mensual' },
                    { value: 'bimonthly', label: 'Bimestral' },
                    { value: 'quarterly', label: 'Trimestral' },
                    { value: 'semiannual', label: 'Semestral' },
                    { value: 'annual', label: 'Anual' },
                    { value: 'one_time', label: 'Única vez' }
                  ]}
                />

                <div className="flex justify-end">
                  <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                    Agregar Obligación
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {/* GRID TARJETAS DE OBLIGACIONES ORDENADAS POR VENCIMIENTO */}
          {sortedObligations.length === 0 ? (
            <ExecutiveEmptyState
              icon={<Calendar className="w-8 h-8 text-amber-400" />}
              title="Sin Obligaciones Registradas"
              description="Registra tus servicios, tarjetas de crédito o compromisos recurrentes para mantener al día tus vencimientos."
              accentColor="amber"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedObligations.map(ob => {
                const statusInfo = FinancialCalculations.getObligationStatus(ob.dueDate, ob.isPaid, todayStr);

                return (
                  <motion.div
                    key={ob.id}
                    whileHover={{ y: -3 }}
                    className={`p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all shadow-lg bg-white/90 ${
                      statusInfo.status === 'overdue'
                        ? 'border-rose-500/60 shadow-rose-500/10'
                        : statusInfo.status === 'due_soon'
                        ? 'border-amber-400/60 shadow-amber-500/10'
                        : ob.isPaid
                        ? 'border-emerald-200 opacity-70 bg-slate-50'
                        : 'border-slate-200 hover:border-emerald-400/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className={`font-serif font-bold text-base ${ob.isPaid ? 'line-through text-slate-500' : 'text-white'}`}>
                          {ob.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                          Frecuencia: {ob.frequency || 'Mensual'}
                        </span>
                      </div>
                      <ExecutiveBadge variant="solid" accentColor={statusInfo.color}>
                        {statusInfo.label}
                      </ExecutiveBadge>
                    </div>

                    <div className="space-y-2 my-3 py-2 border-y border-slate-200">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Monto:</span>
                        <strong className="text-base font-serif font-bold text-emerald-400">
                          {formatCurrency(ob.amount, ob.currency)}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-500">Vencimiento:</span>
                        <strong className="text-slate-200">{ob.dueDate}</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {!ob.isPaid ? (
                        <button
                          onClick={() => setPayingObligationModal(ob)}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg flex items-center gap-1 transition-all shadow-md"
                        >
                          <Check className="w-4 h-4 font-bold" /> Registrar Pago
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Pagado
                        </span>
                      )}

                      <button
                        onClick={() => {
                          FinancialStore.deleteObligation(ob.id);
                          triggerToast('Obligación eliminada', 'info');
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* MODAL REGISTRAR PAGO DE OBLIGACIÓN */}
          <ExecutiveModal
            isOpen={Boolean(payingObligationModal)}
            onClose={() => setPayingObligationModal(null)}
            title={`Registrar Pago: "${payingObligationModal?.title}"`}
            accentColor="emerald"
          >
            <ExecutiveForm onSubmit={handlePayObligationSubmit}>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto a pagar:</span>
                  <strong className="text-emerald-400 font-serif text-sm">
                    {payingObligationModal && formatCurrency(payingObligationModal.amount, payingObligationModal.currency)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vencimiento:</span>
                  <span className="text-slate-200">{payingObligationModal?.dueDate}</span>
                </div>
              </div>

              <ExecutiveSelect
                label="Cuenta para efectuar el pago *"
                value={paymentSourceAccount}
                onChange={e => setPaymentSourceAccount(e.target.value)}
                accentColor="emerald"
                options={[
                  { value: '', label: '-- Seleccionar cuenta de desembolso --' },
                  ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${formatCurrency(FinancialCalculations.calculateAccountBalance(a, data.transactions || []), a.currency)})` }))
                ]}
              />

              <div className="flex justify-end gap-2 pt-3">
                <ExecutiveButton variant="ghost" type="button" onClick={() => setPayingObligationModal(null)}>
                  Cancelar
                </ExecutiveButton>
                <ExecutiveButton variant="primary" type="submit" accentColor="emerald">
                  Confirmar Pago y Desembolso
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </ExecutiveModal>
        </div>
      )}

      {/* TAB 7: INVERSIONES */}
      {activeTab === 'investments' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              Registrar Posición de Inversión
            </h3>

            <ExecutiveForm onSubmit={handleCreateInvestment}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <ExecutiveInput
                  label="Nombre del Activo *"
                  placeholder="Ej: S&P 500 ETF (VOO) / Bitcoin"
                  value={invAsset}
                  onChange={e => setInvAsset(e.target.value)}
                  accentColor="emerald"
                  required
                />

                <ExecutiveInput
                  label="Cantidad *"
                  type="number"
                  step="0.0001"
                  placeholder="0"
                  value={invQuantity}
                  onChange={e => setInvQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                  required
                />

                <ExecutiveInput
                  label="Precio Promedio Compra *"
                  type="number"
                  placeholder="0.00"
                  value={invBuyPrice}
                  onChange={e => setInvBuyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                  required
                />

                <ExecutiveInput
                  label="Precio Actual Mercado"
                  type="number"
                  placeholder="0.00"
                  value={invCurrPrice}
                  onChange={e => setInvCurrPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                />
              </div>

              <div className="flex justify-end pt-2">
                <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                  Guardar Posición
                </ExecutiveButton>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {(!data.investments || data.investments.length === 0) ? (
            <ExecutiveEmptyState
              icon={<TrendingUp className="w-8 h-8 text-blue-400" />}
              title="Sin Inversiones Registradas"
              description="Agrega acciones, ETFs, criptomonedas o fondos de inversión para consolidar tu patrimonio total."
              accentColor="blue"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.investments.map(inv => {
                const totalCost = inv.quantity * inv.avgPurchasePrice;
                const totalVal = inv.quantity * inv.currentPrice;
                const pnl = totalVal - totalCost;

                return (
                  <motion.div
                    key={inv.id}
                    whileHover={{ y: -3 }}
                    className="p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all shadow-lg bg-white/90 border-slate-200 hover:border-blue-400/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-serif font-bold text-white text-base">{inv.assetName}</h4>
                        <span className="text-xs text-slate-500 font-mono">
                          {inv.quantity} unidades @ {formatCurrency(inv.currentPrice, inv.currency)}
                        </span>
                      </div>
                      <ExecutiveBadge variant="subtle" accentColor={pnl >= 0 ? 'emerald' : 'rose'}>
                        {pnl >= 0 ? '+' : ''}{formatCurrency(pnl, inv.currency)}
                      </ExecutiveBadge>
                    </div>

                    <div className="space-y-1.5 my-3 py-2 border-y border-slate-200 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valoración Actual:</span>
                        <strong className="text-emerald-400 font-serif text-sm">
                          {formatCurrency(totalVal, inv.currency)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Costo Total:</span>
                        <span className="text-slate-700">{formatCurrency(totalCost, inv.currency)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          FinancialStore.deleteInvestment(inv.id);
                          triggerToast('Posición eliminada', 'info');
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: HISTORIAL DE MOVIMIENTOS */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <GlassPanel accentColor="emerald" padding="md">
            <h3 className="font-serif font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Nuevo Registro de Movimiento Financiero
            </h3>

            <ExecutiveForm onSubmit={handleCreateTransaction}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                  <div>
                    <ExecutiveSelect
                      label="Naturaleza de Transacción *"
                      value={txNature}
                      onChange={e => setTxNature(e.target.value as any)}
                      accentColor="emerald"
                      options={[
                        { value: 'external_expense', label: '💸 Gasto / Salida Externa' },
                        { value: 'external_income', label: '💵 Ingreso Externo' },
                        { value: 'internal_transfer', label: '🔄 Transferencia Interna' },
                        { value: 'investment_buy', label: '📈 Compra de Inversión' },
                        { value: 'investment_sell', label: '📉 Venta de Inversión' },
                        { value: 'reconciliation_adj', label: '⚖️ Ajuste de Conciliación' },
                        { value: 'financial_yield', label: '✨ Rendimiento Financiero' }
                      ]}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <ExecutiveInput
                      label="Descripción *"
                      placeholder="Ej: Pago de supermercado, Salario, Transferencia o Ajuste"
                      value={txDesc}
                      onChange={e => setTxDesc(e.target.value)}
                      accentColor="emerald"
                      required
                    />
                  </div>

                  <div>
                    <ExecutiveSelect
                      label="Moneda *"
                      value={txCurr}
                      onChange={e => setTxCurr(e.target.value as any)}
                      accentColor="emerald"
                      options={[
                        { value: 'COP', label: 'COP ($)' },
                        { value: 'USD', label: 'USD ($)' },
                        { value: 'EUR', label: 'EUR (€)' },
                        { value: 'BTC', label: 'BTC (₿)' },
                        { value: 'ETH', label: 'ETH (Ξ)' }
                      ]}
                    />
                  </div>
                </div>

                {/* DYNAMIC FIELDS PER NATURE */}
                {txNature === 'external_income' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-3 bg-emerald-950/20 border border-emerald-200 rounded-xl">
                    <div>
                      <ExecutiveInput
                        label="Origen del Dinero *"
                        placeholder="Ej: Salario, Beca, Regalo, Venta, Devolución"
                        value={txSourceName}
                        onChange={e => setTxSourceName(e.target.value)}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveSelect
                        label="Cuenta Destino (Ingreso) *"
                        value={txDestAcc}
                        onChange={e => setTxDestAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Seleccionar Cuenta Destino --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Monto del Ingreso *"
                        type="number"
                        placeholder="0.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                  </div>
                )}

                {txNature === 'external_expense' && (
                  <div className="space-y-3 p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <ExecutiveSelect
                          label="Cuenta Origen (Desembolso) *"
                          value={txSourceAcc}
                          onChange={e => setTxSourceAcc(e.target.value)}
                          accentColor="emerald"
                          options={[
                            { value: '', label: '-- Seleccionar Cuenta Origen --' },
                            ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                          ]}
                        />
                      </div>
                      <div>
                        <ExecutiveInput
                          label="Destino / Beneficiario *"
                          placeholder="Ej: Arrendador, Supermercado, Universidad"
                          value={txBeneficiaryName}
                          onChange={e => setTxBeneficiaryName(e.target.value)}
                          accentColor="emerald"
                          required
                        />
                      </div>
                      <div>
                        <ExecutiveInput
                          label="Monto del Gasto *"
                          type="number"
                          placeholder="0.00"
                          value={isSplitExpense ? txSplits.reduce((s, x) => s + (Number(x.amount) || 0), 0) : txAmount}
                          onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          accentColor="emerald"
                          required={!isSplitExpense}
                          disabled={isSplitExpense}
                        />
                      </div>
                    </div>

                    {/* BUDGET ASSIGNMENT SECTION */}
                    <div className="pt-3 border-t border-rose-500/20 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-serif font-bold text-slate-200 flex items-center gap-1.5">
                          <PieChart className="w-4 h-4 text-emerald-400" />
                          Descontar del Presupuesto (Opcional)
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isSplitExpense;
                            setIsSplitExpense(nextState);
                            if (nextState && txSplits.length === 0) {
                              setTxSplits([
                                { id: 'split_1', budgetId: txBudgetId || '', budgetCategoryId: txBudgetCategoryId || '', categoryName: '', amount: Number(txAmount) || 0, description: '' }
                              ]);
                            }
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                            isSplitExpense
                              ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
                              : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span>✂️</span> {isSplitExpense ? 'Cancelar División' : 'Dividir gasto en varios presupuestos'}
                        </button>
                      </div>

                      {!isSplitExpense ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <ExecutiveSelect
                              label="Presupuesto a Descontar"
                              value={txBudgetId}
                              onChange={e => {
                                setTxBudgetId(e.target.value);
                                setTxBudgetCategoryId('');
                              }}
                              accentColor="emerald"
                              options={[
                                { value: '', label: 'Ninguno (No descuenta ningún presupuesto)' },
                                ...budgetOptions.map(b => ({ value: b.id, label: `${b.emoji} ${b.name}` }))
                              ]}
                            />
                          </div>

                          <div>
                            <ExecutiveSelect
                              label="Subcategoría Asociada"
                              value={txBudgetCategoryId}
                              onChange={e => setTxBudgetCategoryId(e.target.value)}
                              accentColor="emerald"
                              disabled={!txBudgetId}
                              options={[
                                { value: '', label: txBudgetId ? '-- Seleccionar Subcategoría --' : 'Primero selecciona un presupuesto' },
                                ...getCategoryOptionsForBudget(txBudgetId).map(c => ({ value: c.id, label: c.label }))
                              ]}
                            />
                          </div>
                        </div>
                      ) : (
                        /* SPLIT EXPENSE BUILDER */
                        <div className="p-3 bg-slate-50 rounded-xl border border-amber-200 space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-amber-800 font-bold flex items-center gap-1">
                              <span>✂️</span> Desglose de Gastos por Presupuesto
                            </span>
                            <span className="text-slate-700">
                              Monto Total Calculado: <strong className="text-emerald-400 font-bold">{formatCurrency(txSplits.reduce((s, x) => s + (Number(x.amount) || 0), 0), txCurr)}</strong>
                            </span>
                          </div>

                          <div className="space-y-2">
                            {txSplits.map((split, idx) => {
                              const cats = getCategoryOptionsForBudget(split.budgetId);
                              return (
                                <div key={split.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                  <div className="sm:col-span-4">
                                    <select
                                      value={split.budgetId}
                                      onChange={e => {
                                        const val = e.target.value;
                                        setTxSplits(prev => prev.map((s, i) => i === idx ? { ...s, budgetId: val, budgetCategoryId: '' } : s));
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-500"
                                    >
                                      <option value="">-- Presupuesto --</option>
                                      {budgetOptions.map(b => (
                                        <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="sm:col-span-4">
                                    <select
                                      value={split.budgetCategoryId}
                                      onChange={e => {
                                        const catId = e.target.value;
                                        const catObj = cats.find(c => c.id === catId);
                                        setTxSplits(prev => prev.map((s, i) => i === idx ? { ...s, budgetCategoryId: catId, categoryName: catObj ? catObj.name : '' } : s));
                                      }}
                                      disabled={!split.budgetId}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                                    >
                                      <option value="">-- Categoría --</option>
                                      {cats.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="sm:col-span-3">
                                    <input
                                      type="number"
                                      placeholder="Monto $"
                                      value={split.amount || ''}
                                      onChange={e => {
                                        const val = Number(e.target.value) || 0;
                                        setTxSplits(prev => prev.map((s, i) => i === idx ? { ...s, amount: val } : s));
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="sm:col-span-1 flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => setTxSplits(prev => prev.filter((_, i) => i !== idx))}
                                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-100 rounded transition-colors"
                                      title="Eliminar división"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => setTxSplits(prev => [...prev, { id: 'split_' + Date.now(), budgetId: '', budgetCategoryId: '', categoryName: '', amount: 0, description: '' }])}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Agregar otra sub-división
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {txNature === 'internal_transfer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-3 bg-blue-950/20 border border-slate-200 rounded-xl">
                    <div>
                      <ExecutiveSelect
                        label="Cuenta Origen (Sale) *"
                        value={txSourceAcc}
                        onChange={e => setTxSourceAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Cuenta Origen --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveSelect
                        label="Cuenta Destino (Entra) *"
                        value={txDestAcc}
                        onChange={e => setTxDestAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Cuenta Destino --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Monto Transferido *"
                        type="number"
                        placeholder="0.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                  </div>
                )}

                {txNature === 'investment_buy' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl">
                    <div>
                      <ExecutiveSelect
                        label="Cuenta de Origen *"
                        value={txSourceAcc}
                        onChange={e => setTxSourceAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Cuenta Pago --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Activo Adquirido *"
                        placeholder="Ej: Acciones Apple, BTC, ETF"
                        value={txAssetName}
                        onChange={e => setTxAssetName(e.target.value)}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Cantidad *"
                        type="number"
                        placeholder="1.0"
                        value={txAssetQuantity}
                        onChange={e => setTxAssetQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Precio Unitario *"
                        type="number"
                        placeholder="100.00"
                        value={txUnitPrice}
                        onChange={e => setTxUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                  </div>
                )}

                {txNature === 'investment_sell' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 bg-purple-950/20 border border-purple-200 rounded-xl">
                    <div>
                      <ExecutiveInput
                        label="Activo Vendido *"
                        placeholder="Ej: Acciones Apple, BTC"
                        value={txAssetName}
                        onChange={e => setTxAssetName(e.target.value)}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Cantidad *"
                        type="number"
                        placeholder="1.0"
                        value={txAssetQuantity}
                        onChange={e => setTxAssetQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveSelect
                        label="Cuenta Destino (Ingreso) *"
                        value={txDestAcc}
                        onChange={e => setTxDestAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Cuenta Destino --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Precio Venta *"
                        type="number"
                        placeholder="100.00"
                        value={txUnitPrice}
                        onChange={e => setTxUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                  </div>
                )}

                {txNature === 'reconciliation_adj' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 bg-amber-950/20 border border-amber-200 rounded-xl">
                    <div>
                      <ExecutiveSelect
                        label="Cuenta Afectada *"
                        value={txSourceAcc}
                        onChange={e => setTxSourceAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Seleccionar Cuenta --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Motivo Conciliación *"
                        placeholder="Ej: Saldo de extracto a fin de mes"
                        value={txReconciliationReason}
                        onChange={e => setTxReconciliationReason(e.target.value)}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Usuario / Responsable *"
                        placeholder="Ej: Presidente / Contador"
                        value={txReconciliationUser}
                        onChange={e => setTxReconciliationUser(e.target.value)}
                        accentColor="emerald"
                        required
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Diferencia Aplicada (+/-) *"
                        type="number"
                        placeholder="Ej: 50.00 o -25.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                  </div>
                )}

                {txNature === 'financial_yield' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end p-3 bg-emerald-950/20 border border-emerald-200 rounded-xl">
                    <div>
                      <ExecutiveSelect
                        label="Cuenta Destino (Rendimiento) *"
                        value={txDestAcc}
                        onChange={e => setTxDestAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Cuenta Destino --' },
                          ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                    </div>
                    <div>
                      <ExecutiveInput
                        label="Monto del Rendimiento *"
                        type="number"
                        placeholder="0.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <ExecutiveButton type="submit" variant="primary" accentColor="emerald" icon={<Plus className="w-4 h-4" />}>
                    Guardar Movimiento en Historial
                  </ExecutiveButton>
                </div>
              </div>
            </ExecutiveForm>
          </GlassPanel>

          {filteredTransactions.length === 0 ? (
            <ExecutiveEmptyState
              icon={<DollarSign className="w-8 h-8 text-emerald-400" />}
              title="Sin Movimientos Registrados"
              description="No hay transacciones guardadas. Agrega tu primer movimiento financiero para actualizar balances."
              accentColor="emerald"
            />
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map(tx => {
                const isIncome = tx.nature === 'external_income' || tx.nature === 'financial_yield' || tx.nature === 'investment_sell';
                const sourceAcc = (data.accounts || []).find(a => a.id === tx.sourceAccountId);
                const destAcc = (data.accounts || []).find(a => a.id === tx.destinationAccountId);

                return (
                  <div
                    key={tx.id}
                    className="p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border mt-0.5 ${
                        isIncome 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-500/40' 
                          : tx.nature === 'internal_transfer'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : tx.nature === 'reconciliation_adj'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : tx.nature === 'internal_transfer' ? <RefreshCw className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-white text-sm">{tx.description}</h4>
                          <ExecutiveBadge variant="subtle" accentColor={
                            isIncome ? 'emerald' : tx.nature === 'internal_transfer' ? 'blue' : tx.nature === 'reconciliation_adj' ? 'amber' : 'rose'
                          }>
                            {tx.nature.replace('_', ' ')}
                          </ExecutiveBadge>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {tx.date} • {tx.time}
                        </div>
                        <div className="text-[11px] text-slate-700 flex flex-wrap gap-2 pt-0.5">
                          {tx.sourceName && <span>Origen: <strong className="text-white">{tx.sourceName}</strong></span>}
                          {tx.beneficiaryName && <span>Beneficiario: <strong className="text-white">{tx.beneficiaryName}</strong></span>}
                          {tx.assetName && <span>Activo: <strong className="text-white">{tx.assetName}</strong> ({tx.assetQuantity} u. @ {formatCurrency(tx.unitPrice || 0, tx.currency)})</span>}
                          {tx.reconciliationReason && <span>Motivo: <strong className="text-amber-800">{tx.reconciliationReason}</strong> (por {tx.reconciliationUser})</span>}
                          {sourceAcc && <span>Desde: <strong className="text-slate-200">{sourceAcc.name}</strong></span>}
                          {destAcc && <span>Hacia: <strong className="text-slate-200">{destAcc.name}</strong></span>}
                        </div>

                        {/* BUDGET OR SPLIT TAG */}
                        {tx.splits && tx.splits.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono font-bold flex items-center gap-1">
                              <span>✂️</span> Gasto Dividido ({tx.splits.length}):
                            </span>
                            {tx.splits.map((s, idx) => {
                              const fund = (data.distributionPlan?.funds || []).find(f => f.id === s.budgetId);
                              const catName = s.categoryName || 'General';
                              return (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-700 flex items-center gap-1">
                                  <span>{fund ? fund.emoji || '💼' : ''}</span>
                                  <span>{catName}:</span>
                                  <strong className="text-emerald-800">{formatCurrency(s.amount, tx.currency)}</strong>
                                </span>
                              );
                            })}
                          </div>
                        ) : tx.budgetId ? (
                          <div className="mt-1 flex items-center gap-2">
                            {(() => {
                              const fund = (data.distributionPlan?.funds || []).find(f => f.id === tx.budgetId);
                              const cat = fund?.categories?.find(c => c.id === tx.budgetCategoryId);
                              if (!fund) return null;

                              const baseIncome = (data.distributionPlan?.monthlyBaseIncome) || 0;
                              const fundTargetBudget = baseIncome * ((fund.percentage || 0) / 100);
                              const catBudget = cat ? fundTargetBudget * ((cat.percentage || 0) / 100) : fundTargetBudget;
                              const catUsed = cat
                                ? FinancialCalculations.calculateCategoryUsedAmount(fund.id, cat.id, cat.name, data.transactions, todayStr.substring(0, 7)).amount
                                : FinancialCalculations.calculateBudgetUsedAmount(fund.id, data.transactions, todayStr.substring(0, 7)).amount;
                              const remaining = catBudget - catUsed;

                              return (
                                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-medium flex items-center gap-1.5 flex-wrap">
                                  <span>{cat?.emoji || fund.emoji || '🏠'}</span>
                                  <span>
                                    {cat?.name ? `${cat.name} | ` : ''}Presupuesto: <strong>{fund.name}</strong>
                                  </span>
                                  <span className="text-slate-500">|</span>
                                  <span className={remaining < 0 ? 'text-rose-400 font-bold' : 'text-emerald-800'}>
                                    Disponible restante: <strong>{formatCurrency(remaining, tx.currency)}</strong>
                                  </span>
                                </span>
                              );
                            })()}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-base font-serif font-bold ${
                        isIncome ? 'text-emerald-400' : tx.nature === 'internal_transfer' ? 'text-blue-300' : tx.nature === 'reconciliation_adj' ? 'text-amber-400' : 'text-slate-200'
                      }`}>
                        {isIncome ? '+' : tx.nature === 'internal_transfer' ? '↔ ' : ''}{formatCurrency(tx.amount, tx.currency)}
                      </span>

                      <button
                        onClick={() => handleOpenEditTransaction(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Editar movimiento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          FinancialStore.deleteTransaction(tx.id);
                          triggerToast('Movimiento eliminado', 'info');
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLE DE CATEGORÍA GASTO/INGRESO */}
      <ExecutiveModal
        isOpen={Boolean(selectedCategoryDetail)}
        onClose={() => setSelectedCategoryDetail(null)}
        title={`Detalle de Movimientos: "${selectedCategoryDetail?.name}"`}
        accentColor={selectedCategoryDetail?.type === 'income' ? 'emerald' : 'rose'}
      >
        <div className="space-y-3">
          {(data.transactions || [])
            .filter(t => 
              (t.categoryId === selectedCategoryDetail?.name || t.description.toLowerCase().includes(selectedCategoryDetail?.name.toLowerCase() || ''))
            )
            .map(t => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <strong className="text-white block font-serif">{t.description}</strong>
                  <span className="text-slate-500 font-mono text-[10px]">{t.date} • {t.time}</span>
                </div>
                <strong className={selectedCategoryDetail?.type === 'income' ? 'text-emerald-400 font-serif' : 'text-rose-400 font-serif'}>
                  {formatCurrency(t.amount, t.currency)}
                </strong>
              </div>
            ))}
        </div>
      </ExecutiveModal>

      {/* MODAL PANEL DE CUENTA BANCARIA / BILLETERA */}
      <ExecutiveModal
        isOpen={Boolean(selectedAccountForPanel)}
        onClose={() => {
          setSelectedAccountForPanel(null);
          setQuickActionType(null);
        }}
        title={selectedAccountForPanel ? `Panel de Cuenta: ${selectedAccountForPanel.name}` : ''}
        accentColor={selectedAccountForPanel?.archived ? 'amber' : 'emerald'}
      >
        {selectedAccountForPanel && (() => {
          const acc = selectedAccountForPanel;
          const stats = FinancialCalculations.calculateAccountStats(acc, data.transactions || [], data.obligations || [], data.budgets || [], todayStr);
          const dailyYieldEst = FinancialCalculations.calculateDailyYieldEstimated(acc, data.transactions || []);

          return (
            <div className="space-y-5">
              {/* HEADER INFO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Saldo Calculado</span>
                  <div className="text-2xl font-serif font-bold text-emerald-400">
                    {formatCurrency(stats.currentBalance, acc.currency)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Inicial: {formatCurrency(stats.initialBalance, acc.currency)}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Entidad & Tipo</span>
                    <strong className="text-sm font-bold text-white block">{acc.institution || 'Entidad no esp.'}</strong>
                    <span className="text-xs text-slate-700 capitalize">{acc.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <ExecutiveBadge variant="subtle" accentColor="emerald">{acc.currency}</ExecutiveBadge>
                    {acc.archived ? (
                      <ExecutiveBadge variant="subtle" accentColor="amber">Archivada</ExecutiveBadge>
                    ) : (
                      <ExecutiveBadge variant="subtle" accentColor="emerald">Activa</ExecutiveBadge>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs space-y-1">
                  {acc.type === 'high_yield' && acc.annualInterestRate ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block">Rendimiento Alto Valor</span>
                      <div className="text-base font-serif font-bold text-emerald-800">{acc.annualInterestRate}% TEA</div>
                      <span className="text-[11px] text-slate-700 block">Est: +{formatCurrency(dailyYieldEst, acc.currency)}/día</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Movimientos del Mes</span>
                      <div className="text-lg font-serif font-bold text-white">{stats.monthMovementsCount} registros</div>
                      <span className="text-[11px] text-slate-500 block">Total en historial: {stats.accountTxs.length}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between font-mono">
                    <span>Creada: {acc.createdAt || 'N/A'}</span>
                    <span>Mod: {acc.updatedAt || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* QUICK ACTION BUTTONS BAR */}
              <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-200 items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setQuickActionType('transfer'); setTxSourceAcc(acc.id); setTxNature('internal_transfer'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      quickActionType === 'transfer' ? 'bg-blue-500 text-white shadow-lg' : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" /> Transferir
                  </button>

                  <button
                    onClick={() => { setQuickActionType('income'); setTxDestAcc(acc.id); setTxNature('external_income'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      quickActionType === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-500/30'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Ingreso
                  </button>

                  <button
                    onClick={() => { setQuickActionType('expense'); setTxSourceAcc(acc.id); setTxNature('external_expense'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      quickActionType === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" /> Gasto
                  </button>

                  <button
                    onClick={() => { setQuickActionType('yield'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      quickActionType === 'yield' ? 'bg-teal-500 text-white shadow-lg' : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Rendimiento Manual
                  </button>

                  <button
                    onClick={() => { setQuickActionType('edit'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      quickActionType === 'edit' ? 'bg-slate-700 text-white shadow-lg' : 'bg-white/10 text-slate-700 hover:bg-white/20'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                </div>

                <div>
                  {acc.archived ? (
                    <button
                      onClick={() => {
                        FinancialStore.unarchiveAccount(acc.id);
                        setSelectedAccountForPanel({ ...acc, archived: false });
                        triggerToast(`Cuenta "${acc.name}" restaurada`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        FinancialStore.archiveAccount(acc.id);
                        setSelectedAccountForPanel({ ...acc, archived: true });
                        triggerToast(`Cuenta "${acc.name}" archivada`, 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 hover:text-amber-800 hover:bg-amber-50 transition-all flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archivar
                    </button>
                  )}
                </div>
              </div>

              {/* QUICK ACTION FORM (IF ANY SELECTED) */}
              {quickActionType && (
                <div className="p-4 bg-slate-50 border border-white/20 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      {quickActionType === 'transfer' && 'Transferir Dinero a Otra Cuenta'}
                      {quickActionType === 'income' && 'Registrar Ingreso en Esta Cuenta'}
                      {quickActionType === 'expense' && 'Registrar Gasto desde Esta Cuenta'}
                      {quickActionType === 'yield' && 'Registrar Rendimiento Financiero Manual'}
                      {quickActionType === 'edit' && 'Editar Configuración de la Cuenta'}
                    </h4>
                    <button onClick={() => setQuickActionType(null)} className="text-slate-500 hover:text-slate-900">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* FORM CONTENT BASED ON ACTION */}
                  {quickActionType === 'transfer' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <ExecutiveSelect
                        label="Cuenta Destino *"
                        value={txDestAcc}
                        onChange={e => setTxDestAcc(e.target.value)}
                        accentColor="emerald"
                        options={[
                          { value: '', label: '-- Seleccionar Cuenta --' },
                          ...(data.accounts || []).filter(a => a.id !== acc.id).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                        ]}
                      />
                      <ExecutiveInput
                        label="Monto *"
                        type="number"
                        placeholder="0.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Concepto *"
                        placeholder="Ej: Traslado a ahorros"
                        value={txDesc}
                        onChange={e => setTxDesc(e.target.value)}
                        accentColor="emerald"
                      />
                      <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                        <ExecutiveButton
                          onClick={() => {
                            if (!txDestAcc || !txAmount || !txDesc) {
                              triggerToast('Completa los campos obligatorios', 'warning');
                              return;
                            }
                            FinancialStore.addTransaction({
                              date: todayStr,
                              time: timeStr,
                              nature: 'internal_transfer',
                              sourceAccountId: acc.id,
                              destinationAccountId: txDestAcc,
                              description: txDesc,
                              amount: Number(txAmount),
                              currency: acc.currency
                            });
                            triggerToast('Transferencia realizada con éxito', 'success');
                            setQuickActionType(null);
                            setTxAmount('');
                            setTxDesc('');
                          }}
                          variant="primary"
                          accentColor="emerald"
                        >
                          Confirmar Transferencia
                        </ExecutiveButton>
                      </div>
                    </div>
                  )}

                  {quickActionType === 'income' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <ExecutiveInput
                        label="Origen / Pagador"
                        placeholder="Ej: Cliente / Nómina"
                        value={txSourceName}
                        onChange={e => setTxSourceName(e.target.value)}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Monto *"
                        type="number"
                        placeholder="0.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Concepto *"
                        placeholder="Ej: Honorarios / Salario"
                        value={txDesc}
                        onChange={e => setTxDesc(e.target.value)}
                        accentColor="emerald"
                      />
                      <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                        <ExecutiveButton
                          onClick={() => {
                            if (!txAmount || !txDesc) {
                              triggerToast('Completa los campos obligatorios', 'warning');
                              return;
                            }
                            FinancialStore.addTransaction({
                              date: todayStr,
                              time: timeStr,
                              nature: 'external_income',
                              destinationAccountId: acc.id,
                              sourceName: txSourceName || 'Externo',
                              description: txDesc,
                              amount: Number(txAmount),
                              currency: acc.currency
                            });
                            triggerToast('Ingreso registrado con éxito', 'success');
                            setQuickActionType(null);
                            setTxAmount('');
                            setTxDesc('');
                            setTxSourceName('');
                          }}
                          variant="primary"
                          accentColor="emerald"
                        >
                          Registrar Ingreso
                        </ExecutiveButton>
                      </div>
                    </div>
                  )}

                  {quickActionType === 'expense' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <ExecutiveInput
                        label="Beneficiario / Establecimiento"
                        placeholder="Ej: Supermercado / Arriendo"
                        value={txBeneficiaryName}
                        onChange={e => setTxBeneficiaryName(e.target.value)}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Monto *"
                        type="number"
                        placeholder="0.00"
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Concepto *"
                        placeholder="Ej: Compra de insumos"
                        value={txDesc}
                        onChange={e => setTxDesc(e.target.value)}
                        accentColor="emerald"
                      />
                      <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                        <ExecutiveButton
                          onClick={() => {
                            if (!txAmount || !txDesc) {
                              triggerToast('Completa los campos obligatorios', 'warning');
                              return;
                            }
                            FinancialStore.addTransaction({
                              date: todayStr,
                              time: timeStr,
                              nature: 'external_expense',
                              sourceAccountId: acc.id,
                              beneficiaryName: txBeneficiaryName || 'Beneficiario',
                              description: txDesc,
                              amount: Number(txAmount),
                              currency: acc.currency
                            });
                            triggerToast('Gasto registrado con éxito', 'success');
                            setQuickActionType(null);
                            setTxAmount('');
                            setTxDesc('');
                            setTxBeneficiaryName('');
                          }}
                          variant="primary"
                          accentColor="rose"
                        >
                          Registrar Gasto
                        </ExecutiveButton>
                      </div>
                    </div>
                  )}

                  {quickActionType === 'yield' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <ExecutiveInput
                        label="Monto del Rendimiento *"
                        type="number"
                        placeholder="0.00"
                        value={manualYieldAmount}
                        onChange={e => setManualYieldAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Concepto *"
                        placeholder="Ej: Rendimiento mensual abonado"
                        value={manualYieldDesc}
                        onChange={e => setManualYieldDesc(e.target.value)}
                        accentColor="emerald"
                      />
                      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                        <ExecutiveButton
                          onClick={() => {
                            if (!manualYieldAmount) {
                              triggerToast('Ingresa un monto válido', 'warning');
                              return;
                            }
                            FinancialStore.addManualYield(acc.id, Number(manualYieldAmount), manualYieldDesc || 'Rendimiento manual', todayStr);
                            triggerToast('Rendimiento manual abonado correctamente', 'success');
                            setQuickActionType(null);
                            setManualYieldAmount('');
                            setManualYieldDesc('');
                          }}
                          variant="primary"
                          accentColor="emerald"
                        >
                          Abonar Rendimiento
                        </ExecutiveButton>
                      </div>
                    </div>
                  )}

                  {quickActionType === 'edit' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <ExecutiveInput
                        label="Nombre de la Cuenta *"
                        value={editAccName}
                        onChange={e => setEditAccName(e.target.value)}
                        accentColor="emerald"
                      />
                      <ExecutiveInput
                        label="Entidad / Banco"
                        value={editAccInst}
                        onChange={e => setEditAccInst(e.target.value)}
                        accentColor="emerald"
                      />
                      <ExecutiveSelect
                        label="Tipo de Cuenta"
                        value={editAccType}
                        onChange={e => setEditAccType(e.target.value as any)}
                        accentColor="emerald"
                        options={[
                          { value: 'savings', label: 'Ahorros' },
                          { value: 'checking', label: 'Corriente' },
                          { value: 'cash', label: 'Efectivo' },
                          { value: 'high_yield', label: 'Alto Rendimiento' },
                          { value: 'digital_wallet', label: 'Billetera Digital' },
                          { value: 'investment', label: 'Inversión' }
                        ]}
                      />
                      {editAccType === 'high_yield' && (
                        <ExecutiveInput
                          label="Tasa E.A. %"
                          type="number"
                          step="0.1"
                          value={editAccInterest}
                          onChange={e => setEditAccInterest(e.target.value === '' ? '' : Number(e.target.value))}
                          accentColor="emerald"
                        />
                      )}
                      <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                        <ExecutiveButton
                          onClick={() => {
                            if (!editAccName) return;
                            FinancialStore.updateAccount(acc.id, {
                              name: editAccName,
                              institution: editAccInst,
                              type: editAccType,
                              annualInterestRate: editAccType === 'high_yield' ? Number(editAccInterest) || undefined : undefined
                            });
                            triggerToast('Configuración de cuenta actualizada', 'success');
                            setQuickActionType(null);
                            setSelectedAccountForPanel({ ...acc, name: editAccName, institution: editAccInst, type: editAccType, annualInterestRate: editAccType === 'high_yield' ? Number(editAccInterest) || undefined : undefined });
                          }}
                          variant="primary"
                          accentColor="emerald"
                        >
                          Guardar Cambios
                        </ExecutiveButton>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TABS SELECTOR IN MODAL */}
              <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-1">
                <button
                  onClick={() => { setAccountPanelTab('stats'); setQuickActionType(null); }}
                  className={`px-3 py-2 text-xs font-bold uppercase rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                    accountPanelTab === 'stats' && !quickActionType
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Estadísticas & Métricas
                </button>

                <button
                  onClick={() => { setAccountPanelTab('chart'); setQuickActionType(null); }}
                  className={`px-3 py-2 text-xs font-bold uppercase rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                    accountPanelTab === 'chart' && !quickActionType
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" /> Evolución del Saldo
                </button>

                <button
                  onClick={() => { setAccountPanelTab('obligations'); setQuickActionType(null); }}
                  className={`px-3 py-2 text-xs font-bold uppercase rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                    accountPanelTab === 'obligations' && !quickActionType
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Obligaciones & Presupuesto
                </button>

                <button
                  onClick={() => { setAccountPanelTab('movements'); setQuickActionType(null); }}
                  className={`px-3 py-2 text-xs font-bold uppercase rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                    accountPanelTab === 'movements' && !quickActionType
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> Historial de Movimientos ({stats.accountTxs.length})
                </button>
              </div>

              {/* TAB CONTENT AREAS */}
              {!quickActionType && accountPanelTab === 'stats' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Saldo Actual</span>
                    <strong className="text-base font-serif font-bold text-emerald-400 block mt-0.5">
                      {formatCurrency(stats.currentBalance, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Saldo Inicial</span>
                    <strong className="text-base font-serif font-bold text-slate-200 block mt-0.5">
                      {formatCurrency(stats.initialBalance, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Ingresos Acumulados</span>
                    <strong className="text-base font-serif font-bold text-emerald-400 block mt-0.5">
                      +{formatCurrency(stats.totalIncomes, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gastos Acumulados</span>
                    <strong className="text-base font-serif font-bold text-rose-400 block mt-0.5">
                      -{formatCurrency(stats.totalExpenses, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Transf. Recibidas</span>
                    <strong className="text-base font-serif font-bold text-blue-300 block mt-0.5">
                      +{formatCurrency(stats.transfersReceived, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Transf. Enviadas</span>
                    <strong className="text-base font-serif font-bold text-amber-800 block mt-0.5">
                      -{formatCurrency(stats.transfersSent, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Rendimientos Totales</span>
                    <strong className="text-base font-serif font-bold text-teal-300 block mt-0.5">
                      +{formatCurrency(stats.totalYields, acc.currency)}
                    </strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Último Movimiento</span>
                    <strong className="text-xs font-serif font-bold text-white block mt-0.5 truncate">
                      {stats.lastMovement ? `${stats.lastMovement.date}: ${stats.lastMovement.description}` : 'Sin movimientos'}
                    </strong>
                  </div>
                </div>
              )}

              {!quickActionType && accountPanelTab === 'chart' && (
                <BalanceEvolutionChart history={stats.balanceHistory} currency={acc.currency} />
              )}

              {!quickActionType && accountPanelTab === 'obligations' && (
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-white text-xs uppercase tracking-wider text-slate-500">
                    Obligaciones Pendientes en {acc.currency}:
                  </h4>
                  {stats.associatedObligations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl text-center">
                      No hay obligaciones pendientes registradas en esta moneda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stats.associatedObligations.map(ob => (
                        <div key={ob.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-white block">{ob.title}</strong>
                            <span className="text-slate-500 text-[11px]">Vence: {ob.dueDate} • {ob.category}</span>
                          </div>
                          <strong className="text-rose-400 font-serif font-bold">{formatCurrency(ob.amount, ob.currency)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!quickActionType && accountPanelTab === 'movements' && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {stats.accountTxs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center">No existen movimientos registrados para esta cuenta.</p>
                  ) : (
                    stats.accountTxs.map(tx => {
                      const isIncome = tx.destinationAccountId === acc.id;
                      return (
                        <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-white font-serif">{tx.description}</strong>
                              <ExecutiveBadge variant="subtle" accentColor={isIncome ? 'emerald' : 'rose'}>
                                {tx.nature.replace('_', ' ')}
                              </ExecutiveBadge>
                            </div>
                            <span className="text-slate-500 font-mono text-[10px]">{tx.date} • {tx.time}</span>
                          </div>
                          <strong className={`font-serif font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                          </strong>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </ExecutiveModal>

      {/* MODAL ADMINISTRAR ACTIVOS (FUTURAS INVERSIONES) */}
      <ExecutiveModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        title={selectedInvestmentAcc ? `Administrar Activos: ${selectedInvestmentAcc.name}` : 'Administrar Activos de Inversión'}
        accentColor="purple"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-200 flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-white text-base">Portafolio de Activos Financieros</h4>
              <p className="text-xs text-slate-700">Gestión ejecutiva de Acciones, ETFs, Bonos, Criptomonedas y Fondos de Inversión.</p>
            </div>
            <ExecutiveBadge variant="solid" accentColor="purple">Módulo de Activos</ExecutiveBadge>
          </div>

          <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-1">
            {(['stocks', 'etfs', 'bonds', 'crypto', 'funds'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setInvestmentAssetTab(tab)}
                className={`px-3 py-1.5 rounded-t-xl text-xs font-bold uppercase transition-all border-b-2 ${
                  investmentAssetTab === tab
                    ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab === 'stocks' && 'Acciones'}
                {tab === 'etfs' && 'ETFs'}
                {tab === 'bonds' && 'Bonos'}
                {tab === 'crypto' && 'Criptomonedas'}
                {tab === 'funds' && 'Fondos'}
              </button>
            ))}
          </div>

          <div className="p-6 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
            <Briefcase className="w-10 h-10 text-purple-400 mx-auto" />
            <h5 className="font-serif font-bold text-white text-sm">Administración de {investmentAssetTab.toUpperCase()}</h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Todas las compras y ventas de estos activos se registran estrictamente como movimientos financieros de inversión para garantizar la trazabilidad patrimonial sin alterar saldos manualmente.
            </p>

            <div className="pt-2">
              <ExecutiveButton
                onClick={() => {
                  setIsInvestmentModalOpen(false);
                  setActiveTab('transactions');
                  setTxNature('investment_buy');
                  triggerToast('Formulario de compra de activo preparado', 'info');
                }}
                variant="primary"
                accentColor="purple"
                icon={<Plus className="w-4 h-4" />}
              >
                Registrar Compra de Activo en Movimientos
              </ExecutiveButton>
            </div>
          </div>
        </div>
      </ExecutiveModal>

      {/* MODAL EDITAR MOVIMIENTO */}
      <ExecutiveModal
        isOpen={Boolean(editingTx)}
        onClose={() => setEditingTx(null)}
        title="Editar Movimiento Financiero"
        accentColor="emerald"
      >
        {editingTx && (
          <ExecutiveForm onSubmit={handleSaveEditTransaction}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExecutiveInput
                  label="Fecha"
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  accentColor="emerald"
                  required
                />
                <ExecutiveInput
                  label="Monto Total"
                  type="number"
                  placeholder="0.00"
                  value={editIsSplitExpense ? editSplits.reduce((s, x) => s + (Number(x.amount) || 0), 0) : editAmount}
                  onChange={e => setEditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor="emerald"
                  required={!editIsSplitExpense}
                  disabled={editIsSplitExpense}
                />
              </div>

              <ExecutiveInput
                label="Descripción del Movimiento"
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                accentColor="emerald"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExecutiveSelect
                  label="Cuenta Origen"
                  value={editSourceAcc}
                  onChange={e => setEditSourceAcc(e.target.value)}
                  accentColor="emerald"
                  options={[
                    { value: '', label: '-- Ninguna --' },
                    ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                  ]}
                />
                <ExecutiveSelect
                  label="Cuenta Destino"
                  value={editDestAcc}
                  onChange={e => setEditDestAcc(e.target.value)}
                  accentColor="emerald"
                  options={[
                    { value: '', label: '-- Ninguna --' },
                    ...(data.accounts || []).map(a => ({ value: a.id, label: `${a.name} (${a.currency})` }))
                  ]}
                />
              </div>

              {/* BUDGET RE-ASSIGNMENT */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-slate-200 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    Asignación Presupuestaria
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !editIsSplitExpense;
                      setEditIsSplitExpense(nextState);
                      if (nextState && editSplits.length === 0) {
                        setEditSplits([
                          { id: 'split_1', budgetId: editBudgetId || '', budgetCategoryId: editBudgetCategoryId || '', categoryName: '', amount: Number(editAmount) || 0, description: '' }
                        ]);
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                      editIsSplitExpense
                        ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>✂️</span> {editIsSplitExpense ? 'Cancelar División' : 'Dividir Gasto'}
                  </button>
                </div>

                {!editIsSplitExpense ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ExecutiveSelect
                      label="Descontar del Presupuesto"
                      value={editBudgetId}
                      onChange={e => {
                        setEditBudgetId(e.target.value);
                        setEditBudgetCategoryId('');
                      }}
                      accentColor="emerald"
                      options={[
                        { value: '', label: 'Ninguno (Gasto libre)' },
                        ...budgetOptions.map(b => ({ value: b.id, label: `${b.emoji} ${b.name}` }))
                      ]}
                    />

                    <ExecutiveSelect
                      label="Subcategoría Presupuestaria"
                      value={editBudgetCategoryId}
                      onChange={e => setEditBudgetCategoryId(e.target.value)}
                      accentColor="emerald"
                      disabled={!editBudgetId}
                      options={[
                        { value: '', label: editBudgetId ? '-- Seleccionar Subcategoría --' : 'Selecciona un presupuesto' },
                        ...getCategoryOptionsForBudget(editBudgetId).map(c => ({ value: c.id, label: c.label }))
                      ]}
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-800 font-bold flex items-center gap-1">
                        <span>✂️</span> Divisiones de Gasto
                      </span>
                      <span className="text-slate-700">
                        Total: <strong className="text-emerald-400 font-bold">{formatCurrency(editSplits.reduce((s, x) => s + (Number(x.amount) || 0), 0), editingTx.currency)}</strong>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {editSplits.map((split, idx) => {
                        const cats = getCategoryOptionsForBudget(split.budgetId);
                        return (
                          <div key={split.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                            <div className="sm:col-span-4">
                              <select
                                value={split.budgetId}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditSplits(prev => prev.map((s, i) => i === idx ? { ...s, budgetId: val, budgetCategoryId: '' } : s));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="">-- Presupuesto --</option>
                                {budgetOptions.map(b => (
                                  <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-4">
                              <select
                                value={split.budgetCategoryId}
                                onChange={e => {
                                  const catId = e.target.value;
                                  const catObj = cats.find(c => c.id === catId);
                                  setEditSplits(prev => prev.map((s, i) => i === idx ? { ...s, budgetCategoryId: catId, categoryName: catObj ? catObj.name : '' } : s));
                                }}
                                disabled={!split.budgetId}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              >
                                <option value="">-- Categoría --</option>
                                {cats.map(c => (
                                  <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-3">
                              <input
                                type="number"
                                placeholder="Monto $"
                                value={split.amount || ''}
                                onChange={e => {
                                  const val = Number(e.target.value) || 0;
                                  setEditSplits(prev => prev.map((s, i) => i === idx ? { ...s, amount: val } : s));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div className="sm:col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => setEditSplits(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditSplits(prev => [...prev, { id: 'split_' + Date.now(), budgetId: '', budgetCategoryId: '', categoryName: '', amount: 0, description: '' }])}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar otra división
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <ExecutiveButton
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingTx(null)}
                >
                  Cancelar
                </ExecutiveButton>
                <ExecutiveButton
                  type="submit"
                  variant="primary"
                  accentColor="emerald"
                  icon={<Check className="w-4 h-4" />}
                >
                  Guardar Cambios
                </ExecutiveButton>
              </div>
            </div>
          </ExecutiveForm>
        )}
      </ExecutiveModal>

      {/* QUICK ACTION TRANSACTION MODAL */}
      {quickActionModal && (
        <ExecutiveModal
          isOpen={Boolean(quickActionModal)}
          onClose={() => setQuickActionModal(null)}
          title={
            quickActionModal === 'income'
              ? '＋ Registrar Ingreso'
              : quickActionModal === 'expense'
              ? '− Registrar Gasto'
              : '↔ Registrar Transferencia'
          }
        >
          <ExecutiveForm onSubmit={(e) => {
            handleCreateTransaction(e);
            setQuickActionModal(null);
          }}>
            <div className="space-y-4">
              <div>
                <ExecutiveInput
                  label="Monto *"
                  type="number"
                  placeholder="Ej: 50000"
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  accentColor={quickActionModal === 'income' ? 'emerald' : quickActionModal === 'expense' ? 'rose' : 'purple'}
                  required
                  autoFocus
                />
              </div>

              <div>
                <ExecutiveInput
                  label="Concepto / Descripción *"
                  placeholder={quickActionModal === 'income' ? 'Ej: Salario, Pago cliente, Regalo' : quickActionModal === 'expense' ? 'Ej: Mercado, Almuerzo, Uber' : 'Ej: Movimiento de Ahorros a Billetera'}
                  value={txDesc}
                  onChange={e => setTxDesc(e.target.value)}
                  accentColor="emerald"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActionModal !== 'income' && (
                  <div>
                    <ExecutiveSelect
                      label="Cuenta Origen *"
                      value={txSourceAcc}
                      onChange={e => setTxSourceAcc(e.target.value)}
                      accentColor="emerald"
                      required
                      options={[
                        { value: '', label: 'Seleccionar Cuenta Origen...' },
                        ...data.accounts.filter(a => !a.archived).map(a => ({ value: a.id, label: `${a.name} (${formatCurrency(FinancialCalculations.calculateAccountBalance(a, data.transactions || []), a.currency)})` }))
                      ]}
                    />
                  </div>
                )}

                {quickActionModal !== 'expense' && (
                  <div>
                    <ExecutiveSelect
                      label="Cuenta Destino *"
                      value={txDestAcc}
                      onChange={e => setTxDestAcc(e.target.value)}
                      accentColor="emerald"
                      required
                      options={[
                        { value: '', label: 'Seleccionar Cuenta Destino...' },
                        ...data.accounts.filter(a => !a.archived).map(a => ({ value: a.id, label: `${a.name} (${formatCurrency(FinancialCalculations.calculateAccountBalance(a, data.transactions || []), a.currency)})` }))
                      ]}
                    />
                  </div>
                )}
              </div>

              {quickActionModal === 'expense' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <ExecutiveSelect
                      label="Fondo / Presupuesto"
                      value={txBudgetId}
                      onChange={e => {
                        setTxBudgetId(e.target.value);
                        setTxBudgetCategoryId('');
                      }}
                      accentColor="emerald"
                      options={[
                        { value: '', label: 'Sin asignar a presupuesto...' },
                        ...budgetOptions.map(b => ({ value: b.id, label: `${b.emoji} ${b.name}` }))
                      ]}
                    />
                  </div>

                  <div>
                    <ExecutiveSelect
                      label="Categoría"
                      value={txCategory}
                      onChange={e => setTxCategory(e.target.value)}
                      accentColor="emerald"
                      options={[
                        { value: '', label: 'Categoría libre / General' },
                        { value: 'Alimentación', label: '🛒 Alimentación / Mercado' },
                        { value: 'Educación', label: '📚 Educación / Cursos' },
                        { value: 'Salud', label: '💊 Salud / Medicina' },
                        { value: 'Vivienda', label: '🏠 Vivienda / Arriendo' },
                        { value: 'Transporte', label: '🚗 Transporte / Gasolina' },
                        { value: 'Servicios', label: '⚡ Servicios Públicos' },
                        { value: 'Entretenimiento', label: '🎟️ Entretenimiento / Ocio' },
                        { value: 'Otros', label: '💸 Otros Gastos' }
                      ]}
                    />
                  </div>
                </div>
              )}

              {quickActionModal === 'income' && (
                <div>
                  <ExecutiveSelect
                    label="Categoría de Ingreso"
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    accentColor="emerald"
                    options={[
                      { value: '', label: 'Ingreso Principal' },
                      { value: 'Salario / Nomina', label: '💼 Salario / Nómina' },
                      { value: 'Honorarios / Freelance', label: '💻 Honorarios / Freelance' },
                      { value: 'Inversiones / Rendimientos', label: '📈 Rendimientos' },
                      { value: 'Ventas / Negocios', label: '🛍️ Ventas' },
                      { value: 'Otros Ingresos', label: '💰 Otros' }
                    ]}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <ExecutiveButton
                  type="button"
                  variant="ghost"
                  onClick={() => setQuickActionModal(null)}
                >
                  Cancelar
                </ExecutiveButton>
                <ExecutiveButton
                  type="submit"
                  variant="primary"
                  accentColor={quickActionModal === 'income' ? 'emerald' : quickActionModal === 'expense' ? 'rose' : 'purple'}
                >
                  Guardar Transacción
                </ExecutiveButton>
              </div>
            </div>
          </ExecutiveForm>
        </ExecutiveModal>
      )}
    </div>
  );
};

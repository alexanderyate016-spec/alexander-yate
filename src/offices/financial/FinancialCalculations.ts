import { FinancialAccount, FinancialTransaction, FinancialObligation, FinancialOfficeData, CurrencyCode } from '../../types/store';

export const FinancialCalculations = {
  calculateAccountBalance(account: FinancialAccount, transactions: FinancialTransaction[]): number {
    let balance = account.initialBalance || 0;

    (transactions || []).forEach(tx => {
      const isIncome = tx.nature === 'external_income' || tx.nature === 'financial_yield' || tx.nature === 'investment_sell';
      const isExpense = tx.nature === 'external_expense' || tx.nature === 'investment_buy';

      const isDest = tx.destinationAccountId === account.id || (tx.accountId === account.id && isIncome);
      const isSource = tx.sourceAccountId === account.id || (tx.accountId === account.id && isExpense);

      // 1. External income / Financial yield / Investment sell
      if (isIncome && isDest) {
        balance += tx.amount;
      }
      // 2. External expense / Investment buy
      if (isExpense && isSource) {
        balance -= tx.amount;
      }
      // 3. Internal transfer
      if (tx.nature === 'internal_transfer') {
        if (tx.sourceAccountId === account.id || (tx.accountId === account.id && !tx.destinationAccountId)) balance -= tx.amount;
        if (tx.destinationAccountId === account.id) balance += tx.amount;
      }
      // 4. Reconciliation adjustment
      if (tx.nature === 'reconciliation_adj') {
        if (tx.destinationAccountId === account.id) balance += tx.amount;
        if (tx.sourceAccountId === account.id) balance -= tx.amount;
      }
    });

    return balance;
  },

  calculateLiquidNetWorth(data: FinancialOfficeData): Record<CurrencyCode, number> {
    const liquidTypes = ['cash', 'checking', 'savings', 'high_yield', 'digital_wallet'];
    const result: Record<CurrencyCode, number> = { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };

    (data.accounts || []).forEach(acc => {
      if (liquidTypes.includes(acc.type)) {
        const bal = this.calculateAccountBalance(acc, data.transactions || []);
        result[acc.currency] = (result[acc.currency] || 0) + bal;
      }
    });

    return result;
  },

  calculateInvestedNetWorth(data: FinancialOfficeData): Record<CurrencyCode, number> {
    const result: Record<CurrencyCode, number> = { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };

    // Sum accounts marked as investment
    (data.accounts || []).forEach(acc => {
      if (acc.type === 'investment') {
        const bal = this.calculateAccountBalance(acc, data.transactions || []);
        result[acc.currency] = (result[acc.currency] || 0) + bal;
      }
    });

    // Sum explicit investment positions
    (data.investments || []).forEach(inv => {
      const val = inv.quantity * inv.currentPrice;
      result[inv.currency] = (result[inv.currency] || 0) + val;
    });

    return result;
  },

  calculateTotalNetWorth(data: FinancialOfficeData): Record<CurrencyCode, number> {
    const liquid = this.calculateLiquidNetWorth(data);
    const invested = this.calculateInvestedNetWorth(data);
    const result: Record<CurrencyCode, number> = { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };

    const currencies: CurrencyCode[] = ['COP', 'USD', 'EUR', 'BTC', 'ETH'];
    currencies.forEach(c => {
      result[c] = (liquid[c] || 0) + (invested[c] || 0);
    });

    return result;
  },

  calculateActualMonthlyIncome(transactions: FinancialTransaction[], currency: CurrencyCode, todayStr: string): number {
    if (!transactions || transactions.length === 0) return 0;
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
    return transactions
      .filter(t => t.nature === 'external_income' && t.currency === currency && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  },

  calculateDailyYieldEstimated(account: FinancialAccount, transactions: FinancialTransaction[]): number {
    if (account.type !== 'high_yield' || !account.annualInterestRate) return 0;
    const balance = this.calculateAccountBalance(account, transactions);
    if (balance <= 0) return 0;

    // TEA (Tasa Efectiva Anual) to daily effective rate: (1 + TEA)^(1/365) - 1
    const teaDecimal = account.annualInterestRate / 100;
    const dailyRate = Math.pow(1 + teaDecimal, 1 / 365) - 1;
    return balance * dailyRate;
  },

  suggestEmojiForCategory(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('vivienda') || n.includes('arriendo') || n.includes('casa')) return '🏠';
    if (n.includes('salud') || n.includes('médic') || n.includes('farmacia')) return '🏥';
    if (n.includes('transporte') || n.includes('gasolina') || n.includes('uber')) return '🚗';
    if (n.includes('universidad') || n.includes('matrícula') || n.includes('estudio')) return '🎓';
    if (n.includes('alimentación') || n.includes('mercado') || n.includes('comida')) return '🍔';
    if (n.includes('ahorro')) return '🏦';
    if (n.includes('inversión') || n.includes('bolsa') || n.includes('cripto')) return '📈';
    return '💳';
  },

  calculateBudgetSpent(budget: any, transactions: FinancialTransaction[], todayStr: string): number {
    if (!transactions || transactions.length === 0) return 0;
    
    // Filter transactions by nature 'external_expense' or 'investment_buy'
    const expenses = transactions.filter(t => t.nature === 'external_expense' || t.nature === 'investment_buy');

    // Filter by category if categoryId is specified and not 'all'
    let filtered = expenses;
    if (budget.categoryId && budget.categoryId !== 'all') {
      filtered = filtered.filter(t => 
        t.categoryId === budget.categoryId || 
        t.description.toLowerCase().includes(budget.name.toLowerCase()) ||
        (budget.categoryIdName && t.description.toLowerCase().includes(budget.categoryIdName.toLowerCase()))
      );
    }

    // Filter by period / date range if specified
    if (budget.startDate && budget.endDate) {
      filtered = filtered.filter(t => t.date >= budget.startDate && t.date <= budget.endDate);
    } else if (budget.period === 'monthly' || !budget.period) {
      const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
      filtered = filtered.filter(t => t.date.startsWith(currentMonthPrefix));
    } else if (budget.period === 'weekly') {
      // Last 7 days
      const todayDate = new Date(todayStr);
      const sevenDaysAgo = new Date(todayDate);
      sevenDaysAgo.setDate(todayDate.getDate() - 7);
      const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date >= sevenDaysStr && t.date <= todayStr);
    } else if (budget.period === 'annual') {
      const currentYearPrefix = todayStr.substring(0, 4); // YYYY
      filtered = filtered.filter(t => t.date.startsWith(currentYearPrefix));
    }

    return filtered.reduce((sum, t) => sum + t.amount, 0);
  },

  getObligationStatus(dueDateStr: string, isPaid: boolean, todayStr: string) {
    if (isPaid) {
      return { status: 'paid', label: 'Pagada', color: 'emerald' as const, daysDiff: 0 };
    }

    const today = new Date(todayStr);
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return { status: 'overdue', label: `Vencida (${Math.abs(daysDiff)} d)`, color: 'rose' as const, daysDiff };
    } else if (daysDiff <= 3) {
      return { status: 'due_soon', label: daysDiff === 0 ? 'Vence hoy' : `Vence en ${daysDiff} d`, color: 'amber' as const, daysDiff };
    } else {
      return { status: 'pending', label: `Pendiente (${daysDiff} d)`, color: 'blue' as const, daysDiff };
    }
  },

  generateSmartAlerts(data: FinancialOfficeData, todayStr: string) {
    const alerts: Array<{ id: string; type: 'warning' | 'danger' | 'info' | 'success'; title: string; description: string; moduleId: string }> = [];

    // 1. Check Obligations (overdue / due soon)
    (data.obligations || []).forEach(ob => {
      const st = this.getObligationStatus(ob.dueDate, ob.isPaid, todayStr);
      if (st.status === 'overdue') {
        alerts.push({
          id: `alert_ob_ov_${ob.id}`,
          type: 'danger',
          title: `Obligación Vencida: ${ob.title}`,
          description: `La obligación de $${ob.amount} ${ob.currency} venció hace ${Math.abs(st.daysDiff)} días.`,
          moduleId: 'obligations'
        });
      } else if (st.status === 'due_soon') {
        alerts.push({
          id: `alert_ob_ds_${ob.id}`,
          type: 'warning',
          title: `Obligación Próxima a Vencer: ${ob.title}`,
          description: `Vence ${st.daysDiff === 0 ? 'HOY' : `en ${st.daysDiff} días`}: $${ob.amount} ${ob.currency}.`,
          moduleId: 'obligations'
        });
      }
    });

    // 2. Check Budgets (>90% or >100%)
    (data.budgets || []).forEach((b: any) => {
      const spent = this.calculateBudgetSpent(b, data.transactions || [], todayStr);
      const limit = b.monthlyLimit || 1;
      const pct = (spent / limit) * 100;

      if (pct >= 100) {
        alerts.push({
          id: `alert_bdg_ex_${b.id}`,
          type: 'danger',
          title: `Presupuesto Excedido: ${b.name || 'Categoría'}`,
          description: `Has gastado $${spent.toLocaleString()} de $${limit.toLocaleString()} (${Math.round(pct)}%). Alerta de sobrecosto.`,
          moduleId: 'budgets'
        });
      } else if (pct >= 80) {
        alerts.push({
          id: `alert_bdg_warn_${b.id}`,
          type: 'warning',
          title: `Presupuesto en Riesgo: ${b.name || 'Categoría'}`,
          description: `Has consumido el ${Math.round(pct)}% de tu límite de $${limit.toLocaleString()}.`,
          moduleId: 'budgets'
        });
      }
    });

    // 3. High Yield Yields
    (data.accounts || []).forEach(acc => {
      if (acc.type === 'high_yield' && acc.annualInterestRate) {
        const est = this.calculateDailyYieldEstimated(acc, data.transactions || []);
        if (est > 0) {
          alerts.push({
            id: `alert_yield_${acc.id}`,
            type: 'success',
            title: `Rendimiento Diario Estimado: ${acc.name}`,
            description: `Tu cuenta al ${acc.annualInterestRate}% E.A. genera aprox. $${Math.round(est).toLocaleString()} ${acc.currency}/día.`,
            moduleId: 'accounts'
          });
        }
      }
    });

    return alerts;
  },

  calculateYieldsSummary(transactions: FinancialTransaction[], todayStr: string, currency: CurrencyCode = 'COP') {
    const yieldTxs = (transactions || []).filter(t => t.nature === 'financial_yield' && t.currency === currency);
    const monthPrefix = todayStr.substring(0, 7);
    const yearPrefix = todayStr.substring(0, 4);

    let today = 0;
    let month = 0;
    let year = 0;

    yieldTxs.forEach(t => {
      if (t.date === todayStr) today += t.amount;
      if (t.date.startsWith(monthPrefix)) month += t.amount;
      if (t.date.startsWith(yearPrefix)) year += t.amount;
    });

    return { today, month, year };
  },

  calculateAccountStats(account: FinancialAccount, transactions: FinancialTransaction[], obligations: FinancialObligation[], budgets: any[], todayStr: string) {
    const accountTxs = (transactions || []).filter(
      t => t.sourceAccountId === account.id || t.destinationAccountId === account.id || t.accountId === account.id
    );

    // Sort chronologically
    const sortedTxs = [...accountTxs].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    let currentBalance = account.initialBalance || 0;
    let totalIncomes = 0;
    let totalExpenses = 0;
    let transfersReceived = 0;
    let transfersSent = 0;
    let totalYields = 0;

    const monthPrefix = todayStr.substring(0, 7);
    let monthMovementsCount = 0;

    // Reconstruct balance history
    const balanceHistory: Array<{ date: string; balance: number; delta: number; description: string }> = [
      { date: account.createdAt || '2026-01-01', balance: account.initialBalance || 0, delta: account.initialBalance || 0, description: 'Saldo Inicial' }
    ];

    sortedTxs.forEach(tx => {
      let delta = 0;
      const isIncome = tx.nature === 'external_income' || tx.nature === 'financial_yield' || tx.nature === 'investment_sell';
      const isExpense = tx.nature === 'external_expense' || tx.nature === 'investment_buy';
      const isDest = tx.destinationAccountId === account.id || (tx.accountId === account.id && isIncome);
      const isSource = tx.sourceAccountId === account.id || (tx.accountId === account.id && isExpense);

      if (isIncome && isDest) {
        delta = tx.amount;
        if (tx.nature === 'external_income') totalIncomes += tx.amount;
        if (tx.nature === 'financial_yield') totalYields += tx.amount;
      } else if (isExpense && isSource) {
        delta = -tx.amount;
        if (isExpense) totalExpenses += tx.amount;
      } else if (tx.nature === 'internal_transfer') {
        if (tx.destinationAccountId === account.id) {
          delta = tx.amount;
          transfersReceived += tx.amount;
        } else if (tx.sourceAccountId === account.id || (tx.accountId === account.id && !tx.destinationAccountId)) {
          delta = -tx.amount;
          transfersSent += tx.amount;
        }
      } else if (tx.nature === 'reconciliation_adj') {
        if (tx.destinationAccountId === account.id) delta = tx.amount;
        if (tx.sourceAccountId === account.id) delta = -tx.amount;
      }

      currentBalance += delta;
      balanceHistory.push({
        date: tx.date,
        balance: currentBalance,
        delta,
        description: tx.description
      });

      if (tx.date.startsWith(monthPrefix)) {
        monthMovementsCount++;
      }
    });

    const lastMovement = sortedTxs.length > 0 ? sortedTxs[sortedTxs.length - 1] : null;

    // Associated Obligations
    const associatedObligations = (obligations || []).filter(
      o => o.currency === account.currency && !o.isPaid
    );

    // Associated Budgets
    const associatedBudgets = (budgets || []).filter(b => b.currency === account.currency);

    return {
      currentBalance,
      initialBalance: account.initialBalance || 0,
      totalIncomes,
      totalExpenses,
      transfersReceived,
      transfersSent,
      totalYields,
      monthMovementsCount,
      lastMovement,
      balanceHistory,
      associatedObligations,
      associatedBudgets,
      accountTxs
    };
  },

  // DYNAMIC BUDGET CALCULATIONS (PRESUPUESTOS Y CATEGORÍAS)
  calculateBudgetUsedAmount(fundId: string, transactions: FinancialTransaction[], monthPrefix?: string): { amount: number; count: number } {
    if (!transactions || transactions.length === 0) return { amount: 0, count: 0 };

    let total = 0;
    let count = 0;

    transactions.forEach(t => {
      if (t.nature !== 'external_expense' && t.nature !== 'investment_buy') return;
      if (monthPrefix && !t.date.startsWith(monthPrefix)) return;

      if (t.splits && t.splits.length > 0) {
        t.splits.forEach(s => {
          if (s.budgetId === fundId) {
            total += s.amount;
            count++;
          }
        });
      } else if (t.budgetId === fundId) {
        total += t.amount;
        count++;
      }
    });

    return { amount: total, count };
  },

  calculateFundUsedAmount(fundId: string, transactions: FinancialTransaction[], monthPrefix?: string): { amount: number; count: number } {
    return this.calculateBudgetUsedAmount(fundId, transactions, monthPrefix);
  },

  calculateCategoryUsedAmount(
    fundId: string,
    categoryId: string,
    categoryName: string,
    transactions: FinancialTransaction[],
    monthPrefix?: string
  ): { amount: number; count: number } {
    if (!transactions || transactions.length === 0) return { amount: 0, count: 0 };

    let total = 0;
    let count = 0;
    const catNameLower = (categoryName || '').toLowerCase();

    transactions.forEach(t => {
      if (t.nature !== 'external_expense' && t.nature !== 'investment_buy') return;
      if (monthPrefix && !t.date.startsWith(monthPrefix)) return;

      if (t.splits && t.splits.length > 0) {
        t.splits.forEach(s => {
          if (s.budgetId === fundId) {
            if (!categoryId || s.budgetCategoryId === categoryId || (s.categoryName && s.categoryName.toLowerCase() === catNameLower)) {
              total += s.amount;
              count++;
            }
          }
        });
      } else if (t.budgetId === fundId) {
        if (
          !categoryId ||
          t.budgetCategoryId === categoryId ||
          t.categoryId === categoryId ||
          (catNameLower && t.description.toLowerCase().includes(catNameLower))
        ) {
          total += t.amount;
          count++;
        }
      } else if (!t.budgetId) {
        if (
          (categoryId && (t.budgetCategoryId === categoryId || t.categoryId === categoryId)) ||
          (catNameLower && t.description.toLowerCase().includes(catNameLower))
        ) {
          total += t.amount;
          count++;
        }
      }
    });

    return { amount: total, count };
  },

  getCategoryAlertStatus(percent: number) {
    if (percent > 100) {
      return {
        level: 'over' as const,
        emoji: '🚨',
        message: 'Has sobrepasado el presupuesto asignado.',
        badgeColor: 'rose' as const,
        alertClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50'
      };
    } else if (percent === 100) {
      return {
        level: 'exhausted' as const,
        emoji: '⚠',
        message: 'Presupuesto agotado.',
        badgeColor: 'amber' as const,
        alertClass: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    } else if (percent >= 95) {
      return {
        level: 'critical' as const,
        emoji: '🔴',
        message: 'Has consumido casi todo el presupuesto.',
        badgeColor: 'rose' as const,
        alertClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
      };
    } else if (percent >= 80) {
      return {
        level: 'warning' as const,
        emoji: '🟡',
        message: 'Estás cerca del límite de esta categoría.',
        badgeColor: 'amber' as const,
        alertClass: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    return {
      level: 'ok' as const,
      emoji: '🟢',
      message: 'Presupuesto dentro del límite.',
      badgeColor: 'emerald' as const,
      alertClass: 'bg-emerald-500/10 text-emerald-800 border-emerald-200'
    };
  },

  getCalculatedBudgets(data: FinancialOfficeData, todayStr: string) {
    const plan = data.distributionPlan || {
      incomeBaseMode: 'calculated',
      monthlyBaseIncome: undefined,
      currency: 'COP',
      funds: [
        { id: 'fund_necesarios', name: 'Gastos Necesarios', percentage: 50, emoji: '🏠', color: 'emerald', categories: [] },
        { id: 'fund_personales', name: 'Gastos Personales', percentage: 30, emoji: '🎟️', color: 'purple', categories: [] },
        { id: 'fund_ahorro', name: 'Ahorro e Inversión', percentage: 20, emoji: 'blue', categories: [] }
      ]
    };

    const currency: CurrencyCode = plan.currency || 'COP';
    const mode = plan.incomeBaseMode || 'calculated';

    // Regla fundamental: El ingreso base para la asignación de presupuestos es estrictamente el ingreso de la quincena actual
    const currentQuincenaInfo = this.getQuincenalPeriodInfo(todayStr);
    const quincenaIncome = this.calculateQuincenalIncome(data.transactions || [], currency, currentQuincenaInfo.startDate, currentQuincenaInfo.endDate);
    const actualMonthlyIncome = this.calculateActualMonthlyIncome(data.transactions || [], currency, todayStr);

    const baseIncome = mode === 'manual'
      ? (plan.monthlyBaseIncome !== undefined && plan.monthlyBaseIncome !== null ? plan.monthlyBaseIncome : 0)
      : (quincenaIncome > 0 ? quincenaIncome : (actualMonthlyIncome > 0 ? actualMonthlyIncome : 0));

    const fundsRaw = (plan.funds && plan.funds.length > 0) ? plan.funds : [
      { id: 'fund_necesarios', name: 'Gastos Necesarios', percentage: 50, emoji: '🏠', color: 'emerald', categories: [] },
      { id: 'fund_personales', name: 'Gastos Personales', percentage: 30, emoji: '🎟️', color: 'purple', categories: [] },
      { id: 'fund_ahorro', name: 'Ahorro e Inversión', percentage: 20, emoji: 'blue', categories: [] }
    ];

    const monthPrefix = todayStr.substring(0, 7);

    const funds = fundsRaw.map(f => {
      const targetBudget = baseIncome * ((f.percentage || 0) / 100);
      const spent = this.calculateFundUsedAmount(f.id, data.transactions || [], monthPrefix).amount;
      const remaining = targetBudget - spent;
      const percentUsed = targetBudget > 0 ? (spent / targetBudget) * 100 : 0;

      const categories = (f.categories || []).map(c => {
        const catTargetBudget = targetBudget * ((c.percentage || 0) / 100);
        const catSpent = this.calculateCategoryUsedAmount(f.id, c.id, c.name, data.transactions || [], monthPrefix).amount;
        const catRemaining = catTargetBudget - catSpent;
        const catPercentUsed = catTargetBudget > 0 ? (catSpent / catTargetBudget) * 100 : 0;

        return {
          id: c.id,
          name: c.name,
          emoji: c.emoji || '📁',
          percentage: c.percentage || 0,
          targetBudget: catTargetBudget,
          spent: catSpent,
          remaining: catRemaining,
          percentUsed: catPercentUsed
        };
      });

      return {
        id: f.id,
        name: f.name.startsWith('Presupuesto') ? f.name : `Presupuesto de ${f.name}`,
        rawName: f.name,
        emoji: f.emoji || '💼',
        color: f.color || 'emerald',
        percentage: f.percentage || 0,
        targetBudget,
        spent,
        remaining,
        percentUsed,
        categories
      };
    });

    const totalAssigned = funds.reduce((acc, f) => acc + f.targetBudget, 0);
    const totalSpent = funds.reduce((acc, f) => acc + f.spent, 0);
    const totalRemaining = totalAssigned - totalSpent;
    const overallPct = totalAssigned > 0 ? (totalSpent / totalAssigned) * 100 : 0;

    return {
      baseIncome,
      currency,
      incomeMode: mode,
      funds,
      totalAssigned,
      totalSpent,
      totalRemaining,
      overallPct
    };
  },

  // -------------------------------------------------------------
  // CÁLCULOS QUINCENALES AUTOMÁTICOS (1-15 y 16-30/31)
  // -------------------------------------------------------------
  getQuincenalPeriodInfo(dateStr: string) {
    const SPANISH_MONTHS = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const parts = (dateStr || '').split('-');
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const monthName = SPANISH_MONTHS[month - 1] || 'Mes';

    if (day <= 15) {
      return {
        id: `${year}-${pad(month)}-Q1`,
        year,
        month,
        quincena: 1 as const,
        startDate: `${year}-${pad(month)}-01`,
        endDate: `${year}-${pad(month)}-15`,
        daysInMonth,
        dayRangeText: '1–15',
        monthName,
        periodLabel: `Quincena 1–15 de ${monthName} de ${year}`,
        shortLabel: `1–15 ${monthName}`
      };
    } else {
      return {
        id: `${year}-${pad(month)}-Q2`,
        year,
        month,
        quincena: 2 as const,
        startDate: `${year}-${pad(month)}-16`,
        endDate: `${year}-${pad(month)}-${pad(daysInMonth)}`,
        daysInMonth,
        dayRangeText: `16–${daysInMonth}`,
        monthName,
        periodLabel: `Quincena 16–${daysInMonth} de ${monthName} de ${year}`,
        shortLabel: `16–${daysInMonth} ${monthName}`
      };
    }
  },

  getPreviousQuincenalPeriodInfo(dateStr: string) {
    const current = this.getQuincenalPeriodInfo(dateStr);
    const SPANISH_MONTHS = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (current.quincena === 2) {
      // Previous is Q1 of same month
      return {
        id: `${current.year}-${pad(current.month)}-Q1`,
        year: current.year,
        month: current.month,
        quincena: 1 as const,
        startDate: `${current.year}-${pad(current.month)}-01`,
        endDate: `${current.year}-${pad(current.month)}-15`,
        daysInMonth: current.daysInMonth,
        dayRangeText: '1–15',
        monthName: current.monthName,
        periodLabel: `Quincena 1–15 de ${current.monthName} de ${current.year}`,
        shortLabel: `1–15 ${current.monthName}`
      };
    } else {
      // Previous is Q2 of previous month
      let prevYear = current.year;
      let prevMonth = current.month - 1;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevDaysInMonth = new Date(prevYear, prevMonth, 0).getDate();
      const prevMonthName = SPANISH_MONTHS[prevMonth - 1];

      return {
        id: `${prevYear}-${pad(prevMonth)}-Q2`,
        year: prevYear,
        month: prevMonth,
        quincena: 2 as const,
        startDate: `${prevYear}-${pad(prevMonth)}-16`,
        endDate: `${prevYear}-${pad(prevMonth)}-${pad(prevDaysInMonth)}`,
        daysInMonth: prevDaysInMonth,
        dayRangeText: `16–${prevDaysInMonth}`,
        monthName: prevMonthName,
        periodLabel: `Quincena 16–${prevDaysInMonth} de ${prevMonthName} de ${prevYear}`,
        shortLabel: `16–${prevDaysInMonth} ${prevMonthName}`
      };
    }
  },

  calculateQuincenalIncome(transactions: FinancialTransaction[], currency: CurrencyCode, startDate: string, endDate: string): number {
    if (!transactions || transactions.length === 0) return 0;
    return transactions
      .filter(t => 
        (t.nature === 'external_income' || t.nature === 'financial_yield' || t.nature === 'investment_sell') &&
        t.currency === currency &&
        t.date >= startDate &&
        t.date <= endDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },

  calculateQuincenalExpenses(transactions: FinancialTransaction[], currency: CurrencyCode, startDate: string, endDate: string): number {
    if (!transactions || transactions.length === 0) return 0;
    return transactions
      .filter(t => 
        (t.nature === 'external_expense' || t.nature === 'investment_buy') &&
        t.currency === currency &&
        t.date >= startDate &&
        t.date <= endDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },

  calculateQuincenalBudgetItemSpent(
    budgetItem: { id: string; name: string; categoryName?: string },
    transactions: FinancialTransaction[],
    currency: CurrencyCode,
    startDate: string,
    endDate: string
  ): number {
    if (!transactions || transactions.length === 0) return 0;
    const nameLower = (budgetItem.name || '').toLowerCase();
    const catLower = (budgetItem.categoryName || '').toLowerCase();

    return transactions
      .filter(t => 
        (t.nature === 'external_expense' || t.nature === 'investment_buy') &&
        t.currency === currency &&
        t.date >= startDate &&
        t.date <= endDate
      )
      .reduce((sum, t) => {
        // Splits check
        if (t.splits && t.splits.length > 0) {
          const splitSum = t.splits.reduce((sAcc, s) => {
            let match = false;
            if (s.budgetId === budgetItem.id) match = true;
            else if (s.categoryName && (s.categoryName.toLowerCase().includes(nameLower) || (catLower && s.categoryName.toLowerCase().includes(catLower)))) match = true;
            else if (s.description && (s.description.toLowerCase().includes(nameLower) || (catLower && s.description.toLowerCase().includes(catLower)))) match = true;
            return match ? sAcc + s.amount : sAcc;
          }, 0);
          return sum + splitSum;
        }

        // Direct check
        let isMatch = false;
        if (t.budgetId === budgetItem.id) isMatch = true;
        else if (t.description && (t.description.toLowerCase().includes(nameLower) || (catLower && t.description.toLowerCase().includes(catLower)))) isMatch = true;
        else if (t.categoryId && (t.categoryId.toLowerCase().includes(nameLower) || (catLower && t.categoryId.toLowerCase().includes(catLower)))) isMatch = true;
        else if (t.tags && t.tags.some(tg => tg.toLowerCase().includes(nameLower) || (catLower && tg.toLowerCase().includes(catLower)))) isMatch = true;

        return isMatch ? sum + t.amount : sum;
      }, 0);
  }
};

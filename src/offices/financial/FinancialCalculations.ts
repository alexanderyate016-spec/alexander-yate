import { FinancialAccount, FinancialTransaction, FinancialObligation, FinancialOfficeData, CurrencyCode } from '../../types/store';

export const FinancialCalculations = {
  calculateAccountBalance(account: FinancialAccount, transactions: FinancialTransaction[]): number {
    let balance = account.initialBalance || 0;

    transactions.forEach(tx => {
      // 1. External income / Financial yield
      if ((tx.nature === 'external_income' || tx.nature === 'financial_yield' || tx.nature === 'investment_sell') && tx.destinationAccountId === account.id) {
        balance += tx.amount;
      }
      // 2. External expense / Investment buy
      if ((tx.nature === 'external_expense' || tx.nature === 'investment_buy') && tx.sourceAccountId === account.id) {
        balance -= tx.amount;
      }
      // 3. Internal transfer
      if (tx.nature === 'internal_transfer') {
        if (tx.sourceAccountId === account.id) balance -= tx.amount;
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
      t => t.sourceAccountId === account.id || t.destinationAccountId === account.id
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
      if ((tx.nature === 'external_income' || tx.nature === 'financial_yield' || tx.nature === 'investment_sell') && tx.destinationAccountId === account.id) {
        delta = tx.amount;
        if (tx.nature === 'external_income') totalIncomes += tx.amount;
        if (tx.nature === 'financial_yield') totalYields += tx.amount;
      } else if ((tx.nature === 'external_expense' || tx.nature === 'investment_buy') && tx.sourceAccountId === account.id) {
        delta = -tx.amount;
        if (tx.nature === 'external_expense' || tx.nature === 'investment_buy') totalExpenses += tx.amount;
      } else if (tx.nature === 'internal_transfer') {
        if (tx.destinationAccountId === account.id) {
          delta = tx.amount;
          transfersReceived += tx.amount;
        } else if (tx.sourceAccountId === account.id) {
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
    const catNameLower = categoryName.toLowerCase();

    transactions.forEach(t => {
      if (t.nature !== 'external_expense' && t.nature !== 'investment_buy') return;
      if (monthPrefix && !t.date.startsWith(monthPrefix)) return;

      if (t.splits && t.splits.length > 0) {
        t.splits.forEach(s => {
          if (s.budgetId === fundId) {
            if (s.budgetCategoryId === categoryId || (s.categoryName && s.categoryName.toLowerCase() === catNameLower)) {
              total += s.amount;
              count++;
            }
          }
        });
      } else if (t.budgetId === fundId) {
        if (
          t.budgetCategoryId === categoryId ||
          t.categoryId === categoryId ||
          t.description.toLowerCase().includes(catNameLower)
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
  }
};

import { storeInstance } from '../../store/CasaBlancaStore';
import { getDefaultDistributionPlan } from '../../store/defaultState';
import {
  FinancialOfficeData,
  FinancialAccount,
  FinancialTransaction,
  FinancialObligation,
  InvestmentPosition,
  CurrencyCode,
  FinancialFundPlan,
  FinancialCategoryPlan,
  FinancialSubcategoryPlan,
  QuincenalBudgetItem,
  QuincenalPeriodRecord,
  QuincenalBudgetOfficeState
} from '../../types/store';
import { FinancialCalculations } from './FinancialCalculations';

export const FinancialStore = {
  getData(): FinancialOfficeData {
    return storeInstance.getState().offices.financiera;
  },

  // ACCOUNTS
  addAccount(account: Omit<FinancialAccount, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const nowStr = new Date().toISOString().split('T')[0];
      draft.offices.financiera.accounts.push({
        ...account,
        id,
        createdAt: account.createdAt || nowStr,
        updatedAt: nowStr,
        archived: false
      });
    });
  },

  updateAccount(id: string, updates: Partial<FinancialAccount>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.financiera.accounts.findIndex(a => a.id === id);
      if (idx !== -1) {
        const nowStr = new Date().toISOString().split('T')[0];
        draft.offices.financiera.accounts[idx] = {
          ...draft.offices.financiera.accounts[idx],
          ...updates,
          updatedAt: nowStr
        };
      }
    });
  },

  archiveAccount(id: string) {
    storeInstance.updateState(draft => {
      const acc = draft.offices.financiera.accounts.find(a => a.id === id);
      if (acc) {
        acc.archived = true;
        acc.updatedAt = new Date().toISOString().split('T')[0];
      }
    });
  },

  unarchiveAccount(id: string) {
    storeInstance.updateState(draft => {
      const acc = draft.offices.financiera.accounts.find(a => a.id === id);
      if (acc) {
        acc.archived = false;
        acc.updatedAt = new Date().toISOString().split('T')[0];
      }
    });
  },

  deleteAccount(id: string) {
    storeInstance.updateState(draft => {
      // Rule: Do not delete if account has transactions, archive instead
      const hasTransactions = (draft.offices.financiera.transactions || []).some(
        t => t.sourceAccountId === id || t.destinationAccountId === id
      );

      if (hasTransactions) {
        const acc = draft.offices.financiera.accounts.find(a => a.id === id);
        if (acc) {
          acc.archived = true;
          acc.updatedAt = new Date().toISOString().split('T')[0];
        }
      } else {
        draft.offices.financiera.accounts = draft.offices.financiera.accounts.filter(a => a.id !== id);
      }
    });
  },

  // AUTOMATIC DAILY YIELDS CALCULATION
  processDailyYields(todayStr: string) {
    storeInstance.updateState(draft => {
      const highYieldAccounts = (draft.offices.financiera.accounts || []).filter(
        a => a.type === 'high_yield' && a.annualInterestRate && a.annualInterestRate > 0 && !a.archived
      );

      if (highYieldAccounts.length === 0) return;

      // Check dates for the last 7 days up to today
      const datesToCheck: string[] = [];
      const today = new Date(todayStr);
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        datesToCheck.push(d.toISOString().split('T')[0]);
      }

      highYieldAccounts.forEach(acc => {
        datesToCheck.forEach(dateStr => {
          const exists = draft.offices.financiera.transactions.some(
            t => t.nature === 'financial_yield' && t.destinationAccountId === acc.id && t.date === dateStr
          );

          if (!exists) {
            // Calculate balance on or before dateStr
            let balance = acc.initialBalance || 0;
            draft.offices.financiera.transactions.forEach(tx => {
              if (tx.date <= dateStr) {
                if ((tx.nature === 'external_income' || tx.nature === 'financial_yield' || tx.nature === 'investment_sell') && tx.destinationAccountId === acc.id) {
                  balance += tx.amount;
                }
                if ((tx.nature === 'external_expense' || tx.nature === 'investment_buy') && tx.sourceAccountId === acc.id) {
                  balance -= tx.amount;
                }
                if (tx.nature === 'internal_transfer') {
                  if (tx.sourceAccountId === acc.id) balance -= tx.amount;
                  if (tx.destinationAccountId === acc.id) balance += tx.amount;
                }
                if (tx.nature === 'reconciliation_adj') {
                  if (tx.destinationAccountId === acc.id) balance += tx.amount;
                  if (tx.sourceAccountId === acc.id) balance -= tx.amount;
                }
              }
            });

            if (balance > 0) {
              const teaDecimal = (acc.annualInterestRate || 0) / 100;
              const dailyRate = Math.pow(1 + teaDecimal, 1 / 365) - 1;
              const rawYield = balance * dailyRate;
              const yieldAmount = acc.currency === 'COP' ? Math.round(rawYield) : Math.round(rawYield * 100) / 100;

              if (yieldAmount > 0) {
                draft.offices.financiera.transactions.push({
                  id: 'tx_yield_' + acc.id + '_' + dateStr + '_' + Math.random().toString(36).substring(2, 6),
                  date: dateStr,
                  time: '00:01',
                  nature: 'financial_yield',
                  destinationAccountId: acc.id,
                  sourceName: 'Sistema',
                  description: `Rendimiento diario (${acc.annualInterestRate}% EA)`,
                  amount: yieldAmount,
                  currency: acc.currency,
                  tags: ['rendimiento', 'auto', 'alto_rendimiento']
                });
              }
            }
          }
        });
      });
    });
  },

  addManualYield(accountId: string, amount: number, description?: string, dateStr?: string) {
    storeInstance.updateState(draft => {
      const acc = draft.offices.financiera.accounts.find(a => a.id === accountId);
      if (!acc) return;

      const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.transactions.push({
        id: txId,
        date: dateStr || new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        nature: 'financial_yield',
        destinationAccountId: accountId,
        sourceName: 'Manual',
        description: description || 'Rendimiento manual abonado',
        amount: Math.abs(amount),
        currency: acc.currency,
        tags: ['rendimiento', 'manual']
      });
    });
  },

  // TRANSACTIONS
  addTransaction(tx: Omit<FinancialTransaction, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.transactions.push({ ...tx, id });

      // If it's an investment buy transaction, automatically record/update position
      if (tx.nature === 'investment_buy' && tx.assetName && tx.assetQuantity && tx.unitPrice) {
        if (!draft.offices.financiera.investments) draft.offices.financiera.investments = [];
        const existingInv = draft.offices.financiera.investments.find(
          i => i.assetName.toLowerCase() === tx.assetName!.toLowerCase()
        );
        if (existingInv) {
          const totalQty = existingInv.quantity + tx.assetQuantity;
          const totalCost = (existingInv.quantity * existingInv.avgPurchasePrice) + (tx.assetQuantity * tx.unitPrice);
          existingInv.quantity = totalQty;
          existingInv.avgPurchasePrice = totalCost / totalQty;
          existingInv.currentPrice = tx.unitPrice;
        } else {
          draft.offices.financiera.investments.push({
            id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            assetName: tx.assetName,
            type: 'Inversión',
            quantity: tx.assetQuantity,
            avgPurchasePrice: tx.unitPrice,
            currentPrice: tx.unitPrice,
            currency: tx.currency,
            purchaseDate: tx.date
          });
        }
      }

      // If it's an investment sell transaction, reduce quantity from position
      if (tx.nature === 'investment_sell' && tx.assetName && tx.assetQuantity) {
        if (draft.offices.financiera.investments) {
          const existingInv = draft.offices.financiera.investments.find(
            i => i.assetName.toLowerCase() === tx.assetName!.toLowerCase()
          );
          if (existingInv) {
            existingInv.quantity = Math.max(0, existingInv.quantity - tx.assetQuantity);
            if (tx.unitPrice) existingInv.currentPrice = tx.unitPrice;
          }
        }
      }
    });

    // Auto-sync quincenal periods
    this.syncCurrentQuincenalPeriod();
  },

  deleteTransaction(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.financiera.transactions = draft.offices.financiera.transactions.filter(t => t.id !== id);
    });
    this.syncCurrentQuincenalPeriod();
  },

  updateTransaction(id: string, updates: Partial<FinancialTransaction>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.financiera.transactions.findIndex(t => t.id === id);
      if (idx !== -1) {
        draft.offices.financiera.transactions[idx] = {
          ...draft.offices.financiera.transactions[idx],
          ...updates
        };
      }
    });
    this.syncCurrentQuincenalPeriod();
  },

  // OBLIGATIONS
  addObligation(ob: Omit<FinancialObligation, 'id' | 'isPaid'>) {
    storeInstance.updateState(draft => {
      const id = 'ob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.obligations.push({ ...ob, id, isPaid: false });
    });
  },

  toggleObligationPaid(id: string) {
    storeInstance.updateState(draft => {
      const ob = draft.offices.financiera.obligations.find(o => o.id === id);
      if (ob) ob.isPaid = !ob.isPaid;
    });
  },

  payObligationWithAccount(id: string, sourceAccountId?: string, paymentDate?: string, paymentTime?: string) {
    storeInstance.updateState(draft => {
      const ob = draft.offices.financiera.obligations.find(o => o.id === id);
      if (ob) {
        ob.isPaid = true;

        if (sourceAccountId) {
          const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          draft.offices.financiera.transactions.push({
            id: txId,
            date: paymentDate || new Date().toISOString().split('T')[0],
            time: paymentTime || new Date().toTimeString().slice(0, 5),
            nature: 'external_expense',
            sourceAccountId,
            description: `Pago de Obligación: ${ob.title}`,
            amount: ob.amount,
            currency: ob.currency,
            categoryId: ob.category,
            tags: ['obligación', 'pago']
          });
        }
      }
    });
  },

  updateObligation(id: string, updates: Partial<FinancialObligation>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.financiera.obligations.findIndex(o => o.id === id);
      if (idx !== -1) {
        draft.offices.financiera.obligations[idx] = { ...draft.offices.financiera.obligations[idx], ...updates };
      }
    });
  },

  deleteObligation(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.financiera.obligations = draft.offices.financiera.obligations.filter(o => o.id !== id);
    });
  },

  // BUDGETS
  addBudget(budget: { name: string; categoryId: string; monthlyLimit: number; currency: CurrencyCode; period?: string; startDate?: string; endDate?: string }) {
    storeInstance.updateState(draft => {
      const id = 'bdg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.financiera.budgets) draft.offices.financiera.budgets = [];
      draft.offices.financiera.budgets.push({ ...budget, id } as any);
    });
  },

  updateBudget(id: string, updates: Partial<{ name: string; categoryId: string; monthlyLimit: number; currency: CurrencyCode; period?: string; startDate?: string; endDate?: string }>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.budgets) return;
      const idx = draft.offices.financiera.budgets.findIndex((b: any) => b.id === id);
      if (idx !== -1) {
        draft.offices.financiera.budgets[idx] = { ...draft.offices.financiera.budgets[idx], ...updates };
      }
    });
  },

  deleteBudget(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.budgets) return;
      draft.offices.financiera.budgets = draft.offices.financiera.budgets.filter((b: any) => b.id !== id);
    });
  },

  // SAVINGS
  addSavingGoal(goal: { goalName: string; targetAmount: number; currentAmount: number; currency: CurrencyCode; targetDate?: string; accountId?: string }) {
    storeInstance.updateState(draft => {
      const id = 'svg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.financiera.savings) draft.offices.financiera.savings = [];
      draft.offices.financiera.savings.push({ ...goal, id } as any);
    });
  },

  addContributionToSaving(goalId: string, amount: number, sourceAccountId?: string, notes?: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.savings) return;
      const goal = draft.offices.financiera.savings.find((s: any) => s.id === goalId);
      if (goal) {
        goal.currentAmount = (goal.currentAmount || 0) + amount;

        if (sourceAccountId) {
          const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          draft.offices.financiera.transactions.push({
            id: txId,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            nature: 'external_expense',
            sourceAccountId,
            description: `Aporte a Meta de Ahorro: ${goal.goalName}${notes ? ` (${notes})` : ''}`,
            amount,
            currency: goal.currency,
            tags: ['ahorro', 'aporte']
          });
        }
      }
    });
  },

  updateSavingGoal(id: string, updates: Partial<{ goalName: string; targetAmount: number; currentAmount: number; currency: CurrencyCode; targetDate?: string; accountId?: string }>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.savings) return;
      const idx = draft.offices.financiera.savings.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        draft.offices.financiera.savings[idx] = { ...draft.offices.financiera.savings[idx], ...updates };
      }
    });
  },

  deleteSavingGoal(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.savings) return;
      draft.offices.financiera.savings = draft.offices.financiera.savings.filter((s: any) => s.id !== id);
    });
  },

  // CATEGORIES
  addCategory(category: { name: string; color: string; emoji?: string }) {
    storeInstance.updateState(draft => {
      const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.financiera.categories) draft.offices.financiera.categories = [];
      draft.offices.financiera.categories.push({ ...category, id });
    });
  },

  deleteCategory(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.categories) return;
      draft.offices.financiera.categories = draft.offices.financiera.categories.filter(c => c.id !== id);
    });
  },

  // INVESTMENTS
  addInvestment(inv: Omit<InvestmentPosition, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      if (!draft.offices.financiera.investments) draft.offices.financiera.investments = [];
      draft.offices.financiera.investments.push({ ...inv, id });
    });
  },

  updateInvestment(id: string, updates: Partial<InvestmentPosition>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.investments) return;
      const idx = draft.offices.financiera.investments.findIndex(i => i.id === id);
      if (idx !== -1) {
        draft.offices.financiera.investments[idx] = { ...draft.offices.financiera.investments[idx], ...updates };
      }
    });
  },

  deleteInvestment(id: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.investments) return;
      draft.offices.financiera.investments = draft.offices.financiera.investments.filter(i => i.id !== id);
    });
  },

  // DISTRIBUTION PLAN (Plan de Distribución Financiera)
  setDistributionIncomeBaseMode(mode: 'manual' | 'calculated') {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) {
        draft.offices.financiera.distributionPlan = getDefaultDistributionPlan();
      }
      draft.offices.financiera.distributionPlan.incomeBaseMode = mode;
    });
  },

  setDistributionBaseIncome(amount: number | undefined) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) {
        draft.offices.financiera.distributionPlan = getDefaultDistributionPlan();
      }
      draft.offices.financiera.distributionPlan.monthlyBaseIncome = amount;
    });
  },

  addFund(fund: { name: string; percentage: number; color: string; emoji?: string }) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) {
        draft.offices.financiera.distributionPlan = getDefaultDistributionPlan();
      }
      const id = 'fund_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.distributionPlan.funds.push({
        ...fund,
        id,
        categories: []
      });
    });
  },

  updateFund(fundId: string, updates: Partial<FinancialFundPlan>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const idx = draft.offices.financiera.distributionPlan.funds.findIndex(f => f.id === fundId);
      if (idx !== -1) {
        draft.offices.financiera.distributionPlan.funds[idx] = {
          ...draft.offices.financiera.distributionPlan.funds[idx],
          ...updates
        };
      }
    });
  },

  deleteFund(fundId: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      draft.offices.financiera.distributionPlan.funds = draft.offices.financiera.distributionPlan.funds.filter(f => f.id !== fundId);
    });
  },

  reorderFunds(funds: FinancialFundPlan[]) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      draft.offices.financiera.distributionPlan.funds = funds;
    });
  },

  rebalanceFunds(reduceFundId: string, increaseFundId: string, transferPct: number) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const funds = draft.offices.financiera.distributionPlan.funds;
      const reduceFund = funds.find(f => f.id === reduceFundId);
      const increaseFund = funds.find(f => f.id === increaseFundId);
      if (reduceFund && increaseFund) {
        const actualTransfer = Math.min(reduceFund.percentage, Math.max(0, transferPct));
        reduceFund.percentage = Math.max(0, reduceFund.percentage - actualTransfer);
        increaseFund.percentage = Math.min(100, increaseFund.percentage + actualTransfer);
      }
    });
  },

  addCategoryToFund(fundId: string, category: { name: string; percentage: number; emoji?: string }) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const fund = draft.offices.financiera.distributionPlan.funds.find(f => f.id === fundId);
      if (fund) {
        const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        if (!fund.categories) fund.categories = [];
        fund.categories.push({
          ...category,
          id,
          subcategories: []
        });
      }
    });
  },

  updateCategoryInFund(fundId: string, categoryId: string, updates: Partial<FinancialCategoryPlan>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const fund = draft.offices.financiera.distributionPlan.funds.find(f => f.id === fundId);
      if (fund && fund.categories) {
        const idx = fund.categories.findIndex(c => c.id === categoryId);
        if (idx !== -1) {
          fund.categories[idx] = { ...fund.categories[idx], ...updates };
        }
      }
    });
  },

  deleteCategoryFromFund(fundId: string, categoryId: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const fund = draft.offices.financiera.distributionPlan.funds.find(f => f.id === fundId);
      if (fund && fund.categories) {
        fund.categories = fund.categories.filter(c => c.id !== categoryId);
      }
    });
  },

  addSubcategoryToCategory(fundId: string, categoryId: string, subcategory: { name: string; percentage: number; emoji?: string }) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const fund = draft.offices.financiera.distributionPlan.funds.find(f => f.id === fundId);
      if (fund && fund.categories) {
        const cat = fund.categories.find(c => c.id === categoryId);
        if (cat) {
          if (!cat.subcategories) cat.subcategories = [];
          const id = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          cat.subcategories.push({ ...subcategory, id });
        }
      }
    });
  },

  updateSubcategoryInCategory(fundId: string, categoryId: string, subcategoryId: string, updates: Partial<FinancialSubcategoryPlan>) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const fund = draft.offices.financiera.distributionPlan.funds.find(f => f.id === fundId);
      if (fund && fund.categories) {
        const cat = fund.categories.find(c => c.id === categoryId);
        if (cat && cat.subcategories) {
          const idx = cat.subcategories.findIndex(s => s.id === subcategoryId);
          if (idx !== -1) {
            cat.subcategories[idx] = { ...cat.subcategories[idx], ...updates };
          }
        }
      }
    });
  },

  deleteSubcategoryFromCategory(fundId: string, categoryId: string, subcategoryId: string) {
    storeInstance.updateState(draft => {
      if (!draft.offices.financiera.distributionPlan) return;
      const fund = draft.offices.financiera.distributionPlan.funds.find(f => f.id === fundId);
      if (fund && fund.categories) {
        const cat = fund.categories.find(c => c.id === categoryId);
        if (cat && cat.subcategories) {
          cat.subcategories = cat.subcategories.filter(s => s.id !== subcategoryId);
        }
      }
    });
  },

  resetDistributionPlanToDefault() {
    storeInstance.updateState(draft => {
      draft.offices.financiera.distributionPlan = getDefaultDistributionPlan();
    });
  },

  // -------------------------------------------------------------
  // PRESUPUESTOS QUINCENALES AUTOMÁTICOS (Día 1-15 y Día 16-30/31)
  // -------------------------------------------------------------
  syncQuincenalPeriod(todayStr: string) {
    storeInstance.updateState(draft => {
      const currentInfo = FinancialCalculations.getQuincenalPeriodInfo(todayStr);

      if (!draft.offices.financiera.quincenalBudgets) {
        draft.offices.financiera.quincenalBudgets = {
          currentPeriodId: currentInfo.id,
          budgetTemplates: [
            { id: 'tmpl_necesarios', name: 'Gastos Necesarios', emoji: '🏠', color: 'emerald', defaultAmount: 42000, defaultPercentage: 58.3 },
            { id: 'tmpl_personales', name: 'Gastos Personales', emoji: '💳', color: 'purple', defaultAmount: 20000, defaultPercentage: 27.8 },
            { id: 'tmpl_ahorro', name: 'Ahorro', emoji: '🏦', color: 'blue', defaultAmount: 10000, defaultPercentage: 13.9 }
          ],
          periodHistory: [],
          accumulatedCarryover: 0
        };
      }

      const qbState = draft.offices.financiera.quincenalBudgets;
      qbState.currentPeriodId = currentInfo.id;
      const transactions = draft.offices.financiera.transactions || [];

      // 1. Actualizar y cerrar automáticamente periodos pasados que hayan finalizado
      (qbState.periodHistory || []).forEach(period => {
        const actualSpent = FinancialCalculations.calculateQuincenalExpenses(transactions, 'COP', period.startDate, period.endDate, period.id);
        const actualIncome = FinancialCalculations.calculateQuincenalIncome(transactions, 'COP', period.startDate, period.endDate, period.id);
        const realAvailable = Math.max(0, actualIncome - actualSpent);

        if (period.endDate < todayStr) {
          period.isClosed = true;
          if (!period.closedAt) period.closedAt = todayStr;
        }
        period.newIncome = actualIncome;
        period.totalSpent = actualSpent;
        period.leftover = realAvailable;
        period.totalAvailable = realAvailable;
        (period.budgets || []).forEach(b => {
          b.spentAmount = FinancialCalculations.calculateQuincenalBudgetItemSpent(b, transactions, 'COP', period.startDate, period.endDate, period.id);
        });
        period.totalAllocated = (period.budgets || []).reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
        period.freeUnallocated = Math.max(0, realAvailable - period.totalAllocated);
      });

      // 2. Verificar si existe el registro para la quincena actual
      let currentPeriod = (qbState.periodHistory || []).find(p => p.id === currentInfo.id);

      // Calcular dinero sobrante acumulado de quincenas anteriores cerradas (Saldo libre separado)
      const prevClosedLeftover = (qbState.periodHistory || [])
        .filter(p => p.id !== currentInfo.id && p.endDate < currentInfo.startDate)
        .reduce((sum, p) => sum + (p.leftover || 0), 0);

      if (!currentPeriod) {
        // Calcular ingreso exclusivo de la quincena actual y gastos
        const currentIncome = FinancialCalculations.calculateQuincenalIncome(transactions, 'COP', currentInfo.startDate, currentInfo.endDate, currentInfo.id);
        const currentSpent = FinancialCalculations.calculateQuincenalExpenses(transactions, 'COP', currentInfo.startDate, currentInfo.endDate, currentInfo.id);
        const realAvailable = Math.max(0, currentIncome - currentSpent);

        // Buscar presupuestos existentes del periodo anterior más reciente o de templates
        const latestPeriod = (qbState.periodHistory || [])[0];
        let templateList = qbState.budgetTemplates;

        if ((!templateList || templateList.length === 0) && latestPeriod && latestPeriod.budgets && latestPeriod.budgets.length > 0) {
          templateList = latestPeriod.budgets.map(b => ({
            id: b.id,
            name: b.name,
            emoji: b.emoji || '💼',
            color: b.color || 'emerald',
            defaultAmount: b.allocatedAmount || 0
          }));
        }

        if (!templateList || templateList.length === 0) {
          templateList = [
            { id: 'tmpl_necesarios', name: 'Gastos Necesarios', emoji: '🏠', color: 'emerald', defaultAmount: 42000 },
            { id: 'tmpl_personales', name: 'Gastos Personales', emoji: '💳', color: 'purple', defaultAmount: 20000 },
            { id: 'tmpl_ahorro', name: 'Ahorro', emoji: '🏦', color: 'blue', defaultAmount: 10000 }
          ];
        }

        const defaultBudgets: QuincenalBudgetItem[] = templateList.map((tmpl, idx) => ({
          id: 'bdg_' + (tmpl.id || `item_${idx}`) + '_' + Date.now().toString(36),
          name: tmpl.name,
          allocatedAmount: Math.max(0, Math.floor(tmpl.defaultAmount ?? 0)),
          spentAmount: 0,
          emoji: tmpl.emoji || '💼',
          color: tmpl.color || 'emerald',
          categoryName: tmpl.name
        }));

        const totalAllocated = defaultBudgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);

        currentPeriod = {
          id: currentInfo.id,
          year: currentInfo.year,
          month: currentInfo.month,
          quincena: currentInfo.quincena,
          startDate: currentInfo.startDate,
          endDate: currentInfo.endDate,
          periodLabel: currentInfo.periodLabel,
          isClosed: false,
          newIncome: currentIncome,
          leftoverFromPrevious: prevClosedLeftover,
          totalAvailable: realAvailable,
          budgets: defaultBudgets,
          totalAllocated,
          freeUnallocated: Math.max(0, realAvailable - totalAllocated),
          totalSpent: currentSpent,
          leftover: realAvailable
        };

        qbState.periodHistory.unshift(currentPeriod);
      } else {
        // Actualizar datos en tiempo real de la quincena en curso SIN BORRAR los presupuestos del usuario
        const actualIncome = FinancialCalculations.calculateQuincenalIncome(transactions, 'COP', currentPeriod.startDate, currentPeriod.endDate, currentPeriod.id);
        const totalSpent = FinancialCalculations.calculateQuincenalExpenses(transactions, 'COP', currentPeriod.startDate, currentPeriod.endDate, currentPeriod.id);
        const realAvailable = Math.max(0, actualIncome - totalSpent);

        currentPeriod.newIncome = actualIncome;
        currentPeriod.totalSpent = totalSpent;
        currentPeriod.totalAvailable = realAvailable;
        currentPeriod.leftoverFromPrevious = prevClosedLeftover;

        // Actualizar gasto individual de cada presupuesto preservando el allocatedAmount intacto
        (currentPeriod.budgets || []).forEach(b => {
          b.spentAmount = FinancialCalculations.calculateQuincenalBudgetItemSpent(b, transactions, 'COP', currentPeriod!.startDate, currentPeriod!.endDate, currentPeriod!.id);
        });

        currentPeriod.totalAllocated = (currentPeriod.budgets || []).reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
        currentPeriod.freeUnallocated = Math.max(0, realAvailable - currentPeriod.totalAllocated);
        currentPeriod.leftover = realAvailable;
      }
    });
  },

  updateQuincenalBudgets(periodId: string, budgets: QuincenalBudgetItem[]) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        period.budgets = budgets.map(b => ({
          ...b,
          allocatedAmount: Math.max(0, Math.floor(b.allocatedAmount || 0))
        }));
        const realAvailable = Math.max(0, (period.newIncome || 0) - (period.totalSpent || 0));
        period.totalAvailable = realAvailable;
        period.totalAllocated = period.budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
        period.freeUnallocated = Math.max(0, realAvailable - period.totalAllocated);

        // Guardar como plantilla para preservar categorías y montos del usuario
        qbState.budgetTemplates = period.budgets.map(b => ({
          id: b.id,
          name: b.name,
          emoji: b.emoji || '💼',
          color: b.color || 'emerald',
          defaultAmount: b.allocatedAmount || 0
        }));
      }
    });
  },

  setQuincenalBudgetAllocation(periodId: string, budgetId: string, newAmount: number) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        const item = period.budgets.find(b => b.id === budgetId);
        if (item) {
          item.allocatedAmount = Math.max(0, Math.floor(newAmount || 0));
          const realAvailable = Math.max(0, (period.newIncome || 0) - (period.totalSpent || 0));
          period.totalAvailable = realAvailable;
          period.totalAllocated = period.budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
          period.freeUnallocated = Math.max(0, realAvailable - period.totalAllocated);

          // Actualizar plantilla correspondiente
          const tmpl = (qbState.budgetTemplates || []).find(t => t.id === budgetId || t.name.toLowerCase() === item.name.toLowerCase());
          if (tmpl) {
            tmpl.defaultAmount = item.allocatedAmount;
          }
        }
      }
    });
  },

  addQuincenalBudgetItem(periodId: string, item: Omit<QuincenalBudgetItem, 'id'>) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        const id = 'bdg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5);
        const newItem: QuincenalBudgetItem = {
          ...item,
          id,
          allocatedAmount: Math.max(0, Math.floor(item.allocatedAmount || 0)),
          spentAmount: 0
        };
        period.budgets.push(newItem);
        const realAvailable = Math.max(0, (period.newIncome || 0) - (period.totalSpent || 0));
        period.totalAvailable = realAvailable;
        period.totalAllocated = period.budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
        period.freeUnallocated = Math.max(0, realAvailable - period.totalAllocated);

        // Añadir a plantillas persistentes
        if (!qbState.budgetTemplates) qbState.budgetTemplates = [];
        qbState.budgetTemplates.push({
          id,
          name: newItem.name,
          emoji: newItem.emoji || '💼',
          color: newItem.color || 'emerald',
          defaultAmount: newItem.allocatedAmount
        });
      }
    });
  },

  deleteQuincenalBudgetItem(periodId: string, budgetId: string) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        period.budgets = period.budgets.filter(b => b.id !== budgetId);
        const realAvailable = Math.max(0, (period.newIncome || 0) - (period.totalSpent || 0));
        period.totalAvailable = realAvailable;
        period.totalAllocated = period.budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
        period.freeUnallocated = Math.max(0, realAvailable - period.totalAllocated);

        if (qbState.budgetTemplates) {
          qbState.budgetTemplates = qbState.budgetTemplates.filter(t => t.id !== budgetId);
        }
      }
    });
  },

  setQuincenalIncome(periodId: string, newIncome: number) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        period.newIncome = Math.max(0, newIncome);
        const realAvailable = Math.max(0, period.newIncome - (period.totalSpent || 0));
        period.totalAvailable = realAvailable;
        period.freeUnallocated = Math.max(0, realAvailable - period.totalAllocated);
        period.leftover = realAvailable;
      }
    });
  },

  setQuincenalLeftover(periodId: string, leftover: number) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        period.leftoverFromPrevious = Math.max(0, leftover);
      }
    });
  },

  transferSaldoLibreToBudget(periodId: string, budgetId: string, amount: number) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        const transferAmount = Math.min(period.leftoverFromPrevious, Math.max(0, amount));
        if (transferAmount <= 0) return;
        const targetBudget = period.budgets.find(b => b.id === budgetId);
        if (targetBudget) {
          period.leftoverFromPrevious -= transferAmount;
          targetBudget.allocatedAmount = (targetBudget.allocatedAmount || 0) + transferAmount;
          period.totalAllocated = period.budgets.reduce((acc, b) => acc + (b.allocatedAmount || 0), 0);
        }
      }
    });
  },

  transferSaldoLibreToPool(periodId: string, amount: number) {
    storeInstance.updateState(draft => {
      const qbState = draft.offices.financiera.quincenalBudgets;
      if (!qbState) return;
      const period = qbState.periodHistory.find(p => p.id === periodId);
      if (period) {
        const transferAmount = Math.min(period.leftoverFromPrevious, Math.max(0, amount));
        if (transferAmount <= 0) return;
        period.leftoverFromPrevious -= transferAmount;
        period.totalAvailable += transferAmount;
        period.freeUnallocated = Math.max(0, period.totalAvailable - period.totalAllocated);
      }
    });
  }
};

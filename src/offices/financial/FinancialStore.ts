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
  FinancialSubcategoryPlan
} from '../../types/store';

export const FinancialStore = {
  getData(): FinancialOfficeData {
    return storeInstance.getState().offices.financiera;
  },

  // ACCOUNTS
  addAccount(account: Omit<FinancialAccount, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.accounts.push({ ...account, id });
    });
  },

  updateAccount(id: string, updates: Partial<FinancialAccount>) {
    storeInstance.updateState(draft => {
      const idx = draft.offices.financiera.accounts.findIndex(a => a.id === id);
      if (idx !== -1) {
        draft.offices.financiera.accounts[idx] = { ...draft.offices.financiera.accounts[idx], ...updates };
      }
    });
  },

  deleteAccount(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.financiera.accounts = draft.offices.financiera.accounts.filter(a => a.id !== id);
    });
  },

  // TRANSACTIONS
  addTransaction(tx: Omit<FinancialTransaction, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.transactions.push({ ...tx, id });
    });
  },

  deleteTransaction(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.financiera.transactions = draft.offices.financiera.transactions.filter(t => t.id !== id);
    });
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
  }
};

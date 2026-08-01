import { storeInstance } from '../../store/CasaBlancaStore';
import { FinancialOfficeData, FinancialAccount, FinancialTransaction, FinancialObligation, InvestmentPosition, CurrencyCode } from '../../types/store';

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
  }
};

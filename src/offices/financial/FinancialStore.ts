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

  deleteObligation(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.financiera.obligations = draft.offices.financiera.obligations.filter(o => o.id !== id);
    });
  },

  // INVESTMENTS
  addInvestment(inv: Omit<InvestmentPosition, 'id'>) {
    storeInstance.updateState(draft => {
      const id = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      draft.offices.financiera.investments.push({ ...inv, id });
    });
  },

  deleteInvestment(id: string) {
    storeInstance.updateState(draft => {
      draft.offices.financiera.investments = draft.offices.financiera.investments.filter(i => i.id !== id);
    });
  }
};

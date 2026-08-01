import { FinancialAccount, FinancialTransaction, FinancialOfficeData, CurrencyCode } from '../../types/store';

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
    const liquidTypes = ['cash', 'checking', 'savings', 'digital_wallet'];
    const result: Record<CurrencyCode, number> = { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };

    data.accounts.forEach(acc => {
      if (liquidTypes.includes(acc.type)) {
        const bal = this.calculateAccountBalance(acc, data.transactions);
        result[acc.currency] = (result[acc.currency] || 0) + bal;
      }
    });

    return result;
  },

  calculateTotalNetWorth(data: FinancialOfficeData): Record<CurrencyCode, number> {
    const result: Record<CurrencyCode, number> = { COP: 0, USD: 0, EUR: 0, BTC: 0, ETH: 0 };

    // Sum all accounts
    data.accounts.forEach(acc => {
      const bal = this.calculateAccountBalance(acc, data.transactions);
      result[acc.currency] = (result[acc.currency] || 0) + bal;
    });

    // Sum investment valuations
    data.investments.forEach(inv => {
      const val = inv.quantity * inv.currentPrice;
      result[inv.currency] = (result[inv.currency] || 0) + val;
    });

    return result;
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
  }
};

/**
 * Formatters for currency, numbers, and percentage values
 */

export function formatCurrency(amount: number, currency: string = 'COP'): string {
  if (amount === undefined || amount === null || isNaN(amount)) amount = 0;
  
  if (currency === 'BTC') {
    return `₿ ${amount.toFixed(6)}`;
  } else if (currency === 'ETH') {
    return `Ξ ${amount.toFixed(4)}`;
  }

  const locale = currency === 'COP' ? 'es-CO' : currency === 'EUR' ? 'de-DE' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'COP' ? 0 : 2
  }).format(amount);
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

export function formatGrade(grade?: number): string {
  if (grade === undefined || grade === null) return 'N/A';
  return grade.toFixed(1);
}

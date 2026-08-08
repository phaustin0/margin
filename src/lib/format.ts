import { CURRENCY_SYMBOLS } from '../constants';

export function fmtCurrency(n: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] || '$';
  const neg = n < 0;
  const v = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (neg ? '-' : '') + sym + v;
}

export function netAmount(amount: number, amountRefunded: number): number {
  return amount - amountRefunded;
}

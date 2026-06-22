export const formatPLN = (n: number): string =>
  new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + '\u00a0PLN';

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

/** Parses a user-typed amount string; returns null if invalid or non-positive. */
export const parseAmount = (value: string): number | null => {
  const n = parseFloat(value.replace(',', '.'));
  if (isNaN(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
};

/** Monthly annuity payment calculator. */
export const calcMonthly = (principal: number, annualRate: number, months: number): number => {
  const r = annualRate / 100 / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
};

/** Conditional class name helper. */
export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ');

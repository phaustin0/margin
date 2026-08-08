export interface Expense {
  id: string;
  amount: number;
  type: 'simple' | 'reimbursable';
  amountRefunded: number;
  categoryId: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export type BudgetCycle =
  | { type: 'monthly'; startDay: number }
  | { type: 'semi-monthly'; days: [number, number] }
  | { type: 'weekly'; startDayOfWeek: number }; // 0 (Sunday) - 6 (Saturday)

export interface Settings {
  currency: 'SGD' | 'PHP';
  monthlyBudget: number;
  theme: 'dark' | 'light';
  budgetCycle: BudgetCycle;
}

export interface CyclePeriod {
  start: Date;
  end: Date;
}

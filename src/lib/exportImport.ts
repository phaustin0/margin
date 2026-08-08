import type { Category, Expense, Settings } from '../types';
import { netAmount } from './format';

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportCSV(expenses: Expense[], categories: Category[]) {
  const catById = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const rows = [['date', 'category', 'note', 'type', 'amount', 'amountRefunded', 'netAmount']];
  expenses.forEach((x) => {
    rows.push([
      x.date,
      catById[x.categoryId] || '',
      x.note,
      x.type,
      x.amount.toFixed(2),
      x.amountRefunded.toFixed(2),
      netAmount(x.amount, x.amountRefunded).toFixed(2),
    ]);
  });
  const csv = rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  download('margin-export.csv', csv, 'text/csv');
}

export interface MarginBackup {
  settings: Settings;
  categories: Category[];
  expenses: Expense[];
}

export function exportJSON(data: MarginBackup) {
  const payload = {
    budget: data.settings.monthlyBudget,
    settings: data.settings,
    categories: data.categories,
    expenses: data.expenses,
  };
  download('margin-backup.json', JSON.stringify(payload, null, 2), 'application/json');
}

export function importJSON(onData: (data: MarginBackup) => void, onError?: (e: unknown) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        if (!raw || typeof raw !== 'object' || !raw.settings || !raw.categories || !raw.expenses) {
          throw new Error('Invalid backup file');
        }
        const settings: Settings = {
          ...raw.settings,
          monthlyBudget:
            typeof raw.budget === 'number' ? raw.budget : raw.settings.monthlyBudget,
        };
        onData({ settings, categories: raw.categories, expenses: raw.expenses });
      } catch (e) {
        onError?.(e);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

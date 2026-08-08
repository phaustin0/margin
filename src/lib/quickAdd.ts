import type { Category } from '../types';

export function parseQuickAdd(text: string): { amount: number | null; note: string } {
  const m = text.match(/(\d+(?:\.\d{1,2})?)/);
  if (!m || m.index === undefined) return { amount: null, note: '' };
  const amount = parseFloat(m[1]);
  const note = (text.slice(0, m.index) + text.slice(m.index + m[0].length))
    .trim()
    .replace(/\s+/g, ' ');
  return { amount, note };
}

const KEYWORDS: Record<string, string[]> = {
  Dining: ['coffee', 'lunch', 'dinner', 'breakfast', 'restaurant', 'food'],
  Transport: ['taxi', 'uber', 'grab', 'mrt', 'bus', 'train', 'fuel', 'gas'],
  Shopping: ['shop', 'store', 'amazon', 'clothes'],
  Groceries: ['groceries', 'grocery', 'supermarket'],
};

export function guessCategory(note: string, categories: Category[]): string | null {
  const lower = note.toLowerCase();
  for (const cat of categories) {
    const list = KEYWORDS[cat.name];
    if (list && list.some((k) => lower.includes(k))) return cat.id;
  }
  return null;
}

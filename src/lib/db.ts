import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Category, Expense, Settings } from '../types';
import { CATEGORY_COLORS, MISC_CATEGORY_ID } from '../constants';

const DB_NAME = 'margin-db';
const DB_VERSION = 2;
const SETTINGS_KEY = 'settings';

interface MarginDB extends DBSchema {
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-date': string };
  };
  categories: {
    key: string;
    value: Category;
  };
  settings: {
    key: string;
    value: Settings;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'SGD',
  monthlyBudget: 0,
  theme: 'dark',
  budgetCycle: { type: 'monthly', startDay: 1 },
};

let dbPromise: Promise<IDBPDatabase<MarginDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MarginDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MarginDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, transaction) {
        if (!db.objectStoreNames.contains('expenses')) {
          const store = db.createObjectStore('expenses', { keyPath: 'id' });
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }

        // v1 -> v2: budgetCycle gained a 'weekly' variant alongside the
        // existing 'monthly' and 'semi-monthly' ones. Previously saved
        // settings already satisfy the new union as-is, so no data needs
        // transforming — this step just guards against a malformed/missing
        // budgetCycle on an existing record so it doesn't crash the app.
        if (oldVersion > 0 && oldVersion < 2) {
          const store = transaction.objectStore('settings');
          const existing = await store.get(SETTINGS_KEY);
          if (existing && !existing.budgetCycle) {
            await store.put({ ...existing, budgetCycle: DEFAULT_SETTINGS.budgetCycle }, SETTINGS_KEY);
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function ensureSeeded(): Promise<void> {
  const db = await getDB();
  const cats = await db.getAll('categories');
  if (cats.length === 0) {
    const misc: Category = {
      id: MISC_CATEGORY_ID,
      name: 'Miscellaneous',
      color: CATEGORY_COLORS[0],
      createdAt: new Date().toISOString(),
    };
    await db.put('categories', misc);
  }
  const settings = await db.get('settings', SETTINGS_KEY);
  if (!settings) {
    await db.put('settings', DEFAULT_SETTINGS, SETTINGS_KEY);
  }
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const s = await db.get('settings', SETTINGS_KEY);
  return s ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, SETTINGS_KEY);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

export async function putCategory(cat: Category): Promise<void> {
  const db = await getDB();
  await db.put('categories', cat);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('categories', id);
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB();
  return db.getAll('expenses');
}

export async function putExpense(exp: Expense): Promise<void> {
  const db = await getDB();
  await db.put('expenses', exp);
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('expenses', id);
}

export async function putManyExpenses(exps: Expense[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('expenses', 'readwrite');
  await Promise.all(exps.map((e) => tx.store.put(e)));
  await tx.done;
}

export async function putManyCategories(cats: Category[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('categories', 'readwrite');
  await Promise.all(cats.map((c) => tx.store.put(c)));
  await tx.done;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('expenses');
  await db.clear('categories');
}

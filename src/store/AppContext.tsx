import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Category, Expense, Settings } from '../types';
import {
  ensureSeeded,
  getAllCategories,
  getAllExpenses,
  getSettings,
  putCategory as dbPutCategory,
  putExpense as dbPutExpense,
  deleteExpense as dbDeleteExpense,
  deleteCategory as dbDeleteCategory,
  saveSettings as dbSaveSettings,
  clearAllData,
  putManyCategories,
  putManyExpenses,
} from '../lib/db';
import { CATEGORY_COLORS, MISC_CATEGORY_ID } from '../constants';

interface AppState {
  loading: boolean;
  onboarded: boolean;
  settings: Settings;
  categories: Category[];
  expenses: Expense[];
  pendingDelete: Expense | null;
}

interface AppContextValue extends AppState {
  finishOnboarding: (settings: Settings, categories: Category[]) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addExpense: (exp: Expense) => Promise<void>;
  updateExpense: (id: string, patch: Partial<Expense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  deleteExpenseWithUndo: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearPendingDelete: () => void;
  nextCategoryColor: (existing: Category[]) => string;
  importBackup: (data: { settings: Settings; categories: Category[]; expenses: Expense[] }) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    loading: true,
    onboarded: false,
    settings: {
      currency: 'SGD',
      monthlyBudget: 0,
      theme: 'dark',
      budgetCycle: { type: 'monthly', startDay: 1 },
    },
    categories: [],
    expenses: [],
    pendingDelete: null,
  });

  useEffect(() => {
    (async () => {
      await ensureSeeded();
      const [settings, categories, expenses] = await Promise.all([
        getSettings(),
        getAllCategories(),
        getAllExpenses(),
      ]);
      const onboarded = categories.length > 1 || expenses.length > 0 || settings.monthlyBudget > 0;
      setState((s) => ({ ...s, loading: false, onboarded, settings, categories, expenses }));
    })();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      document.documentElement.setAttribute('data-theme', state.settings.theme);
    }
  }, [state.loading, state.settings.theme]);

  const nextCategoryColor = (existing: Category[]) =>
    CATEGORY_COLORS[existing.length % CATEGORY_COLORS.length];

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      nextCategoryColor,
      finishOnboarding: async (settings, categories) => {
        await dbSaveSettings(settings);
        for (const c of categories) await dbPutCategory(c);
        setState((s) => ({ ...s, onboarded: true, settings, categories }));
      },
      updateSettings: async (patch) => {
        const next = { ...state.settings, ...patch };
        await dbSaveSettings(next);
        setState((s) => ({ ...s, settings: next }));
      },
      addCategory: async (name) => {
        const cat: Category = {
          id: 'c' + Date.now(),
          name,
          color: nextCategoryColor(state.categories),
          createdAt: new Date().toISOString(),
        };
        await dbPutCategory(cat);
        setState((s) => ({ ...s, categories: [...s.categories, cat] }));
        return cat;
      },
      updateCategory: async (id, patch) => {
        const cat = state.categories.find((c) => c.id === id);
        if (!cat) return;
        const next = { ...cat, ...patch };
        await dbPutCategory(next);
        setState((s) => ({
          ...s,
          categories: s.categories.map((c) => (c.id === id ? next : c)),
        }));
      },
      removeCategory: async (id) => {
        if (id === MISC_CATEGORY_ID) return;
        const reassigned = state.expenses.map((x) =>
          x.categoryId === id ? { ...x, categoryId: MISC_CATEGORY_ID } : x,
        );
        for (const x of reassigned) {
          if (x.categoryId === MISC_CATEGORY_ID) await dbPutExpense(x);
        }
        await dbDeleteCategory(id);
        setState((s) => ({
          ...s,
          categories: s.categories.filter((c) => c.id !== id),
          expenses: reassigned,
        }));
      },
      addExpense: async (exp) => {
        await dbPutExpense(exp);
        setState((s) => ({ ...s, expenses: [exp, ...s.expenses] }));
      },
      updateExpense: async (id, patch) => {
        const exp = state.expenses.find((x) => x.id === id);
        if (!exp) return;
        const next = { ...exp, ...patch };
        await dbPutExpense(next);
        setState((s) => ({
          ...s,
          expenses: s.expenses.map((x) => (x.id === id ? next : x)),
        }));
      },
      removeExpense: async (id) => {
        await dbDeleteExpense(id);
        setState((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== id) }));
      },
      deleteExpenseWithUndo: async (id) => {
        const exp = state.expenses.find((x) => x.id === id);
        if (!exp) return;
        await dbDeleteExpense(id);
        setState((s) => ({
          ...s,
          expenses: s.expenses.filter((x) => x.id !== id),
          pendingDelete: exp,
        }));
      },
      undoDelete: async () => {
        const exp = state.pendingDelete;
        if (!exp) return;
        await dbPutExpense(exp);
        setState((s) => ({ ...s, expenses: [exp, ...s.expenses], pendingDelete: null }));
      },
      clearPendingDelete: () => {
        setState((s) => ({ ...s, pendingDelete: null }));
      },
      importBackup: async (data) => {
        await clearAllData();
        await dbSaveSettings(data.settings);
        await putManyCategories(data.categories);
        await putManyExpenses(data.expenses);
        setState((s) => ({
          ...s,
          onboarded: true,
          settings: data.settings,
          categories: data.categories,
          expenses: data.expenses,
        }));
      },
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

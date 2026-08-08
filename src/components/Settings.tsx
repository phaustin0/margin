import { useState } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { ordinal, WEEKDAY_ABBR, WEEKDAY_NAMES } from '../lib/dates';
import { CURRENCY_SYMBOLS, MISC_CATEGORY_ID } from '../constants';
import { exportCSV, exportJSON, importJSON } from '../lib/exportImport';
import { EditCategoryDialog } from './EditCategoryDialog';
import type { BudgetCycle, Category } from '../types';

function blurOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
}

export function Settings() {
  const {
    settings,
    categories,
    expenses,
    updateSettings,
    addCategory,
    removeCategory,
    importBackup,
  } = useApp();

  const [budgetInput, setBudgetInput] = useState(String(settings.monthlyBudget));
  const [newCatName, setNewCatName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<Category | null>(null);
  const [importMessage, setImportMessage] = useState('');

  const cycle = settings.budgetCycle;
  const cycleStartDay = cycle.type === 'monthly' ? cycle.startDay : 1;
  const [day1, day2] = cycle.type === 'semi-monthly' ? cycle.days : [5, 20];
  const cycleStartDayOfWeek = cycle.type === 'weekly' ? cycle.startDayOfWeek : 0;

  const setCycleMonthly = () => updateSettings({ budgetCycle: { type: 'monthly', startDay: cycleStartDay } });
  const setCycleSemi = () => updateSettings({ budgetCycle: { type: 'semi-monthly', days: [day1, day2] } });
  const setCycleWeekly = () => updateSettings({ budgetCycle: { type: 'weekly', startDayOfWeek: cycleStartDayOfWeek } });
  const setStartDay = (v: number) => updateSettings({ budgetCycle: { type: 'monthly', startDay: v || 1 } });
  const setDay1 = (v: number) =>
    updateSettings({ budgetCycle: { type: 'semi-monthly', days: [v || 1, day2] } as BudgetCycle });
  const setDay2 = (v: number) =>
    updateSettings({ budgetCycle: { type: 'semi-monthly', days: [day1, v || 1] } as BudgetCycle });
  const setStartDayOfWeek = (v: number) => updateSettings({ budgetCycle: { type: 'weekly', startDayOfWeek: v } });

  const onBudgetChange = (v: string) => {
    setBudgetInput(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) updateSettings({ monthlyBudget: n });
  };

  const addCat = async () => {
    const name = newCatName.trim();
    if (!name) return;
    await addCategory(name);
    setNewCatName('');
  };

  const deleteCategoryTap = (cat: Category) => {
    if (cat.id === MISC_CATEGORY_ID) return;
    setConfirmDeleteCategory(cat);
  };

  const confirmDeleteCatCount = confirmDeleteCategory
    ? expenses.filter((x) => x.categoryId === confirmDeleteCategory.id).length
    : 0;

  const handleImport = () => {
    importJSON(
      async (data) => {
        await importBackup(data);
        setImportMessage('Backup restored.');
        setTimeout(() => setImportMessage(''), 3000);
      },
      () => {
        setImportMessage('Could not read that file.');
        setTimeout(() => setImportMessage(''), 3000);
      },
    );
  };

  return (
    <div className="px-6 pt-5 pb-6">
      <div className="text-[22px] font-medium my-1 mb-5">Settings</div>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Appearance</div>
      <div className="flex gap-2">
        <button
          onClick={() => updateSettings({ theme: 'dark' })}
          className="flex-1 p-3 rounded-[10px] text-[14px] border-none cursor-pointer"
          style={
            settings.theme === 'dark'
              ? { background: 'var(--c-surface)', color: 'var(--c-accent)', border: '1px solid var(--c-accent)', fontWeight: 500 }
              : { background: 'var(--c-surface)', color: 'var(--c-sub)' }
          }
        >
          Dark
        </button>
        <button
          onClick={() => updateSettings({ theme: 'light' })}
          className="flex-1 p-3 rounded-[10px] text-[14px] border-none cursor-pointer"
          style={
            settings.theme === 'light'
              ? { background: 'var(--c-surface)', color: 'var(--c-accent)', border: '1px solid var(--c-accent)', fontWeight: 500 }
              : { background: 'var(--c-surface)', color: 'var(--c-sub)' }
          }
        >
          Light
        </button>
      </div>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Currency</div>
      <select
        value={settings.currency}
        onChange={(e) => updateSettings({ currency: e.target.value as 'SGD' | 'PHP' })}
        className="w-full p-3 rounded-[10px] bg-[var(--c-surface)] text-[var(--c-text)] border-none text-[15px] outline-none"
      >
        <option value="SGD">SGD</option>
        <option value="PHP">PHP</option>
      </select>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Budget</div>
      <div className="flex items-baseline gap-1.5 border-b border-[var(--c-surface)] pb-2.5">
        <span className="text-[28px] text-[var(--c-sub)]">{CURRENCY_SYMBOLS[settings.currency]}</span>
        <input
          type="number"
          inputMode="decimal"
          value={budgetInput}
          onChange={(e) => onBudgetChange(e.target.value)}
          onKeyDown={blurOnEnter}
          className="text-[40px] font-medium bg-transparent border-none outline-none w-full p-0 text-[var(--c-text)]"
        />
      </div>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Budget cycle</div>
      <div className="flex flex-col gap-2.5">
        <button
          onClick={setCycleMonthly}
          className="text-left p-4 rounded-xl bg-[var(--c-surface)] cursor-pointer"
          style={{ border: cycle.type === 'monthly' ? '1px solid var(--c-accent)' : '1px solid transparent' }}
        >
          <div className="text-[16px] font-medium">Every month</div>
          <div className="text-[13px] text-[var(--c-sub)] mt-0.5">Starts on the {ordinal(cycleStartDay)}</div>
        </button>
        <button
          onClick={setCycleSemi}
          className="text-left p-4 rounded-xl bg-[var(--c-surface)] cursor-pointer"
          style={{ border: cycle.type === 'semi-monthly' ? '1px solid var(--c-accent)' : '1px solid transparent' }}
        >
          <div className="text-[16px] font-medium">Twice a month</div>
          <div className="text-[13px] text-[var(--c-sub)] mt-0.5">
            {ordinal(Math.min(day1, day2))} and {ordinal(Math.max(day1, day2))}
          </div>
        </button>
        <button
          onClick={setCycleWeekly}
          className="text-left p-4 rounded-xl bg-[var(--c-surface)] cursor-pointer"
          style={{ border: cycle.type === 'weekly' ? '1px solid var(--c-accent)' : '1px solid transparent' }}
        >
          <div className="text-[16px] font-medium">Weekly</div>
          <div className="text-[13px] text-[var(--c-sub)] mt-0.5">Starts {WEEKDAY_NAMES[cycleStartDayOfWeek]}s</div>
        </button>
      </div>
      {cycle.type === 'monthly' && (
        <div className="mt-3.5">
          <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Start day</div>
          <input
            type="number"
            min={1}
            max={31}
            value={cycleStartDay}
            onChange={(e) => setStartDay(Number(e.target.value))}
            className="w-20 p-2.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[16px] outline-none text-[var(--c-text)]"
          />
        </div>
      )}
      {cycle.type === 'semi-monthly' && (
        <div className="mt-3.5 flex gap-4">
          <div>
            <div className="text-[13px] text-[var(--c-sub)] mb-1.5">First day</div>
            <input
              type="number"
              min={1}
              max={31}
              value={day1}
              onChange={(e) => setDay1(Number(e.target.value))}
              className="w-20 p-2.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[16px] outline-none text-[var(--c-text)]"
            />
          </div>
          <div>
            <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Second day</div>
            <input
              type="number"
              min={1}
              max={31}
              value={day2}
              onChange={(e) => setDay2(Number(e.target.value))}
              className="w-20 p-2.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[16px] outline-none text-[var(--c-text)]"
            />
          </div>
        </div>
      )}
      {cycle.type === 'weekly' && (
        <div className="mt-3.5">
          <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Starts on</div>
          <div className="flex gap-1.5">
            {WEEKDAY_ABBR.map((label, idx) => (
              <button
                key={idx}
                onClick={() => setStartDayOfWeek(idx)}
                className="flex-1 py-2.5 rounded-[10px] text-[13px] cursor-pointer"
                style={{
                  background: 'var(--c-surface)',
                  color: cycleStartDayOfWeek === idx ? 'var(--c-accent)' : 'var(--c-text)',
                  border: cycleStartDayOfWeek === idx ? '1px solid var(--c-accent)' : '1px solid transparent',
                  fontWeight: cycleStartDayOfWeek === idx ? 500 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Categories</div>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => {
          const isMisc = cat.id === MISC_CATEGORY_ID;
          return (
            <div key={cat.id} className="flex items-center gap-3 py-1">
              <button
                onClick={() => setEditingCategory(cat)}
                className="flex items-center gap-3 flex-1 bg-transparent border-none cursor-pointer p-0 text-left"
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                <div className="flex-1 text-[16px] text-[var(--c-text)]">{cat.name}</div>
              </button>
              <button
                onClick={() => deleteCategoryTap(cat)}
                disabled={isMisc}
                className="flex items-center justify-center p-1.5 bg-transparent border-none cursor-pointer disabled:cursor-not-allowed"
                style={{ color: isMisc ? 'var(--c-surface)' : 'var(--c-sub)' }}
              >
                <TrashIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 py-3 px-1 border-t border-[var(--c-surface)] mt-1">
        <input
          placeholder="New category"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addCat();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="flex-1 bg-transparent border-none outline-none text-[16px] text-[var(--c-text)]"
        />
        <button
          onClick={addCat}
          disabled={!newCatName}
          className="flex items-center justify-center p-1.5 bg-transparent border-none text-[var(--c-sub)] disabled:cursor-not-allowed cursor-pointer"
        >
          <PlusIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
        </button>
      </div>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Data</div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => exportCSV(expenses, categories)}
          className="flex items-center gap-3 py-3 px-1 bg-transparent border-none border-b border-[var(--c-surface)] text-[var(--c-text)] cursor-pointer w-full text-left"
        >
          <ArrowDownTrayIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
          <span className="text-[15px]">Export CSV</span>
        </button>
        <button
          onClick={() => exportJSON({ settings, categories, expenses })}
          className="flex items-center gap-3 py-3 px-1 bg-transparent border-none border-b border-[var(--c-surface)] text-[var(--c-text)] cursor-pointer w-full text-left"
        >
          <ArrowDownTrayIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
          <span className="text-[15px]">Export JSON</span>
        </button>
        <button
          onClick={handleImport}
          className="flex items-center gap-3 py-3 px-1 bg-transparent border-none border-b border-[var(--c-surface)] text-[var(--c-text)] cursor-pointer w-full text-left"
        >
          <ArrowUpTrayIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
          <span className="text-[15px]">Import / Restore</span>
        </button>
      </div>
      {importMessage && <div className="text-[12px] text-[var(--c-sub)] mt-2">{importMessage}</div>}

      {editingCategory && (
        <EditCategoryDialog category={editingCategory} onClose={() => setEditingCategory(null)} />
      )}

      {confirmDeleteCategory && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60] p-6">
          <div className="w-full max-w-[340px] bg-[var(--c-surface)] rounded-2xl p-[22px]">
            <div className="text-[17px] font-medium mb-2">Delete {confirmDeleteCategory.name}?</div>
            <div className="text-[14px] text-[var(--c-sub)] leading-relaxed mb-5">
              {confirmDeleteCatCount > 0
                ? `${confirmDeleteCatCount} ${confirmDeleteCatCount === 1 ? 'expense is' : 'expenses are'} currently assigned to this category. Those expenses will be moved to Miscellaneous.`
                : 'This category has no expenses assigned to it.'}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDeleteCategory(null)}
                className="flex-1 p-3 rounded-[10px] bg-transparent border border-[var(--c-bg)] text-[15px] cursor-pointer text-[var(--c-text)]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await removeCategory(confirmDeleteCategory.id);
                  setConfirmDeleteCategory(null);
                }}
                className="flex-1 p-3 rounded-[10px] border-none text-[15px] text-white cursor-pointer"
                style={{ background: 'var(--c-warn)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

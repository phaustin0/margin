import { useState } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { getCycleForOffset, fmtISO, fmtShort, dateFmt, parseISO } from '../lib/dates';
import { fmtCurrency, netAmount } from '../lib/format';
import { ExpenseEditSheet } from './ExpenseEditSheet';
import { FilterSheet } from './FilterSheet';
import type { Expense } from '../types';

type Period = 'cycle' | 'all' | 'custom';

export function Expenses() {
  const { settings, categories, expenses } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('cycle');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const cycle = getCycleForOffset(settings.budgetCycle, 0);

  const effStart = period === 'custom' ? dateStart : period === 'cycle' ? fmtISO(cycle.start) : '';
  const effEnd = period === 'custom' ? dateEnd : period === 'cycle' ? fmtISO(cycle.end) : '';

  const sortedAll = expenses
    .slice()
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));

  const filteredExpenses = sortedAll.filter((x) => {
    if (categoryId && x.categoryId !== categoryId) return false;
    if (effStart && x.date < effStart) return false;
    if (effEnd && x.date > effEnd) return false;
    return true;
  });

  const groupsMap: Record<string, Expense[]> = {};
  const groupOrder: string[] = [];
  filteredExpenses.forEach((x) => {
    const dLabel = dateFmt(x.date);
    const label = dLabel === 'Today' || dLabel === 'Yesterday' ? dLabel.toUpperCase() : fmtShort(parseISO(x.date)).toUpperCase();
    if (!groupsMap[label]) {
      groupsMap[label] = [];
      groupOrder.push(label);
    }
    groupsMap[label].push(x);
  });
  const groupedExpenses = groupOrder.map((label) => ({ label, items: groupsMap[label] }));

  const filterCount = (period !== 'cycle' ? 1 : 0) + (categoryId ? 1 : 0);

  const clearFilters = () => {
    setPeriod('cycle');
    setDateStart('');
    setDateEnd('');
    setCategoryId(null);
  };

  return (
    <div className="px-6 pt-5 relative">
      <div className="text-[22px] font-medium my-1 mb-5">Expenses</div>

      {groupedExpenses.length === 0 && (
        <div className="text-[14px] text-[var(--c-sub)] py-4 px-1">No expenses match.</div>
      )}
      {groupedExpenses.map((grp) => (
        <div key={grp.label}>
          <div className="text-[12px] text-[var(--c-sub)] tracking-wide my-4 mb-1.5">{grp.label}</div>
          <div className="flex flex-col mb-2">
            {grp.items.map((exp) => {
              const cat = catById[exp.categoryId] ?? { name: 'Miscellaneous', color: '#A69481' };
              return (
                <button
                  key={exp.id}
                  onClick={() => setEditingId(exp.id)}
                  className="flex items-center gap-3 py-3.5 px-1 bg-transparent border-none border-b border-[var(--c-surface)] cursor-pointer w-full text-left"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[15px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {exp.note}
                    </div>
                    <div className="text-[13px] text-[var(--c-sub)] mt-0.5">
                      {cat.name} · {dateFmt(exp.date)}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-[15px] font-medium">
                      {fmtCurrency(netAmount(exp.amount, exp.amountRefunded), settings.currency)}
                    </div>
                    {exp.type === 'reimbursable' && (
                      <div className="text-[12px] text-[var(--c-sub)] mt-0.5">
                        {fmtCurrency(exp.amount, settings.currency)} − {fmtCurrency(exp.amountRefunded, settings.currency)} back
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="h-3" />

      <button
        onClick={() => setFilterSheetOpen(true)}
        className="fixed bottom-20 z-40 w-[52px] h-[52px] rounded-full border-none flex items-center justify-center cursor-pointer"
        style={{
          background: 'var(--c-accent)',
          color: 'var(--c-on-accent)',
          right: 'max(20px, calc((100vw - 480px) / 2 + 20px))',
        }}
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5" strokeWidth={1.8} />
        {filterCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold flex items-center justify-center"
            style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)', border: '1px solid var(--c-bg)' }}
          >
            {filterCount}
          </span>
        )}
      </button>

      {filterSheetOpen && (
        <FilterSheet
          categories={categories}
          period={period}
          dateStart={dateStart}
          dateEnd={dateEnd}
          categoryId={categoryId}
          onChangePeriod={setPeriod}
          onChangeDateStart={setDateStart}
          onChangeDateEnd={setDateEnd}
          onChangeCategory={setCategoryId}
          onClear={clearFilters}
          onClose={() => setFilterSheetOpen(false)}
        />
      )}

      {editingId && <ExpenseEditSheet id={editingId} onClose={() => setEditingId(null)} />}
    </div>
  );
}

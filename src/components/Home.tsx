import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { getCycleForOffset, fmtShort, dateFmt } from '../lib/dates';
import { fmtCurrency, netAmount } from '../lib/format';
import { ExpenseEditSheet } from './ExpenseEditSheet';

export function Home() {
  const { settings, categories, expenses } = useApp();
  const [cycleOffset, setCycleOffset] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const cycle = getCycleForOffset(settings.budgetCycle, cycleOffset);
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const inCycle = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= cycle.start && d <= cycle.end;
  };
  const cycleExpenses = expenses.filter((x) => inCycle(x.date));
  const spent = cycleExpenses.reduce((a, x) => a + netAmount(x.amount, x.amountRefunded), 0);
  const budget = settings.monthlyBudget;
  const remaining = budget - spent;
  const pctUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const over = pctUsed > 100;
  const nearLimit = pctUsed >= 90;
  const ringColor = nearLimit ? 'var(--c-warn)' : 'var(--c-accent)';
  const circumference = 2 * Math.PI * 58;
  const dash = (Math.max(0, Math.min(100, pctUsed)) / 100) * circumference;

  const sortedAll = expenses
    .slice()
    .sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  const recentExpenses = sortedAll.slice(0, 3);

  return (
    <div className="px-6 pt-5">
      <div className="flex items-center justify-center gap-3 my-1 mb-5">
        <button
          onClick={() => setCycleOffset((o) => o - 1)}
          className="flex items-center justify-center p-1.5 bg-transparent border-none text-[var(--c-sub)] cursor-pointer"
        >
          <ChevronLeftIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
        </button>
        <div className="text-[14px] text-[var(--c-sub)]">
          {fmtShort(cycle.start)} – {fmtShort(cycle.end)}
        </div>
        <button
          onClick={() => setCycleOffset((o) => Math.min(0, o + 1))}
          disabled={cycleOffset >= 0}
          className="flex items-center justify-center p-1.5 bg-transparent border-none disabled:cursor-not-allowed"
          style={{ color: cycleOffset >= 0 ? 'var(--c-surface)' : 'var(--c-sub)' }}
        >
          <ChevronRightIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex items-center justify-center py-5 px-1 mb-7">
        <div className="flex items-center gap-6">
          <div className="relative w-[132px] h-[132px] shrink-0">
            <svg width={132} height={132} viewBox="0 0 132 132" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={66} cy={66} r={58} fill="none" stroke="var(--c-surface)" strokeWidth={10} />
              <circle
                cx={66}
                cy={66}
                r={58}
                fill="none"
                stroke={ringColor}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${dash.toFixed(1)} ${circumference.toFixed(1)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[28px] font-medium">{Math.round(pctUsed)}%</div>
              <div className="text-[12px] text-[var(--c-sub)] mt-0.5">used</div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div>
              <div className="text-[12px] text-[var(--c-sub)]">Spent</div>
              <div className="text-[17px] font-medium mt-px">{fmtCurrency(spent, settings.currency)}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--c-sub)]">Budget</div>
              <div className="text-[17px] font-medium mt-px">{fmtCurrency(budget, settings.currency)}</div>
            </div>
            <div>
              <div className="text-[12px] text-[var(--c-sub)]">Remaining</div>
              <div className="text-[17px] font-medium mt-px" style={{ color: over ? 'var(--c-warn)' : 'var(--c-text)' }}>
                {fmtCurrency(remaining, settings.currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Recent</div>
      {recentExpenses.length === 0 && (
        <div className="text-[14px] text-[var(--c-sub)] py-4 px-1">No expenses yet. Add your first below.</div>
      )}
      <div className="flex flex-col">
        {recentExpenses.map((exp) => {
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
      <div className="h-3" />
      {editingId && <ExpenseEditSheet id={editingId} onClose={() => setEditingId(null)} />}
    </div>
  );
}

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { getCycleForOffset, fmtShort, fmtISO } from '../lib/dates';
import { fmtCurrency, netAmount } from '../lib/format';

export function Charts() {
  const { settings, categories, expenses } = useApp();
  const [cycleOffset, setCycleOffset] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  const cycle = getCycleForOffset(settings.budgetCycle, cycleOffset);
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const inCycle = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= cycle.start && d <= cycle.end;
  };
  const cycleExpenses = expenses.filter((x) => inCycle(x.date));

  const dayCount = Math.round((cycle.end.getTime() - cycle.start.getTime()) / 86400000) + 1;
  const dailyTotals: Record<string, number> = {};
  cycleExpenses.forEach((x) => {
    dailyTotals[x.date] = (dailyTotals[x.date] || 0) + netAmount(x.amount, x.amountRefunded);
  });
  let maxDay = 0;
  Object.values(dailyTotals).forEach((v) => {
    if (v > maxDay) maxDay = v;
  });
  const dailyBars: { label: string; value: number; pct: number }[] = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(cycle.start);
    d.setDate(d.getDate() + i);
    const iso = fmtISO(d);
    const v = dailyTotals[iso] || 0;
    const pct = maxDay > 0 ? (v / maxDay) * 100 : 0;
    dailyBars.push({ label: String(d.getDate()), value: v, pct });
  }

  const catTotals: Record<string, number> = {};
  cycleExpenses.forEach((x) => {
    catTotals[x.categoryId] = (catTotals[x.categoryId] || 0) + netAmount(x.amount, x.amountRefunded);
  });
  const totalSpent = Object.values(catTotals).reduce((a, b) => a + b, 0);
  const categoryBreakdown = Object.keys(catTotals)
    .map((id) => {
      const cat = catById[id] ?? { name: 'Miscellaneous', color: '#A69481' };
      const amt = catTotals[id];
      return {
        id,
        name: cat.name,
        color: cat.color,
        amt,
        pct: totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0,
      };
    })
    .sort((a, b) => b.amt - a.amt);

  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    setTouchX(null);
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setCycleOffset((o) => Math.min(0, o + 1));
    else setCycleOffset((o) => o - 1);
  };

  return (
    <div className="px-6 pt-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="text-[22px] font-medium my-1 mb-5">Charts</div>

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

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">Daily net spending</div>
      <div className="flex gap-1 items-end h-[120px] mb-2 overflow-x-auto pb-1">
        {dailyBars.map((bar) => (
          <div key={bar.label} className="flex flex-col items-center gap-1.5 flex-[1_0_auto] min-w-[14px]">
            <div className="w-2.5 h-[88px] flex items-end">
              <div
                className="w-full rounded-sm"
                style={{
                  height: `${Math.max(2, bar.pct)}%`,
                  background: bar.value > 0 ? 'var(--c-accent)' : 'var(--c-surface)',
                }}
              />
            </div>
            <div className="text-[10px] text-[var(--c-sub)]">{bar.label}</div>
          </div>
        ))}
      </div>

      <div className="text-[13px] text-[var(--c-sub)] tracking-wide uppercase my-5 mb-2">By category</div>
      <div className="flex flex-col">
        {categoryBreakdown.map((cb) => (
          <div key={cb.id} className="flex items-center gap-2.5 py-2.5 px-1 border-b border-[var(--c-surface)]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cb.color }} />
            <div className="flex-1 text-[15px] text-[var(--c-text)]">{cb.name}</div>
            <div className="text-[14px] font-medium text-[var(--c-text)]">
              {fmtCurrency(cb.amt, settings.currency)}
            </div>
            <div className="text-[13px] text-[var(--c-sub)] w-9 text-right">{cb.pct}%</div>
          </div>
        ))}
        {categoryBreakdown.length === 0 && (
          <div className="text-[14px] text-[var(--c-sub)] py-4 px-1">Nothing spent this cycle.</div>
        )}
      </div>
      <div className="h-3" />
    </div>
  );
}

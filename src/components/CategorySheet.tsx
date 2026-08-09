import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { fmtCurrency } from '../lib/format';
import { fmtISO } from '../lib/dates';
import { CategorySelect } from './CategorySelect';
import type { Expense } from '../types';

interface Props {
  amount: number;
  note: string;
  initialCategoryId: string | null;
  onDone: () => void;
}

export function CategorySheet({ amount, note, initialCategoryId, onDone }: Props) {
  const { categories, settings, addExpense } = useApp();
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [date, setDate] = useState(fmtISO(new Date()));
  const [reimbursable, setReimbursable] = useState(false);

  const missing = !categoryId;

  const submit = () => {
    if (!categoryId) return;
    const exp: Expense = {
      id: 'e' + Date.now(),
      amount,
      type: reimbursable ? 'reimbursable' : 'simple',
      amountRefunded: 0,
      categoryId,
      date,
      note,
      createdAt: new Date().toISOString(),
    };
    addExpense(exp);
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end justify-center z-50">
      <div className="w-full max-w-[480px] bg-[var(--c-bg)] rounded-t-[20px] px-6 pt-3 pb-8 box-border flex flex-col max-h-[88dvh] overflow-y-auto overflow-x-hidden">
        <div className="w-9 h-1 rounded-full bg-[var(--c-surface)] mx-auto mb-5" />
        <div className="text-[34px] font-medium text-[var(--c-text)] break-words">{fmtCurrency(amount, settings.currency)}</div>
        <div className="text-[15px] text-[var(--c-sub)] mt-0.5 mb-5 break-words">{note}</div>

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Category</div>
        <CategorySelect
          categories={categories}
          value={categoryId ?? ''}
          onChange={(id) => setCategoryId(id || null)}
        />
        {missing && <div className="text-[12px] text-[var(--c-sub)] mt-2">Choose a category to continue</div>}

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 px-3.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[15px] outline-none box-border text-[var(--c-text)]"
          style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
        />

        <div className="flex items-center justify-between mt-1.5">
          <div className="text-[13px] text-[var(--c-sub)] my-3.5">Reimbursable</div>
          <button
            onClick={() => setReimbursable((r) => !r)}
            className="w-11 h-[26px] rounded-full border-none p-[3px] flex cursor-pointer"
            style={{
              background: reimbursable ? 'var(--c-accent)' : 'var(--c-surface)',
              justifyContent: reimbursable ? 'flex-end' : 'flex-start',
            }}
          >
            <div className="w-5 h-5 rounded-full" style={{ background: reimbursable ? '#fff' : 'var(--c-sub)' }} />
          </button>
        </div>

        <div className="h-2" />
        <button
          onClick={submit}
          disabled={missing}
          className="w-full p-4 rounded-xl text-[16px] font-medium border-none disabled:cursor-not-allowed"
          style={{
            background: missing ? 'var(--c-surface)' : 'var(--c-accent)',
            color: missing ? 'var(--c-sub)' : 'var(--c-on-accent)',
          }}
        >
          Save expense
        </button>
        <button
          onClick={onDone}
          className="bg-transparent border-none text-[var(--c-sub)] text-[14px] pt-3.5 cursor-pointer text-center"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { parseQuickAdd, guessCategory } from '../lib/quickAdd';
import { CategorySheet } from './CategorySheet';

export function QuickAddBar() {
  const { categories } = useApp();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState<{ amount: number; note: string; categoryId: string | null } | null>(null);

  const submit = () => {
    const { amount, note } = parseQuickAdd(text);
    if (amount === null || isNaN(amount) || amount <= 0) {
      setError('Enter an amount to continue');
      return;
    }
    if (!note) {
      setError('Add a note to continue');
      return;
    }
    const categoryId = guessCategory(note, categories);
    setSheet({ amount, note, categoryId });
    setText('');
    setError('');
  };

  return (
    <>
      <div className="px-4 pt-2 pb-3.5 bg-[var(--c-bg)]">
        {error && <div className="text-[12px] text-[var(--c-warn)] px-1 pb-1.5">{error}</div>}
        <div className="flex items-center gap-2 bg-[var(--c-surface)] rounded-[14px] py-1.5 pl-4 pr-1.5">
          <input
            placeholder="Add new expense..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submit();
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-[15px] py-2.5 text-[var(--c-text)]"
          />
          <button
            onClick={submit}
            className="w-9 h-9 rounded-full border-none flex items-center justify-center shrink-0 cursor-pointer"
            style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)' }}
          >
            <ArrowUpIcon className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
      {sheet && (
        <CategorySheet
          amount={sheet.amount}
          note={sheet.note}
          initialCategoryId={sheet.categoryId}
          onDone={() => setSheet(null)}
        />
      )}
    </>
  );
}

import type { Category } from '../types';

interface Props {
  categories: Category[];
  period: 'cycle' | 'all' | 'custom';
  dateStart: string;
  dateEnd: string;
  categoryId: string | null;
  onChangePeriod: (period: 'cycle' | 'all' | 'custom') => void;
  onChangeDateStart: (v: string) => void;
  onChangeDateEnd: (v: string) => void;
  onChangeCategory: (id: string | null) => void;
  onClear: () => void;
  onClose: () => void;
}

export function FilterSheet({
  categories,
  period,
  dateStart,
  dateEnd,
  categoryId,
  onChangePeriod,
  onChangeDateStart,
  onChangeDateEnd,
  onChangeCategory,
  onClear,
  onClose,
}: Props) {
  const periodBtnStyle = (val: string) => ({
    flex: 1,
    textAlign: 'center' as const,
    padding: '11px 8px',
    borderRadius: '10px',
    background: period === val ? 'var(--c-surface)' : 'transparent',
    border: period === val ? '1px solid var(--c-accent)' : '1px solid var(--c-surface)',
    color: period === val ? 'var(--c-accent)' : 'var(--c-text)',
    fontSize: '14px',
    fontWeight: period === val ? 500 : 400,
    cursor: 'pointer',
  });

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="w-full max-w-[480px] bg-[var(--c-bg)] rounded-t-[20px] px-6 pt-3 pb-7 box-border flex flex-col max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-full bg-[var(--c-surface)] mx-auto mb-5" />

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Time period</div>
        <div className="flex gap-2">
          <button style={periodBtnStyle('cycle')} onClick={() => onChangePeriod('cycle')}>
            This cycle
          </button>
          <button style={periodBtnStyle('all')} onClick={() => onChangePeriod('all')}>
            All time
          </button>
          <button style={periodBtnStyle('custom')} onClick={() => onChangePeriod('custom')}>
            Custom range
          </button>
        </div>
        {period === 'custom' && (
          <div className="flex items-center gap-2.5 mt-3">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => onChangeDateStart(e.target.value)}
              className="flex-1 p-2.5 px-3 rounded-[10px] bg-[var(--c-surface)] border-none text-[14px] outline-none text-[var(--c-text)]"
            />
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => onChangeDateEnd(e.target.value)}
              className="flex-1 p-2.5 px-3 rounded-[10px] bg-[var(--c-surface)] border-none text-[14px] outline-none text-[var(--c-text)]"
            />
          </div>
        )}

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Category</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChangeCategory(null)}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-full text-[13px] cursor-pointer shrink-0"
            style={{
              background: 'var(--c-surface)',
              border: !categoryId ? '1px solid var(--c-accent)' : '1px solid transparent',
              color: 'var(--c-text)',
            }}
          >
            <span>All</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChangeCategory(cat.id)}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-full text-[13px] cursor-pointer shrink-0"
              style={{
                background: 'var(--c-surface)',
                border: categoryId === cat.id ? '1px solid var(--c-accent)' : '1px solid transparent',
                color: 'var(--c-text)',
              }}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: cat.color }} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-[22px]">
          <button onClick={onClear} className="bg-transparent border-none text-[var(--c-sub)] text-[14px] cursor-pointer p-0">
            Clear filters
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-[10px] border-none text-[15px] font-medium cursor-pointer"
            style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

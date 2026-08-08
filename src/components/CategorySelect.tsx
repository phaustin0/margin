import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'Choose a category',
  includeAllOption = false,
}: Props) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 pr-10 rounded-[10px] bg-[var(--c-surface)] text-[var(--c-text)] border-none text-[15px] outline-none box-border appearance-none"
      >
        {includeAllOption ? (
          <option value="">All categories</option>
        ) : (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        className="w-4 h-4 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--c-sub)' }}
        strokeWidth={1.8}
      />
    </div>
  );
}

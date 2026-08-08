import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { CATEGORY_COLORS } from '../constants';
import type { Category } from '../types';

interface Props {
  category: Category;
  onClose: () => void;
}

export function EditCategoryDialog({ category, onClose }: Props) {
  const { updateCategory } = useApp();
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await updateCategory(category.id, { name: trimmed, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60] p-6" onClick={onClose}>
      <div className="w-full max-w-[340px] bg-[var(--c-surface)] rounded-2xl p-[22px]" onClick={(e) => e.stopPropagation()}>
        <div className="text-[17px] font-medium mb-2">Edit category</div>
        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="w-full p-3 px-3.5 rounded-[10px] bg-[var(--c-bg)] border-none text-[15px] outline-none box-border text-[var(--c-text)]"
        />
        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Color</div>
        <div className="flex gap-3 my-2 mb-6">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center p-0 cursor-pointer bg-transparent"
              style={{ border: c === color ? '2px solid var(--c-text)' : '2px solid transparent' }}
            >
              <div className="w-[26px] h-[26px] rounded-full" style={{ background: c }} />
            </button>
          ))}
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 p-3 rounded-[10px] bg-transparent border border-[var(--c-bg)] text-[15px] cursor-pointer text-[var(--c-text)]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 p-3 rounded-[10px] border-none text-[15px] cursor-pointer font-medium"
            style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

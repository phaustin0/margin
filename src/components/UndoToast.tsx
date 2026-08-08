import { useEffect } from 'react';
import { useApp } from '../store/AppContext';

export function UndoToast() {
  const { pendingDelete, undoDelete, clearPendingDelete } = useApp();

  useEffect(() => {
    if (!pendingDelete) return;
    const timer = setTimeout(() => clearPendingDelete(), 5000);
    return () => clearTimeout(timer);
  }, [pendingDelete, clearPendingDelete]);

  if (!pendingDelete) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[var(--c-surface)] text-[var(--c-text)] rounded-xl py-3 px-4 flex items-center gap-4 z-[70]">
      <span className="text-[14px]">Expense deleted</span>
      <button
        onClick={undoDelete}
        className="bg-transparent border-none text-[14px] font-medium cursor-pointer"
        style={{ color: 'var(--c-accent)' }}
      >
        Undo
      </button>
    </div>
  );
}

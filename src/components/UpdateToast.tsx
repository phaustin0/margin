import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[var(--c-surface)] text-[var(--c-text)] rounded-xl py-3 px-4 flex items-center gap-4 z-[90] w-max max-w-[calc(100%-32px)]">
      <span className="text-[14px] whitespace-nowrap">Update available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-transparent border-none text-[14px] font-medium cursor-pointer shrink-0"
        style={{ color: 'var(--c-accent)' }}
      >
        Reload
      </button>
    </div>
  );
}

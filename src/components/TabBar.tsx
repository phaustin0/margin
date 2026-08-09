import { HomeIcon, ListBulletIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export type Tab = 'home' | 'expenses' | 'charts' | 'settings';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'expenses', label: 'Expenses', Icon: ListBulletIcon },
  { id: 'charts', label: 'Charts', Icon: ChartBarIcon },
  { id: 'settings', label: 'Settings', Icon: Cog6ToothIcon },
];

export function TabBar({ active, onChange }: Props) {
  return (
    <div
      className="flex bg-[var(--c-bg)] border-t border-[var(--c-surface)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-[3px] pt-2.5 pb-1.5 bg-transparent border-none cursor-pointer"
          >
            <Icon
              className="w-[22px] h-[22px]"
              strokeWidth={1.6}
              style={{ color: selected ? 'var(--c-accent)' : 'var(--c-sub)' }}
            />
            <span
              className="text-[11px]"
              style={{ color: selected ? 'var(--c-accent)' : 'var(--c-sub)', fontWeight: selected ? 500 : 400 }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

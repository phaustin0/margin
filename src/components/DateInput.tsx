import { CalendarIcon } from '@heroicons/react/24/outline';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A styled wrapper around a native <input type="date">. iOS Safari renders
 * the native date control's calendar-icon affordance at an intrinsic width
 * that can exceed 100% of its container regardless of CSS width, which both
 * pushes the field past the screen edge and (if a parent clips overflow to
 * compensate) chops off the input's own right-side border radius. Hiding the
 * native chrome with appearance:none and drawing our own non-interactive
 * calendar icon on top sidesteps both problems — the input's width is fully
 * CSS-controlled, and tapping anywhere in the field still opens the native
 * date picker.
 */
export function DateInput({ value, onChange, placeholder, className }: Props) {
  return (
    <div className="relative w-full min-w-0">
      <input
        type="date"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={
          'w-full min-w-0 p-3 pr-10 rounded-[10px] bg-[var(--c-surface)] border-none text-[15px] outline-none box-border appearance-none text-[var(--c-text)]' +
          (className ? ' ' + className : '')
        }
        style={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          WebkitAppearance: 'none',
        }}
      />
      <CalendarIcon
        className="w-[18px] h-[18px] pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--c-sub)' }}
        strokeWidth={1.8}
      />
    </div>
  );
}

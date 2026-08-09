import { useEffect, useState } from 'react';

/**
 * How far the on-screen keyboard is currently covering the layout viewport,
 * in pixels. Tracks window.visualViewport directly (resize + scroll, since
 * iOS fires scroll on the visualViewport while the keyboard animates/pans)
 * rather than trusting CSS viewport units, so a position:fixed bottom bar
 * can be translated up above the keyboard while it's open and snap back to
 * 0 the instant it closes, with no residual gap and no scroll needed.
 */
export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(Math.max(0, Math.round(covered)));
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}

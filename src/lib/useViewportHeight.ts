import { useEffect, useState } from 'react';

/**
 * iOS Safari doesn't reliably re-collapse 100dvh after the on-screen keyboard
 * dismisses, leaving stale bottom padding until the next scroll/reflow.
 * Tracking window.visualViewport.height directly and applying it as an
 * explicit pixel height keeps the app shell snapped to the real visible
 * viewport as soon as the keyboard opens or closes.
 */
export function useViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setHeight(vv.height);
    update();
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, []);

  return height;
}

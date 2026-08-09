import { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Onboarding } from './components/Onboarding';
import { Home } from './components/Home';
import { TabBar, type Tab } from './components/TabBar';
import { UndoToast } from './components/UndoToast';
import { QuickAddBar } from './components/QuickAddBar';
import { Settings } from './components/Settings';
import { Charts } from './components/Charts';
import { Expenses } from './components/Expenses';
import { UpdateToast } from './components/UpdateToast';
import { useViewportHeight } from './lib/useViewportHeight';
import { useKeyboardOffset } from './lib/useKeyboardOffset';

function Shell() {
  const { loading, onboarded } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  const viewportHeight = useViewportHeight();
  const keyboardOffset = useKeyboardOffset();
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  useEffect(() => {
    const el = bottomBarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBottomBarHeight(el.offsetHeight));
    ro.observe(el);
    setBottomBarHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [tab]);

  if (loading) return null;
  if (!onboarded) return <Onboarding />;

  return (
    <div
      className="max-w-[480px] mx-auto bg-[var(--c-bg)] text-[var(--c-text)] relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: viewportHeight != null ? `${viewportHeight}px` : '100dvh',
      }}
    >
      <div className="h-full min-h-0 flex flex-col" style={{ paddingBottom: bottomBarHeight }}>
        {tab === 'home' && <Home />}
        {tab === 'expenses' && <Expenses />}
        {tab === 'charts' && <Charts />}
        {tab === 'settings' && <Settings />}
      </div>
      <div
        ref={bottomBarRef}
        className="fixed max-w-[480px] flex flex-col z-30"
        style={{
          left: 0,
          right: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          bottom: 0,
          transform: `translateY(-${keyboardOffset}px)`,
        }}
      >
        {tab === 'home' && <QuickAddBar />}
        <TabBar active={tab} onChange={setTab} />
      </div>
      <UndoToast />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Shell />
      <UpdateToast />
    </AppProvider>
  );
}

export default App;

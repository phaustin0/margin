import { useState } from 'react';
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

function Shell() {
  const { loading, onboarded } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  const viewportHeight = useViewportHeight();

  if (loading) return null;
  if (!onboarded) return <Onboarding />;

  return (
    <div
      className="max-w-[480px] mx-auto h-dvh bg-[var(--c-bg)] text-[var(--c-text)] flex flex-col relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: viewportHeight != null ? `${viewportHeight}px` : undefined,
      }}
    >
      <div className="flex-1 min-h-0 flex flex-col">
        {tab === 'home' && <Home />}
        {tab === 'expenses' && <Expenses />}
        {tab === 'charts' && <Charts />}
        {tab === 'settings' && <Settings />}
      </div>
      {tab === 'home' && <QuickAddBar />}
      <TabBar active={tab} onChange={setTab} />
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

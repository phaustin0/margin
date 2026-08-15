import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// A successful mount means the boot-recovery check in index.html can stand
// down for the rest of this session — clear its guard so a later, unrelated
// hiccup is still eligible for one more automatic recovery attempt.
try {
  sessionStorage.removeItem('margin:sw-recovery-attempted')
} catch {
  // ignore
}

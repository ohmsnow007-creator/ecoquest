import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { initPwaListeners, swCallbacks } from './services/pwaService'

initPwaListeners()

// Service workers need HTTPS (or localhost); over a plain-HTTP LAN address the app still runs, just without offline cache.
if (!('serviceWorker' in navigator)) {
  swCallbacks.setStatus('unsupported')
} else if (!window.isSecureContext) {
  swCallbacks.setStatus('insecure')
} else if (import.meta.env.DEV) {
  swCallbacks.setStatus('dev-disabled')
} else {
  const updateSW = registerSW({
    onRegisteredSW: (_url, reg) => swCallbacks.setStatus(reg ? 'active' : 'error'),
    onOfflineReady: () => swCallbacks.offlineReady(),
    onNeedRefresh: () => swCallbacks.needRefresh(() => updateSW(true)),
    onRegisterError: () => swCallbacks.setStatus('error'),
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

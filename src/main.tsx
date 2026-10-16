import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { initPwaListeners, swCallbacks } from './services/pwaService'
import { reloadForNewVersion } from './utils/lazyRetry'

initPwaListeners()

// A file of the running version disappeared after a new deploy: reload once onto the new version.
window.addEventListener('vite:preloadError', (e) => {
  if (reloadForNewVersion()) e.preventDefault()
})

// Service workers need HTTPS (or localhost); over a plain-HTTP LAN address the app still runs, just without offline cache.
if (!('serviceWorker' in navigator)) {
  swCallbacks.setStatus('unsupported')
} else if (!window.isSecureContext) {
  swCallbacks.setStatus('insecure')
} else if (import.meta.env.DEV) {
  swCallbacks.setStatus('dev-disabled')
} else {
  registerSW({
    immediate: true,
    onRegisteredSW: (_url, reg) => {
      swCallbacks.setStatus(reg ? 'active' : 'error')
      // Check for a new build when the app comes back to the foreground (phones keep tabs alive for days).
      if (reg) document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && reg.update())
    },
    onOfflineReady: () => swCallbacks.offlineReady(),
    onRegisterError: () => swCallbacks.setStatus('error'),
    // A new version is active. Never reload in front of the player: reload the next time the page is hidden
    // (switching apps or tabs), and offer an "update now" button meanwhile.
    onNeedReload: () => {
      const reloadWhenHidden = () => {
        if (document.visibilityState === 'hidden') window.location.reload()
      }
      document.addEventListener('visibilitychange', reloadWhenHidden)
      swCallbacks.needRefresh(async () => window.location.reload())
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

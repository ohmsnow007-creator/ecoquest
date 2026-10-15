import { useSyncExternalStore } from 'react';

/**
 * Install prompt, service worker and connection status in one small store.
 * Every flag reflects a real browser signal; nothing here is assumed or faked.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type ServiceWorkerStatus = 'unsupported' | 'insecure' | 'dev-disabled' | 'registering' | 'active' | 'error';
export type InstallState = 'installed' | 'can-prompt' | 'installing' | 'manual';

export interface PwaState {
  online: boolean;
  swStatus: ServiceWorkerStatus;
  /** True once the service worker has precached the app shell (or already controls the page). */
  offlineReady: boolean;
  /** A newer version is waiting; applying it reloads the page. */
  updateAvailable: boolean;
  install: InstallState;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let applyUpdateFn: (() => Promise<void>) | null = null;
const listeners = new Set<() => void>();

function isStandalone(): boolean {
  try {
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.matchMedia?.('(display-mode: window-controls-overlay)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

let state: PwaState = {
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  swStatus: typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? 'registering' : 'unsupported',
  offlineReady: false,
  updateAvailable: false,
  install: typeof window !== 'undefined' && isStandalone() ? 'installed' : 'manual',
};

function set(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const pwaStore = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Test hook. */
  reset(next: Partial<PwaState> = {}) {
    deferredPrompt = null;
    applyUpdateFn = null;
    state = { online: true, swStatus: 'registering', offlineReady: false, updateAvailable: false, install: 'manual', ...next };
    listeners.forEach((l) => l());
  },
};

export function usePwa(): PwaState {
  return useSyncExternalStore(pwaStore.subscribe, pwaStore.get, pwaStore.get);
}

let listening = false;

/** Call once, as early as possible: `beforeinstallprompt` can fire before React mounts. */
export function initPwaListeners(): void {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    if (state.install !== 'installed') set({ install: 'can-prompt' });
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    set({ install: 'installed' });
  });
  window.addEventListener('online', () => set({ online: true }));
  window.addEventListener('offline', () => set({ online: false }));
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    set({ offlineReady: true });
  }
}

/** Wiring for the service worker registration done in main.tsx. */
export const swCallbacks = {
  setStatus: (swStatus: ServiceWorkerStatus) => set({ swStatus }),
  offlineReady: () => set({ offlineReady: true, swStatus: 'active' }),
  needRefresh: (apply: () => Promise<void>) => {
    applyUpdateFn = apply;
    set({ updateAvailable: true });
  },
};

export async function applyUpdate(): Promise<void> {
  await applyUpdateFn?.();
}

/**
 * Shows the browser's own install dialog. Only possible after the browser fired
 * `beforeinstallprompt`; "accepted" means the user agreed, not that installation finished —
 * that is confirmed only by the `appinstalled` event.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const ev = deferredPrompt;
  if (!ev) return 'unavailable';
  deferredPrompt = null;
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  set({ install: outcome === 'accepted' ? 'installing' : 'manual' });
  return outcome;
}

export type BrowserKind = 'ios' | 'android-chrome' | 'android-samsung' | 'android-firefox' | 'desktop-chromium' | 'desktop-safari' | 'desktop-firefox' | 'other';

export function detectBrowser(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent, touchPoints = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints): BrowserKind {
  const iPadOS = /Macintosh/.test(ua) && touchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return 'ios';
  if (/Android/.test(ua)) {
    if (/SamsungBrowser/.test(ua)) return 'android-samsung';
    if (/Firefox/.test(ua)) return 'android-firefox';
    return 'android-chrome';
  }
  if (/Firefox/.test(ua)) return 'desktop-firefox';
  if (/Edg\/|Chrome\//.test(ua)) return 'desktop-chromium';
  if (/Safari\//.test(ua)) return 'desktop-safari';
  return 'other';
}

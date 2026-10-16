import { lazy, type ComponentType } from 'react';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Set just before reloading to pick up a new version; the intro is skipped once after it. */
export const RESUME_AFTER_UPDATE_KEY = 'ecoquest_resume_after_update';
const LAST_RELOAD_KEY = 'ecoquest_chunk_reload_at';
/** Never auto-reload twice within this window (stops a reload loop if the site is really down). */
const RELOAD_GUARD_MS = 30_000;

/**
 * A page file of the running version is gone (a newer version was deployed and the old files were
 * removed). Reload once to get the new version, returning to the same page and skipping the intro.
 * Returns false if we already tried very recently, so the error screen shows instead of looping.
 */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(LAST_RELOAD_KEY));
    if (Number.isFinite(last) && Date.now() - last < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
    sessionStorage.setItem(RESUME_AFTER_UPDATE_KEY, '1');
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * `React.lazy` that retries a failed page download a couple of times (a network blip while switching
 * Wi-Fi/mobile data), and if the file still can't be fetched, reloads once onto the newest version.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>, retries = 2) {
  return lazy(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await load();
      } catch (err) {
        if (attempt < retries) {
          await wait(600 * (attempt + 1));
          continue;
        }
        // Keep the page in "loading" while the reload happens instead of flashing the error screen.
        if (navigator.onLine !== false && reloadForNewVersion()) return new Promise<never>(() => {});
        throw err;
      }
    }
  });
}

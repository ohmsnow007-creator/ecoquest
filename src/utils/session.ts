const SPLASH_KEY = 'ecoquest_splash_seen';

export function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_KEY, '1');
  } catch {
    // sessionStorage unavailable; the splash will simply show again next visit.
  }
}

export function splashSeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1';
  } catch {
    return false;
  }
}

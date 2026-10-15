import { createContext, useContext } from 'react';

/** Lets the desktop sidebar send the player back to the intro screen. */
export const LauncherContext = createContext<(() => void) | null>(null);

export function useCloseApp() {
  return useContext(LauncherContext);
}

/** The intro shows on every page load; only the test suite may skip it, to test the app behind it. */
export const SKIP_INTRO_TEST_KEY = 'ecoquest_skip_intro_in_tests';

import { lazy, type ComponentType } from 'react';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * `React.lazy` that retries a failed page download a couple of times before giving up. On a phone the
 * network can blip (switching Wi-Fi/mobile data) right as a page is opened; a retry usually succeeds,
 * so the player doesn't see the "couldn't load" screen for a momentary drop.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same constraint as React.lazy
export function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>, retries = 2) {
  return lazy(async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await load();
      } catch (err) {
        if (attempt >= retries) throw err;
        await wait(600 * (attempt + 1));
      }
    }
  });
}

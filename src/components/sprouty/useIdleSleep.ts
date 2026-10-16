import { useCallback, useEffect, useRef, useState } from 'react';

/** How long Sprouty waits without being touched before it dozes off. */
export const IDLE_SLEEP_MS = 20_000;
/** How long the "just woke up" moment lasts. */
const WAKING_MS = 2600;

export const SLEEP_LINE = 'Zzz… Sprouty เผลอหลับไปแล้ว แตะเพื่อปลุกนะ';
export const WAKE_LINES = ['ง่ว~ง… อ้าว ตื่นแล้ว! 🥱', 'อุ๊ย เผลอหลับไป มาเล่นกันต่อ!', 'ฝันว่าโลกเขียวขจีเลยล่ะ~ 🌿'];

/**
 * Sprouty falls asleep when nobody plays with it for a while. Call `poke()` on every touch:
 * it restarts the countdown and returns true if that touch woke Sprouty up.
 */
export function useIdleSleep(enabled = true, after = IDLE_SLEEP_MS) {
  const [asleep, setAsleep] = useState(false);
  const [waking, setWaking] = useState(false);
  const [wakeLine, setWakeLine] = useState(WAKE_LINES[0]);
  const asleepRef = useRef(false);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const arm = useCallback(() => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    sleepTimer.current = enabled
      ? setTimeout(() => {
          asleepRef.current = true;
          setAsleep(true);
        }, after)
      : null;
  }, [enabled, after]);

  useEffect(() => {
    arm();
    return () => {
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
    };
  }, [arm]);
  useEffect(() => () => void (wakeTimer.current && clearTimeout(wakeTimer.current)), []);

  const poke = useCallback(() => {
    const woke = asleepRef.current;
    if (woke) {
      asleepRef.current = false;
      setAsleep(false);
      setWakeLine(WAKE_LINES[Math.floor(Math.random() * WAKE_LINES.length)]);
      setWaking(true);
      if (wakeTimer.current) clearTimeout(wakeTimer.current);
      wakeTimer.current = setTimeout(() => setWaking(false), WAKING_MS);
    }
    arm();
    return woke;
  }, [arm]);

  return { asleep, waking, wakeLine, poke };
}

import { useEffect, useRef, useState } from 'react';

/** What a (cutely) annoyed Sprouty says after being poked too many times. */
export const ANGRY_LINES = ['อย่าจิ้มรัว ๆ สิ! ฮึ่ม!', 'จั๊กจี้นะ! พอได้แล้ว~', 'ใบจะร่วงหมดแล้วเนี่ย!', 'โกรธแล้วนะ! …แต่แป๊บเดียว'];

/**
 * Counts taps; `threshold` taps within `windowMs` make Sprouty angry for `durationMs`.
 * Returns whether Sprouty is angry right now, which line to say, and a `tap()` to call on each poke.
 */
export function useTantrum({ threshold = 5, windowMs = 1500, durationMs = 2600 } = {}) {
  const taps = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [angry, setAngry] = useState(false);
  const [line, setLine] = useState(ANGRY_LINES[0]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const tap = (): boolean => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < windowMs), now];
    if (taps.current.length < threshold) return false;
    taps.current = [];
    setLine(ANGRY_LINES[Math.floor(Math.random() * ANGRY_LINES.length)]);
    setAngry(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAngry(false), durationMs);
    return true;
  };

  return { angry, line, tap };
}

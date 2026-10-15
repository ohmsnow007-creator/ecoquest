import { useEffect, useRef, useState, type PointerEvent } from 'react';

/** What a shy Sprouty says while having its head rubbed. */
export const SHY_LINES = ['อุ๊ย… เขินนะ >///<', 'ลูบหัวแบบนี้ ใจละลายเลย~', 'หน้าแดงหมดแล้ว อย่ามองสิ!', 'ชอบจัง… อีกนิดได้ไหม~'];

/**
 * Head rubs: a finger (or a held mouse button) stroking side to side over the top of Sprouty makes it
 * shy for a moment. Spread `handlers` on the element; give it `touch-action: pan-y` (`touchStyle`) so
 * a vertical swipe still scrolls the page on phones. Call `consumeTap()` in the click handler: it
 * returns true when that "click" was really the end of a rub, so the tap reaction can be skipped.
 */
export function usePet({ durationMs = 2800 } = {}) {
  const stroke = useRef<{ id: number; lastX: number; dir: number; travel: number; turns: number } | null>(null);
  const petted = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shy, setShy] = useState(false);
  const [line, setLine] = useState(SHY_LINES[0]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const becomeShy = () => {
    petted.current = true;
    navigator.vibrate?.(18);
    if (!shy) setLine(SHY_LINES[Math.floor(Math.random() * SHY_LINES.length)]);
    setShy(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShy(false), durationMs);
  };

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      const r = e.currentTarget.getBoundingClientRect();
      // Only the head and leaves count (top ~65% of Sprouty), not the soil.
      if (e.clientY - r.top > r.height * 0.65) return;
      petted.current = false;
      stroke.current = { id: e.pointerId, lastX: e.clientX, dir: 0, travel: 0, turns: 0 };
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const s = stroke.current;
      if (!s || s.id !== e.pointerId) return;
      const dx = e.clientX - s.lastX;
      if (Math.abs(dx) < 2) return;
      const dir = Math.sign(dx);
      if (s.dir && dir !== s.dir) s.turns += 1;
      s.dir = dir;
      s.travel += Math.abs(dx);
      s.lastX = e.clientX;
      const w = e.currentTarget.getBoundingClientRect().width;
      // One back-and-forth across about half of Sprouty, or a long single stroke.
      if ((s.turns >= 1 && s.travel > w * 0.5) || s.travel > w * 0.9) {
        s.travel = 0;
        s.turns = 0;
        becomeShy();
      }
    },
    onPointerUp() {
      stroke.current = null;
    },
    onPointerCancel() {
      stroke.current = null;
    },
  };

  const consumeTap = () => {
    const was = petted.current;
    petted.current = false;
    return was;
  };

  return { shy, line, handlers, consumeTap, touchStyle: { touchAction: 'pan-y' } as const };
}

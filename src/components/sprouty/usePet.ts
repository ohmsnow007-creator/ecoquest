import { useEffect, useRef, useState, type PointerEvent } from 'react';

/** What a shy Sprouty says while having its head rubbed. */
export const SHY_LINES = ['อุ๊ย… เขินนะ >///<', 'ลูบหัวแบบนี้ ใจละลายเลย~', 'หน้าแดงหมดแล้ว อย่ามองสิ!', 'ชอบจัง… อีกนิดได้ไหม~'];

/**
 * Head rubs: three strokes of a finger (or a held mouse button) over the top of Sprouty make it shy
 * for a moment. Spread `handlers` on the element and give it `touchStyle` (`touch-action: none`):
 * otherwise a phone treats a slightly diagonal rub as a scroll and cancels the touch midway.
 * Call `consumeTap()` in the click handler: it returns true when that "click" was really the end of a rub, so the tap reaction can be skipped.
 */
/** Rubs needed before Sprouty gets shy; a rub is one stroke across the head in either direction. */
export const RUBS_TO_SHY = 3;
/** Strokes further apart than this start the count again. */
const RUB_GAP_MS = 1500;

export function usePet({ durationMs = 2800 } = {}) {
  const stroke = useRef<{ id: number; lastX: number; lastY: number; ax: number; ay: number; len: number; width: number } | null>(null);
  const rubs = useRef({ count: 0, last: 0 });
  const petted = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shy, setShy] = useState(false);
  const [line, setLine] = useState(SHY_LINES[0]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const becomeShy = () => {
    navigator.vibrate?.(18);
    if (!shy) setLine(SHY_LINES[Math.floor(Math.random() * SHY_LINES.length)]);
    setShy(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShy(false), durationMs);
  };

  /** A stroke ended (finger turned back or lifted): count it if it was long enough. */
  const endStroke = (s: NonNullable<typeof stroke.current>) => {
    if (s.len >= Math.max(12, s.width * 0.15)) {
      const now = Date.now();
      const r = rubs.current;
      r.count = now - r.last > RUB_GAP_MS ? 1 : r.count + 1;
      r.last = now;
      petted.current = true;
      if (r.count >= RUBS_TO_SHY) {
        r.count = 0;
        becomeShy();
      }
    }
    s.len = 0;
    s.ax = 0;
    s.ay = 0;
  };

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      // A new touch starts fresh (phones don't always send a click after a rub, so don't let it linger).
      petted.current = false;
      const r = e.currentTarget.getBoundingClientRect();
      // Only the head and leaves count (top ~70% of Sprouty), not the soil.
      if (e.clientY - r.top > r.height * 0.7) return;
      stroke.current = { id: e.pointerId, lastX: e.clientX, lastY: e.clientY, ax: 0, ay: 0, len: 0, width: r.width };
      // Keep following the finger even if it slides a little off Sprouty.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* not supported: fine */
      }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const s = stroke.current;
      if (!s || s.id !== e.pointerId) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      if (Math.abs(dx) + Math.abs(dy) < 3) return;
      // Side to side or up and down: turning back along the stroke's main direction ends one stroke.
      // Wobble across that direction (fingers are never straight) is ignored.
      const alongX = Math.abs(s.ax) >= Math.abs(s.ay);
      if (alongX ? s.ax * dx < 0 && Math.abs(dx) >= 2 : s.ay * dy < 0 && Math.abs(dy) >= 2) endStroke(s);
      s.ax += dx;
      s.ay += dy;
      s.len += Math.hypot(dx, dy);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    },
    onPointerUp() {
      if (stroke.current) endStroke(stroke.current);
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

  return { shy, line, handlers, consumeTap, touchStyle: { touchAction: 'none' } as const };
}

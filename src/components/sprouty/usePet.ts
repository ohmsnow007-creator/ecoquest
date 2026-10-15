import { useEffect, useRef, useState, type PointerEvent } from 'react';

/** What a shy Sprouty says while having its head rubbed. */
export const SHY_LINES = ['อุ๊ย… เขินนะ >///<', 'ลูบหัวแบบนี้ ใจละลายเลย~', 'หน้าแดงหมดแล้ว อย่ามองสิ!', 'ชอบจัง… อีกนิดได้ไหม~'];

/**
 * Head rubs: a finger (or a held mouse button) stroking side to side over the top of Sprouty makes it
 * shy for a moment. Spread `handlers` on the element and give it `touchStyle` (`touch-action: none`):
 * otherwise a phone treats a slightly diagonal rub as a scroll and cancels the touch midway.
 * Call `consumeTap()` in the click handler: it returns true when that "click" was really the end of a rub, so the tap reaction can be skipped.
 */
export function usePet({ durationMs = 2800 } = {}) {
  const stroke = useRef<{ id: number; lastX: number; lastY: number; dirX: number; dirY: number; travel: number; turns: number } | null>(null);
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
      // A new touch starts fresh (phones don't always send a click after a rub, so don't let it linger).
      petted.current = false;
      const r = e.currentTarget.getBoundingClientRect();
      // Only the head and leaves count (top ~70% of Sprouty), not the soil.
      if (e.clientY - r.top > r.height * 0.7) return;
      stroke.current = { id: e.pointerId, lastX: e.clientX, lastY: e.clientY, dirX: 0, dirY: 0, travel: 0, turns: 0 };
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
      // Any back-and-forth counts: side to side, up and down, or little circles.
      const dirX = Math.abs(dx) >= 2 ? Math.sign(dx) : s.dirX;
      const dirY = Math.abs(dy) >= 2 ? Math.sign(dy) : s.dirY;
      if ((s.dirX && dirX !== s.dirX) || (s.dirY && dirY !== s.dirY)) s.turns += 1;
      s.dirX = dirX;
      s.dirY = dirY;
      s.travel += Math.hypot(dx, dy);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      const w = e.currentTarget.getBoundingClientRect().width;
      if ((s.turns >= 1 && s.travel > w * 0.4) || s.travel > w * 0.8) {
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

  return { shy, line, handlers, consumeTap, touchStyle: { touchAction: 'none' } as const };
}

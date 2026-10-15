import { useCallback, useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Delete, Lock } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { ADMIN_PIN_HASHES, ADMIN_PIN_LENGTH, hashPin } from '../../utils/admin';

const MAX_TRIES = 5;
const LOCKOUT_MS = 60_000;
const KEYS: [string, string][] = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
];

// Wrong tries are counted across both PIN steps for the life of the page; the lockout itself is saved
// on this device so a reload doesn't skip it.
let wrongTries = 0;

/**
 * Full-screen, iPhone-style passcode pad in EcoQuest colours. Two fixed PINs in a row; wrong entries
 * shake and vibrate, and too many lock this device out for a minute.
 */
export function PinPad({ onUnlock, onCancel }: { onUnlock: () => void; onCancel: () => void }) {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(() => storageService.getAdminLockUntil());
  const [now, setNow] = useState(() => Date.now());
  const shake = useAnimationControls();
  const locked = lockedUntil > now;
  const secondsLeft = Math.ceil((lockedUntil - now) / 1000);

  useEffect(() => {
    if (!locked) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [locked]);

  const check = useCallback(
    async (entry: string) => {
      setBusy(true);
      if (hashPin(entry) === ADMIN_PIN_HASHES[step]) {
        wrongTries = 0;
        setError('');
        await new Promise((r) => setTimeout(r, 120));
        setPin('');
        setBusy(false);
        if (step + 1 < ADMIN_PIN_HASHES.length) setStep(step + 1);
        else onUnlock();
        return;
      }
      wrongTries += 1;
      navigator.vibrate?.([60, 40, 60]);
      const lockNow = wrongTries >= MAX_TRIES;
      setError(lockNow ? 'ใส่รหัสผิดหลายครั้ง' : `รหัสไม่ถูกต้อง (เหลืออีก ${MAX_TRIES - wrongTries} ครั้ง)`);
      await shake.start({ x: [0, -18, 18, -14, 14, -8, 8, 0], transition: { duration: 0.45 } });
      setPin('');
      setBusy(false);
      if (lockNow) {
        wrongTries = 0;
        const until = Date.now() + LOCKOUT_MS;
        storageService.setAdminLockUntil(until);
        setLockedUntil(until);
        setNow(Date.now());
        setStep(0);
      }
    },
    [step, onUnlock, shake],
  );

  const press = useCallback(
    (d: string) => {
      if (busy || locked || pin.length >= ADMIN_PIN_LENGTH) return;
      const next = pin + d;
      setPin(next);
      if (next.length === ADMIN_PIN_LENGTH) void check(next);
    },
    [busy, locked, pin, check],
  );
  const backspace = useCallback(() => {
    if (!busy) setPin((p) => p.slice(0, -1));
  }, [busy]);

  // Physical keyboard works too (desktop presentations).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, backspace, onCancel]);

  const keyClass =
    'flex h-[4.6rem] w-[4.6rem] flex-col items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition active:bg-lime active:text-forest disabled:opacity-40 sm:h-20 sm:w-20';

  return (
    <div className="bg-forest-hero safe-top fixed inset-0 z-[60] flex flex-col items-center overflow-y-auto px-6 pt-14 pb-8 text-white" role="dialog" aria-modal="true" aria-label="ใส่รหัสผู้ดูแล">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime/15 text-lime" aria-hidden="true">
        <Lock size={22} />
      </span>
      <h1 className="mt-4 text-center font-display text-section font-bold">
        {locked ? 'ล็อกชั่วคราว' : step === 0 ? 'ใส่รหัสผู้ดูแล' : 'ใส่รหัสชั้นที่ 2'}
      </h1>
      <p className="mt-1 text-caption text-mint">
        {locked ? `ลองใหม่ได้ใน ${secondsLeft} วินาที` : `ขั้นที่ ${step + 1} จาก ${ADMIN_PIN_HASHES.length}`}
      </p>

      <motion.div animate={shake} className="mt-7 flex gap-4" aria-label={`ใส่แล้ว ${pin.length} จาก ${ADMIN_PIN_LENGTH} หลัก`} role="status">
        {Array.from({ length: ADMIN_PIN_LENGTH }, (_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
              error && busy ? 'border-danger bg-danger' : i < pin.length ? 'border-lime bg-lime' : 'border-white/70'
            }`}
          />
        ))}
      </motion.div>
      <p className="mt-4 min-h-5 text-center text-caption font-semibold text-[#ffb4a8]" role="alert">
        {locked ? 'ใส่รหัสผิดหลายครั้ง เครื่องนี้ถูกล็อก 1 นาที' : error}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-4">
        {KEYS.map(([d, letters]) => (
          <button key={d} type="button" className={keyClass} disabled={locked} onClick={() => press(d)} aria-label={d}>
            <span className="text-[1.9rem] leading-none font-medium">{d}</span>
            <span className="mt-0.5 h-3 text-[0.6rem] font-semibold tracking-[0.18em] text-white/70">{letters}</span>
          </button>
        ))}
        <span />
        <button type="button" className={keyClass} disabled={locked} onClick={() => press('0')} aria-label="0">
          <span className="text-[1.9rem] leading-none font-medium">0</span>
        </button>
        <button
          type="button"
          onClick={backspace}
          disabled={locked || pin.length === 0}
          className="flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-full text-white disabled:opacity-0 sm:h-20 sm:w-20"
          aria-label="ลบตัวเลข"
        >
          <Delete size={26} />
        </button>
      </div>

      <button type="button" onClick={onCancel} className="mt-8 min-h-11 rounded-full px-6 font-semibold text-lime hover:bg-white/10">
        ย้อนกลับ
      </button>
    </div>
  );
}

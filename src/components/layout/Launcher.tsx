import { createContext, useContext, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronsRight, ArrowRight } from 'lucide-react';
import { SproutySeed } from '../illustrations/SproutySeed';
import { markSplashSeen } from '../../utils/session';
import { useGame } from '../../store/GameContext';

const SESSION_KEY = 'ecoquest_launcher_open';
const KNOB = 48;
const UNLOCK_AT = 0.85;

const LauncherContext = createContext<(() => void) | null>(null);

export function useCloseApp() {
  return useContext(LauncherContext);
}

function readOpen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeOpen(value: boolean) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable (private mode); the intro still works for this page view.
  }
}

/** iPhone-style slider: drag the knob to the end to unlock. Keyboard: Enter, Space or →. */
function SlideToUnlock({ label, onUnlock }: { label: string; onUnlock: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(0);
  const labelOpacity = useTransform(x, [0, Math.max(max * 0.6, 1)], [1, 0]);
  const done = useRef(false);

  const measure = () => {
    const w = trackRef.current?.offsetWidth ?? 0;
    setMax(Math.max(w - KNOB - 8, 0));
  };

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined' || !trackRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    animate(x, max, { duration: 0.15 });
    setTimeout(onUnlock, 160);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const travelled = x.get() + info.velocity.x * 0.05;
    if (max > 0 && travelled >= max * UNLOCK_AT) finish();
    else animate(x, 0, { type: 'spring', stiffness: 500, damping: 32 });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      finish();
    }
  };

  return (
    <div
      ref={trackRef}
      className="intro-track relative flex h-14 w-full items-center rounded-full p-1"
    >
      <motion.span
        style={{ opacity: labelOpacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1 pl-12 text-body font-semibold text-forest"
        aria-hidden="true"
      >
        {label}
        <ChevronsRight size={18} className="intro-chevrons" />
      </motion.span>
      <motion.button
        type="button"
        aria-label={`${label} (กด Enter เพื่อปลดล็อก)`}
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragStart={measure}
        onDragEnd={onDragEnd}
        onKeyDown={onKey}
        style={{ x, width: KNOB, height: KNOB }}
        className="relative z-10 flex shrink-0 cursor-grab touch-none items-center justify-center rounded-full bg-forest text-lime shadow-raised active:cursor-grabbing"
      >
        <ArrowRight size={21} aria-hidden="true" />
      </motion.button>
    </div>
  );
}

function IntroScreen({ onUnlock }: { onUnlock: () => void }) {
  const { profile } = useGame();
  const reduce = useReducedMotion();

  return (
    <div className="intro-stage">
      <main className="intro-screen" aria-label="หน้าเริ่มต้น EcoQuest">
        <div className="intro-bokeh" aria-hidden="true">
          <span style={{ left: '8%', top: '12%', width: 90, height: 90 }} />
          <span style={{ right: '6%', top: '22%', width: 130, height: 130 }} />
          <span style={{ left: '-6%', top: '46%', width: 120, height: 120 }} />
          <span style={{ right: '14%', top: '52%', width: 60, height: 60 }} />
        </div>

        <section className="relative z-10 flex flex-1 flex-col items-center px-6 pt-[max(3.5rem,env(safe-area-inset-top))]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', damping: 18 }}
            className="intro-bubble self-start"
          >
            <p className="font-display text-[1.125rem] leading-snug font-semibold text-forest">
              สวัสดี! ฉันชื่อ Sprouty
              <br />
              มาช่วยกันปลูก
              <br />
              <span className="text-primary">โลกที่ดีกว่า</span>กันนะ!
            </p>
            <span className="intro-bubble-dot intro-bubble-dot-lg" aria-hidden="true" />
            <span className="intro-bubble-dot intro-bubble-dot-sm" aria-hidden="true" />
          </motion.div>

          <motion.div
            className="mt-auto -mb-3"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -8, 0] }}
            transition={reduce ? undefined : { opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <SproutySeed size={230} />
          </motion.div>
        </section>

        <motion.section
          initial={reduce ? false : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, delay: 0.1 }}
          className="intro-card relative z-10 px-6 pt-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-white"
        >
          <p className="text-caption font-semibold tracking-wide text-lime">EcoQuest · ภารกิจพิชิตโลกสีเขียว</p>
          <h1 className="mt-1.5 font-display text-[1.75rem] leading-tight font-bold">
            ปลูกวันนี้
            <br />
            เปลี่ยนวันพรุ่งนี้
          </h1>
          <p className="mx-auto mt-2 max-w-[17rem] text-caption text-white/80">
            เริ่มนิสัยรักษ์โลกเล็ก ๆ ทีละภารกิจ แล้วดูโลกสีเขียวของคุณเติบโต
          </p>

          <div className="mt-5">
            <SlideToUnlock label={profile ? 'เลื่อนเพื่อเข้าเกม' : 'เลื่อนเพื่อเริ่มต้น'} onUnlock={onUnlock} />
          </div>

          <p className="mt-3.5 text-[0.75rem] text-white/65">
            {profile ? (
              <>
                ยินดีต้อนรับกลับ <span className="font-semibold text-lime">{profile.displayName}</span>
              </>
            ) : (
              'ไม่ต้องสมัครสมาชิก ข้อมูลเก็บในเครื่องนี้เท่านั้น'
            )}
          </p>
        </motion.section>
      </main>
    </div>
  );
}

/** Shows the intro once per browser session on every screen size; sliding it unlocks the app. */
export function Launcher({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(readOpen);

  const open = () => {
    markSplashSeen();
    writeOpen(true);
    setIsOpen(true);
  };
  const close = () => {
    writeOpen(false);
    setIsOpen(false);
  };

  if (!isOpen) return <IntroScreen onUnlock={open} />;
  return <LauncherContext.Provider value={close}>{children}</LauncherContext.Provider>;
}

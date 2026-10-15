import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronsRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SproutySeed } from '../illustrations/SproutySeed';
import { IntroLandscape } from '../illustrations/IntroLandscape';
import { markSplashSeen } from '../../utils/session';
import { useGame } from '../../store/GameContext';
import { SPROUTY_TIPS, nextTipOrder, type SproutyTip } from '../../data/sproutyTips';

export const SKIP_INTRO_TEST_KEY = 'ecoquest_skip_intro_in_tests';
const KNOB = 48;
const UNLOCK_AT = 0.85;

const LauncherContext = createContext<(() => void) | null>(null);

export function useCloseApp() {
  return useContext(LauncherContext);
}

/** The intro shows on every page load. Only the test suite may skip it, to test the app behind it. */
function startOpen(): boolean {
  if (import.meta.env.MODE !== 'test') return false;
  try {
    return sessionStorage.getItem(SKIP_INTRO_TEST_KEY) === '1';
  } catch {
    return false;
  }
}

/** iPhone-style slider: drag the knob to the end to unlock. Keyboard: Enter, Space or →. */
function SlideToUnlock({
  label,
  onUnlock,
  onKnobMove,
}: {
  label: string;
  onUnlock: () => void;
  /** Reports the knob position while dragging, in viewport coordinates. */
  onKnobMove?: (clientX: number, clientY: number) => void;
}) {
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
        onDrag={(e) => {
          const p = 'touches' in e ? e.touches[0] : (e as PointerEvent);
          if (p) onKnobMove?.(p.clientX, p.clientY);
        }}
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

/** Goes through every tip once in a shuffled order before any tip can show again. */
function useRotatingTip(greeting: SproutyTip) {
  const [order, setOrder] = useState(() => nextTipOrder(SPROUTY_TIPS.length));
  const [pos, setPos] = useState(-1); // -1 = the greeting
  const tip = pos < 0 ? greeting : SPROUTY_TIPS[order[pos]];

  const next = () => {
    if (pos + 1 < order.length) {
      setPos(pos + 1);
      return;
    }
    setOrder(nextTipOrder(SPROUTY_TIPS.length, order[order.length - 1]));
    setPos(0);
  };

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  });
  useEffect(() => {
    const t = setInterval(() => nextRef.current(), 5200);
    return () => clearInterval(t);
  }, []);

  return { tip, key: pos < 0 ? 'greeting' : `${pos}-${order[pos]}`, next };
}

/** Random natural blinking, sometimes a double blink. */
function useBlink() {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const blink = (times: number) => {
      setBlinking(true);
      t = setTimeout(() => {
        setBlinking(false);
        t = setTimeout(() => blink(times > 1 ? times - 1 : Math.random() < 0.25 ? 2 : 1), times > 1 ? 160 : 2400 + Math.random() * 2800);
      }, 130);
    };
    t = setTimeout(() => blink(1), 1800);
    return () => clearTimeout(t);
  }, []);
  return blinking;
}

function IntroScreen({ onUnlock }: { onUnlock: () => void }) {
  const { profile } = useGame();
  const reduce = useReducedMotion();
  const mascotRef = useRef<HTMLDivElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [hop, setHop] = useState(0);
  const blinking = useBlink();
  const greeting: SproutyTip = profile
    ? { lead: `ยินดีต้อนรับกลับ ${profile.displayName}!\n`, hl: 'วันนี้ช่วยโลกกันอีกนะ' }
    : { lead: 'สวัสดี! ฉันชื่อ Sprouty\nมาช่วยกันปลูก', hl: 'โลกที่ดีกว่า', tail: 'กันนะ!' };
  const { tip, key, next } = useRotatingTip(greeting);

  // Sprouty turns toward any tap, click or the dragged slider knob, then looks back after a moment.
  const lookAt = (clientX: number, clientY: number) => {
    lastTouch.current = Date.now();
    const r = mascotRef.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.6;
    setLook({ x: (clientX - cx) / (r.width * 0.9), y: (clientY - cy) / (r.height * 1.2) });
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setLook({ x: 0, y: 0 }), 2200);
  };
  useEffect(() => () => void (idle.current && clearTimeout(idle.current)), []);

  // When nobody is touching the screen, Sprouty glances around now and then, like it is looking at the scenery.
  const lastTouch = useRef(0);
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const wander = () => {
      t = setTimeout(() => {
        if (Date.now() - lastTouch.current > 3000) {
          setLook({ x: Math.random() * 1.4 - 0.7, y: Math.random() * 0.7 - 0.45 });
          if (idle.current) clearTimeout(idle.current);
          idle.current = setTimeout(() => setLook({ x: 0, y: 0 }), 1100 + Math.random() * 800);
        }
        wander();
      }, 3200 + Math.random() * 2800);
    };
    wander();
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <div className="intro-stage">
      <main
        className="intro-screen"
        aria-label="หน้าเริ่มต้น EcoQuest"
        onPointerDown={(e) => lookAt(e.clientX, e.clientY)}
        onPointerMove={(e) => e.pointerType === 'mouse' && lookAt(e.clientX, e.clientY)}
      >
        <div className="intro-bokeh" aria-hidden="true">
          <span style={{ left: '8%', top: '12%', width: 90, height: 90 }} />
          <span style={{ right: '6%', top: '22%', width: 130, height: 130 }} />
          <span style={{ left: '-6%', top: '46%', width: 120, height: 120 }} />
          <span style={{ right: '14%', top: '52%', width: 60, height: 60 }} />
        </div>

        <IntroLandscape />
        <div className="intro-leaves" aria-hidden="true">
          {[
            { left: '12%', delay: '0s', dur: '11s', size: 14 },
            { left: '34%', delay: '3.5s', dur: '13s', size: 10 },
            { left: '58%', delay: '1.5s', dur: '12s', size: 16 },
            { left: '80%', delay: '6s', dur: '14s', size: 12 },
            { left: '92%', delay: '9s', dur: '10s', size: 9 },
            { left: '4%', delay: '7.5s', dur: '15s', size: 11 },
          ].map((l) => (
            <span key={l.left} style={{ left: l.left, width: l.size, height: l.size, animationDelay: l.delay, animationDuration: l.dur }} />
          ))}
        </div>

        <section className="relative z-10 flex flex-1 flex-col items-center px-5 pt-[max(2.25rem,env(safe-area-inset-top))]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', damping: 18 }}
            className="intro-bubble self-start"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={key}
                data-testid="sprouty-says"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="intro-bubble-text font-display text-[0.875rem] leading-snug font-semibold whitespace-pre-line text-forest sm:text-[1rem]"
              >
                {/* Thai has no spaces between words; the browser's word breaker wraps it, and the bubble never lets text spill out. */}
                {tip.lead} <span className="text-primary">{tip.hl}</span>
                {tip.tail}
              </motion.p>
            </AnimatePresence>
            <span className="intro-bubble-dot intro-bubble-dot-lg" aria-hidden="true" />
            <span className="intro-bubble-dot intro-bubble-dot-sm" aria-hidden="true" />
          </motion.div>

          <motion.div
            ref={mascotRef}
            className="mt-auto -mb-3 w-[min(190px,48vw)] cursor-pointer sm:w-[210px]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
            transition={reduce ? undefined : { opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
            onPointerDown={() => {
              setHop((h) => h + 1);
              next();
            }}
          >
            <SproutySeed size={210} className="h-auto w-full" look={look} blinking={blinking} hop={reduce ? 0 : hop} />
          </motion.div>
        </section>

        <motion.section
          initial={reduce ? false : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 22, delay: 0.1 }}
          className="intro-card relative z-10 px-6 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-white"
        >
          <p className="text-caption font-semibold tracking-wide text-lime">EcoQuest · ภารกิจพิชิตโลกสีเขียว</p>
          <h1 className="mt-1 font-display text-[1.5rem] leading-tight font-bold sm:text-[1.75rem]">
            ปลูกวันนี้
            <br />
            เปลี่ยนวันพรุ่งนี้
          </h1>
          <p className="mx-auto mt-2 max-w-[17rem] text-caption text-white/80">
            เริ่มนิสัยรักษ์โลกเล็ก ๆ ทีละภารกิจ แล้วดูโลกสีเขียวของคุณเติบโต
          </p>

          <div className="mt-4">
            <SlideToUnlock label={profile ? 'เลื่อนเพื่อเข้าเกม' : 'เลื่อนเพื่อเริ่มต้น'} onUnlock={onUnlock} onKnobMove={lookAt} />
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

/**
 * Shows the intro every time the site is opened, on every screen size. Unlocking goes to Home for
 * an existing player and to Welcome for a new one.
 */
export function Launcher({ children }: { children: ReactNode }) {
  const { profile } = useGame();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(startOpen);

  const open = () => {
    markSplashSeen();
    navigate(profile ? '/home' : '/welcome', { replace: true });
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  if (!isOpen) return <IntroScreen onUnlock={open} />;
  return <LauncherContext.Provider value={close}>{children}</LauncherContext.Provider>;
}

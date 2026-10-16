import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { RESUME_AFTER_UPDATE_KEY } from '../../utils/lazyRetry';
import { LauncherContext, SKIP_INTRO_TEST_KEY } from './launcherContext';
import { useOutfit } from '../cosmetics/useOutfit';
import { AnimatePresence, motion, useMotionValue, useTransform, animate, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronsRight, ArrowRight, Flame, Target } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SproutySeed } from '../illustrations/SproutySeed';
import { IntroLandscape } from '../illustrations/IntroLandscape';
import { markSplashSeen } from '../../utils/session';
import { useGame } from '../../store/GameContext';
import { SPROUTY_TIPS, nextTipOrder, type SproutyTip } from '../../data/sproutyTips';
import { getTimeOfDay } from '../../utils/timeOfDay';
import { usePet } from '../sprouty/usePet';
import { useTantrum } from '../sprouty/useTantrum';
import { getSproutyStage } from '../../utils/sprouty';
import { getPlayerStats } from '../../utils/playerStats';
import { getDailyStatus } from '../../utils/challenges';

const KNOB = 48;
const UNLOCK_AT = 0.85;


/**
 * The intro shows on every page load, except right after the app reloaded itself to pick up a new
 * version mid-session (the player was already inside). The test suite may also skip it.
 */
function startOpen(): boolean {
  try {
    if (sessionStorage.getItem(RESUME_AFTER_UPDATE_KEY) === '1') return true; // cleared after mount
    return import.meta.env.MODE === 'test' && sessionStorage.getItem(SKIP_INTRO_TEST_KEY) === '1';
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

/** Leaves bursting out around Sprouty when the intro is unlocked. */
const BURST = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const d = 110 + (i % 3) * 40;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d - 40, r: (i % 2 ? 1 : -1) * (120 + i * 15), s: 14 + (i % 4) * 4, c: i % 3 === 0 ? '#F2D46B' : i % 3 === 1 ? '#7CCB4F' : '#B6DB7A' };
});

function IntroScreen({ onUnlock }: { onUnlock: () => void }) {
  const { profile, progress } = useGame();
  const reduce = useReducedMotion();
  const [timeOfDay] = useState(() => getTimeOfDay(new Date().getHours()));
  const stats = profile ? getPlayerStats(progress) : null;
  const daily = profile ? getDailyStatus(progress, profile.id) : null;
  const growth = getSproutyStage(stats?.level ?? 1);
  // Opening: Sprouty pops out of the soil with eyes closed, leaves unfurl, it wakes up and hops.
  const [awake, setAwake] = useState(!!reduce);
  const [touched, setTouched] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [hop, setHop] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t1 = setTimeout(() => setAwake(true), 1250);
    const t2 = setTimeout(() => setHop((h) => h + 1), 1450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduce]);
  const mascotRef = useRef<HTMLDivElement>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const blinking = useBlink();
  const greeting: SproutyTip = profile
    ? { lead: `ยินดีต้อนรับกลับ ${profile.displayName}!\n`, hl: 'วันนี้ช่วยโลกกันอีกนะ' }
    : { lead: 'สวัสดี! ฉันชื่อ Sprouty\nมาช่วยกันปลูก', hl: 'โลกที่ดีกว่า', tail: 'กันนะ!' };
  const { tip, key, next } = useRotatingTip(greeting);

  // Sprouty turns toward any tap, click or the dragged slider knob, then looks back after a moment.
  const lookAt = (clientX: number, clientY: number) => {
    lastTouch.current = Date.now();
    setTouched(true);
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
        if (Date.now() - lastTouch.current > 3000 && Math.random() < 0.35) setHop((h) => h + 1);
        wander();
      }, 3200 + Math.random() * 2800);
    };
    wander();
    return () => clearTimeout(t);
  }, [reduce]);

  const tantrum = useTantrum();
  const pet = usePet();
  const outfit = useOutfit('sprouty');
  const mood = leaving ? 'cheer' : tantrum.angry ? 'angry' : pet.shy ? 'shy' : timeOfDay === 'night' && !touched ? 'sleepy' : 'happy';

  // Unlocking: Sprouty cheers, leaves burst out, the card drops away, then the app opens.
  const unlock = () => {
    if (reduce) return onUnlock();
    setLeaving(true);
    setLook({ x: 0, y: -0.4 });
    setHop((h) => h + 1);
    setTimeout(onUnlock, 950);
  };

  return (
    <div className="intro-stage">
      <main
        data-time={timeOfDay}
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
        <div className="intro-tint" aria-hidden="true" />
        {timeOfDay === 'night' && (
          <div className="intro-night" aria-hidden="true">
            {[[8, 6], [22, 12], [38, 4], [55, 10], [70, 5], [84, 14], [92, 7], [14, 20], [62, 22], [46, 17], [30, 26], [78, 24]].map(([x, y], i) => (
              <span key={`s${i}`} className="intro-star" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 5) * 0.7}s` }} />
            ))}
            {[[18, 58], [32, 64], [70, 56], [84, 62], [52, 60], [10, 66]].map(([x, y], i) => (
              <span key={`f${i}`} className="intro-firefly" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.9}s`, animationDuration: `${5 + (i % 3)}s` }} />
            ))}
          </div>
        )}
        <div className="intro-leaves" aria-hidden="true">
          {[
            { left: '12%', delay: '0s', dur: '11s', size: 14 },
            { left: '34%', delay: '3.5s', dur: '13s', size: 10 },
            { left: '58%', delay: '1.5s', dur: '12s', size: 16 },
            { left: '80%', delay: '6s', dur: '14s', size: 12 },
            { left: '92%', delay: '9s', dur: '10s', size: 9 },
            { left: '4%', delay: '7.5s', dur: '15s', size: 11 },
            { left: '22%', delay: '5s', dur: '9s', size: 12 },
            { left: '46%', delay: '8s', dur: '10.5s', size: 9 },
            { left: '68%', delay: '2.5s', dur: '9.5s', size: 13 },
            { left: '86%', delay: '11s', dur: '12.5s', size: 15 },
            { left: '28%', delay: '10s', dur: '14.5s', size: 8 },
            { left: '52%', delay: '12.5s', dur: '11.5s', size: 11 },
            { left: '74%', delay: '4.5s', dur: '15.5s', size: 10 },
            { left: '8%', delay: '13s', dur: '12s', size: 13 },
          ].map((l) => (
            <span key={l.left} style={{ left: l.left, width: l.size, height: l.size, animationDelay: l.delay, animationDuration: l.dur }} />
          ))}
        </div>

        <section className="relative z-10 flex flex-1 flex-col items-center px-5 pt-[max(2.25rem,env(safe-area-inset-top))]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: reduce ? 0 : 1.55, type: 'spring', damping: 18 }}
            className="intro-bubble self-start"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={tantrum.angry ? `angry-${tantrum.line}` : pet.shy ? `shy-${pet.line}` : key}
                data-testid="sprouty-says"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="intro-bubble-text font-display text-[0.875rem] leading-snug font-semibold whitespace-pre-line text-forest sm:text-[1rem]"
              >
                {/* Thai has no spaces between words; the browser's word breaker wraps it, and the bubble never lets text spill out. */}
                {tantrum.angry ? (
                  <span className="text-[#C2410C]">{tantrum.line}</span>
                ) : pet.shy ? (
                  <span className="text-[#DB2777]">{pet.line}</span>
                ) : (
                  <>
                    {tip.lead} <span className="text-primary">{tip.hl}</span>
                    {tip.tail}
                  </>
                )}
              </motion.p>
            </AnimatePresence>
            <span className="intro-bubble-dot intro-bubble-dot-lg" aria-hidden="true" />
            <span className="intro-bubble-dot intro-bubble-dot-sm" aria-hidden="true" />
          </motion.div>

          <motion.div
            ref={mascotRef}
            className="relative mt-auto mb-3 w-[min(240px,62vw)] cursor-pointer sm:w-[240px]"
            initial={reduce ? false : { opacity: 0, scale: 0.35 }}
            animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -7, 0], rotate: [0, 2.5, 0, -2.5, 0] }}
            transition={
              reduce
                ? undefined
                : {
                    opacity: { duration: 0.35, delay: 0.3 },
                    scale: { delay: 0.3, type: 'spring', damping: 10, stiffness: 160 },
                    y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.6 },
                    rotate: { duration: 6.4, repeat: Infinity, ease: 'easeInOut', delay: 1.6 },
                  }
            }
            {...pet.handlers}
            style={{ transformOrigin: '50% 90%', ...pet.touchStyle }}
            onClick={() => {
              if (pet.consumeTap()) return;
              setHop((h) => h + 1);
              if (!tantrum.tap() && !tantrum.angry) next();
            }}
          >
            <motion.span
              className="block"
              animate={tantrum.angry && !reduce ? { x: [0, -7, 7, -6, 6, -3, 3, 0], rotate: [0, -4, 4, -3, 3, 0] } : { x: 0, rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
            <SproutySeed
              size={240}
              className="h-auto w-full drop-shadow-[0_10px_18px_rgba(60,40,10,0.25)]"
              look={look}
              blinking={!awake || blinking}
              hop={reduce ? 0 : hop}
              mood={mood}
              stage={growth.stage}
              sprout={!reduce}
              outfit={outfit}
            />
            </motion.span>
            {leaving && (
              <span className="pointer-events-none absolute inset-0" aria-hidden="true">
                {BURST.map((l, i) => (
                  <motion.span
                    key={i}
                    className="intro-burst-leaf"
                    style={{ width: l.s, height: l.s, background: l.c }}
                    initial={{ x: 0, y: 0, scale: 0.3, opacity: 0, rotate: 0 }}
                    animate={{ x: l.x, y: l.y, scale: 1, opacity: [0, 1, 1, 0], rotate: l.r }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.015 }}
                  />
                ))}
              </span>
            )}
          </motion.div>
        </section>

        <motion.section
          initial={reduce ? false : { y: 60, opacity: 0 }}
          animate={leaving ? { y: 220, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={leaving ? { duration: 0.45, ease: 'easeIn', delay: 0.25 } : { type: 'spring', damping: 22, delay: 0.7 }}
          className="intro-card relative z-10 px-6 pt-6 pb-5 text-center text-white"
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
            <SlideToUnlock label={profile ? 'เลื่อนเพื่อเข้าเกม' : 'เลื่อนเพื่อเริ่มต้น'} onUnlock={unlock} onKnobMove={lookAt} />
          </div>

          {profile && stats && daily ? (
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-[0.75rem]" aria-label="สถานะของคุณ">
              <span className="rounded-full bg-white/12 px-2.5 py-1 font-semibold text-lime">
                {profile.displayName} · เลเวล {stats.level}
              </span>
              {stats.streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-white/90">
                  <Flame size={12} className="text-warning" aria-hidden="true" /> {stats.streak} วัน
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-white/90">
                <Target size={12} aria-hidden="true" /> วันนี้ {daily.doneCount}/{daily.missions.length}
              </span>
            </div>
          ) : (
            <p className="mt-3.5 text-[0.75rem] text-white/65">ไม่ต้องสมัครสมาชิก ข้อมูลเก็บในเครื่องนี้เท่านั้น</p>
          )}
        </motion.section>

        {leaving && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.35 }}
            aria-hidden="true"
          />
        )}
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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(startOpen);
  useEffect(() => {
    try {
      sessionStorage.removeItem(RESUME_AFTER_UPDATE_KEY);
    } catch {
      /* storage blocked: nothing to clear */
    }
  }, []);

  const open = () => {
    markSplashSeen();
    // App-icon shortcuts (…#/missions?open=1) go straight to their page; every other open lands on Home.
    const shortcut = new URLSearchParams(location.search).get('open') === '1';
    navigate(!profile ? '/welcome' : shortcut ? location.pathname : '/home', { replace: true });
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  if (!isOpen) return <IntroScreen onUnlock={open} />;
  return <LauncherContext.Provider value={close}>{children}</LauncherContext.Provider>;
}

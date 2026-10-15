import { useEffect, useRef, useState, type ComponentType } from 'react';
import { markSplashSeen, splashSeen } from '../utils/session';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { WelcomeScene, GardenScene, SpaceScene } from '../components/illustrations/OnboardingScenes';
import { Logo } from '../components/ui/Logo';
import { ChunkyButton } from '../components/ui/Button';

/* ---------------------------------- Splash --------------------------------- */

const SPLASH_STEPS = ['อ่านข้อมูลในเครื่อง', 'โหลดฟอนต์', 'เตรียมหน้าหลัก'];

// Each step is real work: storage is read before render, then fonts and the home page chunk load.
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(1);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    (async () => {
      await (document.fonts?.ready ?? Promise.resolve());
      if (cancelled) return;
      setDone(2);
      await import('./Dashboard').catch(() => undefined);
      if (cancelled) return;
      setDone(3);
      const wait = Math.max(0, 1100 - (Date.now() - started));
      setTimeout(() => !cancelled && onDoneRef.current(), wait + 250);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pct = Math.round((done / SPLASH_STEPS.length) * 100);

  return (
    <div className="bg-forest-hero relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8 text-white">
      <svg className="absolute inset-x-0 bottom-0 h-40 w-full" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 90 C80 40 160 50 220 90 C280 60 340 50 400 80 L400 160 L0 160Z" className="fill-emerald" opacity={0.35} />
        <path d="M0 130 C100 100 200 110 260 128 C320 112 360 110 400 120 L400 160 L0 160Z" className="fill-evergreen" opacity={0.7} />
      </svg>

      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14 }}>
        <Logo variant="chunky" />
      </motion.div>

      <div className="relative mt-16 w-full max-w-xs">
        <p className="text-center font-display text-section font-semibold" aria-live="polite">
          กำลังโหลด...
        </p>
        <div
          role="progressbar"
          aria-label="กำลังเตรียมแอป"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={SPLASH_STEPS[Math.min(done, SPLASH_STEPS.length) - 1]}
          className="mt-3 h-6 rounded-full bg-white/12 p-1 ring-1 ring-white/20"
        >
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-emerald to-lime"
            initial={{ width: '12%' }}
            animate={{ width: `${Math.max(12, pct)}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Onboarding ------------------------------- */

interface Slide {
  art: ComponentType;
  lead: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    art: WelcomeScene,
    lead: 'ยินดีต้อนรับสู่',
    title: 'EcoQuest!',
    body: 'ภารกิจพิชิตโลกสีเขียว — เปลี่ยนการรักษ์โลกให้เป็นเรื่องสนุก ทีละภารกิจ',
  },
  {
    art: GardenScene,
    lead: 'เริ่มสร้าง',
    title: 'โลกสีเขียวของคุณ',
    body: 'ทำภารกิจและตอบควิซเพื่อรับ XP แล้วดูโลกเสมือนของคุณค่อย ๆ เติบโตเป็นสวนสีเขียว',
  },
  {
    art: SpaceScene,
    lead: 'ฝึกนิสัยดี',
    title: 'ทีละวัน ทีละภารกิจ',
    body: 'ภารกิจชีวิตจริงเป็นการรายงานด้วยตนเอง ช่วยให้คุณติดตามนิสัยรักษ์โลกของตัวเองได้ทุกวัน',
  },
];

function Dots({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {SLIDES.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`ไปหน้าแนะนำที่ ${i + 1}`}
          aria-current={i === index ? 'step' : undefined}
          className="flex h-11 w-7 items-center justify-center"
        >
          <span className={`block h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-primary' : 'w-2.5 bg-border'}`} />
        </button>
      ))}
    </div>
  );
}

interface OnboardingProps {
  index: number;
  onIndex: (i: number) => void;
  onFinish: () => void;
  returningName?: string;
}

function Onboarding({ index, onIndex, onFinish, returningName }: OnboardingProps) {
  const [direction, setDirection] = useState(1);
  const slide = SLIDES[index];
  const Art = slide.art;
  const last = index === SLIDES.length - 1;

  const go = (i: number) => {
    if (i < 0 || i >= SLIDES.length) return;
    setDirection(i > index ? 1 : -1);
    onIndex(i);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) {
      if (last) onFinish();
      else go(index + 1);
    } else if (info.offset.x > 60) go(index - 1);
  };

  const cta = returningName
    ? index === 0 ? 'กลับมาเล่นต่อ' : last ? 'กลับมาเล่นต่อ' : 'ถัดไป'
    : index === 0 ? 'เริ่มต้นใช้งาน' : last ? 'สร้างโปรไฟล์' : 'ถัดไป';

  const onCta = () => {
    if (returningName && index === 0) return onFinish();
    if (last) return onFinish();
    go(index + 1);
  };

  return (
    <div className="bg-meadow flex min-h-dvh flex-col">
      <header className="safe-top mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-4">
        <Logo />
        {(!returningName || index > 0) && (
          <button
            type="button"
            onClick={onFinish}
            className="min-h-11 rounded-full px-4 font-display text-body font-semibold text-primary hover:bg-pale-mint"
          >
            {returningName ? 'กลับเข้าเกม' : 'ข้าม'}
          </button>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
            className="mx-auto mt-4 w-full max-w-sm touch-pan-y overflow-hidden rounded-hero bg-pale-mint shadow-card ring-1 ring-mint/70 lg:max-w-none"
          >
            <Art />
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto mt-6 flex w-full max-w-sm flex-1 flex-col lg:mt-0 lg:max-w-md lg:flex-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <p className="font-display text-section font-semibold text-primary lg:text-[1.375rem]">{slide.lead}</p>
              <h1 className="font-display text-[2.125rem] leading-tight font-bold text-forest lg:text-[2.75rem]">{slide.title}</h1>
              <p className="mt-2 text-body font-medium text-text">{slide.body}</p>
              {index === 0 && returningName && (
                <p className="mt-3 rounded-control bg-pale-mint px-3 py-2 text-caption ring-1 ring-mint">
                  ยินดีต้อนรับกลับ <span className="font-semibold">{returningName}</span> ความคืบหน้าของคุณยังอยู่ครบ
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto pt-6 lg:mt-8">
            <Dots index={index} onSelect={go} />
            <div className="mt-4 flex justify-center lg:justify-start">
              <ChunkyButton className="w-full max-w-60" iconRight={<ArrowRight size={18} aria-hidden="true" />} onClick={onCta}>
                {cta}
              </ChunkyButton>
            </div>
            {index === 0 && (
              <div className="mt-4 space-y-1 text-center text-caption text-muted lg:text-left">
                <p>ไม่ต้องใช้อุปกรณ์พิเศษ ใช้ได้ทันทีบนมือถือ และติดตั้งเป็นแอปได้</p>
                {returningName && (
                  <p>
                    <button type="button" onClick={() => go(1)} className="min-h-11 font-semibold text-primary underline underline-offset-4">
                      ดูแนะนำแอปอีกครั้ง
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */

type Stage = 'splash' | 'intro';

export function Welcome() {
  const { profile } = useGame();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>(() => (splashSeen() ? 'intro' : 'splash'));
  const [index, setIndex] = useState(0);

  const finishSplash = () => {
    markSplashSeen();
    setStage('intro');
  };

  if (stage === 'splash') return <SplashScreen onDone={finishSplash} />;

  return (
    <Onboarding
      index={index}
      onIndex={setIndex}
      returningName={profile?.displayName}
      onFinish={() => navigate(profile ? '/home' : '/welcome/profile')}
    />
  );
}

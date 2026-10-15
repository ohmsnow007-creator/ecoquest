import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { markSplashSeen, splashSeen } from '../utils/session';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { AVATARS } from '../data/icons';
import { NAME_MAX_LENGTH, validateDisplayName } from '../utils/profile';
import { WelcomeScene, GardenScene, SpaceScene } from '../components/illustrations/OnboardingScenes';
import { Logo } from '../components/ui/Logo';
import { ChunkyButton, IconButton } from '../components/ui/Button';
import { AvatarPicker, Avatar } from '../components/ui/AvatarPicker';
import { LevelBadge, XPBadge } from '../components/ui/Badges';

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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-primary px-8 text-white">
      <svg className="absolute inset-x-0 bottom-0 h-40 w-full" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 90 C80 40 160 50 220 90 C280 60 340 50 400 80 L400 160 L0 160Z" className="fill-emerald" opacity={0.5} />
        <path d="M0 130 C100 100 200 110 260 128 C320 112 360 110 400 120 L400 160 L0 160Z" className="fill-forest" opacity={0.45} />
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
          className="mt-3 h-6 rounded-full bg-white p-1 shadow-[0_6px_16px_rgb(0_0_0/0.18)]"
        >
          <motion.div
            className="h-full rounded-full bg-sunset"
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
          <span className={`block h-2.5 rounded-full transition-all ${i === index ? 'w-2.5 bg-primary' : 'w-2.5 bg-border'}`} />
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
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="safe-top mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-4">
        <Logo />
        {(!returningName || index > 0) && (
          <button
            type="button"
            onClick={onFinish}
            className="min-h-11 px-2 font-display text-body font-semibold text-sunset underline underline-offset-4"
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
            className="mx-auto mt-4 w-full max-w-sm touch-pan-y lg:max-w-none"
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
              <h1 className="font-display text-[2.125rem] leading-tight font-bold text-sunset lg:text-[2.75rem]">{slide.title}</h1>
              <p className="mt-2 text-body font-medium text-text">{slide.body}</p>
              {index === 0 && returningName && (
                <p className="mt-3 rounded-control bg-mint/50 px-3 py-2 text-caption">
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
                <p>ไม่ต้องใช้อุปกรณ์พิเศษ ใช้ได้ทันทีบนมือถือหรือคอมพิวเตอร์</p>
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

/* ------------------------------ Profile setup ------------------------------ */

function ProfileSetup({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
  const { createProfile } = useGame();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [touched, setTouched] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const nameId = useId();
  const errorId = useId();
  const countId = useId();

  const result = validateDisplayName(name);
  const showError = touched && !result.ok;
  const previewName = result.ok ? result.value : 'ชื่อของคุณ';
  const length = [...name.trim()].length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSaveError(false);
    if (!result.ok) {
      document.getElementById(nameId)?.focus();
      return;
    }
    if (createProfile(result.value, avatar)) onCreated();
    else setSaveError(true);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="safe-top mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-4">
        <IconButton aria-label="ย้อนกลับไปหน้าแนะนำ" variant="surface" onClick={onBack}>
          <ArrowLeft size={20} />
        </IconButton>
        <span className="font-display text-caption font-semibold text-muted">ขั้นตอนสุดท้าย</span>
        <span className="w-11" aria-hidden="true" />
      </header>

      <motion.form
        noValidate
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg flex-1 px-6 pt-4 pb-10"
      >
        <h1 className="text-center font-display text-[2rem] leading-tight font-bold">
          <span className="text-primary">สร้าง</span>
          <span className="text-sunset">โปรไฟล์</span>
        </h1>
        <p className="mt-1 text-center text-caption text-muted">ไม่ต้องสมัครบัญชีออนไลน์ ใช้เพียงชื่อและอวาตาร์</p>

        {/* Preview */}
        <div className="mt-6 flex items-center gap-4 rounded-card border border-border bg-surface p-4 shadow-card" aria-live="polite">
          <Avatar id={avatar} size="lg" />
          <div className="min-w-0">
            <p className="text-caption text-muted">ตัวอย่างโปรไฟล์</p>
            <p className={`truncate font-display text-section font-semibold ${result.ok ? '' : 'text-muted'}`}>{previewName}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <LevelBadge level={1} />
              <XPBadge amount={0} />
            </div>
          </div>
        </div>

        <label htmlFor={nameId} className="mt-6 mb-1.5 block font-display text-body font-semibold text-primary">
          ชื่อผู้เล่น
        </label>
        <input
          id={nameId}
          type="text"
          inputMode="text"
          autoComplete="nickname"
          value={name}
          maxLength={NAME_MAX_LENGTH + 10}
          placeholder="เช่น นักรักษ์โลก"
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.length > 0 && setTouched(true)}
          aria-invalid={showError}
          aria-describedby={`${countId}${showError ? ` ${errorId}` : ''}`}
          className={`min-h-12 w-full rounded-full border-2 bg-surface px-5 text-body placeholder:text-muted focus:outline-none ${
            showError ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'
          }`}
        />
        <div className="mt-1 flex items-start justify-between gap-3 px-2 text-caption">
          <span id={errorId} className="text-danger" role={showError ? 'alert' : undefined}>
            {showError && !result.ok ? result.error : ''}
          </span>
          <span id={countId} className={length > NAME_MAX_LENGTH ? 'text-danger' : 'text-muted'}>
            {length}/{NAME_MAX_LENGTH}
          </span>
        </div>

        <p className="mt-5 mb-2 font-display text-body font-semibold text-primary">เลือกอวาตาร์</p>
        <AvatarPicker value={avatar} onChange={setAvatar} />

        {saveError && (
          <div role="alert" className="mt-5 flex items-start gap-2 rounded-control border border-danger/40 bg-danger/5 p-3 text-caption">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
            <p>
              <span className="font-semibold text-danger">บันทึกโปรไฟล์ไม่สำเร็จ</span> เบราว์เซอร์อาจปิดการเก็บข้อมูลไว้
              (เช่น โหมดไม่ระบุตัวตน หรือพื้นที่เต็ม) กรุณาตรวจสอบการตั้งค่าแล้วลองอีกครั้ง
            </p>
          </div>
        )}

        <ChunkyButton type="submit" fullWidth className="mt-7">
          เริ่มผจญภัย
        </ChunkyButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-caption text-muted">
          <ShieldCheck size={14} className="text-primary" aria-hidden="true" />
          ข้อมูลเก็บไว้ในเครื่องนี้เท่านั้น ไม่มีการส่งออกไปภายนอก
        </p>
      </motion.form>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */

type Stage = 'splash' | 'intro' | 'profile';

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

  if (stage === 'profile' && !profile) {
    return (
      <ProfileSetup
        onBack={() => {
          setIndex(SLIDES.length - 1);
          setStage('intro');
        }}
        onCreated={() => navigate('/home', { replace: true })}
      />
    );
  }

  return (
    <Onboarding
      index={index}
      onIndex={setIndex}
      returningName={profile?.displayName}
      onFinish={() => (profile ? navigate('/home') : setStage('profile'))}
    />
  );
}

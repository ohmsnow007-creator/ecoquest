import { useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronDown, Check, Plus, Pencil, AlertCircle } from 'lucide-react';
import { useGame } from '../store/GameContext';
import {
  DEFAULT_AVATAR_ID,
  DEFAULT_PROFILE_COLOR,
  INTERESTS,
  MAX_INTERESTS,
  PROFILE_COLORS,
  getCharacter,
} from '../data/avatars';
import { NAME_MAX_LENGTH, validateDisplayName } from '../utils/profile';
import { CharacterAvatar } from '../components/avatar/CharacterAvatar';
import { Avatar, AvatarSelector } from '../components/ui/AvatarPicker';
import { LevelBadge, XPBadge } from '../components/ui/Badges';
import { buttonClasses } from '../components/ui/Button';

type Step = 0 | 1 | 2;
const STEP_COUNT = 3;

function PillButton({ children, className = '', type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-white shadow-[0_8px_20px_rgb(14_127_89/0.28)] transition-colors hover:bg-forest active:scale-[0.99] disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="px-6" aria-label={`ขั้นตอนที่ ${step + 1} จาก ${STEP_COUNT}`} role="img">
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-forest/12'}`} />
        ))}
      </div>
    </div>
  );
}

interface HeaderProps {
  step: Step;
  onBack: () => void;
  onSkip?: () => void;
  title?: string;
}

function StepHeader({ step, onBack, onSkip, title }: HeaderProps) {
  return (
    <div className="safe-top">
      <div className="flex min-h-16 items-center justify-between gap-2 px-3 pt-2">
        <button type="button" onClick={onBack} aria-label="ย้อนกลับ" className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-forest shadow-card hover:bg-pale-mint">
          <ChevronLeft size={26} />
        </button>
        {title ? <h1 className="text-section font-bold text-forest">{title}</h1> : <span />}
        {onSkip ? (
          <button type="button" onClick={onSkip} className="min-h-11 rounded-full px-3 text-body font-semibold text-primary hover:bg-pale-mint">
            ข้าม
          </button>
        ) : (
          <span className="w-11" aria-hidden="true" />
        )}
      </div>
      <StepIndicator step={step} />
    </div>
  );
}

function Screen({ tone, children }: { tone: string; children: ReactNode }) {
  return <div className={`flex min-h-dvh flex-col ${tone}`}>{children}</div>;
}

function Body({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-6 pb-8"
    >
      {children}
    </motion.div>
  );
}

export function ProfileCreation() {
  const { profile, createProfile } = useGame();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [goals, setGoals] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_PROFILE_COLOR);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<'save-failed' | 'exists' | null>(null);
  const nameId = useId();
  const colorId = useId();
  const nameErrorId = useId();
  const countId = useId();

  if (profile && error !== 'exists') return <Navigate to="/home" replace />;

  const character = getCharacter(avatarId);
  const nameResult = validateDisplayName(name);
  const showNameError = touched && !nameResult.ok;
  const nameLength = [...name.trim()].length;

  const toggleGoal = (id: string) =>
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < MAX_INTERESTS ? [...prev, id] : prev));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!nameResult.ok) {
      document.getElementById(nameId)?.focus();
      return;
    }
    const result = createProfile({ name: nameResult.value, avatarId, goalIds: goals, profileColor: color });
    if (result === 'ok') navigate('/home', { replace: true });
    else setError(result);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === 0 && (
        <Screen key="avatar" tone="bg-meadow">
          <StepHeader step={0} onBack={() => navigate('/welcome')} onSkip={() => setStep(1)} />
          <Body>
            <h1 className="text-[1.875rem] leading-tight font-bold text-forest">เลือกอวาตาร์ของคุณ</h1>
            <p className="mt-1 text-body text-muted">ตัวละครนี้จะเดินทางไปกับคุณในทุกภารกิจ</p>

            <div className="relative mt-4 flex flex-1 items-end justify-center" style={{ minHeight: 300 }}>
              <svg className="absolute inset-x-[-24px] bottom-0 h-48 w-[calc(100%+48px)]" viewBox="0 0 400 190" preserveAspectRatio="none" aria-hidden="true">
                {[190, 140, 92].map((rx, i) => (
                  <ellipse key={rx} cx={200} cy={150} rx={rx} ry={rx * 0.27} fill="none" stroke="#A8F0CF" strokeWidth={i === 2 ? 6 : 2} opacity={i === 2 ? 0.95 : 0.7} />
                ))}
              </svg>
              <AnimatePresence mode="wait">
                <motion.div
                  key={avatarId}
                  initial={{ opacity: 0, y: 12, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', damping: 16, stiffness: 220 }}
                  className="relative mb-6 h-72 w-60"
                >
                  <CharacterAvatar look={character.look} className="h-full w-full" title={`อวาตาร์ ${character.name}`} />
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-2 mb-1 text-center text-body font-semibold">{character.name}</p>
            <AvatarSelector value={avatarId} onChange={setAvatarId} color={color} />
            <PillButton className="mt-5" onClick={() => setStep(1)}>ต่อไป</PillButton>
          </Body>
        </Screen>
      )}

      {step === 1 && (
        <Screen key="interests" tone="bg-surface">
          <StepHeader step={1} onBack={() => setStep(0)} onSkip={() => setStep(2)} />
          <Body>
            <h1 className="text-[1.875rem] leading-tight font-bold text-forest">
              เลือกเรื่องรักษ์โลก
              <br />
              ที่คุณสนใจ
            </h1>
            <p className="mt-1 text-body text-muted">เลือกได้สูงสุด {MAX_INTERESTS} หัวข้อ</p>

            <div className="mt-6 flex flex-wrap gap-2.5" role="group" aria-label="เรื่องที่สนใจ">
              {INTERESTS.map((interest) => {
                const active = goals.includes(interest.id);
                const blocked = !active && goals.length >= MAX_INTERESTS;
                return (
                  <motion.button
                    key={interest.id}
                    type="button"
                    layout
                    whileTap={blocked ? undefined : { scale: 0.95 }}
                    aria-pressed={active}
                    aria-disabled={blocked}
                    onClick={() => !blocked && toggleGoal(interest.id)}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-body font-medium text-text transition-colors ${
                      active ? `${interest.tone} ring-2 ring-primary` : 'bg-background ring-1 ring-border hover:bg-pale-mint'
                    } ${blocked ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    {interest.label}
                    {active ? <Check size={18} strokeWidth={2.6} aria-hidden="true" /> : <Plus size={18} strokeWidth={2.4} aria-hidden="true" />}
                  </motion.button>
                );
              })}
            </div>

            <p className="mt-5 text-caption text-muted" aria-live="polite">
              เลือกแล้ว {goals.length}/{MAX_INTERESTS}
              {goals.length >= MAX_INTERESTS && ' · ครบจำนวนแล้ว แตะหัวข้อที่เลือกเพื่อยกเลิก'}
            </p>
            <p className="mt-1 text-caption text-muted">ภารกิจในหมวดที่คุณเลือกจะแสดงก่อนในหน้าหลัก เปลี่ยนได้ภายหลังในหน้าตั้งค่า</p>

            <PillButton className="mt-auto" onClick={() => setStep(2)}>ต่อไป</PillButton>
          </Body>
        </Screen>
      )}

      {step === 2 && (
        <Screen key="details" tone="bg-pale-mint">
          <StepHeader step={2} onBack={() => setStep(1)} title="ข้อมูลโปรไฟล์" />
          <Body>
            <form noValidate onSubmit={submit} className="flex flex-1 flex-col">
              <div className="flex flex-col items-center">
                <div className="relative rounded-full bg-surface p-2.5 shadow-card ring-4 ring-mint/70">
                  <Avatar id={avatarId} color={color} size="xl" />
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    aria-label="เปลี่ยนอวาตาร์"
                    className="absolute right-1 bottom-2 flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-primary text-white hover:bg-forest"
                  >
                    <Pencil size={17} />
                  </button>
                </div>
                <div className="mt-3 text-center" aria-live="polite">
                  <p className={`text-section font-semibold ${nameResult.ok ? '' : 'text-muted'}`}>
                    {nameResult.ok ? nameResult.value : 'ชื่อของคุณ'}
                  </p>
                  <div className="mt-1 flex justify-center gap-1.5">
                    <LevelBadge level={1} />
                    <XPBadge amount={0} />
                  </div>
                </div>
              </div>

              <label htmlFor={nameId} className="mt-6 mb-1.5 block text-caption font-medium">ชื่อผู้เล่น</label>
              <input
                id={nameId}
                type="text"
                autoComplete="nickname"
                value={name}
                maxLength={NAME_MAX_LENGTH + 10}
                placeholder="เช่น นักรักษ์โลก"
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name.length > 0 && setTouched(true)}
                aria-invalid={showNameError}
                aria-describedby={`${countId}${showNameError ? ` ${nameErrorId}` : ''}`}
                className={`min-h-14 w-full rounded-2xl border border-border bg-surface px-4 text-base placeholder:text-muted focus:outline-none focus:ring-2 ${
                  showNameError ? 'ring-2 ring-danger focus:ring-danger' : 'focus:ring-primary'
                }`}
              />
              <div className="mt-1 flex justify-between gap-3 px-1 text-caption">
                <span id={nameErrorId} className="text-danger" role={showNameError ? 'alert' : undefined}>
                  {showNameError && !nameResult.ok ? nameResult.error : ''}
                </span>
                <span id={countId} className={nameLength > NAME_MAX_LENGTH ? 'text-danger' : 'text-muted'}>
                  {nameLength}/{NAME_MAX_LENGTH}
                </span>
              </div>

              <label htmlFor={colorId} className="mt-4 mb-1.5 block text-caption font-medium">สีโปรไฟล์</label>
              <div className="relative">
                <select
                  id={colorId}
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="min-h-14 w-full appearance-none rounded-2xl border border-border bg-surface pr-12 pl-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PROFILE_COLORS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={20} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" aria-hidden="true" />
              </div>

              {error === 'save-failed' && (
                <div role="alert" className="mt-5 flex items-start gap-2 rounded-2xl bg-surface p-3 text-caption">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
                  <p>
                    <span className="font-semibold text-danger">บันทึกโปรไฟล์ไม่สำเร็จ</span> เบราว์เซอร์อาจปิดการเก็บข้อมูลไว้
                    (เช่น โหมดไม่ระบุตัวตน หรือพื้นที่เต็ม) กรุณาตรวจสอบแล้วลองอีกครั้ง
                  </p>
                </div>
              )}
              {error === 'exists' && (
                <div role="alert" className="mt-5 rounded-2xl bg-surface p-3 text-caption">
                  <p>
                    <span className="font-semibold">เครื่องนี้มีโปรไฟล์อยู่แล้ว</span> โหมดเดโมในเครื่องรองรับหนึ่งโปรไฟล์
                  </p>
                  <Link to="/home" replace className={`${buttonClasses('secondary', 'md', true)} mt-3`}>ไปหน้าหลัก</Link>
                </div>
              )}

              <div className="mt-auto pt-8">
                <PillButton type="submit">เริ่มภารกิจแรก</PillButton>
                <p className="mt-3 text-center text-caption text-muted">ไม่ต้องสมัครบัญชี ข้อมูลเก็บในเครื่องนี้เท่านั้น</p>
              </div>
            </form>
          </Body>
        </Screen>
      )}
    </AnimatePresence>
  );
}

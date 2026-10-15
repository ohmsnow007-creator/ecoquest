import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles, Globe2, BookOpen } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { AVATARS, GOAL_OPTIONS } from '../data/icons';
import { EcoMascot } from '../components/ui/EcoMascot';
import { AvatarPicker } from '../components/ui/AvatarPicker';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';

const FEATURES = [
  { icon: Sparkles, text: 'ทำภารกิจรักษ์โลก สะสม XP และเลื่อนเลเวล' },
  { icon: Globe2, text: 'ดูโลกเสมือนของคุณเติบโตตามความตั้งใจ' },
  { icon: BookOpen, text: 'เรียนรู้เรื่องสิ่งแวดล้อมผ่านควิซสั้น ๆ' },
];

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`ขั้นตอนที่ ${step + 1} จาก 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-2 bg-border'}`} />
      ))}
    </div>
  );
}

export function Welcome() {
  const { createProfile } = useGame();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [goals, setGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) =>
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const handleStart = () => {
    createProfile(name.trim() || 'นักสำรวจ', avatar, goals);
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-mint/60 px-6 pt-12 pb-20 lg:min-h-dvh lg:pb-12">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-lime/70" aria-hidden="true" />
        <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald/20" aria-hidden="true" />
        <div className="relative mb-2 rounded-card bg-surface px-5 py-3 text-center shadow-card">
          <p className="text-body font-medium">
            สวัสดี! ฉันชื่อ Sprouty
            <br />
            มาช่วยกันดูแล<span className="font-semibold text-primary">โลกสีเขียว</span>กันนะ
          </p>
          <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-surface" aria-hidden="true" />
        </div>
        <EcoMascot size={200} mood={step === 2 ? 'cheer' : 'happy'} float className="relative" />
      </div>

      {/* Content */}
      <div className="relative -mt-10 flex justify-center px-4 pb-10 lg:mt-0 lg:items-center lg:px-12">
        <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-raised lg:shadow-none lg:bg-transparent">
          <div className="mb-5 flex justify-center lg:justify-start">
            <StepDots step={step} />
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <p className="text-caption font-semibold text-primary">EcoQuest · ภารกิจพิชิตโลกสีเขียว</p>
                <h1 className="mt-1 text-page font-bold lg:text-[2.25rem]">ปลูกนิสัยดีวันนี้ เพื่อโลกที่ดีกว่าในวันหน้า</h1>
                <ul className="mt-5 space-y-3">
                  {FEATURES.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3 text-body">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
                <PrimaryButton size="lg" fullWidth className="mt-7" iconRight={<ArrowRight size={18} />} onClick={() => setStep(1)}>
                  เริ่มต้นใช้งาน
                </PrimaryButton>
                <p className="mt-3 text-center text-caption text-muted">ข้อมูลทั้งหมดเก็บไว้ในเครื่องของคุณเท่านั้น ไม่ต้องสมัครสมาชิก</p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h2 className="text-page font-bold">ตั้งชื่อนักสำรวจ</h2>
                <p className="mt-1 text-body text-muted">เลือกอวาตาร์และชื่อที่จะแสดงในแอป</p>
                <div className="mt-5">
                  <AvatarPicker value={avatar} onChange={setAvatar} />
                </div>
                <label htmlFor="player-name" className="mt-5 mb-1.5 block text-caption font-semibold">ชื่อของคุณ</label>
                <input
                  id="player-name"
                  type="text"
                  placeholder="เช่น นักรักษ์โลก"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="min-h-12 w-full rounded-control border border-border bg-surface px-4 text-body placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-caption text-muted">หากเว้นว่างไว้ ระบบจะใช้ชื่อ "นักสำรวจ"</p>
                <div className="mt-6 flex gap-3">
                  <SecondaryButton className="flex-1" onClick={() => setStep(0)}>ย้อนกลับ</SecondaryButton>
                  <PrimaryButton className="flex-1" onClick={() => setStep(2)}>ถัดไป</PrimaryButton>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h2 className="text-page font-bold">เลือกเป้าหมาย</h2>
                <p className="mt-1 text-body text-muted">เลือกได้หลายข้อ หรือข้ามขั้นตอนนี้ก็ได้</p>
                <div className="mt-5 space-y-2" role="group" aria-label="เป้าหมาย">
                  {GOAL_OPTIONS.map(({ id, label, icon: Icon }) => {
                    const active = goals.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleGoal(id)}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-control border-2 px-4 text-left text-body transition-colors ${
                          active ? 'border-primary bg-primary/10 font-semibold' : 'border-border bg-surface hover:border-primary/40'
                        }`}
                      >
                        <Icon size={20} className="text-primary" aria-hidden="true" />
                        <span className="flex-1">{label}</span>
                        {active && <Check size={18} className="text-primary" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex gap-3">
                  <SecondaryButton className="flex-1" onClick={() => setStep(1)}>ย้อนกลับ</SecondaryButton>
                  <PrimaryButton className="flex-1" onClick={handleStart}>เริ่มผจญภัย</PrimaryButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

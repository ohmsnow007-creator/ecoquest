import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Clock, Sparkles, Play, ArrowLeft, ArrowRight, Send, X, Check, Recycle, Zap, Droplets, Cloud, Leaf, Layers, Trophy, History, ChevronRight, AlertCircle, Timer, type LucideIcon } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { quizzes, getQuestion, QUIZ_CATEGORY_LABELS, QUIZ_DIFFICULTY_LABELS, QUIZ_SET_SIZE, MINUTES_PER_QUESTION } from '../data/quizzes';
import { QUIZ_XP_BY_DIFFICULTY, correctlyAnsweredIds, type QuizDraft } from '../services/rewardService';
import type { QuizCategory, QuizDifficulty } from '../types';
import { createId } from '../utils/id';
import { PlayerSprouty } from '../components/sprouty/PlayerSprouty';
import { bestTimedRun } from '../utils/timedQuiz';
import { SegmentedControl } from '../components/ui/Controls';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';

type CategoryFilter = QuizCategory | 'all';
type DifficultyFilter = QuizDifficulty | 'all';

const CATEGORY_META: Record<CategoryFilter, { icon: LucideIcon; tone: string }> = {
  all: { icon: Layers, tone: 'bg-mint text-forest' },
  waste: { icon: Recycle, tone: 'bg-mint text-forest' },
  energy: { icon: Zap, tone: 'bg-tag-yellow text-forest' },
  water: { icon: Droplets, tone: 'bg-tag-sky text-forest' },
  carbon: { icon: Cloud, tone: 'bg-tag-lavender text-forest' },
  lifestyle: { icon: Leaf, tone: 'bg-tag-peach text-forest' },
};
const CATEGORIES: CategoryFilter[] = ['all', 'waste', 'energy', 'water', 'carbon', 'lifestyle'];
const isCategory = (v: string | null): v is CategoryFilter => CATEGORIES.includes(v as CategoryFilter);

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function QuizHero() {
  return (
    <div className="relative h-44 overflow-hidden rounded-hero bg-pale-mint ring-1 ring-mint sm:h-52" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        <circle cx={340} cy={40} r={26} fill="#FFC93C" opacity={0.9} />
        <path d="M-10 160 C60 130 140 136 200 152 C260 134 330 132 410 150 L410 200 L-10 200Z" className="fill-emerald" opacity={0.6} />
        <path d="M-10 180 C90 164 220 168 410 176 L410 200 L-10 200Z" className="fill-primary" />
        {[
          [70, 60, 0.9],
          [300, 100, 0.7],
          [110, 120, 0.6],
        ].map(([x, y, s]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r={18} fill="#FFFFFF" />
            <text textAnchor="middle" dy={8} fontSize={24} fontWeight={700} className="fill-primary">?</text>
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-2 flex justify-center">
        <span className="block w-32"><PlayerSprouty size={128} mood="happy" /></span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-3 text-center shadow-card">
      <p className="flex items-center justify-center gap-1 text-card leading-tight font-bold whitespace-nowrap sm:text-section">
        <Icon size={17} className="text-primary" aria-hidden="true" /> {value}
      </p>
      <p className="mt-0.5 text-[0.75rem] text-muted">{label}</p>
    </div>
  );
}

export function Quiz() {
  const { progress, submitQuizAttempt } = useGame();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [category, setCategory] = useState<CategoryFilter>(isCategory(params.get('category')) ? (params.get('category') as CategoryFilter) : 'all');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [draft, setDraft] = useState<QuizDraft | null>(null);
  const [index, setIndex] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solved = useMemo(() => correctlyAnsweredIds(progress), [progress]);
  const pool = quizzes.filter((q) => (category === 'all' || q.category === category) && (difficulty === 'all' || q.difficulty === difficulty));
  const setSize = Math.min(QUIZ_SET_SIZE, pool.length);
  const bestTimed = bestTimedRun(progress.timedRuns);
  const maxXp = pool
    .filter((q) => !solved.has(q.id))
    .map((q) => QUIZ_XP_BY_DIFFICULTY[q.difficulty])
    .sort((a, b) => b - a)
    .slice(0, setSize)
    .reduce((s, x) => s + x, 0);
  const attempts = [...progress.quizAttempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const best = attempts.filter((a) => !a.legacy).reduce((m, a) => Math.max(m, a.scorePercent), 0);
  const countIn = (c: CategoryFilter) => quizzes.filter((q) => (c === 'all' || q.category === c) && (difficulty === 'all' || q.difficulty === difficulty)).length;

  const start = () => {
    if (setSize === 0) return;
    // Questions not yet answered correctly come first, so a new set is useful for learning.
    const ordered = [...shuffle(pool.filter((q) => !solved.has(q.id))), ...shuffle(pool.filter((q) => solved.has(q.id)))];
    setDraft({ id: createId(), startedAt: new Date().toISOString(), category, difficulty, questionIds: ordered.slice(0, setSize).map((q) => q.id), answers: {} });
    setIndex(0);
    setError(null);
  };

  const submit = () => {
    if (!draft || submitting) return;
    setSubmitting(true);
    const result = submitQuizAttempt(draft);
    if (result.ok) {
      navigate(`/quiz/result?attempt=${encodeURIComponent(result.attemptId)}`);
      return;
    }
    setSubmitting(false);
    if (result.reason === 'duplicate') navigate(`/quiz/result?attempt=${encodeURIComponent(draft.id)}`);
    else setError(result.reason === 'save-failed' ? 'บันทึกผลไม่สำเร็จ ยังไม่ได้รับ XP กรุณาลองอีกครั้ง' : 'ชุดคำถามไม่ถูกต้อง กรุณาเริ่มใหม่');
  };

  if (draft) {
    const q = getQuestion(draft.questionIds[index])!;
    const total = draft.questionIds.length;
    const selected = draft.answers[q.id];
    const last = index === total - 1;
    const answeredCount = Object.keys(draft.answers).length;
    const Icon = CATEGORY_META[q.category].icon;

    return (
      <div className="mx-auto max-w-2xl pb-6">
        <header className="safe-top flex items-center justify-between gap-3 pt-5 pb-3 lg:pt-10">
          <SecondaryButton icon={<X size={16} />} onClick={() => setConfirmExit(true)}>ออก</SecondaryButton>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pale-mint px-3 py-1 text-caption font-medium text-primary">
            <Icon size={14} aria-hidden="true" /> {QUIZ_CATEGORY_LABELS[q.category]} · {QUIZ_DIFFICULTY_LABELS[q.difficulty]}
          </span>
        </header>

        <p className="text-caption font-semibold text-muted" aria-live="polite">ข้อ {index + 1} จาก {total}</p>
        <div className="mt-1.5">
          <ProgressBar value={(index + 1) / total} label="ความคืบหน้าแบบทดสอบ" valueText={`ข้อ ${index + 1} จาก ${total} · ตอบแล้ว ${answeredCount} ข้อ`} />
        </div>

        {/* No exit animation: the previous question must never stay on screen (or clickable) after moving on. */}
        <motion.fieldset key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="mt-5">
            <legend className="text-section leading-snug font-bold text-forest">{q.question}</legend>
            <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="ตัวเลือกคำตอบ">
              {q.options.map((opt) => {
                const isSel = selected === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-body transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                      isSel ? 'border-primary bg-pale-mint font-semibold text-forest shadow-card' : 'border-border bg-surface hover:border-primary/40 hover:bg-pale-mint/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.id}
                      checked={isSel}
                      onChange={() => setDraft({ ...draft, answers: { ...draft.answers, [q.id]: opt.id } })}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-caption font-bold uppercase ${isSel ? 'border-primary bg-primary text-white' : 'border-border bg-background text-muted'}`}
                      aria-hidden="true"
                    >
                      {isSel ? <Check size={16} strokeWidth={3} /> : opt.id}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {isSel && <span className="text-caption font-semibold text-primary">เลือกแล้ว</span>}
                  </label>
                );
              })}
            </div>
        </motion.fieldset>

        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-control border border-danger/30 bg-danger/5 p-3 text-caption">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" /> {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <SecondaryButton icon={<ArrowLeft size={16} />} disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>ก่อนหน้า</SecondaryButton>
          {last ? (
            <PrimaryButton className="flex-1 rounded-full" icon={<Send size={16} />} disabled={!selected || submitting} onClick={submit}>
              {submitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
            </PrimaryButton>
          ) : (
            <PrimaryButton className="flex-1 rounded-full" iconRight={<ArrowRight size={16} />} disabled={!selected} onClick={() => setIndex((i) => i + 1)}>
              ถัดไป
            </PrimaryButton>
          )}
        </div>
        {!selected && <p className="mt-2 text-center text-caption text-muted">เลือกคำตอบก่อนไปข้อถัดไป</p>}

        <ConfirmationDialog
          open={confirmExit}
          title="ออกจากแบบทดสอบ?"
          description="คำตอบในชุดนี้จะไม่ถูกบันทึก และจะไม่ได้รับ XP"
          confirmLabel="ออก"
          cancelLabel="ทำต่อ"
          tone="danger"
          onConfirm={() => {
            setConfirmExit(false);
            setDraft(null);
          }}
          onCancel={() => setConfirmExit(false)}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 pt-5 pb-2 lg:grid-cols-3 lg:gap-6 lg:pt-10">
      <div className="space-y-5 lg:col-span-2">
        <QuizHero />
        <header>
          <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">Eco Quiz</h1>
          <p className="text-body text-muted">ทดสอบความรู้ เพื่อโลกที่ดีกว่า</p>
        </header>

        <section aria-label="ข้อมูลแบบทดสอบ" className="grid grid-cols-3 gap-2.5">
          <Stat icon={Brain} value={`${setSize} ข้อ`} label="จำนวนคำถาม" />
          <Stat icon={Clock} value={`${setSize * MINUTES_PER_QUESTION} นาที`} label="เวลาประมาณ" />
          <Stat icon={Sparkles} value={`+${maxXp} XP`} label="รางวัลสูงสุด" />
        </section>

        <section aria-labelledby="cat-title">
          <h2 id="cat-title" className="mb-2 text-section font-bold text-forest">หมวดหมู่ที่ออกสอบ</h2>
          <div role="radiogroup" aria-labelledby="cat-title" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_META[c];
              const n = countIn(c);
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={category === c}
                  onClick={() => setCategory(c)}
                  className={`flex min-h-14 items-center gap-2.5 rounded-2xl border-2 px-3 py-2 text-left transition-colors ${
                    category === c ? 'border-primary bg-pale-mint' : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.tone}`} aria-hidden="true">
                    <meta.icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-caption leading-tight font-semibold">{c === 'all' ? 'ทุกหมวด' : QUIZ_CATEGORY_LABELS[c]}</span>
                    <span className="block text-[0.75rem] text-muted">{n} ข้อ</span>
                  </span>
                  {category === c && <Check size={16} className="shrink-0 text-primary" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="diff-title">
          <h2 id="diff-title" className="mb-2 text-section font-bold text-forest">ระดับความยาก</h2>
          <SegmentedControl
            ariaLabel="ระดับความยาก"
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'all', label: 'ทั้งหมด' },
              { value: 'easy', label: 'ง่าย' },
              { value: 'medium', label: 'ปานกลาง' },
              { value: 'hard', label: 'ยาก' },
            ]}
          />
        </section>

        <div>
          <PrimaryButton size="lg" fullWidth className="rounded-full" icon={<Play size={18} />} disabled={setSize === 0} onClick={start}>
            เริ่มทำแบบทดสอบ
          </PrimaryButton>
          <p className="mt-2 text-center text-caption text-muted">
            {setSize === 0
              ? 'ไม่มีคำถามในหมวดและระดับนี้ ลองเลือกเงื่อนไขอื่น'
              : `ได้ XP เฉพาะข้อที่ตอบถูกเป็นครั้งแรก (ง่าย ${QUIZ_XP_BY_DIFFICULTY.easy} · ปานกลาง ${QUIZ_XP_BY_DIFFICULTY.medium} · ยาก ${QUIZ_XP_BY_DIFFICULTY.hard} XP) ทำซ้ำได้ไม่จำกัด`}
          </p>
        </div>

        <Link
          to="/quiz/timed"
          className="flex items-center gap-3 rounded-card border border-warning/40 bg-tag-yellow/60 p-4 shadow-card hover:border-warning"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-lime" aria-hidden="true">
            <Timer size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body font-bold text-forest">ควิซจับเวลา 60 วินาที</span>
            <span className="block text-caption text-muted">
              ตอบให้ถูกมากที่สุด · สถิติดีที่สุด {bestTimed ? `${bestTimed.correct} ข้อ` : 'ยังไม่มี'}
            </span>
          </span>
          <ChevronRight size={18} className="text-muted" aria-hidden="true" />
        </Link>
      </div>

      <aside className="space-y-5">
        <section aria-labelledby="mystats-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
          <h2 id="mystats-title" className="text-section font-bold text-forest">สถิติของคุณ</h2>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-[0.75rem] text-muted">คะแนนสูงสุด</dt>
              <dd className="text-section font-bold">{best}%</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] text-muted">ทำไปแล้ว</dt>
              <dd className="text-section font-bold">{attempts.length} ครั้ง</dd>
            </div>
            <div>
              <dt className="text-[0.75rem] text-muted">ข้อที่ตอบถูก</dt>
              <dd className="text-section font-bold">{solved.size}/{quizzes.length}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="hist-title">
          <h2 id="hist-title" className="mb-2 flex items-center gap-2 text-section font-bold text-forest">
            <History size={18} className="text-primary" aria-hidden="true" /> ประวัติการทำแบบทดสอบ
          </h2>
          {attempts.length === 0 ? (
            <p className="rounded-card border border-border bg-surface p-4 text-body text-muted">ยังไม่มีประวัติ ลองทำแบบทดสอบชุดแรกดูสิ</p>
          ) : (
            <ul className="space-y-2">
              {attempts.slice(0, 8).map((a) => (
                <li key={a.id}>
                  <Link to={`/quiz/result?attempt=${encodeURIComponent(a.id)}`} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card hover:border-primary/40">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-caption font-bold text-forest">{a.scorePercent}%</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-medium">
                        {a.legacy ? 'ควิซแบบเดิม' : a.category === 'all' ? 'ทุกหมวด' : QUIZ_CATEGORY_LABELS[a.category]} · ถูก {a.correctCount}/{a.total}
                      </span>
                      <span className="block text-caption text-muted">
                        {new Date(a.submittedAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · +{a.xpAwarded} XP
                      </span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="flex items-start gap-2 px-1 text-caption text-muted">
          <Trophy size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          ข้อที่อ้างอิงข้อมูลตัวเลขมีแหล่งที่มากำกับในเฉลย
        </p>
      </aside>
    </div>
  );
}

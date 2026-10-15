import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Brain, LogOut, ArrowRight } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { quizzes, type QuizQuestion } from '../data/quizzes';
import { CATEGORY_LABELS } from '../types';
import type { MissionCategory } from '../types';
import { CATEGORY_ICON, CATEGORY_ORDER } from '../data/icons';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { FilterChips, type ChipOption } from '../components/ui/Controls';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { XPBadge } from '../components/ui/Badges';
import { EcoMascot } from '../components/ui/EcoMascot';
import { EmptyState } from '../components/ui/States';

type View = 'list' | 'playing' | 'result';
type Filter = MissionCategory | 'all';

const CHIPS: ChipOption<Filter>[] = [
  { value: 'all', label: 'ทั้งหมด' },
  ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c], icon: CATEGORY_ICON[c] })),
];

const SESSION_SIZE = 5;

export function Quiz() {
  const { completeQuiz, isQuizCompleted, progress } = useGame();
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('list');
  const [set, setSet] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [result, setResult] = useState({ correct: 0, total: 0, xp: 0 });

  const filtered = useMemo(() => (filter === 'all' ? quizzes : quizzes.filter((q) => q.category === filter)), [filter]);
  const available = filtered.filter((q) => !isQuizCompleted(q.id));
  const records = progress.quizCompletions ?? [];
  const answeredCount = records.length;
  const correctCount = records.filter((r) => r.correct).length;

  const start = () => {
    if (available.length === 0) return;
    setSet([...available].sort(() => Math.random() - 0.5).slice(0, SESSION_SIZE));
    setIndex(0);
    setAnswer(null);
    setResult({ correct: 0, total: 0, xp: 0 });
    setView('playing');
  };

  const choose = (i: number) => {
    if (answer !== null) return;
    const q = set[index];
    const correct = i === q.correctIndex;
    setAnswer(i);
    completeQuiz(q.id, correct, q.xp);
    setResult((r) => ({ correct: r.correct + (correct ? 1 : 0), total: r.total + 1, xp: r.xp + (correct ? q.xp : 0) }));
  };

  const next = () => {
    if (index < set.length - 1) {
      setIndex((i) => i + 1);
      setAnswer(null);
    } else {
      setView('result');
    }
  };

  if (view === 'playing' && set.length > 0) {
    const q = set[index];
    const isCorrect = answer === q.correctIndex;
    const CatIcon = CATEGORY_ICON[q.category];

    return (
      <div className="mx-auto max-w-2xl">
        <header className="safe-top flex items-center justify-between gap-3 pt-5 pb-4 lg:pt-10">
          <SecondaryButton icon={<LogOut size={16} />} onClick={() => setView('list')}>ออกจากควิซ</SecondaryButton>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-caption font-medium text-primary">
            <CatIcon size={14} aria-hidden="true" /> {CATEGORY_LABELS[q.category]}
          </span>
        </header>

        <ProgressBar
          value={(index + (answer !== null ? 1 : 0)) / set.length}
          label="ความคืบหน้าควิซ"
          showLabel
          valueText={`ข้อ ${index + 1} จาก ${set.length}`}
        />

        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
            <Card className="mt-4">
              <p className="text-section font-semibold">{q.question}</p>
            </Card>

            <div className="mt-4 space-y-2" role="group" aria-label="ตัวเลือกคำตอบ">
              {q.choices.map((choice, i) => {
                let state = 'border-border bg-surface hover:border-primary/40';
                if (answer !== null) {
                  if (i === q.correctIndex) state = 'border-success bg-success/10';
                  else if (i === answer) state = 'border-danger bg-danger/10';
                  else state = 'border-border bg-surface opacity-60';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={answer !== null}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-control border-2 px-4 py-3 text-left text-body transition-colors disabled:cursor-default ${state}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-caption font-semibold" aria-hidden="true">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 font-medium">{choice}</span>
                    {answer !== null && i === q.correctIndex && <CheckCircle2 size={20} className="text-success" aria-label="คำตอบที่ถูก" />}
                    {answer !== null && i === answer && !isCorrect && <XCircle size={20} className="text-danger" aria-label="คำตอบของคุณ" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {answer !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4" aria-live="polite">
                  <div className={`rounded-card border p-4 ${isCorrect ? 'border-success/40 bg-success/10' : 'border-danger/30 bg-danger/5'}`}>
                    <p className={`flex items-center gap-2 text-card font-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                      {isCorrect ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
                      {isCorrect ? 'ถูกต้อง!' : 'ยังไม่ถูก'}
                      {isCorrect && <XPBadge amount={q.xp} plus className="ml-1" />}
                    </p>
                    <p className="mt-1 text-body">{q.explanation}</p>
                  </div>
                  <PrimaryButton size="lg" fullWidth className="mt-4" iconRight={<ArrowRight size={18} />} onClick={next}>
                    {index < set.length - 1 ? 'ข้อถัดไป' : 'ดูผลลัพธ์'}
                  </PrimaryButton>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (view === 'result') {
    const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
    return (
      <div className="mx-auto max-w-md pt-8 text-center lg:pt-16">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }} className="flex justify-center">
          <EcoMascot size={148} mood={pct >= 60 ? 'cheer' : 'calm'} title="Sprouty กับผลควิซของคุณ" />
        </motion.div>
        <h1 className="mt-3 text-page font-bold">{pct >= 80 ? 'ยอดเยี่ยม!' : pct >= 60 ? 'ทำได้ดีมาก!' : 'เรียนรู้เพิ่มอีกนิดนะ'}</h1>
        <p className="mt-1 text-body text-muted">ตอบถูก {result.correct} จาก {result.total} ข้อ ({pct}%)</p>
        <Card className="mt-6">
          <p className="text-caption text-muted">XP ที่ได้จากชุดนี้</p>
          <p className="mt-1 text-[2rem] leading-tight font-bold text-primary">+{result.xp} XP</p>
          <p className="mt-1 text-caption text-muted">ได้ XP เฉพาะข้อที่ตอบถูก และแต่ละข้อทำได้ครั้งเดียว</p>
        </Card>
        <PrimaryButton size="lg" fullWidth className="mt-6" onClick={() => setView('list')}>กลับหน้าควิซ</PrimaryButton>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="ควิซสิ่งแวดล้อม"
        subtitle="ทดสอบความรู้ รับ XP เมื่อตอบถูก แต่ละข้อทำได้ครั้งเดียว"
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-caption font-semibold text-white">
            <Brain size={14} className="text-lime" aria-hidden="true" /> ถูก {correctCount}/{quizzes.length}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FilterChips options={CHIPS} value={filter} onChange={setFilter} ariaLabel="กรองควิซตามหมวดหมู่" />

          <ul className="space-y-2">
            {filtered.map((q) => {
              const record = records.find((r) => r.quizId === q.id);
              const Icon = CATEGORY_ICON[q.category];
              return (
                <li key={q.id} className="flex items-start gap-3 rounded-card border border-border bg-surface p-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${
                      !record ? 'bg-primary/10 text-primary' : record.correct ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {!record ? <Icon size={18} aria-hidden="true" /> : record.correct ? <CheckCircle2 size={18} aria-label="ตอบถูก" /> : <XCircle size={18} aria-label="ตอบผิด" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium">{q.question}</p>
                    <p className="mt-0.5 text-caption text-muted">
                      {CATEGORY_LABELS[q.category]}
                      {!record && ` · ${q.xp} XP`}
                      {record?.correct && ` · ได้ ${record.xpAwarded} XP`}
                      {record && !record.correct && ' · ตอบผิด ไม่ได้ XP'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="order-first lg:order-none lg:sticky lg:top-6 lg:self-start">
          <Card tone="forest">
            {available.length > 0 ? (
              <>
                <p className="text-caption text-white/70">{filter === 'all' ? 'ทุกหมวดหมู่' : CATEGORY_LABELS[filter]}</p>
                <p className="mt-1 text-section font-semibold">เหลือ {available.length} ข้อที่ยังไม่ได้ทำ</p>
                <p className="mt-1 text-caption text-white/70">สุ่มครั้งละไม่เกิน {SESSION_SIZE} ข้อ</p>
                <PrimaryButton tone="onDark" size="lg" fullWidth className="mt-4" icon={<Brain size={18} />} onClick={start}>
                  เริ่มทำควิซ
                </PrimaryButton>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle2 size={28} className="mx-auto text-lime" aria-hidden="true" />
                <p className="mt-2 text-card font-semibold">ทำครบทุกข้อในหมวดนี้แล้ว</p>
                <p className="mt-1 text-caption text-white/70">ลองเลือกหมวดหมู่อื่นด้านล่าง</p>
              </div>
            )}
            <div className="mt-5">
              <ProgressBar value={answeredCount / quizzes.length} label="ทำควิซไปแล้ว" tone="lime" onDark showLabel valueText={`${answeredCount}/${quizzes.length} ข้อ`} />
            </div>
          </Card>
          {filtered.length === 0 && <EmptyState title="ยังไม่มีควิซในหมวดนี้" />}
        </aside>
      </div>
    </>
  );
}

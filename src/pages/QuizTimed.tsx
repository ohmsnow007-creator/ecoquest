import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Timer, Play, RotateCcw, Trophy, Check, X } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { bestTimedRun, shuffledQuestions, TIMED_QUIZ_SECONDS } from '../utils/timedQuiz';
import type { QuizQuestion } from '../data/quizzes';
import { PlayerSprouty } from '../components/sprouty/PlayerSprouty';
import { PrimaryButton, SecondaryButton, buttonClasses } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

type Phase = 'ready' | 'playing' | 'done';
const FEEDBACK_MS = 450;

export function QuizTimed() {
  const { progress, saveTimedRun } = useGame();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('ready');
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [left, setLeft] = useState(TIMED_QUIZ_SECONDS * 1000);
  const [feedback, setFeedback] = useState<{ chosen: string; right: boolean } | null>(null);
  const [result, setResult] = useState<{ correct: number; answered: number; newBest: boolean; prevBest: number | null } | null>(null);
  const endAt = useRef(0);
  const saved = useRef(false);
  const score = useRef({ correct: 0, answered: 0 });

  const best = bestTimedRun(progress.timedRuns);
  const q = deck[index % Math.max(deck.length, 1)];

  const start = () => {
    setDeck(shuffledQuestions());
    setIndex(0);
    setCorrect(0);
    setAnswered(0);
    score.current = { correct: 0, answered: 0 };
    setFeedback(null);
    setResult(null);
    saved.current = false;
    endAt.current = Date.now() + TIMED_QUIZ_SECONDS * 1000;
    setLeft(TIMED_QUIZ_SECONDS * 1000);
    setPhase('playing');
  };

  // Clock: based on the end time, so a slow device never gives extra seconds.
  useEffect(() => {
    if (phase !== 'playing') return;
    const tick = () => {
      const remaining = Math.max(0, endAt.current - Date.now());
      setLeft(remaining);
      if (remaining === 0 && !saved.current) {
        saved.current = true;
        const { correct: c, answered: a } = score.current;
        const prevBest = bestTimedRun(progress.timedRuns)?.correct ?? null;
        saveTimedRun(c, a);
        setResult({ correct: c, answered: a, newBest: c > 0 && (prevBest === null || c > prevBest), prevBest });
        setPhase('done');
      }
    };
    tick();
    const t = setInterval(tick, 100);
    return () => clearInterval(t);
  }, [phase, progress.timedRuns, saveTimedRun]);

  const choose = (optionId: string) => {
    if (!q || feedback || phase !== 'playing') return;
    const right = optionId === q.correctAnswerId;
    score.current = { correct: score.current.correct + (right ? 1 : 0), answered: score.current.answered + 1 };
    setCorrect(score.current.correct);
    setAnswered(score.current.answered);
    setFeedback({ chosen: optionId, right });
    setTimeout(() => {
      setFeedback(null);
      setIndex((i) => {
        const nextI = i + 1;
        if (nextI % deck.length === 0) setDeck(shuffledQuestions());
        return nextI;
      });
    }, reduce ? 150 : FEEDBACK_MS);
  };

  const seconds = Math.ceil(left / 1000);

  return (
    <div className="mx-auto max-w-xl pb-6">
      <header className="safe-top flex items-center gap-3 pt-5 pb-3 lg:pt-10">
        <Link to="/quiz" aria-label="กลับไปหน้าควิซ" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface shadow-card">
          <ArrowLeft size={19} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-page leading-tight font-bold text-forest">ควิซจับเวลา</h1>
          <p className="text-caption text-muted">ตอบให้ถูกมากที่สุดใน {TIMED_QUIZ_SECONDS} วินาที</p>
        </div>
      </header>

      {phase === 'ready' && (
        <section className="rounded-hero border border-mint bg-surface p-5 text-center shadow-card">
          <span className="mx-auto block w-32">
            <PlayerSprouty size={128} mood="happy" />
          </span>
          <h2 className="mt-2 text-section font-bold text-forest">พร้อมไหม? เริ่มนับทันทีที่กด!</h2>
          <ul className="mx-auto mt-3 max-w-xs space-y-1 text-left text-caption text-muted">
            <li>• คำถามสุ่มจากทุกหมวด ตอบแล้วไปข้อถัดไปทันที</li>
            <li>• นับเฉพาะข้อที่ตอบถูก ตอบผิดไม่หักคะแนน</li>
            <li>• โหมดนี้ไม่ให้ XP แต่จะเก็บสถิติดีที่สุดของคุณ</li>
          </ul>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-tag-yellow px-3 py-1 text-caption font-semibold text-forest">
            <Trophy size={14} aria-hidden="true" /> สถิติดีที่สุด: {best ? `${best.correct} ข้อ` : 'ยังไม่มี'}
          </p>
          <PrimaryButton size="lg" fullWidth className="mt-4 rounded-full" icon={<Play size={18} />} onClick={start}>
            เริ่มจับเวลา
          </PrimaryButton>
        </section>
      )}

      {phase === 'playing' && q && (
        <section aria-label="ควิซจับเวลา" className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card">
            <span className={`inline-flex items-center gap-1.5 text-section font-bold ${seconds <= 10 ? 'text-danger' : 'text-forest'}`} aria-live="off">
              <Timer size={20} aria-hidden="true" /> {seconds} วิ
            </span>
            <span className="text-body font-semibold text-primary" aria-live="polite">
              ถูก {correct} / {answered}
            </span>
          </div>
          <ProgressBar value={left / (TIMED_QUIZ_SECONDS * 1000)} size="sm" label="เวลาที่เหลือ" valueText={`เหลือ ${seconds} วินาที`} tone={seconds <= 10 ? 'warning' : 'primary'} />

          <motion.div
            key={`${index}-${q.id}`}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="rounded-card border border-border bg-surface p-4 shadow-card"
          >
            <p className="text-card leading-snug font-semibold text-forest">{q.question}</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {q.options.map((o) => {
                const isChosen = feedback?.chosen === o.id;
                const isAnswer = feedback && o.id === q.correctAnswerId;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => choose(o.id)}
                    disabled={!!feedback}
                    className={`flex min-h-12 items-center justify-between gap-2 rounded-2xl border px-4 py-2.5 text-left text-body transition-colors ${
                      isAnswer ? 'border-primary bg-pale-mint font-semibold' : isChosen ? 'border-danger bg-danger/10' : 'border-border bg-surface hover:border-primary/50'
                    }`}
                  >
                    <span>{o.text}</span>
                    {isAnswer && <Check size={18} className="shrink-0 text-primary" aria-hidden="true" />}
                    {isChosen && !feedback?.right && <X size={18} className="shrink-0 text-danger" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {phase === 'done' && result && (
        <section aria-label="ผลควิซจับเวลา" className="rounded-hero border border-mint bg-surface p-5 text-center shadow-card">
          <span className="mx-auto block w-32">
            <PlayerSprouty size={128} mood={result.newBest ? 'cheer' : 'happy'} hop={result.newBest ? 1 : 0} />
          </span>
          {result.newBest && (
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-tag-yellow px-3 py-1 text-caption font-bold text-forest">
              <Trophy size={14} aria-hidden="true" /> สถิติใหม่!
            </p>
          )}
          <h2 className="mt-2 text-page font-bold text-forest">ตอบถูก {result.correct} ข้อ</h2>
          <p className="text-body text-muted">
            จากที่ตอบ {result.answered} ข้อ
            {result.answered > 0 && ` · แม่นยำ ${Math.round((result.correct / result.answered) * 100)}%`}
          </p>
          <p className="mt-2 text-caption text-muted">
            สถิติดีที่สุด: {Math.max(result.correct, result.prevBest ?? 0)} ข้อ · โหมดนี้ไม่ให้ XP
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <PrimaryButton fullWidth className="rounded-full" icon={<RotateCcw size={17} />} onClick={start}>
              เล่นอีกครั้ง
            </PrimaryButton>
            <SecondaryButton fullWidth className="rounded-full" onClick={() => setPhase('ready')}>
              ดูสถิติ
            </SecondaryButton>
          </div>
          <Link to="/quiz" className={`${buttonClasses('secondary', 'md', true)} mt-2 border-0 shadow-none`}>
            กลับหน้าควิซ
          </Link>
        </section>
      )}
    </div>
  );
}

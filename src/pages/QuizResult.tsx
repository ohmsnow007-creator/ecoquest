import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Eye, RotateCcw, Home, BookOpen, MinusCircle } from 'lucide-react';
import { useGame } from '../store/GameContext';
import { getQuestion, QUIZ_CATEGORY_LABELS, QUIZ_DIFFICULTY_LABELS } from '../data/quizzes';
import { QUIZ_XP_BY_DIFFICULTY } from '../services/rewardService';
import { EcoMascot } from '../components/ui/EcoMascot';
import { ProgressRing } from '../components/ui/ProgressBar';
import { XPBadge } from '../components/ui/Badges';
import { EmptyState } from '../components/ui/States';
import { buttonClasses } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/Controls';
import { LeafBurst } from '../components/feedback/LeafBurst';
import { getQuizResultState } from '../config/quizResults';

function duration(fromIso: string, toIso: string): string {
  const sec = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} นาที ${s} วินาที` : `${s} วินาที`;
}

export function QuizResult() {
  const { progress } = useGame();
  const [params] = useSearchParams();
  const [showReview, setShowReview] = useState(false);
  const [onlyWrong, setOnlyWrong] = useState<'wrong' | 'all'>('wrong');

  const wanted = params.get('attempt');
  const sorted = [...progress.quizAttempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const attempt = (wanted && progress.quizAttempts.find((a) => a.id === wanted)) || sorted.find((a) => !a.legacy) || sorted[0];

  if (!attempt) {
    return (
      <div className="pt-10">
        <EmptyState title="ยังไม่มีผลแบบทดสอบ" description="ทำแบบทดสอบชุดแรกเพื่อดูคะแนนและเฉลย" action={<Link to="/quiz" className={buttonClasses('primary')}>ไปหน้าแบบทดสอบ</Link>} />
      </div>
    );
  }

  const wrong = attempt.results.filter((r) => !r.correct);
  const unanswered = attempt.results.filter((r) => r.answerId === null).length;
  const pct = attempt.scorePercent;
  const state = getQuizResultState(pct);
  const reviewList = onlyWrong === 'wrong' ? wrong : attempt.results;
  const retryHref = attempt.category === 'all' ? '/quiz' : `/quiz?category=${attempt.category}`;

  return (
    <div className="mx-auto max-w-2xl pt-6 pb-4 lg:pt-10">
      <section aria-label="ผลแบบทดสอบ" className="bg-meadow relative flex flex-col items-center overflow-hidden rounded-hero border border-mint/70 px-4 pt-5 pb-6 text-center shadow-card">
        {state.celebrate && <LeafBurst />}
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }}>
          <EcoMascot size={140} mood={state.mood} title={`Sprouty กับผลแบบทดสอบของคุณ: ${state.title}`} />
        </motion.div>
        <h1 className="mt-2 text-page font-bold text-forest" data-result-state={state.state}>{state.title}</h1>
        <p className="mt-0.5 text-body text-muted">{state.message}</p>
        <p className="mt-2 text-body">
          คะแนนที่ได้ <strong>{attempt.correctCount}</strong> คะแนน · คุณตอบถูก <strong>{attempt.correctCount}</strong> จาก {attempt.total} ข้อ
          {attempt.category !== 'all' && ` · ${QUIZ_CATEGORY_LABELS[attempt.category]}`}
        </p>

        <div className="mt-4">
          <ProgressRing value={pct / 100} size={120} stroke={10} label={`ความถูกต้อง ${pct}%`}>
            <span className="text-[1.75rem] leading-none font-bold text-forest">{pct}%</span>
            <span className="mt-0.5 text-[0.75rem] text-muted">ความถูกต้อง</span>
          </ProgressRing>
        </div>

        <div className="mt-3 flex flex-col items-center">
          <XPBadge amount={attempt.xpAwarded} plus />
          <p className="mt-1 max-w-sm text-caption text-muted">
            {attempt.xpAwarded > 0 ? 'ได้รับรางวัลจากข้อที่ตอบถูกเป็นครั้งแรก (บันทึกครั้งเดียวต่อการส่ง)' : 'ไม่มี XP เพิ่ม เพราะไม่มีข้อที่ตอบถูกเป็นครั้งแรกในชุดนี้'}
          </p>
        </div>
      </section>

      <section aria-label="สรุปผลการทดสอบ" className="mt-6 rounded-card border border-border bg-surface p-4 shadow-card">
        <h2 className="text-section font-bold text-forest">สรุปผลการทดสอบ</h2>
        <ul className="mt-2 divide-y divide-border text-body">
          <li className="flex items-center gap-2 py-2.5">
            <CheckCircle2 size={18} className="text-success" aria-hidden="true" /> ตอบถูก <span className="ml-auto font-semibold">{attempt.correctCount} ข้อ</span>
          </li>
          <li className="flex items-center gap-2 py-2.5">
            <XCircle size={18} className="text-danger" aria-hidden="true" /> ตอบผิด{unanswered > 0 && ` (ไม่ได้ตอบ ${unanswered})`}
            <span className="ml-auto font-semibold">{wrong.length} ข้อ</span>
          </li>
          {!attempt.legacy && (
            <li className="flex items-center gap-2 py-2.5">
              <Clock size={18} className="text-primary" aria-hidden="true" /> ใช้เวลา <span className="ml-auto font-semibold">{duration(attempt.startedAt, attempt.submittedAt)}</span>
            </li>
          )}
        </ul>
      </section>

      <div className="mt-5 space-y-2.5">
        <button type="button" onClick={() => setShowReview((v) => !v)} aria-expanded={showReview} aria-controls="answer-review" className={`${buttonClasses('primary', 'lg', true)} rounded-full`}>
          <Eye size={18} aria-hidden="true" /> {showReview ? 'ซ่อนเฉลยคำตอบ' : 'ดูเฉลยคำตอบ'}
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <Link to={retryHref} className={`${buttonClasses('secondary', 'md', true)} rounded-full`}>
            <RotateCcw size={16} aria-hidden="true" /> ลองอีกครั้ง
          </Link>
          <Link to="/home" className={`${buttonClasses('secondary', 'md', true)} rounded-full`}>
            <Home size={16} aria-hidden="true" /> กลับหน้าหลัก
          </Link>
        </div>
      </div>

      {showReview && (
        <section id="answer-review" aria-labelledby="review-title" className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="review-title" className="text-section font-bold text-forest">เฉลยคำตอบ</h2>
            <SegmentedControl
              ariaLabel="แสดงเฉลย"
              value={onlyWrong}
              onChange={setOnlyWrong}
              options={[
                { value: 'wrong', label: 'เฉพาะข้อที่ผิด', count: wrong.length },
                { value: 'all', label: 'ทั้งหมด', count: attempt.total },
              ]}
            />
          </div>
          {attempt.legacy && <p className="mb-3 text-caption text-muted">ผลนี้มาจากควิซแบบเดิม ซึ่งไม่ได้บันทึกตัวเลือกที่คุณตอบไว้</p>}
          {reviewList.length === 0 ? (
            <p className="rounded-card bg-pale-mint p-4 text-body font-semibold">ไม่มีข้อที่ตอบผิด ยอดเยี่ยมมาก!</p>
          ) : (
            <ol className="space-y-3">
              {reviewList.map((r) => {
                const q = getQuestion(r.questionId);
                const n = attempt.results.indexOf(r) + 1;
                if (!q) {
                  return (
                    <li key={r.questionId} className="rounded-card border border-border bg-surface p-4 text-caption text-muted">
                      ข้อ {n}: คำถามนี้ถูกนำออกจากคลังแล้ว ({r.correct ? 'ตอบถูก' : 'ตอบผิด'})
                    </li>
                  );
                }
                const yours = q.options.find((o) => o.id === r.answerId);
                const right = q.options.find((o) => o.id === q.correctAnswerId)!;
                return (
                  <li key={q.id} className="rounded-card border border-border bg-surface p-4 shadow-card">
                    <p className="flex items-center gap-2 text-caption text-muted">
                      ข้อ {n} · {QUIZ_CATEGORY_LABELS[q.category]} · {QUIZ_DIFFICULTY_LABELS[q.difficulty]}
                      <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${r.correct ? 'bg-pale-mint text-success' : 'bg-danger/10 text-danger'}`}>
                        {r.correct ? <CheckCircle2 size={13} aria-hidden="true" /> : <XCircle size={13} aria-hidden="true" />}
                        {r.correct ? 'ถูก' : 'ผิด'}
                      </span>
                    </p>
                    <p className="mt-1 text-body font-semibold text-forest">{q.question}</p>
                    {!attempt.legacy && (
                      <p className={`mt-2 flex items-start gap-2 text-body ${r.correct ? 'text-success' : 'text-danger'}`}>
                        {r.answerId === null ? <MinusCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : r.correct ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : <XCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />}
                        <span>
                          <span className="font-semibold">คำตอบของคุณ:</span> {yours ? `${yours.id.toUpperCase()}. ${yours.text}` : 'ไม่ได้ตอบ'}
                        </span>
                      </p>
                    )}
                    {!r.correct && (
                      <p className="mt-1 flex items-start gap-2 text-body text-success">
                        <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span>
                          <span className="font-semibold">คำตอบที่ถูก:</span> {right.id.toUpperCase()}. {right.text}
                        </span>
                      </p>
                    )}
                    <p className="mt-2 rounded-control bg-background p-3 text-caption">{q.explanation}</p>
                    {q.source && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-[0.75rem] text-muted">
                        <BookOpen size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span>
                          แหล่งที่มา:{' '}
                          {q.source.url ? (
                            <a href={q.source.url} target="_blank" rel="noreferrer" className="underline">{q.source.name}</a>
                          ) : (
                            q.source.name
                          )}
                        </span>
                      </p>
                    )}
                    {r.correct && !attempt.legacy && (
                      <p className="mt-1 text-[0.75rem] text-muted">รางวัลข้อนี้ (ครั้งแรก): {QUIZ_XP_BY_DIFFICULTY[q.difficulty]} XP</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

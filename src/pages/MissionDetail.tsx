import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Clock, Leaf, Play, CheckCircle2, Check, Timer, Circle, AlertCircle, RotateCcw, History, ChevronRight, ShieldCheck } from 'lucide-react';
import { missions } from '../data/missions';
import { useGame, type CompleteMissionResult } from '../store/GameContext';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import type { Mission, MissionProgressStatus } from '../types';
import { getLocalDate } from '../utils/streak';
import { MissionArt, CATEGORY_TONE } from '../components/illustrations/MissionArt';
import { MISSION_TYPE_META } from '../components/ui/MissionCard';
import { XPBadge } from '../components/ui/Badges';
import { PrimaryButton, SecondaryButton, buttonClasses } from '../components/ui/Button';
import { ConfirmationDialog } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ErrorState } from '../components/ui/States';
import { PlayerSprouty } from '../components/sprouty/PlayerSprouty';
import { LeafBurst } from '../components/feedback/LeafBurst';
import { LOGGABLE_BY_IMPACT, getActivityMeta } from '../data/impactActivities';

const STATUS_META: Record<MissionProgressStatus, { label: string; icon: typeof Circle; className: string }> = {
  available: { label: 'พร้อมเริ่ม', icon: Circle, className: 'bg-pale-mint text-primary' },
  'in-progress': { label: 'กำลังทำ', icon: Timer, className: 'bg-lime text-forest' },
  'completed-today': { label: 'สำเร็จแล้ววันนี้', icon: CheckCircle2, className: 'bg-pale-mint text-success' },
  'completed-once': { label: 'สำเร็จแล้ว', icon: CheckCircle2, className: 'bg-pale-mint text-success' },
};

const FAILURE_TEXT: Record<Exclude<CompleteMissionResult, { ok: true }>['reason'], string> = {
  'not-found': 'ไม่พบภารกิจนี้ จึงไม่ได้บันทึกผล',
  inactive: 'ภารกิจนี้ปิดใช้งานแล้ว จึงไม่ได้บันทึกผล',
  'already-completed': 'ภารกิจนี้บันทึกว่าสำเร็จแล้ว จึงไม่ได้รับ XP ซ้ำ',
  'not-started': 'กรุณากดเริ่มภารกิจก่อนยืนยันความสำเร็จ',
  'save-failed': 'บันทึกผลไม่สำเร็จ ยังไม่ได้รับ XP กรุณาลองอีกครั้ง',
  busy: 'กำลังบันทึกผล กรุณารอสักครู่',
};

function MissionHero({ mission, onBack, onShare }: { mission: Mission; onBack: () => void; onShare: () => void }) {
  return (
    <div className={`relative -mx-4 h-60 overflow-hidden sm:-mx-6 sm:h-72 lg:mx-0 lg:mt-8 lg:rounded-hero ${CATEGORY_TONE[mission.category]}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx={330} cy={60} r={34} fill="#FFFFFF" opacity={0.45} />
        <path d="M-10 190 C80 150 170 160 240 182 C300 162 360 160 410 176 L410 240 L-10 240Z" className="fill-surface" opacity={0.35} />
        <path d="M-10 214 C90 196 220 200 410 210 L410 240 L-10 240Z" className="fill-primary" opacity={0.25} />
      </svg>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <MissionArt category={mission.category} className="h-40 w-40 sm:h-48 sm:w-48" />
      </motion.div>
      <div className="safe-top absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
        <button type="button" onClick={onBack} aria-label="กลับไปหน้าภารกิจ" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-text shadow-card hover:bg-surface">
          <ArrowLeft size={20} />
        </button>
        <button type="button" onClick={onShare} aria-label="แชร์ภารกิจนี้" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-text shadow-card hover:bg-surface">
          <Share2 size={19} />
        </button>
      </div>
    </div>
  );
}

export function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { progress, completeMission, getMissionStatus, startMission, toggleMissionStep, getCompletedSteps, notify } = useGame();
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [celebrate, setCelebrate] = useState<{ xp: number } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  const mission = missions.find((m) => m.id === id);
  if (!mission) {
    return (
      <div className="pt-10">
        <ErrorState
          title="Mission Not Found — ไม่พบภารกิจนี้"
          description="ภารกิจอาจถูกนำออกไปแล้ว หรือลิงก์ไม่ถูกต้อง"
          action={<Link to="/missions" className={buttonClasses('primary')}>กลับไปหน้าภารกิจ</Link>}
        />
      </div>
    );
  }

  const status = getMissionStatus(mission.id);
  const meta = STATUS_META[status];
  const TypeMeta = MISSION_TYPE_META[mission.type];
  const doneSteps = getCompletedSteps(mission.id);
  const totalSteps = mission.steps.length;
  const today = getLocalDate();
  const record = [...progress.completions]
    .reverse()
    .find((c) => c.missionId === mission.id && (mission.repeatPolicy === 'once' || c.localDate === today));
  const related = missions.filter((m) => m.active && m.category === mission.category && m.id !== mission.id).slice(0, 3);

  const loggable = LOGGABLE_BY_IMPACT[mission.impactType];
  const logLink = loggable ? (
    <Link to={`/impact?log=${loggable}`} className={`${buttonClasses('primary', 'md', true)} mt-3`}>
      บันทึกปริมาณที่ทำได้ ({getActivityMeta(loggable).unit})
    </Link>
  ) : null;

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/missions'));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: mission.title, text: `ภารกิจรักษ์โลก: ${mission.title}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        notify('คัดลอกลิงก์ภารกิจแล้ว', 'info');
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') notify('แชร์ไม่สำเร็จ กรุณาลองอีกครั้ง', 'error');
    }
  };

  const confirm = () => {
    setConfirming(false);
    const result = completeMission(mission.id, note.trim() || undefined);
    if (result.ok) {
      setFailure(null);
      setNote('');
      setCelebrate({ xp: result.xpAwarded });
    } else if (result.reason !== 'busy') {
      setFailure(FAILURE_TEXT[result.reason]);
      setCanRetry(result.reason === 'save-failed');
    }
  };

  const actionCard = (
    <section aria-label="สถานะและการยืนยันภารกิจ" className="rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
      {celebrate ? (
        <motion.div className="relative flex flex-col items-center py-2 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 13 }}>
          <LeafBurst />
          <span className="block w-28"><PlayerSprouty size={112} mood="cheer" hop={1} title="Sprouty ดีใจที่คุณทำภารกิจสำเร็จ" /></span>
          <h2 className="mt-2 text-section font-bold text-forest">ภารกิจสำเร็จ!</h2>
          <motion.div initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 8, delay: 0.15 }} className="mt-2">
            <XPBadge amount={celebrate.xp} plus />
          </motion.div>
          <p className="mt-2 text-caption text-muted">ระบบบันทึกตามข้อมูลที่คุณยืนยัน</p>
          {logLink}
          <Link to="/missions" className={`${buttonClasses('secondary', 'md', true)} mt-2`}>เลือกภารกิจอื่น</Link>
        </motion.div>
      ) : status === 'available' ? (
        <>
          <p className="text-body font-semibold">พร้อมเริ่มภารกิจนี้หรือยัง?</p>
          <p className="mt-1 text-caption text-muted">กดเริ่มเพื่อบันทึกว่ากำลังทำ แล้วติ๊กขั้นตอนระหว่างทำ</p>
          <PrimaryButton size="lg" fullWidth className="mt-3 rounded-full" icon={<Play size={18} />} onClick={() => startMission(mission.id)}>
            เริ่มภารกิจ
          </PrimaryButton>
        </>
      ) : status === 'in-progress' ? (
        <>
          <label htmlFor="mission-note" className="mb-1.5 block text-caption font-semibold">บันทึกสั้น ๆ (ไม่บังคับ)</label>
          <textarea
            id="mission-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เล่าสิ่งที่คุณทำ..."
            rows={2}
            maxLength={200}
            className="w-full resize-none rounded-control border border-border bg-surface px-3 py-2 text-body placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <PrimaryButton size="lg" fullWidth className="mt-3 rounded-full" icon={<CheckCircle2 size={18} />} onClick={() => setConfirming(true)}>
            ยืนยันว่าทำสำเร็จ
          </PrimaryButton>
          <p className="mt-2 flex items-start justify-center gap-1.5 text-center text-caption text-muted">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            ระบบบันทึกตามข้อมูลที่คุณยืนยัน ไม่ได้ตรวจสอบการกระทำจริง
          </p>
        </>
      ) : (
        <div className="text-center">
          <CheckCircle2 size={30} className="mx-auto text-success" aria-hidden="true" />
          <p className="mt-2 text-body font-semibold">ทำภารกิจนี้สำเร็จแล้ว</p>
          {record && (
            <dl className="mt-3 grid grid-cols-2 gap-2 text-caption">
              <div className="rounded-control bg-background p-2">
                <dt className="text-muted">ทำสำเร็จเมื่อ</dt>
                <dd className="font-semibold">
                  {new Date(record.completedAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </dd>
              </div>
              <div className="rounded-control bg-background p-2">
                <dt className="text-muted">XP ที่ได้รับ</dt>
                <dd className="font-semibold text-primary">+{record.xpAwarded} XP</dd>
              </div>
            </dl>
          )}
          <p className="mt-2 text-caption text-muted">
            {mission.repeatPolicy === 'daily' ? 'ภารกิจนี้ทำได้อีกครั้งพรุ่งนี้' : 'ภารกิจนี้ทำได้ครั้งเดียว'}
          </p>
          {logLink}
          <Link to="/progress#history" className={`${buttonClasses('secondary', 'md', true)} mt-2`}>
            <History size={16} aria-hidden="true" /> ดูรายละเอียดในประวัติ
          </Link>
        </div>
      )}

      {failure && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-control border border-danger/30 bg-danger/5 p-3 text-caption">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
          <div className="flex-1">
            <p>{failure}</p>
            {canRetry && (
              <SecondaryButton className="mt-2" icon={<RotateCcw size={15} />} onClick={confirm}>
                ลองอีกครั้ง
              </SecondaryButton>
            )}
          </div>
        </div>
      )}
    </section>
  );

  return (
    <>
      <MissionHero mission={mission} onBack={goBack} onShare={share} />

      <div className="relative -mx-4 -mt-7 rounded-t-[1.75rem] bg-background px-4 pt-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-6 lg:rounded-none lg:px-0 lg:pt-0">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="space-y-5 lg:col-span-2">
            <header>
              <h1 className="text-page leading-tight font-bold lg:text-[1.875rem] text-forest">{mission.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-caption">
                <span className="text-muted">{CATEGORY_LABELS[mission.category]}</span>
                <span className="rounded-full bg-pale-mint px-2 py-0.5 font-medium text-primary">{DIFFICULTY_LABELS[mission.difficulty]}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${meta.className}`}>
                  <meta.icon size={12} aria-hidden="true" /> {meta.label}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <XPBadge amount={mission.xpReward} plus className="text-body" />
                <span className="inline-flex items-center gap-1.5 text-body font-semibold">
                  <Clock size={17} className="text-primary" aria-hidden="true" /> {mission.estimatedMinutes} นาที
                </span>
                <span className="inline-flex items-center gap-1 text-caption text-muted">
                  <TypeMeta.icon size={14} aria-hidden="true" /> {TypeMeta.label}
                </span>
              </div>
            </header>

            <section aria-labelledby="desc-title">
              <h2 id="desc-title" className="text-section font-bold text-forest">รายละเอียดภารกิจ</h2>
              <p className="mt-1 text-body text-muted">{mission.description}</p>
            </section>

            <section aria-labelledby="why-title" className="rounded-card border border-mint bg-pale-mint p-4">
              <h2 id="why-title" className="flex items-center gap-2 text-card font-semibold text-forest">
                <Leaf size={18} className="text-primary" aria-hidden="true" /> ทำไมถึงสำคัญ?
              </h2>
              <p className="mt-1.5 text-body">{mission.environmentalExplanation}</p>
              {mission.sources && mission.sources.length > 0 && (
                <p className="mt-2 text-caption text-muted">
                  แหล่งอ้างอิง:{' '}
                  {mission.sources.map((src, i) => (
                    <span key={src.name}>
                      {i > 0 && ' · '}
                      {src.url ? (
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
                          {src.name}
                        </a>
                      ) : (
                        src.name
                      )}
                    </span>
                  ))}
                </p>
              )}
            </section>

            <section aria-labelledby="steps-title">
              <h2 id="steps-title" className="text-section font-bold text-forest">ขั้นตอนการทำ</h2>
              {status === 'in-progress' && (
                <div className="mt-2 mb-3">
                  <ProgressBar value={doneSteps.length / totalSteps} label="ความคืบหน้าขั้นตอน" showLabel valueText={`ทำแล้ว ${doneSteps.length}/${totalSteps} ขั้นตอน`} />
                </div>
              )}
              <ol className="mt-2 space-y-2">
                {mission.steps.map((step, i) => {
                  const checked = doneSteps.includes(i);
                  if (status === 'in-progress') {
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => toggleMissionStep(mission.id, i)}
                          className={`flex min-h-12 w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-left text-body transition-colors ${
                            checked ? 'border-mint bg-pale-mint' : 'border-border bg-surface hover:border-primary/40'
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-caption font-semibold ${
                              checked ? 'border-primary bg-primary text-white' : 'border-border text-muted'
                            }`}
                            aria-hidden="true"
                          >
                            {checked ? <Check size={14} strokeWidth={3} /> : i + 1}
                          </span>
                          <span className={checked ? 'text-muted line-through' : ''}>{step}</span>
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 text-body">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-white" aria-hidden="true">
                        {status === 'available' ? i + 1 : <Check size={14} strokeWidth={3} />}
                      </span>
                      {step}
                    </li>
                  );
                })}
              </ol>
              {status === 'available' && <p className="mt-2 text-caption text-muted">Checklist จะเปิดให้ติ๊กหลังจากกดเริ่มภารกิจ</p>}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {actionCard}

            {related.length > 0 && (
              <section aria-labelledby="related-title">
                <h2 id="related-title" className="mb-2 text-section font-bold text-forest">ภารกิจที่เกี่ยวข้อง</h2>
                <ul className="space-y-2">
                  {related.map((m) => (
                    <li key={m.id}>
                      <Link to={`/missions/${m.id}`} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card hover:border-primary/40">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${CATEGORY_TONE[m.category]}`}>
                          <MissionArt category={m.category} className="h-9 w-9" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-body font-semibold">{m.title}</span>
                          <span className="block text-caption text-muted">{CATEGORY_LABELS[m.category]} · +{m.xpReward} XP</span>
                        </span>
                        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>

      <ConfirmationDialog
        open={confirming}
        title="ยืนยันว่าทำภารกิจสำเร็จ?"
        description={[
          `"${mission.title}" · รับ +${mission.xpReward} XP`,
          doneSteps.length < totalSteps ? `ยังติ๊กขั้นตอนไม่ครบ (${doneSteps.length}/${totalSteps})` : '',
          'ระบบบันทึกตามข้อมูลที่คุณยืนยัน และรับรางวัลซ้ำไม่ได้',
        ]
          .filter(Boolean)
          .join(' · ')}
        confirmLabel="ยืนยันสำเร็จ"
        cancelLabel="ยกเลิก"
        onConfirm={confirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

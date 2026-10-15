import { Gift, Check, Trophy, CalendarClock } from 'lucide-react';
import type { DailyStatus, WeeklyStatus } from '../../utils/challenges';
import { ProgressBar } from '../ui/ProgressBar';
import { PrimaryButton } from '../ui/Button';

/** Progress and bonus claim for today's three daily missions. */
export function ChallengeBonus({ status, onClaim }: { status: DailyStatus; onClaim: () => void }) {
  const total = status.missions.length;
  return (
    <div className="mt-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tag-yellow text-forest" aria-hidden="true">
          <Gift size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold">โบนัสทำครบ {total} ภารกิจวันนี้</p>
          <ProgressBar
            value={status.doneCount / total}
            size="sm"
            label="ความคืบหน้าภารกิจประจำวัน"
            valueText={`${status.doneCount} จาก ${total}`}
          />
        </div>
        {status.claimed ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pale-mint px-3 py-1.5 text-caption font-semibold text-primary">
            <Check size={14} aria-hidden="true" /> รับแล้ว
          </span>
        ) : status.complete ? (
          <PrimaryButton className="shrink-0 !min-h-10 !px-4" onClick={onClaim}>
            รับ +{status.bonusXp} XP
          </PrimaryButton>
        ) : (
          <span className="shrink-0 text-caption font-semibold text-muted">
            {status.doneCount}/{total} · +{status.bonusXp} XP
          </span>
        )}
      </div>
      <p className="mt-2 text-[0.75rem] text-muted">ภารกิจประจำวันเปลี่ยนทุกวันตอนเที่ยงคืนตามเวลาเครื่อง ภารกิจชีวิตจริงเป็นการรายงานด้วยตนเอง</p>
    </div>
  );
}

/** This week's challenge with live progress from stored records. */
export function WeeklyChallengeCard({ status, onClaim }: { status: WeeklyStatus; onClaim: () => void }) {
  const { challenge } = status;
  return (
    <section aria-labelledby="weekly-title" className="mt-4 rounded-card border border-primary/30 bg-gradient-to-br from-pale-mint to-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-lime" aria-hidden="true">
          <Trophy size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption font-semibold text-primary">ชาเลนจ์ประจำสัปดาห์</p>
          <h3 id="weekly-title" className="text-card leading-snug font-semibold">{challenge.title}</h3>
          <p className="text-caption text-muted">{challenge.description}</p>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar
          value={status.count / status.target}
          label={`ความคืบหน้า ${challenge.title}`}
          showLabel
          valueText={`${status.count}/${status.target}`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-caption text-muted">
          <CalendarClock size={14} aria-hidden="true" />
          {status.daysLeft === 1 ? 'วันสุดท้ายของสัปดาห์' : `เหลืออีก ${status.daysLeft} วัน`}
        </span>
        {status.claimed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-caption font-semibold text-mint">
            <Check size={14} aria-hidden="true" /> รับโบนัสแล้ว
          </span>
        ) : status.complete ? (
          <PrimaryButton className="!min-h-10 !px-4" onClick={onClaim}>
            รับ +{challenge.bonusXp} XP
          </PrimaryButton>
        ) : (
          <span className="text-caption font-semibold text-primary">โบนัส +{challenge.bonusXp} XP</span>
        )}
      </div>
    </section>
  );
}

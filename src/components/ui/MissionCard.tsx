import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, BookOpen, Gamepad2, Hand, Play, ChevronRight, type LucideIcon } from 'lucide-react';
import type { Mission, MissionProgressStatus, MissionType } from '../../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../../types';
import { MissionArt, CATEGORY_TONE } from '../illustrations/MissionArt';
import { XPBadge } from './Badges';

export const MISSION_TYPE_META: Record<MissionType, { label: string; icon: LucideIcon }> = {
  educational: { label: 'ความรู้', icon: BookOpen },
  simulation: { label: 'จำลอง', icon: Gamepad2 },
  'self-reported': { label: 'รายงานด้วยตนเอง', icon: Hand },
};

const DIFFICULTY_STYLE = {
  easy: 'bg-pale-mint text-primary',
  medium: 'bg-lime text-forest',
  hard: 'bg-danger/10 text-danger',
};

interface MissionCardProps {
  mission: Mission;
  status: MissionProgressStatus;
  stepsDone?: number;
  onStart?: () => void;
}

export function MissionCard({ mission, status, stepsDone = 0, onStart }: MissionCardProps) {
  const done = status === 'completed-today' || status === 'completed-once';
  const inProgress = status === 'in-progress';
  const to = `/missions/${mission.id}`;

  return (
    <article className={`relative flex items-start gap-3 rounded-card border bg-surface p-3.5 shadow-card transition-colors hover:border-primary/40 sm:p-4 ${inProgress ? 'border-emerald/50 ring-1 ring-emerald/20' : 'border-border'}`}>
      <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.125rem] ${CATEGORY_TONE[mission.category]} ${done ? 'opacity-70' : ''}`}>
        <MissionArt category={mission.category} muted={done} className="h-12 w-12" />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-card leading-snug font-semibold text-forest">
          <Link to={to} className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none">
            {mission.title}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-caption text-muted">{mission.description}</p>
        <p className="mt-1 text-caption text-muted">
          {CATEGORY_LABELS[mission.category]}
          <span className="mx-1">·</span>
          <span className={`rounded-full px-1.5 py-0.5 font-medium ${DIFFICULTY_STYLE[mission.difficulty]}`}>{DIFFICULTY_LABELS[mission.difficulty]}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <XPBadge amount={mission.xpReward} plus />
          <span className="inline-flex items-center gap-1 text-caption text-muted">
            <Clock size={13} aria-hidden="true" /> {mission.estimatedMinutes} นาที
          </span>
          {inProgress && (
            <span className="text-caption font-medium text-text">
              ขั้นตอน {stepsDone}/{mission.steps.length}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-end self-center">
        {done ? (
          <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-pale-mint px-3 text-caption font-semibold text-success">
            <CheckCircle2 size={14} aria-hidden="true" /> สำเร็จแล้ว
          </span>
        ) : inProgress ? (
          <Link
            to={to}
            aria-label={`ทำต่อ: ${mission.title}`}
            className="inline-flex min-h-11 items-center gap-0.5 rounded-full bg-lime px-3.5 text-caption font-semibold text-forest hover:bg-mint"
          >
            ทำต่อ <ChevronRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onStart}
            aria-label={`เริ่มทำ: ${mission.title}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-3.5 text-caption font-semibold text-white shadow-[0_4px_12px_rgb(14_127_89/0.25)] hover:bg-forest"
          >
            <Play size={13} aria-hidden="true" /> เริ่มทำ
          </button>
        )}
      </div>
    </article>
  );
}

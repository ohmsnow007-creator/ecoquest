import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ChevronRight, BookOpen, Gamepad2, Hand, Timer, type LucideIcon } from 'lucide-react';
import type { Mission, MissionProgressStatus, MissionType } from '../../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../../types';
import { CATEGORY_ICON } from '../../data/icons';
import { XPBadge } from './Badges';

export const MISSION_TYPE_META: Record<MissionType, { label: string; icon: LucideIcon }> = {
  educational: { label: 'ความรู้', icon: BookOpen },
  simulation: { label: 'จำลอง', icon: Gamepad2 },
  'self-reported': { label: 'รายงานด้วยตนเอง', icon: Hand },
};

const DIFFICULTY_STYLE = {
  easy: 'bg-primary/10 text-primary',
  medium: 'bg-warning/15 text-text',
  hard: 'bg-danger/10 text-danger',
};

interface MissionCardProps {
  mission: Mission;
  status: MissionProgressStatus;
  to: string;
  compact?: boolean;
}

export function MissionCard({ mission, status, to, compact = false }: MissionCardProps) {
  const Icon = CATEGORY_ICON[mission.category];
  const TypeIcon = MISSION_TYPE_META[mission.type].icon;
  const done = status === 'completed-today' || status === 'completed-once';

  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary/40"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${done ? 'bg-border text-muted' : 'bg-primary/10 text-primary'}`}
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-card font-semibold">{mission.title}</h3>
          <XPBadge amount={mission.xp} className="mt-0.5" />
        </div>
        {!compact && <p className="mt-0.5 line-clamp-2 text-caption text-muted">{mission.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption text-muted">
          <span className={`rounded-full px-2 py-0.5 font-medium ${DIFFICULTY_STYLE[mission.difficulty]}`}>
            {DIFFICULTY_LABELS[mission.difficulty]}
          </span>
          {!compact && <span>{CATEGORY_LABELS[mission.category]}</span>}
          <span className="inline-flex items-center gap-1">
            <TypeIcon size={13} aria-hidden="true" />
            {MISSION_TYPE_META[mission.type].label}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} aria-hidden="true" />
            {mission.durationMinutes} นาที
          </span>
        </div>
        {status === 'in-progress' && (
          <p className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-text">
            <Timer size={14} className="text-warning" aria-hidden="true" />
            กำลังทำ
          </p>
        )}
        {done && (
          <p className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-success">
            <CheckCircle2 size={14} aria-hidden="true" />
            {status === 'completed-today' ? 'ทำแล้ววันนี้' : 'ทำสำเร็จแล้ว'}
          </p>
        )}
      </div>
      <ChevronRight size={18} className="mt-3 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

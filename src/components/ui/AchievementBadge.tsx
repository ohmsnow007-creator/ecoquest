import { RARITY_LABELS } from '../../types';
import type { BadgeStatus } from '../../utils/badges';
import { BadgeMedal } from '../illustrations/BadgeMedal';
import { ProgressBar } from './ProgressBar';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

interface AchievementBadgeProps {
  status: BadgeStatus;
  size?: 'md' | 'lg';
}

export function AchievementBadge({ status, size = 'md' }: AchievementBadgeProps) {
  const { badge, unlocked, unlockedAt, current, target, progress, unlockCondition } = status;

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center text-center">
        <BadgeMedal badge={badge} unlocked size={112} />
        <h3 className="mt-3 text-section font-semibold">{badge.name}</h3>
        <p className="mt-0.5 text-body text-muted">{badge.description}</p>
        <p className="mt-1 text-caption">{unlockCondition}</p>
        <span className="mt-2 rounded-full bg-lime px-2.5 py-0.5 text-caption font-semibold text-forest">{RARITY_LABELS[badge.rarity]}</span>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col items-center rounded-card border p-3 text-center ${unlocked ? 'border-mint bg-surface shadow-card' : 'border-dashed border-border bg-background'}`}>
      <BadgeMedal badge={badge} unlocked={unlocked} size={60} />
      <h3 className={`mt-2 text-caption leading-snug font-semibold ${unlocked ? 'text-forest' : 'text-muted'}`}>{badge.name}</h3>
      <p className="mt-0.5 flex-1 text-[0.75rem] leading-snug text-muted">{unlockCondition}</p>
      {unlocked ? (
        <p className="mt-1.5 rounded-full bg-pale-mint px-2 py-0.5 text-[0.75rem] font-semibold text-success">{unlockedAt ? formatDate(unlockedAt) : 'ปลดล็อกแล้ว'}</p>
      ) : (
        <div className="mt-1.5 w-full">
          <p className="mb-1 text-[0.75rem] font-semibold">
            <span className="sr-only">ยังล็อกอยู่ ความคืบหน้า </span>
            {current}/{target}
          </p>
          <ProgressBar value={progress} size="sm" label={`ความคืบหน้า ${badge.name}`} valueText={`${current} จาก ${target}`} />
        </div>
      )}
    </div>
  );
}

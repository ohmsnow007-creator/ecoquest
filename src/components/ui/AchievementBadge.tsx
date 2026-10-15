import { Lock } from 'lucide-react';
import type { Badge } from '../../types';
import { RARITY_LABELS } from '../../types';
import { getBadgeIcon } from '../../data/icons';
import { ProgressBar } from './ProgressBar';

const RARITY_RING: Record<Badge['rarity'], string> = {
  common: 'bg-mint text-forest',
  uncommon: 'bg-lime text-forest',
  rare: 'bg-emerald text-white',
  epic: 'bg-forest text-lime',
  legendary: 'bg-warning text-forest',
};

interface AchievementBadgeProps {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  size?: 'md' | 'lg';
}

export function AchievementBadge({ badge, unlocked, unlockedAt, progress = 0, size = 'md' }: AchievementBadgeProps) {
  const Icon = getBadgeIcon(badge.icon);

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center text-center">
        <span className={`flex h-24 w-24 items-center justify-center rounded-full shadow-raised ring-8 ring-lime/60 ${RARITY_RING[badge.rarity]}`}>
          <Icon size={44} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-section font-semibold">{badge.title}</h3>
        <p className="mt-1 text-body text-muted">{badge.description}</p>
        <span className="mt-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-medium text-primary">
          {RARITY_LABELS[badge.rarity]}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col rounded-card border border-border p-4 shadow-card ${unlocked ? 'bg-surface' : 'bg-background'}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`relative flex h-12 w-12 items-center justify-center rounded-full ${unlocked ? RARITY_RING[badge.rarity] : 'bg-border text-muted'}`}
          aria-hidden="true"
        >
          <Icon size={22} />
          {!unlocked && (
            <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface">
              <Lock size={11} />
            </span>
          )}
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary">
          {RARITY_LABELS[badge.rarity]}
        </span>
      </div>
      <h3 className={`text-card font-semibold ${unlocked ? '' : 'text-muted'}`}>{badge.title}</h3>
      <p className="mt-0.5 flex-1 text-caption text-muted">{badge.description}</p>
      {unlocked ? (
        unlockedAt && (
          <p className="mt-2 text-caption text-success">
            ปลดล็อกเมื่อ {new Date(unlockedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )
      ) : (
        <div className="mt-3">
          <ProgressBar value={progress} size="sm" label={`ความคืบหน้า ${badge.title}`} showLabel />
        </div>
      )}
    </div>
  );
}

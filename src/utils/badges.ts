import type { Badge, PlayerProgress } from '../types';
import { CATEGORY_LABELS } from '../types';
import { badges } from '../data/badges';
import { missions } from '../data/missions';
import { calculateStreak, getLongestStreak } from './streak';
import { getWorldState } from './world';

function currentValue(badge: Badge, progress: PlayerProgress): number {
  switch (badge.ruleType) {
    case 'total-completions':
      return progress.completions.length;
    case 'category-completions': {
      const ids = new Set(missions.filter((m) => m.category === badge.ruleCategory).map((m) => m.id));
      return progress.completions.filter((c) => ids.has(c.missionId)).length;
    }
    case 'streak':
      return Math.max(calculateStreak(progress.completions), getLongestStreak(progress.completions));
    case 'quiz-correct':
      return new Set(progress.quizAttempts.flatMap((a) => a.results.filter((r) => r.correct).map((r) => r.questionId))).size;
    case 'world-stage':
      return getWorldState(progress.completions.length).current.stage;
    case 'timed-best':
      return Math.max(0, ...(progress.timedRuns ?? []).map((r) => r.correct));
  }
}

export function describeUnlockCondition(badge: Badge): string {
  switch (badge.ruleType) {
    case 'total-completions':
      return badge.threshold === 1 ? 'ทำภารกิจสำเร็จครั้งแรก' : `ทำภารกิจสำเร็จครบ ${badge.threshold} ครั้ง`;
    case 'category-completions':
      return `ทำภารกิจหมวด${CATEGORY_LABELS[badge.ruleCategory!]}ครบ ${badge.threshold} ครั้ง`;
    case 'streak':
      return `ทำภารกิจต่อเนื่อง ${badge.threshold} วัน`;
    case 'quiz-correct':
      return `ตอบควิซถูก ${badge.threshold} ข้อ (ไม่นับข้อซ้ำ)`;
    case 'world-stage':
      return `โลกเสมือนเติบโตถึงระดับ ${badge.threshold}`;
    case 'timed-best':
      return `ตอบถูก ${badge.threshold} ข้อในควิซจับเวลา 60 วินาที`;
  }
}

export interface BadgeStatus {
  badge: Badge;
  unlocked: boolean;
  unlockedAt?: string;
  /** Granted by a demo admin rather than earned. */
  byAdmin?: boolean;
  current: number;
  target: number;
  progress: number;
  unlockCondition: string;
}

// Unlock state comes only from stored records; progress is recomputed from history each time.
export function getBadgeStatus(badge: Badge, progress: PlayerProgress): BadgeStatus {
  const record = progress.unlockedBadges.find((r) => r.badgeId === badge.id);
  const current = Math.min(currentValue(badge, progress), badge.threshold);
  return {
    badge,
    unlocked: Boolean(record),
    unlockedAt: record?.unlockedAt,
    byAdmin: record?.source === 'admin',
    current: record ? badge.threshold : current,
    target: badge.threshold,
    progress: record ? 1 : current / badge.threshold,
    unlockCondition: describeUnlockCondition(badge),
  };
}

export function getAllBadgeStatuses(progress: PlayerProgress): BadgeStatus[] {
  return badges.map((b) => getBadgeStatus(b, progress));
}

export function checkNewBadges(progress: PlayerProgress): Badge[] {
  const unlocked = new Set(progress.unlockedBadges.map((b) => b.badgeId));
  return badges.filter((b) => !unlocked.has(b.id) && currentValue(b, progress) >= b.threshold);
}

export function getBadgeProgress(badge: Badge, progress: PlayerProgress): number {
  return getBadgeStatus(badge, progress).progress;
}

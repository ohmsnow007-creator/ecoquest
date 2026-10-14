import type { Badge, PlayerProgress } from '../types';
import { badges } from '../data/badges';
import { missions } from '../data/missions';
import { getLevelFromXp } from './xp';
import { calculateStreak, getLongestStreak } from './streak';

function checkBadgeRule(badge: Badge, progress: PlayerProgress): boolean {
  switch (badge.ruleType) {
    case 'total-completions':
      return progress.completions.length >= badge.threshold;

    case 'category-completions': {
      if (!badge.ruleCategory) return false;
      const missionIds = missions
        .filter((m) => m.category === badge.ruleCategory)
        .map((m) => m.id);
      const count = progress.completions.filter((c) =>
        missionIds.includes(c.missionId)
      ).length;
      return count >= badge.threshold;
    }

    case 'total-xp':
      return progress.totalXp >= badge.threshold;

    case 'streak': {
      const current = calculateStreak(progress.completions);
      const longest = getLongestStreak(progress.completions);
      return Math.max(current, longest) >= badge.threshold;
    }

    case 'level':
      return getLevelFromXp(progress.totalXp) >= badge.threshold;

    default:
      return false;
  }
}

export function checkNewBadges(progress: PlayerProgress): Badge[] {
  const unlockedIds = new Set(progress.unlockedBadges.map((b) => b.badgeId));
  const newBadges: Badge[] = [];

  for (const badge of badges) {
    if (unlockedIds.has(badge.id)) continue;
    if (checkBadgeRule(badge, progress)) {
      newBadges.push(badge);
    }
  }

  return newBadges;
}

export function getBadgeProgress(badge: Badge, progress: PlayerProgress): number {
  let current = 0;

  switch (badge.ruleType) {
    case 'total-completions':
      current = progress.completions.length;
      break;
    case 'category-completions': {
      if (!badge.ruleCategory) break;
      const missionIds = missions
        .filter((m) => m.category === badge.ruleCategory)
        .map((m) => m.id);
      current = progress.completions.filter((c) =>
        missionIds.includes(c.missionId)
      ).length;
      break;
    }
    case 'total-xp':
      current = progress.totalXp;
      break;
    case 'streak':
      current = Math.max(
        calculateStreak(progress.completions),
        getLongestStreak(progress.completions)
      );
      break;
    case 'level':
      current = getLevelFromXp(progress.totalXp);
      break;
  }

  return Math.min(current / badge.threshold, 1);
}

import { LEVELS, MAX_LEVEL, xpStepForLevel, type LevelConfig } from '../config/levels';

export function xpForLevel(level: number): number {
  return xpStepForLevel(level);
}

export function totalXpForLevel(level: number): number {
  return LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1].minXp;
}

export function getLevelConfig(totalXp: number): LevelConfig {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (totalXp >= l.minXp) current = l;
    else break;
  }
  return current;
}

export function getLevelFromXp(totalXp: number): number {
  return getLevelConfig(totalXp).level;
}

export function getXpInCurrentLevel(totalXp: number): number {
  return totalXp - getLevelConfig(totalXp).minXp;
}

/** XP needed to go from the start of the current level to the next one; 0 at the max level. */
export function getXpToNextLevel(totalXp: number): number {
  const { level, minXp } = getLevelConfig(totalXp);
  return level >= MAX_LEVEL ? 0 : LEVELS[level].minXp - minXp;
}

export function getLevelProgress(totalXp: number): number {
  const needed = getXpToNextLevel(totalXp);
  if (needed === 0) return 1;
  return Math.min(getXpInCurrentLevel(totalXp) / needed, 1);
}

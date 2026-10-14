export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXp) break;
    accumulated += needed;
    level++;
  }
  return level;
}

export function getXpInCurrentLevel(totalXp: number): number {
  const level = getLevelFromXp(totalXp);
  return totalXp - totalXpForLevel(level);
}

export function getXpToNextLevel(totalXp: number): number {
  const level = getLevelFromXp(totalXp);
  return xpForLevel(level);
}

export function getLevelProgress(totalXp: number): number {
  const current = getXpInCurrentLevel(totalXp);
  const needed = getXpToNextLevel(totalXp);
  if (needed === 0) return 0;
  return Math.min(current / needed, 1);
}

import { describe, it, expect } from 'vitest';
import { xpForLevel, getLevelFromXp, getXpInCurrentLevel, getXpToNextLevel, getLevelProgress } from '../utils/xp';

describe('xpForLevel', () => {
  it('returns 50 for level 1', () => {
    expect(xpForLevel(1)).toBe(50);
  });

  it('increases with level', () => {
    expect(xpForLevel(3)).toBeGreaterThan(xpForLevel(2));
    expect(xpForLevel(5)).toBeGreaterThan(xpForLevel(4));
  });

  it('uses floor of 50 * level^1.5', () => {
    expect(xpForLevel(4)).toBe(Math.floor(50 * Math.pow(4, 1.5)));
  });
});

describe('getLevelFromXp', () => {
  it('returns 1 at 0 XP', () => {
    expect(getLevelFromXp(0)).toBe(1);
  });

  it('returns 1 just below level-up threshold', () => {
    expect(getLevelFromXp(49)).toBe(1);
  });

  it('returns 2 at exactly 50 XP', () => {
    expect(getLevelFromXp(50)).toBe(2);
  });

  it('increases at higher XP totals', () => {
    expect(getLevelFromXp(500)).toBeGreaterThan(getLevelFromXp(100));
  });
});

describe('getXpInCurrentLevel', () => {
  it('returns 0 at exact level boundary', () => {
    expect(getXpInCurrentLevel(0)).toBe(0);
    expect(getXpInCurrentLevel(50)).toBe(0);
  });

  it('returns partial progress within a level', () => {
    expect(getXpInCurrentLevel(30)).toBe(30);
  });
});

describe('getXpToNextLevel', () => {
  it('returns 50 at level 1', () => {
    expect(getXpToNextLevel(0)).toBe(50);
  });
});

describe('getLevelProgress', () => {
  it('returns 0 at level start', () => {
    expect(getLevelProgress(0)).toBe(0);
  });

  it('returns value between 0 and 1', () => {
    const p = getLevelProgress(30);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThanOrEqual(1);
  });
});

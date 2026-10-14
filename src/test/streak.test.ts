import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateStreak, getLongestStreak, getLocalDate } from '../utils/streak';
import type { MissionCompletion } from '../types';

function makeCompletion(localDate: string): MissionCompletion {
  return {
    id: `c-${localDate}-${Math.random()}`,
    missionId: 'm-1',
    completedAt: `${localDate}T12:00:00.000Z`,
    localDate,
    xpAwarded: 10,
    completionType: 'educational',
  };
}

describe('getLocalDate', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = getLocalDate(new Date(2026, 0, 15));
    expect(result).toBe('2026-01-15');
  });
});

describe('calculateStreak', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 0 for empty completions', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 1 for today only', () => {
    const today = getLocalDate();
    expect(calculateStreak([makeCompletion(today)])).toBe(1);
  });

  it('returns 0 if last activity was 2+ days ago', () => {
    const twoDaysAgo = getLocalDate(new Date(Date.now() - 2 * 86400000));
    expect(calculateStreak([makeCompletion(twoDaysAgo)])).toBe(0);
  });

  it('counts consecutive days', () => {
    const today = getLocalDate();
    const yesterday = getLocalDate(new Date(Date.now() - 86400000));
    const dayBefore = getLocalDate(new Date(Date.now() - 2 * 86400000));
    const completions = [makeCompletion(today), makeCompletion(yesterday), makeCompletion(dayBefore)];
    expect(calculateStreak(completions)).toBe(3);
  });
});

describe('getLongestStreak', () => {
  it('returns 0 for empty completions', () => {
    expect(getLongestStreak([])).toBe(0);
  });

  it('returns 1 for a single completion', () => {
    expect(getLongestStreak([makeCompletion('2026-05-10')])).toBe(1);
  });

  it('finds the longest streak across gaps', () => {
    const completions = [
      makeCompletion('2026-05-01'),
      makeCompletion('2026-05-02'),
      makeCompletion('2026-05-03'),
      makeCompletion('2026-05-10'),
      makeCompletion('2026-05-11'),
    ];
    expect(getLongestStreak(completions)).toBe(3);
  });
});

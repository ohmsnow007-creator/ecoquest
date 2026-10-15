import { describe, it, expect } from 'vitest';
import { getRecentActivity } from '../utils/activity';
import type { PlayerProgress } from '../types';

const now = new Date(2026, 9, 15, 12, 0, 0);

function progressWith(missionDates: string[], quizDates: Date[]): PlayerProgress {
  return {
    totalXp: 0,
    unlockedBadges: [],
    schemaVersion: 1,
    inProgress: [],
    impactRecords: [],
    completions: missionDates.map((d, i) => ({
      id: `c${i}`, missionId: 'm', completedAt: `${d}T10:00:00.000Z`, localDate: d, xpAwarded: 10, completionType: 'educational',
    })),
    quizAttempts: quizDates.map((d, i) => ({ id: `a${i}`, startedAt: d.toISOString(), submittedAt: d.toISOString(), category: "all" as const, difficulty: "all" as const, results: [{ questionId: `q${i}`, answerId: "a", correct: true }], correctCount: 1, total: 1, scorePercent: 100, xpAwarded: 15 })),
  };
}

describe('getRecentActivity', () => {
  it('returns 7 days ending today, oldest first', () => {
    const days = getRecentActivity(progressWith([], []), 7, now);
    expect(days).toHaveLength(7);
    expect(days[6].date).toBe('2026-10-15');
    expect(days[0].date).toBe('2026-10-09');
  });

  it('counts missions and quizzes per day', () => {
    const days = getRecentActivity(
      progressWith(['2026-10-15', '2026-10-15', '2026-10-13'], [new Date(2026, 9, 15, 9, 0, 0)]),
      7,
      now,
    );
    const today = days[6];
    expect(today.missions).toBe(2);
    expect(today.quizzes).toBe(1);
    expect(today.total).toBe(3);
    expect(days[4].missions).toBe(1);
  });

  it('ignores activity outside the window', () => {
    const days = getRecentActivity(progressWith(['2026-09-01'], []), 7, now);
    expect(days.reduce((s, d) => s + d.total, 0)).toBe(0);
  });
});

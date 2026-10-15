import type { MissionCategory, PlayerProgress } from '../types';
import { getLevelFromXp, getLevelProgress, getXpInCurrentLevel, getXpToNextLevel } from './xp';
import { calculateStreak, getLocalDate, getLongestStreak } from './streak';
import { missions } from '../data/missions';

export interface PlayerStats {
  xp: number;
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  levelProgress: number;
  missionsCompleted: number;
  selfReportedCount: number;
  learningCount: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
  activityCount: number;
  todayMissions: number;
  todayXp: number;
  streak: number;
  longestStreak: number;
  badgesUnlocked: number;
  byCategory: Record<MissionCategory, number>;
}

// The one place player numbers are computed, so every page reports the same values.
export function getPlayerStats(progress: PlayerProgress, now: Date = new Date()): PlayerStats {
  const today = getLocalDate(now);
  const attempts = progress.quizAttempts;
  const byCategory: Record<MissionCategory, number> = { waste: 0, energy: 0, water: 0, transport: 0, consumption: 0, nature: 0 };
  for (const c of progress.completions) {
    const m = missions.find((x) => x.id === c.missionId);
    if (m) byCategory[m.category]++;
  }
  const todayCompletions = progress.completions.filter((c) => c.localDate === today);
  const todayQuizXp = attempts.filter((q) => getLocalDate(new Date(q.submittedAt)) === today).reduce((s, q) => s + q.xpAwarded, 0);
  const selfReportedCount = progress.completions.filter((c) => c.completionType === 'self-reported').length;

  return {
    xp: progress.totalXp,
    level: getLevelFromXp(progress.totalXp),
    xpInLevel: getXpInCurrentLevel(progress.totalXp),
    xpForNextLevel: getXpToNextLevel(progress.totalXp),
    levelProgress: getLevelProgress(progress.totalXp),
    missionsCompleted: progress.completions.length,
    selfReportedCount,
    learningCount: progress.completions.length - selfReportedCount,
    quizzesAnswered: attempts.length,
    quizzesCorrect: new Set(attempts.flatMap((a) => a.results.filter((r) => r.correct).map((r) => r.questionId))).size,
    activityCount: progress.completions.length + attempts.length,
    todayMissions: todayCompletions.length,
    todayXp: todayCompletions.reduce((s, c) => s + c.xpAwarded, 0) + todayQuizXp,
    streak: calculateStreak(progress.completions),
    longestStreak: getLongestStreak(progress.completions),
    badgesUnlocked: progress.unlockedBadges.length,
    byCategory,
  };
}

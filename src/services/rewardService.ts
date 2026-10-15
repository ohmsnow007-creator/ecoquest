import type { Badge, BadgeRecord, ChallengeReward, MissionCompletion, PlayerProgress, QuizAttempt, QuizCategory, QuizDifficulty } from '../types';
import { getQuestion } from '../data/quizzes';
import { missions } from '../data/missions';
import { checkNewBadges } from '../utils/badges';
import { getLevelFromXp } from '../utils/xp';
import { getLocalDate } from '../utils/streak';
import { createId } from '../utils/id';
import { getDailyStatus, getWeeklyStatus } from '../utils/challenges';

export type MissionRejection = 'not-found' | 'inactive' | 'already-completed' | 'not-started';

export interface RewardOutcome {
  next: PlayerProgress;
  xpAwarded: number;
  levelFrom: number;
  levelTo: number;
  newBadges: Badge[];
}

export type MissionRewardResult =
  | ({ ok: true; completion: MissionCompletion } & RewardOutcome)
  | { ok: false; reason: MissionRejection };

function finalize(prev: PlayerProgress, next: PlayerProgress, xpAwarded: number, now: Date): RewardOutcome {
  const newBadges = checkNewBadges(next);
  if (newBadges.length > 0) {
    const records: BadgeRecord[] = newBadges.map((b) => ({ badgeId: b.id, unlockedAt: now.toISOString() }));
    next = { ...next, unlockedBadges: [...next.unlockedBadges, ...records] };
  }
  return { next, xpAwarded, levelFrom: getLevelFromXp(prev.totalXp), levelTo: getLevelFromXp(next.totalXp), newBadges };
}

export function isMissionCompleted(progress: PlayerProgress, missionId: string, now: Date = new Date()): boolean {
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return false;
  if (mission.repeatPolicy === 'once') return progress.completions.some((c) => c.missionId === missionId);
  const today = getLocalDate(now);
  return progress.completions.some((c) => c.missionId === missionId && c.localDate === today);
}

/**
 * Pure: validates a mission completion and returns the complete next state (XP, badges, history).
 * Nothing is applied here; the caller persists `next` first and only then shows it.
 */
export function evaluateMissionCompletion(progress: PlayerProgress, missionId: string, now: Date, note?: string): MissionRewardResult {
  const mission = missions.find((m) => m.id === missionId);
  if (!mission) return { ok: false, reason: 'not-found' };
  if (!mission.active) return { ok: false, reason: 'inactive' };
  if (isMissionCompleted(progress, missionId, now)) return { ok: false, reason: 'already-completed' };
  if (!progress.inProgress.some((s) => s.missionId === missionId)) return { ok: false, reason: 'not-started' };

  const completion: MissionCompletion = {
    id: createId(),
    missionId,
    completedAt: now.toISOString(),
    localDate: getLocalDate(now),
    xpAwarded: mission.xpReward,
    completionType: mission.type,
    ...(note ? { note } : {}),
  };

  const next: PlayerProgress = {
    ...progress,
    totalXp: progress.totalXp + mission.xpReward,
    inProgress: progress.inProgress.filter((s) => s.missionId !== missionId),
    completions: [...progress.completions, completion],
  };
  return { ok: true, completion, ...finalize(progress, next, mission.xpReward, now) };
}

/**
 * Quiz reward rule (kept separate from grading): XP is given only the first time a question is
 * answered correctly, by difficulty. Retaking a quiz is always allowed but cannot farm XP.
 */
export const QUIZ_XP_BY_DIFFICULTY: Record<QuizDifficulty, number> = { easy: 5, medium: 8, hard: 12 };

export function correctlyAnsweredIds(progress: PlayerProgress): Set<string> {
  return new Set(progress.quizAttempts.flatMap((a) => a.results.filter((r) => r.correct).map((r) => r.questionId)));
}

export interface QuizDraft {
  id: string;
  startedAt: string;
  category: QuizCategory | 'all';
  difficulty: QuizDifficulty | 'all';
  questionIds: string[];
  answers: Record<string, string>;
}

export type QuizRewardResult =
  | ({ ok: true; attempt: QuizAttempt } & RewardOutcome)
  | { ok: false; reason: 'duplicate' | 'invalid' };

/** Pure: grades a submitted quiz against the question data and returns the next state. */
export function evaluateQuizAttempt(progress: PlayerProgress, draft: QuizDraft, now: Date): QuizRewardResult {
  if (progress.quizAttempts.some((a) => a.id === draft.id)) return { ok: false, reason: 'duplicate' };
  const questions = draft.questionIds.map((id) => getQuestion(id));
  if (questions.length === 0 || questions.some((q) => !q) || new Set(draft.questionIds).size !== draft.questionIds.length) {
    return { ok: false, reason: 'invalid' };
  }

  const already = correctlyAnsweredIds(progress);
  let xp = 0;
  const results = questions.map((q) => {
    const answerId = draft.answers[q!.id] ?? null;
    const correct = answerId === q!.correctAnswerId;
    if (correct && !already.has(q!.id)) xp += QUIZ_XP_BY_DIFFICULTY[q!.difficulty];
    return { questionId: q!.id, answerId, correct };
  });
  const correctCount = results.filter((r) => r.correct).length;

  const attempt: QuizAttempt = {
    id: draft.id,
    startedAt: draft.startedAt,
    submittedAt: now.toISOString(),
    category: draft.category,
    difficulty: draft.difficulty,
    results,
    correctCount,
    total: results.length,
    scorePercent: Math.round((correctCount / results.length) * 100),
    xpAwarded: xp,
  };
  const next: PlayerProgress = { ...progress, totalXp: progress.totalXp + xp, quizAttempts: [...progress.quizAttempts, attempt] };
  return { ok: true, attempt, ...finalize(progress, next, xp, now) };
}

export type ChallengeRejection = 'not-complete' | 'already-claimed';
export type ChallengeRewardResult = ({ ok: true; reward: ChallengeReward } & RewardOutcome) | { ok: false; reason: ChallengeRejection };

/**
 * Pure: checks that today's daily missions (or this week's challenge) are really finished in the stored
 * records and not yet rewarded for this period, then returns the next state with the bonus.
 */
export function evaluateChallengeClaim(progress: PlayerProgress, kind: 'daily' | 'weekly', playerId: string, now: Date): ChallengeRewardResult {
  const status = kind === 'daily' ? getDailyStatus(progress, playerId, now) : getWeeklyStatus(progress, playerId, now);
  if (status.claimed) return { ok: false, reason: 'already-claimed' };
  if (!status.complete) return { ok: false, reason: 'not-complete' };
  const xp = kind === 'daily' ? getDailyStatus(progress, playerId, now).bonusXp : getWeeklyStatus(progress, playerId, now).challenge.bonusXp;
  const reward: ChallengeReward = {
    id: createId(),
    kind,
    periodKey: status.periodKey,
    challengeId: kind === 'daily' ? `daily-${status.periodKey}` : getWeeklyStatus(progress, playerId, now).challenge.id,
    xpAwarded: xp,
    awardedAt: now.toISOString(),
  };
  const next: PlayerProgress = {
    ...progress,
    totalXp: progress.totalXp + xp,
    challengeRewards: [...(progress.challengeRewards ?? []), reward],
  };
  return { ok: true, reward, ...finalize(progress, next, xp, now) };
}

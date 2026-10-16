import type { Mission, MissionCategory, PlayerProgress } from '../types';
import { missions } from '../data/missions';
import { DAILY_BONUS_XP, DAILY_MISSION_COUNT, DAILY_XP_MULTIPLIER, SPECIAL_BONUS_XP, SPECIAL_PER_DAY, WEEKLY_CHALLENGES, type WeeklyChallenge } from '../config/challenges';
import { getLocalDate } from './streak';

/** Small deterministic PRNG so the same player sees the same picks all day (and on every device refresh). */
function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(list: T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Local Monday of the week containing `date`, as YYYY-MM-DD. */
export function weekStart(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return getLocalDate(d);
}

/** Days left in this week including today (Sunday = 1). */
export function daysLeftInWeek(date: Date): number {
  return 7 - ((date.getDay() + 6) % 7);
}

/** Missions that can be done again every day are the only ones eligible as daily missions. */
export const DAILY_POOL: Mission[] = missions.filter((m) => m.active && m.repeatPolicy === 'daily');

/** Today's daily missions for this player: different categories first, stable for the whole day. */
export function getDailyMissions(playerId: string, date: Date = new Date()): Mission[] {
  const order = shuffled(DAILY_POOL, seeded(`daily:${playerId}:${getLocalDate(date)}`));
  const picks: Mission[] = [];
  const used = new Set<MissionCategory>();
  for (const m of order) {
    if (picks.length < DAILY_MISSION_COUNT && !used.has(m.category)) {
      picks.push(m);
      used.add(m.category);
    }
  }
  for (const m of order) if (picks.length < DAILY_MISSION_COUNT && !picks.includes(m)) picks.push(m);
  return picks;
}

/** Today's special daily missions (the first 1–2 of the daily picks; 2 on Saturday and Sunday). */
export function getSpecialMissionIds(playerId: string, date: Date = new Date()): string[] {
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  return getDailyMissions(playerId, date)
    .slice(0, weekend ? SPECIAL_PER_DAY.weekend : SPECIAL_PER_DAY.weekday)
    .map((m) => m.id);
}

/** XP a mission pays if completed now: ×3 when it is one of today's daily missions, +bonus when special. */
export function missionXpToday(mission: Mission, playerId: string | undefined, date: Date = new Date()): { xp: number; daily: boolean; special: boolean } {
  if (!playerId) return { xp: mission.xpReward, daily: false, special: false };
  const daily = getDailyMissions(playerId, date).some((m) => m.id === mission.id);
  const special = getSpecialMissionIds(playerId, date).includes(mission.id);
  return { xp: mission.xpReward * (daily ? DAILY_XP_MULTIPLIER : 1) + (special ? SPECIAL_BONUS_XP : 0), daily, special };
}

export function getWeeklyChallenge(playerId: string, date: Date = new Date()): WeeklyChallenge {
  const r = seeded(`weekly:${playerId}:${weekStart(date)}`);
  return WEEKLY_CHALLENGES[Math.floor(r() * WEEKLY_CHALLENGES.length)];
}

const rewards = (p: PlayerProgress) => p.challengeRewards ?? [];

export interface DailyStatus {
  periodKey: string;
  missions: { mission: Mission; done: boolean }[];
  doneCount: number;
  complete: boolean;
  claimed: boolean;
  bonusXp: number;
}

export function getDailyStatus(progress: PlayerProgress, playerId: string, date: Date = new Date()): DailyStatus {
  const today = getLocalDate(date);
  const doneToday = new Set(progress.completions.filter((c) => c.localDate === today).map((c) => c.missionId));
  const list = getDailyMissions(playerId, date).map((mission) => ({ mission, done: doneToday.has(mission.id) }));
  const doneCount = list.filter((x) => x.done).length;
  return {
    periodKey: today,
    missions: list,
    doneCount,
    complete: doneCount === list.length,
    claimed: rewards(progress).some((r) => r.kind === 'daily' && r.periodKey === today),
    bonusXp: DAILY_BONUS_XP,
  };
}

export interface WeeklyStatus {
  periodKey: string;
  challenge: WeeklyChallenge;
  count: number;
  target: number;
  complete: boolean;
  claimed: boolean;
  daysLeft: number;
}

export function getWeeklyStatus(progress: PlayerProgress, playerId: string, date: Date = new Date()): WeeklyStatus {
  const start = weekStart(date);
  const end = getLocalDate(new Date(new Date(`${start}T00:00:00`).getTime() + 6 * 86_400_000));
  const challenge = getWeeklyChallenge(playerId, date);
  const inWeek = progress.completions.filter((c) => c.localDate >= start && c.localDate <= end);
  const categoryOf = (id: string) => missions.find((m) => m.id === id)?.category;
  const goal = challenge.goal;
  let count: number;
  switch (goal.type) {
    case 'category':
      count = inWeek.filter((c) => categoryOf(c.missionId) === goal.category).length;
      break;
    case 'missions':
      count = inWeek.length;
      break;
    case 'categories':
      count = new Set(inWeek.map((c) => categoryOf(c.missionId)).filter(Boolean)).size;
      break;
    case 'quizzes':
      count = progress.quizAttempts.filter((a) => {
        const d = getLocalDate(new Date(a.submittedAt));
        return d >= start && d <= end;
      }).length;
      break;
  }
  return {
    periodKey: start,
    challenge,
    count: Math.min(count, goal.target),
    target: goal.target,
    complete: count >= goal.target,
    claimed: rewards(progress).some((r) => r.kind === 'weekly' && r.periodKey === start),
    daysLeft: daysLeftInWeek(date),
  };
}

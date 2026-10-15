import type { PlayerProfile, PlayerProgress, MissionCompletion, BadgeRecord, ChallengeReward, TimedQuizRun, AdminGrant, QuizAttempt, QuizQuestionResult, MissionType, MissionStart, ImpactRecord, ImpactActivityType, WasteType } from '../types';
import { IMPACT_ACTIVITIES } from '../data/impactActivities';
import { COSMETICS } from '../data/cosmetics';
import { validateDisplayName } from '../utils/profile';
import { DEFAULT_AVATAR_ID, DEFAULT_PROFILE_COLOR, INTERESTS, MAX_INTERESTS, isKnownAvatar, isKnownProfileColor } from '../data/avatars';

const STORAGE_KEYS = {
  profile: 'ecoquest_profile',
  progress: 'ecoquest_progress',
  inboxSeen: 'ecoquest_inbox_seen',
  adminLock: 'ecoquest_admin_lock',
} as const;

const CURRENT_SCHEMA_VERSION = 1;
const MISSION_TYPES: MissionType[] = ['educational', 'simulation', 'self-reported'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isXp = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

function getDefaultProgress(): PlayerProgress {
  return { totalXp: 0, impactRecords: [], inProgress: [], completions: [], unlockedBadges: [], quizAttempts: [], challengeRewards: [], schemaVersion: CURRENT_SCHEMA_VERSION };
}

// Returns a usable profile, repairing optional fields; null when the core identity is unusable.
export function sanitizeProfile(data: unknown): PlayerProfile | null {
  if (!isObj(data) || !isStr(data.id) || typeof data.displayName !== 'string') return null;
  const name = validateDisplayName(data.displayName);
  if (!name.ok) return null;

  const prefs = isObj(data.preferences) ? data.preferences : {};
  const knownInterests = new Set(INTERESTS.map((i) => i.id));
  const goals = Array.isArray(prefs.selectedGoalIds)
    ? [...new Set(prefs.selectedGoalIds.filter((g): g is string => typeof g === 'string' && knownInterests.has(g)))].slice(0, MAX_INTERESTS)
    : [];
  const now = new Date().toISOString();

  return {
    id: data.id,
    displayName: name.value,
    avatarId: isKnownAvatar(data.avatarId) ? data.avatarId : DEFAULT_AVATAR_ID,
    createdAt: isStr(data.createdAt) ? data.createdAt : now,
    updatedAt: isStr(data.updatedAt) ? data.updatedAt : now,
    preferences: {
      reducedMotion: prefs.reducedMotion === true,
      selectedGoalIds: goals,
      profileColor: isKnownProfileColor(prefs.profileColor) ? prefs.profileColor : DEFAULT_PROFILE_COLOR,
      soundEffects: prefs.soundEffects === true,
      inAppToasts: prefs.inAppToasts !== false,
      celebrations: prefs.celebrations !== false,
      ...sanitizeOutfit(prefs.outfit),
      ...(Array.isArray(prefs.seenCosmetics)
        ? { seenCosmetics: prefs.seenCosmetics.filter((id): id is string => isStr(id) && COSMETICS.some((c) => c.id === id)) }
        : {}),
    },
  };
}

// Keeps known cosmetic ids in their own slot; whether they are unlocked is checked when worn.
function sanitizeOutfit(v: unknown): { outfit?: Partial<Record<'hat' | 'eyes' | 'bag', string>> } {
  if (!isObj(v)) return {};
  const outfit: Partial<Record<'hat' | 'eyes' | 'bag', string>> = {};
  for (const slot of ['hat', 'eyes', 'bag'] as const) {
    const id = v[slot];
    if (isStr(id) && COSMETICS.some((c) => c.id === id && c.slot === slot)) outfit[slot] = id;
  }
  return Object.keys(outfit).length ? { outfit } : {};
}

function sanitizeCompletion(v: unknown): MissionCompletion | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.missionId) || !isStr(v.completedAt)) return null;
  if (typeof v.localDate !== 'string' || !DATE_RE.test(v.localDate) || !isXp(v.xpAwarded)) return null;
  if (!MISSION_TYPES.includes(v.completionType as MissionType)) return null;
  return {
    id: v.id,
    missionId: v.missionId,
    completedAt: v.completedAt,
    localDate: v.localDate,
    xpAwarded: v.xpAwarded,
    completionType: v.completionType as MissionType,
    ...(typeof v.note === 'string' ? { note: v.note } : {}),
  };
}

function sanitizeChallengeReward(v: unknown): ChallengeReward | null {
  if (!isObj(v) || !isStr(v.id) || (v.kind !== 'daily' && v.kind !== 'weekly') || !isStr(v.periodKey) || !DATE_RE.test(v.periodKey)) return null;
  if (!isStr(v.challengeId) || !isXp(v.xpAwarded) || !isStr(v.awardedAt)) return null;
  return { id: v.id, kind: v.kind, periodKey: v.periodKey, challengeId: v.challengeId, xpAwarded: v.xpAwarded, awardedAt: v.awardedAt };
}

export const TIMED_RUNS_KEPT = 50;

function sanitizeTimedRun(v: unknown): TimedQuizRun | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.at)) return null;
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 500;
  if (!ok(v.correct) || !ok(v.answered) || v.correct > v.answered) return null;
  return { id: v.id, at: v.at, correct: v.correct, answered: v.answered };
}

function sanitizeBadge(v: unknown): BadgeRecord | null {
  if (!isObj(v) || !isStr(v.badgeId) || !isStr(v.unlockedAt)) return null;
  return { badgeId: v.badgeId, unlockedAt: v.unlockedAt, ...(v.source === 'admin' ? { source: 'admin' as const } : {}) };
}

function sanitizeAdminGrant(v: unknown): AdminGrant | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.at)) return null;
  if (v.kind === 'xp' && typeof v.amount === 'number' && Number.isInteger(v.amount) && v.amount > 0 && v.amount <= 100000) {
    return { id: v.id, at: v.at, kind: 'xp', amount: v.amount };
  }
  if (v.kind === 'badge' && isStr(v.badgeId)) return { id: v.id, at: v.at, kind: 'badge', badgeId: v.badgeId };
  if (v.kind === 'cosmetic' && isStr(v.cosmeticId) && COSMETICS.some((c) => c.id === v.cosmeticId)) {
    return { id: v.id, at: v.at, kind: 'cosmetic', cosmeticId: v.cosmeticId };
  }
  return null;
}

const QUIZ_CATS = ['all', 'waste', 'energy', 'water', 'carbon', 'lifestyle'];
const QUIZ_DIFFS = ['all', 'easy', 'medium', 'hard'];

function sanitizeAttempt(v: unknown): QuizAttempt | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.startedAt) || !isStr(v.submittedAt) || !isXp(v.xpAwarded) || !Array.isArray(v.results)) return null;
  const results: QuizQuestionResult[] = v.results
    .filter((r): r is Obj => isObj(r) && isStr(r.questionId) && typeof r.correct === 'boolean')
    .map((r) => ({ questionId: r.questionId as string, answerId: typeof r.answerId === 'string' ? r.answerId : null, correct: r.correct as boolean }));
  if (results.length === 0) return null;
  const correctCount = results.filter((r) => r.correct).length;
  return {
    id: v.id,
    startedAt: v.startedAt,
    submittedAt: v.submittedAt,
    category: (QUIZ_CATS.includes(v.category as string) ? v.category : 'all') as QuizAttempt['category'],
    difficulty: (QUIZ_DIFFS.includes(v.difficulty as string) ? v.difficulty : 'all') as QuizAttempt['difficulty'],
    results,
    correctCount,
    total: results.length,
    scorePercent: Math.round((correctCount / results.length) * 100),
    xpAwarded: v.xpAwarded,
    ...(v.legacy === true ? { legacy: true } : {}),
  };
}

/** Old saves stored one record per answered question; each becomes a one-question legacy attempt. */
function migrateLegacyQuiz(v: unknown): QuizAttempt | null {
  if (!isObj(v) || !isStr(v.quizId) || !isStr(v.completedAt) || typeof v.correct !== 'boolean' || !isXp(v.xpAwarded)) return null;
  return {
    id: `legacy-${v.quizId}`,
    startedAt: v.completedAt,
    submittedAt: v.completedAt,
    category: 'all',
    difficulty: 'all',
    results: [{ questionId: v.quizId, answerId: null, correct: v.correct }],
    correctCount: v.correct ? 1 : 0,
    total: 1,
    scorePercent: v.correct ? 100 : 0,
    xpAwarded: v.xpAwarded,
    legacy: true,
  };
}

function sanitizeStart(v: unknown): MissionStart | null {
  if (!isObj(v) || !isStr(v.missionId) || !isStr(v.startedAt)) return null;
  const steps = Array.isArray(v.completedSteps)
    ? [...new Set(v.completedSteps.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < 50))].sort((a, b) => a - b)
    : [];
  return { missionId: v.missionId, startedAt: v.startedAt, completedSteps: steps };
}

const WASTE_TYPES: WasteType[] = ['plastic', 'paper', 'glass', 'metal', 'organic', 'other'];

function sanitizeImpact(v: unknown): ImpactRecord | null {
  if (!isObj(v) || !isStr(v.id) || typeof v.date !== 'string' || !DATE_RE.test(v.date) || !isStr(v.createdAt)) return null;
  const meta = IMPACT_ACTIVITIES.find((a) => a.type === (v.activityType as ImpactActivityType));
  if (!meta || v.unit !== meta.unit) return null;
  if (typeof v.quantity !== 'number' || !Number.isFinite(v.quantity) || v.quantity <= 0 || v.quantity > meta.max) return null;
  return {
    id: v.id,
    activityType: meta.type,
    quantity: v.quantity,
    unit: meta.unit,
    date: v.date,
    ...(meta.type === 'waste-sorted' ? { wasteType: WASTE_TYPES.includes(v.wasteType as WasteType) ? (v.wasteType as WasteType) : 'other' } : {}),
    ...(isStr(v.emissionFactorId) ? { emissionFactorId: v.emissionFactorId } : {}),
    source: 'user-entered',
    calculationVersion: isStr(v.calculationVersion) ? v.calculationVersion : 'unknown',
    createdAt: v.createdAt,
  };
}

function cleanList<T>(v: unknown, fn: (x: unknown) => T | null): T[] {
  return Array.isArray(v) ? v.map(fn).filter((x): x is T => x !== null) : [];
}

// Keeps every well-formed record and drops the rest; totals are recomputed from the kept records.
export function sanitizeProgress(data: unknown): PlayerProgress {
  if (!isObj(data)) return getDefaultProgress();
  const completions = cleanList(data.completions, sanitizeCompletion);
  const seenAttempts = new Set<string>();
  const quizAttempts = [...cleanList(data.quizAttempts, sanitizeAttempt), ...cleanList(data.quizCompletions, migrateLegacyQuiz)].filter(
    (a) => !seenAttempts.has(a.id) && seenAttempts.add(a.id),
  );
  const seenBadges = new Set<string>();
  const unlockedBadges = cleanList(data.unlockedBadges, sanitizeBadge).filter((b) => !seenBadges.has(b.badgeId) && seenBadges.add(b.badgeId));
  // One bonus per kind and period, even if a tampered or duplicated save lists more.
  const seenRewards = new Set<string>();
  const challengeRewards = cleanList(data.challengeRewards, sanitizeChallengeReward).filter(
    (r) => !seenRewards.has(`${r.kind}:${r.periodKey}`) && seenRewards.add(`${r.kind}:${r.periodKey}`),
  );
  const adminGrants = cleanList(data.adminGrants, sanitizeAdminGrant);
  const totalXp =
    completions.reduce((s, c) => s + c.xpAwarded, 0) +
    quizAttempts.reduce((s, q) => s + q.xpAwarded, 0) +
    challengeRewards.reduce((s, r) => s + r.xpAwarded, 0) +
    adminGrants.reduce((s, g) => s + (g.kind === 'xp' ? g.amount : 0), 0);
  const seenStarts = new Set<string>();
  const inProgress = cleanList(data.inProgress, sanitizeStart).filter((s) => !seenStarts.has(s.missionId) && seenStarts.add(s.missionId));
  const impactRecords = cleanList(data.impactRecords, sanitizeImpact);
  const timedRuns = cleanList(data.timedRuns, sanitizeTimedRun).slice(-TIMED_RUNS_KEPT);
  return {
    totalXp,
    impactRecords,
    inProgress,
    completions,
    unlockedBadges,
    quizAttempts,
    challengeRewards,
    ...(timedRuns.length ? { timedRuns } : {}),
    ...(adminGrants.length ? { adminGrants } : {}),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

export const CORRUPT_BACKUP_SUFFIX = '_corrupt_backup';

// Unreadable JSON is copied to a backup key before anything can overwrite it, then treated as empty.
function readJson(key: string): unknown {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    try {
      localStorage.setItem(key + CORRUPT_BACKUP_SUFFIX, raw);
      localStorage.removeItem(key);
    } catch {
      // Storage full or blocked: nothing more we can do safely.
    }
    console.warn(`EcoQuest: ${key} was not valid JSON; a copy was kept in ${key}${CORRUPT_BACKUP_SUFFIX}.`);
    return null;
  }
}

function writeJson(key: string, value: unknown, label: string): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to save ${label}:`, e);
    return false;
  }
}

export const storageService = {
  getDefaultProgress,

  getProfile(): PlayerProfile | null {
    return sanitizeProfile(readJson(STORAGE_KEYS.profile));
  },

  saveProfile(profile: PlayerProfile): boolean {
    return writeJson(STORAGE_KEYS.profile, profile, 'profile');
  },

  getProgress(): PlayerProgress {
    return sanitizeProgress(readJson(STORAGE_KEYS.progress));
  },

  saveProgress(progress: PlayerProgress): boolean {
    return writeJson(STORAGE_KEYS.progress, progress, 'progress');
  },

  getInboxSeenAt(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.inboxSeen);
    } catch {
      return null;
    }
  },

  setInboxSeenAt(iso: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.inboxSeen, iso);
    } catch {
      // Not critical: the unread dot simply returns next visit.
    }
  },

  /** Bytes used by EcoQuest's own keys (UTF-16 chars × 2, as browsers count localStorage). */
  getUsage(): { bytes: number; keys: { key: string; bytes: number }[] } {
    const all = Object.values(STORAGE_KEYS).flatMap((k) => [k, k + CORRUPT_BACKUP_SUFFIX]);
    const keys = all.map((key) => {
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(key);
      } catch {
        raw = null;
      }
      return { key, bytes: raw ? (key.length + raw.length) * 2 : 0 };
    });
    const present = keys.filter((k) => k.bytes > 0 || !k.key.endsWith(CORRUPT_BACKUP_SUFFIX));
    return { bytes: present.reduce((s, k) => s + k.bytes, 0), keys: present };
  },

  /** Until when (ms) this device is locked out of the admin PIN pad; 0 when not locked. */
  getAdminLockUntil(): number {
    try {
      const n = Number(localStorage.getItem(STORAGE_KEYS.adminLock));
      // Ignore anything far in the future (tampered or clock change): the lockout is one minute.
      return Number.isFinite(n) && n > 0 && n - Date.now() <= 60_000 ? n : 0;
    } catch {
      return 0;
    }
  },

  setAdminLockUntil(until: number): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.adminLock, String(until));
      return true;
    } catch {
      return false;
    }
  },

  resetAll(): void {
    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key);
        localStorage.removeItem(key + CORRUPT_BACKUP_SUFFIX);
      }
    } catch (e) {
      console.error('Failed to reset:', e);
    }
  },

  exportData(): string {
    return JSON.stringify(
      { profile: this.getProfile(), progress: this.getProgress(), exportedAt: new Date().toISOString() },
      null,
      2,
    );
  },
};

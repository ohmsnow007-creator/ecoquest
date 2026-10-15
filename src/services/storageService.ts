import type { PlayerProfile, PlayerProgress, MissionCompletion, BadgeRecord, QuizCompletion, MissionType, MissionStart } from '../types';
import { validateDisplayName } from '../utils/profile';
import { DEFAULT_AVATAR_ID, DEFAULT_PROFILE_COLOR, INTERESTS, MAX_INTERESTS, isKnownAvatar, isKnownProfileColor } from '../data/avatars';

const STORAGE_KEYS = {
  profile: 'ecoquest_profile',
  progress: 'ecoquest_progress',
  inboxSeen: 'ecoquest_inbox_seen',
} as const;

const CURRENT_SCHEMA_VERSION = 1;
const MISSION_TYPES: MissionType[] = ['educational', 'simulation', 'self-reported'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isXp = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

function getDefaultProgress(): PlayerProgress {
  return { totalXp: 0, inProgress: [], completions: [], unlockedBadges: [], quizCompletions: [], schemaVersion: CURRENT_SCHEMA_VERSION };
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
    },
  };
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

function sanitizeBadge(v: unknown): BadgeRecord | null {
  return isObj(v) && isStr(v.badgeId) && isStr(v.unlockedAt) ? { badgeId: v.badgeId, unlockedAt: v.unlockedAt } : null;
}

function sanitizeQuiz(v: unknown): QuizCompletion | null {
  if (!isObj(v) || !isStr(v.quizId) || !isStr(v.completedAt) || typeof v.correct !== 'boolean' || !isXp(v.xpAwarded)) return null;
  return { quizId: v.quizId, completedAt: v.completedAt, correct: v.correct, xpAwarded: v.xpAwarded };
}

function sanitizeStart(v: unknown): MissionStart | null {
  return isObj(v) && isStr(v.missionId) && isStr(v.startedAt) ? { missionId: v.missionId, startedAt: v.startedAt } : null;
}

function cleanList<T>(v: unknown, fn: (x: unknown) => T | null): T[] {
  return Array.isArray(v) ? v.map(fn).filter((x): x is T => x !== null) : [];
}

// Keeps every well-formed record and drops the rest; totals are recomputed from the kept records.
export function sanitizeProgress(data: unknown): PlayerProgress {
  if (!isObj(data)) return getDefaultProgress();
  const completions = cleanList(data.completions, sanitizeCompletion);
  const quizCompletions = cleanList(data.quizCompletions, sanitizeQuiz);
  const seenBadges = new Set<string>();
  const unlockedBadges = cleanList(data.unlockedBadges, sanitizeBadge).filter((b) => !seenBadges.has(b.badgeId) && seenBadges.add(b.badgeId));
  const totalXp =
    completions.reduce((s, c) => s + c.xpAwarded, 0) + quizCompletions.reduce((s, q) => s + q.xpAwarded, 0);
  const seenStarts = new Set<string>();
  const inProgress = cleanList(data.inProgress, sanitizeStart).filter((s) => !seenStarts.has(s.missionId) && seenStarts.add(s.missionId));
  return { totalXp, inProgress, completions, unlockedBadges, quizCompletions, schemaVersion: CURRENT_SCHEMA_VERSION };
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
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

  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.profile);
      localStorage.removeItem(STORAGE_KEYS.progress);
      localStorage.removeItem(STORAGE_KEYS.inboxSeen);
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

import type { PlayerProfile, PlayerProgress } from '../types';

const STORAGE_KEYS = {
  profile: 'ecoquest_profile',
  progress: 'ecoquest_progress',
} as const;

const CURRENT_SCHEMA_VERSION = 1;

function getDefaultProgress(): PlayerProgress {
  return {
    totalXp: 0,
    completions: [],
    unlockedBadges: [],
    quizCompletions: [],
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

function isValidProfile(data: unknown): data is PlayerProfile {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.id === 'string' && typeof d.displayName === 'string' && typeof d.avatarId === 'string';
}

function isValidProgress(data: unknown): data is PlayerProgress {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return typeof d.totalXp === 'number' && Array.isArray(d.completions);
}

export const storageService = {
  getProfile(): PlayerProfile | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.profile);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!isValidProfile(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  },

  getProgress(): PlayerProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      if (!raw) return getDefaultProgress();
      const parsed = JSON.parse(raw);
      if (!isValidProgress(parsed)) return getDefaultProgress();
      if (!parsed.schemaVersion) {
        parsed.schemaVersion = CURRENT_SCHEMA_VERSION;
      }
      if (!parsed.unlockedBadges) {
        parsed.unlockedBadges = [];
      }
      if (!parsed.quizCompletions) {
        parsed.quizCompletions = [];
      }
      return parsed;
    } catch {
      return getDefaultProgress();
    }
  },

  saveProgress(progress: PlayerProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  resetAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.profile);
      localStorage.removeItem(STORAGE_KEYS.progress);
    } catch (e) {
      console.error('Failed to reset:', e);
    }
  },

  exportData(): string {
    const profile = this.getProfile();
    const progress = this.getProgress();
    return JSON.stringify({ profile, progress, exportedAt: new Date().toISOString() }, null, 2);
  },
};

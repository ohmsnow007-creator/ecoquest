import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';

beforeEach(() => {
  localStorage.clear();
});

describe('storageService.getProfile', () => {
  it('returns null when nothing stored', () => {
    expect(storageService.getProfile()).toBeNull();
  });

  it('returns a valid profile and fills missing preferences with defaults', () => {
    const createdAt = new Date().toISOString();
    localStorage.setItem('ecoquest_profile', JSON.stringify({ id: 'p1', displayName: 'Test', avatarId: 'avatar-sun', createdAt }));
    const p = storageService.getProfile()!;
    expect(p).toMatchObject({ id: 'p1', displayName: 'Test', avatarId: 'avatar-sun', createdAt });
    expect(p.preferences).toEqual({ reducedMotion: false, selectedGoalIds: [], profileColor: 'mint', soundEffects: true, inAppToasts: true, celebrations: true });
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('ecoquest_profile', 'not json');
    expect(storageService.getProfile()).toBeNull();
  });

  it('returns null when the name is unusable', () => {
    localStorage.setItem('ecoquest_profile', JSON.stringify({ id: 'p1', displayName: '   ', avatarId: 'avatar-leaf' }));
    expect(storageService.getProfile()).toBeNull();
  });

  it('repairs unknown avatar, color and interests', () => {
    localStorage.setItem(
      'ecoquest_profile',
      JSON.stringify({
        id: 'p1', displayName: 'Test', avatarId: 'http://evil.example/x.png',
        preferences: { reducedMotion: 'yes', profileColor: 'neon', selectedGoalIds: ['goal-waste', 'nope', 42, 'goal-waste'] },
      }),
    );
    const p = storageService.getProfile()!;
    expect(p.avatarId).toBe('avatar-leaf');
    expect(p.preferences).toEqual({ reducedMotion: false, selectedGoalIds: ['goal-waste'], profileColor: 'mint', soundEffects: true, inAppToasts: true, celebrations: true });
  });
});

describe('storageService.getProgress', () => {
  it('returns default progress when nothing stored', () => {
    const p = storageService.getProgress();
    expect(p.totalXp).toBe(0);
    expect(p.completions).toEqual([]);
    expect(p.quizAttempts).toEqual([]);
  });

  it('defaults missing quiz attempts to an empty list', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify({ totalXp: 0, completions: [], unlockedBadges: [] }));
    expect(storageService.getProgress().quizAttempts).toEqual([]);
  });

  it('falls back to defaults for non-object data', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify([1, 2, 3]));
    expect(storageService.getProgress()).toEqual(storageService.getDefaultProgress());
  });

  it('drops malformed records and recomputes XP from real records', () => {
    localStorage.setItem(
      'ecoquest_progress',
      JSON.stringify({
        totalXp: 99999,
        completions: [
          { id: 'c1', missionId: 'waste-001', completedAt: '2026-10-15T10:00:00Z', localDate: '2026-10-15', xpAwarded: 20, completionType: 'self-reported' },
          { id: 'c2', missionId: 'x', completedAt: 'x', localDate: 'yesterday', xpAwarded: 500, completionType: 'self-reported' },
          'garbage',
        ],
        quizCompletions: [
          { quizId: 'q1', completedAt: '2026-10-15T10:00:00Z', correct: true, xpAwarded: 15 },
          { quizId: 'q2', completedAt: '2026-10-15T10:00:00Z', correct: 'maybe', xpAwarded: 15 },
        ],
        unlockedBadges: [{ badgeId: 'b1', unlockedAt: 't' }, { badgeId: 'b1', unlockedAt: 't' }, { nope: true }],
      }),
    );
    const p = storageService.getProgress();
    expect(p.completions.map((c) => c.id)).toEqual(['c1']);
    expect(p.quizAttempts.map((q) => q.id)).toEqual(['legacy-q1']);
    expect(p.quizAttempts[0]).toMatchObject({ legacy: true, correctCount: 1, total: 1, xpAwarded: 15 });
    expect(p.unlockedBadges).toHaveLength(1);
    expect(p.totalXp).toBe(35);
  });
});

describe('storageService.saveProfile', () => {
  it('persists profile to localStorage', () => {
    const profile = {
      id: 'p1', displayName: 'Test', avatarId: 'avatar-leaf',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      preferences: { reducedMotion: false, selectedGoalIds: [] },
    };
    storageService.saveProfile(profile);
    expect(JSON.parse(localStorage.getItem('ecoquest_profile')!)).toEqual(profile);
  });
});

describe('storageService.resetAll', () => {
  it('clears all stored data', () => {
    localStorage.setItem('ecoquest_profile', '{}');
    localStorage.setItem('ecoquest_progress', '{}');
    storageService.resetAll();
    expect(localStorage.getItem('ecoquest_profile')).toBeNull();
    expect(localStorage.getItem('ecoquest_progress')).toBeNull();
  });
});

describe('storageService.exportData', () => {
  it('returns JSON with profile and progress', () => {
    const result = JSON.parse(storageService.exportData());
    expect(result).toHaveProperty('profile');
    expect(result).toHaveProperty('progress');
    expect(result).toHaveProperty('exportedAt');
  });
});

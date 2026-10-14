import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';

beforeEach(() => {
  localStorage.clear();
});

describe('storageService.getProfile', () => {
  it('returns null when nothing stored', () => {
    expect(storageService.getProfile()).toBeNull();
  });

  it('returns a valid profile', () => {
    const profile = { id: 'p1', displayName: 'Test', avatarId: 'avatar-leaf', createdAt: new Date().toISOString() };
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    expect(storageService.getProfile()).toEqual(profile);
  });

  it('returns null for invalid data', () => {
    localStorage.setItem('ecoquest_profile', 'not json');
    expect(storageService.getProfile()).toBeNull();
  });
});

describe('storageService.getProgress', () => {
  it('returns default progress when nothing stored', () => {
    const p = storageService.getProgress();
    expect(p.totalXp).toBe(0);
    expect(p.completions).toEqual([]);
    expect(p.quizCompletions).toEqual([]);
  });

  it('migrates missing quizCompletions', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify({
      totalXp: 100, completions: [], unlockedBadges: [],
    }));
    const p = storageService.getProgress();
    expect(p.quizCompletions).toEqual([]);
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

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from '../App';
import { SKIP_INTRO_TEST_KEY } from '../components/layout/launcherContext';
import { DAILY_POOL, getDailyMissions, getDailyStatus, getWeeklyChallenge, getWeeklyStatus, weekStart, daysLeftInWeek } from '../utils/challenges';
import { DAILY_BONUS_XP, DAILY_MISSION_COUNT, WEEKLY_CHALLENGES } from '../config/challenges';
import { evaluateChallengeClaim } from '../services/rewardService';
import { storageService, sanitizeProgress } from '../services/storageService';
import { getLocalDate } from '../utils/streak';
import type { MissionCompletion, PlayerProgress } from '../types';

const ID = 'player-1';
const fresh = (): PlayerProgress => storageService.getDefaultProgress();
const done = (missionId: string, at: Date, xp = 20): MissionCompletion => ({
  id: `c-${missionId}-${at.getTime()}`, missionId, completedAt: at.toISOString(), localDate: getLocalDate(at), xpAwarded: xp, completionType: 'educational',
});

describe('daily missions', () => {
  const day = new Date(2026, 9, 15, 10);

  it('picks 3 repeatable missions in different categories, stable for the whole day', () => {
    const picks = getDailyMissions(ID, day);
    expect(picks).toHaveLength(DAILY_MISSION_COUNT);
    expect(picks.every((m) => m.repeatPolicy === 'daily' && m.active)).toBe(true);
    expect(new Set(picks.map((m) => m.category)).size).toBe(DAILY_MISSION_COUNT);
    expect(getDailyMissions(ID, new Date(2026, 9, 15, 23, 59)).map((m) => m.id)).toEqual(picks.map((m) => m.id));
  });

  it('changes from day to day', () => {
    const days = Array.from({ length: 14 }, (_, i) => getDailyMissions(ID, new Date(2026, 9, 1 + i)).map((m) => m.id).join());
    expect(new Set(days).size).toBeGreaterThan(7);
  });

  it('counts only completions made today', () => {
    const picks = getDailyMissions(ID, day);
    const yesterday = new Date(2026, 9, 14, 10);
    const p = { ...fresh(), completions: [done(picks[0].id, day), done(picks[1].id, yesterday)] };
    const s = getDailyStatus(p, ID, day);
    expect(s.doneCount).toBe(1);
    expect(s.complete).toBe(false);
  });
});

describe('weekly challenge', () => {
  it('weeks run Monday to Sunday in local time', () => {
    expect(weekStart(new Date(2026, 9, 15))).toBe('2026-10-12'); // Thursday → Monday
    expect(weekStart(new Date(2026, 9, 18))).toBe('2026-10-12'); // Sunday
    expect(weekStart(new Date(2026, 9, 19))).toBe('2026-10-19'); // next Monday
    expect(daysLeftInWeek(new Date(2026, 9, 18))).toBe(1);
  });

  it('every category challenge can be finished with repeatable missions', () => {
    for (const w of WEEKLY_CHALLENGES) {
      if (w.goal.type !== 'category') continue;
      const category = w.goal.category;
      expect(DAILY_POOL.filter((m) => m.category === category).length).toBeGreaterThan(0);
    }
  });

  it('counts only this week', () => {
    const now = new Date(2026, 9, 15, 12);
    const challenge = getWeeklyChallenge(ID, now);
    const lastWeek = new Date(2026, 9, 10, 12);
    const pool = challenge.goal.type === 'category' ? DAILY_POOL.filter((m) => m.category === (challenge.goal as { category: string }).category) : DAILY_POOL;
    const p = { ...fresh(), completions: [done(pool[0].id, lastWeek), done(pool[0].id, now)] };
    const s = getWeeklyStatus(p, ID, now);
    if (challenge.goal.type === 'quizzes') expect(s.count).toBe(0);
    else expect(s.count).toBe(1);
  });
});

describe('challenge rewards', () => {
  const day = new Date(2026, 9, 15, 10);

  it('pays the daily bonus once, only when all three are done', () => {
    const picks = getDailyMissions(ID, day);
    const partial = { ...fresh(), completions: [done(picks[0].id, day)], totalXp: 20 };
    expect(evaluateChallengeClaim(partial, 'daily', ID, day)).toEqual({ ok: false, reason: 'not-complete' });

    const all = { ...fresh(), completions: picks.map((m, i) => done(m.id, new Date(day.getTime() + i * 1000))), totalXp: 60 };
    const r = evaluateChallengeClaim(all, 'daily', ID, day);
    if (!r.ok) throw new Error(r.reason);
    expect(r.next.totalXp).toBe(60 + DAILY_BONUS_XP);
    expect(evaluateChallengeClaim(r.next, 'daily', ID, day)).toEqual({ ok: false, reason: 'already-claimed' });
  });

  it('storage keeps one reward per period and counts it in total XP', () => {
    const reward = { id: 'r1', kind: 'daily', periodKey: '2026-10-15', challengeId: 'daily-2026-10-15', xpAwarded: 15, awardedAt: '2026-10-15T10:00:00.000Z' };
    const p = sanitizeProgress({ challengeRewards: [reward, { ...reward, id: 'r2' }, { kind: 'weekly' }] });
    expect(p.challengeRewards).toHaveLength(1);
    expect(p.totalXp).toBe(15);
  });
});

describe('home page', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(SKIP_INTRO_TEST_KEY, '1');
    localStorage.setItem('ecoquest_profile', JSON.stringify({
      id: ID, displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
      preferences: { reducedMotion: true, selectedGoalIds: [], profileColor: 'mint' },
    }));
  });

  it('shows today’s missions and the weekly challenge; the bonus can be claimed once and survives a refresh', async () => {
    const now = new Date();
    const picks = getDailyMissions(ID, now);
    localStorage.setItem('ecoquest_progress', JSON.stringify({ ...fresh(), completions: picks.map((m, i) => done(m.id, new Date(now.getTime() - (i + 1) * 1000))) }));
    window.location.hash = '#/home';
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'ภารกิจประจำวัน' }, { timeout: 5000 })).toBeInTheDocument();
    for (const m of picks) expect(screen.getAllByText(m.title).length).toBeGreaterThan(0);
    expect(screen.getByText('ชาเลนจ์ประจำสัปดาห์')).toBeInTheDocument();

    const before = storageService.getProgress().totalXp;
    fireEvent.click(screen.getByRole('button', { name: `รับ +${DAILY_BONUS_XP} XP` }));
    expect(storageService.getProgress().totalXp).toBe(before + DAILY_BONUS_XP);
    expect(screen.getByText('รับแล้ว')).toBeInTheDocument();

    cleanup();
    render(<App />);
    expect(await screen.findByText('รับแล้ว', undefined, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: `รับ +${DAILY_BONUS_XP} XP` })).not.toBeInTheDocument();
    expect(storageService.getProgress().totalXp).toBe(before + DAILY_BONUS_XP);
  }, 20_000);
});

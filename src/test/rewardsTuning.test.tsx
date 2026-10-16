import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { evaluateMissionCompletion } from '../services/rewardService';
import { storageService } from '../services/storageService';
import { missions } from '../data/missions';
import { quizzes } from '../data/quizzes';
import { COSMETICS, getCosmeticStatus } from '../data/cosmetics';
import { DAILY_XP_MULTIPLIER, SPECIAL_BONUS_XP, WEEKLY_CHALLENGES, DAILY_MISSION_COUNT } from '../config/challenges';
import { DAILY_POOL, getDailyMissions, missionXpToday } from '../utils/challenges';
import { AvatarFrame } from '../components/avatar/AvatarFrame';

describe('daily and special missions pay ×3', () => {
  const m = missions.find((x) => x.repeatPolicy === 'daily' && x.active)!;
  const base = { ...storageService.getDefaultProgress(), inProgress: [{ missionId: m.id, startedAt: '2026-10-17T08:00:00.000Z', completedSteps: [] }] };
  const now = new Date(2026, 9, 17, 9);

  it('a daily mission pays three times its XP; a special one adds its bonus on top', () => {
    const daily = evaluateMissionCompletion(base, m.id, now, undefined, false, DAILY_XP_MULTIPLIER);
    const special = evaluateMissionCompletion(base, m.id, now, undefined, true, DAILY_XP_MULTIPLIER);
    const normal = evaluateMissionCompletion(base, m.id, now);
    if (!daily.ok || !special.ok || !normal.ok) throw new Error('completion failed');
    expect(normal.completion.xpAwarded).toBe(m.xpReward);
    expect(daily.completion.xpAwarded).toBe(m.xpReward * 3);
    expect(special.completion.xpAwarded).toBe(m.xpReward * 3 + SPECIAL_BONUS_XP);
  });

  it('the XP shown for today matches what is paid', () => {
    const today = getDailyMissions('p1', now)[0];
    expect(missionXpToday(today, 'p1', now).xp).toBeGreaterThanOrEqual(today.xpReward * 3);
    const notDaily = missions.find((x) => !getDailyMissions('p1', now).some((d) => d.id === x.id))!;
    expect(missionXpToday(notDaily, 'p1', now)).toMatchObject({ xp: notDaily.xpReward, daily: false });
  });

  it('every weekly challenge pays more than a whole day of daily missions', () => {
    // Best possible day: the three highest daily-eligible missions ×3, two of them special (weekend).
    const top = DAILY_POOL.map((x) => x.xpReward).sort((a, b) => b - a).slice(0, DAILY_MISSION_COUNT);
    const bestDay = top.reduce((n, x) => n + x * DAILY_XP_MULTIPLIER, 0) + 2 * SPECIAL_BONUS_XP;
    for (const w of WEEKLY_CHALLENGES) expect(w.bonusXp, w.id).toBeGreaterThan(bestDay);
  });
});

describe('quiz is friendly for everyone', () => {
  it('every category has at least 4 easy questions, none of them calculations', () => {
    for (const cat of ['waste', 'energy', 'water', 'carbon', 'lifestyle'] as const) {
      const easy = quizzes.filter((q) => q.category === cat && q.difficulty === 'easy');
      expect(easy.length, cat).toBeGreaterThanOrEqual(4);
    }
    for (const q of quizzes.filter((x) => x.id.startsWith('q-easy-'))) {
      expect(q.question, q.id).not.toMatch(/\d+\s*(วัตต์|ลิตร|หน่วย|kWh|ชั่วโมง)/);
    }
  });
});

describe('frames from weekly challenges', () => {
  const weekly = (n: number) => ({
    ...storageService.getDefaultProgress(),
    challengeRewards: Array.from({ length: n }, (_, i) => ({ id: `w${i}`, kind: 'weekly' as const, periodKey: `2026-0${i + 1}-05`, challengeId: 'week-waste', xpAwarded: 250, awardedAt: '2026-10-08T00:00:00.000Z' })),
  });
  it('unlock at 1, 3 and 5 weekly challenges, each with artwork', () => {
    const frame = (id: string) => COSMETICS.find((c) => c.id === id)!;
    expect(getCosmeticStatus(frame('frame-ribbon'), weekly(1)).unlocked).toBe(true);
    expect(getCosmeticStatus(frame('frame-sunflower'), weekly(2)).unlocked).toBe(false);
    expect(getCosmeticStatus(frame('frame-sunflower'), weekly(3)).unlocked).toBe(true);
    expect(getCosmeticStatus(frame('frame-rainbow'), weekly(4)).unlocked).toBe(false);
    expect(getCosmeticStatus(frame('frame-rainbow'), weekly(5)).unlocked).toBe(true);
    for (const id of ['frame-ribbon', 'frame-sunflower', 'frame-rainbow']) {
      const { container, unmount } = render(<div><AvatarFrame id={id} /></div>);
      expect(container.querySelector('svg')!.children.length, id).toBeGreaterThan(0);
      unmount();
    }
  });
});

describe('levels go up to 50', () => {
  it('has 50 levels with titles, and the top is reachable (not hundreds of thousands of XP)', async () => {
    const { LEVELS, MAX_LEVEL } = await import('../config/levels');
    const { getLevelFromXp } = await import('../utils/xp');
    expect(MAX_LEVEL).toBe(50);
    expect(LEVELS).toHaveLength(50);
    expect(LEVELS[49].title).toBe('ตำนานแห่งโลกสีเขียว');
    expect(LEVELS[19].minXp).toBe(8645);
    expect(LEVELS[49].minXp).toBe(55370);
    // the old curve put Lv11 at 7,131 XP; nobody goes down a level with the gentler one
    expect(getLevelFromXp(7131)).toBeGreaterThanOrEqual(11);
    expect(getLevelFromXp(10_000_000)).toBe(50);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { MissionDetail } from '../pages/MissionDetail';
import { Achievements } from '../pages/Achievements';
import { missions } from '../data/missions';
import { badges } from '../data/badges';
import { evaluateMissionCompletion } from '../services/rewardService';
import { storageService } from '../services/storageService';
import { getAllBadgeStatuses, checkNewBadges } from '../utils/badges';
import { LEVELS, MAX_LEVEL } from '../config/levels';
import { getLevelFromXp, getXpToNextLevel } from '../utils/xp';
import { getLocalDate } from '../utils/streak';
import type { PlayerProgress } from '../types';

const fresh = (): PlayerProgress => storageService.getDefaultProgress();
const started = (missionId: string): PlayerProgress => ({ ...fresh(), inProgress: [{ missionId, startedAt: new Date().toISOString(), completedSteps: [] }] });

describe('mission data model', () => {
  it('every mission has the fields the spec requires', () => {
    for (const m of missions) {
      expect(m).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        category: expect.any(String),
        difficulty: expect.any(String),
        xpReward: expect.any(Number),
        estimatedMinutes: expect.any(Number),
        environmentalExplanation: expect.any(String),
        impactType: expect.any(String),
      });
      expect(m.steps.length).toBeGreaterThan(0);
    }
  });
});

describe('reward service', () => {
  const now = new Date();

  it('rejects unknown missions, unstarted missions and repeats', () => {
    expect(evaluateMissionCompletion(fresh(), 'nope', now)).toEqual({ ok: false, reason: 'not-found' });
    expect(evaluateMissionCompletion(fresh(), 'waste-003', now)).toEqual({ ok: false, reason: 'not-started' });

    const first = evaluateMissionCompletion(started('waste-003'), 'waste-003', now);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.next.totalXp).toBe(20);
    expect(first.next.inProgress).toEqual([]);
    expect(first.newBadges.map((b) => b.id)).toContain('badge-first-mission');
    expect(first.next.unlockedBadges.map((b) => b.badgeId)).toContain('badge-first-mission');

    const again = evaluateMissionCompletion({ ...first.next, inProgress: started('waste-003').inProgress }, 'waste-003', now);
    expect(again).toEqual({ ok: false, reason: 'already-completed' });
  });

  it('reports level changes across several levels at once', () => {
    const rich = { ...started('waste-004'), totalXp: LEVELS[3].minXp - 10 };
    const r = evaluateMissionCompletion(rich, 'waste-004', now);
    expect(r.ok && r.levelTo - r.levelFrom).toBe(1);
  });
});

describe('levels', () => {
  it('uses one central threshold table', () => {
    expect(LEVELS[0]).toMatchObject({ level: 1, minXp: 0 });
    for (let i = 1; i < LEVELS.length; i++) expect(LEVELS[i].minXp).toBeGreaterThan(LEVELS[i - 1].minXp);
    expect(getLevelFromXp(LEVELS[4].minXp)).toBe(5);
    expect(getLevelFromXp(LEVELS[4].minXp - 1)).toBe(4);
    expect(getLevelFromXp(10_000_000)).toBe(MAX_LEVEL);
    expect(getXpToNextLevel(10_000_000)).toBe(0);
  });
});

describe('badges', () => {
  it('has at least 12 badges including the spec examples', () => {
    expect(badges.length).toBeGreaterThanOrEqual(12);
    const names = badges.map((b) => b.name);
    for (const n of ['First Step', 'Eco Explorer', 'Green Week', 'Recycling Hero', 'Energy Saver', 'Knowledge Seeker']) expect(names).toContain(n);
  });

  it('progress matches history and never unlocks twice', () => {
    const today = getLocalDate();
    const p: PlayerProgress = {
      ...fresh(),
      completions: Array.from({ length: 3 }, (_, i) => ({
        id: `c${i}`, missionId: 'waste-001', completedAt: new Date().toISOString(), localDate: today, xpAwarded: 20, completionType: 'self-reported' as const,
      })),
      totalXp: 60,
    };
    const explorer = getAllBadgeStatuses(p).find((s) => s.badge.name === 'Eco Explorer')!;
    expect(explorer).toMatchObject({ unlocked: false, current: 3, target: 5 });
    expect(explorer.unlockCondition).toBe('ทำภารกิจสำเร็จครบ 5 ครั้ง');

    const recycling = getAllBadgeStatuses(p).find((s) => s.badge.name === 'Recycling Hero')!;
    expect(recycling.current).toBe(3);

    const withFirst = { ...p, unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: new Date().toISOString() }] };
    expect(checkNewBadges(withFirst).map((b) => b.id)).not.toContain('badge-first-mission');
  });
});

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '', updatedAt: '',
  preferences: { reducedMotion: false, selectedGoalIds: [], profileColor: 'mint' },
};

function XpProbe() {
  const { progress, celebrations } = useGame();
  return <p data-testid="probe">{progress.totalXp}:{progress.completions.length}:{celebrations.length}</p>;
}

function renderAt(path: string) {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={[path]}>
        <GameProvider>
          <XpProbe />
          <Routes>
            <Route path="/missions/:id" element={<MissionDetail />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

describe('mission detail page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  });
  afterEach(() => vi.restoreAllMocks());

  it('shows Mission Not Found for an unknown id', () => {
    renderAt('/missions/does-not-exist');
    expect(screen.getByText(/Mission Not Found/)).toBeInTheDocument();
  });

  it('shows the honest self-report notice and the mission/XP in the confirmation', () => {
    renderAt('/missions/energy-001');
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจ' }));
    expect(screen.getByText(/ระบบบันทึกตามข้อมูลที่คุณยืนยัน ไม่ได้ตรวจสอบการกระทำจริง/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/ปิดไฟเมื่อออกจากห้อง/)).toBeInTheDocument();
    expect(within(dialog).getByText(/\+20 XP/)).toBeInTheDocument();
  });

  it('does not add XP when saving the completion fails, and offers a retry', () => {
    renderAt('/missions/energy-001');
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันสำเร็จ' }));
    expect(screen.getByTestId('probe')).toHaveTextContent('0:0:0');
    expect(screen.getByRole('alert')).toHaveTextContent('บันทึกผลไม่สำเร็จ ยังไม่ได้รับ XP');

    spy.mockRestore();
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(screen.getByTestId('probe')).toHaveTextContent(/^20:1/);
  });
});

describe('achievements page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  });

  it('lists counts and locked conditions, and opening it does not trigger a celebration', () => {
    localStorage.setItem(
      'ecoquest_progress',
      JSON.stringify({
        ...fresh(),
        completions: [{ id: 'c1', missionId: 'waste-001', completedAt: new Date().toISOString(), localDate: getLocalDate(), xpAwarded: 20, completionType: 'self-reported' }],
        unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: new Date().toISOString() }],
      }),
    );
    renderAt('/achievements');
    expect(screen.getByRole('progressbar', { name: 'เหรียญที่ปลดล็อก' })).toHaveAttribute('aria-valuetext', `1 จาก ${badges.length}`);
    expect(screen.getAllByText('First Step').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ทำภารกิจสำเร็จครบ 5 ครั้ง').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1/5').length).toBeGreaterThan(0);
    expect(screen.getByTestId('probe')).toHaveTextContent(/:0$/);
  });
});

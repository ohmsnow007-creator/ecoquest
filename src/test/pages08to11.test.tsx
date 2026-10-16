import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { Leaderboard } from '../pages/Leaderboard';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { getQuizResultState } from '../config/quizResults';
import { rankEntries, weeklyXp, createLocalLeaderboard, type LeaderboardEntry } from '../services/leaderboardService';
import { DEMO_PLAYERS } from '../data/demoLeaderboard';
import { storageService } from '../services/storageService';
import { getLocalDate } from '../utils/streak';
import type { PlayerProfile, PlayerProgress } from '../types';

const profile: PlayerProfile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '',
  preferences: { reducedMotion: false, selectedGoalIds: [], profileColor: 'mint' },
};

function progressWith(xp: number, at: string): PlayerProgress {
  return {
    ...storageService.getDefaultProgress(),
    totalXp: xp,
    completions: [{ id: 'c1', missionId: 'm-001', completedAt: at, localDate: getLocalDate(new Date(at)), xpAwarded: xp, completionType: 'self-reported' }],
  } as PlayerProgress;
}

function NameProbe() {
  const { profile: p } = useGame();
  return <p data-testid="name-probe">{p?.displayName ?? 'none'}</p>;
}

function renderAt(path: string) {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={[path]}>
        <GameProvider>
          <NameProbe />
          <Routes>
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/home" element={<p>home page</p>} />
            <Route path="/welcome" element={<p>welcome page</p>} />
            <Route path="/welcome/profile" element={<p>create profile page</p>} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
});

describe('quiz result states (config)', () => {
  it('maps percent to Excellent / Good / Keep Learning', () => {
    expect(getQuizResultState(100).state).toBe('excellent');
    expect(getQuizResultState(80).state).toBe('excellent');
    expect(getQuizResultState(79).state).toBe('good');
    expect(getQuizResultState(60).state).toBe('good');
    expect(getQuizResultState(59).state).toBe('keep-learning');
    expect(getQuizResultState(0).celebrate).toBe(false);
  });
});

describe('leaderboard service', () => {
  const e = (id: string, xp: number, lastXpAt: string | null, name = id): LeaderboardEntry => ({
    id, name, avatarId: 'avatar-leaf', xp, level: 1, badgeCount: 0, lastXpAt, isDemo: false, isCurrentPlayer: false,
  });

  it('sorts by XP desc, then earlier lastXpAt, then name; null time goes last', () => {
    const ranked = rankEntries([
      e('a', 100, '2026-10-05T00:00:00Z'),
      e('b', 200, '2026-10-09T00:00:00Z'),
      e('c', 100, '2026-10-01T00:00:00Z'),
      e('d', 100, null),
    ]);
    expect(ranked.map((r) => r.id)).toEqual(['b', 'c', 'a', 'd']);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3, 4]);
  });

  it('weekly XP counts only the last 7 local days', () => {
    const now = new Date(2026, 9, 15, 12);
    const p: PlayerProgress = {
      ...progressWith(50, new Date(2026, 9, 14, 10).toISOString()),
      completions: [
        { id: 'c1', missionId: 'm-001', completedAt: new Date(2026, 9, 14, 10).toISOString(), localDate: '2026-10-14', xpAwarded: 50, completionType: 'self-reported' },
        { id: 'c2', missionId: 'm-002', completedAt: new Date(2026, 9, 1, 10).toISOString(), localDate: '2026-10-01', xpAwarded: 30, completionType: 'self-reported' },
      ],
    } as PlayerProgress;
    expect(weeklyXp(p, now).xp).toBe(50);
  });

  it('demo players are fixed, labelled as samples and can be excluded', () => {
    expect(DEMO_PLAYERS.every((d) => d.name.includes('(ตัวอย่าง)'))).toBe(true);
    const svc = createLocalLeaderboard(profile, storageService.getDefaultProgress());
    const withDemo = svc.getEntries('all-time', { includeDemo: true });
    expect(withDemo.filter((x) => x.isDemo)).toHaveLength(DEMO_PLAYERS.length);
    expect(withDemo.filter((x) => x.isCurrentPlayer)).toHaveLength(1);
    expect(svc.getEntries('all-time', { includeDemo: false })).toHaveLength(1);
  });
});

describe('Leaderboard page', () => {
  it('labels demo rows, highlights the player and can hide samples', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith(35, new Date().toISOString())));
    renderAt('/leaderboard');
    expect(screen.getAllByText('ข้อมูลตัวอย่าง').length).toBeGreaterThanOrEqual(DEMO_PLAYERS.length);
    const mine = document.querySelector('[aria-current="true"]')!;
    expect(within(mine as HTMLElement).getByText('Tester')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: 'แสดงตัวอย่าง' }));
    expect(screen.queryByText('ข้อมูลตัวอย่าง')).not.toBeInTheDocument();
    expect(screen.getByText(/จาก 1/)).toBeInTheDocument();
  });
});

describe('Profile page', () => {
  it('edits the name with preview, persists it and updates everywhere', () => {
    renderAt('/profile');
    fireEvent.click(screen.getByRole('button', { name: 'แก้ไขชื่อและอวาตาร์' }));
    fireEvent.change(screen.getByLabelText('ชื่อผู้เล่น'), { target: { value: 'ใบเตย' } });
    expect(within(screen.getByLabelText('เปรียบเทียบก่อนและหลังแก้ไข')).getByText('ใบเตย')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก' }));
    expect(screen.getByTestId('name-probe')).toHaveTextContent('ใบเตย');
    expect(storageService.getProfile()?.displayName).toBe('ใบเตย');
  });

  it('cancel discards changes', () => {
    renderAt('/profile?edit=1');
    fireEvent.change(screen.getByLabelText('ชื่อผู้เล่น'), { target: { value: 'Other' } });
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    expect(screen.getByTestId('name-probe')).toHaveTextContent('Tester');
    expect(storageService.getProfile()?.displayName).toBe('Tester');
  });

  it('links to settings and states local-only storage', () => {
    renderAt('/profile');
    for (const l of screen.getAllByRole('link', { name: 'ตั้งค่า' })) expect(l).toHaveAttribute('href', '/settings');
    expect(screen.getByText(/เก็บอยู่ในเบราว์เซอร์ของอุปกรณ์นี้เท่านั้น/)).toBeInTheDocument();
  });
});

describe('Settings page', () => {
  it('toggles persist to storage', () => {
    renderAt('/settings');
    const sound = screen.getByRole('switch', { name: 'เสียงเอฟเฟกต์' });
    expect(sound).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(sound);
    expect(storageService.getProfile()?.preferences.soundEffects).toBe(true);
    fireEvent.click(screen.getByRole('switch', { name: 'หน้าต่างฉลองรางวัล' }));
    expect(storageService.getProfile()?.preferences.celebrations).toBe(false);
  });

  it('shows storage usage', () => {
    renderAt('/settings');
    expect(screen.getByTestId('storage-usage').textContent).toMatch(/B$/);
  });

  it('reset game asks first, then clears progress but keeps the profile', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith(35, new Date().toISOString())));
    renderAt('/settings');
    fireEvent.click(screen.getAllByRole('button', { name: 'รีเซ็ตเกม' })[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'ยกเลิก' }));
    expect(storageService.getProgress().totalXp).toBe(35);

    fireEvent.click(screen.getAllByRole('button', { name: 'รีเซ็ตเกม' })[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'รีเซ็ตเกม' }));
    expect(storageService.getProgress().totalXp).toBe(0);
    expect(storageService.getProfile()?.displayName).toBe('Tester');
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  it('delete account asks first, removes everything and opens profile creation', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith(35, new Date().toISOString())));
    renderAt('/settings');
    fireEvent.click(screen.getByRole('button', { name: 'ลบบัญชี' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/ลบบัญชี “Tester”/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'ลบบัญชี' }));
    expect(storageService.getProfile()).toBeNull();
    expect(storageService.getProgress().totalXp).toBe(0);
    expect(screen.getByText('create profile page')).toBeInTheDocument();
  });
});

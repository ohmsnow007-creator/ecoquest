import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider } from '../store/GameContext';
import { Admin } from '../pages/Admin';
import { storageService, sanitizeProgress } from '../services/storageService';
import { createLocalLeaderboard } from '../services/leaderboardService';
import { buildActivityFeed } from '../utils/activity';
import { getCosmeticStatus, COSMETICS } from '../data/cosmetics';
import { adminXp, earnedXp } from '../utils/admin';
import { badges } from '../data/badges';
import { getLevelFromXp, totalXpForLevel } from '../utils/xp';
import { getLocalDate } from '../utils/streak';

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '',
  preferences: { reducedMotion: true, selectedGoalIds: [], profileColor: 'mint', celebrations: false },
};
const realCompletion = () => {
  const at = new Date(Date.now() - 86_400_000);
  return { id: 'c1', missionId: 'waste-001', completedAt: at.toISOString(), localDate: getLocalDate(at), xpAwarded: 20, completionType: 'educational' };
};

function renderAdmin() {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={['/admin']}>
        <GameProvider>
          <Routes>
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

async function enter(pin: string) {
  for (const d of pin) fireEvent.click(screen.getByRole('button', { name: d }));
  // Let the check (and its shake animation) settle.
  await act(async () => { await new Promise((r) => setTimeout(r, 600)); });
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  localStorage.setItem('ecoquest_progress', JSON.stringify({ ...storageService.getDefaultProgress(), completions: [realCompletion()] }));
});

describe('demo admin', () => {
  it('five wrong PINs lock this device out for a minute, even after a reload', async () => {
    renderAdmin();
    for (let i = 0; i < 5; i++) await enter('000000');
    expect(await screen.findByText('ล็อกชั่วคราว')).toBeInTheDocument();
    const until = Number(localStorage.getItem('ecoquest_admin_lock'));
    expect(until - Date.now()).toBeGreaterThan(50_000);
    cleanup();
    renderAdmin();
    expect(screen.getByText('ล็อกชั่วคราว')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled();
    localStorage.removeItem('ecoquest_admin_lock');
  });


  it('two fixed PINs in a row unlock it; a wrong one is refused and kept nowhere in plain text', async () => {
    renderAdmin();
    expect(screen.getByText('ใส่รหัสผู้ดูแล')).toBeInTheDocument();
    await enter('111111');
    expect(await screen.findByRole('alert')).toHaveTextContent('รหัสไม่ถูกต้อง');
    await enter('654321');
    expect(await screen.findByText('ใส่รหัสชั้นที่ 2')).toBeInTheDocument();
    await enter('031069');
    expect(await screen.findByText('เลเวลและ XP')).toBeInTheDocument();
    expect(JSON.stringify(localStorage)).not.toContain('654321');
  });

  it('level grants become the real level (leaderboard too); items are labelled; all revocable', () => {
    renderAdmin(); // still unlocked in this session
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'ตั้งเลเวล' }));

    let p = storageService.getProgress();
    expect(getLevelFromXp(p.totalXp)).toBe(10);
    expect(earnedXp(p)).toBe(20);
    expect(adminXp(p)).toBe(totalXpForLevel(10) - 20);

    // The granted level is the player's real level, on the leaderboard as well
    const me = createLocalLeaderboard(storageService.getProfile()!, p).getEntries('all-time', { includeDemo: false })[0];
    expect(me.xp).toBe(p.totalXp);
    expect(me.level).toBe(10);

    // Badge + cosmetic grants are marked
    const badgesSection = screen.getByRole('heading', { name: /เหรียญรางวัล/ }).closest('section')!;
    fireEvent.click(within(badgesSection).getAllByRole('button', { name: 'มอบ' })[0]);
    p = storageService.getProgress();
    expect(p.unlockedBadges.some((b) => b.source === 'admin')).toBe(true);
    expect(buildActivityFeed(p).filter((e) => e.type === 'admin' && !e.title.includes('XP')).every((e) => e.type === 'admin' && e.title.includes('สาธิต'))).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'มอบเหรียญรางวัลทั้งหมด' }));
    p = storageService.getProgress();
    expect(new Set(p.unlockedBadges.map((b) => b.badgeId)).size).toBe(badges.length);
    expect(screen.getByRole('button', { name: 'มอบเหรียญรางวัลทั้งหมด' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'มอบของตกแต่งทั้งหมด' }));
    p = storageService.getProgress();
    for (const c of COSMETICS) expect(getCosmeticStatus(c, p).unlocked).toBe(true);

    // Revoke everything: back to exactly what was earned
    fireEvent.click(screen.getByRole('button', { name: 'ย้อนคืนทั้งหมด' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ย้อนคืนทั้งหมด' }));
    p = storageService.getProgress();
    expect(p.adminGrants ?? []).toHaveLength(0);
    expect(p.totalXp).toBe(20);
    expect(p.unlockedBadges.some((b) => b.source === 'admin')).toBe(false);
  });

  it('storage drops malformed grants and counts valid XP grants in the total', () => {
    const p = sanitizeProgress({
      completions: [realCompletion()],
      adminGrants: [
        { id: 'a', at: 'x', kind: 'xp', amount: 100 },
        { id: 'b', at: 'x', kind: 'xp', amount: -5 },
        { id: 'c', at: 'x', kind: 'cosmetic', cosmeticId: 'not-real' },
        { id: 'd', at: 'x', kind: 'teleport' },
      ],
    });
    expect(p.adminGrants).toEqual([{ id: 'a', at: 'x', kind: 'xp', amount: 100 }]);
    expect(p.totalXp).toBe(120);
  });
});

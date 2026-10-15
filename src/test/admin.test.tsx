import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider } from '../store/GameContext';
import { Admin } from '../pages/Admin';
import { storageService, sanitizeProgress } from '../services/storageService';
import { createLocalLeaderboard } from '../services/leaderboardService';
import { buildActivityFeed } from '../utils/activity';
import { getCosmeticStatus, COSMETICS } from '../data/cosmetics';
import { adminXp, earnedXp, hashPin } from '../utils/admin';
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

beforeEach(() => {
  cleanup();
  localStorage.clear();
  localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  localStorage.setItem('ecoquest_progress', JSON.stringify({ ...storageService.getDefaultProgress(), completions: [realCompletion()] }));
});

describe('demo admin', () => {
  it('first visit sets a PIN; it is stored hashed, not as plain text', () => {
    renderAdmin();
    fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: '1234' } });
    fireEvent.change(screen.getByPlaceholderText('ยืนยัน PIN'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'ตั้ง PIN และเข้าใช้งาน' }));
    expect(screen.getByText('เลเวลและ XP')).toBeInTheDocument();
    expect(localStorage.getItem('ecoquest_admin_pin')).toBe(hashPin('1234'));
    expect(localStorage.getItem('ecoquest_admin_pin')).not.toContain('1234');
  });

  it('a wrong PIN is refused', () => {
    localStorage.setItem('ecoquest_admin_pin', hashPin('2468'));
    cleanup();
    renderAdmin();
    // The panel may still be unlocked from the previous test's session; lock it first.
    const lockBtn = screen.queryByRole('button', { name: 'ล็อกหน้าผู้ดูแล' });
    if (lockBtn) fireEvent.click(lockBtn);
    fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: '0000' } });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่โหมดผู้ดูแล' }));
    expect(screen.getByRole('alert')).toHaveTextContent('PIN ไม่ถูกต้อง');
    fireEvent.change(screen.getByPlaceholderText('PIN'), { target: { value: '2468' } });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่โหมดผู้ดูแล' }));
    expect(screen.getByText('เลเวลและ XP')).toBeInTheDocument();
  });

  it('grants are labelled, raise the shown level, stay out of the leaderboard, and revoke cleanly', () => {
    renderAdmin(); // still unlocked in this session
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'ตั้งเลเวล' }));

    let p = storageService.getProgress();
    expect(getLevelFromXp(p.totalXp)).toBe(10);
    expect(earnedXp(p)).toBe(20);
    expect(adminXp(p)).toBe(totalXpForLevel(10) - 20);

    // Leaderboard counts only earned XP
    const me = createLocalLeaderboard(storageService.getProfile()!, p).getEntries('all-time', { includeDemo: false })[0];
    expect(me.xp).toBe(20);
    expect(me.level).toBe(1);

    // Badge + cosmetic grants are marked
    const badgesSection = screen.getByRole('heading', { name: /เหรียญรางวัล/ }).closest('section')!;
    fireEvent.click(within(badgesSection).getAllByRole('button', { name: 'มอบ' })[0]);
    p = storageService.getProgress();
    expect(p.unlockedBadges.some((b) => b.source === 'admin')).toBe(true);
    expect(buildActivityFeed(p).filter((e) => e.type === 'admin').every((e) => e.type === 'admin' && e.title.includes('สาธิต'))).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /ปลดล็อกทุกอย่าง/ }));
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

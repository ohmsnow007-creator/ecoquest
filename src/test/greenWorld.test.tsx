import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { Dashboard } from '../pages/Dashboard';
import { getWorldState, explainWorld } from '../utils/world';
import { buildActivityFeed } from '../utils/activity';
import { getPlayerStats } from '../utils/playerStats';
import { storageService } from '../services/storageService';
import type { MissionCompletion, PlayerProgress } from '../types';
import { getLocalDate } from '../utils/streak';

function completion(i: number, missionId = 'waste-001', at = new Date(Date.UTC(2026, 9, 1, 8, i))): MissionCompletion {
  return { id: `c${i}`, missionId, completedAt: at.toISOString(), localDate: getLocalDate(at), xpAwarded: 20, completionType: 'self-reported' };
}

function progressWith(n: number): PlayerProgress {
  return { ...storageService.getDefaultProgress(), completions: Array.from({ length: n }, (_, i) => completion(i)), totalXp: n * 20 };
}

describe('world stages follow completed missions', () => {
  it.each([
    [0, 0],
    [1, 1],
    [4, 1],
    [5, 2],
    [12, 3],
    [25, 4],
    [40, 4],
  ])('%i missions → stage %i', (missionsDone, stage) => {
    expect(getWorldState(missionsDone).current.stage).toBe(stage);
  });

  it('reports how many missions remain', () => {
    const w = getWorldState(3);
    expect(w.next?.stage).toBe(2);
    expect(w.missionsToNext).toBe(2);
  });

  it('explains growth from the player records', () => {
    expect(explainWorld(0, { waste: 0, energy: 0, water: 0, transport: 0, consumption: 0, nature: 0 })).toMatch(/ภารกิจแรก/);
    expect(explainWorld(5, { waste: 4, energy: 1, water: 0, transport: 0, consumption: 0, nature: 0 })).toMatch(/5 ครั้ง.*ขยะและรีไซเคิล \(4 ครั้ง\)/);
  });
});

describe('activity feed and stats come from the same records', () => {
  it('orders newest first and replays level-ups from XP', () => {
    const p = progressWith(3);
    const feed = buildActivityFeed(p);
    expect(feed[0].type).toBe('level');
    expect(feed.filter((e) => e.type === 'mission')).toHaveLength(3);
    expect(feed.some((e) => e.type === 'level' && e.level === 2)).toBe(true);
  });

  it('stats match the stored records', () => {
    const p = progressWith(6);
    const s = getPlayerStats(p);
    expect(s.missionsCompleted).toBe(6);
    expect(s.selfReportedCount).toBe(6);
    expect(s.activityCount).toBe(6);
    expect(s.byCategory.waste).toBe(6);
    expect(s.xp).toBe(120);
  });
});

function StartProbe() {
  const { startMission, getMissionStatus } = useGame();
  return (
    <button type="button" onClick={() => startMission('waste-001')}>
      start:{getMissionStatus('waste-001')}
    </button>
  );
}

function renderHome(extra?: React.ReactNode) {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={['/home']}>
        <GameProvider>
          <Routes>
            <Route path="/home" element={<>{extra}<Dashboard /></>} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

const profile = {
  id: 'p1', displayName: 'GreenHero', avatarId: 'avatar-leaf', createdAt: '', updatedAt: '',
  preferences: { reducedMotion: false, selectedGoalIds: [], profileColor: 'mint' },
};

describe('My Green World dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  });

  it('shows the starting world and empty states for a new player', () => {
    renderHome();
    expect(screen.getByText('สวัสดี GreenHero')).toBeInTheDocument();
    expect(screen.getByText('พื้นที่เริ่มต้น')).toBeInTheDocument();
    expect(screen.getByText('เริ่มบันทึกกิจกรรมเพื่อดูผลลัพธ์')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่มีกิจกรรม')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^ภาพโลกสีเขียวของคุณ ระดับ 0 / })).toBeInTheDocument();
  });

  it('after 5 completed missions the world reaches stage 2, and it survives a reload', () => {
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith(5)));
    const { unmount } = renderHome();
    expect(screen.getByText('ต้นไม้และพุ่มไม้')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /^ภาพโลกสีเขียวของคุณ ระดับ 2 / })).toBeInTheDocument();
    const stats = screen.getByRole('region', { name: 'สถิติโดยย่อ' });
    expect(within(stats).getAllByText('5')).toHaveLength(2);
    expect(within(stats).getByText('5 ครั้ง')).toBeInTheDocument();
    unmount();
    renderHome();
    expect(screen.getByText('ต้นไม้และพุ่มไม้')).toBeInTheDocument();
  });

  it('quick actions and stat cards link to real pages', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'ดูภารกิจทั้งหมด' })).toHaveAttribute('href', '/missions');
    expect(screen.getByRole('link', { name: 'ทำแบบทดสอบ' })).toHaveAttribute('href', '/quiz');
    expect(screen.getByRole('link', { name: 'ดูรางวัลและเหรียญตรา' })).toHaveAttribute('href', '/achievements');
    expect(screen.getByRole('link', { name: 'ดู Green Impact' })).toHaveAttribute('href', '/impact');
    const stats = screen.getByRole('region', { name: 'สถิติโดยย่อ' });
    expect(within(stats).getAllByRole('link')).toHaveLength(3);
  });

  it('marks a started mission as in progress and persists it', () => {
    renderHome(<StartProbe />);
    fireEvent.click(screen.getByRole('button', { name: /start:available/ }));
    expect(screen.getByRole('button', { name: /start:in-progress/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('ecoquest_progress')!).inProgress[0].missionId).toBe('waste-001');
  });
});

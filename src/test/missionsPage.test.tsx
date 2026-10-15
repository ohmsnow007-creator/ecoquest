import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { Missions } from '../pages/Missions';
import { MissionDetail } from '../pages/MissionDetail';
import { missions } from '../data/missions';

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '', updatedAt: '',
  preferences: { reducedMotion: false, selectedGoalIds: [], profileColor: 'mint' },
};

function XpProbe() {
  const { progress } = useGame();
  return <p data-testid="xp">{progress.totalXp}:{progress.completions.length}</p>;
}

function renderAt(path: string) {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={[path]}>
        <GameProvider>
          <XpProbe />
          <Routes>
            <Route path="/missions" element={<Missions />} />
            <Route path="/missions/:id" element={<MissionDetail />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

const list = () => screen.getAllByRole('article');
const statusChips = () => screen.getByRole('group', { name: 'สถานะภารกิจ' });

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
});

describe('Eco Missions list', () => {
  it('shows the header count and every active mission', () => {
    renderAt('/missions');
    expect(screen.getByRole('progressbar', { name: 'ภารกิจที่สำเร็จ' })).toHaveAttribute('aria-valuetext', `0 จาก ${missions.length} ภารกิจ`);
    expect(screen.getByRole('heading', { name: `ภารกิจทั้งหมด (${missions.length})` })).toBeInTheDocument();
  });

  it('filters by one category at a time', () => {
    renderAt('/missions');
    const cats = screen.getByRole('group', { name: 'หมวดหมู่ภารกิจ' });
    fireEvent.click(within(cats).getByRole('button', { name: /ประหยัดน้ำ/ }));
    expect(screen.getByRole('heading', { name: 'ภารกิจที่ตรงเงื่อนไข (4)' })).toBeInTheDocument();
    fireEvent.click(within(cats).getByRole('button', { name: /พฤติกรรมรักษ์โลก/ }));
    expect(within(cats).getByRole('button', { name: /ประหยัดน้ำ/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'ภารกิจที่ตรงเงื่อนไข (8)' })).toBeInTheDocument();
  });

  it('starting from the list sets In Progress and updates the counts', () => {
    renderAt('/missions');
    fireEvent.click(screen.getAllByRole('button', { name: /^เริ่มทำ:/ })[0]);
    expect(within(statusChips()).getByRole('button', { name: 'กำลังทำ 1' })).toBeInTheDocument();
    fireEvent.click(within(statusChips()).getByRole('button', { name: 'กำลังทำ 1' }));
    expect(list()).toHaveLength(1);
    expect(screen.getByRole('link', { name: /^ทำต่อ:/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('ecoquest_progress')!).inProgress).toHaveLength(1);
  });

  it('shows an empty state with a working clear-filters button', () => {
    renderAt('/missions');
    fireEvent.click(within(statusChips()).getByRole('button', { name: 'สำเร็จแล้ว 0' }));
    expect(screen.getByText('ไม่พบภารกิจที่ตรงกับตัวกรอง')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ล้างตัวกรอง' }));
    expect(screen.getByRole('heading', { name: `ภารกิจทั้งหมด (${missions.length})` })).toBeInTheDocument();
  });
});

describe('Mission detail flow', () => {
  it('start → tick steps → confirm → XP once, and it survives a reload', () => {
    renderAt('/missions/waste-003');
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจ' }));
    const steps = screen.getAllByRole('checkbox');
    expect(steps).toHaveLength(missions.find((m) => m.id === 'waste-003')!.steps.length);
    fireEvent.click(steps[0]);
    expect(steps[0]).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(`ทำแล้ว 1/${steps.length} ขั้นตอน`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' }));
    const dialog = screen.getByRole('dialog', { name: 'ยืนยันว่าทำภารกิจสำเร็จ?' });
    const confirm = within(dialog).getByRole('button', { name: 'ยืนยันสำเร็จ' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    expect(screen.getByTestId('xp')).toHaveTextContent('20:1');
    expect(screen.getByText('ภารกิจสำเร็จ!')).toBeInTheDocument();

    cleanup();
    renderAt('/missions/waste-003');
    expect(screen.getByTestId('xp')).toHaveTextContent('20:1');
    expect(screen.getByText('ทำภารกิจนี้สำเร็จแล้ว')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'สถานะและการยืนยันภารกิจ' })).getByText('+20 XP')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เริ่มภารกิจ' })).not.toBeInTheDocument();
  });

  it('cancelling the confirmation does not award XP', () => {
    renderAt('/missions/energy-001');
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    expect(screen.getByTestId('xp')).toHaveTextContent('0:0');
  });
});

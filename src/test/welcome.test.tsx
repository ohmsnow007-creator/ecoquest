import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider } from '../store/GameContext';
import { Welcome } from '../pages/Welcome';
import { ProfileCreation } from '../pages/ProfileCreation';
import { validateDisplayName, NAME_MAX_LENGTH } from '../utils/profile';

describe('validateDisplayName', () => {
  it('rejects empty or whitespace-only names', () => {
    expect(validateDisplayName('')).toEqual({ ok: false, error: 'กรุณากรอกชื่อผู้เล่น' });
    expect(validateDisplayName('    ').ok).toBe(false);
  });

  it('trims and collapses whitespace', () => {
    expect(validateDisplayName('  นัก   รักษ์โลก ')).toEqual({ ok: true, value: 'นัก รักษ์โลก' });
  });

  it('enforces the length limit', () => {
    expect(validateDisplayName('ก'.repeat(NAME_MAX_LENGTH)).ok).toBe(true);
    expect(validateDisplayName('ก'.repeat(NAME_MAX_LENGTH + 1)).ok).toBe(false);
  });
});

function renderWelcome() {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={['/welcome']}>
        <GameProvider>
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/welcome/profile" element={<ProfileCreation />} />
            <Route path="/home" element={<p>หน้าหลักจริง</p>} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

async function goToProfileSetup() {
  renderWelcome();
  fireEvent.click(await screen.findByRole('button', { name: /เริ่มต้นใช้งาน/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'ข้าม' }));
  fireEvent.click(await screen.findByRole('button', { name: 'ต่อไป' }));
  await screen.findByText(/เลือกได้สูงสุด/);
  fireEvent.click(screen.getByRole('button', { name: 'ต่อไป' }));
  return screen.findByLabelText('ชื่อผู้เล่น');
}

describe('Welcome onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.setItem('ecoquest_splash_seen', '1');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks an empty name with a clear message', async () => {
    await goToProfileSetup();
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));
    expect(await screen.findByText('กรุณากรอกชื่อผู้เล่น')).toBeInTheDocument();
    expect(localStorage.getItem('ecoquest_profile')).toBeNull();
  });

  it('saves a trimmed profile and goes to /home', async () => {
    const input = await goToProfileSetup();
    fireEvent.change(input, { target: { value: '  Ploy  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));
    expect(await screen.findByText('หน้าหลักจริง')).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem('ecoquest_profile')!);
    expect(saved.displayName).toBe('Ploy');
    expect(saved.avatarId).toBe('avatar-leaf');
  });

  it('shows an error when the browser refuses to save', async () => {
    const input = await goToProfileSetup();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fireEvent.change(input, { target: { value: 'Ploy' } });
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));
    expect(await screen.findByText('บันทึกโปรไฟล์ไม่สำเร็จ')).toBeInTheDocument();
    expect(screen.queryByText('หน้าหลักจริง')).not.toBeInTheDocument();
  });

  it('offers "continue playing" when a profile already exists', async () => {
    localStorage.setItem(
      'ecoquest_profile',
      JSON.stringify({ id: 'p', displayName: 'Mint', avatarId: 'avatar-sun', createdAt: '', updatedAt: '', preferences: { reducedMotion: false, selectedGoalIds: [] } }),
    );
    renderWelcome();
    fireEvent.click(await screen.findByRole('button', { name: /กลับมาเล่นต่อ/ }));
    expect(await screen.findByText('หน้าหลักจริง')).toBeInTheDocument();
  });
});

describe('Welcome first-time flow', () => {
  it('starts from the intro and reaches profile setup', async () => {
    localStorage.clear();
    sessionStorage.setItem('ecoquest_splash_seen', '1');
    renderWelcome();
    expect(await screen.findByRole('heading', { name: 'EcoQuest!' })).toBeInTheDocument();
    expect(screen.getByText(/ไม่ต้องใช้อุปกรณ์พิเศษ/)).toBeInTheDocument();
  });
});

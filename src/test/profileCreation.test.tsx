import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameContext';
import { ProfileCreation } from '../pages/ProfileCreation';
import { MAX_INTERESTS } from '../data/avatars';

function HomeProbe() {
  const { profile, progress } = useGame();
  return (
    <p>
      HOME:{profile?.displayName}:{profile?.avatarId}:{progress.totalXp}:{progress.completions.length}:{profile?.preferences.selectedGoalIds.length}
    </p>
  );
}

function renderFlow() {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={['/welcome/profile']}>
        <GameProvider>
          <Routes>
            <Route path="/welcome" element={<p>WELCOME</p>} />
            <Route path="/welcome/profile" element={<ProfileCreation />} />
            <Route path="/home" element={<HomeProbe />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

const next = async () => fireEvent.click(await screen.findByRole('button', { name: 'ต่อไป' }));

async function toInterests() {
  await next();
  await screen.findByText(/เลือกได้สูงสุด/);
}

async function toDetails() {
  await toInterests();
  fireEvent.click(screen.getByRole('button', { name: 'ต่อไป' }));
  return screen.findByLabelText('ชื่อผู้เล่น');
}

beforeEach(() => {
  localStorage.clear();
});

describe('Profile creation', () => {
  it('updates the avatar preview immediately when another avatar is chosen', async () => {
    renderFlow();
    expect(await screen.findByRole('img', { name: 'อวาตาร์ มินท์' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'ซันนี่' }));
    expect(screen.getByRole('radio', { name: 'ซันนี่' })).toHaveAttribute('aria-checked', 'true');
    expect(await screen.findByRole('img', { name: 'อวาตาร์ ซันนี่' }, { timeout: 3000 })).toBeInTheDocument();
  });

  it(`limits interests to ${MAX_INTERESTS}`, async () => {
    renderFlow();
    await toInterests();
    const chips = await screen.findAllByRole('button', { pressed: false });
    chips.slice(0, MAX_INTERESTS + 2).forEach((c) => fireEvent.click(c));
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(MAX_INTERESTS);
    expect(screen.getByText(new RegExp(`เลือกแล้ว ${MAX_INTERESTS}/${MAX_INTERESTS}`))).toBeInTheDocument();
  });

  it('lets the name be edited before confirming and shows it in the preview', async () => {
    renderFlow();
    const input = await toDetails();
    fireEvent.change(input, { target: { value: 'Ploy' } });
    expect(screen.getByText('Ploy')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Ploy Green' } });
    expect(screen.getByText('Ploy Green')).toBeInTheDocument();
    expect(localStorage.getItem('ecoquest_profile')).toBeNull();
  });

  it('creates a level-1, 0-XP player with a fresh ID, ignoring leftover progress', async () => {
    localStorage.setItem(
      'ecoquest_progress',
      JSON.stringify({
        completions: [{ id: 'old', missionId: 'waste-001', completedAt: 't', localDate: '2026-01-01', xpAwarded: 20, completionType: 'educational' }],
      }),
    );
    renderFlow();
    fireEvent.click(await screen.findByRole('radio', { name: 'ปุยฝ้าย' }));
    await toInterests();
    fireEvent.click(screen.getAllByRole('button', { pressed: false })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'ต่อไป' }));
    fireEvent.change(await screen.findByLabelText('ชื่อผู้เล่น'), { target: { value: '  Mint  ' } });
    fireEvent.change(screen.getByLabelText('สีโปรไฟล์'), { target: { value: 'sky' } });
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));

    expect(await screen.findByText('HOME:Mint:avatar-rain:0:0:1')).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem('ecoquest_profile')!);
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(saved.preferences.profileColor).toBe('sky');
    expect(JSON.parse(localStorage.getItem('ecoquest_progress')!).totalXp).toBe(0);
  });

  it('keeps the profile after a refresh and does not allow a second profile', async () => {
    renderFlow();
    fireEvent.change(await toDetails(), { target: { value: 'First' } });
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));
    await screen.findByText(/HOME:First/);
    const firstId = JSON.parse(localStorage.getItem('ecoquest_profile')!).id;

    cleanup();
    renderFlow();
    expect(await screen.findByText(/HOME:First/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('ecoquest_profile')!).id).toBe(firstId);
  });
});

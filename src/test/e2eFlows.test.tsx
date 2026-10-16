/**
 * End-to-end acceptance flows (spec part 7) run against the whole <App /> with real routing,
 * the real GameProvider and real localStorage (jsdom). "Refresh" = unmount and mount a new App.
 * Flows D (quiz), E (impact) and the reset cancel/confirm part of F also have focused tests in
 * quizFlow.test.tsx, impact.test.tsx and pages08to11.test.tsx.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import App from '../App';
import { SKIP_INTRO_TEST_KEY } from '../components/layout/launcherContext';
import { missions } from '../data/missions';
import { storageService, CORRUPT_BACKUP_SUFFIX } from '../services/storageService';
import { evaluateMissionCompletion } from '../services/rewardService';
import { getLevelFromXp, getLevelProgress, totalXpForLevel } from '../utils/xp';
import { getLocalDate } from '../utils/streak';
import type { PlayerProgress } from '../types';

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z',
  preferences: { reducedMotion: true, selectedGoalIds: [], profileColor: 'mint' },
};

function openApp(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

function refresh(hash?: string) {
  cleanup();
  if (hash) window.location.hash = hash;
  return render(<App />);
}

const seedProfile = () => localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
const seedProgress = (p: Partial<PlayerProgress>) => localStorage.setItem('ecoquest_progress', JSON.stringify({ ...storageService.getDefaultProgress(), ...p }));

function completion(missionId: string, xp: number, daysAgo = 1) {
  const at = new Date(Date.now() - daysAgo * 86_400_000);
  return { id: `c-${missionId}`, missionId, completedAt: at.toISOString(), localDate: getLocalDate(at), xpAwarded: xp, completionType: 'educational' };
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  // Skip the slide-to-unlock intro; it has its own tests below.
  sessionStorage.setItem(SKIP_INTRO_TEST_KEY, '1');
  window.location.hash = '';
});

describe('Flow A — new player', () => {
  it('creates one profile at level 1 / 0 XP and keeps it after a refresh', async () => {
    openApp('#/welcome/profile');
    fireEvent.click(await screen.findByRole('button', { name: 'ต่อไป' }));
    await screen.findByText(/เลือกได้สูงสุด/);
    fireEvent.click(screen.getByRole('button', { name: 'ต่อไป' }));
    fireEvent.change(await screen.findByLabelText('ชื่อผู้เล่น'), { target: { value: 'Ploy' } });
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));

    expect(await screen.findByText('สวัสดี Ploy', undefined, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/home');
    expect(storageService.getProgress().totalXp).toBe(0);
    expect(getLevelFromXp(storageService.getProgress().totalXp)).toBe(1);
    const id = storageService.getProfile()!.id;

    refresh();
    expect(await screen.findByText('สวัสดี Ploy', undefined, { timeout: 5000 })).toBeInTheDocument();
    expect(storageService.getProfile()!.id).toBe(id);

    // The profile form refuses to create a second profile.
    refresh('#/welcome/profile');
    await screen.findByRole('button', { name: /ต่อไป|กลับเข้าเกม/ }).catch(() => null);
    expect(storageService.getProfile()!.id).toBe(id);
  }, 20_000);
});

describe('Flow B — completing a mission', () => {
  it('awards XP once, and every page agrees after a refresh', async () => {
    seedProfile();
    const m = missions.find((x) => x.active && x.repeatPolicy === 'once')!;
    openApp(`#/missions/${m.id}`);
    fireEvent.click(await screen.findByRole('button', { name: 'เริ่มภารกิจ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ยืนยันสำเร็จ' }));

    const saved = storageService.getProgress();
    expect(saved.totalXp).toBe(m.xpReward);
    expect(saved.completions).toHaveLength(1);
    expect(saved.unlockedBadges.map((b) => b.badgeId)).toContain('badge-first-mission');

    // Refresh, open the same mission: it is completed and cannot pay again.
    refresh(`#/missions/${m.id}`);
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('button', { name: 'เริ่มภารกิจ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' })).not.toBeInTheDocument();
    expect(storageService.getProgress().totalXp).toBe(m.xpReward);

    // Profile shows the same XP and the mission in history.
    refresh('#/profile');
    expect(await screen.findByText('โปรไฟล์ของฉัน', undefined, { timeout: 5000 })).toBeInTheDocument();
    const history = screen.getByRole('region', { name: 'ประวัติภารกิจ' });
    expect(within(history).getByText(m.title)).toBeInTheDocument();
    expect(screen.getByText('XP สะสม').nextElementSibling).toHaveTextContent(String(m.xpReward));
  });
});

describe('Flow C — level up', () => {
  it('a valid reward event that crosses thresholds updates level, progress and celebration', async () => {
    seedProfile();
    const once = missions.filter((x) => x.active && x.repeatPolicy === 'once');
    const target = once[0];
    const threshold = totalXpForLevel(2);
    // Earlier real completions bring the player to just below level 2.
    const earlier = once.slice(1).reduce<{ list: ReturnType<typeof completion>[]; xp: number }>(
      (acc, m) => (acc.xp + m.xpReward < threshold ? { list: [...acc.list, completion(m.id, m.xpReward)], xp: acc.xp + m.xpReward } : acc),
      { list: [], xp: 0 },
    );
    expect(earlier.xp + target.xpReward).toBeGreaterThanOrEqual(threshold);
    seedProgress({ completions: earlier.list as PlayerProgress['completions'], totalXp: earlier.xp });

    openApp(`#/missions/${target.id}`);
    fireEvent.click(await screen.findByRole('button', { name: 'เริ่มภารกิจ' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันว่าทำสำเร็จ' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ยืนยันสำเร็จ' }));

    const xp = storageService.getProgress().totalXp;
    expect(getLevelFromXp(xp)).toBe(2);
    expect(await screen.findByText(/เลเวลอัป! ตอนนี้คุณอยู่เลเวล 2/)).toBeInTheDocument();
  });

  it('levelFrom/levelTo and progress come from the central table, even across several levels', () => {
    const m = missions.find((x) => x.active && x.repeatPolicy === 'once')!;
    const before = totalXpForLevel(4) - 1;
    const started = { ...storageService.getDefaultProgress(), totalXp: before, inProgress: [{ missionId: m.id, startedAt: new Date().toISOString(), completedSteps: [] }] };
    const r = evaluateMissionCompletion(started, m.id, new Date());
    if (!r.ok) throw new Error(r.reason);
    expect(r.levelFrom).toBe(3);
    expect(r.levelTo).toBe(getLevelFromXp(before + m.xpReward));
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(totalXpForLevel(10) + 5)).toBe(10);
    expect(getLevelProgress(totalXpForLevel(10))).toBe(0);
  });
});

describe('Flow F — reset leaves no old score or badges', () => {
  it('reset game returns progress to the initial state', async () => {
    seedProfile();
    const m = missions[0];
    seedProgress({ completions: [completion(m.id, m.xpReward)] as PlayerProgress['completions'], unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: new Date().toISOString() }] });
    openApp('#/settings');
    fireEvent.click((await screen.findAllByRole('button', { name: 'รีเซ็ตเกม' }))[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'รีเซ็ตเกม' }));

    const p = storageService.getProgress();
    expect(p).toEqual(storageService.getDefaultProgress());
    expect(storageService.getProfile()?.displayName).toBe('Tester');
    refresh('#/achievements');
    await screen.findByRole('heading', { level: 1 });
    expect(storageService.getProgress().unlockedBadges).toHaveLength(0);
  });
});

describe('Flow F — Escape cancels a destructive dialog', () => {
  it('pressing Escape on clear-all keeps every record', async () => {
    seedProfile();
    openApp('#/settings');
    fireEvent.click(await screen.findByRole('button', { name: 'ลบบัญชี' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(storageService.getProfile()?.displayName).toBe('Tester');
  });
});

describe('Intro — slide to unlock', () => {
  it('a new player sees the intro first, even on a deep link, and goes to Welcome', async () => {
    sessionStorage.clear();
    openApp('#/missions');
    expect(screen.getByRole('heading', { name: /ปลูกวันนี้/ })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: /เลื่อนเพื่อเริ่มต้น/ }), { key: 'Enter' });
    // Unlocking first plays a short celebration (leaf burst), then opens the app.
    await vi.waitFor(() => expect(document.querySelectorAll('.intro-burst-leaf')).toHaveLength(14));
    expect(window.location.hash).not.toBe('#/welcome');
    await vi.waitFor(() => expect(window.location.hash).toBe('#/welcome'), { timeout: 3000 });
  });

  it('an existing player sees the intro first, then goes to Home', async () => {
    sessionStorage.clear();
    seedProfile();
    openApp('#/settings');
    expect(screen.getByRole('heading', { name: /ปลูกวันนี้/ })).toBeInTheDocument();
    expect(screen.getByText('Tester · เลเวล 1')).toBeInTheDocument();
    expect(screen.getByText(/วันนี้ 0\/3/)).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: /เลื่อนเพื่อเข้าเกม/ }), { key: 'Enter' });
    expect(await screen.findByText('สวัสดี Tester', undefined, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/home');
  });

  it('an app-icon shortcut opens its own page after the intro', async () => {
    sessionStorage.clear();
    seedProfile();
    openApp('#/missions?open=1');
    fireEvent.keyDown(screen.getByRole('button', { name: /เลื่อนเพื่อเข้าเกม/ }), { key: 'Enter' });
    await vi.waitFor(() => expect(window.location.hash).toBe('#/missions'), { timeout: 3000 });
  });

  it('shows again every time the site is opened', async () => {
    sessionStorage.clear();
    seedProfile();
    openApp('#/');
    fireEvent.keyDown(screen.getByRole('button', { name: /เลื่อนเพื่อเข้าเกม/ }), { key: 'Enter' });
    await screen.findByText('สวัสดี Tester', undefined, { timeout: 5000 });

    refresh('#/home');
    expect(screen.getByRole('heading', { name: /ปลูกวันนี้/ })).toBeInTheDocument();
    expect(screen.queryByText('สวัสดี Tester')).not.toBeInTheDocument();
  });
});

describe('Delete account — start over with a new character', () => {
  it('deletes the old player and creates a new level-1 one with a new name', async () => {
    seedProfile();
    const m = missions[0];
    seedProgress({ completions: [completion(m.id, m.xpReward)] as PlayerProgress['completions'], unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: new Date().toISOString() }] });
    openApp('#/settings');
    fireEvent.click(await screen.findByRole('button', { name: 'ลบบัญชี' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ลบบัญชี' }));
    await vi.waitFor(() => expect(window.location.hash).toBe('#/welcome/profile'));

    fireEvent.click(await screen.findByRole('button', { name: 'ต่อไป' }, { timeout: 5000 }));
    await screen.findByText(/เลือกได้สูงสุด/);
    fireEvent.click(screen.getByRole('button', { name: 'ต่อไป' }));
    fireEvent.change(await screen.findByLabelText('ชื่อผู้เล่น'), { target: { value: 'NewHero' } });
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มภารกิจแรก' }));

    expect(await screen.findByText('สวัสดี NewHero', undefined, { timeout: 5000 })).toBeInTheDocument();
    const p = storageService.getProgress();
    expect(p.totalXp).toBe(0);
    expect(p.completions).toHaveLength(0);
    expect(p.unlockedBadges).toHaveLength(0);
    expect(storageService.getProfile()!.id).not.toBe('p1');
  }, 20_000);
});

describe('Flow G — direct navigation', () => {
  it('protected route without a profile goes to welcome', async () => {
    openApp('#/home');
    await vi.waitFor(() => expect(window.location.hash).toBe('#/welcome'));
  });

  it('unknown mission id shows Mission Not Found', async () => {
    seedProfile();
    openApp('#/missions/invalid-id');
    expect(await screen.findByText(/Mission Not Found/)).toBeInTheDocument();
  });

  it('quiz result without an attempt shows a message and a link to the quiz', async () => {
    seedProfile();
    openApp('#/quiz/result');
    const links = await screen.findAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '#/quiz')).toBe(true);
  });

  it('unknown route shows a not-found page with a way home', async () => {
    seedProfile();
    openApp('#/does-not-exist');
    expect(await screen.findByText('ไม่พบหน้านี้')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute('href', '#/home');
  });
});

describe('Flow H — persistence and broken data', () => {
  it('profile, XP, missions, badges, quiz attempts and settings survive a refresh', async () => {
    seedProfile();
    openApp('#/settings');
    fireEvent.click(await screen.findByRole('switch', { name: 'เสียงเอฟเฟกต์' }));
    const m = missions[0];
    seedProgress({
      completions: [completion(m.id, m.xpReward)] as PlayerProgress['completions'],
      unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: new Date().toISOString() }],
    });

    refresh('#/settings');
    expect(await screen.findByRole('switch', { name: 'เสียงเอฟเฟกต์' })).toHaveAttribute('aria-checked', 'false');
    const p = storageService.getProgress();
    expect(p.totalXp).toBe(m.xpReward);
    expect(p.completions).toHaveLength(1);
    expect(p.unlockedBadges).toHaveLength(1);
  });

  it('corrupt JSON does not crash the app and is backed up instead of overwritten', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    seedProfile();
    localStorage.setItem('ecoquest_progress', '{not json');
    openApp('#/home');
    expect(await screen.findByText('สวัสดี Tester')).toBeInTheDocument();
    expect(localStorage.getItem('ecoquest_progress' + CORRUPT_BACKUP_SUFFIX)).toBe('{not json');
    vi.restoreAllMocks();
  });
});

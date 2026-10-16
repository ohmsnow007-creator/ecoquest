import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider } from '../store/GameContext';
import { SproutyCare } from '../pages/SproutyCare';
import { Wardrobe } from '../components/cosmetics/Wardrobe';
import { storageService, sanitizeProgress, sanitizeProfile } from '../services/storageService';
import { getCareState, givesFertilizer, bondFromCare, BOND_STEP } from '../utils/care';
import { ECO_EVENTS, getActiveEvent, getNextEvent, inEventWindow } from '../data/events';
import { COSMETICS, getCosmeticStatus, wearableOutfit } from '../data/cosmetics';
import { PotFront } from '../components/cosmetics/SproutyScenery';
import { getLocalDate } from '../utils/streak';
import type { PlayerProgress } from '../types';

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '',
  preferences: { reducedMotion: true, selectedGoalIds: [], profileColor: 'mint', celebrations: false, outfit: { hat: 'hat-leaf-cap' } },
};
const completion = (id: string, localDate: string, missionId = 'waste-001') => ({
  id, missionId, completedAt: `${localDate}T09:00:00.000Z`, localDate, xpAwarded: 20, completionType: 'educational' as const,
});
const progressWith = (completions: ReturnType<typeof completion>[], care?: PlayerProgress['care']): PlayerProgress => ({
  ...storageService.getDefaultProgress(), completions, ...(care ? { care } : {}),
});

/** Completion ids that do / don't drop fertilizer (the draw is fixed per id). */
const idsWhere = (want: boolean, n: number) => {
  const out: string[] = [];
  for (let i = 0; out.length < n; i++) if (givesFertilizer(completion(`c${i}`, '2026-10-01')) === want) out.push(`c${i}`);
  return out;
};

describe('care rules', () => {
  it('fertilizer is a fixed draw per completion, about a third of missions', () => {
    const many = Array.from({ length: 600 }, (_, i) => completion(`id-${i}`, '2026-10-01'));
    const share = many.filter(givesFertilizer).length / many.length;
    expect(share).toBeGreaterThan(0.27);
    expect(share).toBeLessThan(0.41);
    expect(givesFertilizer(many[5])).toBe(givesFertilizer({ ...many[5] }));
  });

  it('water needs a mission today; Sprouty misses you after 3 days away but bond never drops', () => {
    const today = '2026-10-17';
    expect(getCareState(progressWith([completion('a', today)]), today)).toMatchObject({ hasWaterToday: true, wateredToday: false });
    const away = getCareState(progressWith([completion('a', '2026-10-10')], { wateredDays: ['2026-10-10'], fertilizerUsed: 0 }), today);
    expect(away).toMatchObject({ hasWaterToday: false, daysAway: 7, mood: 'worried' });
    expect(away.line).toContain('คิดถึง');
    expect(away.bond.points).toBe(10);
  });

  it('bond levels up with care and caps at 10', () => {
    expect(bondFromCare({ wateredDays: [], fertilizerUsed: 0 }).level).toBe(1);
    expect(bondFromCare({ wateredDays: ['a', 'b', 'c', 'd'], fertilizerUsed: 0 }).level).toBe(2);
    expect(bondFromCare({ wateredDays: [], fertilizerUsed: 100 })).toMatchObject({ level: 10, nextAt: null });
    expect(BOND_STEP).toBe(40);
  });

  it('storage keeps valid care only and never lets used fertilizer go negative', () => {
    const p = sanitizeProgress({ completions: [], care: { wateredDays: ['2026-10-01', 'bad', '2026-10-01', 7], fertilizerUsed: -4 } });
    expect(p.care).toEqual({ wateredDays: ['2026-10-01'], fertilizerUsed: 0 });
    expect(sanitizeProgress({ care: 'nope' }).care).toBeUndefined();
  });
});

describe('environmental-day events', () => {
  it('runs from 3 days before to 3 days after each day', () => {
    const food = ECO_EVENTS.find((e) => e.id === 'food-day')!;
    expect(inEventWindow(food, '2026-10-13')).toBe(true);
    expect(inEventWindow(food, '2026-10-19')).toBe(true);
    expect(inEventWindow(food, '2026-10-20')).toBe(false);
    expect(getActiveEvent('2026-10-17')?.id).toBe('food-day');
    expect(getActiveEvent('2026-11-01')).toBeUndefined();
    expect(getNextEvent('2026-11-01').event.id).toBe('thai-env-day');
  });

  it('the reward unlocks only from a recorded mission of the right category in the event week', () => {
    const chef = COSMETICS.find((c) => c.id === 'hat-chef')!;
    expect(getCosmeticStatus(chef, progressWith([completion('a', '2026-10-15', 'waste-001')])).unlocked).toBe(false);
    expect(getCosmeticStatus(chef, progressWith([completion('a', '2026-09-01', 'consumption-001')])).unlocked).toBe(false);
    expect(getCosmeticStatus(chef, progressWith([completion('a', '2026-10-15', 'consumption-001')])).unlocked).toBe(true);
  });
});

describe('separate outfits for the character and Sprouty', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    // The leaf hat comes with the first-mission badge.
    localStorage.setItem(
      'ecoquest_progress',
      JSON.stringify({ ...progressWith([completion('a', '2026-10-01')]), unlockedBadges: [{ badgeId: 'badge-first-mission', unlockedAt: '2026-10-01T09:00:00.000Z' }] }),
    );
  });

  it('Sprouty mirrors the character until dressed on its own; then each keeps its own look', () => {
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <Wardrobe />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    expect(storageService.getProfile()?.preferences.sproutyOutfit).toBeUndefined();
    fireEvent.click(screen.getByRole('tab', { name: /แต่งให้ Sprouty/ }));
    expect(screen.getByRole('tab', { name: 'กระถาง' })).toBeInTheDocument();
    // take the hat off Sprouty only
    fireEvent.click(screen.getByRole('button', { name: /หมวกใบไม้/ }));
    const prefs = storageService.getProfile()!.preferences;
    expect(prefs.sproutyOutfit).toEqual({});
    expect(prefs.outfit).toEqual({ hat: 'hat-leaf-cap' });
    // the character tab has no pots or backgrounds
    fireEvent.click(screen.getByRole('tab', { name: /แต่งตัวละครของฉัน/ }));
    expect(screen.queryByRole('tab', { name: 'กระถาง' })).toBeNull();
  });

  it('pots and backgrounds are never worn by the character, even from a tampered save', () => {
    const p = progressWith([], { wateredDays: [], fertilizerUsed: 0 });
    const granted = { ...p, adminGrants: [{ id: 'g', at: 'x', kind: 'cosmetic' as const, cosmeticId: 'pot-clay' }] };
    expect(wearableOutfit({ pot: 'pot-clay' }, granted, 'avatar')).toEqual({});
    expect(wearableOutfit({ pot: 'pot-clay' }, granted, 'sprouty')).toEqual({ pot: 'pot-clay' });
    const clean = sanitizeProfile({ ...profile, preferences: { ...profile.preferences, outfit: { pot: 'pot-clay' }, sproutyOutfit: { pot: 'pot-clay', hat: 'nope' } } });
    expect(clean?.preferences.outfit).toBeUndefined();
    expect(clean?.preferences.sproutyOutfit).toEqual({ pot: 'pot-clay' });
  });

  it('every pot has artwork', () => {
    for (const c of COSMETICS.filter((x) => x.slot === 'pot')) {
      const { container, unmount } = render(<svg><PotFront id={c.id} /></svg>);
      expect(container.querySelector('svg')!.children.length).toBeGreaterThan(0);
      unmount();
    }
  });
});

describe('care page', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  });

  const renderCare = () =>
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <SproutyCare />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );

  it('waters once a day after a mission, and uses only fertilizer actually earned', () => {
    const today = getLocalDate();
    const [withFert] = idsWhere(true, 1);
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith([completion(withFert, today)])));
    renderCare();
    const waterBtn = screen.getByRole('button', { name: /รดน้ำ/ });
    fireEvent.click(waterBtn);
    expect(storageService.getProgress().care?.wateredDays).toEqual([today]);
    expect(screen.getByRole('button', { name: /รดน้ำ/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /ใส่ปุ๋ย/ }));
    expect(storageService.getProgress().care?.fertilizerUsed).toBe(1);
    expect(screen.getByRole('button', { name: /ใส่ปุ๋ย/ })).toBeDisabled();
  });

  it('without a mission today there is no water to pour', () => {
    const [noFert] = idsWhere(false, 1);
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith([completion(noFert, '2020-01-01')])));
    renderCare();
    expect(screen.getByRole('button', { name: /รดน้ำ/ })).toBeDisabled();
    expect(screen.getByText('ทำภารกิจวันนี้สักข้อเพื่อได้น้ำ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ใส่ปุ๋ย/ })).toBeDisabled();
  });
});

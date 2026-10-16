import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react';
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
import { SproutySeed } from '../components/illustrations/SproutySeed';
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
    expect(away).toMatchObject({ hasWaterToday: false, daysAway: 7, daysSinceWater: 7, thirsty: true, mood: 'pleading' });
    expect(away.line).toContain('ไม่ได้รดน้ำมา 7 วัน');
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

describe('special daily missions', () => {
  it('1 on weekdays and 2 at the weekend, picked from that day’s daily missions', async () => {
    const { getSpecialMissionIds, getDailyMissions } = await import('../utils/challenges');
    const wed = new Date(2026, 9, 14, 10);
    const sat = new Date(2026, 9, 17, 10);
    expect(getSpecialMissionIds('p1', wed)).toHaveLength(1);
    expect(getSpecialMissionIds('p1', sat)).toHaveLength(2);
    const daily = getDailyMissions('p1', sat).map((m) => m.id);
    expect(getSpecialMissionIds('p1', sat).every((id) => daily.includes(id))).toBe(true);
    expect(getSpecialMissionIds('p1', wed)).toEqual(getSpecialMissionIds('p1', wed));
  });

  it('pay bonus XP once, are marked special, and always give Sprouty fertilizer', async () => {
    const { evaluateMissionCompletion } = await import('../services/rewardService');
    const { SPECIAL_BONUS_XP, SPECIAL_FERTILIZER } = await import('../config/challenges');
    const { missions } = await import('../data/missions');
    const { fertilizerFrom } = await import('../utils/care');
    const m = missions.find((x) => x.repeatPolicy === 'daily' && x.active)!;
    const base = { ...storageService.getDefaultProgress(), inProgress: [{ missionId: m.id, startedAt: '2026-10-17T08:00:00.000Z', completedSteps: [] }] };
    const now = new Date(2026, 9, 17, 9);
    const special = evaluateMissionCompletion(base, m.id, now, undefined, true);
    const normal = evaluateMissionCompletion(base, m.id, now, undefined, false);
    if (!special.ok || !normal.ok) throw new Error('completion failed');
    expect(special.completion.xpAwarded).toBe(m.xpReward + SPECIAL_BONUS_XP);
    expect(special.completion.special).toBe(true);
    expect(normal.completion.xpAwarded).toBe(m.xpReward);
    expect(fertilizerFrom(special.completion)).toBe(SPECIAL_FERTILIZER);
    // stored and reloaded, the special flag survives; the same mission can't be done twice today
    const reloaded = sanitizeProgress(special.next);
    expect(reloaded.completions[0].special).toBe(true);
    expect(evaluateMissionCompletion(reloaded, m.id, now, undefined, true).ok).toBe(false);
  });
});

describe('profile frames and free backgrounds', () => {
  it('five free frames and backgrounds are there from the start; special frames come with Sprouty levels', () => {
    const fresh = storageService.getDefaultProgress();
    const free = COSMETICS.filter((c) => c.unlock.type === 'free');
    expect(free.filter((c) => c.slot === 'frame')).toHaveLength(5);
    expect(free.filter((c) => c.slot === 'background').length).toBeGreaterThanOrEqual(5);
    expect(free.every((c) => getCosmeticStatus(c, fresh).unlocked)).toBe(true);
    for (const id of ['frame-leaf', 'frame-flower', 'frame-golden']) {
      expect(getCosmeticStatus(COSMETICS.find((c) => c.id === id)!, fresh).unlocked).toBe(false);
    }
  });

  it('frames are worn by the character only', () => {
    const fresh = storageService.getDefaultProgress();
    expect(wearableOutfit({ frame: 'frame-sky' }, fresh, 'avatar')).toEqual({ frame: 'frame-sky' });
    expect(wearableOutfit({ frame: 'frame-sky' }, fresh, 'sprouty')).toEqual({});
    const clean = sanitizeProfile({ ...profile, preferences: { ...profile.preferences, outfit: { frame: 'frame-sky' }, sproutyOutfit: { frame: 'frame-sky' } } });
    expect(clean?.preferences.outfit).toEqual({ frame: 'frame-sky' });
    expect(clean?.preferences.sproutyOutfit).toEqual({});
  });
});

describe('admin can grant world stage, water, fertilizer and bond', () => {
  it('extra water and fertilizer are usable on the care page; world and bond grow; all revocable', async () => {
    const { adminTotal, worldMissionCount } = await import('../utils/admin');
    const { getWorldState } = await import('../utils/world');
    const base = progressWith([], { wateredDays: [], fertilizerUsed: 0 });
    const granted: PlayerProgress = {
      ...base,
      adminGrants: [
        { id: 'w', at: 'x', kind: 'world', missions: 90 },
        { id: 'a', at: 'x', kind: 'water', amount: 2 },
        { id: 'f', at: 'x', kind: 'fertilizer', amount: 2 },
        { id: 'b', at: 'x', kind: 'bond', points: 160 },
      ],
    };
    const clean = sanitizeProgress(granted);
    expect(clean.adminGrants).toHaveLength(4);
    expect(adminTotal(clean, 'water')).toBe(2);
    expect(getWorldState(worldMissionCount(clean)).current.stage).toBe(7);
    const st = getCareState(clean, '2026-10-17');
    expect(st).toMatchObject({ waterLeft: 2, fertilizer: 2 });
    expect(st.bond.level).toBe(5);
    // after pouring both extra waters there is none left
    const used = getCareState({ ...clean, care: { wateredDays: [], fertilizerUsed: 2, bonusWaterUsed: 2 } }, '2026-10-17');
    expect(used).toMatchObject({ waterLeft: 0, fertilizer: 0 });
    // tampered grants are dropped
    expect(sanitizeProgress({ adminGrants: [{ id: 'z', at: 'x', kind: 'water', amount: -3 }, { id: 'y', at: 'x', kind: 'world', missions: 1.5 }] }).adminGrants).toBeUndefined();
  });

  it('the admin panel buttons give water and fertilizer together, and set world and bond levels', async () => {
    const { Admin } = await import('../pages/Admin');
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith([])));
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <Admin />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    for (const pin of ['654321', '031069']) {
      for (const d of pin) fireEvent.click(screen.getByRole('button', { name: d }));
      await act(async () => {
        await new Promise((r) => setTimeout(r, 400));
      });
    }
    await screen.findByText('น้ำและปุ๋ยสำหรับ Sprouty');
    fireEvent.click(screen.getByRole('button', { name: 'เพิ่มจำนวน' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยัน' }));
    let p = storageService.getProgress();
    expect(getCareState(p)).toMatchObject({ fertilizer: 2 });
    expect(getCareState(p).waterLeft).toBe(2);

    const [worldSelect, bondSelect] = screen.getAllByRole('combobox').slice(1);
    fireEvent.change(worldSelect, { target: { value: '6' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'ตั้งระดับ' })[0]);
    fireEvent.change(bondSelect, { target: { value: '4' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'ตั้งระดับ' })[1]);
    p = storageService.getProgress();
    const { worldMissionCount } = await import('../utils/admin');
    expect(worldMissionCount(p)).toBe(60);
    expect(getCareState(p).bond.level).toBe(4);
  }, 20_000);
});

describe('choosing a frame and Sprouty’s background where you expect them', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith([])));
  });

  it('the edit-profile sheet sets the profile frame on save; locked frames only explain how to unlock', async () => {
    const { Profile } = await import('../pages/Profile');
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <Profile />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'แก้ไขชื่อและอวาตาร์' }));
    const frames = screen.getByRole('radiogroup', { name: 'กรอบรูป' });
    fireEvent.click(within(frames).getByRole('radio', { name: /^กรอบใบไม้ต้นอ่อน/ }));
    expect(storageService.getProfile()?.preferences.outfit?.frame).toBeUndefined();
    fireEvent.click(within(frames).getByRole('radio', { name: 'กรอบฟ้าใส' }));
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก' }));
    expect(storageService.getProfile()?.preferences.outfit?.frame).toBe('frame-sky');
  });

  it('the care page opens a decorate sheet that changes Sprouty’s background and pot', () => {
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <SproutyCare />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    expect(screen.queryByRole('radiogroup', { name: 'พื้นหลังของ Sprouty' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /แต่งมุมของ Sprouty/ }));
    expect(screen.getByRole('dialog', { name: 'แต่งมุมของ Sprouty' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'พื้นหลังของ Sprouty' })).getByRole('radio', { name: 'สวนหลังบ้าน' }));
    expect(storageService.getProfile()?.preferences.sproutyOutfit?.background).toBe('bg-backyard');
    // the character's outfit is untouched
    expect(storageService.getProfile()?.preferences.outfit).toEqual({ hat: 'hat-leaf-cap' });
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'พื้นหลังของ Sprouty' })).getByRole('radio', { name: 'พื้นเรียบ' }));
    expect(storageService.getProfile()?.preferences.sproutyOutfit?.background).toBeUndefined();
    // pots are locked for a new player: tapping one changes nothing
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'กระถาง' })).getByRole('radio', { name: /^กระถางดินเผา/ }));
    expect(storageService.getProfile()?.preferences.sproutyOutfit?.pot).toBeUndefined();
  });
});

describe('Sprouty on the care page feels alive', () => {
  it('begs with puppy eyes after 2+ days without water, and is fine again once watered', () => {
    const today = '2026-10-17';
    const yesterday = getCareState(progressWith([completion('a', '2026-10-16')], { wateredDays: ['2026-10-16'], fertilizerUsed: 0 }), today);
    expect(yesterday.thirsty).toBe(false);
    const twoDays = getCareState(progressWith([completion('a', today)], { wateredDays: ['2026-10-15'], fertilizerUsed: 0 }), today);
    expect(twoDays).toMatchObject({ thirsty: true, mood: 'pleading', waterLeft: 1 });
    expect(twoDays.line).toContain('รดให้หน่อยน้า');
    const watered = getCareState(progressWith([completion('a', today)], { wateredDays: ['2026-10-15', today], fertilizerUsed: 0 }), today);
    expect(watered).toMatchObject({ thirsty: false, mood: 'cheer' });
  });

  it('greets the player by name when the page opens, then shows how it is doing', async () => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    localStorage.setItem('ecoquest_progress', JSON.stringify(progressWith([])));
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <SproutyCare />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    expect(screen.getByText(/สวัสดี Tester! 👋/)).toBeInTheDocument();
    expect(await screen.findByText('ทำภารกิจแรกเพื่อเอาน้ำมารดให้ฉันหน่อยนะ', {}, { timeout: 4000 })).toBeInTheDocument();
  }, 10_000);

  it('the pleading face renders at every stage', () => {
    for (const stage of [1, 2, 3, 4] as const) {
      const { container, unmount } = render(<SproutySeed stage={stage} mood="pleading" />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });
});

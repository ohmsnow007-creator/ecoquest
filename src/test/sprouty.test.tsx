import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SHY_LINES } from '../components/sprouty/usePet';
import { COSMETICS, getCosmeticStatus } from '../data/cosmetics';
import { missions } from '../data/missions';
import { storageService } from '../services/storageService';
import { AvatarCosmetics, SproutyCosmetics } from '../components/cosmetics/CosmeticArt';
import { getSproutyGreeting, getSproutyStage } from '../utils/sprouty';
import { SproutyHomeCard } from '../components/sprouty/SproutyHomeCard';
import { SproutySeed } from '../components/illustrations/SproutySeed';

describe('Sprouty growth', () => {
  it('grows seed → four leaves → flower → small tree by level', () => {
    expect(getSproutyStage(1)).toMatchObject({ stage: 1, nextAt: 3 });
    expect(getSproutyStage(2).stage).toBe(1);
    expect(getSproutyStage(3)).toMatchObject({ stage: 2, nextAt: 8 });
    expect(getSproutyStage(8)).toMatchObject({ stage: 3, nextAt: 15 });
    expect(getSproutyStage(15)).toMatchObject({ stage: 4, nextAt: null });
    expect(getSproutyStage(30).stage).toBe(4);
  });

  it('every stage and mood renders', () => {
    for (const stage of [1, 2, 3, 4] as const) {
      for (const mood of ['happy', 'cheer', 'sleepy', 'worried'] as const) {
        const { container, unmount } = render(<SproutySeed stage={stage} mood={mood} />);
        expect(container.querySelector('svg')).not.toBeNull();
        unmount();
      }
    }
  });
});

describe('Sprouty greeting', () => {
  const base = { name: 'มินท์', todayCount: 0, streak: 0, dailyComplete: false };

  it('greets by time of day', () => {
    expect(getSproutyGreeting({ ...base, hour: 8 }).hello).toBe('อรุณสวัสดิ์ มินท์!');
    expect(getSproutyGreeting({ ...base, hour: 14 }).hello).toBe('สวัสดีตอนบ่าย มินท์!');
    expect(getSproutyGreeting({ ...base, hour: 19 }).hello).toBe('สวัสดีตอนเย็น มินท์!');
    expect(getSproutyGreeting({ ...base, hour: 23 }).hello).toBe('ดึกแล้วนะ มินท์');
    expect(getSproutyGreeting({ ...base, hour: 23 }).line).toContain('พักผ่อนบ้างนะ');
  });

  it('mood follows real progress', () => {
    expect(getSproutyGreeting({ ...base, hour: 10, dailyComplete: true, todayCount: 3 }).mood).toBe('cheer');
    expect(getSproutyGreeting({ ...base, hour: 10, streak: 4 }).mood).toBe('worried');
    expect(getSproutyGreeting({ ...base, hour: 10, streak: 4 }).line).toContain('Streak 4 วัน');
    expect(getSproutyGreeting({ ...base, hour: 10 }).mood).toBe('sleepy');
    expect(getSproutyGreeting({ ...base, hour: 10, todayCount: 1, streak: 2 }).mood).toBe('happy');
  });

  it('the Home card shows the greeting and growth stage', () => {
    render(<SproutyHomeCard name="มินท์" level={9} todayCount={0} streak={3} dailyComplete={false} now={new Date(2026, 9, 15, 9)} />);
    expect(screen.getByText('อรุณสวัสดิ์ มินท์!')).toBeInTheDocument();
    expect(screen.getByText(/Streak 3 วัน/)).toBeInTheDocument();
    expect(screen.getByText('Sprouty: ต้นผลิดอก')).toBeInTheDocument();
    expect(screen.getByText('โตเป็นต้นไม้น้อยที่เลเวล 15')).toBeInTheDocument();
  });
});

describe('intro time of day', () => {
  it('maps the local hour to a scene', async () => {
    const { getTimeOfDay } = await import('../utils/timeOfDay');
    expect([4, 5, 9, 10, 15, 16, 18, 19, 23].map(getTimeOfDay)).toEqual([
      'night', 'morning', 'morning', 'day', 'day', 'evening', 'evening', 'night', 'night',
    ]);
  });
});

describe('Sprouty gets (cutely) angry when poked too fast', () => {
  it('5 quick taps make it angry, it calms down by itself, and 4 taps do nothing', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { vi } = await import('vitest');
    const { useTantrum, ANGRY_LINES } = await import('../components/sprouty/useTantrum');
    vi.useFakeTimers();
    const { result } = renderHook(() => useTantrum());
    for (let i = 0; i < 4; i++) act(() => void result.current.tap());
    expect(result.current.angry).toBe(false);
    act(() => void result.current.tap());
    expect(result.current.angry).toBe(true);
    expect(ANGRY_LINES).toContain(result.current.line);
    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current.angry).toBe(false);
    // slow taps (more than 1.5 s apart) never add up
    for (let i = 0; i < 6; i++) {
      act(() => void result.current.tap());
      act(() => void vi.advanceTimersByTime(1600));
    }
    expect(result.current.angry).toBe(false);
    vi.useRealTimers();
  });

  it('the angry face renders at every growth stage', () => {
    for (const stage of [1, 2, 3, 4] as const) {
      const { container, unmount } = render(<SproutySeed stage={stage} mood="angry" />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });
});

describe('Sprouty head rubs', () => {
  const card = () => <SproutyHomeCard name="มินท์" level={1} todayCount={0} streak={0} dailyComplete={false} now={new Date(2026, 9, 15, 9)} />;
  const rect = { left: 0, top: 0, width: 120, height: 120, right: 120, bottom: 120, x: 0, y: 0, toJSON: () => ({}) };

  it('rubbing side to side over the head makes Sprouty shy, without counting as a tap', () => {
    render(card());
    const btn = screen.getByRole('button', { name: /ลูบหัว Sprouty/ });
    btn.getBoundingClientRect = () => rect as DOMRect;
    const before = screen.getByText(/./, { selector: 'p[aria-live]' }).textContent;
    fireEvent.pointerDown(btn, { pointerId: 1, clientX: 30, clientY: 30 });
    for (const x of [50, 70, 90, 70, 50, 30]) fireEvent.pointerMove(btn, { pointerId: 1, clientX: x, clientY: 30 });
    fireEvent.pointerUp(btn, { pointerId: 1 });
    fireEvent.click(btn);
    const said = screen.getByText(/./, { selector: 'p[aria-live]' }).textContent!;
    expect(said).not.toBe(before);
    expect(SHY_LINES).toContain(said);
  });

  it('a press on the soil, or a plain tap, is not a rub', () => {
    render(card());
    const btn = screen.getByRole('button', { name: /ลูบหัว Sprouty/ });
    btn.getBoundingClientRect = () => rect as DOMRect;
    fireEvent.pointerDown(btn, { pointerId: 1, clientX: 30, clientY: 110 });
    for (const x of [60, 100, 60, 20]) fireEvent.pointerMove(btn, { pointerId: 1, clientX: x, clientY: 110 });
    fireEvent.click(btn);
    expect(SHY_LINES).not.toContain(screen.getByText(/./, { selector: 'p[aria-live]' }).textContent);
  });

  it('the shy mood renders at every stage', () => {
    for (const stage of [1, 2, 3, 4] as const) {
      const { container, unmount } = render(<SproutySeed stage={stage} mood="shy" />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });
});

describe('mission cosmetics', () => {
  const progressWith = (missionIds: string[]) => ({
    ...storageService.getDefaultProgress(),
    completions: missionIds.map((missionId, i) => ({ id: `c${i}`, missionId, completedAt: '2026-10-01T00:00:00.000Z', localDate: '2026-10-01', xpAwarded: 10, completionType: 'educational' as const })),
  });
  const status = (id: string, p: ReturnType<typeof progressWith>) => getCosmeticStatus(COSMETICS.find((c) => c.id === id)!, p);

  it('unlock from recorded completions, overall or by category, with honest progress', () => {
    const water = missions.filter((m) => m.category === 'water').map((m) => m.id);
    const p = progressWith([water[0], water[1], water[0], 'waste-001', 'waste-001']);
    expect(status('bag-bottle', p)).toMatchObject({ unlocked: true, current: 5, target: 5 });
    expect(status('eyes-heart', p)).toMatchObject({ unlocked: false, current: 5, target: 10, condition: 'ทำภารกิจครบ 10 ครั้ง' });
    expect(status('hat-raindrop', p)).toMatchObject({ unlocked: true, current: 3 });
    expect(status('hat-mushroom', p)).toMatchObject({ unlocked: false, current: 0 });
    expect(status('hat-mushroom', p).condition).toContain('ภารกิจหมวด');
  });

  it('every item has artwork for the avatar and for Sprouty', () => {
    for (const c of COSMETICS) {
      const outfit = { [c.slot]: c.id };
      const a = render(<svg><AvatarCosmetics outfit={outfit} layer="front" /></svg>);
      expect(a.container.querySelector('svg')!.children.length).toBeGreaterThan(0);
      a.unmount();
      const s = render(<svg><SproutyCosmetics outfit={outfit} part={c.slot === 'eyes' ? 'face' : 'body'} /></svg>);
      expect(s.container.querySelector('svg')!.children.length).toBeGreaterThan(0);
      s.unmount();
    }
  });
});

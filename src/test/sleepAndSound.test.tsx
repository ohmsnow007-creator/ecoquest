import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { MotionConfig } from 'framer-motion';
import { useIdleSleep, IDLE_SLEEP_MS } from '../components/sprouty/useIdleSleep';
import { SproutySeed } from '../components/illustrations/SproutySeed';
import { WorldBuddy } from '../components/world/WorldBuddy';
import { sanitizeProfile } from '../services/storageService';

afterEach(() => vi.useRealTimers());

describe('Sprouty dozes off when left alone', () => {
  it('falls asleep after the idle time, a touch wakes it (once) and restarts the countdown', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useIdleSleep());
    expect(result.current.asleep).toBe(false);
    act(() => void vi.advanceTimersByTime(IDLE_SLEEP_MS - 1000));
    act(() => void result.current.poke());
    act(() => void vi.advanceTimersByTime(IDLE_SLEEP_MS - 1000));
    expect(result.current.asleep).toBe(false);
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.asleep).toBe(true);
    let woke = false;
    act(() => void (woke = result.current.poke()));
    expect(woke).toBe(true);
    expect(result.current.asleep).toBe(false);
    expect(result.current.waking).toBe(true);
    act(() => void (woke = result.current.poke()));
    expect(woke).toBe(false);
  });

  it('asleep, Sprouty shows drifting Z’s and a sleep bubble', () => {
    const moving = render(<MotionConfig reducedMotion="never"><SproutySeed mood="sleepy" stage={2} /></MotionConfig>);
    expect([...moving.container.querySelectorAll('text')].filter((t) => t.textContent === 'Z')).toHaveLength(3);
    expect(moving.container.querySelector('circle[fill="#DDF3FF"]')).not.toBeNull();
    moving.unmount();
  });

  it('the world buddy is a real button and dozes off too', () => {
    vi.useFakeTimers();
    const { getByRole, container } = render(<MotionConfig reducedMotion="always"><WorldBuddy /></MotionConfig>);
    const btn = getByRole('button', { name: 'แตะ Sprouty ประจำโลก' });
    act(() => void vi.advanceTimersByTime(IDLE_SLEEP_MS));
    expect(container.textContent).toContain('Z');
    act(() => btn.click());
    expect(container.textContent).not.toContain('Z');
  });
});

describe('sound effects are on by default', () => {
  const base = { id: 'p1', displayName: 'A', avatarId: 'avatar-leaf', createdAt: '', updatedAt: '' };
  it('new and older profiles get sound on; a choice made in Settings is kept', () => {
    expect(sanitizeProfile({ ...base, preferences: {} })?.preferences.soundEffects).toBe(true);
    expect(sanitizeProfile({ ...base, preferences: { soundEffects: false } })?.preferences.soundEffects).toBe(true);
    expect(sanitizeProfile({ ...base, preferences: { soundEffects: false, soundChosen: true } })?.preferences.soundEffects).toBe(false);
    expect(sanitizeProfile({ ...base, preferences: { soundEffects: true, soundChosen: true } })?.preferences.soundEffects).toBe(true);
  });
});

describe('recent activity', () => {
  it('a record that lifts several levels at once shows one line "เลเวล 1 → N"', async () => {
    const { buildActivityFeed, levelUpText } = await import('../utils/activity');
    const { storageService } = await import('../services/storageService');
    const { totalXpForLevel } = await import('../utils/xp');
    const p = { ...storageService.getDefaultProgress(), adminGrants: [{ id: 'g1', at: '2026-10-16T00:00:00.000Z', kind: 'xp' as const, amount: totalXpForLevel(6) }] };
    const levels = buildActivityFeed(p).filter((e) => e.type === 'level');
    expect(levels).toHaveLength(1);
    expect(levelUpText(levels[0] as { level: number; from: number })).toBe('เลื่อนจากเลเวล 1 → 6');
    expect(levelUpText({ from: 3, level: 4 })).toBe('เลื่อนเป็นเลเวล 4');
  });
});

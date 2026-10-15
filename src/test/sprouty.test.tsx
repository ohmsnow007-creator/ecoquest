import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

import { describe, it, expect } from 'vitest';
import { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { getSproutyGreeting } from '../utils/sprouty';
import { lazyRetry } from '../utils/lazyRetry';

describe('first-time greeting', () => {
  it('a brand-new player at night is welcomed, not told to come back tomorrow', () => {
    const g = getSproutyGreeting({ hour: 23, name: 'มินท์', todayCount: 0, streak: 0, dailyComplete: false, firstTime: true });
    expect(g.line).toContain('ยินดีต้อนรับ');
    expect(g.line).not.toContain('พรุ่งนี้');
    expect(getSproutyGreeting({ hour: 23, name: 'มินท์', todayCount: 0, streak: 0, dailyComplete: false }).line).toContain('พรุ่งนี้');
  });
});

describe('page loading on a flaky network', () => {
  it('retries a failed page download before showing an error', async () => {
    let calls = 0;
    const Page = lazyRetry(async () => {
      calls += 1;
      if (calls < 2) throw new TypeError('Failed to fetch dynamically imported module');
      return { default: () => <p>โหลดสำเร็จ</p> };
    });
    render(<Suspense fallback={null}><Page /></Suspense>);
    expect(await screen.findByText('โหลดสำเร็จ', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(calls).toBe(2);
  });
});

describe('world scene follows the clock', () => {
  it('shows the sun by day and a moon with stars at night', async () => {
    const { GreenWorldScene } = await import('../components/world/GreenWorldScene');
    const day = render(<GreenWorldScene stage={3} hour={12} />);
    expect(day.getByTestId('sun')).toBeInTheDocument();
    expect(day.queryByTestId('moon')).toBeNull();
    expect(day.getByRole('img').getAttribute('aria-label')).toContain('ยามกลางวัน');
    day.unmount();
    const night = render(<GreenWorldScene stage={3} hour={22} />);
    expect(night.getByTestId('moon')).toBeInTheDocument();
    expect(night.queryByTestId('sun')).toBeNull();
    expect(night.container.querySelectorAll('.scene-twinkle').length).toBeGreaterThan(5);
    night.unmount();
  });

  it('trees blink and sway once the world is green', async () => {
    const { GreenWorldScene } = await import('../components/world/GreenWorldScene');
    const { container } = render(<GreenWorldScene stage={4} hour={8} />);
    expect(container.querySelectorAll('.scene-sway').length).toBeGreaterThanOrEqual(5);
    expect(container.querySelectorAll('.scene-blink').length).toBeGreaterThanOrEqual(6);
  });
});

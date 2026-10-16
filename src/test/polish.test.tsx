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

describe('tapping the sun and moon', () => {
  it('the sun grins and the moon yawns, then they go back to normal', async () => {
    const { GreenWorldScene } = await import('../components/world/GreenWorldScene');
    const { fireEvent, act } = await import('@testing-library/react');
    const day = render(<GreenWorldScene stage={2} hour={12} />);
    const sun = day.getByRole('button', { name: 'จิ้มพระอาทิตย์' });
    fireEvent.click(sun);
    expect(sun.getAttribute('data-poked')).toBe('true');
    await act(async () => { await new Promise((r) => setTimeout(r, 1900)); });
    expect(sun.getAttribute('data-poked')).toBeNull();
    day.unmount();
    const night = render(<GreenWorldScene stage={2} hour={23} />);
    const moon = night.getByRole('button', { name: 'จิ้มพระจันทร์' });
    fireEvent.keyDown(moon, { key: 'Enter' });
    expect(moon.getAttribute('data-poked')).toBe('true');
    expect(moon.querySelectorAll('text').length).toBe(2); // the floating "z z"
  });
});

describe('Sprouty follows the clock on other pages', () => {
  it('missions page: bedtime nudge at night, honest counts by day', async () => {
    const { missionsLine, worldLine, timeOpener } = await import('../utils/sprouty');
    expect(missionsLine('night', { left: 2, started: true }).text).toBe('ดึกแล้ว ทำอีกข้อแล้วไปนอนนะ');
    expect(missionsLine('night', { left: 0, started: true }).text).toContain('ไปนอนได้เลย');
    expect(missionsLine('evening', { left: 2, started: true }).text).toContain('เหลืออีก 2 ข้อ');
    expect(missionsLine('morning', { left: 3, started: false }).text).toContain('อรุณสวัสดิ์');
    expect(missionsLine('day', { left: 1, started: true }).text).toContain('เหลืออีก 1 ข้อ');
    expect(worldLine('night').text).toContain('พระจันทร์');
    expect(worldLine('day').text).toContain('พระอาทิตย์');
    expect(timeOpener('day')).toBe('');
  });
});

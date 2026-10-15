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

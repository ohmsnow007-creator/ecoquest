import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider } from '../store/GameContext';
import { Impact } from '../pages/Impact';
import { summarizeImpact, buildImpactCsv, calculateRecord, inRange, CALCULATION_VERSION } from '../services/impactCalculator';
import { storageService } from '../services/storageService';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { getLocalDate } from '../utils/streak';
import type { ImpactRecord, PlayerProgress } from '../types';

const now = new Date(2026, 9, 15, 12);
const day = (offset: number) => getLocalDate(new Date(2026, 9, 15 - offset));

function rec(partial: Partial<ImpactRecord> & Pick<ImpactRecord, 'activityType' | 'quantity' | 'unit'>): ImpactRecord {
  return {
    id: Math.random().toString(36).slice(2),
    date: day(0),
    source: 'user-entered',
    calculationVersion: CALCULATION_VERSION,
    createdAt: now.toISOString(),
    ...partial,
  };
}

function progress(records: ImpactRecord[], completionDays: number[] = [], totalXp = 0): PlayerProgress {
  return {
    ...storageService.getDefaultProgress(),
    totalXp,
    impactRecords: records,
    completions: completionDays.map((d, i) => ({
      id: `c${i}`, missionId: 'energy-001', completedAt: new Date(2026, 9, 15 - d, 9).toISOString(), localDate: day(d), xpAwarded: 20, completionType: 'self-reported' as const,
    })),
  };
}

describe('emission factor registry', () => {
  it('every factor has a publisher, source URL, dates and is not sample data', () => {
    for (const f of EMISSION_FACTORS) {
      expect(f.isSample).toBe(false);
      expect(f.publisher).toBeTruthy();
      expect(f.sourceUrl).toMatch(/^https:\/\//);
      expect(f.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(f.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('impact calculation service', () => {
  it('uses only verified factors: electricity and tap water are calculated, waste is not', () => {
    const p = progress([
      rec({ activityType: 'electricity-saved', quantity: 10, unit: 'kWh' }),
      rec({ activityType: 'water-saved', quantity: 1000, unit: 'L' }),
      rec({ activityType: 'waste-sorted', quantity: 2, unit: 'kg' }),
    ]);
    const s = summarizeImpact(p, '7d', now);
    expect(s.quantities['electricity-saved']).toBe(10);
    expect(s.quantities['water-saved']).toBe(1000);
    expect(s.emissions.lines).toHaveLength(2);
    // 10 kWh × 0.475 + 1 m³ (1,000 L) × 0.7836
    expect(s.emissions.totalKg).toBe(5.53); // totals are rounded to 2 decimals
    expect(s.emissions.uncalculated.map((u) => u.activityType)).toEqual(['waste-sorted']);
  });

  it('tap water uses TGO 0.7836 kgCO2e per m³, converted to litres exactly', () => {
    const line = calculateRecord(rec({ activityType: 'water-saved', quantity: 500, unit: 'L' }));
    expect(line).toMatchObject({ factor: { id: 'th-tap-water-mwa-cfp-2026' } });
    expect('kgCO2e' in line && line.kgCO2e).toBeCloseTo(0.3918, 6);
  });

  it('never turns XP into CO2e', () => {
    const s = summarizeImpact(progress([], [0, 1, 2], 999), 'all', now);
    expect(s.gameXp).toBe(60);
    expect(s.emissions.totalKg).toBeNull();
  });

  it('rejects a unit that does not match the factor', () => {
    const bad = rec({ activityType: 'electricity-saved', quantity: 5, unit: 'L' as never });
    expect(calculateRecord(bad)).toMatchObject({ reason: 'unit-mismatch' });
  });

  it('the period selector changes the result', () => {
    const p = progress(
      [rec({ activityType: 'electricity-saved', quantity: 2, unit: 'kWh', date: day(1) }), rec({ activityType: 'electricity-saved', quantity: 8, unit: 'kWh', date: day(20) })],
      [1, 20, 40],
    );
    expect(summarizeImpact(p, '7d', now).quantities['electricity-saved']).toBe(2);
    expect(summarizeImpact(p, '30d', now).quantities['electricity-saved']).toBe(10);
    expect(summarizeImpact(p, '7d', now).activities.total).toBe(1);
    expect(summarizeImpact(p, '30d', now).activities.total).toBe(2);
    expect(summarizeImpact(p, 'all', now).activities.total).toBe(3);
    expect(inRange(day(6), '7d', now)).toBe(true);
    expect(inRange(day(7), '7d', now)).toBe(false);
  });

  it('builds a 7-day timeline from real completions', () => {
    const s = summarizeImpact(progress([], [0, 0, 3]), '7d', now);
    expect(s.activities.byPeriod).toHaveLength(7);
    expect(s.activities.byPeriod.at(-1)!.missions).toBe(2);
    expect(s.activities.byPeriod.reduce((a, b) => a + b.missions, 0)).toBe(3);
  });

  it('groups sorted waste by type', () => {
    const s = summarizeImpact(
      progress([rec({ activityType: 'waste-sorted', quantity: 1.5, unit: 'kg', wasteType: 'plastic' }), rec({ activityType: 'waste-sorted', quantity: 0.5, unit: 'kg', wasteType: 'paper' })]),
      '7d',
      now,
    );
    expect(s.quantities['waste-sorted']).toBe(2);
    expect(s.wasteByType).toMatchObject({ plastic: 1.5, paper: 0.5 });
  });

  it('exports a CSV with date, unit and source on every row', () => {
    const p = progress([rec({ activityType: 'electricity-saved', quantity: 10, unit: 'kWh' }), rec({ activityType: 'waste-sorted', quantity: 2, unit: 'kg' })], [0]);
    const { csv, rows } = buildImpactCsv(p, '7d', now);
    expect(rows).toBe(3);
    const lines = csv.trim().split('\r\n');
    expect(lines[0]).toContain('date,data_kind,activity,quantity,unit,source');
    expect(csv).toContain('4.75');
    expect(csv).toContain('nationthailand.com');
    expect(csv).toContain('no verified factor');
    expect(buildImpactCsv(progress([]), '7d', now).rows).toBe(0);
  });

  it('storage drops malformed impact records', () => {
    localStorage.setItem(
      'ecoquest_progress',
      JSON.stringify({
        completions: [],
        impactRecords: [
          rec({ activityType: 'electricity-saved', quantity: 3, unit: 'kWh' }),
          { ...rec({ activityType: 'electricity-saved', quantity: -1, unit: 'kWh' }) },
          { ...rec({ activityType: 'water-saved', quantity: 5, unit: 'kWh' as never }) },
          'junk',
        ],
      }),
    );
    expect(storageService.getProgress().impactRecords).toHaveLength(1);
    localStorage.clear();
  });
});

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '', updatedAt: '',
  preferences: { reducedMotion: false, selectedGoalIds: [], profileColor: 'mint' },
};

function renderImpact(path = '/impact') {
  return render(
    <MotionConfig reducedMotion="always">
      <MemoryRouter initialEntries={[path]}>
        <GameProvider>
          <Routes>
            <Route path="/impact" element={<Impact />} />
          </Routes>
        </GameProvider>
      </MemoryRouter>
    </MotionConfig>,
  );
}

describe('Green Impact page', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
  });

  it('shows honest empty states and disables export with no data', () => {
    renderImpact();
    expect(screen.getAllByText('ยังไม่มีข้อมูลเพียงพอสำหรับคำนวณ CO2e').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'ส่งออก CSV' })).toBeDisabled();
    expect(screen.getByText('เริ่มบันทึกกิจกรรมเพื่อดูผลลัพธ์')).toBeInTheDocument();
  });

  it('logging electricity saved shows kWh, CO2e and the factor source', () => {
    renderImpact();
    fireEvent.click(screen.getByRole('button', { name: 'บันทึกข้อมูลกิจกรรม' }));
    const dialog = screen.getByRole('dialog', { name: 'บันทึกข้อมูลกิจกรรม' });
    fireEvent.change(within(dialog).getByLabelText(/ปริมาณ/), { target: { value: '12' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึก' }));

    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5\.7/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /แหล่งอ้างอิง/ })[0]).toHaveAttribute('href', expect.stringContaining('nationthailand.com'));
    expect(screen.getByRole('button', { name: 'ส่งออก CSV' })).toBeEnabled();
    expect(JSON.parse(localStorage.getItem('ecoquest_progress')!).impactRecords[0]).toMatchObject({
      activityType: 'electricity-saved', quantity: 12, unit: 'kWh', source: 'user-entered', emissionFactorId: 'th-grid-electricity-scope2-2026',
    });
  });

  it('rejects an empty or non-positive quantity', () => {
    renderImpact('/impact?log=water-saved');
    const dialog = screen.getByRole('dialog', { name: 'บันทึกข้อมูลกิจกรรม' });
    expect(within(dialog).getByRole('radio', { name: /น้ำที่ประหยัดได้/ })).toBeChecked();
    fireEvent.change(within(dialog).getByLabelText(/ปริมาณ/), { target: { value: '0' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'บันทึก' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('มากกว่า 0');
  });
});

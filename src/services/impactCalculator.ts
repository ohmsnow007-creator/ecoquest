import type { ImpactActivityType, ImpactRecord, ImpactUnit, MissionCategory, PlayerProgress, WasteType } from '../types';
import { missions } from '../data/missions';
import { getFactorById, getFactorFor, type EmissionFactor } from '../data/emissionFactors';
import { getActivityMeta } from '../data/impactActivities';
import { getLocalDate } from '../utils/streak';

export const CALCULATION_VERSION = 'impact-calc-1.0';

export type ImpactRange = '7d' | '30d' | 'all';

const DAY = 86_400_000;

export function rangeStart(range: ImpactRange, now: Date = new Date()): string | null {
  if (range === 'all') return null;
  const days = range === '7d' ? 7 : 30;
  return getLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1)));
}

export function inRange(date: string, range: ImpactRange, now: Date = new Date()): boolean {
  const start = rangeStart(range, now);
  return (!start || date >= start) && date <= getLocalDate(now);
}

export interface EmissionLine {
  activityType: ImpactActivityType;
  quantity: number;
  unit: ImpactUnit;
  factor: EmissionFactor;
  kgCO2e: number;
}

export interface UncalculatedLine {
  activityType: ImpactActivityType;
  quantity: number;
  unit: ImpactUnit;
  reason: 'no-factor' | 'unit-mismatch';
}

export interface PeriodBucket {
  key: string;
  label: string;
  missions: number;
}

export interface ImpactSummary {
  range: ImpactRange;
  /** 1. Self-reported activity (counts only). */
  activities: {
    total: number;
    selfReported: number;
    learning: number;
    byCategory: Record<MissionCategory, number>;
    byPeriod: PeriodBucket[];
  };
  /** Quantities the player entered, by type and unit. */
  quantities: Record<ImpactActivityType, number>;
  wasteByType: Record<WasteType, number>;
  /** 2. Calculated estimate (only from verified factors). */
  emissions: { totalKg: number | null; lines: EmissionLine[]; uncalculated: UncalculatedLine[] };
  monthlyUsage: { month: string; kWh: number }[];
  /** 3. Game XP — reported separately, never mixed with the above. */
  gameXp: number;
  hasAnyData: boolean;
}

const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const TH_DAY = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

function buildBuckets(range: ImpactRange, dates: string[], now: Date): PeriodBucket[] {
  if (range === '7d') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      const key = getLocalDate(d);
      return { key, label: TH_DAY[d.getDay()], missions: dates.filter((x) => x === key).length };
    });
  }
  if (range === '30d') {
    // Five buckets of six days each, oldest first.
    return Array.from({ length: 5 }, (_, i) => {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (4 - i) * 6);
      const start = new Date(end.getTime() - 5 * DAY);
      const from = getLocalDate(start);
      const to = getLocalDate(end);
      return {
        key: `${from}..${to}`,
        label: `${start.getDate()} ${TH_MONTH[start.getMonth()]}–${end.getDate()} ${TH_MONTH[end.getMonth()]}`,
        missions: dates.filter((x) => x >= from && x <= to).length,
      };
    });
  }
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  return months.map((m) => {
    const [y, mo] = m.split('-').map(Number);
    return { key: m, label: `${TH_MONTH[mo - 1]} ${String(y + 543).slice(2)}`, missions: dates.filter((x) => x.startsWith(m)).length };
  });
}

export function calculateRecord(record: ImpactRecord): EmissionLine | UncalculatedLine {
  const factor = getFactorById(record.emissionFactorId) ?? getFactorFor(record.activityType);
  if (!factor) return { activityType: record.activityType, quantity: record.quantity, unit: record.unit, reason: 'no-factor' };
  if (factor.unit !== record.unit) return { activityType: record.activityType, quantity: record.quantity, unit: record.unit, reason: 'unit-mismatch' };
  return { activityType: record.activityType, quantity: record.quantity, unit: record.unit, factor, kgCO2e: record.quantity * factor.kgCO2ePerUnit };
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export function summarizeImpact(progress: PlayerProgress, range: ImpactRange, now: Date = new Date()): ImpactSummary {
  const completions = progress.completions.filter((c) => inRange(c.localDate, range, now));
  const byCategory: Record<MissionCategory, number> = { waste: 0, energy: 0, water: 0, transport: 0, consumption: 0, nature: 0 };
  for (const c of completions) {
    const m = missions.find((x) => x.id === c.missionId);
    if (m) byCategory[m.category]++;
  }
  const selfReported = completions.filter((c) => c.completionType === 'self-reported').length;

  // Monthly usage is a reading, not a saving; it feeds the before/after chart only.
  const records = progress.impactRecords.filter((r) => r.activityType !== 'electricity-usage' && inRange(r.date, range, now));
  const quantities: Record<ImpactActivityType, number> = {
    'electricity-saved': 0, 'water-saved': 0, 'waste-sorted': 0, 'low-carbon-distance': 0, 'electricity-usage': 0,
  };
  const wasteByType: Record<WasteType, number> = { plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, other: 0 };
  for (const r of records) {
    if (r.unit !== getActivityMeta(r.activityType).unit) continue;
    quantities[r.activityType] += r.quantity;
    if (r.activityType === 'waste-sorted') wasteByType[r.wasteType ?? 'other'] += r.quantity;
  }

  const linesByType = new Map<ImpactActivityType, EmissionLine>();
  const missingByType = new Map<string, UncalculatedLine>();
  for (const r of records) {
    const res = calculateRecord(r);
    if ('kgCO2e' in res) {
      const prev = linesByType.get(r.activityType);
      linesByType.set(r.activityType, prev ? { ...prev, quantity: prev.quantity + res.quantity, kgCO2e: prev.kgCO2e + res.kgCO2e } : res);
    } else {
      const key = `${res.activityType}|${res.reason}`;
      const prev = missingByType.get(key);
      missingByType.set(key, prev ? { ...prev, quantity: prev.quantity + res.quantity } : res);
    }
  }
  const lines = [...linesByType.values()].map((l) => ({ ...l, quantity: round(l.quantity), kgCO2e: round(l.kgCO2e) }));

  const monthlyUsage = progress.impactRecords
    .filter((r) => r.activityType === 'electricity-usage' && r.unit === 'kWh')
    .map((r) => ({ month: r.date.slice(0, 7), kWh: r.quantity }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const gameXp =
    completions.reduce((s, c) => s + c.xpAwarded, 0) +
    progress.quizAttempts.filter((q) => inRange(getLocalDate(new Date(q.submittedAt)), range, now)).reduce((s, q) => s + q.xpAwarded, 0);

  for (const k of Object.keys(quantities) as ImpactActivityType[]) quantities[k] = round(quantities[k]);
  for (const k of Object.keys(wasteByType) as WasteType[]) wasteByType[k] = round(wasteByType[k]);

  return {
    range,
    activities: {
      total: completions.length,
      selfReported,
      learning: completions.length - selfReported,
      byCategory,
      byPeriod: buildBuckets(range, completions.map((c) => c.localDate), now),
    },
    quantities,
    wasteByType,
    emissions: {
      totalKg: lines.length > 0 ? round(lines.reduce((s, l) => s + l.kgCO2e, 0)) : null,
      lines,
      uncalculated: [...missingByType.values()].map((m) => ({ ...m, quantity: round(m.quantity) })),
    },
    monthlyUsage,
    gameXp,
    hasAnyData: completions.length > 0 || records.length > 0,
  };
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV report for the selected range: every row carries its date, unit and source. */
export function buildImpactCsv(progress: PlayerProgress, range: ImpactRange, now: Date = new Date()): { csv: string; rows: number } {
  const header = ['date', 'data_kind', 'activity', 'quantity', 'unit', 'source', 'emission_factor_id', 'factor_kgCO2e_per_unit', 'factor_source', 'estimated_kgCO2e', 'calculation_version'];
  const rows: (string | number)[][] = [];

  for (const c of progress.completions.filter((x) => inRange(x.localDate, range, now))) {
    const m = missions.find((x) => x.id === c.missionId);
    rows.push([c.localDate, 'self-reported activity', m?.title ?? c.missionId, 1, 'ครั้ง', c.completionType === 'self-reported' ? 'self-reported' : 'in-app learning', '', '', '', '', CALCULATION_VERSION]);
  }
  for (const r of progress.impactRecords.filter((x) => inRange(x.date, range, now))) {
    const meta = getActivityMeta(r.activityType);
    const res = r.activityType === 'electricity-usage' ? null : calculateRecord(r);
    const line = res && 'kgCO2e' in res ? res : null;
    rows.push([
      r.date,
      r.activityType === 'electricity-usage' ? 'user-entered reading' : 'user-entered quantity',
      r.wasteType ? `${meta.label} (${r.wasteType})` : meta.label,
      r.quantity,
      r.unit,
      r.source,
      line?.factor.id ?? '',
      line?.factor.kgCO2ePerUnit ?? '',
      line ? `${line.factor.publisher}; ${line.factor.sourceUrl}; published ${line.factor.publishedDate}` : 'no verified factor — CO2e not calculated',
      line ? round(line.kgCO2e, 3) : '',
      r.calculationVersion,
    ]);
  }
  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  return { csv: `﻿${csv}\r\n`, rows: rows.length };
}

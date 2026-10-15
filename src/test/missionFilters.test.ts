import { describe, it, expect } from 'vitest';
import { missions, XP_BY_DIFFICULTY } from '../data/missions';
import { filterMissions, countStatuses, statusGroup, type MissionRow } from '../utils/missionFilters';
import type { MissionCategory, MissionProgressStatus } from '../types';

const rows = (statuses: Record<string, MissionProgressStatus> = {}): MissionRow[] =>
  missions.map((m) => ({ mission: m, status: statuses[m.id] ?? 'available' }));

describe('mission data', () => {
  it('has at least 24 active missions with unique ids', () => {
    const active = missions.filter((m) => m.active);
    expect(active.length).toBeGreaterThanOrEqual(24);
    expect(new Set(missions.map((m) => m.id)).size).toBe(missions.length);
  });

  it('is balanced: every category has the same number of missions', () => {
    const counts = new Map<MissionCategory, number>();
    for (const m of missions) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
    expect(new Set(counts.values()).size).toBe(1);
  });

  it('derives XP from difficulty, increasing with difficulty', () => {
    for (const m of missions) expect(m.xpReward).toBe(XP_BY_DIFFICULTY[m.difficulty]);
    expect(XP_BY_DIFFICULTY.easy).toBeLessThan(XP_BY_DIFFICULTY.medium);
    expect(XP_BY_DIFFICULTY.medium).toBeLessThan(XP_BY_DIFFICULTY.hard);
  });

  it('every mission has steps to follow', () => {
    for (const m of missions) expect(m.steps.length).toBeGreaterThan(0);
  });
});

describe('filterMissions', () => {
  it('filters by a single category', () => {
    const result = filterMissions(rows(), { category: 'water', status: 'all', sort: 'recommended' });
    expect(result.length).toBe(4);
    expect(result.every((r) => r.mission.category === 'water')).toBe(true);
  });

  it('"พฤติกรรมรักษ์โลก" covers consumption and nature', () => {
    const result = filterMissions(rows(), { category: 'lifestyle', status: 'all', sort: 'recommended' });
    expect(new Set(result.map((r) => r.mission.category))).toEqual(new Set(['consumption', 'nature']));
    expect(result.length).toBe(8);
  });

  it('combines category AND status AND search', () => {
    const r = rows({ 'water-001': 'in-progress', 'water-002': 'completed-today', 'energy-001': 'in-progress' });
    expect(filterMissions(r, { category: 'water', status: 'in-progress', sort: 'recommended' }).map((x) => x.mission.id)).toEqual(['water-001']);
    expect(filterMissions(r, { category: 'water', status: 'completed', sort: 'recommended' }).map((x) => x.mission.id)).toEqual(['water-002']);
    expect(filterMissions(r, { category: 'all', status: 'in-progress', sort: 'recommended', query: 'ก๊อก' }).map((x) => x.mission.id)).toEqual(['water-001']);
    expect(filterMissions(r, { category: 'energy', status: 'completed', sort: 'recommended' })).toEqual([]);
  });

  it('sorts by XP descending', () => {
    const xs = filterMissions(rows(), { category: 'all', status: 'all', sort: 'xp' }).map((r) => r.mission.xpReward);
    expect(xs).toEqual([...xs].sort((a, b) => b - a));
  });

  it('sorts by difficulty easy → hard', () => {
    const rank = { easy: 0, medium: 1, hard: 2 };
    const ds = filterMissions(rows(), { category: 'all', status: 'all', sort: 'difficulty' }).map((r) => rank[r.mission.difficulty]);
    expect(ds).toEqual([...ds].sort((a, b) => a - b));
  });

  it('recommended puts in-progress first and completed last', () => {
    const r = rows({ 'nature-001': 'completed-today', 'waste-004': 'in-progress' });
    const out = filterMissions(r, { category: 'all', status: 'all', sort: 'recommended' });
    expect(out[0].mission.id).toBe('waste-004');
    expect(out[out.length - 1].mission.id).toBe('nature-001');
  });

  it('is deterministic for the same input', () => {
    const q = { category: 'all' as const, status: 'all' as const, sort: 'xp' as const };
    expect(filterMissions(rows(), q)).toEqual(filterMissions(rows(), q));
  });
});

describe('status counts', () => {
  it('maps statuses into new / in progress / completed', () => {
    expect(statusGroup('available')).toBe('new');
    expect(statusGroup('completed-once')).toBe('completed');
    const c = countStatuses(rows({ 'water-001': 'in-progress', 'water-002': 'completed-today' }));
    expect(c).toEqual({ all: missions.length, new: missions.length - 2, 'in-progress': 1, completed: 1 });
  });
});

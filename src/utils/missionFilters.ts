import type { Mission, MissionCategory, MissionDifficulty, MissionProgressStatus } from '../types';

export type CategoryFilter = 'all' | 'waste' | 'energy' | 'water' | 'transport' | 'lifestyle';
export type StatusFilter = 'all' | 'new' | 'in-progress' | 'completed';
export type SortKey = 'recommended' | 'xp' | 'difficulty';

export const CATEGORY_FILTERS: { value: CategoryFilter; label: string; categories: MissionCategory[] }[] = [
  { value: 'all', label: 'ทั้งหมด', categories: [] },
  { value: 'waste', label: 'การจัดการขยะ', categories: ['waste'] },
  { value: 'energy', label: 'ประหยัดพลังงาน', categories: ['energy'] },
  { value: 'water', label: 'ประหยัดน้ำ', categories: ['water'] },
  { value: 'transport', label: 'การเดินทางคาร์บอนต่ำ', categories: ['transport'] },
  { value: 'lifestyle', label: 'พฤติกรรมรักษ์โลก', categories: ['consumption', 'nature'] },
];

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'ทั้งหมด',
  new: 'ภารกิจใหม่',
  'in-progress': 'กำลังทำ',
  completed: 'สำเร็จแล้ว',
};

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'แนะนำ',
  xp: 'XP มากไปน้อย',
  difficulty: 'ความยาก ง่ายไปยาก',
};

const DIFFICULTY_RANK: Record<MissionDifficulty, number> = { easy: 0, medium: 1, hard: 2 };
const GROUP_RANK = { 'in-progress': 0, new: 1, completed: 2 } as const;

export interface MissionRow {
  mission: Mission;
  status: MissionProgressStatus;
}

export function statusGroup(status: MissionProgressStatus): Exclude<StatusFilter, 'all'> {
  if (status === 'in-progress') return 'in-progress';
  if (status === 'completed-today' || status === 'completed-once') return 'completed';
  return 'new';
}

export interface MissionQuery {
  category: CategoryFilter;
  status: StatusFilter;
  sort: SortKey;
  query?: string;
  preferred?: Set<MissionCategory>;
}

function matchesCategory(m: Mission, category: CategoryFilter) {
  if (category === 'all') return true;
  return CATEGORY_FILTERS.find((f) => f.value === category)!.categories.includes(m.category);
}

function matchesQuery(m: Mission, query: string) {
  const q = query.trim().toLowerCase();
  return !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
}

// Category, status and search are combined with AND; sorting is applied last and is always fully deterministic.
export function filterMissions(rows: MissionRow[], q: MissionQuery): MissionRow[] {
  const preferred = q.preferred ?? new Set<MissionCategory>();
  const filtered = rows.filter(
    (r) =>
      matchesCategory(r.mission, q.category) &&
      (q.status === 'all' || statusGroup(r.status) === q.status) &&
      matchesQuery(r.mission, q.query ?? ''),
  );

  const byTitle = (a: MissionRow, b: MissionRow) => a.mission.title.localeCompare(b.mission.title, 'th');
  const byDifficulty = (a: MissionRow, b: MissionRow) => DIFFICULTY_RANK[a.mission.difficulty] - DIFFICULTY_RANK[b.mission.difficulty];

  const compare: Record<SortKey, (a: MissionRow, b: MissionRow) => number> = {
    recommended: (a, b) =>
      GROUP_RANK[statusGroup(a.status)] - GROUP_RANK[statusGroup(b.status)] ||
      Number(preferred.has(b.mission.category)) - Number(preferred.has(a.mission.category)) ||
      byDifficulty(a, b) ||
      byTitle(a, b),
    xp: (a, b) => b.mission.xpReward - a.mission.xpReward || byDifficulty(a, b) || byTitle(a, b),
    difficulty: (a, b) => byDifficulty(a, b) || a.mission.xpReward - b.mission.xpReward || byTitle(a, b),
  };

  return [...filtered].sort(compare[q.sort]);
}

export function countStatuses(rows: MissionRow[]): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = { all: rows.length, new: 0, 'in-progress': 0, completed: 0 };
  for (const r of rows) counts[statusGroup(r.status)]++;
  return counts;
}

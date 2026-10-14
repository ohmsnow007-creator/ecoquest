import type { MissionCompletion } from '../types';

export function getLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getUniqueDates(completions: MissionCompletion[]): string[] {
  const dateSet = new Set(completions.map((c) => c.localDate));
  return Array.from(dateSet).sort().reverse();
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.round(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateStreak(completions: MissionCompletion[]): number {
  if (completions.length === 0) return 0;

  const uniqueDates = getUniqueDates(completions);
  if (uniqueDates.length === 0) return 0;

  const today = getLocalDate();
  const yesterday = getLocalDate(new Date(Date.now() - 86400000));

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    if (daysBetween(uniqueDates[i - 1], uniqueDates[i]) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getLongestStreak(completions: MissionCompletion[]): number {
  if (completions.length === 0) return 0;

  const uniqueDates = getUniqueDates(completions).reverse();
  if (uniqueDates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    if (daysBetween(uniqueDates[i - 1], uniqueDates[i]) === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

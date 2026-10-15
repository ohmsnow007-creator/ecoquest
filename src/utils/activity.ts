import type { PlayerProgress } from '../types';
import { getLocalDate } from './streak';

export interface DayActivity {
  date: string;
  label: string;
  missions: number;
  quizzes: number;
  total: number;
}

const TH_WEEKDAY = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export function getRecentActivity(progress: PlayerProgress, days = 7, now: Date = new Date()): DayActivity[] {
  const result: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    result.push({ date: getLocalDate(d), label: TH_WEEKDAY[d.getDay()], missions: 0, quizzes: 0, total: 0 });
  }
  const byDate = new Map(result.map((r) => [r.date, r]));

  for (const c of progress.completions) {
    const day = byDate.get(c.localDate);
    if (day) day.missions++;
  }
  for (const q of progress.quizCompletions ?? []) {
    const day = byDate.get(getLocalDate(new Date(q.completedAt)));
    if (day) day.quizzes++;
  }
  for (const r of result) r.total = r.missions + r.quizzes;
  return result;
}

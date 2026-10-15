import type { PlayerProgress } from '../types';
import { getLocalDate } from './streak';
import { getLevelFromXp } from './xp';
import { missions } from '../data/missions';
import { quizzes } from '../data/quizzes';
import { badges } from '../data/badges';

export type ActivityEvent =
  | { id: string; type: 'mission'; at: string; missionId: string; title: string; xp: number; selfReported: boolean }
  | { id: string; type: 'quiz'; at: string; quizId: string; title: string; xp: number; correct: boolean }
  | { id: string; type: 'badge'; at: string; badgeId: string; title: string }
  | { id: string; type: 'level'; at: string; level: number };

const time = (iso: string) => {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

// Every event is derived from stored records; level-ups are replayed from the XP each record awarded.
export function buildActivityFeed(progress: PlayerProgress): ActivityEvent[] {
  const xpEvents: ActivityEvent[] = [
    ...progress.completions.map((c): ActivityEvent => ({
      id: `m-${c.id}`,
      type: 'mission',
      at: c.completedAt,
      missionId: c.missionId,
      title: missions.find((m) => m.id === c.missionId)?.title ?? 'ภารกิจ',
      xp: c.xpAwarded,
      selfReported: c.completionType === 'self-reported',
    })),
    ...(progress.quizCompletions ?? []).map((q): ActivityEvent => ({
      id: `q-${q.quizId}`,
      type: 'quiz',
      at: q.completedAt,
      quizId: q.quizId,
      title: quizzes.find((x) => x.id === q.quizId)?.question ?? 'ควิซ',
      xp: q.xpAwarded,
      correct: q.correct,
    })),
  ].sort((a, b) => time(a.at) - time(b.at));

  const levelEvents: ActivityEvent[] = [];
  let xp = 0;
  for (const e of xpEvents) {
    const before = getLevelFromXp(xp);
    xp += e.type === 'mission' || e.type === 'quiz' ? e.xp : 0;
    const after = getLevelFromXp(xp);
    for (let lv = before + 1; lv <= after; lv++) {
      levelEvents.push({ id: `l-${lv}`, type: 'level', at: new Date(time(e.at) + 1).toISOString(), level: lv });
    }
  }

  const badgeEvents: ActivityEvent[] = progress.unlockedBadges.map((b) => ({
    id: `b-${b.badgeId}`,
    type: 'badge',
    at: b.unlockedAt,
    badgeId: b.badgeId,
    title: badges.find((x) => x.id === b.badgeId)?.title ?? 'เหรียญตรา',
  }));

  return [...xpEvents, ...levelEvents, ...badgeEvents].sort((a, b) => time(b.at) - time(a.at));
}

const RTF = new Intl.RelativeTimeFormat('th', { numeric: 'auto' });

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffSec = Math.round((time(iso) - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 45) return 'เมื่อสักครู่';
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), 'day');
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

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

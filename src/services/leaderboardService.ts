import type { PlayerProfile, PlayerProgress } from '../types';
import { DEMO_PLAYERS } from '../data/demoLeaderboard';
import { badges } from '../data/badges';
import { getLevelFromXp } from '../utils/xp';
import { getLocalDate } from '../utils/streak';

export type LeaderboardPeriod = 'weekly' | 'all-time';

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarId: string;
  profileColor?: string;
  xp: number;
  level: number;
  badgeCount: number;
  topBadge?: string;
  lastXpAt: string | null;
  isDemo: boolean;
  isCurrentPlayer: boolean;
}

export interface RankedEntry extends LeaderboardEntry {
  rank: number;
}

/** Swap this for an online implementation later; pages only depend on this interface. */
export interface LeaderboardService {
  readonly source: 'local-demo' | 'online';
  getEntries(period: LeaderboardPeriod, options: { includeDemo: boolean }): LeaderboardEntry[];
}

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

/** XP the player earned in the last 7 local days (today included), from stored records. */
export function weeklyXp(progress: PlayerProgress, now: Date = new Date()): { xp: number; lastXpAt: string | null } {
  const start = getLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const events = [
    ...progress.completions.filter((c) => c.localDate >= start).map((c) => ({ at: c.completedAt, xp: c.xpAwarded })),
    ...progress.quizAttempts.filter((a) => getLocalDate(new Date(a.submittedAt)) >= start).map((a) => ({ at: a.submittedAt, xp: a.xpAwarded })),
  ].filter((e) => e.xp > 0);
  return { xp: events.reduce((s, e) => s + e.xp, 0), lastXpAt: events.map((e) => e.at).sort().at(-1) ?? null };
}

function lastXpTime(progress: PlayerProgress): string | null {
  return (
    [...progress.completions.filter((c) => c.xpAwarded > 0).map((c) => c.completedAt), ...progress.quizAttempts.filter((a) => a.xpAwarded > 0).map((a) => a.submittedAt)]
      .sort()
      .at(-1) ?? null
  );
}

export function playerEntry(profile: PlayerProfile, progress: PlayerProgress, period: LeaderboardPeriod, now: Date = new Date()): LeaderboardEntry {
  const weekly = weeklyXp(progress, now);
  const unlocked = badges.filter((b) => progress.unlockedBadges.some((r) => r.badgeId === b.id));
  const top = [...unlocked].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))[0];
  return {
    id: `player-${profile.id}`,
    name: profile.displayName,
    avatarId: profile.avatarId,
    profileColor: profile.preferences.profileColor,
    xp: period === 'weekly' ? weekly.xp : progress.totalXp,
    level: getLevelFromXp(progress.totalXp),
    badgeCount: unlocked.length,
    topBadge: top?.name,
    lastXpAt: period === 'weekly' ? weekly.lastXpAt : lastXpTime(progress),
    isDemo: false,
    isCurrentPlayer: true,
  };
}

/**
 * Sort rule: higher XP first. On equal XP, whoever reached that total earlier ranks higher
 * (earlier last-XP time; players with no XP time go last), then by name.
 */
export function rankEntries(entries: LeaderboardEntry[]): RankedEntry[] {
  return [...entries]
    .sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      const ta = a.lastXpAt ?? '9999';
      const tb = b.lastXpAt ?? '9999';
      if (ta !== tb) return ta < tb ? -1 : 1;
      return a.name.localeCompare(b.name, 'th');
    })
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function createLocalLeaderboard(profile: PlayerProfile, progress: PlayerProgress, now: Date = new Date()): LeaderboardService {
  return {
    source: 'local-demo',
    getEntries(period, { includeDemo }) {
      const demo: LeaderboardEntry[] = includeDemo
        ? DEMO_PLAYERS.map((d) => ({
            id: d.id,
            name: d.name,
            avatarId: d.avatarId,
            profileColor: d.profileColor,
            xp: period === 'weekly' ? d.weeklyXp : d.allTimeXp,
            level: getLevelFromXp(d.allTimeXp),
            badgeCount: d.badgeCount,
            topBadge: d.topBadge,
            lastXpAt: d.lastXpAt,
            isDemo: true,
            isCurrentPlayer: false,
          }))
        : [];
      return [...demo, playerEntry(profile, progress, period, now)];
    },
  };
}

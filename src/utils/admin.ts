import type { AdminGrant, PlayerProgress } from '../types';

/*
 * Admin: everything an admin adds is stored as an AdminGrant, apart from the player's own records, so
 * any of it can be revoked. XP/level grants count as the player's real level everywhere (including
 * the on-device leaderboard); granted badges and cosmetics stay labelled "สาธิต".
 */

export function adminGrants(progress: PlayerProgress): AdminGrant[] {
  return progress.adminGrants ?? [];
}

export function adminXp(progress: PlayerProgress): number {
  return adminGrants(progress).reduce((s, g) => s + (g.kind === 'xp' ? g.amount : 0), 0);
}

/** XP the player earned by actually playing. */
export function earnedXp(progress: PlayerProgress): number {
  return Math.max(0, progress.totalXp - adminXp(progress));
}

/** Sum of an admin grant kind's amounts (world missions, water, fertilizer, bond points). */
export function adminTotal(progress: PlayerProgress, kind: 'world' | 'water' | 'fertilizer' | 'bond'): number {
  return adminGrants(progress).reduce((s, g) => {
    if (g.kind !== kind) return s;
    return s + (g.kind === 'world' ? g.missions : g.kind === 'bond' ? g.points : g.kind === 'water' || g.kind === 'fertilizer' ? g.amount : 0);
  }, 0);
}

/** Missions that count toward the virtual world: the player's own, plus any admin world grant. */
export function worldMissionCount(progress: PlayerProgress): number {
  return progress.completions.length + adminTotal(progress, 'world');
}

export function hasAdminGrants(progress: PlayerProgress): boolean {
  return adminGrants(progress).length > 0;
}

export function adminCosmeticIds(progress: PlayerProgress): Set<string> {
  return new Set(adminGrants(progress).flatMap((g) => (g.kind === 'cosmetic' ? [g.cosmeticId] : [])));
}

/**
 * Not real security: a quick salted hash so the PIN is not stored as plain text on this device.
 * It only keeps classmates from opening the demo panel by accident.
 */
export function hashPin(pin: string): string {
  let h = 0x811c9dc5;
  for (const ch of `ecoquest-admin:${pin}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * The two fixed admin PINs (entered in order), kept only as hashes. This is a demo gate against
 * wandering in, not real security: anyone reading the client code could brute-force 6 digits.
 */
export const ADMIN_PIN_HASHES = ['2f74d3ad', '5d4b5a01'] as const;
export const ADMIN_PIN_LENGTH = 6;

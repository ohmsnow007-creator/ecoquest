import type { AdminGrant, PlayerProgress } from '../types';

/*
 * Demo admin: everything an admin adds is stored as an AdminGrant, apart from the player's own records.
 * Grants may raise the level and unlock items so a presenter can show features, but they are always
 * labelled "สาธิต" and never count toward the leaderboard or "real" stats.
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

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

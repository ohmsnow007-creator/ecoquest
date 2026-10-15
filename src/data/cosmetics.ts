import type { PlayerProgress } from '../types';
import { badges } from './badges';
import { getLevelFromXp } from '../utils/xp';

export type CosmeticSlot = 'hat' | 'eyes' | 'bag';

export const SLOT_LABELS: Record<CosmeticSlot, string> = { hat: 'หมวก', eyes: 'แว่นตา', bag: 'กระเป๋า' };

export type UnlockRule =
  | { type: 'badge'; badgeId: string }
  | { type: 'level'; level: number }
  | { type: 'weekly'; count: number };

export interface Cosmetic {
  id: string;
  slot: CosmeticSlot;
  name: string;
  unlock: UnlockRule;
}

/** Rewards you can wear. Each unlock comes from records the game already keeps, so nothing extra is stored. */
export const COSMETICS: Cosmetic[] = [
  { id: 'hat-leaf-cap', slot: 'hat', name: 'หมวกใบไม้', unlock: { type: 'badge', badgeId: 'badge-first-mission' } },
  { id: 'hat-straw', slot: 'hat', name: 'หมวกฟางสายลม', unlock: { type: 'weekly', count: 1 } },
  { id: 'hat-flower-crown', slot: 'hat', name: 'มงกุฎดอกไม้', unlock: { type: 'level', level: 8 } },
  { id: 'hat-golden-leaf', slot: 'hat', name: 'มงกุฎใบไม้ทอง', unlock: { type: 'level', level: 15 } },
  { id: 'hat-headband', slot: 'hat', name: 'ผ้าคาดหัวสายฟ้า', unlock: { type: 'badge', badgeId: 'badge-timed-8' } },
  { id: 'eyes-round', slot: 'eyes', name: 'แว่นนักวิชาการ', unlock: { type: 'badge', badgeId: 'badge-quiz-5' } },
  { id: 'eyes-sun', slot: 'eyes', name: 'แว่นกันแดด', unlock: { type: 'badge', badgeId: 'badge-streak-7' } },
  { id: 'bag-tote', slot: 'bag', name: 'กระเป๋าผ้ารักษ์โลก', unlock: { type: 'badge', badgeId: 'badge-waste-5' } },
  { id: 'bag-backpack', slot: 'bag', name: 'เป้นักสำรวจ', unlock: { type: 'weekly', count: 3 } },
];

export type Outfit = Partial<Record<CosmeticSlot, string>>;

export function getCosmetic(id: string | undefined): Cosmetic | undefined {
  return id ? COSMETICS.find((c) => c.id === id) : undefined;
}

export function weeklyChallengesDone(progress: PlayerProgress): number {
  return (progress.challengeRewards ?? []).filter((r) => r.kind === 'weekly').length;
}

export interface CosmeticStatus {
  cosmetic: Cosmetic;
  unlocked: boolean;
  /** How to unlock it, in the player's words. */
  condition: string;
  current: number;
  target: number;
}

export function getCosmeticStatus(cosmetic: Cosmetic, progress: PlayerProgress): CosmeticStatus {
  const granted = (progress.adminGrants ?? []).some((g) => g.kind === 'cosmetic' && g.cosmeticId === cosmetic.id);
  const earned = getEarnedCosmeticStatus(cosmetic, progress);
  return granted && !earned.unlocked ? { ...earned, unlocked: true, condition: 'มอบโดยผู้ดูแล (สาธิต)', current: earned.target } : earned;
}

function getEarnedCosmeticStatus(cosmetic: Cosmetic, progress: PlayerProgress): CosmeticStatus {
  const rule = cosmetic.unlock;
  switch (rule.type) {
    case 'badge': {
      const badge = badges.find((b) => b.id === rule.badgeId);
      const unlocked = progress.unlockedBadges.some((b) => b.badgeId === rule.badgeId);
      return { cosmetic, unlocked, condition: `ได้รับเหรียญ “${badge?.name ?? rule.badgeId}”`, current: unlocked ? 1 : 0, target: 1 };
    }
    case 'level': {
      const level = getLevelFromXp(progress.totalXp);
      return { cosmetic, unlocked: level >= rule.level, condition: `ถึงเลเวล ${rule.level}`, current: Math.min(level, rule.level), target: rule.level };
    }
    case 'weekly': {
      const done = weeklyChallengesDone(progress);
      return { cosmetic, unlocked: done >= rule.count, condition: `ทำชาเลนจ์ประจำสัปดาห์สำเร็จ ${rule.count} ครั้ง`, current: Math.min(done, rule.count), target: rule.count };
    }
  }
}

export function getAllCosmeticStatuses(progress: PlayerProgress): CosmeticStatus[] {
  return COSMETICS.map((c) => getCosmeticStatus(c, progress));
}

/** Only items that exist, sit in the right slot and are unlocked can be worn. */
export function wearableOutfit(outfit: Outfit | undefined, progress: PlayerProgress): Outfit {
  const out: Outfit = {};
  for (const [slot, id] of Object.entries(outfit ?? {}) as [CosmeticSlot, string][]) {
    const c = getCosmetic(id);
    if (c && c.slot === slot && getCosmeticStatus(c, progress).unlocked) out[slot] = id;
  }
  return out;
}

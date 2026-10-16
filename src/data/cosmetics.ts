import type { MissionCategory, PlayerProgress } from '../types';
import { CATEGORY_LABELS } from '../types';
import { badges } from './badges';
import { missions } from './missions';
import { ECO_EVENTS, eventCompleted, eventDateLabel, getEvent } from './events';
import { getLongestStreak } from '../utils/streak';
import { getCareState } from '../utils/care';
import { getLevelFromXp } from '../utils/xp';

export type CosmeticSlot = 'hat' | 'eyes' | 'bag' | 'frame' | 'pot' | 'background';

export const SLOT_LABELS: Record<CosmeticSlot, string> = { hat: 'หมวก', eyes: 'แว่นตา', bag: 'กระเป๋า', frame: 'กรอบรูป', pot: 'กระถาง', background: 'ฉากหลัง' };

/** Who wears what: the character has hat/eyes/bag and a profile frame; Sprouty can also have a pot and a background. */
export type OutfitTarget = 'avatar' | 'sprouty';
export const AVATAR_SLOTS: CosmeticSlot[] = ['hat', 'eyes', 'bag', 'frame'];
export const SPROUTY_SLOTS: CosmeticSlot[] = ['hat', 'eyes', 'bag', 'pot', 'background'];
export const slotsFor = (target: OutfitTarget) => (target === 'avatar' ? AVATAR_SLOTS : SPROUTY_SLOTS);

export type UnlockRule =
  | { type: 'badge'; badgeId: string }
  | { type: 'level'; level: number }
  | { type: 'weekly'; count: number }
  /** Recorded mission completions, optionally in one category. */
  | { type: 'missions'; count: number; category?: MissionCategory }
  /** Longest run of consecutive days with a mission. */
  | { type: 'streak'; days: number }
  /** Bond level with Sprouty (from the care page). */
  | { type: 'bond'; level: number }
  /** Took part in an environmental day (see data/events). */
  | { type: 'event'; eventId: string }
  /** Basic items everyone can pick from the start. */
  | { type: 'free' };

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
  // Mission rewards: unlocked by recorded mission completions (self-reported, like every mission).
  { id: 'bag-bottle', slot: 'bag', name: 'กระบอกน้ำพกพา', unlock: { type: 'missions', count: 5 } },
  { id: 'eyes-heart', slot: 'eyes', name: 'แว่นหัวใจ', unlock: { type: 'missions', count: 10 } },
  { id: 'hat-beanie', slot: 'hat', name: 'หมวกไหมพรมต้นกล้า', unlock: { type: 'missions', count: 20 } },
  { id: 'hat-raindrop', slot: 'hat', name: 'หมวกหยดน้ำ', unlock: { type: 'missions', count: 3, category: 'water' } },
  { id: 'hat-sun-cap', slot: 'hat', name: 'แก๊ปพลังแสงอาทิตย์', unlock: { type: 'missions', count: 3, category: 'energy' } },
  { id: 'hat-mushroom', slot: 'hat', name: 'หมวกเห็ดป่า', unlock: { type: 'missions', count: 3, category: 'nature' } },
  { id: 'eyes-goggles', slot: 'eyes', name: 'แว่นนักปั่น', unlock: { type: 'missions', count: 3, category: 'transport' } },
  { id: 'bag-basket', slot: 'bag', name: 'ตะกร้าจ่ายตลาด', unlock: { type: 'missions', count: 3, category: 'consumption' } },
  // Sprouty's pots and backgrounds: from streaks and from caring for Sprouty.
  { id: 'pot-clay', slot: 'pot', name: 'กระถางดินเผา', unlock: { type: 'streak', days: 3 } },
  { id: 'pot-blue', slot: 'pot', name: 'กระถางเซรามิกฟ้า', unlock: { type: 'streak', days: 7 } },
  { id: 'pot-gold', slot: 'pot', name: 'กระถางทองคำ', unlock: { type: 'streak', days: 14 } },
  { id: 'pot-heart', slot: 'pot', name: 'กระถางหัวใจ', unlock: { type: 'bond', level: 3 } },
  { id: 'bg-meadow', slot: 'background', name: 'ทุ่งหญ้ายามเช้า', unlock: { type: 'bond', level: 2 } },
  { id: 'bg-sea', slot: 'background', name: 'ชายหาดสีคราม', unlock: { type: 'streak', days: 5 } },
  { id: 'bg-night', slot: 'background', name: 'ท้องฟ้าดาวพราว', unlock: { type: 'bond', level: 5 } },
  { id: 'bg-rainbow', slot: 'background', name: 'สายรุ้งสดใส', unlock: { type: 'bond', level: 8 } },
  // Profile-picture frames: five free colours, and special ones that grow with Sprouty (levels 3, 8, 15).
  { id: 'frame-mint', slot: 'frame', name: 'กรอบมิ้นต์', unlock: { type: 'free' } },
  { id: 'frame-lime', slot: 'frame', name: 'กรอบมะนาว', unlock: { type: 'free' } },
  { id: 'frame-sky', slot: 'frame', name: 'กรอบฟ้าใส', unlock: { type: 'free' } },
  { id: 'frame-peach', slot: 'frame', name: 'กรอบพีช', unlock: { type: 'free' } },
  { id: 'frame-lavender', slot: 'frame', name: 'กรอบลาเวนเดอร์', unlock: { type: 'free' } },
  { id: 'frame-leaf', slot: 'frame', name: 'กรอบใบไม้ต้นอ่อน', unlock: { type: 'level', level: 3 } },
  { id: 'frame-flower', slot: 'frame', name: 'กรอบดอกไม้บาน', unlock: { type: 'level', level: 8 } },
  { id: 'frame-golden', slot: 'frame', name: 'กรอบต้นไม้ทอง', unlock: { type: 'level', level: 15 } },
  // Cute pots and extras, earned by playing in different ways.
  { id: 'pot-frog', slot: 'pot', name: 'กระถางกบน้อย', unlock: { type: 'bond', level: 4 } },
  { id: 'pot-bear', slot: 'pot', name: 'กระถางหมีน้อย', unlock: { type: 'missions', count: 15 } },
  { id: 'pot-cat', slot: 'pot', name: 'กระถางแมวเหมียว', unlock: { type: 'streak', days: 10 } },
  { id: 'pot-strawberry', slot: 'pot', name: 'กระถางสตรอว์เบอร์รี', unlock: { type: 'missions', count: 5, category: 'consumption' } },
  { id: 'pot-cloud', slot: 'pot', name: 'กระถางก้อนเมฆ', unlock: { type: 'missions', count: 5, category: 'water' } },
  { id: 'pot-recycle', slot: 'pot', name: 'กระถางรีไซเคิล', unlock: { type: 'missions', count: 5, category: 'waste' } },
  { id: 'hat-frog', slot: 'hat', name: 'หมวกกบน้อย', unlock: { type: 'bond', level: 6 } },
  { id: 'hat-bee', slot: 'hat', name: 'ที่คาดผมผึ้งน้อย', unlock: { type: 'missions', count: 5, category: 'nature' } },
  { id: 'hat-acorn', slot: 'hat', name: 'หมวกลูกโอ๊ก', unlock: { type: 'missions', count: 30 } },
  { id: 'eyes-leaf', slot: 'eyes', name: 'แว่นใบไม้', unlock: { type: 'missions', count: 5, category: 'energy' } },
  { id: 'bag-watering', slot: 'bag', name: 'บัวรดน้ำจิ๋ว', unlock: { type: 'streak', days: 4 } },
  // Free backgrounds to choose from right away.
  { id: 'bg-trees', slot: 'background', name: 'ลานต้นไม้ร่มรื่น', unlock: { type: 'free' } },
  { id: 'bg-woods', slot: 'background', name: 'ป่าสนเขียวชอุ่ม', unlock: { type: 'free' } },
  { id: 'bg-city', slot: 'background', name: 'เมืองสีเขียว', unlock: { type: 'free' } },
  { id: 'bg-home', slot: 'background', name: 'หน้าบ้านแสนอุ่น', unlock: { type: 'free' } },
  { id: 'bg-backyard', slot: 'background', name: 'สวนหลังบ้าน', unlock: { type: 'free' } },
  // Environmental-day specials.
  { id: 'bg-rain', slot: 'background', name: 'ฉากสายฝนฉ่ำ', unlock: { type: 'event', eventId: 'water-day' } },
  { id: 'hat-earth', slot: 'hat', name: 'หมวกโลกสีเขียว', unlock: { type: 'event', eventId: 'earth-day' } },
  { id: 'pot-leaf', slot: 'pot', name: 'กระถางลายใบไม้', unlock: { type: 'event', eventId: 'env-day' } },
  { id: 'hat-chef', slot: 'hat', name: 'หมวกเชฟผักสด', unlock: { type: 'event', eventId: 'food-day' } },
  { id: 'bg-forest', slot: 'background', name: 'ป่าเขียวขจี', unlock: { type: 'event', eventId: 'thai-env-day' } },
];

const missionCategory = (id: string) => missions.find((m) => m.id === id)?.category;

/** The cosmetic each environmental day awards (kept in sync with data/events). */
export const EVENT_REWARDS = ECO_EVENTS.map((e) => ({ event: e, cosmetic: COSMETICS.find((c) => c.id === e.rewardId)! }));

function missionsDone(progress: PlayerProgress, category?: MissionCategory): number {
  if (!category) return progress.completions.length;
  const ids = new Set(missions.filter((m) => m.category === category).map((m) => m.id));
  return progress.completions.filter((c) => ids.has(c.missionId)).length;
}

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
    case 'free':
      return { cosmetic, unlocked: true, condition: 'ใช้ได้ฟรี', current: 1, target: 1 };
    case 'streak': {
      const best = getLongestStreak(progress.completions);
      return { cosmetic, unlocked: best >= rule.days, condition: `ทำภารกิจต่อเนื่อง ${rule.days} วัน`, current: Math.min(best, rule.days), target: rule.days };
    }
    case 'bond': {
      const level = getCareState(progress).bond.level;
      return { cosmetic, unlocked: level >= rule.level, condition: `ความผูกพันกับ Sprouty ระดับ ${rule.level}`, current: Math.min(level, rule.level), target: rule.level };
    }
    case 'event': {
      const e = getEvent(rule.eventId);
      const done = !!e && eventCompleted(e, progress, missionCategory);
      return { cosmetic, unlocked: done, condition: e ? `ร่วมกิจกรรม${e.name} (${eventDateLabel(e)} ±3 วัน)` : 'กิจกรรมพิเศษ', current: done ? 1 : 0, target: 1 };
    }
    case 'missions': {
      const done = missionsDone(progress, rule.category);
      const what = rule.category ? `ภารกิจหมวด${CATEGORY_LABELS[rule.category]}` : 'ภารกิจ';
      return { cosmetic, unlocked: done >= rule.count, condition: `ทำ${what}ครบ ${rule.count} ครั้ง`, current: Math.min(done, rule.count), target: rule.count };
    }
  }
}

export function getAllCosmeticStatuses(progress: PlayerProgress): CosmeticStatus[] {
  return COSMETICS.map((c) => getCosmeticStatus(c, progress));
}

/** Only items that exist, sit in the right slot (one the target can wear) and are unlocked can be worn. */
export function wearableOutfit(outfit: Outfit | undefined, progress: PlayerProgress, target: OutfitTarget = 'sprouty'): Outfit {
  const out: Outfit = {};
  const allowed = slotsFor(target);
  for (const [slot, id] of Object.entries(outfit ?? {}) as [CosmeticSlot, string][]) {
    const c = getCosmetic(id);
    if (c && c.slot === slot && allowed.includes(slot) && getCosmeticStatus(c, progress).unlocked) out[slot] = id;
  }
  return out;
}

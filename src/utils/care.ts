import type { MissionCompletion, PlayerProgress } from '../types';
import type { SproutyMood } from '../components/illustrations/SproutySeed';
import { getLocalDate } from './streak';
import { SPECIAL_FERTILIZER } from '../config/challenges';
import { adminTotal } from './admin';

/*
 * Caring for Sprouty. Everything here comes from records the game already keeps, plus the player's own
 * taps on the care page (stored in progress.care):
 * - Water: each day with at least one recorded mission gives one watering; the player pours it.
 * - Fertilizer: about 1 in 3 recorded missions also drops a bag of fertilizer. The draw is fixed per
 *   completion (a hash of its id), so reloading or reinstalling never re-rolls it.
 * - Bond (ความผูกพัน): grows with waterings and fertilizer used. It never goes down; when the player is
 *   away Sprouty only says it misses them.
 */

export const FERTILIZER_PERCENT = 34;
export const BOND_STEP = 40;
export const MAX_BOND = 10;
const WATER_POINTS = 10;
const FERTILIZER_POINTS = 15;
/** Days without a mission before Sprouty says it misses the player. */
export const LONELY_AFTER_DAYS = 3;
/** Days since the last watering before Sprouty turns on the puppy eyes and begs for water. */
export const THIRSTY_AFTER_DAYS = 2;

export interface CareRecord {
  /** Local dates (YYYY-MM-DD) the player watered Sprouty with the day's water. */
  wateredDays: string[];
  fertilizerUsed: number;
  /** Extra waterings poured from admin-given water. */
  bonusWaterUsed?: number;
}

export const EMPTY_CARE: CareRecord = { wateredDays: [], fertilizerUsed: 0 };

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Bags of fertilizer this recorded mission gave: special daily missions always give some; others are a fixed draw. */
export function fertilizerFrom(c: MissionCompletion): number {
  if (c.special) return SPECIAL_FERTILIZER;
  return hash(`fertilizer:${c.id}`) % 100 < FERTILIZER_PERCENT ? 1 : 0;
}

export function givesFertilizer(c: MissionCompletion): boolean {
  return fertilizerFrom(c) > 0;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function bondFromCare(care: CareRecord, extraPoints = 0): { points: number; level: number; intoLevel: number; nextAt: number | null } {
  const points = (care.wateredDays.length + (care.bonusWaterUsed ?? 0)) * WATER_POINTS + care.fertilizerUsed * FERTILIZER_POINTS + extraPoints;
  const level = Math.min(MAX_BOND, Math.floor(points / BOND_STEP) + 1);
  return { points, level, intoLevel: level === MAX_BOND ? BOND_STEP : points % BOND_STEP, nextAt: level === MAX_BOND ? null : level * BOND_STEP };
}

export interface CareState {
  care: CareRecord;
  /** A mission was recorded today, so there is water to pour. */
  hasWaterToday: boolean;
  wateredToday: boolean;
  /** Extra water from the admin, not yet poured. */
  bonusWater: number;
  /** Waterings available right now (today's water if not poured yet, plus extra water). */
  waterLeft: number;
  fertilizerEarned: number;
  fertilizer: number;
  /** Days since the last recorded mission (null if none yet). */
  daysAway: number | null;
  /** Days since the last watering (null if never watered). */
  daysSinceWater: number | null;
  /** Not watered for a while: Sprouty begs with puppy eyes (no penalty). */
  thirsty: boolean;
  bond: ReturnType<typeof bondFromCare>;
  mood: SproutyMood;
  line: string;
}

export function getCareState(progress: PlayerProgress, today: string = getLocalDate()): CareState {
  const care = progress.care ?? EMPTY_CARE;
  const fertilizerEarned = progress.completions.reduce((n, c) => n + fertilizerFrom(c), 0) + adminTotal(progress, 'fertilizer');
  const fertilizer = Math.max(0, fertilizerEarned - care.fertilizerUsed);
  const hasWaterToday = progress.completions.some((c) => c.localDate === today);
  const wateredToday = care.wateredDays.includes(today);
  const last = progress.completions.reduce<string | null>((m, c) => (m === null || c.localDate > m ? c.localDate : m), null);
  const daysAway = last ? Math.max(0, daysBetween(last, today)) : null;
  const bond = bondFromCare(care, adminTotal(progress, 'bond'));
  const bonusWater = Math.max(0, adminTotal(progress, 'water') - (care.bonusWaterUsed ?? 0));
  const waterLeft = (hasWaterToday && !wateredToday ? 1 : 0) + bonusWater;
  const lastWatered = care.wateredDays.length ? care.wateredDays[care.wateredDays.length - 1] : null;
  const daysSinceWater = lastWatered ? Math.max(0, daysBetween(lastWatered, today)) : null;
  const thirsty = !wateredToday && ((daysSinceWater !== null && daysSinceWater >= THIRSTY_AFTER_DAYS) || (daysSinceWater === null && daysAway !== null && daysAway >= LONELY_AFTER_DAYS));

  let mood: SproutyMood = 'happy';
  let line: string;
  if (thirsty) {
    mood = 'pleading';
    const since = daysSinceWater !== null ? `ไม่ได้รดน้ำมา ${daysSinceWater} วันแล้ว…` : 'ยังไม่เคยได้รดน้ำเลย…';
    line = waterLeft > 0 ? `${since} มีน้ำอยู่ รดให้หน่อยน้า 🥺` : `${since} คอแห้งจัง ทำภารกิจสักข้อแล้วมารดน้ำให้หน่อยนะ 🥺`;
  } else if (wateredToday) {
    mood = 'cheer';
    line = fertilizer > 0 ? 'สดชื่นจัง! ขอบคุณที่รดน้ำนะ มีปุ๋ยเหลืออยู่ด้วย อยากกินจัง~' : 'สดชื่นจัง! ขอบคุณที่รดน้ำให้นะ พรุ่งนี้มาเจอกันอีก';
  } else if (hasWaterToday || bonusWater > 0) {
    line = hasWaterToday ? 'ทำภารกิจวันนี้แล้ว ได้น้ำมาด้วย รดให้หน่อยนะ~' : 'มีน้ำพิเศษอยู่ รดให้หน่อยนะ~';
  } else if (daysAway === null) {
    mood = 'sleepy';
    line = 'ทำภารกิจแรกเพื่อเอาน้ำมารดให้ฉันหน่อยนะ';
  } else if (daysAway >= LONELY_AFTER_DAYS) {
    mood = 'worried';
    line = `ไม่เจอกัน ${daysAway} วันแล้ว คิดถึงจัง… ทำภารกิจสักข้อแล้วมารดน้ำให้หน่อยนะ`;
  } else {
    mood = 'sleepy';
    line = 'คอแห้งนิดหน่อย ทำภารกิจสักข้อเพื่อได้น้ำมารดนะ';
  }
  return { care, hasWaterToday, wateredToday, bonusWater, waterLeft, fertilizerEarned, fertilizer, daysAway, daysSinceWater, thirsty, bond, mood, line };
}

/** Completions that dropped fertilizer, newest first (for "where did my fertilizer come from"). */
export function fertilizerSources(progress: PlayerProgress, limit = 5): MissionCompletion[] {
  return progress.completions
    .filter(givesFertilizer)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

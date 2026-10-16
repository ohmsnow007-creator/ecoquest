import type { MissionCategory, PlayerProgress } from '../types';

/**
 * Environmental days. During the week around each one (3 days before to 3 days after), completing a
 * mission (of the event's category, if it has one) earns that event's special cosmetic.
 */
export interface EcoEvent {
  id: string;
  name: string;
  month: number;
  day: number;
  category?: MissionCategory;
  /** Cosmetic id awarded for taking part. */
  rewardId: string;
  blurb: string;
}

export const EVENT_WINDOW_DAYS = 3;

export const ECO_EVENTS: EcoEvent[] = [
  { id: 'water-day', name: 'วันน้ำโลก', month: 3, day: 22, category: 'water', rewardId: 'bg-rain', blurb: 'ทำภารกิจหมวดน้ำสักข้อในสัปดาห์นี้' },
  { id: 'earth-day', name: 'วันคุ้มครองโลก', month: 4, day: 22, rewardId: 'hat-earth', blurb: 'ทำภารกิจหมวดไหนก็ได้สักข้อในสัปดาห์นี้' },
  { id: 'env-day', name: 'วันสิ่งแวดล้อมโลก', month: 6, day: 5, rewardId: 'pot-leaf', blurb: 'ทำภารกิจหมวดไหนก็ได้สักข้อในสัปดาห์นี้' },
  { id: 'food-day', name: 'วันอาหารโลก', month: 10, day: 16, category: 'consumption', rewardId: 'hat-chef', blurb: 'ทำภารกิจหมวดการบริโภคสักข้อในสัปดาห์นี้' },
  { id: 'thai-env-day', name: 'วันสิ่งแวดล้อมไทย', month: 12, day: 4, category: 'nature', rewardId: 'bg-forest', blurb: 'ทำภารกิจหมวดธรรมชาติสักข้อในสัปดาห์นี้' },
];

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const eventDateLabel = (e: EcoEvent) => `${e.day} ${THAI_MONTHS[e.month - 1]}`;

const DAY = 86_400_000;
const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);

/** Days from the event day in `date`'s year (negative = before). */
function offset(e: EcoEvent, date: string): number {
  const year = Number(date.slice(0, 4));
  return Math.round((utc(date) - Date.UTC(year, e.month - 1, e.day)) / DAY);
}

export function inEventWindow(e: EcoEvent, date: string): boolean {
  return Math.abs(offset(e, date)) <= EVENT_WINDOW_DAYS;
}

/** The event running on `today` (local YYYY-MM-DD), if any. */
export function getActiveEvent(today: string): EcoEvent | undefined {
  return ECO_EVENTS.find((e) => inEventWindow(e, today));
}

/** The next event that hasn't started yet, and how many days until it starts. */
export function getNextEvent(today: string): { event: EcoEvent; inDays: number } {
  const upcoming = ECO_EVENTS.map((e) => {
    let d = -offset(e, today) - EVENT_WINDOW_DAYS;
    if (d <= 0) d += 365;
    return { event: e, inDays: d };
  }).sort((a, b) => a.inDays - b.inDays);
  return upcoming[0];
}

/** Whether the player took part: a recorded mission (of the right category) inside the event week. */
export function eventCompleted(e: EcoEvent, progress: PlayerProgress, missionCategory: (missionId: string) => MissionCategory | undefined): boolean {
  return progress.completions.some((c) => inEventWindow(e, c.localDate) && (!e.category || missionCategory(c.missionId) === e.category));
}

export function getEvent(id: string): EcoEvent | undefined {
  return ECO_EVENTS.find((e) => e.id === id);
}

import type { MissionCategory } from '../types';

/** Daily missions: picked fresh each local day for each player. */
export const DAILY_MISSION_COUNT = 3;
/** Bonus for finishing all of today's daily missions, claimable once per day. */
export const DAILY_BONUS_XP = 30;
/** Today's daily missions (special ones included) pay this many times their usual XP. */
export const DAILY_XP_MULTIPLIER = 3;
/** Special daily missions: 1 on weekdays, 2 at the weekend, picked from today's daily missions. */
export const SPECIAL_PER_DAY = { weekday: 1, weekend: 2 } as const;
/** Extra XP for completing a special daily mission (on top of the mission's own XP). */
export const SPECIAL_BONUS_XP = 30;
/** Fertilizer bags a special mission always gives Sprouty (instead of the usual chance). */
export const SPECIAL_FERTILIZER = 2;

export type WeeklyGoal =
  | { type: 'category'; category: MissionCategory; target: number }
  | { type: 'missions'; target: number }
  | { type: 'categories'; target: number }
  | { type: 'quizzes'; target: number };

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  goal: WeeklyGoal;
  bonusXp: number;
}

/** One of these runs each week (Monday to Sunday, local time). Progress counts only records made that week. */
export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  { id: 'week-waste', title: 'สัปดาห์ลดขยะ', description: 'ทำภารกิจหมวดการจัดการขยะ 5 ครั้งในสัปดาห์นี้', goal: { type: 'category', category: 'waste', target: 5 }, bonusXp: 500 },
  { id: 'week-energy', title: 'สัปดาห์ประหยัดไฟ', description: 'ทำภารกิจหมวดประหยัดพลังงาน 5 ครั้งในสัปดาห์นี้', goal: { type: 'category', category: 'energy', target: 5 }, bonusXp: 500 },
  { id: 'week-water', title: 'สัปดาห์รักษ์น้ำ', description: 'ทำภารกิจหมวดประหยัดน้ำ 5 ครั้งในสัปดาห์นี้', goal: { type: 'category', category: 'water', target: 5 }, bonusXp: 500 },
  { id: 'week-transport', title: 'สัปดาห์เดินทางสีเขียว', description: 'ทำภารกิจหมวดการเดินทาง 3 ครั้งในสัปดาห์นี้', goal: { type: 'category', category: 'transport', target: 3 }, bonusXp: 500 },
  { id: 'week-missions', title: 'นักภารกิจตัวยง', description: 'ทำภารกิจอะไรก็ได้ให้ครบ 10 ครั้งในสัปดาห์นี้', goal: { type: 'missions', target: 10 }, bonusXp: 600 },
  { id: 'week-variety', title: 'ลองให้ครบทุกแนว', description: 'ทำภารกิจให้ครบ 4 หมวดที่ต่างกันในสัปดาห์นี้', goal: { type: 'categories', target: 4 }, bonusXp: 500 },
  { id: 'week-quiz', title: 'สัปดาห์นักเรียนรู้', description: 'ทำควิซสิ่งแวดล้อมให้ครบ 3 ชุดในสัปดาห์นี้', goal: { type: 'quizzes', target: 3 }, bonusXp: 500 },
];

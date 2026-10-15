import type { SproutyMood, SproutyStage } from '../components/illustrations/SproutySeed';

/** Sprouty grows with the player's level. `from` is the first level of each stage. */
export const SPROUTY_STAGES: { stage: SproutyStage; from: number; name: string }[] = [
  { stage: 1, from: 1, name: 'เมล็ดพันธุ์' },
  { stage: 2, from: 3, name: 'ต้นอ่อน 4 ใบ' },
  { stage: 3, from: 8, name: 'ต้นผลิดอก' },
  { stage: 4, from: 15, name: 'ต้นไม้น้อย' },
];

export function getSproutyStage(level: number): { stage: SproutyStage; name: string; nextAt: number | null; nextName: string | null } {
  let i = 0;
  for (let k = 0; k < SPROUTY_STAGES.length; k++) if (level >= SPROUTY_STAGES[k].from) i = k;
  const next = SPROUTY_STAGES[i + 1];
  return { stage: SPROUTY_STAGES[i].stage, name: SPROUTY_STAGES[i].name, nextAt: next?.from ?? null, nextName: next?.name ?? null };
}

export interface GreetingInput {
  hour: number;
  name: string;
  todayCount: number;
  streak: number;
  dailyComplete: boolean;
  /** No mission recorded yet, ever: welcome them instead of telling them to rest. */
  firstTime?: boolean;
}

/** What Sprouty says on Home, from the clock and the player's real records. */
export function getSproutyGreeting({ hour, name, todayCount, streak, dailyComplete, firstTime = false }: GreetingInput): { mood: SproutyMood; hello: string; line: string } {
  const late = hour >= 22 || hour < 5;
  const hello = late ? `ดึกแล้วนะ ${name}` : hour < 12 ? `อรุณสวัสดิ์ ${name}!` : hour < 17 ? `สวัสดีตอนบ่าย ${name}!` : `สวัสดีตอนเย็น ${name}!`;

  if (firstTime) return { mood: 'happy', hello, line: 'ยินดีต้อนรับ! เลือกภารกิจด้านล่างสักข้อ แล้วมาปลูกต้นกล้าต้นแรกด้วยกันนะ' };
  if (dailyComplete) return { mood: 'cheer', hello, line: late ? 'วันนี้ทำภารกิจประจำวันครบแล้ว พักผ่อนได้เต็มที่เลย!' : 'ทำภารกิจประจำวันครบแล้ว เก่งมาก!' };
  // The streak counts yesterday too, so it is still alive but ends tonight without a mission.
  if (streak > 0 && todayCount === 0) return { mood: 'worried', hello, line: `Streak ${streak} วันจะหายถ้าวันนี้ยังไม่ได้ทำภารกิจ มาทำสักข้อกันนะ` };
  if (todayCount === 0) return { mood: 'sleepy', hello, line: late ? 'ดึกแล้ว พักผ่อนบ้างนะ พรุ่งนี้ค่อยเริ่มภารกิจกัน' : 'วันนี้ยังไม่ได้ทำภารกิจเลย ง่วงจัง… มาทำสักข้อไหม' };
  return { mood: 'happy', hello, line: late ? `วันนี้ทำไป ${todayCount} ภารกิจแล้ว ดึกแล้ว พักผ่อนบ้างนะ` : `วันนี้ทำไปแล้ว ${todayCount} ภารกิจ ไปต่อกัน!` };
}

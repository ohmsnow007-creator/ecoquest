import type { SproutyMood, SproutyStage } from '../components/illustrations/SproutySeed';
import type { TimeOfDay } from './timeOfDay';

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

type Line = { text: string; mood: SproutyMood };

/**
 * What Sprouty says on the Missions page, from the clock and today's real daily-mission record.
 * `left` is how many daily missions are still to do (null when there is no profile yet).
 */
export function missionsLine(time: TimeOfDay, daily: { left: number; started: boolean } | null): Line {
  if (!daily) return { text: 'เลือกภารกิจที่ชอบสักข้อ แล้วเริ่มกันเลย!', mood: 'happy' };
  const { left, started } = daily;
  if (time === 'night') {
    return left === 0
      ? { text: 'ภารกิจวันนี้ครบแล้ว ดึกแล้ว ไปนอนได้เลย ฝันดีนะ~', mood: 'sleepy' }
      : { text: 'ดึกแล้ว ทำอีกข้อแล้วไปนอนนะ', mood: 'sleepy' };
  }
  if (left === 0) return { text: 'ภารกิจประจำวันครบแล้ว! อยากทำเพิ่มก็เลือกได้อีกนะ', mood: 'cheer' };
  if (time === 'morning' && !started) return { text: 'อรุณสวัสดิ์! เริ่มเช้านี้ด้วยภารกิจง่าย ๆ สักข้อไหม', mood: 'happy' };
  if (time === 'evening') return { text: `ใกล้ค่ำแล้ว ภารกิจประจำวันเหลืออีก ${left} ข้อ เก็บให้ครบก่อนนอนนะ`, mood: 'happy' };
  return started
    ? { text: `ภารกิจประจำวันเหลืออีก ${left} ข้อ สู้ ๆ นะ!`, mood: 'happy' }
    : { text: 'วันนี้ยังไม่ได้เริ่มเลย ลองภารกิจง่าย ๆ สักข้อไหม', mood: 'sleepy' };
}

/** A short time-of-day opener Sprouty adds in front of a page line (empty during the day). */
export function timeOpener(time: TimeOfDay): string {
  return time === 'morning' ? 'อรุณสวัสดิ์! ' : time === 'evening' ? 'สวัสดีตอนเย็น! ' : time === 'night' ? 'ดึกแล้วนะ… ' : '';
}

/** Sprouty on My Green World: invites a tap on the sun or moon that matches the hour. */
export function worldLine(time: TimeOfDay): Line {
  switch (time) {
    case 'morning':
      return { text: 'อรุณสวัสดิ์! พระอาทิตย์เพิ่งตื่น ลองจิ้มทักทายดูสิ', mood: 'happy' };
    case 'day':
      return { text: 'แดดดีจัง ต้นไม้ในโลกของคุณกำลังโบกใบให้ ลองจิ้มพระอาทิตย์ดูสิ', mood: 'cheer' };
    case 'evening':
      return { text: 'พระอาทิตย์ใกล้ตกแล้ว จิ้มโบกมือลาหน่อยไหม', mood: 'happy' };
    case 'night':
      return { text: 'ดึกแล้ว พระจันทร์ง่วงมาก ลองจิ้มดูสิ… แล้วเราก็ไปนอนกันนะ', mood: 'sleepy' };
  }
}

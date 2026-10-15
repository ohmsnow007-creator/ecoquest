import { describe, it, expect } from 'vitest';
import { missions } from '../data/missions';
import { SPROUTY_TIPS } from '../data/sproutyTips';

/*
 * A number followed by a unit of measure, a share, money or a multiplier is a statistic and must be
 * sourced. Counts that are part of the task itself ("1 ครั้ง", "3 ชิ้น", "5 นาที") are instructions.
 */
const STATISTIC = /\d[\d,.]*\s*(%|เปอร์เซ็นต์|ปี|ลิตร|กิโลกรัม|กรัม|บาท|ดอลลาร์|เท่า|ล้าน|พันล้าน|ชั่วโมงต่อ|ต่อกิโลเมตร|kg|CO2)/;

describe('mission facts', () => {
  it('every statistic in a mission explanation or step has a source', () => {
    const unsourced = missions
      .filter((m) => !m.sources?.length)
      .flatMap((m) => [m.environmentalExplanation, ...m.steps].filter((t) => STATISTIC.test(t)).map((t) => `${m.id}: ${t}`));
    expect(unsourced).toEqual([]);
  });

  it('sourced missions name the source, and links are https', () => {
    for (const m of missions.filter((x) => x.sources)) {
      for (const src of m.sources!) {
        expect(src.name.length).toBeGreaterThan(5);
        if (src.url) expect(src.url).toMatch(/^https:\/\//);
      }
    }
  });

  it('Sprouty tips state no statistics', () => {
    for (const t of SPROUTY_TIPS) expect(`${t.lead}${t.hl}${t.tail ?? ''}`).not.toMatch(STATISTIC);
  });

  it('the rule catches the kind of claim that was removed', () => {
    expect(STATISTIC.test('ถุงพลาสติกใช้เวลาย่อยสลาย 100-500 ปี')).toBe(true);
    expect(STATISTIC.test('ประหยัดค่าไฟได้ประมาณ 300-500 บาทต่อปี')).toBe(true);
    expect(STATISTIC.test('คิดเป็น 5-10% ของค่าไฟบ้าน')).toBe(true);
    expect(STATISTIC.test('แยกขยะอย่างน้อย 1 ครั้งในวันนี้')).toBe(false);
    expect(STATISTIC.test('อาบน้ำไม่เกิน 5 นาที')).toBe(false);
  });
});

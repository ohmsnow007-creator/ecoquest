/** Things Sprouty says on the intro screen. Every tip is general advice, not a measured claim. */
export interface SproutyTip {
  lead: string;
  /** Highlighted words, shown in green. */
  hl: string;
  tail?: string;
}

export const SPROUTY_TIPS: SproutyTip[] = [
  { lead: 'ปิดไฟเมื่อออกจากห้อง', hl: 'ประหยัดพลังงาน', tail: ' ได้ทุกวันนะ' },
  { lead: 'พกแก้วน้ำของตัวเอง ช่วย', hl: 'ลดแก้วพลาสติก', tail: 'ได้เยอะเลย' },
  { lead: 'แยกขยะให้ถูกประเภท ช่วยให้', hl: 'รีไซเคิลได้ง่ายขึ้น' },
  { lead: 'ปิดน้ำตอนแปรงฟัน', hl: 'ประหยัดน้ำ', tail: ' ง่าย ๆ แค่นี้เอง' },
  { lead: 'ระยะใกล้ ๆ ลอง', hl: 'เดินหรือปั่นจักรยาน', tail: ' ดีทั้งต่อโลกและสุขภาพ' },
  { lead: 'ทำภารกิจเล็ก ๆ วันละนิด แล้ว', hl: 'โลกของคุณจะเขียวขึ้น' },
  { lead: 'ลองตอบ', hl: 'ควิซสิ่งแวดล้อม', tail: ' รับ XP ไปเลย!' },
  { lead: 'ฉันโตขึ้นได้เพราะ', hl: 'ภารกิจของคุณ', tail: 'นะ' },
  { lead: 'ถุงผ้าใบเดียว', hl: 'ใช้ซ้ำได้อีกหลายครั้ง', tail: ' ลดถุงพลาสติกได้' },
  { lead: 'แตะฉันสิ', hl: 'มีเรื่องเล่าอีกเยอะ!' },
];

/**
 * A shuffled order of all tip indexes. If `avoidFirst` is given, the new order never starts with it,
 * so the same tip is never shown twice in a row across rounds.
 */
export function nextTipOrder(count: number, avoidFirst?: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (avoidFirst !== undefined && order.length > 1 && order[0] === avoidFirst) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

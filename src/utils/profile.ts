export const NAME_MAX_LENGTH = 20;

export type NameValidation = { ok: true; value: string } | { ok: false; error: string };

export function validateDisplayName(raw: string): NameValidation {
  const value = raw.replace(/\s+/g, ' ').trim();
  if (value.length === 0) return { ok: false, error: 'กรุณากรอกชื่อผู้เล่น' };
  if ([...value].length > NAME_MAX_LENGTH) return { ok: false, error: `ชื่อยาวได้ไม่เกิน ${NAME_MAX_LENGTH} ตัวอักษร` };
  return { ok: true, value };
}

import { Star } from 'lucide-react';
import { SPECIAL_BONUS_XP, SPECIAL_FERTILIZER } from '../../config/challenges';

/** Gold "special today" tag for one of the day's special daily missions. */
export function SpecialMissionTag({ compact = false }: { compact?: boolean }) {
  return (
    <span className="special-tag inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FDE68A] to-[#FBBF24] px-2 py-0.5 text-caption font-bold text-[#7C4A03] shadow-[0_2px_8px_rgb(251_191_36/0.45)] ring-1 ring-[#F59E0B]/60">
      <Star size={12} className="fill-current" aria-hidden="true" />
      {compact ? `พิเศษ +${SPECIAL_BONUS_XP} XP` : `ภารกิจพิเศษวันนี้ · +${SPECIAL_BONUS_XP} XP · 💧✨×${SPECIAL_FERTILIZER}`}
    </span>
  );
}

/** Banner explaining what a special daily mission gives. */
export function SpecialMissionBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] p-3 text-caption text-[#7C4A03] ring-1 ring-[#F59E0B]/40">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FBBF24] text-white shadow-card" aria-hidden="true">
        <Star size={18} className="fill-current" />
      </span>
      <p>
        <b>ภารกิจพิเศษประจำวัน</b> ทำวันนี้รับ XP เพิ่ม <b>+{SPECIAL_BONUS_XP}</b> และได้ <b>น้ำ 💧</b> กับ <b>ปุ๋ย {SPECIAL_FERTILIZER} ถุง ✨</b> ไปเลี้ยง Sprouty
      </p>
    </div>
  );
}

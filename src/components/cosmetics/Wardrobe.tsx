import { useState } from 'react';
import { Lock, Check, Shirt } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { getAllCosmeticStatuses, SLOT_LABELS, type CosmeticSlot } from '../../data/cosmetics';
import { getCharacter } from '../../data/avatars';
import { CharacterAvatar } from '../avatar/CharacterAvatar';
import { PlayerSprouty } from '../sprouty/PlayerSprouty';
import { SproutySeed } from '../illustrations/SproutySeed';
import { getSproutyStage } from '../../utils/sprouty';
import { getLevelFromXp } from '../../utils/xp';
import { useOutfit } from './useOutfit';

const SLOTS: CosmeticSlot[] = ['hat', 'eyes', 'bag'];

/** Unlocked cosmetics to wear on the avatar and Sprouty; locked ones show how to earn them. */
export function Wardrobe() {
  const { profile, progress, wearCosmetic } = useGame();
  const outfit = useOutfit();
  const [slot, setSlot] = useState<CosmeticSlot>('hat');
  if (!profile) return null;

  const statuses = getAllCosmeticStatuses(progress);
  const unlockedCount = statuses.filter((s) => s.unlocked).length;
  const stage = getSproutyStage(getLevelFromXp(progress.totalXp)).stage;
  const look = getCharacter(profile.avatarId).look;

  return (
    <section aria-labelledby="wardrobe-title" className="rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h2 id="wardrobe-title" className="flex items-center gap-2 text-section font-semibold">
          <Shirt size={18} className="text-primary" aria-hidden="true" /> ตู้เสื้อผ้า
        </h2>
        <span className="text-caption text-muted">ปลดล็อกแล้ว {unlockedCount}/{statuses.length}</span>
      </div>

      {/* live preview */}
      <div className="mt-3 flex items-end justify-center gap-4 rounded-2xl bg-pale-mint/70 px-3 pt-3">
        <CharacterAvatar look={look} outfit={outfit} className="h-36 w-auto" title="ตัวอย่างอวาตาร์ของคุณ" />
        <span className="mb-1 block w-28">
          <PlayerSprouty size={112} mood="happy" title="ตัวอย่าง Sprouty ของคุณ" />
        </span>
      </div>

      <div className="mt-3 flex gap-2" role="tablist" aria-label="ประเภทของแต่ง">
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={slot === s}
            onClick={() => setSlot(s)}
            className={`min-h-10 flex-1 rounded-full text-caption font-semibold ${slot === s ? 'bg-forest text-mint' : 'bg-background text-text ring-1 ring-border'}`}
          >
            {SLOT_LABELS[s]}
          </button>
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2.5" aria-label={SLOT_LABELS[slot]}>
        {statuses
          .filter((s) => s.cosmetic.slot === slot)
          .map(({ cosmetic, unlocked, condition, current, target }) => {
            const worn = outfit[slot] === cosmetic.id;
            return (
              <li key={cosmetic.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  aria-pressed={worn}
                  onClick={() => wearCosmetic(slot, worn ? null : cosmetic.id)}
                  className={`relative flex w-full flex-col items-center rounded-2xl border p-2.5 text-center transition-colors ${
                    worn ? 'border-primary bg-primary/5 ring-2 ring-primary' : unlocked ? 'border-border bg-surface hover:border-primary/40' : 'border-border bg-background'
                  }`}
                >
                  <span className={`block w-20 ${unlocked ? '' : 'opacity-40 grayscale'}`}>
                    <SproutySeed size={80} className="h-auto w-full" stage={stage} outfit={{ [slot]: cosmetic.id }} title="" />
                  </span>
                  <span className="mt-1 text-caption leading-tight font-semibold">{cosmetic.name}</span>
                  {unlocked ? (
                    <span className={`mt-0.5 text-[0.75rem] font-semibold ${worn ? 'text-primary' : 'text-muted'}`}>{worn ? 'ใส่อยู่ · แตะเพื่อถอด' : 'แตะเพื่อใส่'}</span>
                  ) : (
                    <span className="mt-0.5 text-[0.75rem] leading-tight text-muted">
                      {condition}
                      {target > 1 && ` (${current}/${target})`}
                    </span>
                  )}
                  {worn && <Check size={16} className="absolute top-2 right-2 text-primary" aria-hidden="true" />}
                  {!unlocked && <Lock size={14} className="absolute top-2 right-2 text-muted" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
      </ul>
      <p className="mt-2 text-[0.75rem] text-muted">ของแต่งจะแสดงบนอวาตาร์และ Sprouty ทุกที่ในแอป</p>
    </section>
  );
}

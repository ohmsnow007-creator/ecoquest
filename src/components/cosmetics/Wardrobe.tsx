import { useState } from 'react';
import { Lock, Check, Shirt, UserRound, Sprout } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { getAllCosmeticStatuses, SLOT_LABELS, slotsFor, type CosmeticSlot, type OutfitTarget } from '../../data/cosmetics';
import { getCharacter } from '../../data/avatars';
import { CharacterAvatar } from '../avatar/CharacterAvatar';
import { Avatar } from '../ui/AvatarPicker';
import { SproutySeed } from '../illustrations/SproutySeed';
import { getSproutyStage } from '../../utils/sprouty';
import { getLevelFromXp } from '../../utils/xp';
import { useOutfit } from './useOutfit';
import { SproutyScene } from './SproutyScenery';

const TARGETS: { id: OutfitTarget; label: string; icon: typeof Shirt }[] = [
  { id: 'avatar', label: 'แต่งตัวละครของฉัน', icon: UserRound },
  { id: 'sprouty', label: 'แต่งให้ Sprouty', icon: Sprout },
];

/** Unlocked cosmetics, worn separately by the player's character and by Sprouty; locked ones show how to earn them. */
export function Wardrobe() {
  const { profile, progress, wearCosmetic } = useGame();
  const avatarOutfit = useOutfit('avatar');
  const sproutyOutfit = useOutfit('sprouty');
  const [target, setTarget] = useState<OutfitTarget>('avatar');
  const [slot, setSlot] = useState<CosmeticSlot>('hat');
  if (!profile) return null;

  const slots = slotsFor(target);
  const activeSlot = slots.includes(slot) ? slot : 'hat';
  const outfit = target === 'avatar' ? avatarOutfit : sproutyOutfit;
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

      {/* who is being dressed */}
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-background p-1 ring-1 ring-border" role="tablist" aria-label="แต่งให้ใคร">
        {TARGETS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={target === id}
            onClick={() => setTarget(id)}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-caption font-semibold transition-colors ${
              target === id ? 'bg-forest text-mint shadow-card' : 'text-text'
            }`}
          >
            <Icon size={15} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {/* live preview of the one being dressed */}
      <div
        className={`relative mt-3 flex items-end justify-center overflow-hidden rounded-2xl bg-pale-mint/70 ${target === 'sprouty' ? '' : 'h-44'}`}
        style={target === 'sprouty' ? { aspectRatio: 1.2 } : undefined}
      >
        {target === 'avatar' ? (
          activeSlot === 'frame' ? (
            <span className="mb-8 flex">
              <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="xl" outfit={avatarOutfit} framed />
            </span>
          ) : (
            <CharacterAvatar look={look} outfit={avatarOutfit} className="h-40 w-auto" title="ตัวอย่างตัวละครของคุณ" />
          )
        ) : (
          <SproutyScene
            background={sproutyOutfit.background}
            aspect={1.2}
            className="absolute inset-0 h-full w-full"
            sprouty={<SproutySeed size={144} className="h-auto w-full" mood="happy" stage={stage} outfit={sproutyOutfit} title="ตัวอย่าง Sprouty ของคุณ" />}
          />
        )}
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="ประเภทของแต่ง">
        {slots.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={activeSlot === s}
            onClick={() => setSlot(s)}
            className={`min-h-10 min-w-16 flex-1 shrink-0 rounded-full px-3 text-caption font-semibold ${activeSlot === s ? 'bg-forest text-mint' : 'bg-background text-text ring-1 ring-border'}`}
          >
            {SLOT_LABELS[s]}
          </button>
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2.5" aria-label={SLOT_LABELS[activeSlot]}>
        {statuses
          .filter((s) => s.cosmetic.slot === activeSlot)
          .map(({ cosmetic, unlocked, condition, current, target: goal }) => {
            const worn = outfit[activeSlot] === cosmetic.id;
            return (
              <li key={cosmetic.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  aria-pressed={worn}
                  onClick={() => wearCosmetic(activeSlot, worn ? null : cosmetic.id, target)}
                  className={`relative flex w-full flex-col items-center rounded-2xl border p-2.5 text-center transition-colors ${
                    worn ? 'border-primary bg-primary/5 ring-2 ring-primary' : unlocked ? 'border-border bg-surface hover:border-primary/40' : 'border-border bg-background'
                  }`}
                >
                  <span className={`relative block h-20 w-20 overflow-hidden rounded-xl ${unlocked ? '' : 'opacity-40 grayscale'}`}>
                    {activeSlot === 'frame' ? (
                      <span className="flex h-full w-full items-center justify-center">
                        <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="md" outfit={{ frame: cosmetic.id }} />
                      </span>
                    ) : target === 'avatar' ? (
                      <CharacterAvatar look={look} outfit={{ [activeSlot]: cosmetic.id }} className="h-20 w-auto" title="" />
                    ) : activeSlot === 'background' ? (
                      <SproutyScene background={cosmetic.id} className="h-full w-full" sprouty={<SproutySeed size={56} className="h-auto w-full" stage={stage} outfit={{ pot: sproutyOutfit.pot }} title="" />} />
                    ) : (
                      <SproutySeed size={80} className="h-auto w-full" stage={stage} outfit={{ [activeSlot]: cosmetic.id }} title="" />
                    )}
                  </span>
                  <span className="mt-1 text-caption leading-tight font-semibold">{cosmetic.name}</span>
                  {unlocked ? (
                    <span className={`mt-0.5 text-[0.75rem] font-semibold ${worn ? 'text-primary' : 'text-muted'}`}>{worn ? 'ใส่อยู่ · แตะเพื่อถอด' : 'แตะเพื่อใส่'}</span>
                  ) : (
                    <span className="mt-0.5 text-[0.75rem] leading-tight text-muted">
                      {condition}
                      {goal > 1 && ` (${current}/${goal})`}
                    </span>
                  )}
                  {worn && <Check size={16} className="absolute top-2 right-2 text-primary" aria-hidden="true" />}
                  {!unlocked && <Lock size={14} className="absolute top-2 right-2 text-muted" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
      </ul>
      <p className="mt-2 text-[0.75rem] text-muted">
        {target === 'avatar' ? 'ชุดนี้แสดงบนตัวละครของคุณ เช่น หน้าหลัก โปรไฟล์ และอันดับ' : 'ชุดนี้แสดงบน Sprouty ทุกที่ในแอป กระถางและฉากหลังมีเฉพาะ Sprouty'}
      </p>
    </section>
  );
}

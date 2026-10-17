import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Check, LayoutGrid, Sparkles, Shirt } from 'lucide-react';
import { useGame } from '../../store/GameContext';
import { getAllCosmeticStatuses, SLOT_LABELS, type Cosmetic, type Outfit } from '../../data/cosmetics';
import { Avatar } from '../ui/AvatarPicker';
import { SproutyScene } from './SproutyScenery';
import { SproutySeed } from '../illustrations/SproutySeed';
import { getSproutyStage } from '../../utils/sprouty';
import { getLevelFromXp } from '../../utils/xp';
import { playSound } from '../../services/soundService';
import { useOutfit } from './useOutfit';

/** Leaves and petals bursting out of the reveal (positions are fixed so every run looks the same). */
const BURST = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  const d = 130 + (i % 3) * 45;
  return {
    x: Math.cos(a) * d,
    y: Math.sin(a) * d,
    r: (i % 2 ? 1 : -1) * (160 + i * 12),
    s: 12 + (i % 4) * 5,
    c: ['#8BD46A', '#F9A8D4', '#FDE047', '#5DAA43', '#FDBA74', '#BBF7D0'][i % 6],
    petal: i % 3 === 1,
  };
});
const SPARKLES = [
  [12, 18], [84, 14], [20, 70], [88, 64], [50, 8], [8, 44], [92, 40], [30, 88], [72, 86],
];

function howUnlocked(c: Cosmetic): string {
  switch (c.unlock.type) {
    case 'badge':
      return 'ได้รับจากเหรียญรางวัล';
    case 'level':
      return `ได้รับเมื่อถึงเลเวล ${c.unlock.level}`;
    case 'weekly':
      return 'ได้รับจากชาเลนจ์ประจำสัปดาห์';
    case 'missions':
      return 'ได้รับจากการทำภารกิจ';
    case 'streak':
      return `ได้รับจากการทำภารกิจต่อเนื่อง ${c.unlock.days} วัน`;
    case 'bond':
      return `ได้รับจากความผูกพันกับ Sprouty ระดับ ${c.unlock.level}`;
    case 'event':
      return 'ของพิเศษจากกิจกรรมวันสิ่งแวดล้อม';
    case 'free':
      return 'ของแต่งพื้นฐาน';
  }
}

/**
 * Full-screen "garden in bloom" reveal when a cosmetic is newly unlocked. Waits for level/badge
 * celebrations to finish first, then shows one item at a time.
 */
export function CosmeticUnlockCelebration() {
  const { profile, progress, celebrations, wearCosmetic, markCosmeticsSeen } = useGame();
  const reduce = useReducedMotion();
  const outfit = useOutfit('sprouty');
  const seen = profile?.preferences.seenCosmetics;
  const soundOn = profile?.preferences.soundEffects !== false;
  const [showAll, setShowAll] = useState(false);

  const unlocked = useMemo(() => getAllCosmeticStatuses(progress).filter((s) => s.unlocked).map((s) => s.cosmetic), [progress]);

  // First time this runs for a player: everything already unlocked counts as seen (no flood of pop-ups).
  useEffect(() => {
    if (profile && seen === undefined) markCosmeticsSeen(unlocked.map((c) => c.id));
  }, [profile, seen, unlocked, markCosmeticsSeen]);

  const fresh = seen ? unlocked.filter((c) => c.unlock.type !== 'free' && !seen.includes(c.id)) : [];
  const current = celebrations.length === 0 ? fresh[0] : undefined;

  useEffect(() => {
    if (current && soundOn) playSound('reward');
  }, [current, soundOn]);

  if (!profile) return null;
  if (showAll && fresh.length > 0 && celebrations.length === 0) {
    return createPortal(
      <AllNewItems
        items={fresh}
        stage={getSproutyStage(getLevelFromXp(progress.totalXp)).stage}
        outfit={outfit}
        avatarId={profile.avatarId}
        color={profile.preferences.profileColor}
        wear={(c) => wearCosmetic(c.slot, c.id, 'both')}
        close={() => {
          markCosmeticsSeen(fresh.map((c) => c.id));
          setShowAll(false);
        }}
      />,
      document.body,
    );
  }
  const stage = getSproutyStage(getLevelFromXp(progress.totalXp)).stage;
  const done = () => current && markCosmeticsSeen([current.id]);
  const wear = () => {
    if (!current) return;
    wearCosmetic(current.slot, current.id, 'both');
    markCosmeticsSeen([current.id]);
  };

  return createPortal(
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-title"
          className="unlock-stage fixed inset-0 z-[260] flex items-center justify-center overflow-hidden px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="unlock-rays" aria-hidden="true" />
          <div className="unlock-glow" aria-hidden="true" />
          {SPARKLES.map(([x, y], i) => (
            <span key={i} className="unlock-sparkle" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.3}s` }} aria-hidden="true" />
          ))}

          <div className="relative flex w-full max-w-sm flex-col items-center text-center text-white">
            <motion.p
              className="unlock-ribbon inline-flex items-center gap-1.5 px-5 py-1.5 font-display text-body font-bold text-forest"
              initial={reduce ? false : { y: -30, scale: 0.6, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 11, delay: 0.25 }}
            >
              <Sparkles size={16} aria-hidden="true" /> ของแต่งใหม่!
            </motion.p>

            <div className="relative mt-4 w-56">
              {!reduce &&
                BURST.map((l, i) => (
                  <motion.span
                    key={i}
                    className="pointer-events-none absolute top-1/2 left-1/2"
                    style={{ width: l.s, height: l.petal ? l.s * 0.7 : l.s, background: l.c, borderRadius: l.petal ? '60% 60% 60% 60%' : '0 70% 0 70%' }}
                    initial={{ x: 0, y: 0, scale: 0.2, opacity: 0, rotate: 0 }}
                    animate={{ x: l.x, y: l.y, scale: 1, opacity: [0, 1, 1, 0], rotate: l.r }}
                    transition={{ duration: 1.4, ease: 'easeOut', delay: 0.35 + i * 0.02 }}
                    aria-hidden="true"
                  />
                ))}
              <motion.div
                initial={reduce ? false : { scale: 0.2, rotate: -12, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { scale: [0.2, 1.15, 0.95, 1], rotate: [-12, 6, -2, 0], opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                className="drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
              >
                {current.slot === 'frame' ? (
                  <span className="flex justify-center py-8">
                    <Avatar id={profile.avatarId} color={profile.preferences.profileColor} size="xl" outfit={{ frame: current.id }} />
                  </span>
                ) : (
                  (() => {
                    const seed = (
                      <SproutySeed
                        size={224}
                        className="relative h-auto w-full"
                        mood="cheer"
                        stage={stage}
                        outfit={{ ...outfit, [current.slot]: current.id }}
                        hop={reduce ? 0 : 1}
                        title={`Sprouty ใส่${current.name}`}
                      />
                    );
                    return current.slot === 'background' ? (
                      <SproutyScene background={current.id} className="w-full rounded-[2rem]" sprouty={seed} />
                    ) : (
                      <span className="relative block">{seed}</span>
                    );
                  })()
                )}
              </motion.div>
            </div>

            <motion.div
              initial={reduce ? false : { y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="mt-2"
            >
              <p className="text-caption font-semibold text-lime">{SLOT_LABELS[current.slot]}</p>
              <h2 id="unlock-title" className="font-display text-[1.75rem] leading-tight font-bold">
                {current.name}
              </h2>
              <p className="mt-1 text-caption text-white/75">{howUnlocked(current)}</p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="mt-5 flex w-full flex-col gap-2"
            >
              <button type="button" autoFocus onClick={wear} className="unlock-cta min-h-12 rounded-full px-6 text-body font-bold text-forest">
                ใส่เลย!
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={done} className="min-h-11 flex-1 rounded-full border border-white/30 text-caption font-semibold text-white hover:bg-white/10">
                  ไว้ทีหลัง
                </button>
                <Link
                  to="/profile"
                  onClick={done}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/30 text-caption font-semibold text-white hover:bg-white/10"
                >
                  <Shirt size={15} aria-hidden="true" /> ตู้เสื้อผ้า
                </Link>
              </div>
              {fresh.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="mt-1 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-white/10 px-4 text-caption font-semibold text-lime hover:bg-white/15"
                >
                  <LayoutGrid size={15} aria-hidden="true" /> ดูทั้งหมด ({fresh.length} ชิ้น)
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface AllNewItemsProps {
  items: Cosmetic[];
  stage: ReturnType<typeof getSproutyStage>['stage'];
  outfit: Outfit;
  avatarId: string;
  color?: string;
  wear: (c: Cosmetic) => void;
  close: () => void;
}

/** Every newly unlocked item on one page: tap one to wear it, then keep them all in one go. */
function AllNewItems({ items, stage, outfit, avatarId, color, wear, close }: AllNewItemsProps) {
  const [worn, setWorn] = useState<string[]>([]);
  const reduce = useReducedMotion();
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-new-title"
      className="unlock-stage fixed inset-0 z-[260] flex flex-col items-center overflow-hidden px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="unlock-glow" aria-hidden="true" />
      <div className="relative flex min-h-0 w-full max-w-md flex-1 flex-col text-white">
        <p className="unlock-ribbon mx-auto inline-flex items-center gap-1.5 px-5 py-1.5 font-display text-body font-bold text-forest">
          <Sparkles size={16} aria-hidden="true" /> ของแต่งใหม่ {items.length} ชิ้น!
        </p>
        <h2 id="all-new-title" className="mt-2 text-center text-caption text-white/80">
          แตะชิ้นที่อยากใส่ได้เลย ที่เหลือเก็บไว้ในตู้เสื้อผ้า
        </h2>

        {/* Previews are drawn still, so a long list stays smooth on phones */}
        <MotionConfig reducedMotion="always">
          <ul className="mt-3 grid min-h-0 flex-1 grid-cols-3 content-start gap-2 overflow-y-auto overscroll-contain pb-2">
            {items.map((c) => {
              const on = worn.includes(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      wear(c);
                      setWorn((w) => [...w.filter((id) => items.find((x) => x.id === id)?.slot !== c.slot), c.id]);
                    }}
                    className={`relative flex w-full flex-col items-center rounded-2xl p-1.5 pb-2 text-center transition ${on ? 'bg-lime/25 ring-2 ring-lime' : 'bg-white/10 ring-1 ring-white/15 hover:bg-white/15'}`}
                  >
                    {on && (
                      <span className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-lime text-forest">
                        <Check size={13} aria-hidden="true" />
                      </span>
                    )}
                    <span className="flex aspect-square w-full items-center justify-center">
                      {c.slot === 'frame' ? (
                        <Avatar id={avatarId} color={color} size="md" outfit={{ frame: c.id }} />
                      ) : c.slot === 'background' ? (
                        <SproutyScene background={c.id} className="w-full rounded-xl" sprouty={<SproutySeed size={56} className="h-auto w-full" stage={stage} outfit={outfit} title="" />} />
                      ) : (
                        <SproutySeed size={80} className="h-auto w-full" mood="cheer" stage={stage} outfit={{ ...outfit, [c.slot]: c.id }} title="" />
                      )}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[0.75rem] leading-tight font-semibold">{c.name}</span>
                    <span className="text-[0.6875rem] text-lime/90">{on ? 'ใส่อยู่' : SLOT_LABELS[c.slot]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </MotionConfig>

        <div className="mt-2 flex flex-col gap-2">
          <button type="button" autoFocus onClick={close} className="unlock-cta min-h-12 rounded-full px-6 text-body font-bold text-forest">
            {worn.length ? 'เรียบร้อย!' : 'เก็บทั้งหมดไว้ก่อน'}
          </button>
          <Link
            to="/profile"
            onClick={close}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/30 text-caption font-semibold text-white hover:bg-white/10"
          >
            <Shirt size={15} aria-hidden="true" /> ไปที่ตู้เสื้อผ้า
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

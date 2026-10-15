import { useEffect, useState } from 'react';
import { useOutfit } from '../cosmetics/useOutfit';
import { motion, useReducedMotion } from 'framer-motion';
import { SproutySeed, type SproutyMood } from '../illustrations/SproutySeed';
import { useGame } from '../../store/GameContext';
import { getSproutyStage } from '../../utils/sprouty';
import { getLevelFromXp } from '../../utils/xp';
import { SPROUTY_TIPS } from '../../data/sproutyTips';
import { useTantrum } from './useTantrum';
import { usePet } from './usePet';

/** Natural blinking for small Sprouties around the app. */
function useBlinking(enabled: boolean) {
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlinking(true);
        t = setTimeout(() => {
          setBlinking(false);
          loop();
        }, 130);
      }, 2400 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [enabled]);
  return blinking;
}

interface PlayerSproutyProps {
  size?: number;
  mood?: SproutyMood;
  title?: string;
  className?: string;
  hop?: number;
}

/** Sprouty at the player's current growth stage, so the same character appears grown-up everywhere. */
export function PlayerSprouty({ size = 96, mood = 'happy', title = '', className = 'h-auto w-full', hop = 0 }: PlayerSproutyProps) {
  const { progress } = useGame();
  const reduce = useReducedMotion();
  const blinking = useBlinking(mood !== 'sleepy' && !reduce);
  const stage = getSproutyStage(getLevelFromXp(progress.totalXp)).stage;
  const outfit = useOutfit();
  return <SproutySeed size={size} className={className} mood={mood} stage={stage} title={title} blinking={blinking} hop={reduce ? 0 : hop} outfit={outfit} />;
}

interface SproutyTalkProps {
  text: string;
  mood?: SproutyMood;
  /** Tapping Sprouty switches to an eco tip, then back on the next tap cycle. */
  tips?: boolean;
  className?: string;
}

/** Small Sprouty with a speech bubble for page headers. */
export function SproutyTalk({ text, mood = 'happy', tips = true, className = '' }: SproutyTalkProps) {
  const [hop, setHop] = useState(0);
  const [tip, setTip] = useState<number | null>(null);
  const tantrum = useTantrum();
  const pet = usePet();
  const reduce = useReducedMotion();
  const said = tantrum.angry ? tantrum.line : pet.shy ? pet.line : tip === null ? text : `${SPROUTY_TIPS[tip].lead} ${SPROUTY_TIPS[tip].hl}${SPROUTY_TIPS[tip].tail ?? ''}`;

  const tap = () => {
    if (pet.consumeTap()) return;
    setHop((h) => h + 1);
    if (tantrum.tap() || tantrum.angry || !tips) return;
    setTip((i) => (i === null ? Math.floor(Math.random() * SPROUTY_TIPS.length) : i + 1 >= SPROUTY_TIPS.length ? null : i + 1));
  };

  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <button type="button" onClick={tap} {...pet.handlers} style={pet.touchStyle} aria-label="แตะหรือลูบหัว Sprouty" className="-mb-1 w-[72px] shrink-0 rounded-full">
        <motion.span className="block" animate={tantrum.angry && !reduce ? { x: [0, -7, 7, -6, 6, -3, 3, 0], rotate: [0, -4, 4, -3, 3, 0] } : { x: 0, rotate: 0 }} transition={{ duration: 0.5 }}>
          <PlayerSprouty size={72} mood={tantrum.angry ? 'angry' : pet.shy ? 'shy' : mood} hop={hop} />
        </motion.span>
      </button>
      <p
        className="sprouty-bubble relative min-w-0 flex-1 rounded-2xl rounded-bl-md border border-mint bg-surface px-3 py-2 text-caption leading-snug font-medium text-forest shadow-card"
        aria-live="polite"
      >
        {said}
      </p>
    </div>
  );
}

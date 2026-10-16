import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Outfit } from '../../data/cosmetics';
import { SproutyCosmetics } from '../cosmetics/CosmeticArt';
import { PotBack, PotFront } from '../cosmetics/SproutyScenery';

export type SproutyMood = 'happy' | 'cheer' | 'sleepy' | 'worried' | 'angry' | 'shy' | 'pleading' | 'thinking';
/** 1 seed with two leaves · 2 four leaves · 3 flowering · 4 small tree. */
export type SproutyStage = 0 | 1 | 2 | 3 | 4;

interface SproutySeedProps {
  size?: number;
  className?: string;
  /** Where Sprouty is looking, each from -1 (left/up) to 1 (right/down). */
  look?: { x: number; y: number };
  blinking?: boolean;
  /** Changes on every tap; Sprouty does a small happy hop. */
  hop?: number;
  mood?: SproutyMood;
  stage?: SproutyStage;
  /** Accessible name; pass '' when a nearby text already describes Sprouty. */
  title?: string;
  /** Play the "just sprouted" entrance: leaves unfurl from the stem after `sproutDelay` seconds. */
  sprout?: boolean;
  sproutDelay?: number;
  /** Unlocked cosmetics Sprouty is wearing. */
  outfit?: Outfit;
}

/** Headbands and crowns that look best drawn over the sprout. */
const HAT_OVER_LEAVES = new Set(['hat-bee', 'hat-headband']);

const SPRING = { type: 'spring', stiffness: 160, damping: 14 } as const;
const fill = { transformBox: 'fill-box', transformOrigin: 'center' } as const;
const INK = '#3A2A1E';

const STAGE_LABEL: Record<SproutyStage, string> = { 0: 'เมล็ดพันธุ์', 1: 'ต้นอ่อนเล็ก', 2: 'ต้นอ่อน 4 ใบ', 3: 'ต้นผลิดอก', 4: 'ต้นไม้น้อย' };

function Leaves({ id, stage }: { id: string; stage: SproutyStage }) {
  if (stage === 4) {
    // A small leafy crown on a sturdier trunk.
    return (
      <>
        <path d="M118 94 C118 80 120 66 122 52" stroke="#7A5636" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M121 70 C112 64 104 62 98 64" stroke="#7A5636" strokeWidth={4} strokeLinecap="round" fill="none" />
        <circle cx="96" cy="44" r="24" fill={`url(#${id}-leafL)`} />
        <circle cx="150" cy="44" r="24" fill={`url(#${id}-leafR)`} />
        <circle cx="122" cy="28" r="28" fill={`url(#${id}-leafR)`} />
        <circle cx="122" cy="54" r="22" fill={`url(#${id}-leafL)`} />
        <ellipse cx="112" cy="16" rx="12" ry="6" fill="#FFFFFF" opacity={0.3} transform="rotate(-20 112 16)" />
        <circle cx="100" cy="36" r="4" fill="#F87171" />
        <circle cx="146" cy="50" r="4" fill="#F87171" />
        <circle cx="132" cy="18" r="4" fill="#FBBF24" />
      </>
    );
  }
  if (stage === 0) {
    // Just a seed: a tiny green bud peeking out of the top, still curled up.
    return (
      <>
        <path d="M120 92 C120 86 121 82 123 78" stroke="#6FB64E" strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M123 79 C116 72 112 74 113 79 C117 82 121 81 123 79Z" fill={`url(#${id}-leafL)`} />
        <path d="M123 78 C127 70 133 70 133 75 C130 79 126 80 123 78Z" fill={`url(#${id}-leafR)`} />
      </>
    );
  }
  return (
    // a young sprout (stage 1) has smaller leaves that grow to full size from stage 2
    <g transform={stage === 1 ? 'translate(122 92) scale(0.72) translate(-122 -92)' : undefined}>
      <path d="M120 92 C121 78 122 70 124 60" stroke="#6FB64E" strokeWidth={6} strokeLinecap="round" fill="none" />
      {stage >= 2 && (
        <>
          <path d="M121 80 C104 60 74 58 66 74 C84 92 110 92 121 80Z" fill={`url(#${id}-leafL)`} />
          <path d="M121 80 C104 72 86 70 72 73" stroke="#3E7F2E" strokeWidth={1.8} fill="none" opacity={0.3} />
          <path d="M122 76 C138 56 170 56 176 70 C160 88 134 88 122 76Z" fill={`url(#${id}-leafR)`} />
          <path d="M122 76 C140 68 158 66 170 69" stroke="#3E7F2E" strokeWidth={1.8} fill="none" opacity={0.3} />
        </>
      )}
      <path d="M123 66 C104 32 66 34 58 52 C74 74 106 78 123 66Z" fill={`url(#${id}-leafL)`} />
      <path d="M123 66 C104 54 84 50 66 52" stroke="#3E7F2E" strokeWidth={2} fill="none" opacity={0.35} />
      <path d="M125 60 C140 22 182 16 192 34 C178 60 146 70 125 60Z" fill={`url(#${id}-leafR)`} />
      <path d="M125 60 C146 46 166 38 186 36" stroke="#3E7F2E" strokeWidth={2} fill="none" opacity={0.35} />
      <ellipse cx="160" cy="34" rx="12" ry="5" fill="#FFFFFF" opacity={0.35} transform="rotate(-20 160 34)" />
      {stage === 3 && (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="124" cy="40" rx="7" ry="11" fill="#F9A8D4" transform={`rotate(${deg} 124 52)`} />
          ))}
          <circle cx="124" cy="52" r="6.5" fill="#FBBF24" />
          <circle cx="122" cy="50" r="2" fill="#FFFFFF" opacity={0.7} />
        </g>
      )}
    </g>
  );
}

/** Big shiny "puppy eyes", brows tilted up and a wobbly little frown: Sprouty begging for water. */
function PleadingFace({ blinking, lx, ly }: { blinking: boolean; lx: number; ly: number }) {
  return (
    <>
      <path d="M84 138 Q94 128 107 133" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M156 138 Q146 128 133 133" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      <motion.g style={fill} animate={{ scaleY: blinking ? 0.1 : 1 }} transition={{ duration: 0.08 }}>
        {[97, 143].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={153} rx={11} ry={12.5} fill={INK} />
            <ellipse cx={cx} cy={159} rx={8} ry={4} fill="#5B6B8C" opacity={0.55} />
          </g>
        ))}
        <motion.g animate={{ x: lx * 2, y: ly * 1.5 }} transition={SPRING}>
          {[97, 143].map((cx) => (
            <g key={cx} fill="#FFFFFF">
              <circle cx={cx + 3.5} cy={147.5} r={4.4} />
              <circle cx={cx - 4} cy={158} r={2.1} />
              <circle cx={cx + 5.5} cy={156} r={1.2} opacity={0.9} />
            </g>
          ))}
        </motion.g>
      </motion.g>
      <ellipse cx="82" cy="170" rx="11" ry="6" fill="#F9939A" opacity={0.7} />
      <ellipse cx="158" cy="170" rx="11" ry="6" fill="#F9939A" opacity={0.7} />
      <path d="M112 180 Q116 175 120 178 Q124 175 128 180" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
}

/** Looking up to one side, one brow raised, a little sideways mouth: Sprouty thinking it over. */
function ThinkingFace({ blinking }: { blinking: boolean }) {
  return (
    <>
      <path d="M86 136 Q96 128 106 133" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M135 139 L153 137" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <motion.g style={fill} animate={{ scaleY: blinking ? 0.1 : 1 }} transition={{ duration: 0.08 }}>
        <ellipse cx="98" cy="152" rx="7.5" ry="9" fill={INK} />
        <ellipse cx="142" cy="152" rx="7.5" ry="9" fill={INK} />
        <circle cx="102" cy="146" r="2.8" fill="#FFFFFF" />
        <circle cx="146" cy="146" r="2.8" fill="#FFFFFF" />
      </motion.g>
      <ellipse cx="84" cy="168" rx="10" ry="6" fill="#F9939A" opacity={0.5} />
      <ellipse cx="156" cy="168" rx="10" ry="6" fill="#F9939A" opacity={0.5} />
      <path d="M114 175 Q121 172 128 176" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  );
}

function Face({ mood, blinking, lx, ly }: { mood: SproutyMood; blinking: boolean; lx: number; ly: number }) {
  if (mood === 'pleading') return <PleadingFace blinking={blinking} lx={lx} ly={ly} />;
  if (mood === 'thinking') return <ThinkingFace blinking={blinking} />;
  const closed = mood === 'sleepy' || (mood === 'cheer' && !blinking);
  return (
    <>
      {mood === 'worried' && (
        <>
          <path d="M88 141 L104 134" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d="M152 141 L136 134" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {mood === 'angry' && (
        // Cute grumpy: thick brows pointing down to the middle
        <>
          <path d="M86 134 L106 142" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M154 134 L134 142" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
      {mood === 'shy' ? (
        // squeezed-shut happy eyes, looking away a little
        <>
          <path d="M88 150 Q96 158 104 150" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M136 150 Q144 158 152 150" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      ) : closed ? (
        mood === 'cheer' ? (
          <>
            <path d="M90 154 Q98 144 106 154" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
            <path d="M134 154 Q142 144 150 154" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M90 152 Q98 158 106 152" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
            <path d="M134 152 Q142 158 150 152" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
          </>
        )
      ) : (
        <motion.g style={fill} animate={{ scaleY: blinking ? 0.1 : 1 }} transition={{ duration: 0.08 }}>
          <ellipse cx="98" cy="152" rx="7.5" ry="9" fill={INK} />
          <ellipse cx="142" cy="152" rx="7.5" ry="9" fill={INK} />
          <motion.g animate={{ x: lx * 2.5, y: ly * 2 }} transition={SPRING}>
            <circle cx="101" cy="148" r="2.6" fill="#FFFFFF" />
            <circle cx="145" cy="148" r="2.6" fill="#FFFFFF" />
          </motion.g>
        </motion.g>
      )}
      {mood === 'shy' && (
        <g>
          <ellipse cx="84" cy="168" rx="16" ry="9" fill="#FB7185" opacity={0.75} />
          <ellipse cx="156" cy="168" rx="16" ry="9" fill="#FB7185" opacity={0.75} />
          <path d="M76 172 L80 164 M84 172 L88 164 M92 172 L96 164 M148 172 L152 164 M156 172 L160 164 M164 172 L168 164" stroke="#E11D48" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        </g>
      )}
      <ellipse cx="84" cy="168" rx={mood === 'angry' ? 13 : 10} ry={mood === 'angry' ? 8 : 6} fill={mood === 'angry' ? '#F4707A' : '#F9939A'} opacity={mood === 'worried' ? 0.3 : mood === 'angry' ? 0.85 : 0.6} />
      <ellipse cx="156" cy="168" rx={mood === 'angry' ? 13 : 10} ry={mood === 'angry' ? 8 : 6} fill={mood === 'angry' ? '#F4707A' : '#F9939A'} opacity={mood === 'worried' ? 0.3 : mood === 'angry' ? 0.85 : 0.6} />
      {mood === 'angry' ? (
        // pouty little frown with puffed cheeks
        <path d="M110 178 Q115 172 120 176 Q125 172 130 178" stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : mood === 'cheer' ? (
        <path d="M108 168 Q120 186 132 168 Z" fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      ) : mood === 'worried' ? (
        <path d="M112 176 Q120 168 128 176" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      ) : mood === 'sleepy' ? (
        <ellipse cx="120" cy="174" rx="4" ry="3" fill={INK} />
      ) : mood === 'shy' ? (
        // tiny wobbly smile
        <path d="M112 174 Q116 178 120 174 Q124 178 128 174" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <path d="M110 170 Q120 180 130 170" stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      )}
    </>
  );
}

/** Sprouty: a glossy seed in soil that grows with the player's level and shows a mood. */
export function SproutySeed({
  size = 220,
  className = '',
  look = { x: 0, y: 0 },
  blinking = false,
  hop = 0,
  mood = 'happy',
  stage = 1,
  title,
  sprout = false,
  sproutDelay = 0.9,
  outfit,
}: SproutySeedProps) {
  const id = useId().replace(/:/g, '');
  const lx = Math.max(-1, Math.min(1, look.x));
  const ly = Math.max(-1, Math.min(1, look.y));
  const label = title ?? `Sprouty ${STAGE_LABEL[stage]}`;
  // Idle life: slow breathing and leaves moving in a light breeze (off when the user prefers less motion).
  const still = useReducedMotion() ?? false;
  // The sprouting entrance plays once. A tap remounts the hop group, and replaying the entrance there
  // made the leaves shrink to nothing (and sometimes stay hidden on phones).
  const [sprouted, setSprouted] = useState(false);
  const playSprout = sprout && !still && !sprouted && hop === 0;
  const breathe = still ? undefined : { scaleY: [1, 1.03, 1], scaleX: [1, 0.985, 1] };
  const breeze = still ? undefined : { rotate: [0, 3.5, -2, 1.5, 0] };

  // Tall hats sit under the sprout (it grows through them); low bands and crowns go on top of the leaves.
  const hatOn = !!outfit?.hat && !HAT_OVER_LEAVES.has(outfit.hat);
  const leaves = (
    <>
          {/* stem + leaves: lean against the look direction and sway in the breeze */}
          <motion.g style={{ transformOrigin: '122px 92px' }} animate={{ rotate: -lx * 6 }} transition={SPRING}>
            <motion.g style={{ transformOrigin: '122px 92px' }} animate={breeze} transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}>
              <motion.g
                style={{ transformOrigin: '122px 92px' }}
                initial={playSprout ? { scale: 0, rotate: -25 } : false}
                onAnimationComplete={() => setSprouted(true)}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: sproutDelay, type: 'spring', damping: 9, stiffness: 140 }}
              >
                <Leaves id={id} stage={stage} />
              </motion.g>
            </motion.g>
          </motion.g>
    </>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#FFFEE8" />
          <stop offset="35%" stopColor="#F1F5A8" />
          <stop offset="72%" stopColor="#CFDC6C" />
          <stop offset="100%" stopColor="#9CB84B" />
        </radialGradient>
        <radialGradient id={`${id}-warm`} cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#F2B35B" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#F2B35B" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-leafL`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C2F07A" />
          <stop offset="55%" stopColor="#7CCB4F" />
          <stop offset="100%" stopColor="#3C9238" />
        </linearGradient>
        <linearGradient id={`${id}-leafR`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D2F58A" />
          <stop offset="55%" stopColor="#88D257" />
          <stop offset="100%" stopColor="#47A03F" />
        </linearGradient>
        <radialGradient id={`${id}-soil`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#8A6240" />
          <stop offset="100%" stopColor="#3E2A1B" />
        </radialGradient>
      </defs>

      {/* soil with a few pebbles and grass tufts — or the pot Sprouty sits in */}
      {outfit?.pot ? (
        <>
          {/* the pot sits on a patch of soil with a little grass, so it never floats */}
          <ellipse cx="120" cy="234" rx="104" ry="15" fill={`url(#${id}-soil)`} />
          <ellipse cx="120" cy="232" rx="70" ry="7" fill="#2B1C12" opacity={0.35} />
          <ellipse cx="36" cy="236" rx="5" ry="3" fill="#B9A58C" />
          <ellipse cx="206" cy="237" rx="4.5" ry="2.6" fill="#C9B79E" />
          <motion.g style={{ transformOrigin: '30px 232px' }} animate={breeze} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M24 234 C22 226 24 220 28 215 M30 234 C30 225 33 220 38 216" stroke="#5DAA43" strokeWidth={3} strokeLinecap="round" fill="none" />
          </motion.g>
          <motion.g style={{ transformOrigin: '210px 232px' }} animate={breeze} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
            <path d="M204 234 C202 227 204 221 208 217 M210 234 C211 226 214 221 219 218" stroke="#6FB64E" strokeWidth={3} strokeLinecap="round" fill="none" />
          </motion.g>
          <PotBack id={outfit.pot} />
        </>
      ) : (
      <>
      <ellipse cx="120" cy="214" rx="114" ry="25" fill={`url(#${id}-soil)`} />
      <ellipse cx="120" cy="206" rx="66" ry="10" fill="#2B1C12" opacity={0.35} />
      <ellipse cx="40" cy="220" rx="6" ry="3.5" fill="#B9A58C" />
      <ellipse cx="196" cy="222" rx="5" ry="3" fill="#C9B79E" />
      <ellipse cx="168" cy="230" rx="3.5" ry="2" fill="#A8947A" />
      <motion.g style={{ transformOrigin: '30px 212px' }} animate={breeze} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M24 214 C22 204 24 198 28 192 M30 214 C30 204 33 198 38 194 M36 214 C37 207 40 203 44 201" stroke="#5DAA43" strokeWidth={3} strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g style={{ transformOrigin: '208px 212px' }} animate={breeze} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
        <path d="M202 214 C200 206 202 200 206 196 M208 214 C209 205 212 200 217 197" stroke="#6FB64E" strokeWidth={3} strokeLinecap="round" fill="none" />
      </motion.g>
      </>
      )}

      {/* Whole seed tilts toward where Sprouty looks and hops on tap; it pivots at the soil. */}
      <motion.g style={{ transformOrigin: '120px 206px' }} animate={{ rotate: lx * 9 }} transition={SPRING}>
        <motion.g
          key={hop}
          style={{ transformOrigin: '120px 206px' }}
          initial={hop ? { y: 0, scaleY: 1, scaleX: 1 } : false}
          animate={
            hop
              ? {
                  // squash down, spring up tall, land squashed, wobble back
                  y: [0, 4, -22, 0, -6, 0],
                  scaleY: [1, 0.86, 1.1, 0.88, 1.04, 1],
                  scaleX: [1, 1.1, 0.92, 1.1, 0.98, 1],
                }
              : undefined
          }
          transition={{ duration: 0.75, ease: 'easeOut', times: [0, 0.15, 0.4, 0.62, 0.8, 1] }}
        >
          {/* shy: squirm side to side and squish a little, pivoting at the soil */}
          <motion.g
            style={{ transformOrigin: '120px 206px' }}
            animate={mood === 'shy' && !still ? { rotate: [0, -6, 5, -4, 3, 0], scaleY: [1, 0.95, 1, 0.96, 1] } : { rotate: 0, scaleY: 1 }}
            transition={mood === 'shy' ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          >
          {!hatOn && leaves}

          {/* seed body breathes slowly */}
          <motion.g style={{ transformOrigin: '120px 206px' }} animate={breathe} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}>
            <SproutyCosmetics outfit={outfit} part="back" />
            <path d="M120 88 C164 88 186 128 184 160 C182 192 154 208 120 208 C86 208 58 192 56 160 C54 128 76 88 120 88Z" fill={`url(#${id}-body)`} />
            <path d="M120 88 C164 88 186 128 184 160 C182 192 154 208 120 208 C86 208 58 192 56 160 C54 128 76 88 120 88Z" fill={`url(#${id}-warm)`} />
            <path d="M172 134 C182 150 182 172 172 188" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" fill="none" />
            <ellipse cx="92" cy="118" rx="20" ry="12" fill="#FFFFFF" opacity={0.6} transform="rotate(-30 92 118)" />
            <circle cx="108" cy="104" r="4" fill="#FFFFFF" opacity={0.7} />

            {/* face slides toward the look direction */}
            <motion.g animate={{ x: lx * 9, y: ly * 6 }} transition={SPRING}>
              <Face mood={mood} blinking={blinking} lx={lx} ly={ly} />
              <SproutyCosmetics outfit={outfit} part="face" />
            </motion.g>
            <SproutyCosmetics outfit={outfit} part="body" />
            {!(outfit?.hat && HAT_OVER_LEAVES.has(outfit.hat)) && <SproutyCosmetics outfit={outfit} part="hat" />}
          </motion.g>
          {outfit?.hat && HAT_OVER_LEAVES.has(outfit.hat) && <SproutyCosmetics outfit={outfit} part="hat" />}
          {/* with a hat on, the sprout grows up through it (leaves drawn on top of the hat) */}
          {hatOn && leaves}

          </motion.g>

          {mood === 'sleepy' && (
            <g fill={INK} opacity={0.55} fontFamily="sans-serif" fontWeight={700}>
              <text x="176" y="112" fontSize="18">z</text>
              <text x="190" y="94" fontSize="13">z</text>
            </g>
          )}
          {mood === 'cheer' && (
            <g fill="#FBBF24">
              <path d="M44 118 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4Z" />
              <path d="M196 132 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3Z" />
            </g>
          )}
          {mood === 'shy' && (
            <g fill="#F472B6">
              {[
                { x: 46, y: 120, s: 1, d: 0 },
                { x: 192, y: 110, s: 0.8, d: 0.5 },
                { x: 200, y: 150, s: 0.6, d: 1 },
              ].map((h) => (
                <motion.path
                  key={h.x}
                  d="M0 6 C-10 -2 -6 -10 0 -5 C6 -10 10 -2 0 6 Z"
                  initial={{ x: h.x, y: h.y, scale: 0, opacity: 0 }}
                  animate={still ? { x: h.x, y: h.y, scale: h.s, opacity: 1 } : { x: h.x, y: [h.y, h.y - 26], scale: [0, h.s * 1.3, h.s], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.6, delay: h.d, repeat: still ? 0 : Infinity, ease: 'easeOut' }}
                />
              ))}
            </g>
          )}
          {mood === 'worried' && <path d="M176 120 q6 10 0 14 q-6 -4 0 -14Z" fill="#7DD3FC" />}
          {mood === 'thinking' && (
            // a thought bubble of three dots popping in turn
            <g fill="#FFFFFF" stroke="#CFE7DA" strokeWidth={1.5}>
              {[
                [170, 112, 4],
                [184, 98, 6],
                [202, 80, 9],
              ].map(([x, y, r], i) => (
                <motion.circle
                  key={x}
                  cx={x}
                  cy={y}
                  r={r}
                  animate={still ? undefined : { opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              ))}
            </g>
          )}
          {mood === 'pleading' && (
            // a tear welling up and rolling down the cheek
            <motion.path
              d="M0 -6 q4 6 0 9 q-4 -3 0 -9Z"
              fill="#7DD3FC"
              stroke="#38BDF8"
              strokeWidth={0.8}
              initial={{ x: 86, y: 164, opacity: 0 }}
              animate={still ? { x: 86, y: 168, opacity: 1 } : { x: [86, 86, 84], y: [162, 166, 190], opacity: [0, 1, 0], scale: [0.6, 1, 1] }}
              transition={{ duration: 2.4, repeat: still ? 0 : Infinity, repeatDelay: 1.2, times: [0, 0.35, 1] }}
            />
          )}
          {mood === 'angry' && (
            // little steam puffs and an anime anger mark
            <motion.g
              animate={still ? undefined : { y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <circle cx="52" cy="108" r="9" fill="#FFFFFF" opacity={0.85} />
              <circle cx="40" cy="96" r="6" fill="#FFFFFF" opacity={0.7} />
              <circle cx="188" cy="108" r="9" fill="#FFFFFF" opacity={0.85} />
              <circle cx="200" cy="96" r="6" fill="#FFFFFF" opacity={0.7} />
              <path d="M160 112 l6 6 M172 112 l-6 6 M160 124 l6 -6 M172 124 l-6 -6" stroke="#E5484D" strokeWidth={3.5} strokeLinecap="round" />
            </motion.g>
          )}
        </motion.g>
      </motion.g>
      {outfit?.pot && <PotFront id={outfit.pot} />}
    </svg>
  );
}
